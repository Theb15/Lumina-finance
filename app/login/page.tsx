'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import { authenticateLocalAccount } from '@/lib/local-auth';

export default function Login(){
  const router=useRouter(); const {localMode}=useAuth(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setError('');setBusy(true);
    try {
      if(!supabase){
        const r=await authenticateLocalAccount(email,password); if(r.error){setError(r.error); return;}
        localStorage.setItem('lumina_local_email',r.account!.email); localStorage.setItem('lumina_local_name',r.account!.name); window.location.href='/'; return;
      }
      const r=await supabase.auth.signInWithPassword({email,password}); if(r.error)setError(r.error.message);else router.push('/');
    } finally { setBusy(false); }
  }
  async function google(){setError('');const r=await signInWithGoogle();if(r.error)setError(localMode?'Google login requires Supabase configuration in .env.local.':r.error.message)}
  return <div className="auth-page"><div className="auth-shell"><div className="auth-visual"><div className="brand"><div className="brand-mark">✦</div><span>Lumina</span></div><div><h1>Make your money<br/><span style={{color:'var(--green)'}}>make sense.</span></h1><p>An intelligent financial planning workspace that learns your cash flow, helps you set goals, and plans with you.</p></div><span className="eyebrow">Precision · Privacy · Planning</span></div><div className="auth-form"><h2>Welcome back</h2><p>Sign in to continue to your financial workspace.</p>{error&&<div className="error-text" style={{marginBottom:14}}>{error}</div>}<form onSubmit={submit} className="auth-fields"><div className="field"><label>Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div><div className="field"><label>Password</label><input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></div><div style={{display:'flex',justifyContent:'flex-end'}}><Link className="auth-link" href="/reset-password" style={{fontSize:11}}>Forgot password?</Link></div><button className="button primary full-button" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><div className="auth-divider">or</div><button className="button full-button" onClick={google}><span style={{fontWeight:700}}>G</span>&nbsp; Continue with Google</button>{localMode&&<p className="auth-note">Local development auth is enabled. Accounts and app data stay in this browser until you configure Supabase.</p>}<p style={{fontSize:12,color:'var(--muted)',marginTop:24}}>New to Lumina? <Link className="auth-link" href="/signup">Create an account</Link></p></div></div></div>
}
