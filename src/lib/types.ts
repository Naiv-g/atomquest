// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
  managerName?: string;
  avatar?: string;
  joinDate: string;
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export type UoMType = 'min' | 'max' | 'timeline' | 'zero';
export type GoalStatus = 'not_started' | 'on_track' | 'completed' | 'at_risk';
export type ApprovalStatus = 'draft' | 'submitted' | 'approved' | 'returned' | 'locked';
export type QuarterKey = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type ThrustArea =
  | 'Revenue Growth'
  | 'Cost Optimization'
  | 'Customer Experience'
  | 'Operational Excellence'
  | 'People & Culture'
  | 'Innovation & Technology'
  | 'Quality & Compliance'
  | 'Sustainability';

export interface QuarterlyAchievement {
  quarter: QuarterKey;
  actual: number | string;
  status: GoalStatus;
  notes: string;
  updatedAt: string;
  score?: number; // computed
}

export interface CheckInComment {
  id: string;
  managerId: string;
  managerName: string;
  quarter: QuarterKey;
  comment: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  thrustArea: ThrustArea;
  title: string;
  description: string;
  uomType: UoMType;
  uomLabel: string;
  target: number | string;
  weightage: number;
  approvalStatus: ApprovalStatus;
  goalStatus: GoalStatus;
  isShared: boolean;
  sharedFrom?: string; // goal id of parent shared goal
  sharedTo?: string[]; // employee ids
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
  managerNotes?: string;
  quarterlyAchievements: QuarterlyAchievement[];
  checkInComments: CheckInComment[];
  auditLog: AuditEntry[];
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

// ─── Cycles ───────────────────────────────────────────────────────────────────

export interface CheckInWindow {
  quarter: QuarterKey;
  label: string;
  opensOn: string;
  closesOn: string;
  isActive: boolean;
}

export interface Cycle {
  id: string;
  year: number;
  goalSettingOpens: string;
  goalSettingCloses: string;
  checkInWindows: CheckInWindow[];
  isActive: boolean;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TeamProgress {
  employeeId: string;
  employeeName: string;
  department: string;
  totalGoals: number;
  approvedGoals: number;
  completedGoals: number;
  avgScore: number;
  checkInCompleted: boolean;
}

export interface DepartmentStats {
  department: string;
  totalEmployees: number;
  goalsSubmitted: number;
  goalsApproved: number;
  avgAchievement: number;
}

// ─── Escalation ───────────────────────────────────────────────────────────────

export interface EscalationRule {
  id: string;
  name: string;
  trigger: 'no_submission' | 'no_approval' | 'no_checkin';
  daysThreshold: number;
  isActive: boolean;
}

export interface EscalationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  employeeId: string;
  employeeName: string;
  managerId?: string;
  triggeredAt: string;
  resolved: boolean;
  resolvedAt?: string;
}
