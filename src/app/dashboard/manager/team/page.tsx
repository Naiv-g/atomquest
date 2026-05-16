'use client';

import { useApp } from '@/contexts/AppContext';
import { computeScore, approvalBg, approvalLabel, statusBg, statusLabel } from '@/lib/utils';
import Link from 'next/link';
import { Users, Search } from 'lucide-react';
import { useState } from 'react';

export default function ManagerTeamPage() {
  const { currentUser, users, goals, activeQuarter } = useApp();
  const [search, setSearch] = useState('');

  if (!currentUser) return null;
  const teamMembers = users.filter(u => u.managerId === currentUser.id);
  const teamGoals = goals.filter(g => teamMembers.some(m => m.id === g.employeeId));
  const filtered = teamGoals.filter(g =>
    g.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Team Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {teamMembers.length} team members · {teamGoals.length} total goals
          </p>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" className="input" placeholder="Search by employee or goal…"
          value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
      </div>

      {/* Member Cards */}
      {teamMembers.map(member => {
        const memberGoals = filtered.filter(g => g.employeeId === member.id);
        if (memberGoals.length === 0 && search) return null;
        const allMemberGoals = teamGoals.filter(g => g.employeeId === member.id);

        return (
          <div key={member.id} className="card">
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white',
              }}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{member.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {member.department} · {allMemberGoals.length} goals
                </div>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Thrust Area</th>
                    <th>Weight</th>
                    <th>Target</th>
                    {activeQuarter && <th>{activeQuarter} Actual</th>}
                    {activeQuarter && <th>Score</th>}
                    <th>Status</th>
                    <th>Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {(search ? memberGoals : allMemberGoals).map(goal => {
                    const ach = activeQuarter ? goal.quarterlyAchievements.find(a => a.quarter === activeQuarter) : null;
                    const score = ach ? computeScore(goal.uomType, goal.target, ach.actual) : null;
                    return (
                      <tr key={goal.id}>
                        <td style={{ fontWeight: 500 }}>{goal.title}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{goal.thrustArea}</td>
                        <td style={{ fontWeight: 700, color: '#818cf8' }}>{goal.weightage}%</td>
                        <td>{goal.target}</td>
                        {activeQuarter && <td style={{ color: ach ? 'var(--text-primary)' : 'var(--text-muted)' }}>{ach ? String(ach.actual) : '—'}</td>}
                        {activeQuarter && (
                          <td>
                            {score !== null
                              ? <span style={{ fontWeight: 700, color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }}>{score}%</span>
                              : '—'}
                          </td>
                        )}
                        <td><span className={`badge ${statusBg(goal.goalStatus)}`}>{statusLabel(goal.goalStatus)}</span></td>
                        <td><span className={`badge ${approvalBg(goal.approvalStatus)}`}>{approvalLabel(goal.approvalStatus)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
