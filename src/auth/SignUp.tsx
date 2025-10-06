import React, { useState } from 'react';
import { signup, setAccessToken } from './authService';
import { useAuth } from './AuthProvider';
import styles from './AuthCards.module.css';
import { useToast } from '../ui/Toast';

export const SignUp: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const validate = () => {
    setError(null);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    // displayName is optional; if blank we use email in submission
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await signup(email, password, displayName || email, deviceName || undefined);
      if (res && (res as any).access_token) {
  setAccessToken((res as any).access_token);
  // assume server returns userId/displayName where available; fallback to email
  login((res as any).access_token, { email, displayName: displayName || email, userId: (res as any).userId });
  try { toast?.push?.('Account created', 'success'); onSuccess && onSuccess(); } catch {}
      } else {
        setError('Unexpected server response');
        console.warn('signup unexpected response', res);
      }
    } catch (err: any) {
      // show server-provided message when available
      const msg = err?.response?.data?.message || err?.message || 'Signup failed';
      setError(msg);
      console.error('signup error', err?.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <input className={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="display name (optional)" autoComplete="name" />
      <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="email" />
      <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" autoComplete="new-password" />
      <input className={styles.input} value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="device name (optional)" autoComplete="off" />
      {error && <div style={{ color: '#e11d48', fontSize: 13 }}>{error}</div>}
      <button className={styles.primary} type="submit" disabled={loading}>{loading ? 'Creating…' : 'Sign up'}</button>
    </form>
  );
};
