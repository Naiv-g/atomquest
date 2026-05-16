'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Plus, Info, HelpCircle } from 'lucide-react';
import { ThrustArea, UoMType } from '@/lib/types';
import { validateSingleGoalWeightage, validateMaxGoals } from '@/lib/utils';

const THRUST_AREAS: ThrustArea[] = [
  'Revenue Growth', 'Cost Optimization', 'Customer Experience',
  'Operational Excellence', 'People & Culture', 'Innovation & Technology',
  'Quality & Compliance', 'Sustainability',
];

const UOM_OPTIONS: { value: UoMType; label: string; desc: string; example: string }[] = [
  { value: 'min', label: 'Numeric — Higher is Better', desc: 'Score = Achievement ÷ Target', example: 'Sales Revenue, Units Sold, NPS' },
  { value: 'max', label: 'Numeric — Lower is Better', desc: 'Score = Target ÷ Achievement', example: 'TAT, Cost, Error Rate' },
  { value: 'timeline', label: 'Timeline (Date-based)', desc: 'Score based on completion date vs deadline', example: 'Product Launch, Project Delivery' },
  { value: 'zero', label: 'Zero-based (Zero = Success)', desc: '0 → 100%, else 0%', example: 'Safety Incidents, Compliance Violations' },
];

// AI Suggestion templates per thrust area
const GOAL_SUGGESTIONS: Record<ThrustArea, { title: string; desc: string; uom: UoMType; uomLabel: string }[]> = {
  'Revenue Growth': [
    { title: 'Increase Quarterly Sales Revenue', desc: 'Achieve quarterly revenue target through client acquisition and upselling.', uom: 'min', uomLabel: 'Revenue (₹ Lakhs)' },
    { title: 'Expand New Client Base', desc: 'Onboard new clients to grow market share.', uom: 'min', uomLabel: 'New Clients' },
  ],
  'Cost Optimization': [
    { title: 'Reduce Operational Expenditure', desc: 'Identify and eliminate cost inefficiencies.', uom: 'max', uomLabel: 'Opex (₹ Lakhs)' },
    { title: 'Vendor Cost Negotiation Savings', desc: 'Achieve cost savings through vendor renegotiations.', uom: 'min', uomLabel: 'Savings (%)' },
  ],
  'Customer Experience': [
    { title: 'Improve CSAT Score', desc: 'Enhance customer satisfaction through proactive engagement.', uom: 'min', uomLabel: 'CSAT Score' },
    { title: 'Reduce Customer Complaint TAT', desc: 'Resolve customer complaints faster.', uom: 'max', uomLabel: 'Resolution Days' },
  ],
  'Operational Excellence': [
    { title: 'Reduce Process TAT', desc: 'Streamline operations to reduce time-to-complete.', uom: 'max', uomLabel: 'Days' },
    { title: 'Increase Process Automation Coverage', desc: 'Automate repetitive manual tasks.', uom: 'min', uomLabel: 'Processes (%)' },
  ],
  'People & Culture': [
    { title: 'Complete All Mandatory Training', desc: 'Complete all assigned L&D programs on time.', uom: 'timeline', uomLabel: 'Completion Date' },
    { title: 'Improve Team Engagement Score', desc: 'Drive higher engagement within the team.', uom: 'min', uomLabel: 'Engagement Score' },
  ],
  'Innovation & Technology': [
    { title: 'Launch New Feature/Product', desc: 'Deliver a key product feature or tech initiative.', uom: 'timeline', uomLabel: 'Launch Date' },
    { title: 'Increase System Uptime', desc: 'Maintain high availability of critical systems.', uom: 'min', uomLabel: 'Uptime (%)' },
  ],
  'Quality & Compliance': [
    { title: 'Zero Compliance Incidents', desc: 'Maintain zero compliance violations.', uom: 'zero', uomLabel: 'Incidents' },
    { title: 'Reduce Defect Rate', desc: 'Minimize defects in deliverables.', uom: 'max', uomLabel: 'Defect Rate (%)' },
  ],
  'Sustainability': [
    { title: 'Reduce Carbon Footprint', desc: 'Implement initiatives to reduce environmental impact.', uom: 'max', uomLabel: 'CO₂ Emissions (tons)' },
    { title: 'Green Initiative Adoption', desc: 'Drive adoption of sustainability practices.', uom: 'min', uomLabel: 'Initiatives (%)' },
  ],
};

export default function CreateGoalPage() {
  const { currentUser, goals, createGoal } = useApp();
  const router = useRouter();

  const myGoals = goals.filter(g => g.employeeId === currentUser?.id);
  const maxError = validateMaxGoals(myGoals.length);

  const [form, setForm] = useState({
    thrustArea: '' as ThrustArea | '',
    title: '',
    description: '',
    uomType: '' as UoMType | '',
    uomLabel: '',
    target: '',
    weightage: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  const suggestions = form.thrustArea ? GOAL_SUGGESTIONS[form.thrustArea as ThrustArea] ?? [] : [];

  const applySuggestion = (s: typeof suggestions[0]) => {
    setForm(f => ({ ...f, title: s.title, description: s.desc, uomType: s.uom, uomLabel: s.uomLabel }));
    setShowSuggestions(false);
    toast.success('Suggestion applied!');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.thrustArea) e.thrustArea = 'Required';
    if (!form.title.trim()) e.title = 'Required';
    if (!form.uomType) e.uomType = 'Required';
    if (!form.uomLabel.trim()) e.uomLabel = 'Required';
    if (!form.target) e.target = 'Required';
    const wErr = validateSingleGoalWeightage(form.weightage);
    if (wErr) e.weightage = wErr;
    return e;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (maxError) { toast.error(maxError); return; }
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); toast.error('Please fix validation errors'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    createGoal({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      thrustArea: form.thrustArea as ThrustArea,
      title: form.title,
      description: form.description,
      uomType: form.uomType as UoMType,
      uomLabel: form.uomLabel,
      target: form.uomType === 'timeline' ? form.target : Number(form.target),
      weightage: form.weightage,
      approvalStatus: 'draft',
      goalStatus: 'not_started',
      isShared: false,
    });
    toast.success('Goal created!');
    router.push('/dashboard/employee/goals');
  };

  if (maxError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link href="/dashboard/employee/goals" className="btn-secondary" style={{ width: 'fit-content' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Maximum Goals Reached</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You can have a maximum of 8 goals per cycle.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }} className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dashboard/employee/goals" className="btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Create New Goal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Goal {myGoals.length + 1} of 8 · Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Thrust Area */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>1. Strategic Alignment</h3>
          <div>
            <label className="label">Thrust Area *</label>
            <select className="input" value={form.thrustArea} onChange={e => {
              setForm(f => ({ ...f, thrustArea: e.target.value as ThrustArea }));
              setShowSuggestions(true);
              setErrors(er => ({ ...er, thrustArea: '' }));
            }}>
              <option value="">Select thrust area…</option>
              {THRUST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            {errors.thrustArea && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.thrustArea}</p>}
          </div>

          {/* AI Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#818cf8' }}>
                <Sparkles size={14} /> AI Goal Suggestions for &ldquo;{form.thrustArea}&rdquo;
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {suggestions.map((s, i) => (
                  <button key={i} type="button" onClick={() => applySuggestion(s)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem',
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left',
                    background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(51,65,85,0.5)'; }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.desc}</span>
                    <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>UoM: {s.uomLabel}</span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setShowSuggestions(false)} style={{
                marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
              }}>Dismiss suggestions</button>
            </div>
          )}
        </div>

        {/* Goal Details */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>2. Goal Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Goal Title *</label>
              <input type="text" className="input" placeholder="e.g. Increase Q3 Sales Revenue" value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: '' })); }} />
              {errors.title && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.title}</p>}
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" placeholder="Describe what success looks like…" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* UoM & Target */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>3. Measurement & Target</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Unit of Measurement (UoM) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {UOM_OPTIONS.map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.25rem',
                    padding: '0.875rem', borderRadius: '0.75rem', cursor: 'pointer',
                    border: `1px solid ${form.uomType === opt.value ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                    background: form.uomType === opt.value ? 'rgba(99,102,241,0.08)' : 'rgba(15,23,42,0.5)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="radio" name="uom" value={opt.value} checked={form.uomType === opt.value}
                        onChange={e => { setForm(f => ({ ...f, uomType: e.target.value as UoMType })); setErrors(er => ({ ...er, uomType: '' })); }}
                        style={{ accentColor: '#6366f1' }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{opt.label}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '1.25rem' }}>{opt.desc}</span>
                    <span style={{ fontSize: '0.7rem', color: '#6366f1', marginLeft: '1.25rem' }}>e.g. {opt.example}</span>
                  </label>
                ))}
              </div>
              {errors.uomType && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.uomType}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">UoM Label * <span style={{ color: 'var(--text-muted)' }}>(what you measure)</span></label>
                <input type="text" className="input" placeholder="e.g. Revenue (₹ Lakhs), CSAT Score" value={form.uomLabel}
                  onChange={e => { setForm(f => ({ ...f, uomLabel: e.target.value })); setErrors(er => ({ ...er, uomLabel: '' })); }} />
                {errors.uomLabel && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.uomLabel}</p>}
              </div>
              <div>
                <label className="label">Target *</label>
                <input type={form.uomType === 'timeline' ? 'date' : 'number'} className="input"
                  placeholder={form.uomType === 'zero' ? '0' : 'Enter target value'} value={form.target}
                  onChange={e => { setForm(f => ({ ...f, target: e.target.value })); setErrors(er => ({ ...er, target: '' })); }} />
                {errors.target && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.target}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Weightage */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>4. Weightage</h3>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="label" style={{ margin: 0 }}>Weight (Min: 10%) *</label>
              <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '1rem' }}>{form.weightage}%</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={form.weightage}
              onChange={e => { setForm(f => ({ ...f, weightage: Number(e.target.value) })); setErrors(er => ({ ...er, weightage: '' })); }}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>10%</span><span>100%</span>
            </div>
            {errors.weightage && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.weightage}</p>}
            <div style={{
              marginTop: '0.875rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
              fontSize: '0.8125rem', color: '#60a5fa', display: 'flex', gap: '0.5rem',
            }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              All goals combined must total exactly 100% before submission. Current total (excluding this new goal): {myGoals.reduce((s, g) => s + g.weightage, 0)}%.
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Link href="/dashboard/employee/goals" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : <><Plus size={15} /> Create Goal</>}
          </button>
        </div>
      </form>
    </div>
  );
}
