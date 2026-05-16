'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { Zap, Plus, Users } from 'lucide-react';
import { ThrustArea, UoMType } from '@/lib/types';

const THRUST_AREAS: ThrustArea[] = [
  'Revenue Growth', 'Cost Optimization', 'Customer Experience', 'Operational Excellence',
  'People & Culture', 'Innovation & Technology', 'Quality & Compliance', 'Sustainability',
];

export default function SharedGoalsPage() {
  const { currentUser, users, goals, pushSharedGoal } = useApp();
  const [form, setForm] = useState({
    thrustArea: '' as ThrustArea | '',
    title: '', description: '', uomType: 'min' as UoMType,
    uomLabel: '', target: '', weightage: 20,
    selectedEmployees: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  const teamMembers = users.filter(u => u.managerId === currentUser.id && u.role === 'employee');
  const sharedGoals = goals.filter(g => g.isShared && (g.employeeId === currentUser.id || g.sharedFrom));

  const toggleEmployee = (id: string) => {
    setForm(f => ({
      ...f,
      selectedEmployees: f.selectedEmployees.includes(id)
        ? f.selectedEmployees.filter(e => e !== id)
        : [...f.selectedEmployees, id],
    }));
  };

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.thrustArea || !form.title || !form.target) { toast.error('Fill all required fields'); return; }
    if (form.selectedEmployees.length === 0) { toast.error('Select at least one employee'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    pushSharedGoal({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      thrustArea: form.thrustArea as ThrustArea,
      title: form.title, description: form.description,
      uomType: form.uomType, uomLabel: form.uomLabel,
      target: form.uomType === 'timeline' ? form.target : Number(form.target),
      weightage: form.weightage,
      approvalStatus: 'locked', goalStatus: 'not_started',
      isShared: true,
    }, form.selectedEmployees);
    toast.success(`Shared goal pushed to ${form.selectedEmployees.length} employees!`);
    setForm({ thrustArea: '', title: '', description: '', uomType: 'min', uomLabel: '', target: '', weightage: 20, selectedEmployees: [] });
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Shared Goals</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Push departmental KPIs to multiple team members simultaneously
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Push Form */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="#818cf8" /> Push New Shared Goal
          </h3>
          <form onSubmit={handlePush} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label className="label">Thrust Area *</label>
              <select className="input" value={form.thrustArea} onChange={e => setForm(f => ({ ...f, thrustArea: e.target.value as ThrustArea }))}>
                <option value="">Select…</option>
                {THRUST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Goal Title *</label>
              <input type="text" className="input" placeholder="e.g. Q1 Department Revenue Target" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" placeholder="Describe the shared objective…" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 72 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">UoM Type</label>
                <select className="input" value={form.uomType} onChange={e => setForm(f => ({ ...f, uomType: e.target.value as UoMType }))}>
                  <option value="min">Numeric (Higher Better)</option>
                  <option value="max">Numeric (Lower Better)</option>
                  <option value="timeline">Timeline</option>
                  <option value="zero">Zero-based</option>
                </select>
              </div>
              <div>
                <label className="label">UoM Label</label>
                <input type="text" className="input" placeholder="e.g. Revenue (₹L)" value={form.uomLabel}
                  onChange={e => setForm(f => ({ ...f, uomLabel: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">Target *</label>
                <input type={form.uomType === 'timeline' ? 'date' : 'number'} className="input" value={form.target}
                  onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="label" style={{ margin: 0 }}>Weightage</label>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#818cf8' }}>{form.weightage}%</span>
                </div>
                <input type="range" min={10} max={100} step={5} value={form.weightage}
                  onChange={e => setForm(f => ({ ...f, weightage: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#6366f1', marginTop: '0.375rem' }}
                />
              </div>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="label">Push to Employees *</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                {teamMembers.map(m => {
                  const selected = form.selectedEmployees.includes(m.id);
                  return (
                    <button key={m.id} type="button" onClick={() => toggleEmployee(m.id)} style={{
                      padding: '0.375rem 0.875rem', borderRadius: '999px', border: '1px solid',
                      borderColor: selected ? 'rgba(99,102,241,0.5)' : 'var(--border)',
                      background: selected ? 'rgba(99,102,241,0.12)' : 'var(--surface)',
                      color: selected ? '#818cf8' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, transition: 'all 0.2s',
                    }}>
                      {selected ? '✓ ' : ''}{m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              <Zap size={15} /> {saving ? 'Pushing…' : `Push to ${form.selectedEmployees.length} Employee${form.selectedEmployees.length !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>

        {/* Existing Shared Goals */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="#818cf8" /> Existing Shared Goals
          </h3>
          {sharedGoals.filter(g => g.sharedTo).length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <Zap size={32} color="#334155" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No shared goals pushed yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sharedGoals.filter(g => g.sharedTo).map(g => (
                <div key={g.id} style={{
                  padding: '0.875rem', borderRadius: '0.75rem',
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{g.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {g.thrustArea} · Target: {g.target} · Pushed to {g.sharedTo?.length ?? 0} employees
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
