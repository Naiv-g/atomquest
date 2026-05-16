'use client';

import { useApp } from '@/contexts/AppContext';
import { Goal } from '@/lib/types';
import { computeScore } from '@/lib/utils';

interface GoalPulseProps {
  goals: Goal[];
  overallScore: number | null;
}

export default function GoalPulse({ goals, overallScore }: GoalPulseProps) {
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const score = overallScore ?? 0;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#3b82f6' : '#ef4444';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Goal Pulse</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* SVG Ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background track */}
            <circle cx={size / 2} cy={size / 2} r={radius}
              stroke="rgba(51,65,85,0.5)" strokeWidth={stroke} fill="none" />
            {/* Progress */}
            <circle cx={size / 2} cy={size / 2} r={radius}
              stroke={scoreColor} strokeWidth={stroke} fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={overallScore !== null ? offset : circumference}
              style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {overallScore !== null ? (
              <>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                  {score}%
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>Q1 Score</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.25rem' }}>—</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>No data</span>
              </>
            )}
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ flex: 1 }}>
          {goals.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No goals yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {goals.slice(0, 4).map(g => {
                const ach = g.quarterlyAchievements.find(a => a.quarter === 'Q1');
                const s = ach ? computeScore(g.uomType, g.target, ach.actual) : null;
                const barColor = s === null ? '#475569' : s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                        {g.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: barColor, flexShrink: 0 }}>
                        {s !== null ? `${s}%` : '—'} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({g.weightage}%w)</span>
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s ?? 0}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
