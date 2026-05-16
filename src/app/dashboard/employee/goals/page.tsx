'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Plus, Target, Trash2, Send, Edit3, AlertCircle, Info, ArrowLeft,
  CheckCircle, Clock,
} from 'lucide-react';
import { approvalBg, approvalLabel, statusBg, statusLabel, formatDate } from '@/lib/utils';
import { Goal } from '@/lib/types';

export default function GoalsPage() {
  const { currentUser, goals, submitGoal, deleteGoal } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');

  if (!currentUser) return null;
  const myGoals = goals.filter(g => g.employeeId === currentUser.id);
  const totalWeight = myGoals.filter(g => g.approvalStatus !== 'returned').reduce((s, g) => s + g.weightage, 0);

  const filtered = filter === 'all' ? myGoals : myGoals.filter(g => g.approvalStatus === filter);

  const canSubmit = (goal: Goal) =>
    goal.approvalStatus === 'draft' || goal.approvalStatus === 'returned';

  const handleSubmitAll = () => {
    const submittable = myGoals.filter(canSubmit);
    if (submittable.length === 0) { toast.error('No goals to submit.'); return; }
    if (totalWeight !== 100) {
      toast.error(`Total weightage must be 100%. Currently ${totalWeight}%.`);
      return;
    }
    submittable.forEach(g => submitGoal(g.id));
    toast.success(`${submittable.length} goal(s) submitted for approval!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>My Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {myGoals.length}/8 goals · {totalWeight}% total weightage
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          {myGoals.filter(canSubmit).length > 0 && (
            <button className="btn-success" onClick={handleSubmitAll}>
              <Send size={15} /> Submit for Approval
            </button>
          )}
          {myGoals.length < 8 && (
            <Link href="/dashboard/employee/goals/create" className="btn-primary">
              <Plus size={15} /> Add Goal
            </Link>
          )}
        </div>
      </div>

      {/* Weightage Alert */}
      {myGoals.length > 0 && totalWeight !== 100 && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '0.75rem', display: 'flex', gap: '0.625rem',
          background: totalWeight > 100 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${totalWeight > 100 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
        }}>
          <AlertCircle size={16} color={totalWeight > 100 ? '#ef4444' : '#f59e0b'} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: '0.8125rem', color: totalWeight > 100 ? '#f87171' : '#fbbf24' }}>
            Total weightage is <strong>{totalWeight}%</strong>. It must equal exactly <strong>100%</strong> before submission.
            {totalWeight < 100 ? ` You need ${100 - totalWeight}% more.` : ` Reduce by ${totalWeight - 100}%.`}
          </span>
        </div>
      )}

      {/* Weightage Bar */}
      {myGoals.length > 0 && (
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Weightage Distribution</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: totalWeight === 100 ? '#10b981' : '#f59e0b' }}>
              {totalWeight}% / 100%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{
              width: `${Math.min(totalWeight, 100)}%`,
              background: totalWeight === 100 ? '#10b981' : totalWeight > 100 ? '#ef4444' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {myGoals.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.75rem', color: 'var(--text-muted)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', opacity: 0.7 }} />
                {g.title.slice(0, 20)}… ({g.weightage}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['all', 'draft', 'submitted', 'locked', 'returned'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.375rem 0.875rem', borderRadius: '999px', border: '1px solid',
            borderColor: filter === f ? 'rgba(99,102,241,0.5)' : 'var(--border)',
            background: filter === f ? 'rgba(99,102,241,0.1)' : 'transparent',
            color: filter === f ? '#818cf8' : 'var(--text-muted)',
            fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: '0.375rem', opacity: 0.7 }}>
              ({f === 'all' ? myGoals.length : myGoals.filter(g => g.approvalStatus === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Target size={40} color="#334155" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No goals found</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {myGoals.length === 0 ? 'Start by creating your first goal.' : 'No goals match this filter.'}
          </p>
          {myGoals.length === 0 && (
            <Link href="/dashboard/employee/goals/create" className="btn-primary">
              <Plus size={15} /> Create First Goal
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map(goal => (
            <div key={goal.id} className="card glass-hover" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {/* Left */}
              <div style={{
                width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Target size={20} color="#818cf8" />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                      <Link href={`/dashboard/employee/goals/${goal.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {goal.title}
                      </Link>
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {goal.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <span>🎯 {goal.thrustArea}</span>
                      <span>📊 {goal.uomLabel}</span>
                      <span>⚖️ {goal.weightage}% weight</span>
                      <span>🎯 Target: {goal.target}</span>
                      {goal.createdAt && <span>📅 {formatDate(goal.createdAt)}</span>}
                    </div>
                    {goal.managerNotes && (
                      <div style={{
                        marginTop: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                        fontSize: '0.8125rem', color: '#fbbf24',
                      }}>
                        💬 Manager note: {goal.managerNotes}
                      </div>
                    )}
                  </div>

                  {/* Badges & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <span className={`badge ${approvalBg(goal.approvalStatus)}`}>{approvalLabel(goal.approvalStatus)}</span>
                    <span className={`badge ${statusBg(goal.goalStatus)}`}>{statusLabel(goal.goalStatus)}</span>
                  </div>
                </div>

                {/* Actions Row */}
                {(canSubmit(goal) || goal.approvalStatus === 'draft') && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <Link href={`/dashboard/employee/goals/${goal.id}/edit`} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                      <Edit3 size={13} /> Edit
                    </Link>
                    <button onClick={() => {
                      if (goal.weightage < 10) { toast.error('Minimum weightage is 10%'); return; }
                      submitGoal(goal.id);
                      toast.success('Goal submitted for approval!');
                    }} className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                      <Send size={13} /> Submit
                    </button>
                    <button onClick={() => {
                      if (confirm('Delete this goal?')) { deleteGoal(goal.id); toast.success('Goal deleted.'); }
                    }} className="btn-danger" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
