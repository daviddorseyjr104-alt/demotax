'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const nav: NavItem[] = [
  {
    label: 'CEO Dashboard',
    href: '/',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    label: 'AI Deal Review',
    href: '/ai-deal-review',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  },
  {
    label: 'Excel Import',
    href: '/excel-import',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    label: 'Executive Briefs',
    href: '/executive-briefs',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    label: 'PowerPoint Builder',
    href: '/powerpoint-builder',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
  {
    label: 'Marketing Studio',
    href: '/marketing-studio',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  },
  {
    label: 'Referral Pipeline',
    href: '/referral-pipeline',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: 'Meeting Notes',
    href: '/meeting-notes',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    label: 'Client Intake',
    href: '/client-intake',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>,
  },
  {
    label: 'Workflow Audit',
    href: '/workflow-audit',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  {
    label: '90-Day Roadmap',
    href: '/automation-roadmap',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '210px', minWidth: '210px',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1.125rem 1.125rem', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--gold), #8a5a1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0f1c" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em', lineHeight: 1.1 }}>Tax Strategy</div>
            <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Operations Hub</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0.875rem 0.625rem', flex: 1 }}>
        <div style={{ fontSize: '0.575rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 0.375rem', marginBottom: '0.5rem' }}>
          Platform
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {nav.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link${isActive ? ' active' : ''}`}>
                <span style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '0.78rem' }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.875rem 1.125rem', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{
          fontSize: '0.6rem', fontWeight: 600, color: 'var(--gold)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
          borderRadius: '4px', padding: '0.25rem 0.5rem', marginBottom: '0.5rem',
          display: 'inline-block',
        }}>Demo Environment</div>
        <div style={{ fontSize: '0.6125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          Internal review only. Not tax or legal advice.
        </div>
      </div>
    </aside>
  );
}
