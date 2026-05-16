'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { QuarterKey, GoalStatus } from '@/lib/types';
import { computeScore, statusBg, statusLabel, approvalBg, approvalLabel } from '@/lib/utils';

const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function ManagerCheckInPage() {
  const { currentUser, users, goals, addCheckInComment, activeQuarter } = useApp();
  const [selectedQ, setSelectedQ] = useState<QuarterKey>(activeQuarter ?? 'Q1');
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  if (!currentUser) return null;

  const teamMembers = users.filter(u => u.managerId === currentUser.id);
  const teamGoals = goals.filter(g =>
    g.approvalStatus === 'locked' && teamMembers.some(m => m.id === g.employeeId)
  );

  const groupedByMember = teamMembers.map(member => {
    const memberGoals = teamGoals.filter(g => g.employeeId === member.id);
    return { member, goals: memberGoals };
  }).filter(m => m.goals.length > 0);

  const handleComment = (goalId: string) => {
    const comment = comments[goalId];
    if (!comment?.trim()) { toast.error('Comment cannot be empty'); return; }
    addCheckInComment(goalId, selectedQ, comment);
    setComments(c => ({ ...c, [goalId]: '' }));
    toast.success('Check-in comment saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Team Check-in Review</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          View planned vs actual achievements and add structured feedback
        </p>
      </div>

      {/* Quarter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {QUARTERS.map(q => (
          <button key={q} onClick={() => setSelectedQ(q)} style={{
            padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid',
            borderColor: selectedQ === q ? 'rgba(59,130,246,0.5)' : 'var(--border)',
            background: selectedQ === q ? 'rgba(59,130,246,0.1)' : 'var(--surface)',
            color: selectedQ === q ? '#60a5fa' : 'var(--text-secondary)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
          }}>{q}</button>
        ))}
      </div>

      {groupedByMember.length === 0 ? (
        <div className="empty-state">
          <p>No team members with approved goals.</p>
        </div>
      ) : (
        groupedByMember.map(({ member, goals: memberGoals }) => {
          const withAch = memberGoals.filter(g => g.quarterlyAchievements.some(a => a.quarter === selectedQ));
          const completionRate = memberGoals.length > 0 ? Math.round((withAch.length / memberGoals.length) * 100) : 0;

          return (
            <div key={member.id} className="card">
              {/* Member Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white',
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.department} · {memberGoals.length} goals</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: completionRate === 100 ? '#10b981' : '#f59e0b', fontSize: '1.125rem' }}>
                    {completionRate}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedQ} check-in complete</div>
                </div>
              </div>

              {/* Goals Table */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Goal</th>
                      <th>Target</th>
                      <th>{selectedQ} Actual</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberGoals.map(goal => {
                      const ach = goal.quarterlyAchievements.find(a => a.quarter === selectedQ);
                      const score = ach ? computeScore(goal.uomType, goal.target, ach.actual) : null;
                      const existingComment = goal.checkInComments.find(c => c.quarter === selectedQ);

                      return (
                        <>
                          <tr key={goal.id}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{goal.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{goal.uomLabel} · {goal.weightage}% weight</div>
                            </td>
                            <td style={{ fontWeight: 600, color: '#818cf8' }}>{goal.target}</td>
                            <td style={{ fontWeight: ach ? 600 : 400, color: ach ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {ach ? String(ach.actual) : '—'}
                            </td>
                            <td>
                              {score !== null ? (
                                <span style={{ fontWeight: 700, color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
                                  {score}%
                                </span>
                              ) : '—'}
                            </td>
                            <td>
                              {ach ? (
                                <span className={`badge ${statusBg(ach.status)}`}>{statusLabel(ach.status)}</span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not submitted</span>
                              )}
                            </td>
                            <td>
                              <button onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                                className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
                                <MessageSquare size={12} /> Comment
                              </button>
                            </td>
                          </tr>
                          {expandedGoal === goal.id && (
                            <tr>
                              <td colSpan={6} style={{ padding: '0 1rem 1rem' }}>
                                {existingComment && (
                                  <div style={{
                                    padding: '0.625rem 0.875rem', marginBottom: '0.625rem', borderRadius: '0.5rem',
                                    background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                                    fontSize: '0.8125rem', color: 'var(--text-secondary)',
                                  }}>
                                    💬 Previous: &ldquo;{existingComment.comment}&rdquo;
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <textarea className="input" placeholder={`Add ${selectedQ} check-in comment…`}
                                    value={comments[goal.id] ?? ''}
                                    onChange={e => setComments(c => ({ ...c, [goal.id]: e.target.value }))}
                                    style={{ minHeight: 64, flex: 1 }}
                                  />
                                  <button className="btn-primary" onClick={() => handleComment(goal.id)} style={{ alignSelf: 'flex-end' }}>
                                    Save
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
