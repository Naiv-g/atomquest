'use client';

import { useApp } from '@/contexts/AppContext';
import { Users, Lock, Unlock, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { approvalBg, approvalLabel } from '@/lib/utils';

export default function AdminEmployeesPage() {
  const { users, goals, unlockGoal } = useApp();
  const [search, setSearch] = useState('');
  const [unlockReason, setUnlockReason] = useState<Record<string, string>>({});
  const [showUnlock, setShowUnlock] = useState<Record<string, boolean>>({});

  const employees = users.filter(u => u.role === 'employee' && u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>All Employees</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Manage employees and unlock goals when needed
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" className="input" placeholder="Search employees…"
          value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {employees.map(emp => {
          const empGoals = goals.filter(g => g.employeeId === emp.id);
          const lockedGoals = empGoals.filter(g => g.approvalStatus === 'locked');

          return (
            <div key={emp.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'white', fontSize: '0.9375rem',
                  }}>
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {emp.email} · {emp.department}
                      {emp.managerName && ` · Manager: ${emp.managerName}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  <span>{empGoals.length} goals</span>
                  <span>·</span>
                  <span style={{ color: '#10b981' }}>{lockedGoals.length} approved</span>
                </div>
              </div>

              {/* Goals with unlock */}
              {lockedGoals.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Locked Goals (Admin can unlock)
                  </div>
                  {lockedGoals.map(goal => (
                    <div key={goal.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
                      background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)',
                    }}>
                      <div>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{goal.title}</span>
                        <span style={{ marginLeft: '0.625rem' }} className={`badge ${approvalBg(goal.approvalStatus)}`}>
                          <Lock size={10} /> {approvalLabel(goal.approvalStatus)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {showUnlock[goal.id] ? (
                          <>
                            <input type="text" className="input" placeholder="Reason for unlock…"
                              value={unlockReason[goal.id] ?? ''}
                              onChange={e => setUnlockReason(r => ({ ...r, [goal.id]: e.target.value }))}
                              style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem', maxWidth: 200 }}
                            />
                            <button className="btn-success" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                              onClick={() => {
                                if (!unlockReason[goal.id]?.trim()) { toast.error('Reason required'); return; }
                                unlockGoal(goal.id, unlockReason[goal.id]);
                                setShowUnlock(s => ({ ...s, [goal.id]: false }));
                                toast.success('Goal unlocked!');
                              }}>
                              <Unlock size={12} /> Confirm
                            </button>
                            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                              onClick={() => setShowUnlock(s => ({ ...s, [goal.id]: false }))}>Cancel</button>
                          </>
                        ) : (
                          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                            onClick={() => setShowUnlock(s => ({ ...s, [goal.id]: true }))}>
                            <Unlock size={12} /> Unlock
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
