'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Lock, Edit3, Send, Target } from 'lucide-react';
import { approvalBg, approvalLabel, statusBg, statusLabel, computeScore, formatDate, formatDateTime, uomLabel } from '@/lib/utils';
import { QuarterKey } from '@/lib/types';

const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { goals, submitGoal, currentUser } = useApp();

  const goal = goals.find(g => g.id === id);

  if (!goal) {
    return (
      <div className="empty-state">
        <Target size={40} color="#334155" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Goal not found</h3>
        <Link href="/dashboard/employee/goals" className="btn-secondary" style={{ marginTop: '1rem' }}>Back to Goals</Link>
      </div>
    );
  }

  const isLocked = goal.approvalStatus === 'locked';
  const canEdit = goal.approvalStatus === 'draft' || goal.approvalStatus === 'returned';
  const canSubmit = canEdit;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }} className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dashboard/employee/goals" className="btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>{goal.title}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
            <span className={`badge ${approvalBg(goal.approvalStatus)}`}>{approvalLabel(goal.approvalStatus)}</span>
            <span className={`badge ${statusBg(goal.goalStatus)}`}>{statusLabel(goal.goalStatus)}</span>
            {isLocked && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}><Lock size={11} /> Locked</span>}
            {goal.isShared && <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>🔗 Shared Goal</span>}
          </div>
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href={`/dashboard/employee/goals/${id}/edit`} className="btn-secondary">
              <Edit3 size={14} /> Edit
            </Link>
            <button className="btn-primary" onClick={() => submitGoal(goal.id)}>
              <Send size={14} /> Submit
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Thrust Area', value: goal.thrustArea },
              { label: 'Description', value: goal.description || '—' },
              { label: 'Unit of Measurement', value: uomLabel(goal.uomType) },
              { label: 'UoM Label', value: goal.uomLabel },
              { label: 'Target', value: String(goal.target) },
              { label: 'Weightage', value: `${goal.weightage}%` },
              { label: 'Created', value: formatDate(goal.createdAt) },
              { label: 'Submitted', value: goal.submittedAt ? formatDate(goal.submittedAt) : '—' },
              { label: 'Approved', value: goal.approvedAt ? formatDate(goal.approvedAt) : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quarterly Achievements */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quarterly Achievements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {QUARTERS.map(q => {
              const ach = goal.quarterlyAchievements.find(a => a.quarter === q);
              const score = ach ? computeScore(goal.uomType, goal.target, ach.actual) : null;
              return (
                <div key={q} style={{
                  padding: '0.75rem', borderRadius: '0.75rem',
                  background: ach ? 'rgba(99,102,241,0.06)' : 'rgba(30,41,59,0.4)',
                  border: `1px solid ${ach ? 'rgba(99,102,241,0.15)' : 'rgba(51,65,85,0.4)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{q}</span>
                    {score !== null && (
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
                        {score}%
                      </span>
                    )}
                  </div>
                  {ach ? (
                    <div style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <div>Actual: <strong>{String(ach.actual)}</strong> vs Target: <strong>{goal.target}</strong></div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span className={`badge ${statusBg(ach.status)}`} style={{ fontSize: '0.7rem' }}>{statusLabel(ach.status)}</span>
                      </div>
                      {ach.notes && <div style={{ color: 'var(--text-muted)', marginTop: '0.375rem', fontStyle: 'italic' }}>&ldquo;{ach.notes}&rdquo;</div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Not submitted yet</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manager Comments */}
      {goal.checkInComments.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manager Check-in Comments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {goal.checkInComments.map(c => (
              <div key={c.id} style={{
                padding: '0.875rem', borderRadius: '0.75rem',
                background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 600 }}>{c.managerName}</span>
                  <span style={{ color: '#818cf8' }}>{c.quarter}</span>
                  <span style={{ color: 'var(--text-muted)' }}>· {formatDateTime(c.createdAt)}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manager Notes */}
      {goal.managerNotes && (
        <div style={{
          padding: '1rem', borderRadius: '0.875rem', marginBottom: '1.5rem',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.375rem' }}>Manager Note</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{goal.managerNotes}</p>
        </div>
      )}

      {/* Audit Log */}
      {goal.auditLog.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Log ({goal.auditLog.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {goal.auditLog.map(log => (
              <div key={log.id} style={{
                display: 'flex', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
                background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(51,65,85,0.4)', fontSize: '0.8125rem',
              }}>
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDateTime(log.timestamp)}</span>
                <span style={{ color: '#818cf8', fontWeight: 600 }}>{log.userName}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>
                {log.field && <span style={{ color: 'var(--text-muted)' }}>· {log.field}: {log.oldValue} → {log.newValue}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
