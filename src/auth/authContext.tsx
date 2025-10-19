/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

type AuthShape = {
  user: any;
  login: (token: string, userInfo?: any) => void;
  logout: () => Promise<void>;
  registerPostAuth: (cb: () => void) => void;
};

const AuthContext = createContext<AuthShape | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
