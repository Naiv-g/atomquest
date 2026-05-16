'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { ThrustArea, UoMType } from '@/lib/types';

const THRUST_AREAS: ThrustArea[] = [
  'Revenue Growth', 'Cost Optimization', 'Customer Experience',
  'Operational Excellence', 'People & Culture', 'Innovation & Technology',
  'Quality & Compliance', 'Sustainability',
];

export default function EditGoalPage() {
  const { currentUser, goals, updateGoal } = useApp();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const goal = goals.find(g => g.id === id);

  const [form, setForm] = useState({
    thrustArea: goal?.thrustArea ?? '' as ThrustArea | '',
    title: goal?.title ?? '',
    description: goal?.description ?? '',
    uomType: goal?.uomType ?? '' as UoMType | '',
    uomLabel: goal?.uomLabel ?? '',
    target: String(goal?.target ?? ''),
    weightage: goal?.weightage ?? 10,
  });
  const [saving, setSaving] = useState(false);

  if (!goal || !currentUser) {
    return (
      <div className="empty-state">
        <p>Goal not found.</p>
        <Link href="/dashboard/employee/goals" className="btn-secondary" style={{ marginTop: '1rem' }}>Back</Link>
      </div>
    );
  }

  if (goal.approvalStatus === 'locked' || goal.approvalStatus === 'approved') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Goal is Locked</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          This goal has been approved and locked. Contact your admin to unlock it.
        </p>
        <Link href="/dashboard/employee/goals" className="btn-secondary">Back to Goals</Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (form.weightage < 10) { toast.error('Minimum weightage is 10%'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    updateGoal(id, {
      thrustArea: form.thrustArea as ThrustArea,
      title: form.title,
      description: form.description,
      uomType: form.uomType as UoMType,
      uomLabel: form.uomLabel,
      target: form.uomType === 'timeline' ? form.target : Number(form.target),
      weightage: form.weightage,
      approvalStatus: 'draft',
    }, currentUser);
    toast.success('Goal updated!');
    router.push('/dashboard/employee/goals');
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }} className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dashboard/employee/goals" className="btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Edit Goal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Editing: {goal.title}</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Thrust Area</label>
            <select className="input" value={form.thrustArea} onChange={e => setForm(f => ({ ...f, thrustArea: e.target.value as ThrustArea }))}>
              {THRUST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Goal Title</label>
            <input type="text" className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">UoM Label</label>
              <input type="text" className="input" value={form.uomLabel} onChange={e => setForm(f => ({ ...f, uomLabel: e.target.value }))} />
            </div>
            <div>
              <label className="label">Target</label>
              <input type={form.uomType === 'timeline' ? 'date' : 'number'} className="input" value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="label" style={{ margin: 0 }}>Weightage</label>
              <span style={{ fontWeight: 700, color: '#818cf8' }}>{form.weightage}%</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={form.weightage}
              onChange={e => setForm(f => ({ ...f, weightage: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Link href="/dashboard/employee/goals" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
