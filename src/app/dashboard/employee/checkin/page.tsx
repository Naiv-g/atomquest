'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { CheckCircle, Calendar, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { QuarterKey, GoalStatus } from '@/lib/types';
import { computeScore, statusBg, statusLabel, approvalBg, approvalLabel } from '@/lib/utils';
import confetti from 'canvas-confetti';

const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const QUARTER_LABELS: Record<QuarterKey, string> = {
  Q1: 'Q1 · July 2026',
  Q2: 'Q2 · October 2026',
  Q3: 'Q3 · January 2027',
  Q4: 'Q4 · March-April 2027',
};

export default function EmployeeCheckInPage() {
  const { currentUser, goals, cycle, logAchievement, activeQuarter } = useApp();
  const [selectedQ, setSelectedQ] = useState<QuarterKey>(activeQuarter ?? 'Q1');
  const [formData, setFormData] = useState<Record<string, { actual: string; status: GoalStatus; notes: string }>>({});
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  const myGoals = goals.filter(g => g.employeeId === currentUser.id && g.approvalStatus === 'locked');
  const window = cycle.checkInWindows.find(w => w.quarter === selectedQ);

  const handleChange = (goalId: string, field: 'actual' | 'status' | 'notes', value: string) => {
    setFormData(f => ({
      ...f,
      [goalId]: { ...f[goalId], actual: f[goalId]?.actual ?? '', status: f[goalId]?.status ?? 'not_started', notes: f[goalId]?.notes ?? '', [field]: value },
    }));
  };

  const handleSave = async () => {
    const entries = Object.entries(formData);
    if (entries.length === 0) { toast.error('No changes to save.'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    let completedCount = 0;
    entries.forEach(([goalId, data]) => {
      if (!data.actual) return;
      logAchievement(goalId, selectedQ, data.actual, data.status, data.notes);
      if (data.status === 'completed') completedCount++;
    });
    if (completedCount > 0) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'] });
      toast.success(`🎉 ${completedCount} goal(s) completed! Excellent work!`);
    } else {
      toast.success('Check-in saved successfully!');
    }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Quarterly Check-in</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Log your actual achievements against planned targets
        </p>
      </div>

      {/* Quarter Selector */}
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
        {QUARTERS.map(q => {
          const w = cycle.checkInWindows.find(x => x.quarter === q);
          return (
            <button key={q} onClick={() => setSelectedQ(q)} style={{
              padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid',
              borderColor: selectedQ === q ? 'rgba(99,102,241,0.5)' : 'var(--border)',
              background: selectedQ === q ? 'rgba(99,102,241,0.1)' : 'var(--surface)',
              color: selectedQ === q ? '#818cf8' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{q}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                {w?.isActive ? '🟢 Open' : '🔒 Closed'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Window Info */}
      {window && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: window.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(51,65,85,0.3)',
          border: `1px solid ${window.isActive ? 'rgba(16,185,129,0.25)' : 'rgba(51,65,85,0.5)'}`,
        }}>
          <Calendar size={16} color={window.isActive ? '#10b981' : '#64748b'} />
          <div style={{ fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600, color: window.isActive ? '#34d399' : 'var(--text-secondary)' }}>
              {QUARTER_LABELS[selectedQ]}
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              Window: {window.opensOn} → {window.closesOn}
            </span>
          </div>
          {!window.isActive && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b' }}>
              This window is currently closed
            </span>
          )}
        </div>
      )}

      {myGoals.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} color="#334155" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No Approved Goals</h3>
          <p style={{ fontSize: '0.875rem' }}>You need approved & locked goals to log check-ins.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myGoals.map(goal => {
              const existing = goal.quarterlyAchievements.find(a => a.quarter === selectedQ);
              const fd = formData[goal.id];
              const actual = fd?.actual ?? String(existing?.actual ?? '');
              const status = (fd?.status ?? existing?.status ?? 'not_started') as GoalStatus;
              const notes = fd?.notes ?? existing?.notes ?? '';
              const preview = actual ? computeScore(goal.uomType, goal.target, actual) : null;

              return (
                <div key={goal.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{goal.title}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <span>🎯 Target: <strong style={{ color: 'var(--text-primary)' }}>{goal.target}</strong></span>
                        <span>📊 {goal.uomLabel}</span>
                        <span>⚖️ {goal.weightage}% weight</span>
                      </div>
                    </div>
                    {preview !== null && (
                      <div style={{
                        padding: '0.5rem 0.875rem', borderRadius: '0.75rem', textAlign: 'center',
                        background: preview >= 80 ? 'rgba(16,185,129,0.1)' : preview >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${preview >= 80 ? 'rgba(16,185,129,0.3)' : preview >= 60 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: preview >= 80 ? '#10b981' : preview >= 60 ? '#f59e0b' : '#ef4444' }}>
                          {preview}%
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Score Preview</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="label">
                        Actual Achievement {goal.uomType === 'timeline' ? '(Date)' : `(${goal.uomLabel})`}
                      </label>
                      <input
                        type={goal.uomType === 'timeline' ? 'date' : 'number'}
                        className="input" placeholder="Enter actual value"
                        value={actual}
                        onChange={e => handleChange(goal.id, 'actual', e.target.value)}
                        disabled={!window?.isActive}
                      />
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select className="input" value={status}
                        onChange={e => handleChange(goal.id, 'status', e.target.value as GoalStatus)}
                        disabled={!window?.isActive}
                      >
                        <option value="not_started">Not Started</option>
                        <option value="on_track">On Track</option>
                        <option value="at_risk">At Risk</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Notes / Comments</label>
                    <textarea className="input" placeholder="Add context about your progress…"
                      value={notes} onChange={e => handleChange(goal.id, 'notes', e.target.value)}
                      disabled={!window?.isActive} style={{ minHeight: 64 }}
                    />
                  </div>

                  {existing && (
                    <div style={{
                      marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8125rem',
                      background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                      color: 'var(--text-muted)',
                    }}>
                      ✅ Previously saved: Actual={existing.actual}, Score={existing.score}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {window?.isActive && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.5rem' }}>
                {saving ? 'Saving…' : <><CheckCircle size={16} /> Save {selectedQ} Check-in</>}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
