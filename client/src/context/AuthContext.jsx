import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
const storageKey = 'smart-library-auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : { token: '', user: null };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(auth));
  }, [auth]);

  const login = async (payload, isRegister = false) => {
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const { data } = await api.post(endpoint, payload);
    setAuth({ token: data.token, user: data.user });
    return data;
  };

  const logout = () => setAuth({ token: '', user: null });

  const refreshProfile = async () => {
    if (!auth.token) return null;
    const { data } = await api.get('/auth/me');
    setAuth((current) => ({ ...current, user: data.user }));
    return data.user;
  };

  const value = useMemo(
    () => ({ ...auth, login, logout, refreshProfile, isAuthenticated: Boolean(auth.token) }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
