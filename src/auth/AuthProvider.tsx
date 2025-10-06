import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAccessToken, clearAccessToken, refresh } from './authService';

type PostAuthCallback = (() => void) | null;

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [postAuthCallback, setPostAuthCallback] = useState<PostAuthCallback>(null);

  useEffect(() => {
    // try to refresh on load only if we have a refresh token (cookie or sessionStorage)
    const hasStored = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('refresh_token');
    const hasCookie = typeof document !== 'undefined' && document.cookie && document.cookie.indexOf('refresh_token=') !== -1;
    if (!hasStored && !hasCookie) return;

    (async () => {
      try {
        const res = await refresh();
        setAccessToken(res.access_token);
        // server may return richer user info; prefer that
        if (res.user) {
          setUser(res.user);
        } else {
          setUser({ email: res.email || res?.profile?.email, displayName: res.displayName || res?.profile?.name, userId: res.userId });
        }
      } catch (e) {
        // not logged in or refresh failed
        // clear any stored refresh token we may have saved
        try { sessionStorage.removeItem('refresh_token'); } catch {}
      }
    })();
  }, []);

  // login accepts either a simple email string or a richer user object
  const login = useCallback((token: string, userInfo?: string | Record<string, any>) => {
    setAccessToken(token);
    if (!userInfo) {
      setUser(null);
    } else if (typeof userInfo === 'string') {
      setUser({ email: userInfo });
    } else {
      setUser(userInfo);
    }
    // If there's a pending post-auth callback, run it and clear
    try {
      if (postAuthCallback) {
        postAuthCallback();
      }
    } finally {
      setPostAuthCallback(null);
    }
  }, [postAuthCallback]);

  const logout = async () => {
    clearAccessToken();
    // call backend logout to clear refresh cookie
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const registerPostAuth = (cb: () => void) => {
    setPostAuthCallback(() => cb);
  };

  return <AuthContext.Provider value={{ user, login, logout, registerPostAuth }}>{children}</AuthContext.Provider>;
};
