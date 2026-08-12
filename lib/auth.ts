import { createSupabaseBrowser } from './supabase-browser';

export const supabase = createSupabaseBrowser();
export const isSupabaseConfigured = Boolean(supabase);

export async function signInWithGoogle() {
  if (!supabase) return { error: new Error('Supabase is not configured') };
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
}
