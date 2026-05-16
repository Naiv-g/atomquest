'use client';

import { useApp } from '@/contexts/AppContext';
import { formatDateTime, approvalBg, approvalLabel } from '@/lib/utils';
import { ClipboardList, Search } from 'lucide-react';
import { useState } from 'react';

export default function AuditLogPage() {
  const { allAuditLogs, goals } = useApp();
  const [search, setSearch] = useState('');

  const filtered = allAuditLogs
    .filter(log => {
      const goal = goals.find(g => g.id === log.goalId);
      const text = `${log.userName} ${log.action} ${log.field ?? ''} ${goal?.title ?? ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const actionColor: Record<string, string> = {
    approved: '#10b981', returned: '#f59e0b', unlocked: '#8b5cf6',
    updated: '#3b82f6', submitted: '#6366f1',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Audit Trail</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Complete log of all changes — who changed what and when
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" className="input" placeholder="Search by user, action, goal…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Audit Log ({filtered.length} entries)</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={40} color="#334155" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No audit entries found</h3>
            <p style={{ fontSize: '0.875rem' }}>Audit entries are created when goals are approved, returned, unlocked, or edited post-lock.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Goal</th>
                  <th>Field Changed</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const goal = goals.find(g => g.id === log.goalId);
                  const color = actionColor[log.action] ?? '#94a3b8';
                  return (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.userName}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '999px',
                          fontSize: '0.75rem', fontWeight: 600, background: `${color}15`, color,
                          border: `1px solid ${color}30`,
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {goal?.title ?? log.goalId}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{log.field ?? '—'}</td>
                      <td style={{ color: '#f87171', fontSize: '0.8125rem' }}>{log.oldValue ?? '—'}</td>
                      <td style={{ color: '#34d399', fontSize: '0.8125rem' }}>{log.newValue ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
