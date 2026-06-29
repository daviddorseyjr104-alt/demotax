'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadClientDirectory,
  resolveClientFolderUrl,
  type ClientLite,
} from '@/lib/clientDirectory';

/* ------------------------------------------------------------------ *
 *  QUICK SWITCHER  (Ctrl/Cmd+K)
 *
 *  Reg's "get into a folder fast" tool. Press Ctrl+K anywhere, type a
 *  few letters of a client's name, press Enter — their OneDrive folder
 *  opens in a new tab. One gesture, from any page.
 *
 *  Opened by Ctrl/Cmd+K or by dispatching window event
 *  'open-quick-switcher' (the header search button does this).
 * ------------------------------------------------------------------ */

type OpenState = { id: string; status: 'opening' | 'no_match' | 'not_connected' | 'error' } | null;

export default function QuickSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState<ClientLite[] | null>(null);
  const [source, setSource] = useState<'live' | 'sample'>('sample');
  const [active, setActive] = useState(0);
  const [opening, setOpening] = useState<OpenState>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open/close wiring: Ctrl/Cmd+K toggles; Esc closes; custom event opens.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    function onOpenEvent() { setOpen(true); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-quick-switcher', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-quick-switcher', onOpenEvent);
    };
  }, []);

  // Lazy-load the client directory the first time the switcher opens.
  useEffect(() => {
    if (!open || clients) return;
    const ctrl = new AbortController();
    loadClientDirectory(ctrl.signal).then(({ clients, source }) => {
      setClients(clients);
      setSource(source);
    });
    return () => ctrl.abort();
  }, [open, clients]);

  // Reset transient UI on the open→ transition. Adjusting state during render
  // (not in an effect) is React's recommended pattern for "reset on prop change"
  // and avoids the set-state-in-effect cascade. https://react.dev/learn/you-might-not-need-an-effect
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setQuery('');
    setActive(0);
    setOpening(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  // Focus the input after it mounts (DOM sync — legitimately an effect).
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const results = useMemo(() => {
    const list = clients ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => `${c.name} ${c.company}`.toLowerCase().includes(q));
  }, [clients, query]);

  const openFolder = useCallback(
    (client: ClientLite) => {
      // Open a blank tab synchronously (within the key/click gesture) so the
      // async folder lookup doesn't trip the popup blocker.
      const win = window.open('', '_blank');
      setOpening({ id: client.id, status: 'opening' });
      resolveClientFolderUrl(client).then(({ url, status }) => {
        if (url && win) {
          win.location.href = url;
          setOpen(false);
        } else {
          win?.close();
          setOpening({ id: client.id, status: status === 'ok' ? 'no_match' : status });
        }
      });
    },
    [],
  );

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const client = results[active];
      if (client) openFolder(client);
    }
  }

  if (!open) return null;

  const activeError = opening && opening.status !== 'opening' ? opening : null;

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10, 15, 28, 0.45)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        style={{
          width: 'min(560px, 92vw)', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: '12px',
          boxShadow: '0 24px 60px rgba(10,15,28,0.35)', overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onListKey}
            placeholder="Jump to a client's folder…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.95rem', color: 'var(--text-primary)',
            }}
          />
          <kbd style={{ fontSize: '0.6rem', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.1rem 0.35rem' }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '46vh', overflowY: 'auto', padding: '0.4rem' }}>
          {clients === null && (
            <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading clients…</div>
          )}
          {clients !== null && results.length === 0 && (
            <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No clients match “{query}”.</div>
          )}
          {results.map((c, i) => {
            const isActive = i === active;
            const rowOpening = opening?.id === c.id && opening.status === 'opening';
            return (
              <button
                key={c.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => openFolder(c)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  background: isActive ? 'var(--gold-bg)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--gold-border)' : 'transparent'}`,
                  borderRadius: '8px', padding: '0.55rem 0.7rem', marginBottom: '0.15rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company}</span>
                </span>
                {rowOpening
                  ? <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Opening…</span>
                  : isActive && <span style={{ fontSize: '0.62rem', color: 'var(--gold)', fontWeight: 700 }}>Open folder ↵</span>}
              </button>
            );
          })}
        </div>

        {/* Footer: error state + hints */}
        {activeError && (
          <div style={{
            padding: '0.6rem 1rem', borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.72rem', color: '#9a3412', background: '#fff7ed',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          }}>
            <span>
              {activeError.status === 'not_connected' && 'Microsoft 365 isn’t connected yet.'}
              {activeError.status === 'no_match' && 'No matching OneDrive folder for that client.'}
              {activeError.status === 'error' && 'Couldn’t reach OneDrive. Try again.'}
            </span>
            {activeError.status === 'not_connected'
              ? <a href="/api/auth/microsoft" className="btn-gold" style={{ padding: '0.3rem 0.6rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Connect</a>
              : <button onClick={() => { setOpen(false); router.push('/clients'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a3412', fontWeight: 700, fontSize: '0.7rem', textDecoration: 'underline', whiteSpace: 'nowrap' }}>Open in Client Hub</button>}
          </div>
        )}
        <div style={{
          padding: '0.5rem 1rem', borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.62rem', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>↑↓ to move · ↵ to open folder</span>
          <span>{source === 'sample' ? 'Sample clients' : 'Live · HubSpot'}</span>
        </div>
      </div>
    </div>
  );
}
