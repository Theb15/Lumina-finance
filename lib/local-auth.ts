export type LocalAccount = { email: string; name: string; passwordHash: string };
const KEY = 'lumina_local_accounts';

function getAccounts(): LocalAccount[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as LocalAccount[]; } catch { return []; }
}
function saveAccounts(accounts: LocalAccount[]) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(accounts));
}

export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function registerLocalAccount(email: string, password: string, name: string) {
  const normalized = email.trim().toLowerCase();
  const accounts = getAccounts();
  if (accounts.some(a => a.email === normalized)) return { error: 'An account with this email already exists.' };
  const passwordHash = await hashPassword(password);
  accounts.push({ email: normalized, name: name.trim() || normalized.split('@')[0], passwordHash });
  saveAccounts(accounts);
  return { account: accounts[accounts.length - 1] };
}

export async function authenticateLocalAccount(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const account = getAccounts().find(a => a.email === normalized);
  if (!account) return { error: 'No local account exists for this email. Create an account first.' };
  const passwordHash = await hashPassword(password);
  if (passwordHash !== account.passwordHash) return { error: 'Incorrect password.' };
  return { account };
}

export function findLocalAccount(email: string) {
  const normalized = email.trim().toLowerCase();
  return getAccounts().find(a => a.email === normalized) || null;
}

export async function resetLocalPassword(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.email === normalized);
  if (index === -1) return { error: 'No local account exists for this email.' };
  accounts[index].passwordHash = await hashPassword(password);
  saveAccounts(accounts);
  return { account: accounts[index] };
}
