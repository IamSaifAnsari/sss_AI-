import { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
];

export default function PlaygroundPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [hasProviders, setHasProviders] = useState({ openai: false, anthropic: false });
  const chatRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!active?.id) return;
    api.listProviders(active.id).then((rows) => {
      setHasProviders({
        openai: rows.some((r) => r.provider === 'openai'),
        anthropic: rows.some((r) => r.provider === 'anthropic'),
      });
    }).catch(() => { /* noop */ });
  }, [active?.id]);

  const curModel = MODELS.find((m) => m.id === selectedModel);
  const needsProvider = curModel?.provider === 'OpenAI' ? 'openai' : 'anthropic';
  const providerReady = hasProviders[needsProvider];

  const send = async () => {
    if (!input.trim() || streaming) return;
    if (!providerReady) {
      toast.error(`Add a ${needsProvider} API key in Settings → Provider Keys`);
      return;
    }
    const userText = input.trim();
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    let assistantText = '';
    setMessages((p) => [...p, { role: 'assistant', content: '' }]);

    try {
      await api.streamChat(active.id, {
        model: selectedModel,
        systemPrompt,
        temperature,
        maxTokens,
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      }, {
        onEvent: ({ event, data }) => {
          if (event === 'delta' && data?.text) {
            assistantText += data.text;
            setMessages((p) => {
              const n = [...p];
              n[n.length - 1] = { ...n[n.length - 1], content: assistantText };
              return n;
            });
          } else if (event === 'done') {
            setMessages((p) => {
              const n = [...p];
              n[n.length - 1] = { ...n[n.length - 1], tokens_in: data.tokens_in, tokens_out: data.tokens_out, latency: data.duration_ms };
              return n;
            });
          } else if (event === 'error') {
            toast.error(data.error || 'Stream error');
          }
        },
      });
    } catch (e) {
      toast.error(e.message || 'Request failed');
      setMessages((p) => p.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const renderContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const lang = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={i} style={{ margin: '10px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '6px 12px', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
              <span>{lang || 'code'}</span>
              <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => navigator.clipboard.writeText(code)}>
                <Icons.copy size={11} /> Copy
              </button>
            </div>
            <pre style={{ padding: 12, background: 'var(--bg-1)', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-1)', overflowX: 'auto', margin: 0, lineHeight: 1.6 }}>{code}</pre>
          </div>
        );
      }
      return part.split('\n').map((line, j) => {
        if (line.startsWith('## ')) return <h3 key={`${i}-${j}`} style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-0)', margin: '12px 0 6px' }}>{line.slice(3)}</h3>;
        if (line.startsWith('- ')) return <div key={`${i}-${j}`} style={{ paddingLeft: 16, margin: '2px 0' }}>• {line.slice(2)}</div>;
        if (line.trim() === '') return <div key={`${i}-${j}`} style={{ height: 8 }}></div>;
        return <div key={`${i}-${j}`} style={{ margin: '2px 0' }}>{line}</div>;
      });
    });
  };

  if (!active) return null;

  return (
    <div className="page-scroll" style={{ padding: 0, display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 180 }}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <span className="badge badge-cyan">{curModel?.provider}</span>
          {!providerReady && <span className="badge badge-yellow" style={{ fontSize: 10 }}>No {needsProvider} key</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(!showSettings)}><Icons.settings size={13} /> Settings</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMessages([])}><Icons.trash size={13} /> Clear</button>
          </div>
        </div>

        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {messages.length === 0 && (
            <div style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: 40 }}>
              {providerReady ? 'Type a message to start chatting with the real LLM.' : `Add a ${needsProvider} API key in Settings → Provider Keys to start chatting.`}
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20, maxWidth: 720 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                background: msg.role === 'user' ? 'var(--accent2-dim)' : 'var(--accent-dim)',
                color: msg.role === 'user' ? 'var(--accent2)' : 'var(--accent)',
                marginTop: 2,
              }}>{msg.role === 'user' ? 'U' : 'AI'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-0)' }}>{msg.role === 'user' ? 'You' : curModel?.name}</span>
                  {msg.latency > 0 && <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{msg.latency}ms</span>}
                  {msg.tokens_in > 0 && <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>in:{msg.tokens_in} out:{msg.tokens_out}</span>}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-1)' }}>
                  {renderContent(msg.content)}
                  {streaming && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>thinking…</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={providerReady ? 'Send a message...' : `Add ${needsProvider} key first`}
              rows={2}
              style={{ flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '10px 14px', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.5 }}
            />
            <button className="btn btn-accent" onClick={send} disabled={streaming || !input.trim() || !providerReady}
              style={{ height: 40, width: 40, padding: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (input.trim() && providerReady) ? 1 : 0.5 }}>
              <Icons.arrowUp size={18} />
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
            Enter to send · Shift+Enter newline · {providerReady ? 'Real-time streaming via your API key' : 'Provider key required'}
          </div>
        </div>
      </div>

      {showSettings && (
        <div style={{ width: 280, borderLeft: '1px solid var(--border)', background: 'var(--bg-1)', padding: 20, overflowY: 'auto', flexShrink: 0 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 16 }}>Parameters</h3>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>Temperature</span><span className="mono" style={{ color: 'var(--accent)' }}>{temperature}</span>
            </label>
            <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>Max Tokens</span><span className="mono" style={{ color: 'var(--accent)' }}>{maxTokens}</span>
            </label>
            <input type="range" min="256" max="8192" step="256" value={maxTokens} onChange={(e) => setMaxTokens(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>System Prompt</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4}
              style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 12, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 12 }}>Provider</h3>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>This model needs <strong style={{ color: 'var(--text-1)' }}>{needsProvider}</strong></div>
            <div className={`badge badge-${providerReady ? 'green' : 'yellow'}`}>{providerReady ? 'Configured' : 'Not configured'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
