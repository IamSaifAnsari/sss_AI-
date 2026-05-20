import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
import { api } from '../lib/api.js';
import { setActiveWorkspaceForClient } from '../lib/apiClient.js';

const WorkspaceCtx = createContext(null);
export const useWorkspace = () => useContext(WorkspaceCtx);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth() || {};
  const [workspaces, setWorkspaces] = useState([]);
  const [activeId, setActiveIdState] = useState(null);
  const [loading, setLoading] = useState(false);

  const setActiveId = async (id) => {
    setActiveIdState(id);
    setActiveWorkspaceForClient(id);
    if (id) {
      try { await api.setActiveWorkspaceId(id); } catch (e) { console.warn('setActiveWorkspaceId failed', e); }
    }
  };

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ workspaces: list }, { active_workspace_id }] = await Promise.all([
        api.listWorkspaces(), api.getActiveWorkspaceId(),
      ]);
      setWorkspaces(list || []);
      let chosen = active_workspace_id;
      if (!chosen && list?.length) chosen = list[0].id;
      setActiveIdState(chosen || null);
      setActiveWorkspaceForClient(chosen || null);
    } catch (e) {
      console.warn('workspace refresh failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id]);

  const active = workspaces.find((w) => w.id === activeId) || null;

  const createWorkspace = async (name, plan = 'free') => {
    const { id } = await api.createWorkspace(name, plan);
    await refresh();
    await setActiveId(id);
    return id;
  };

  return (
    <WorkspaceCtx.Provider value={{ workspaces, active, activeId, setActiveId, loading, refresh, createWorkspace }}>
      {children}
    </WorkspaceCtx.Provider>
  );
}
