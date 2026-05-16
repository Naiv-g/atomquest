'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { Save, Calendar, CheckCircle } from 'lucide-react';
import { Cycle, CheckInWindow, QuarterKey } from '@/lib/types';

export default function CycleConfigPage() {
  const { cycle, updateCycle } = useApp();
  const [localCycle, setLocalCycle] = useState<Cycle>({ ...cycle });
  const [saving, setSaving] = useState(false);

  const toggleWindow = (quarter: QuarterKey) => {
    setLocalCycle(c => ({
      ...c,
      checkInWindows: c.checkInWindows.map(w =>
        w.quarter === quarter ? { ...w, isActive: !w.isActive } : w
      ),
    }));
  };

  const updateWindow = (quarter: QuarterKey, field: keyof CheckInWindow, value: string | boolean) => {
    setLocalCycle(c => ({
      ...c,
      checkInWindows: c.checkInWindows.map(w =>
        w.quarter === quarter ? { ...w, [field]: value } : w
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    updateCycle(localCycle);
    toast.success('Cycle configuration saved!');
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Cycle Configuration</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Manage the goal-setting cycle and quarterly check-in windows
        </p>
      </div>

      {/* Goal Setting Window */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} color="#818cf8" /> Phase 1 — Goal Setting Window
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="label">Cycle Year</label>
            <input type="number" className="input" value={localCycle.year}
              onChange={e => setLocalCycle(c => ({ ...c, year: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">Goal Setting Opens</label>
            <input type="date" className="input" value={localCycle.goalSettingOpens}
              onChange={e => setLocalCycle(c => ({ ...c, goalSettingOpens: e.target.value }))} />
          </div>
          <div>
            <label className="label">Goal Setting Closes</label>
            <input type="date" className="input" value={localCycle.goalSettingCloses}
              onChange={e => setLocalCycle(c => ({ ...c, goalSettingCloses: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Check-in Windows */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Quarterly Check-in Windows</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {localCycle.checkInWindows.map(w => (
            <div key={w.quarter} style={{
              padding: '1rem', borderRadius: '0.875rem',
              background: w.isActive ? 'rgba(16,185,129,0.06)' : 'rgba(30,41,59,0.4)',
              border: `1px solid ${w.isActive ? 'rgba(16,185,129,0.25)' : 'rgba(51,65,85,0.5)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{w.quarter}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{w.label}</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.8125rem', color: w.isActive ? '#34d399' : 'var(--text-muted)' }}>
                    {w.isActive ? '🟢 Active' : '🔒 Closed'}
                  </span>
                  <input type="checkbox" checked={w.isActive} onChange={() => toggleWindow(w.quarter)}
                    style={{ accentColor: '#10b981', width: 16, height: 16, cursor: 'pointer' }} />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="label">Label</label>
                  <input type="text" className="input" value={w.label}
                    onChange={e => updateWindow(w.quarter, 'label', e.target.value)} />
                </div>
                <div>
                  <label className="label">Opens On</label>
                  <input type="date" className="input" value={w.opensOn}
                    onChange={e => updateWindow(w.quarter, 'opensOn', e.target.value)} />
                </div>
                <div>
                  <label className="label">Closes On</label>
                  <input type="date" className="input" value={w.closesOn}
                    onChange={e => updateWindow(w.quarter, 'closesOn', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Reference */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>BRD-Defined Check-in Schedule</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Window Opens</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { period: 'Phase 1 — Goal Setting', window: '1st May', action: 'Goal Creation, Submission & Approval' },
                { period: 'Q1 Check-in', window: 'July', action: 'Progress Update — Planned vs. Actual' },
                { period: 'Q2 Check-in', window: 'October', action: 'Progress Update — Planned vs. Actual' },
                { period: 'Q3 Check-in', window: 'January', action: 'Progress Update — Planned vs. Actual' },
                { period: 'Q4 / Annual', window: 'March / April', action: 'Final Achievement Capture' },
              ].map(row => (
                <tr key={row.period}>
                  <td style={{ fontWeight: 600 }}>{row.period}</td>
                  <td style={{ color: '#818cf8' }}>{row.window}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.5rem' }}>
          {saving ? 'Saving…' : <><Save size={15} /> Save Cycle Config</>}
        </button>
      </div>
    </div>
  );
}
