'use client';

import { useApp } from '@/contexts/AppContext';
import { computeScore } from '@/lib/utils';
import { QuarterKey } from '@/lib/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';

const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function EmployeeProgressPage() {
  const { currentUser, goals } = useApp();
  if (!currentUser) return null;

  const myGoals = goals.filter(g => g.employeeId === currentUser.id && g.approvalStatus === 'locked');

  // Per-quarter weighted scores
  const quarterScores = QUARTERS.map(q => {
    const goalsWithAch = myGoals.filter(g => g.quarterlyAchievements.some(a => a.quarter === q));
    if (!goalsWithAch.length) return { quarter: q, score: 0, goals: 0 };
    const score = goalsWithAch.reduce((sum, g) => {
      const ach = g.quarterlyAchievements.find(a => a.quarter === q);
      if (!ach) return sum;
      return sum + computeScore(g.uomType, g.target, ach.actual) * (g.weightage / 100);
    }, 0);
    return { quarter: q, score: Math.round(score), goals: goalsWithAch.length };
  });

  // Radar data (per thrust area)
  const thrustData = [...new Set(myGoals.map(g => g.thrustArea))].map(area => {
    const areaGoals = myGoals.filter(g => g.thrustArea === area);
    const scored = areaGoals.filter(g => g.quarterlyAchievements.length > 0);
    const avg = scored.length > 0
      ? Math.round(scored.reduce((sum, g) => {
          const ach = g.quarterlyAchievements[g.quarterlyAchievements.length - 1];
          return sum + computeScore(g.uomType, g.target, ach.actual);
        }, 0) / scored.length)
      : 0;
    return { area: area.split(' ').slice(0, 2).join(' '), score: avg };
  });

  // Goal-level detail
  const goalDetail = myGoals.map(g => ({
    name: g.title.slice(0, 20) + '…',
    weight: g.weightage,
    q1: g.quarterlyAchievements.find(a => a.quarter === 'Q1')
      ? computeScore(g.uomType, g.target, g.quarterlyAchievements.find(a => a.quarter === 'Q1')!.actual) : 0,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>My Progress</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Quarter-on-quarter achievement tracking
        </p>
      </div>

      {myGoals.length === 0 ? (
        <div className="empty-state">
          <p>No approved goals to show progress for.</p>
        </div>
      ) : (
        <>
          {/* QoQ Score Chart */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Quarter-on-Quarter Achievement Score</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={quarterScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                <XAxis dataKey="quarter" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                  formatter={(v: number) => [`${v}%`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 5, fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Radar */}
            {thrustData.length >= 3 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Performance by Thrust Area</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={thrustData}>
                    <PolarGrid stroke="rgba(51,65,85,0.5)" />
                    <PolarAngleAxis dataKey="area" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Goal Detail Bar */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Q1 Score by Goal</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={goalDetail} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={100} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                    formatter={(v: number) => [`${v}%`, 'Score']}
                  />
                  <Bar dataKey="q1" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Achievement Detail</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Weight</th>
                    {QUARTERS.map(q => <th key={q}>{q} Actual</th>)}
                    {QUARTERS.map(q => <th key={q}>{q} Score</th>)}
                  </tr>
                </thead>
                <tbody>
                  {myGoals.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 500 }}>{g.title}</td>
                      <td style={{ color: '#818cf8', fontWeight: 600 }}>{g.target}</td>
                      <td>{g.weightage}%</td>
                      {QUARTERS.map(q => {
                        const a = g.quarterlyAchievements.find(x => x.quarter === q);
                        return <td key={q} style={{ color: 'var(--text-secondary)' }}>{a ? String(a.actual) : '—'}</td>;
                      })}
                      {QUARTERS.map(q => {
                        const a = g.quarterlyAchievements.find(x => x.quarter === q);
                        const s = a ? computeScore(g.uomType, g.target, a.actual) : null;
                        return (
                          <td key={q}>
                            {s !== null ? (
                              <span style={{ fontWeight: 700, color: s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444' }}>{s}%</span>
                            ) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
