'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { Target, Zap, Users, BarChart3, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const DEMO_CREDENTIALS = [
  { role: 'Employee', email: 'employee@atomquest.in', password: 'demo123', color: 'emerald', icon: '👤' },
  { role: 'Manager (L1)', email: 'manager@atomquest.in', password: 'demo123', color: 'blue', icon: '👔' },
  { role: 'Admin / HR', email: 'admin@atomquest.in', password: 'demo123', color: 'amber', icon: '🛡️' },
];

const FEATURES = [
  { icon: Target, label: 'Smart Goal Creation', desc: 'AI-assisted goal suggestions & weightage validation' },
  { icon: Zap, label: 'Real-time Check-ins', desc: 'Quarterly progress tracking with computed scores' },
  { icon: Users, label: 'Team Collaboration', desc: 'Manager approvals, shared goals & feedback loops' },
  { icon: BarChart3, label: 'Analytics & Reports', desc: 'QoQ trends, heatmaps & exportable achievement reports' },
  { icon: ShieldCheck, label: 'Audit Trail', desc: 'Every change logged — who changed what and when' },
];

export default function LoginPage() {
  const { login, switchRole } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    if (ok) {
      toast.success('Welcome back!');
      router.push('/dashboard');
    } else {
      toast.error('Invalid credentials. Use the demo accounts below.');
    }
    setLoading(false);
  };

  const quickLogin = async (cred: typeof DEMO_CREDENTIALS[0]) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    login(cred.email, cred.password);
    toast.success(`Logged in as ${cred.role}`);
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
        borderRight: '1px solid rgba(51,65,85,0.5)',
      }} className="hidden-mobile">
        {/* Logo */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem',
            }}>⚛️</div>
            <div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">
                AtomQuest
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-2px' }}>
                Goal & Performance Portal
              </div>
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          Align. Track.<br />
          <span className="gradient-text">Achieve.</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 380 }}>
          A structured, digital goal lifecycle platform — from creation and approval
          to quarterly check-ins and real-time performance visibility.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem', padding: '1.25rem', borderRadius: '1rem',
          background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)',
        }}>
          {[
            { val: '3', label: 'User Roles' },
            { val: '4', label: 'Quarters' },
            { val: '100%', label: 'Audit Trail' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login */}
      <div style={{
        width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>⚛️</div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem' }} className="gradient-text">AtomQuest</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Sign in</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Access your goal management portal</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="label">Email address</label>
            <input
              type="email" className="input" placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'} className="input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPwd(p => !p)} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
            {loading ? 'Signing in…' : (<>Sign In <ArrowRight size={16} /></>)}
          </button>
        </form>

        {/* Demo Quick Access */}
        <div style={{
          padding: '1.25rem', borderRadius: '1rem',
          background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)',
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
            🎯 Demo — Quick Access
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.role} onClick={() => quickLogin(cred)} disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem', borderRadius: '0.625rem', cursor: 'pointer',
                  background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)',
                  color: 'var(--text-primary)', fontSize: '0.8125rem', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(51,65,85,0.5)'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{cred.icon}</span>
                  <span style={{ fontWeight: 600 }}>{cred.role}</span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cred.email}</span>
                </span>
                <ArrowRight size={14} color="#64748b" />
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            Password for all demo accounts: <code style={{ color: '#818cf8' }}>demo123</code>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          AtomQuest Hackathon 1.0 — Goal Setting & Tracking Portal
        </p>
      </div>
    </div>
  );
}
