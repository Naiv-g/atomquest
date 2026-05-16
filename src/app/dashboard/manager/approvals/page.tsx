'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { CheckCircle, X, Edit3, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { approvalBg, approvalLabel, formatDate } from '@/lib/utils';
import { Goal } from '@/lib/types';

export default function ApprovalsPage() {
  const { currentUser, users, goals, approveGoal, returnGoal, updateGoal } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState<Record<string, string>>({});
  const [inlineEdits, setInlineEdits] = useState<Record<string, { target?: string; weightage?: number }>>({});
  const [showReturn, setShowReturn] = useState<Record<string, boolean>>({});

  if (!currentUser) return null;

  const teamMembers = users.filter(u => u.managerId === currentUser.id);
  const pending = goals.filter(g =>
    g.approvalStatus === 'submitted' &&
    teamMembers.some(m => m.id === g.employeeId)
  );

  const handleApprove = (goal: Goal) => {
    const edits = inlineEdits[goal.id];
    if (edits) {
      updateGoal(goal.id, {
        target: edits.target !== undefined ? (goal.uomType === 'timeline' ? edits.target : Number(edits.target)) : goal.target,
        weightage: edits.weightage ?? goal.weightage,
      }, currentUser);
    }
    approveGoal(goal.id);
    toast.success(`Goal approved: ${goal.title}`);
  };

  const handleReturn = (goal: Goal) => {
    const notes = returnNotes[goal.id];
    if (!notes?.trim()) { toast.error('Please add a note explaining why the goal is being returned.'); return; }
    returnGoal(goal.id, notes);
    setShowReturn(s => ({ ...s, [goal.id]: false }));
    toast.success('Goal returned for rework.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Goal Approvals</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Review, edit inline, and approve or return employee goals
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>All Caught Up!</h3>
          <p style={{ fontSize: '0.875rem' }}>No pending goal approvals at the moment.</p>
        </div>
      ) : (
        <>
          <div style={{
            padding: '0.875rem 1rem', borderRadius: '0.75rem', display: 'flex', gap: '0.625rem',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <span style={{ fontSize: '0.875rem', color: '#fbbf24', fontWeight: 600 }}>
              ⚠️ {pending.length} goal{pending.length !== 1 ? 's' : ''} awaiting your review.
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              You can edit targets and weightage inline before approving.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {pending.map(goal => {
              const emp = teamMembers.find(m => m.id === goal.employeeId);
              const isExpanded = expanded === goal.id;
              const edits = inlineEdits[goal.id] ?? {};

              return (
                <div key={goal.id} className="card" style={{ transition: 'all 0.2s' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                          {emp?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{emp?.name ?? goal.employeeName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{goal.department}</span>
                        <span className={`badge ${approvalBg(goal.approvalStatus)}`}>{approvalLabel(goal.approvalStatus)}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '1rem' }}>{goal.title}</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{goal.description}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <span>🎯 {goal.thrustArea}</span>
                        <span>📊 {goal.uomLabel}</span>
                        <span>⚖️ {goal.weightage}%</span>
                        <span>📅 Submitted: {formatDate(goal.submittedAt ?? '')}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpanded(isExpanded ? null : goal.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem',
                    }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {/* Expanded: Inline Edit */}
                  {isExpanded && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{
                        padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '0.75rem',
                        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                        fontSize: '0.8125rem', color: '#818cf8', display: 'flex', gap: '0.5rem',
                      }}>
                        <Edit3 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                        You can edit Target and Weightage below before approving.
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="label">Target (editable)</label>
                          <input type={goal.uomType === 'timeline' ? 'date' : 'number'} className="input"
                            defaultValue={String(goal.target)}
                            onChange={e => setInlineEdits(ie => ({ ...ie, [goal.id]: { ...ie[goal.id], target: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <label className="label">Weightage (editable)</label>
                          <input type="number" className="input" min={10} max={100} defaultValue={goal.weightage}
                            onChange={e => setInlineEdits(ie => ({ ...ie, [goal.id]: { ...ie[goal.id], weightage: Number(e.target.value) } }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Return Note */}
                  {showReturn[goal.id] && (
                    <div style={{ marginTop: '0.875rem' }}>
                      <label className="label">Reason for returning (required)</label>
                      <textarea className="input" placeholder="Explain what needs to be changed…"
                        value={returnNotes[goal.id] ?? ''}
                        onChange={e => setReturnNotes(n => ({ ...n, [goal.id]: e.target.value }))}
                        style={{ minHeight: 72 }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn-success" onClick={() => handleApprove(goal)}>
                      <CheckCircle size={15} /> Approve & Lock
                    </button>
                    {!showReturn[goal.id] ? (
                      <button className="btn-danger" onClick={() => setShowReturn(s => ({ ...s, [goal.id]: true }))}>
                        <X size={15} /> Return for Rework
                      </button>
                    ) : (
                      <>
                        <button className="btn-danger" onClick={() => handleReturn(goal)}>
                          <X size={15} /> Confirm Return
                        </button>
                        <button className="btn-secondary" onClick={() => setShowReturn(s => ({ ...s, [goal.id]: false }))}>
                          Cancel
                        </button>
                      </>
                    )}
                    <button className="btn-secondary" onClick={() => setExpanded(isExpanded ? null : goal.id)}>
                      <Edit3 size={14} /> {isExpanded ? 'Collapse' : 'Edit Inline'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
