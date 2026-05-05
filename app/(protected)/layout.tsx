import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import dynamic from 'next/dynamic';

const ProtectedLayoutClient = dynamic(
  () => import('@/components/protected-layout-client').then(mod => mod.ProtectedLayoutClient),
  { ssr: false, loading: () => <div className="min-h-screen bg-warm-50" /> }
);

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}