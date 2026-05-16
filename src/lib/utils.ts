import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Goal, QuarterKey, UoMType, GoalStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Score Computation ────────────────────────────────────────────────────────

export function computeScore(
  uomType: UoMType,
  target: number | string,
  actual: number | string
): number {
  if (uomType === 'zero') {
    return Number(actual) === 0 ? 100 : 0;
  }
  if (uomType === 'timeline') {
    // actual and target are ISO date strings
    const targetDate = new Date(target as string).getTime();
    const actualDate = new Date(actual as string).getTime();
    if (actualDate <= targetDate) return 100;
    const diff = actualDate - targetDate;
    const totalDays = 90 * 24 * 60 * 60 * 1000; // penalise over 90 days
    return Math.max(0, Math.round(100 - (diff / totalDays) * 100));
  }
  const t = Number(target);
  const a = Number(actual);
  if (t === 0) return 0;
  if (uomType === 'min') {
    return Math.min(Math.round((a / t) * 100), 150); // cap at 150%
  }
  if (uomType === 'max') {
    if (a === 0) return 0;
    return Math.min(Math.round((t / a) * 100), 150);
  }
  return 0;
}

// ─── Weighted Score ───────────────────────────────────────────────────────────

export function computeWeightedScore(goals: Goal[], quarter: QuarterKey): number {
  let totalWeight = 0;
  let weightedSum = 0;
  goals.forEach((g) => {
    const achievement = g.quarterlyAchievements.find((a) => a.quarter === quarter);
    if (achievement) {
      const score = computeScore(g.uomType, g.target, achievement.actual);
      weightedSum += score * (g.weightage / 100);
      totalWeight += g.weightage;
    }
  });
  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100);
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export function statusColor(status: GoalStatus) {
  switch (status) {
    case 'completed': return 'text-emerald-400';
    case 'on_track': return 'text-blue-400';
    case 'at_risk': return 'text-amber-400';
    case 'not_started': return 'text-slate-400';
    default: return 'text-slate-400';
  }
}

export function statusBg(status: GoalStatus) {
  switch (status) {
    case 'completed': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'on_track': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'at_risk': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'not_started': return 'bg-slate-700/50 text-slate-400 border border-slate-600/30';
    default: return 'bg-slate-700/50 text-slate-400';
  }
}

export function approvalBg(status: string) {
  switch (status) {
    case 'approved': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'locked': return 'bg-violet-500/15 text-violet-400 border border-violet-500/30';
    case 'submitted': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'returned': return 'bg-red-500/15 text-red-400 border border-red-500/30';
    case 'draft': return 'bg-slate-700/50 text-slate-400 border border-slate-600/30';
    default: return 'bg-slate-700/50 text-slate-400';
  }
}

export function statusLabel(status: GoalStatus) {
  switch (status) {
    case 'completed': return 'Completed';
    case 'on_track': return 'On Track';
    case 'at_risk': return 'At Risk';
    case 'not_started': return 'Not Started';
    default: return 'Unknown';
  }
}

export function approvalLabel(status: string) {
  switch (status) {
    case 'approved': return 'Approved';
    case 'locked': return 'Locked';
    case 'submitted': return 'Pending Approval';
    case 'returned': return 'Returned';
    case 'draft': return 'Draft';
    default: return status;
  }
}

export function uomLabel(type: UoMType) {
  switch (type) {
    case 'min': return 'Numeric (Higher is Better)';
    case 'max': return 'Numeric (Lower is Better)';
    case 'timeline': return 'Timeline (Date-based)';
    case 'zero': return 'Zero-based (Zero = Success)';
    default: return type;
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentQuarter(): QuarterKey {
  const month = new Date().getMonth() + 1;
  if (month >= 7 && month <= 9) return 'Q1';
  if (month >= 10 && month <= 12) return 'Q2';
  if (month >= 1 && month <= 3) return 'Q3';
  return 'Q4';
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateGoalWeightage(goals: { weightage: number }[]): string | null {
  const total = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (total !== 100) return `Total weightage must be 100%. Current: ${total}%`;
  return null;
}

export function validateSingleGoalWeightage(weightage: number): string | null {
  if (weightage < 10) return 'Minimum weightage per goal is 10%';
  if (weightage > 100) return 'Maximum weightage per goal is 100%';
  return null;
}

export function validateMaxGoals(count: number): string | null {
  if (count >= 8) return 'Maximum 8 goals per employee';
  return null;
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

export async function exportToExcel(data: Record<string, unknown>[], filename: string) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
