'use client';
import { FormEvent, useMemo, useState } from 'react';
import { X } from './Icons';
import { useFinance } from './FinanceProvider';
import type { Category, TransactionType } from '@/lib/types';

const categories: Category[]=['Food','Transport','Shopping','Entertainment','Bills','Health','Education','Other'];

export default function AddTransactionSheet({onClose}:{onClose:()=>void}){
  const {addTransaction, goals, updateGoal}=useFinance();
  const [type,setType]=useState<TransactionType>('expense');
  const [amount,setAmount]=useState('');
  const [merchant,setMerchant]=useState('');
  const [category,setCategory]=useState<Category>('Food');
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [notes,setNotes]=useState('');
  const [recurring,setRecurring]=useState(false);
  const [goalId,setGoalId]=useState('');

  const selectedGoal = useMemo(()=>goals.find(g=>g.id===goalId),[goals,goalId]);

  async function submit(e:FormEvent){
    e.preventDefault();
    const n=Number(amount);
    if(!n||n<0||!merchant.trim())return;
    if(goalId && type !== 'expense') return;
    const added = await addTransaction({type,amount:n,merchant:merchant.trim(),category,date,notes:notes.trim(),recurring,goal_id:goalId||undefined});
    if(added && goalId && selectedGoal){
      await updateGoal(selectedGoal.id,{current:Math.min(selectedGoal.target, selectedGoal.current+n)});
    }
    onClose();
  }

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <form className="sheet transaction-sheet" onSubmit={submit}>
      <div className="section-header">
        <div><h2>Add transaction</h2><p>Capture income, spending, or put money toward a goal.</p></div>
        <button type="button" className="icon-btn" onClick={onClose}><X size={17}/></button>
      </div>

      <div className="transaction-type-toggle" aria-label="Transaction type">
        <button type="button" className={type==='expense'?'selected expense':''} onClick={()=>{setType('expense');setCategory('Food')}}>Expense</button>
        <button type="button" className={type==='income'?'selected income':''} onClick={()=>{setType('income');setGoalId('')}}>Income</button>
      </div>

      <div className="form-grid">
        <div className="field"><label>Amount</label><input className="input" type="number" min="0" step="1" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"/></div>
        <div className="field"><label>Merchant / source</label><input className="input" required value={merchant} onChange={e=>setMerchant(e.target.value)} placeholder="e.g. Swiggy, Salary"/></div>
        <div className="field"><label>Category</label><select className="select dark-select" value={category} onChange={e=>setCategory(e.target.value as Category)}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div className="field"><label>Date</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>

        {type==='expense' && <div className="field full"><label>Contribute to a goal <span className="optional">Optional</span></label>
          <select className="select dark-select goal-select" value={goalId} onChange={e=>setGoalId(e.target.value)}>
            <option value="">No goal contribution</option>
            {goals.map(g=><option key={g.id} value={g.id}>{g.name} · {Math.round((g.current/Math.max(g.target,1))*100)}% complete</option>)}
          </select>
          {selectedGoal && <div className="goal-contribution-preview"><span>Adding to <strong>{selectedGoal.name}</strong></span><span>{money(selectedGoal.current)} → {money(Math.min(selectedGoal.target, selectedGoal.current + (Number(amount)||0)))}</span></div>}
        </div>}

        <div className="field full"><label>Notes</label><input className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional"/></div>
        <label className="field full recurring-row"><input type="checkbox" checked={recurring} onChange={e=>setRecurring(e.target.checked)}/><span>Recurring transaction</span></label>
      </div>
      <div className="sheet-actions"><button type="button" className="button" onClick={onClose}>Cancel</button><button className="button primary">Add transaction</button></div>
    </form>
  </div>
}

function money(n:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Math.round(n))}
