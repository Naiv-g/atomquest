'use client';

import { useApp } from '@/contexts/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { computeScore } from '@/lib/utils';
import { QuarterKey } from '@/lib/types';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];
const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function AdminAnalyticsPage() {
  const { users, goals } = useApp();

  const employees = users.filter(u => u.role === 'employee');

  // Dept achievement bar
  const depts = [...new Set(employees.map(e => e.department))];
  const deptData = depts.map(dept => {
    const deptGoals = goals.filter(g => g.department === dept && g.approvalStatus === 'locked');
    const q1 = deptGoals.filter(g => g.quarterlyAchievements.some(a => a.quarter === 'Q1'));
    const avg = q1.length > 0
      ? Math.round(q1.reduce((s, g) => {
          const a = g.quarterlyAchievements.find(x => x.quarter === 'Q1');
          return s + (a ? computeScore(g.uomType, g.target, a.actual) : 0);
        }, 0) / q1.length)
      : 0;
    return { dept, 'Avg Score': avg, 'Goals': deptGoals.length };
  });

  // Thrust area distribution pie
  const thrustCounts: Record<string, number> = {};
  goals.forEach(g => { thrustCounts[g.thrustArea] = (thrustCounts[g.thrustArea] ?? 0) + 1; });
  const thrustData = Object.entries(thrustCounts).map(([name, value]) => ({ name, value }));

  // UoM breakdown
  const uomCounts = { min: 0, max: 0, timeline: 0, zero: 0 };
  goals.forEach(g => { uomCounts[g.uomType]++; });
  const uomData = [
    { name: 'Higher Better', value: uomCounts.min, color: '#10b981' },
    { name: 'Lower Better', value: uomCounts.max, color: '#f59e0b' },
    { name: 'Timeline', value: uomCounts.timeline, color: '#3b82f6' },
    { name: 'Zero-based', value: uomCounts.zero, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // QoQ trend (org-wide)
  const qoqData = QUARTERS.map(q => {
    const qGoals = goals.filter(g => g.quarterlyAchievements.some(a => a.quarter === q));
    const avg = qGoals.length > 0
      ? Math.round(qGoals.reduce((s, g) => {
          const a = g.quarterlyAchievements.find(x => x.quarter === q);
          return s + (a ? computeScore(g.uomType, g.target, a.actual) : 0);
        }, 0) / qGoals.length)
      : 0;
    return { quarter: q, 'Org Score': avg, 'Goals Tracked': qGoals.length };
  });

  // Status distribution
  const statusCounts = { not_started: 0, on_track: 0, completed: 0, at_risk: 0 };
  goals.forEach(g => { if (g.goalStatus in statusCounts) statusCounts[g.goalStatus as keyof typeof statusCounts]++; });
  const statusData = [
    { name: 'Not Started', value: statusCounts.not_started, color: '#475569' },
    { name: 'On Track', value: statusCounts.on_track, color: '#3b82f6' },
    { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
    { name: 'At Risk', value: statusCounts.at_risk, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Organisation-wide goal achievement trends and distribution insights
        </p>
      </div>

      {/* QoQ Line */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>QoQ Org-wide Achievement Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={qoqData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
            <XAxis dataKey="quarter" stroke="#64748b" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              formatter={(v: unknown) => [`${v}%`]} />
            <Line type="monotone" dataKey="Org Score" stroke="#6366f1" strokeWidth={2.5}
              dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Department Bar */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Achievement by Department (Q1)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="dept" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="Avg Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Thrust Area Pie */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Goal Distribution by Thrust Area</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={thrustData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {thrustData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* UoM Distribution */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>UoM Type Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={uomData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                {uomData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Status */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Goal Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={3}>
                {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
