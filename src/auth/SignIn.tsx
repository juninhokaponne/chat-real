import React, { useState } from 'react';

import { useToast } from '../ui/toastContext';

import styles from './AuthCards.module.css';
import { useAuth } from './authContext';
import { signin, setAccessToken } from './authService';


export const SignIn: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // deviceName captured on signup only
  const { login } = useAuth();
  const toast = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await signin(email, password, undefined);
      if (!res || !(res as any).access_token) {
        setError('Invalid server response');
        console.warn('signin unexpected response', res);
        return;
      }
    setAccessToken((res as any).access_token);
  if ((res as any).refresh_token) sessionStorage.setItem('refresh_token', (res as any).refresh_token);
  // pass a richer user object so UI can display name/email
  login((res as any).access_token, { email, displayName: (res as any).displayName || email, userId: (res as any).userId });
  try {
      if (toast) toast.push('Signed in successfully', 'success');
      if (onSuccess) onSuccess();
    } catch (_e) {
      // ignore toast failures
    }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Sign in failed';
      setError(msg);
      console.error('signin error', err?.response || err);
    } finally {
      setLoading(false);
    }
  };

  // Google login is handled by the main AuthCards CTA (popup)

  return (
    <form onSubmit={submit} className={styles.form}>
      <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="email" />
      <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" autoComplete="current-password" />
      {error && <div style={{ color: '#e11d48', fontSize: 13 }}>{error}</div>}
      <div className={styles.actions} style={{ alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <button className={styles.primary} type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </div>
    </form>
  );
};
