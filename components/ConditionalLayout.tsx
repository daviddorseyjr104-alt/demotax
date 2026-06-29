'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import { ToastContainer } from './Toast';
import QuickSwitcher from './QuickSwitcher';

export default function ConditionalLayout({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return <>{children}</>;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <Sidebar />
      <div className="app-content">
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {today}
            </span>
          </div>
          <div className="app-header-actions">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-quick-switcher'))}
              title="Jump to a client's folder (Ctrl+K)"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '7px', padding: '0.35rem 0.7rem', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.75rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <span>Jump to folder</span>
              <kbd style={{ fontSize: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.05rem 0.3rem' }}>Ctrl K</kbd>
            </button>
            <span className="app-header-advice">Not financial or tax advice</span>
            <UserMenu email={email} />
          </div>
        </header>
        <main className="app-main">
          {children}
        </main>
      </div>
      <QuickSwitcher />
      <ToastContainer />
    </>
  );
}
