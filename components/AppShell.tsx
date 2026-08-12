'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Bot, Goal, Home, Lightbulb, LogOut, Menu, Settings, Wallet, X } from './Icons';
import { useState } from 'react';

const nav = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: Wallet },
  { href: '/goals', label: 'Goals', icon: Goal },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/advisor', label: 'AI Advisor', icon: Bot },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const { user, signOut } = useAuth(); const [open, setOpen] = useState(false);
  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const initials = (user?.name ?? 'Y').slice(0, 1).toUpperCase();
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><SparkleMark /></div><span>Lumina</span><button className="icon-btn mobile-only" onClick={() => setOpen(false)}><X size={18}/></button></div>
      <nav className="nav-list">
        {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-item ${active(href) ? 'active' : ''}`}><Icon size={19}/><span>{label}</span></Link>)}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/settings" className={`nav-item ${active('/settings') ? 'active' : ''}`}><Settings size={19}/><span>Settings</span></Link>
        <div className="user-mini"><div className="avatar">{initials}</div><div className="user-meta"><strong>{user?.name ?? 'Guest'}</strong><span>{user?.email ?? 'Local mode'}</span></div><button className="icon-btn" title="Sign out" onClick={async () => { await signOut(); router.push('/login'); }}><LogOut size={16}/></button></div>
      </div>
    </aside>
    <div className="mobile-top"><button className="icon-btn" onClick={() => setOpen(true)}><Menu size={20}/></button><div className="brand"><div className="brand-mark"><SparkleMark /></div><span>Lumina</span></div><Link href="/settings" className="avatar">{initials}</Link></div>
    {open && <div className="scrim" onClick={() => setOpen(false)} />}
    <main className="main">{children}</main>
    <nav className="bottom-nav">{nav.slice(0,5).map(({href,label,icon:Icon}) => <Link key={href} href={href} className={active(href) ? 'active' : ''}><Icon size={19}/><span>{label === 'Transactions' ? 'Txns' : label === 'AI Advisor' ? 'Advisor' : label}</span></Link>)}</nav>
  </div>
}
function SparkleMark(){ return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2.5l1.5 6.2L19.7 10l-6.2 1.5L12 17.7l-1.5-6.2L4.3 10l6.2-1.3L12 2.5Z" fill="currentColor"/><path d="M18.5 15.3l.7 2.6 2.3.7-2.3.6-.7 2.7-.6-2.7-2.4-.6 2.4-.7.6-2.6Z" fill="currentColor" opacity=".7"/></svg> }
