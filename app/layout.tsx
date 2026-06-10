import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Tax Strategy Operations Hub',
  description: 'AI-powered transaction workflow, proposal generation, and referral partner automation for high-value business and real estate exits.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Top header bar */}
          <header style={{
            height: '52px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            backgroundColor: 'var(--bg-primary)',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'var(--gold-bg)',
                border: '1px solid var(--gold-border)',
                padding: '0.2rem 0.625rem',
                borderRadius: '999px',
              }}>
                Demo Environment
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not financial or tax advice</span>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a5f, #2d5f8a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)',
              }}>
                TS
              </div>
            </div>
          </header>
          <main style={{ flex: 1, padding: '2rem' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
