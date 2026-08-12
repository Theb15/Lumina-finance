import type { Goal, Transaction, UserProfile } from './types';

const keys = { transactions: 'lumina_transactions', goals: 'lumina_goals', profile: 'lumina_profile', settings: 'lumina_settings' } as const;

function storageKey(key: keyof typeof keys, scope?: string) {
  return scope ? `${keys[key]}_${scope}` : keys[key];
}

export function loadLocal<T>(key: keyof typeof keys, fallback: T, scope?: string): T {
  if (typeof window === 'undefined') return fallback;
  try { const raw = localStorage.getItem(storageKey(key, scope)); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export function saveLocal(key: keyof typeof keys, value: unknown, scope?: string) {
  if (typeof window !== 'undefined') localStorage.setItem(storageKey(key, scope), JSON.stringify(value));
}

export const localProfile = (email: string, name?: string): UserProfile => ({ id: `local-${email.toLowerCase()}`, email: email.toLowerCase(), name: name || email.split('@')[0] || 'You', currency: 'INR' });
export type LocalState = { transactions: Transaction[]; goals: Goal[]; profile: UserProfile };
