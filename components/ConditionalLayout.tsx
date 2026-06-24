'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import { ToastContainer } from './Toast';

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
            <span className="app-header-advice">Not financial or tax advice</span>
            <UserMenu email={email} />
          </div>
        </header>
        <main className="app-main">
          {children}
        </main>
      </div>
      <ToastContainer />
    </>
  );
}
