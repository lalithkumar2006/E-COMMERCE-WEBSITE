import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                : 'bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
