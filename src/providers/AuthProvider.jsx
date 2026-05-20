import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshMe = async () => {
    try {
      const { user: u } = await api.me();
      setUser(u);
      return u;
    } catch (e) {
      setUser(null);
      if (e.status && e.status !== 401) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshMe(); }, []);

  const signIn = async (email, password) => {
    const { user: u } = await api.login(email, password);
    setUser(u);
    return u;
  };

  const signUp = async (email, password, workspaceName) => {
    const { user: u } = await api.signup(email, password, workspaceName);
    setUser(u);
    return u;
  };

  const signOut = async () => {
    try { await api.logout(); } catch { /* noop */ }
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.changePassword(currentPassword, newPassword);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, error, signIn, signUp, signOut, changePassword, refreshMe }}>
      {children}
    </AuthCtx.Provider>
  );
}
