'use client';

import { useApp } from '@/contexts/AppContext';
import { Target, CheckCircle, Clock, TrendingUp, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { approvalBg, approvalLabel, statusBg, statusLabel, computeScore, formatDate } from '@/lib/utils';
import GoalPulse from '@/components/goals/GoalPulse';

export default function EmployeeDashboard() {
  const { currentUser, goals, cycle, activeQuarter } = useApp();
  if (!currentUser) return null;

  const myGoals = goals.filter(g => g.employeeId === currentUser.id);
  const totalWeight = myGoals.reduce((s, g) => s + g.weightage, 0);
  const approvedGoals = myGoals.filter(g => g.approvalStatus === 'locked');
  const pendingGoals = myGoals.filter(g => g.approvalStatus === 'submitted');
  const draftGoals = myGoals.filter(g => g.approvalStatus === 'draft' || g.approvalStatus === 'returned');

  // Compute overall progress score
  const q1Achievements = myGoals.flatMap(g => g.quarterlyAchievements.filter(a => a.quarter === 'Q1'));
  const overallScore = approvedGoals.length > 0 && q1Achievements.length > 0
    ? Math.round(approvedGoals.reduce((sum, g) => {
        const ach = g.quarterlyAchievements.find(a => a.quarter === 'Q1');
        if (!ach) return sum;
        return sum + computeScore(g.uomType, g.target, ach.actual) * (g.weightage / 100);
      }, 0))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Welcome Banner */}
      <div style={{
        padding: '1.5rem 2rem', borderRadius: '1rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(56,189,248,0.06) 100%)',
        border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Welcome back, {currentUser.name.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {myGoals.length === 0
            ? "You haven't set any goals yet. Let's get started!"
            : `You have ${myGoals.length} goal${myGoals.length !== 1 ? 's' : ''} this cycle. ${approvedGoals.length} approved, ${draftGoals.length} pending action.`}
        </p>
        {activeQuarter && (
          <div style={{
            marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.25rem 0.75rem', borderRadius: '999px',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            fontSize: '0.75rem', fontWeight: 600, color: '#34d399',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            {activeQuarter} Check-in Window is Open
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Goals', value: myGoals.length, sub: `of 8 max`, icon: Target, color: '#6366f1' },
          { label: 'Approved & Locked', value: approvedGoals.length, sub: 'ready for check-in', icon: CheckCircle, color: '#10b981' },
          { label: 'Pending Action', value: draftGoals.length, sub: 'draft or returned', icon: Clock, color: '#f59e0b' },
          { label: 'Weightage Set', value: `${totalWeight}%`, sub: totalWeight === 100 ? '✓ Complete' : `${100 - totalWeight}% remaining`, icon: TrendingUp, color: totalWeight === 100 ? '#10b981' : '#ef4444' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Goal Pulse */}
        <GoalPulse goals={myGoals} overallScore={overallScore} />

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Link href="/dashboard/employee/goals/create" className="btn-primary" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Create New Goal
              </span>
              <ArrowRight size={14} />
            </Link>
            {activeQuarter && approvedGoals.length > 0 && (
              <Link href="/dashboard/employee/checkin" className="btn-success" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Log {activeQuarter} Achievement
                </span>
                <ArrowRight size={14} />
              </Link>
            )}
            <Link href="/dashboard/employee/goals" className="btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={16} /> View All Goals
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Alerts */}
          {draftGoals.length > 0 && (
            <div style={{
              marginTop: '1rem', padding: '0.875rem', borderRadius: '0.75rem',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', gap: '0.625rem',
            }}>
              <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: '0.8125rem', color: '#fbbf24' }}>
                <strong>Action needed:</strong> You have {draftGoals.length} goal{draftGoals.length !== 1 ? 's' : ''} in draft/returned status. Submit them for approval.
              </div>
            </div>
          )}
          {pendingGoals.length > 0 && (
            <div style={{
              marginTop: '0.625rem', padding: '0.875rem', borderRadius: '0.75rem',
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', gap: '0.625rem',
            }}>
              <Clock size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: '0.8125rem', color: '#60a5fa' }}>
                <strong>{pendingGoals.length} goal{pendingGoals.length !== 1 ? 's' : ''}</strong> awaiting manager approval.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goals List */}
      {myGoals.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>My Goals</h3>
            <Link href="/dashboard/employee/goals" style={{ fontSize: '0.8125rem', color: '#818cf8', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Thrust Area</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {myGoals.slice(0, 5).map(goal => (
                  <tr key={goal.id}>
                    <td>
                      <Link href={`/dashboard/employee/goals/${goal.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        {goal.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{goal.uomLabel}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{goal.thrustArea}</td>
                    <td style={{ fontWeight: 700, color: '#818cf8' }}>{goal.weightage}%</td>
                    <td><span className={`badge ${statusBg(goal.goalStatus)}`}>{statusLabel(goal.goalStatus)}</span></td>
                    <td><span className={`badge ${approvalBg(goal.approvalStatus)}`}>{approvalLabel(goal.approvalStatus)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
