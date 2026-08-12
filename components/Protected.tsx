'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
export default function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  if (loading || !user) return <div className="loading">Loading Lumina…</div>;
  return <>{children}</>;
}
