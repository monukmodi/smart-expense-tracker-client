import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((payload) => {
    const id = idRef.current++;
    const toast = { id, ...payload };
    setToasts((t) => [...t, toast]);
    const ttl = payload.ttl ?? 3500;
    if (ttl > 0) setTimeout(() => remove(id), ttl);
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    show: (message, opts = {}) => push({ type: 'info', message, ...opts }),
    success: (message, opts = {}) => push({ type: 'success', message, ...opts }),
    error: (message, opts = {}) => push({ type: 'error', message, ...opts }),
    warn: (message, opts = {}) => push({ type: 'warn', message, ...opts }),
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastViewport({ toasts, onClose }) {
  const colorFor = (type) => ({
    success: '#34d399',
    error: '#fb7185',
    warn: '#fbbf24',
    info: '#60a5fa',
  })[type] || '#60a5fa';

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, display: 'grid', gap: 10, zIndex: 1000 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          minWidth: 260,
          maxWidth: 380,
          background: 'rgba(17,24,39,0.95)',
          border: `1px solid ${colorFor(t.type)}55`,
          borderLeft: `4px solid ${colorFor(t.type)}`,
          borderRadius: 10,
          color: '#e5e7eb',
          padding: '10px 12px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ fontSize: 14 }}>{t.message}</div>
            <button onClick={() => onClose(t.id)} style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: 16,
            }} aria-label="Close">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}
