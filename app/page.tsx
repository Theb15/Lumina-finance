'use client';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppShell from '@/components/AppShell';
import Protected from '@/components/Protected';
import GlassCard from '@/components/GlassCard';
import StatCard from '@/components/StatCard';
import SectionHeader from '@/components/SectionHeader';
import AddTransactionSheet from '@/components/AddTransactionSheet';
import { useFinance } from '@/components/FinanceProvider';
import { useAuth } from '@/components/AuthProvider';
import { buildCashflow, financialHealthScore, goalProgress, monthlySnapshot, money } from '@/lib/finance';
import { ArrowRight, CalendarDays, CircleDollarSign, CreditCard, Sparkles, TrendingUp, Plus, Wallet, ArrowUpRight, ArrowDownRight } from '@/components/Icons';

const palette = ['#4edea3','#8785ff','#ffb95f','#9ad8c0','#6b7070','#ff7b75'];

export default function Dashboard(){return <Protected><AppShell><DashboardInner/></AppShell></Protected>}

function DashboardInner(){
  const {transactions,goals}=useFinance();
  const [openAdd,setOpenAdd]=useState(false);
  const {user}=useAuth();
  const now = new Date();
  const s=monthlySnapshot(transactions, now);
  const categories=Object.entries(s.categories).sort((a,b)=>b[1]-a[1]);
  const [rangeDays,setRangeDays]=useState(14);
  const chart=useMemo(()=>buildCashflow(transactions,rangeDays,new Date()),[transactions,rangeDays]);
  const score=financialHealthScore(s);
  const firstName=user?.name?.split(' ')[0] ?? 'there';
  const topCategory=categories[0];
  const spendShare=topCategory && s.expenses ? Math.round(topCategory[1]/s.expenses*100) : 0;
  const recent=s.transactions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
  const insight=s.income===0
    ? 'Add your income to unlock a more useful monthly plan.'
    : s.savingsRate>=50
      ? `You're keeping ${s.savingsRate.toFixed(0)}% of this month's income. That gives your goals plenty of room to move.`
      : `You're saving ${s.savingsRate.toFixed(0)}% this month. A small cut in ${topCategory?.[0]?.toLowerCase() ?? 'flexible spending'} could improve your buffer.`;
  const recommendation = topCategory
    ? `${topCategory[0]} is your largest category at ${money(topCategory[1])}. That's ${spendShare}% of your spending this month.`
    : 'Your spending picture will appear here as you add transactions.';
  const donut = categories.length
    ? categories.slice(0,6).reduce((acc,[,value],i)=>{ const start=acc.end; const end=start+(value/s.expenses*100); acc.parts.push(`${palette[i]} ${start}% ${end}%`); acc.end=end; return acc; },{parts:[] as string[],end:0}).parts.join(', ')
    : '#ffffff12 0 100%';

  return <div className="page">
    <div className="topbar dashboard-topbar">
      <div><div className="eyebrow-line"><span className="status-dot"/> Live financial view</div><h1>Good evening, {firstName}</h1><p>Here's how your money is looking this month.</p></div>
      <div className="top-actions">
        <button className="button primary add-transaction-btn" onClick={()=>setOpenAdd(true)}><Plus size={15}/> Add transaction</button>
        <button className="button small hide-mobile"><CalendarDays size={14}/> {now.toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</button>
        <div className="avatar">{(user?.name??'Y').slice(0,1).toUpperCase()}</div>
      </div>
    </div>

    <div className="grid-4">
      <StatCard label="Monthly income" value={money(s.income)} change="Current month" icon={<CircleDollarSign size={17}/>} />
      <StatCard label="Monthly spending" value={money(s.expenses)} change={s.expenses ? `${money(s.expenses)} so far` : 'No spending yet'} positive={false} icon={<CreditCard size={17}/>} />
      <StatCard label="Available" value={money(s.available)} change={s.available>=0 ? 'After current spending' : 'Spending is above income'} icon={<Wallet size={17}/>} />
      <StatCard label="Savings rate" value={`${s.savingsRate.toFixed(1)}%`} change={s.savingsRate>=50 ? 'Strong month' : 'Room to improve'} icon={<TrendingUp size={17}/>} />
    </div>

    <div className="dashboard-grid">
      <GlassCard className="chart-card feature-card">
        <SectionHeader title="Cash flow" subtitle={`Daily inflows and outflows over the last ${rangeDays} days`} action={<div className="range">{[7,14,30].map(days=><button key={days} className={rangeDays===days?'active':''} onClick={()=>setRangeDays(days)}>{days}D</button>)}</div>}/>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart key={`${rangeDays}-${transactions.length}-${transactions.map(t=>t.id).join(',')}`} data={chart} margin={{top:8,right:8,left:-12,bottom:0}}>
          <defs><linearGradient id="cash" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4edea3" stopOpacity={.28}/><stop offset="100%" stopColor="#4edea3" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid vertical={false}/><XAxis dataKey="d" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} tickFormatter={v=>`₹${Math.round(v/1000)}k`}/>
          <Tooltip contentStyle={{background:'#171717',border:'1px solid #ffffff18',borderRadius:14,color:'#eee'}} formatter={(value:number)=>money(value)} />
          <Area type="monotone" dataKey="i" stroke="#4edea3" fill="url(#cash)" strokeWidth={2.3} name="Income"/>
          <Area type="monotone" dataKey="e" stroke="#8785ff" fill="none" strokeWidth={2.3} name="Expenses"/>
        </AreaChart></ResponsiveContainer></div>
        <div className="chart-foot"><span><i className="legend-line green"/> Income</span><span><i className="legend-line indigo"/> Expenses</span><span className="chart-note">Values update instantly when you add a transaction</span></div>
      </GlassCard>

      <GlassCard className="insight-card">
        <div className="insight-eyebrow"><Sparkles size={15}/> Lumina insight</div>
        <h3>{s.available>=0 ? 'Your cash position looks healthy.' : 'Your cash position needs attention.'}</h3>
        <p>{insight}</p>
        <div className="advisor-callout"><div className="callout-icon"><Sparkles size={15}/></div><div><strong>{recommendation}</strong><span>Ask the advisor for a target-specific plan.</span></div></div>
        <a className="button primary" style={{display:'inline-flex',alignItems:'center',gap:8,marginTop:18}} href="/advisor">Talk to your advisor <ArrowRight size={14}/></a>
      </GlassCard>
    </div>

    <div className="two-col">
      <GlassCard className="card-pad">
        <SectionHeader title="Spending breakdown" subtitle={s.expenses ? `${money(s.expenses)} out this month` : 'No expenses this month yet'}/>
        <div className="spend-layout">
          <div className="donut" style={{background:`conic-gradient(${donut})`}}><div className="donut-center"><strong>{money(s.expenses)}</strong><span>this month</span></div></div>
          <div className="legend">{categories.slice(0,6).map(([name,val],i)=><div className="legend-row" key={name}><span className="legend-left"><i className="dot" style={{background:palette[i]}}/>{name}</span><span>{money(val)}</span></div>)}</div>
        </div>
      </GlassCard>

      <GlassCard className="card-pad">
        <SectionHeader title="Recent activity" subtitle="Your latest transactions" action={<a className="button small" href="/transactions">View all</a>}/>
        <div className="activity-list">{recent.length ? recent.map(t=><div className="activity-row" key={t.id}><div className={`activity-icon ${t.type}`} >{t.type==='income'?<ArrowUpRight size={16}/>:<ArrowDownRight size={16}/>}</div><div className="activity-main"><strong>{t.merchant}</strong><span>{t.goal_id ? 'Goal contribution' : t.category} · {new Date(t.date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</span></div><span className={`activity-amount ${t.type}`}>{t.type==='income'?'+':'−'} {money(t.amount)}</span></div>) : <div className="empty">No transactions yet.</div>}</div>
      </GlassCard>
    </div>

    <div className="dashboard-lower">
      <GlassCard className="card-pad goals-preview"><SectionHeader title="Your goals" subtitle="Progress at a glance" action={<a className="button small" href="/goals">Manage goals</a>}/><div className="goal-list">{goals.slice(0,3).map(g=><div className="goal-row" key={g.id}><div className="goal-head"><span>{g.name}</span><span>{goalProgress(g)}%</span></div><div className="progress"><i style={{width:`${goalProgress(g)}%`}}/></div><div className="goal-sub"><span>{money(g.current)} of {money(g.target)}</span><span>{g.priority} priority</span></div></div>)}</div></GlassCard>
      <GlassCard className="health-card"><div className="health-ring-wrap"><div className="score-ring large" style={{background:`conic-gradient(var(--green) 0 ${score}%,#ffffff0b ${score}% 100%)`}}><strong>{score}</strong></div></div><div><div className="eyebrow">Financial health</div><h3>{score>=80?'Excellent':score>=60?'Healthy':'Needs attention'}</h3><p>Based on this month's cash flow and savings rate.</p></div></GlassCard>
    </div>

    {openAdd&&<AddTransactionSheet onClose={()=>setOpenAdd(false)}/>} 
  </div>
}
