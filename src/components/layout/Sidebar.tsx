'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard, Target, CheckCircle, Users, Settings,
  FileText, BarChart3, Bell, LogOut, Zap, AlertTriangle, ClipboardList,
  UserCheck, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV: Record<string, { icon: React.ElementType; label: string; href: string }[]> = {
  employee: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/employee' },
    { icon: Target, label: 'My Goals', href: '/dashboard/employee/goals' },
    { icon: CheckCircle, label: 'Check-ins', href: '/dashboard/employee/checkin' },
    { icon: BarChart3, label: 'My Progress', href: '/dashboard/employee/progress' },
  ],
  manager: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/manager' },
    { icon: Users, label: 'Team Goals', href: '/dashboard/manager/team' },
    { icon: UserCheck, label: 'Approvals', href: '/dashboard/manager/approvals' },
    { icon: CheckCircle, label: 'Check-ins', href: '/dashboard/manager/checkin' },
    { icon: Zap, label: 'Shared Goals', href: '/dashboard/manager/shared' },
    { icon: BarChart3, label: 'Team Analytics', href: '/dashboard/manager/analytics' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin' },
    { icon: Users, label: 'All Employees', href: '/dashboard/admin/employees' },
    { icon: Settings, label: 'Cycle Config', href: '/dashboard/admin/cycles' },
    { icon: FileText, label: 'Reports', href: '/dashboard/admin/reports' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/admin/analytics' },
    { icon: AlertTriangle, label: 'Escalations', href: '/dashboard/admin/escalations' },
    { icon: ClipboardList, label: 'Audit Log', href: '/dashboard/admin/audit' },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  employee: '#10b981',
  manager: '#3b82f6',
  admin: '#f59e0b',
};

const ROLE_LABELS: Record<string, string> = {
  employee: 'Employee',
  manager: 'Manager L1',
  admin: 'Admin / HR',
};

const ROLE_HOME: Record<string, string> = {
  employee: '/dashboard/employee',
  manager: '/dashboard/manager',
  admin: '/dashboard/admin',
};

export default function Sidebar() {
  const { currentUser, logout, switchRole, notifications } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  if (!currentUser) return null;

  const nav = NAV[currentUser.role] ?? [];
  const unread = notifications.filter(n => !n.read && n.userId === currentUser.id).length;
  const roleColor = ROLE_COLORS[currentUser.role];

  return (
    <aside style={{
      width: 240, flexShrink: 0, height: '100vh', overflowY: 'auto',
      background: 'rgba(10,15,30,0.95)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '1rem 0.75rem',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.25rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
        }}>⚛️</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.01em' }} className="gradient-text">AtomQuest</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-1px' }}>Goal Portal</div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 0.875rem',
        borderRadius: '0.75rem', marginBottom: '1rem',
        background: `rgba(${roleColor === '#10b981' ? '16,185,129' : roleColor === '#3b82f6' ? '59,130,246' : '245,158,11'},0.08)`,
        border: `1px solid ${roleColor}30`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: `${roleColor}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem',
          flexShrink: 0,
        }}>
          {currentUser.role === 'employee' ? '👤' : currentUser.role === 'manager' ? '👔' : '🛡️'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser.name.split(' ')[0]}
          </div>
          <div style={{ fontSize: '0.7rem', color: roleColor }}>{ROLE_LABELS[currentUser.role]}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.5rem 0.5rem 0.25rem', marginBottom: '0.25rem' }}>
          Navigation
        </div>
        {nav.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn('sidebar-nav-item', active && 'active')}>
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Notifications */}
        <div style={{ marginTop: '0.5rem' }}>
          <Link href="/dashboard/notifications" className={cn('sidebar-nav-item', pathname === '/dashboard/notifications' && 'active')}
            style={{ position: 'relative' }}>
            <Bell size={16} />
            <span>Notifications</span>
            {unread > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#ef4444', color: 'white',
                borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700,
                padding: '1px 6px', minWidth: '18px', textAlign: 'center',
              }}>{unread}</span>
            )}
          </Link>
        </div>
      </nav>

      {/* Role Switcher */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
          Demo: Switch Role
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['employee', 'manager', 'admin'] as const).map(role => (
            <button key={role} onClick={() => { switchRole(role); router.push(ROLE_HOME[role]); }} className={`role-chip ${role}`}
              style={{ flex: 1, justifyContent: 'center', opacity: currentUser.role === role ? 1 : 0.5 }}>
              {role === 'employee' ? '👤' : role === 'manager' ? '👔' : '🛡️'}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); router.push('/'); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%',
          padding: '0.625rem 0.875rem', marginTop: '0.5rem', borderRadius: '0.625rem',
          background: 'none', border: '1px solid transparent', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = '#f87171';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
          (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLElement).style.background = 'none';
        }}
      >
        <LogOut size={16} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}
