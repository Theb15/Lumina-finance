'use client';

import AppShell from '@/components/AppShell';
import Protected from '@/components/Protected';
import GlassCard from '@/components/GlassCard';
import SectionHeader from '@/components/SectionHeader';
import { useFinance } from '@/components/FinanceProvider';
import { monthlySnapshot, money } from '@/lib/finance';
import { BarChart3, ShieldCheck, Sparkles, TrendingDown } from '@/components/Icons';

export default function Insights() {
  return <Protected><AppShell><InsightsInner /></AppShell></Protected>;
}

function InsightsInner() {
  const { transactions } = useFinance();
  const s = monthlySnapshot(transactions);
  const food = s.categories.Food ?? 0;
  const shopping = s.categories.Shopping ?? 0;

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <h1>Financial insights</h1>
          <p>Useful patterns from your cash flow, not noise.</p>
        </div>
      </div>

      <div className="insight-grid">
        <Insight icon={<TrendingDown />} title="You're keeping more than you spend" text={`Your current savings rate is ${s.savingsRate.toFixed(1)}%. With ${money(s.available)} available after spending, you're in a strong position to fund your goals.`} />
        <Insight icon={<BarChart3 />} title="Food is your biggest flexible category" text={`${money(food)} went to food this month. A 10% reduction would free about ${money(food * .1)} for another goal without changing your fixed bills.`} />
        <Insight icon={<Sparkles />} title="Shopping has room to tighten" text={`${money(shopping)} is going to shopping. Consider a 48-hour pause for non-essential purchases above ₹2,000.`} />
        <Insight icon={<ShieldCheck />} title="Your baseline looks healthy" text="No debt is currently represented in your profile. Keep an emergency buffer before increasing discretionary commitments." />
      </div>

      <GlassCard className="card-pad" style={{ marginTop: 18 }}>
        <SectionHeader title="Next-month forecast" subtitle="A simple baseline using your current income and spending pattern." />
        <div className="grid-4">
          <Metric label="Expected income" value={money(s.income)} />
          <Metric label="Expected spending" value={money(s.expenses)} />
          <Metric label="Expected surplus" value={money(s.available)} />
          <Metric label="Potential yearly surplus" value={money(s.available * 12)} />
        </div>
      </GlassCard>
    </div>
  );
}

function Insight({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <GlassCard className="insight-tile"><div className="tile-icon">{icon}</div><h3>{title}</h3><p>{text}</p></GlassCard>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="stat-card" style={{ minHeight: 0 }}><div className="eyebrow">{label}</div><div className="stat-value" style={{ fontSize: 22 }}>{value}</div></div>;
}
