import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', withCredentials: true, headers: { 'Content-Type': 'application/json' } });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    if (!config.headers) config.headers = {} as any;
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use((res) => res, (err) => {
  // normalize server errors so UI can show a friendly message
  const payload = err?.response?.data;
  const message = payload?.message || payload?.error || err.message || 'Server error';
  return Promise.reject(Object.assign(err, { userMessage: message }));
});

export async function signin(email: string, password: string, deviceName?: string) {
  const res = await API.post('/auth/signin', { email, password, deviceName });
  return res.data;
}

export async function signup(email: string, password: string, displayName: string, deviceName?: string) {
  const res = await API.post('/auth/signup', { email, password, displayName, deviceName });
  return res.data;
}

export async function refresh() {
  // Try to use cookie-based refresh first; if the cookie isn't present (dev/test flows),
  // include the stored refresh token in the request body so server can validate it.
  const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;
  try {
    // First call without body - server should use httpOnly cookie if present
    const res = await API.post('/auth/refresh');
    return res.data;
  } catch (err) {
    // If cookie-based refresh fails and we have a stored token for dev, try that
    if (stored) {
      const res = await API.post('/auth/refresh', { refreshToken: stored });
      return res.data;
    }
    throw err;
  }
}

export async function listSessions(userId: string) {
  const res = await API.get(`/auth/sessions/${userId}`);
  return res.data;
}

export async function revokeSession(userId: string, jti: string) {
  const res = await API.post('/auth/revoke-session', { userId, jti });
  return res.data;
}

export function setAccessToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function clearAccessToken() {
  localStorage.removeItem('access_token');
}

export default API;
