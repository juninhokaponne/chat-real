import React, { useState, useEffect, useCallback } from 'react';

import AuthContext from './authContext';
import { setAccessToken, clearAccessToken, refresh } from './authService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [postAuthCallback, setPostAuthCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const hasStored = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('refresh_token');
    const hasCookie = typeof document !== 'undefined' && document.cookie && document.cookie.indexOf('refresh_token=') !== -1;
    if (!hasStored && !hasCookie) return;

    (async () => {
      try {
        const res = await refresh();
        setAccessToken(res.access_token);
        if (res.user) {
          setUser(res.user);
        } else {
          setUser({ email: res.email || res?.profile?.email, displayName: res.displayName || res?.profile?.name, userId: res.userId });
        }
      } catch (_e) {
        try { sessionStorage.removeItem('refresh_token'); } catch (_e2) { /* ignore */ }
      }
    })();
  }, []);

  const login = useCallback((token: string, userInfo?: string | Record<string, any>) => {
    setAccessToken(token);
    if (!userInfo) setUser(null);
    else if (typeof userInfo === 'string') setUser({ email: userInfo });
    else setUser(userInfo);
    try { if (postAuthCallback) postAuthCallback(); } finally { setPostAuthCallback(null); }
  }, [postAuthCallback]);

  const logout = useCallback(async () => {
    clearAccessToken();
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const registerPostAuth = useCallback((cb: () => void) => setPostAuthCallback(() => cb), []);

  return <AuthContext.Provider value={{ user, login, logout, registerPostAuth }}>{children}</AuthContext.Provider>;
};
