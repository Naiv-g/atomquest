'use client';

import { useApp } from '@/contexts/AppContext';
import { computeScore, approvalBg, approvalLabel, statusBg, statusLabel } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function ManagerAnalyticsPage() {
  const { currentUser, users, goals } = useApp();
  if (!currentUser) return null;

  const teamMembers = users.filter(u => u.managerId === currentUser.id);
  const teamGoals = goals.filter(g => g.approvalStatus === 'locked' && teamMembers.some(m => m.id === g.employeeId));

  // Per-member score chart
  const memberScores = teamMembers.map(m => {
    const mg = teamGoals.filter(g => g.employeeId === m.id);
    const q1 = mg.filter(g => g.quarterlyAchievements.some(a => a.quarter === 'Q1'));
    const avg = q1.length > 0
      ? Math.round(q1.reduce((s, g) => {
          const a = g.quarterlyAchievements.find(x => x.quarter === 'Q1');
          return s + (a ? computeScore(g.uomType, g.target, a.actual) : 0);
        }, 0) / q1.length)
      : 0;
    return { name: m.name.split(' ')[0], 'Q1 Score': avg, goals: mg.length };
  });

  // Thrust area summary
  const thrustMap: Record<string, { total: number; scored: number; totalScore: number }> = {};
  teamGoals.forEach(g => {
    if (!thrustMap[g.thrustArea]) thrustMap[g.thrustArea] = { total: 0, scored: 0, totalScore: 0 };
    thrustMap[g.thrustArea].total++;
    const a = g.quarterlyAchievements.find(x => x.quarter === 'Q1');
    if (a) {
      thrustMap[g.thrustArea].scored++;
      thrustMap[g.thrustArea].totalScore += computeScore(g.uomType, g.target, a.actual);
    }
  });
  const thrustData = Object.entries(thrustMap).map(([name, v]) => ({
    name: name.split(' ').slice(0, 2).join(' '),
    'Avg Score': v.scored > 0 ? Math.round(v.totalScore / v.scored) : 0,
    Goals: v.total,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Team Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Performance insights for your team
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Q1 Score by Team Member</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={memberScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="Q1 Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Score by Thrust Area</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={thrustData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={90} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="Avg Score" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap-style check-in completion */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Check-in Completion Heatmap</h3>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(4, 1fr)`, gap: '4px' }}>
          <div />
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
            <div key={q} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.5rem' }}>{q}</div>
          ))}
          {teamMembers.map(m => {
            const mg = goals.filter(g => g.employeeId === m.id && g.approvalStatus === 'locked');
            return (
              <>
                <div key={`name-${m.id}`} style={{ fontSize: '0.8125rem', fontWeight: 500, padding: '0.625rem 0', display: 'flex', alignItems: 'center' }}>
                  {m.name.split(' ')[0]}
                </div>
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => {
                  const done = mg.some(g => g.quarterlyAchievements.some(a => a.quarter === q));
                  return (
                    <div key={`${m.id}-${q}`} style={{
                      height: 40, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 600,
                      background: done ? 'rgba(16,185,129,0.2)' : 'rgba(51,65,85,0.3)',
                      color: done ? '#10b981' : '#64748b',
                      border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(51,65,85,0.4)'}`,
                    }}>
                      {done ? '✓' : '—'}
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}
