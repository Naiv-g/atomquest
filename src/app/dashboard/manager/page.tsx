'use client';

import { useApp } from '@/contexts/AppContext';
import { Users, CheckCircle, Clock, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { computeScore, approvalBg, approvalLabel, statusBg, statusLabel } from '@/lib/utils';

export default function ManagerDashboard() {
  const { currentUser, users, goals, activeQuarter } = useApp();
  if (!currentUser) return null;

  const teamMembers = users.filter(u => u.managerId === currentUser.id);
  const teamGoals = goals.filter(g => teamMembers.some(m => m.id === g.employeeId));

  const pendingApprovals = teamGoals.filter(g => g.approvalStatus === 'submitted');
  const approvedGoals = teamGoals.filter(g => g.approvalStatus === 'locked');
  const checkInsCompleted = activeQuarter
    ? approvedGoals.filter(g => g.quarterlyAchievements.some(a => a.quarter === activeQuarter)).length
    : 0;

  // Team progress
  const teamProgress = teamMembers.map(member => {
    const memberGoals = goals.filter(g => g.employeeId === member.id && g.approvalStatus === 'locked');
    const achieved = memberGoals.filter(g => g.quarterlyAchievements.some(a => a.quarter === activeQuarter));
    const avgScore = achieved.length > 0
      ? Math.round(achieved.reduce((sum, g) => {
          const ach = g.quarterlyAchievements.find(a => a.quarter === activeQuarter);
          return sum + (ach ? computeScore(g.uomType, g.target, ach.actual) : 0);
        }, 0) / achieved.length)
      : 0;
    return { ...member, memberGoals: memberGoals.length, achieved: achieved.length, avgScore };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Welcome */}
      <div style={{
        padding: '1.5rem 2rem', borderRadius: '1rem',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Manager Dashboard 👔
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {teamMembers.length} team members · {pendingApprovals.length} pending approvals
          {activeQuarter ? ` · ${activeQuarter} check-in window open` : ''}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Team Members', value: teamMembers.length, icon: Users, color: '#3b82f6' },
          { label: 'Pending Approvals', value: pendingApprovals.length, icon: Clock, color: '#f59e0b', alert: pendingApprovals.length > 0 },
          { label: 'Approved Goals', value: approvedGoals.length, icon: CheckCircle, color: '#10b981' },
          { label: `${activeQuarter ?? 'Q1'} Check-ins`, value: `${checkInsCompleted}/${approvedGoals.length}`, icon: TrendingUp, color: '#6366f1' },
        ].map(({ label, value, icon: Icon, color, alert }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={color} />
                </div>
                {alert && <div className="notif-dot" style={{ position: 'absolute', top: -2, right: -2 }} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertCircle size={18} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.9375rem' }}>
                {pendingApprovals.length} Goal{pendingApprovals.length !== 1 ? 's' : ''} Awaiting Your Approval
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Review and approve or return to employees
              </div>
            </div>
          </div>
          <Link href="/dashboard/manager/approvals" className="btn-primary">
            Review Now <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Team Progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Team Progress</h3>
            <Link href="/dashboard/manager/team" style={{ fontSize: '0.8125rem', color: '#818cf8', textDecoration: 'none' }}>View all →</Link>
          </div>
          {teamProgress.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No team members assigned.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {teamProgress.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8125rem', fontWeight: 700, color: 'white',
                  }}>
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{m.name}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: m.avgScore >= 80 ? '#10b981' : m.avgScore >= 60 ? '#f59e0b' : '#94a3b8' }}>
                        {m.achieved > 0 ? `${m.avgScore}%` : 'No data'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${m.avgScore}%`,
                        background: m.avgScore >= 80 ? '#10b981' : m.avgScore >= 60 ? '#f59e0b' : '#6366f1',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {m.memberGoals} goals · {m.achieved} with check-in
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Link href="/dashboard/manager/approvals" className="btn-primary" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} /> Review Pending Approvals
              </span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/dashboard/manager/checkin" className="btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={15} /> Team Check-in Review
              </span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/dashboard/manager/shared" className="btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={15} /> Push Shared Goal
              </span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/dashboard/manager/analytics" className="btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={15} /> Team Analytics
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Goals */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Recent Team Goals</h3>
          <Link href="/dashboard/manager/team" style={{ fontSize: '0.8125rem', color: '#818cf8', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Goal</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {teamGoals.slice(0, 6).map(goal => {
                const emp = teamMembers.find(m => m.id === goal.employeeId);
                return (
                  <tr key={goal.id}>
                    <td style={{ fontWeight: 500 }}>{emp?.name ?? goal.employeeName}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.title}</td>
                    <td style={{ color: '#818cf8', fontWeight: 600 }}>{goal.weightage}%</td>
                    <td><span className={`badge ${statusBg(goal.goalStatus)}`}>{statusLabel(goal.goalStatus)}</span></td>
                    <td><span className={`badge ${approvalBg(goal.approvalStatus)}`}>{approvalLabel(goal.approvalStatus)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
