'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/auth';
import { localProfile } from '@/lib/storage';
import type { UserProfile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  localMode: boolean;
  updateProfile: (patch: Partial<Pick<UserProfile, 'name' | 'currency'>>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function profileFromAuthUser(u: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): UserProfile | null {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? '',
    name: String(u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split('@')[0] ?? 'You'),
    currency: String(u.user_metadata?.currency ?? 'INR'),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const localMode = !supabase;

  useEffect(() => {
    let mounted = true;

    async function loadCloudProfile(authUser: User) {
      if (!supabase) return;
      const fallback = profileFromAuthUser(authUser)!;
      const { data } = await supabase.from('profiles').select('id,name,currency').eq('id', authUser.id).maybeSingle();
      if (!mounted) return;
      setUser({
        ...fallback,
        name: data?.name || fallback.name,
        currency: data?.currency || fallback.currency,
      });
    }

    if (!supabase) {
      const email = localStorage.getItem('lumina_local_email');
      const storedName = localStorage.getItem('lumina_local_name') || undefined;
      if (mounted && email) setUser(localProfile(email, storedName));
      if (mounted) setLoading(false);
      return () => { mounted = false; };
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      if (data.user) await loadCloudProfile(data.user);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const next = profileFromAuthUser(session?.user ?? null);
      setUser(next);
      if (!next) setLoading(false);
      else {
        // Fetch the profile outside the auth callback to avoid auth-lock contention.
        window.setTimeout(() => {
          if (mounted && session?.user) void loadCloudProfile(session.user);
        }, 0);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    localMode,
    updateProfile: async (patch) => {
      if (!user) return;
      const next = { ...user, ...patch };
      setUser(next);
      if (localMode) {
        localStorage.setItem('lumina_local_name', next.name);
        localStorage.setItem('lumina_local_currency', next.currency);
        localStorage.setItem('lumina_local_email', next.email);
        return;
      }
      const { error } = await supabase!.from('profiles').upsert({ id: user.id, name: next.name, currency: next.currency }, { onConflict: 'id' });
      if (error) throw error;
      await supabase!.auth.updateUser({ data: { full_name: next.name, currency: next.currency } });
    },
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
      localStorage.removeItem('lumina_local_email');
      localStorage.removeItem('lumina_local_name');
      localStorage.removeItem('lumina_local_currency');
      setUser(null);
    },
  }), [user, loading, localMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
