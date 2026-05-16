'use client';

import { useApp } from '@/contexts/AppContext';
import { Bell, Search, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function Header() {
  const { currentUser, notifications, markAllRead } = useApp();
  const router = useRouter();

  if (!currentUser) return null;
  const unread = notifications.filter(n => !n.read && n.userId === currentUser.id).length;

  const ROLE_LABELS: Record<string, string> = {
    employee: 'Employee Portal',
    manager: 'Manager Dashboard',
    admin: 'Admin & HR Portal',
  };

  const today = formatDate(new Date().toISOString());

  return (
    <header style={{
      height: 64, flexShrink: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 2rem',
      background: 'rgba(10,15,30,0.9)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {ROLE_LABELS[currentUser.role]}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Building2 size={11} />
            <span>{currentUser.department} · {today}</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notification Bell */}
        <button
          onClick={() => { markAllRead(); router.push('/dashboard/notifications'); }}
          style={{
            position: 'relative', width: 38, height: 38, borderRadius: '10px',
            background: 'rgba(30,41,59,0.6)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, background: '#ef4444',
              color: 'white', borderRadius: '999px', fontSize: '0.6rem',
              fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center',
            }}>{unread}</span>
          )}
        </button>

        {/* User Avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.375rem 0.75rem', borderRadius: '10px',
          background: 'rgba(30,41,59,0.6)', border: '1px solid var(--border)',
          cursor: 'pointer',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: 'white',
          }}>
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser.name.split(' ')[0]}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
