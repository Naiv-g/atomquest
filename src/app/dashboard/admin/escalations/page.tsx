'use client';

import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { AlertTriangle, Toggle3Left, Save } from 'lucide-react';
import { EscalationRule } from '@/lib/types';

const TRIGGER_LABELS: Record<string, string> = {
  no_submission: '📋 Employee has not submitted goals',
  no_approval: '⏳ Manager has not approved goals within N days',
  no_checkin: '📊 Quarterly check-in not completed within window',
};

export default function EscalationsPage() {
  const { escalationRules, escalationLogs, updateEscalationRule } = useApp();

  const handleUpdate = (rule: EscalationRule) => {
    updateEscalationRule(rule);
    toast.success(`Rule "${rule.name}" updated!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Escalation Rules</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Configure rule-based escalation triggers for automated notifications
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {escalationRules.map(rule => (
          <div key={rule.id} className="card" style={{
            borderColor: rule.isActive ? 'rgba(245,158,11,0.25)' : 'var(--border)',
            background: rule.isActive ? 'rgba(245,158,11,0.04)' : 'var(--surface)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                  background: rule.isActive ? 'rgba(245,158,11,0.1)' : 'rgba(51,65,85,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={16} color={rule.isActive ? '#f59e0b' : '#64748b'} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{rule.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {TRIGGER_LABELS[rule.trigger]}
                  </div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.8125rem', color: rule.isActive ? '#fbbf24' : 'var(--text-muted)' }}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
                <input type="checkbox" checked={rule.isActive}
                  onChange={e => handleUpdate({ ...rule, isActive: e.target.checked })}
                  style={{ accentColor: '#f59e0b', width: 16, height: 16, cursor: 'pointer' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Rule Name</label>
                <input type="text" className="input" value={rule.name}
                  onChange={e => handleUpdate({ ...rule, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Days Threshold (trigger after N days)</label>
                <input type="number" className="input" min={1} max={60} value={rule.daysThreshold}
                  onChange={e => handleUpdate({ ...rule, daysThreshold: Number(e.target.value) })} />
              </div>
            </div>

            <div style={{ marginTop: '0.875rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8125rem',
              background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)', color: 'var(--text-muted)' }}>
              Escalation chain: Employee → Manager → Skip-level / HR (notified every {rule.daysThreshold} days)
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Log */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Escalation Log</h3>
        {escalationLogs.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <AlertTriangle size={32} color="#334155" style={{ marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '0.875rem' }}>No escalations triggered yet. Rules are monitoring activity.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Rule</th><th>Employee</th><th>Triggered</th><th>Status</th></tr>
              </thead>
              <tbody>
                {escalationLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.ruleName}</td>
                    <td>{log.employeeName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{log.triggeredAt}</td>
                    <td>
                      <span style={{ color: log.resolved ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {log.resolved ? '✓ Resolved' : '⚠️ Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
