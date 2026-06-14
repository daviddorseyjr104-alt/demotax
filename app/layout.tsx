import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import ConditionalLayout from '@/components/ConditionalLayout';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Tax Strategy Operations Hub',
  description: 'AI-powered transaction workflow, proposal generation, and referral partner automation for high-value business and real estate exits.',
};

async function getUser(): Promise<string | undefined> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url') {
      return undefined;
    }
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email ?? undefined;
  } catch {
    return undefined;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const email = await getUser();

  return (
    <html lang="en" className={geist.variable}>
      <body style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <ConditionalLayout email={email}>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
