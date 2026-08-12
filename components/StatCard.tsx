import GlassCard from './GlassCard';
import { ArrowDownRight, ArrowUpRight } from './Icons';
export default function StatCard({ label, value, change, positive = true, icon }: { label: string; value: string; change?: string; positive?: boolean; icon?: React.ReactNode }) {
  return <GlassCard className="stat-card"><div className="stat-top"><span className="eyebrow">{label}</span>{icon && <span className="stat-icon">{icon}</span>}</div><div className="stat-value">{value}</div>{change && <div className={`change ${positive ? 'positive' : 'negative'}`}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {change}</div>}</GlassCard>
}
