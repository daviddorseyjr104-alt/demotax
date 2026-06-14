'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UserMenu({ email }: { email?: string }) {
  const router = useRouter();

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
    router.refresh();
  };

  const initials = email ? email.charAt(0).toUpperCase() : 'R';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
      {email && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </span>
      )}
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #1e3a5f, #2d5f8a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)',
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <button
        onClick={signOut}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '0.375rem',
          padding: '0.25rem 0.625rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
