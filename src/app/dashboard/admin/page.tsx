'use client';

import { useApp } from '@/contexts/AppContext';
import { Users, Target, CheckCircle, BarChart3, TrendingUp, Clock, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { computeScore } from '@/lib/utils';

export default function AdminDashboard() {
  const { users, goals, cycle, escalationRules, allAuditLogs } = useApp();

  const employees = users.filter(u => u.role === 'employee');
  const managers = users.filter(u => u.role === 'manager');
  const allGoals = goals;
  const submittedGoals = goals.filter(g => g.approvalStatus === 'submitted');
  const approvedGoals = goals.filter(g => g.approvalStatus === 'locked');
  const draftGoals = goals.filter(g => g.approvalStatus === 'draft');

  const completionRate = employees.length > 0
    ? Math.round((employees.filter(e => goals.some(g => g.employeeId === e.id && g.approvalStatus === 'locked')).length / employees.length) * 100)
    : 0;

  // Department breakdown
  const depts = [...new Set(employees.map(e => e.department))];
  const deptStats = depts.map(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const deptGoals = goals.filter(g => g.department === dept);
    const approved = deptGoals.filter(g => g.approvalStatus === 'locked');
    const q1Goals = approved.filter(g => g.quarterlyAchievements.some(a => a.quarter === 'Q1'));
    const avgScore = q1Goals.length > 0
      ? Math.round(q1Goals.reduce((sum, g) => {
          const ach = g.quarterlyAchievements.find(a => a.quarter === 'Q1');
          return sum + (ach ? computeScore(g.uomType, g.target, ach.actual) : 0);
        }, 0) / q1Goals.length)
      : 0;
    return { dept, emps: deptEmps.length, goals: deptGoals.length, approved: approved.length, avgScore };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem', borderRadius: '1rem',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.06) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin / HR Dashboard 🛡️</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {employees.length} employees · {allGoals.length} total goals · Cycle {cycle.year} Active
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Employees', value: employees.length, icon: Users, color: '#3b82f6' },
          { label: 'Goals Approved', value: approvedGoals.length, icon: CheckCircle, color: '#10b981' },
          { label: 'Pending Approval', value: submittedGoals.length, icon: Clock, color: '#f59e0b', alert: submittedGoals.length > 0 },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: completionRate >= 80 ? '#10b981' : '#f59e0b' },
        ].map(({ label, value, icon: Icon, color, alert }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Dashboard */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Completion Dashboard — By Department</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {deptStats.map(d => {
            const pct = d.goals > 0 ? Math.round((d.approved / d.goals) * 100) : 0;
            return (
              <div key={d.dept} style={{
                padding: '1rem', borderRadius: '0.75rem',
                background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.5)',
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{d.dept}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
                  {d.emps} employees · {d.goals} goals
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Goal Approval</span>
                  <span style={{ fontWeight: 700, color: pct >= 80 ? '#10b981' : '#f59e0b', fontSize: '0.875rem' }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                  }} />
                </div>
                {d.avgScore > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Avg Q1 Score: <span style={{ color: '#818cf8', fontWeight: 600 }}>{d.avgScore}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { href: '/dashboard/admin/reports', label: 'Achievement Reports', desc: 'Export CSV/Excel', icon: BarChart3, color: '#10b981' },
          { href: '/dashboard/admin/audit', label: 'Audit Trail', desc: `${allAuditLogs.length} log entries`, icon: Target, color: '#6366f1' },
          { href: '/dashboard/admin/escalations', label: 'Escalations', desc: `${escalationRules.length} rules active`, icon: Zap, color: '#f59e0b' },
          { href: '/dashboard/admin/cycles', label: 'Cycle Config', desc: 'Manage check-in windows', icon: Clock, color: '#3b82f6' },
          { href: '/dashboard/admin/employees', label: 'All Employees', desc: `${employees.length} employees`, icon: Users, color: '#8b5cf6' },
          { href: '/dashboard/admin/analytics', label: 'Analytics', desc: 'Org-level insights', icon: TrendingUp, color: '#ec4899' },
        ].map(({ href, label, desc, icon: Icon, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="card glass-hover" style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
              <ArrowRight size={14} color="#64748b" style={{ marginLeft: 'auto' }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
