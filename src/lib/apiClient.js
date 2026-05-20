const BASE = '/api';

let activeWorkspaceId = null;
export const setActiveWorkspaceForClient = (id) => { activeWorkspaceId = id || null; };

async function request(method, path, { body, query, workspace, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const wsId = workspace || activeWorkspaceId;
  if (wsId) headers['X-Workspace-Id'] = wsId;

  let url = BASE + path;
  if (query) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v != null) q.append(k, v);
    if ([...q].length) url += `?${q.toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  let json = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { json = await res.json(); } catch { /* noop */ }
  }
  if (!res.ok) {
    const err = new Error(json?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export const apiClient = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};

// Stream POST helper for SSE endpoints. Calls back per event.
export async function streamSSE(path, body, { workspace, onEvent, signal } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'text/event-stream' };
  const wsId = workspace || activeWorkspaceId;
  if (wsId) headers['X-Workspace-Id'] = wsId;
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body || {}),
    signal,
  });
  if (!res.ok || !res.body) {
    let detail = '';
    try { detail = (await res.json())?.error || ''; } catch { /* noop */ }
    throw new Error(detail || `Stream failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const chunks = buf.split('\n\n');
    buf = chunks.pop() || '';
    for (const raw of chunks) {
      const lines = raw.split('\n');
      let event = 'message';
      let data = '';
      for (const ln of lines) {
        if (ln.startsWith('event: ')) event = ln.slice(7).trim();
        else if (ln.startsWith('data: ')) data += ln.slice(6);
      }
      if (!data) continue;
      let parsed;
      try { parsed = JSON.parse(data); } catch { parsed = data; }
      onEvent?.({ event, data: parsed });
    }
  }
}
