import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' };

const ToastContext = createContext<any>(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, type: Toast['type'] = 'info', ttl = 3500) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-root" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type || 'info'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
