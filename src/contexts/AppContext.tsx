'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User, Goal, Cycle, Notification, AuditEntry, EscalationRule, EscalationLog,
  UserRole, QuarterKey, GoalStatus, ApprovalStatus, ThrustArea, UoMType, CheckInComment
} from '@/lib/types';
import { generateId, computeScore } from '@/lib/utils';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  {
    id: 'emp-001', name: 'Priya Sharma', email: 'employee@atomquest.in',
    role: 'employee', department: 'Sales', managerId: 'mgr-001',
    managerName: 'Rahul Verma', joinDate: '2023-06-01',
  },
  {
    id: 'emp-002', name: 'Ankit Singh', email: 'ankit@atomquest.in',
    role: 'employee', department: 'Operations', managerId: 'mgr-001',
    managerName: 'Rahul Verma', joinDate: '2023-08-15',
  },
  {
    id: 'emp-003', name: 'Meera Nair', email: 'meera@atomquest.in',
    role: 'employee', department: 'Technology', managerId: 'mgr-001',
    managerName: 'Rahul Verma', joinDate: '2022-11-01',
  },
  {
    id: 'mgr-001', name: 'Rahul Verma', email: 'manager@atomquest.in',
    role: 'manager', department: 'Sales', joinDate: '2021-03-01',
  },
  {
    id: 'adm-001', name: 'Sunita Patel', email: 'admin@atomquest.in',
    role: 'admin', department: 'HR', joinDate: '2020-01-01',
  },
];

const SEED_GOALS: Goal[] = [
  {
    id: 'goal-001', employeeId: 'emp-001', employeeName: 'Priya Sharma',
    department: 'Sales', thrustArea: 'Revenue Growth', title: 'Increase Q4 Sales Revenue',
    description: 'Achieve quarterly sales target by expanding client base and upselling premium plans.',
    uomType: 'min', uomLabel: 'Revenue (₹ Lakhs)', target: 50, weightage: 40,
    approvalStatus: 'locked', goalStatus: 'on_track', isShared: false,
    createdAt: '2026-05-01T09:00:00Z', submittedAt: '2026-05-02T10:00:00Z',
    approvedAt: '2026-05-03T11:00:00Z', lockedAt: '2026-05-03T11:00:00Z',
    quarterlyAchievements: [
      { quarter: 'Q1', actual: 35, status: 'on_track', notes: 'Good pipeline, closing in July', updatedAt: '2026-07-15T10:00:00Z', score: 70 }
    ],
    checkInComments: [
      { id: 'cc-001', managerId: 'mgr-001', managerName: 'Rahul Verma', quarter: 'Q1', comment: 'Good progress. Focus on enterprise accounts.', createdAt: '2026-07-15T11:00:00Z' }
    ],
    auditLog: [],
  },
  {
    id: 'goal-002', employeeId: 'emp-001', employeeName: 'Priya Sharma',
    department: 'Sales', thrustArea: 'Customer Experience', title: 'Improve CSAT Score',
    description: 'Improve customer satisfaction score through proactive follow-up and relationship management.',
    uomType: 'min', uomLabel: 'CSAT Score (out of 10)', target: 8.5, weightage: 30,
    approvalStatus: 'locked', goalStatus: 'on_track', isShared: false,
    createdAt: '2026-05-01T09:00:00Z', submittedAt: '2026-05-02T10:00:00Z',
    approvedAt: '2026-05-03T11:00:00Z', lockedAt: '2026-05-03T11:00:00Z',
    quarterlyAchievements: [],
    checkInComments: [], auditLog: [],
  },
  {
    id: 'goal-003', employeeId: 'emp-001', employeeName: 'Priya Sharma',
    department: 'Sales', thrustArea: 'Operational Excellence', title: 'Reduce Sales Cycle TAT',
    description: 'Reduce average days to close from proposal to signed contract.',
    uomType: 'max', uomLabel: 'Days', target: 30, weightage: 20,
    approvalStatus: 'locked', goalStatus: 'completed', isShared: false,
    createdAt: '2026-05-01T09:00:00Z', submittedAt: '2026-05-02T10:00:00Z',
    approvedAt: '2026-05-03T11:00:00Z', lockedAt: '2026-05-03T11:00:00Z',
    quarterlyAchievements: [
      { quarter: 'Q1', actual: 22, status: 'completed', notes: 'Streamlined proposal process', updatedAt: '2026-07-15T10:00:00Z', score: 100 }
    ],
    checkInComments: [], auditLog: [],
  },
  {
    id: 'goal-004', employeeId: 'emp-001', employeeName: 'Priya Sharma',
    department: 'Sales', thrustArea: 'Quality & Compliance', title: 'Zero Data Compliance Incidents',
    description: 'Ensure zero customer data handling violations across all sales activities.',
    uomType: 'zero', uomLabel: 'Incidents', target: 0, weightage: 10,
    approvalStatus: 'locked', goalStatus: 'completed', isShared: false,
    createdAt: '2026-05-01T09:00:00Z', submittedAt: '2026-05-02T10:00:00Z',
    approvedAt: '2026-05-03T11:00:00Z', lockedAt: '2026-05-03T11:00:00Z',
    quarterlyAchievements: [
      { quarter: 'Q1', actual: 0, status: 'completed', notes: 'No incidents', updatedAt: '2026-07-15T10:00:00Z', score: 100 }
    ],
    checkInComments: [], auditLog: [],
  },
  {
    id: 'goal-005', employeeId: 'emp-002', employeeName: 'Ankit Singh',
    department: 'Operations', thrustArea: 'Cost Optimization', title: 'Reduce Operational Costs',
    description: 'Identify and eliminate inefficiencies in operational workflows.',
    uomType: 'max', uomLabel: 'Cost (₹ Lakhs)', target: 20, weightage: 50,
    approvalStatus: 'submitted', goalStatus: 'not_started', isShared: false,
    createdAt: '2026-05-10T09:00:00Z', submittedAt: '2026-05-12T10:00:00Z',
    quarterlyAchievements: [], checkInComments: [], auditLog: [],
  },
  {
    id: 'goal-006', employeeId: 'emp-002', employeeName: 'Ankit Singh',
    department: 'Operations', thrustArea: 'Operational Excellence', title: 'Process Automation Coverage',
    description: 'Automate repetitive manual processes to improve efficiency.',
    uomType: 'min', uomLabel: 'Processes Automated (%)', target: 80, weightage: 50,
    approvalStatus: 'submitted', goalStatus: 'not_started', isShared: false,
    createdAt: '2026-05-10T09:00:00Z', submittedAt: '2026-05-12T10:00:00Z',
    quarterlyAchievements: [], checkInComments: [], auditLog: [],
  },
  {
    id: 'goal-007', employeeId: 'emp-003', employeeName: 'Meera Nair',
    department: 'Technology', thrustArea: 'Innovation & Technology', title: 'Launch Mobile App MVP',
    description: 'Deliver the first MVP of the customer-facing mobile application.',
    uomType: 'timeline', uomLabel: 'Completion Date', target: '2026-09-30', weightage: 60,
    approvalStatus: 'draft', goalStatus: 'not_started', isShared: false,
    createdAt: '2026-05-14T09:00:00Z',
    quarterlyAchievements: [], checkInComments: [], auditLog: [],
  },
  {
    id: 'goal-008', employeeId: 'emp-003', employeeName: 'Meera Nair',
    department: 'Technology', thrustArea: 'Quality & Compliance', title: 'Reduce System Downtime',
    description: 'Maintain 99.9% uptime for all critical systems.',
    uomType: 'max', uomLabel: 'Downtime Hours', target: 2, weightage: 40,
    approvalStatus: 'draft', goalStatus: 'not_started', isShared: false,
    createdAt: '2026-05-14T09:00:00Z',
    quarterlyAchievements: [], checkInComments: [], auditLog: [],
  },
];

const SEED_CYCLE: Cycle = {
  id: 'cycle-2026',
  year: 2026,
  goalSettingOpens: '2026-05-01',
  goalSettingCloses: '2026-06-30',
  checkInWindows: [
    { quarter: 'Q1', label: 'Q1 Check-in (July)', opensOn: '2026-07-01', closesOn: '2026-07-31', isActive: true },
    { quarter: 'Q2', label: 'Q2 Check-in (October)', opensOn: '2026-10-01', closesOn: '2026-10-31', isActive: false },
    { quarter: 'Q3', label: 'Q3 Check-in (January)', opensOn: '2027-01-01', closesOn: '2027-01-31', isActive: false },
    { quarter: 'Q4', label: 'Q4 / Annual (March-April)', opensOn: '2027-03-01', closesOn: '2027-04-30', isActive: false },
  ],
  isActive: true,
};

const SEED_ESCALATION_RULES: EscalationRule[] = [
  { id: 'esc-001', name: 'Late Goal Submission', trigger: 'no_submission', daysThreshold: 7, isActive: true },
  { id: 'esc-002', name: 'Pending Manager Approval', trigger: 'no_approval', daysThreshold: 5, isActive: true },
  { id: 'esc-003', name: 'Missed Check-in', trigger: 'no_checkin', daysThreshold: 10, isActive: true },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Goals
  goals: Goal[];
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'quarterlyAchievements' | 'checkInComments' | 'auditLog'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>, actor?: User) => void;
  submitGoal: (goalId: string) => void;
  approveGoal: (goalId: string, notes?: string) => void;
  returnGoal: (goalId: string, notes: string) => void;
  unlockGoal: (goalId: string, reason: string) => void;
  deleteGoal: (goalId: string) => void;
  logAchievement: (goalId: string, quarter: QuarterKey, actual: number | string, status: GoalStatus, notes: string) => void;
  addCheckInComment: (goalId: string, quarter: QuarterKey, comment: string) => void;
  pushSharedGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'quarterlyAchievements' | 'checkInComments' | 'auditLog'>, employeeIds: string[]) => void;

  // Cycle
  cycle: Cycle;
  updateCycle: (cycle: Cycle) => void;
  activeQuarter: QuarterKey | null;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Escalations
  escalationRules: EscalationRule[];
  escalationLogs: EscalationLog[];
  updateEscalationRule: (rule: EscalationRule) => void;

  // Audit
  allAuditLogs: AuditEntry[];
}

const AppContext = createContext<AppContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(SEED_USERS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cycle, setCycle] = useState<Cycle>(SEED_CYCLE);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>(SEED_ESCALATION_RULES);
  const [escalationLogs, setEscalationLogs] = useState<EscalationLog[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('aq_user');
      const storedGoals = localStorage.getItem('aq_goals');
      const storedCycle = localStorage.getItem('aq_cycle');
      const storedNotifs = localStorage.getItem('aq_notifications');
      const storedEscLogs = localStorage.getItem('aq_esc_logs');

      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      else setGoals(SEED_GOALS);
      if (storedCycle) setCycle(JSON.parse(storedCycle));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      if (storedEscLogs) setEscalationLogs(JSON.parse(storedEscLogs));
    } catch {
      setGoals(SEED_GOALS);
    }
  }, []);

  // Persist goals
  useEffect(() => {
    if (goals.length > 0) localStorage.setItem('aq_goals', JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('aq_user', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('aq_cycle', JSON.stringify(cycle));
  }, [cycle]);
  useEffect(() => {
    localStorage.setItem('aq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Active quarter
  const activeQuarter = cycle.checkInWindows.find((w) => w.isActive)?.quarter ?? null;

  // Auth
  const login = useCallback((email: string, _password: string): boolean => {
    const user = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('aq_user');
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const user = SEED_USERS.find((u) => u.role === role);
    if (user) setCurrentUser(user);
  }, []);

  // Notifications
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const notif: Notification = { ...n, id: generateId(), createdAt: new Date().toISOString(), read: false };
    setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Goals CRUD
  const createGoal = useCallback((g: Omit<Goal, 'id' | 'createdAt' | 'quarterlyAchievements' | 'checkInComments' | 'auditLog'>): Goal => {
    const newGoal: Goal = {
      ...g, id: generateId(), createdAt: new Date().toISOString(),
      quarterlyAchievements: [], checkInComments: [], auditLog: [],
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>, actor?: User) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== id) return g;
      const auditEntries: AuditEntry[] = [];
      if (actor) {
        Object.keys(updates).forEach((field) => {
          const oldVal = String((g as Record<string, unknown>)[field] ?? '');
          const newVal = String((updates as Record<string, unknown>)[field] ?? '');
          if (oldVal !== newVal) {
            auditEntries.push({
              id: generateId(), goalId: id, userId: actor.id, userName: actor.name,
              action: 'updated', field, oldValue: oldVal, newValue: newVal,
              timestamp: new Date().toISOString(),
            });
          }
        });
      }
      return { ...g, ...updates, auditLog: [...g.auditLog, ...auditEntries] };
    }));
  }, []);

  const submitGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.map((g) => g.id !== goalId ? g : {
      ...g, approvalStatus: 'submitted', submittedAt: new Date().toISOString(),
    }));
    addNotification({ userId: 'mgr-001', title: 'New Goal Submitted', message: 'A team member submitted goals for approval.', type: 'info' });
  }, [addNotification]);

  const approveGoal = useCallback((goalId: string, notes?: string) => {
    const now = new Date().toISOString();
    setGoals((prev) => prev.map((g) => g.id !== goalId ? g : {
      ...g, approvalStatus: 'locked', approvedAt: now, lockedAt: now,
      managerNotes: notes ?? g.managerNotes,
      auditLog: [...g.auditLog, {
        id: generateId(), goalId, userId: currentUser?.id ?? '', userName: currentUser?.name ?? '',
        action: 'approved', timestamp: now,
      }],
    }));
    addNotification({ userId: 'emp-001', title: 'Goal Approved', message: 'Your goal has been approved and locked.', type: 'success' });
    addNotification({ userId: 'emp-002', title: 'Goal Approved', message: 'Your goal has been approved and locked.', type: 'success' });
  }, [currentUser, addNotification]);

  const returnGoal = useCallback((goalId: string, notes: string) => {
    const now = new Date().toISOString();
    setGoals((prev) => prev.map((g) => g.id !== goalId ? g : {
      ...g, approvalStatus: 'returned', managerNotes: notes,
      auditLog: [...g.auditLog, {
        id: generateId(), goalId, userId: currentUser?.id ?? '', userName: currentUser?.name ?? '',
        action: 'returned', field: 'approvalStatus', oldValue: 'submitted', newValue: 'returned',
        timestamp: now,
      }],
    }));
    addNotification({ userId: goals.find(g => g.id === goalId)?.employeeId ?? '', title: 'Goal Returned', message: `Manager returned your goal for rework: ${notes}`, type: 'warning' });
  }, [currentUser, goals, addNotification]);

  const unlockGoal = useCallback((goalId: string, reason: string) => {
    const now = new Date().toISOString();
    setGoals((prev) => prev.map((g) => g.id !== goalId ? g : {
      ...g, approvalStatus: 'approved', lockedAt: undefined,
      auditLog: [...g.auditLog, {
        id: generateId(), goalId, userId: currentUser?.id ?? '', userName: currentUser?.name ?? '',
        action: 'unlocked', field: 'approvalStatus', oldValue: 'locked', newValue: 'approved',
        newValue2: reason, timestamp: now,
      } as AuditEntry],
    }));
  }, [currentUser]);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  const logAchievement = useCallback((goalId: string, quarter: QuarterKey, actual: number | string, status: GoalStatus, notes: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const score = computeScore(goal.uomType, goal.target, actual);
    const achievement = { quarter, actual, status, notes, updatedAt: new Date().toISOString(), score };
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g;
      const existing = g.quarterlyAchievements.filter((a) => a.quarter !== quarter);
      return { ...g, goalStatus: status, quarterlyAchievements: [...existing, achievement] };
    }));
    // sync shared goals
    if (goal.sharedTo?.length) {
      goal.sharedTo.forEach((empId) => {
        const sharedGoal = goals.find((g) => g.sharedFrom === goalId && g.employeeId === empId);
        if (sharedGoal) {
          setGoals((prev) => prev.map((g) => {
            if (g.id !== sharedGoal.id) return g;
            const existing = g.quarterlyAchievements.filter((a) => a.quarter !== quarter);
            return { ...g, goalStatus: status, quarterlyAchievements: [...existing, achievement] };
          }));
        }
      });
    }
  }, [goals]);

  const addCheckInComment = useCallback((goalId: string, quarter: QuarterKey, comment: string) => {
    if (!currentUser) return;
    const newComment: CheckInComment = {
      id: generateId(), managerId: currentUser.id, managerName: currentUser.name,
      quarter, comment, createdAt: new Date().toISOString(),
    };
    setGoals((prev) => prev.map((g) => g.id !== goalId ? g : {
      ...g, checkInComments: [...g.checkInComments, newComment],
    }));
  }, [currentUser]);

  const pushSharedGoal = useCallback((
    baseGoal: Omit<Goal, 'id' | 'createdAt' | 'quarterlyAchievements' | 'checkInComments' | 'auditLog'>,
    employeeIds: string[]
  ) => {
    const parentId = generateId();
    const parent: Goal = {
      ...baseGoal, id: parentId, createdAt: new Date().toISOString(),
      isShared: true, sharedTo: employeeIds,
      quarterlyAchievements: [], checkInComments: [], auditLog: [],
    };
    const children: Goal[] = employeeIds.map((empId) => {
      const emp = users.find((u) => u.id === empId);
      return {
        ...baseGoal, id: generateId(), employeeId: empId,
        employeeName: emp?.name ?? empId,
        createdAt: new Date().toISOString(),
        isShared: true, sharedFrom: parentId,
        quarterlyAchievements: [], checkInComments: [], auditLog: [],
      };
    });
    setGoals((prev) => [...prev, parent, ...children]);
    employeeIds.forEach((empId) => {
      addNotification({ userId: empId, title: 'Shared Goal Assigned', message: `A shared goal "${baseGoal.title}" has been assigned to you.`, type: 'info' });
    });
  }, [users, addNotification]);

  const updateCycle = useCallback((c: Cycle) => {
    setCycle(c);
  }, []);

  const updateEscalationRule = useCallback((rule: EscalationRule) => {
    setEscalationRules((prev) => prev.map((r) => r.id === rule.id ? rule : r));
  }, []);

  const allAuditLogs = goals.flatMap((g) => g.auditLog);

  return (
    <AppContext.Provider value={{
      currentUser, users, login, logout, switchRole,
      goals, createGoal, updateGoal, submitGoal, approveGoal, returnGoal, unlockGoal, deleteGoal,
      logAchievement, addCheckInComment, pushSharedGoal,
      cycle, updateCycle, activeQuarter,
      notifications, addNotification, markNotificationRead, markAllRead,
      escalationRules, escalationLogs, updateEscalationRule,
      allAuditLogs,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
