'use client';

import { useState, useEffect } from 'react';

type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'info' };

let _id = 0;

export function toast(message: string, type: ToastItem['type'] = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('tsos-toast', { detail: { message, type } }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: ToastItem['type'] }>).detail;
      const id = ++_id;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
    };
    window.addEventListener('tsos-toast', handler);
    return () => window.removeEventListener('tsos-toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  const colorMap = {
    success: { border: 'rgba(34,197,94,0.35)', icon: 'var(--success)' },
    error:   { border: 'rgba(239,68,68,0.35)',  icon: 'var(--red)' },
    info:    { border: 'rgba(59,130,246,0.35)', icon: 'var(--blue)' },
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none' }}>
      {toasts.map((t) => {
        const c = colorMap[t.type];
        return (
          <div key={t.id} className="toast-slide-in" style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.75rem 1rem', borderRadius: '0.625rem',
            backgroundColor: 'var(--bg-card)', border: `1px solid ${c.border}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500,
            minWidth: '220px', maxWidth: '360px', pointerEvents: 'auto',
          }}>
            {t.type === 'success' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {t.type === 'error' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
            {t.type === 'info' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
