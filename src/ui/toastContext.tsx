/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

type ToastPush = (message: string, type?: 'info' | 'success' | 'error', ttl?: number) => void;

const ToastContext = createContext<{ push: ToastPush } | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
