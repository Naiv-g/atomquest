'use client';

import { useApp } from '@/contexts/AppContext';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  success: '#10b981', info: '#3b82f6', warning: '#f59e0b', error: '#ef4444',
};

export default function NotificationsPage() {
  const { currentUser, notifications, markNotificationRead, markAllRead } = useApp();
  if (!currentUser) return null;

  const myNotifs = notifications.filter(n => n.userId === currentUser.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 640, margin: '0 auto' }} className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {myNotifs.filter(n => !n.read).length} unread
          </p>
        </div>
        {myNotifs.some(n => !n.read) && (
          <button className="btn-secondary" onClick={markAllRead} style={{ fontSize: '0.8125rem' }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {myNotifs.length === 0 ? (
        <div className="empty-state">
          <Bell size={40} color="#334155" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No notifications yet</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {myNotifs.map(n => {
            const color = TYPE_COLORS[n.type] ?? '#64748b';
            return (
              <div key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{
                  display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem', borderRadius: '0.875rem',
                  background: n.read ? 'rgba(15,23,42,0.4)' : 'rgba(99,102,241,0.06)',
                  border: `1px solid ${n.read ? 'rgba(51,65,85,0.4)' : `${color}30`}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                  background: n.read ? 'transparent' : color,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.read ? 500 : 700, marginBottom: '0.25rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{formatDateTime(n.createdAt)}</div>
                </div>
                {!n.read && <Check size={14} color={color} style={{ flexShrink: 0, marginTop: 2 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
