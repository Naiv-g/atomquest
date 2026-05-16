# AtomQuest — Goal Setting & Tracking Portal

A web-based portal for managing employee goals across the full performance cycle — from goal creation and manager approval, to quarterly check-ins and final achievement reporting.

Built for AtomQuest Hackathon 1.0.

---

## Live Demo

**URL:** https://atomquest-wine.vercel.app/

Use the demo quick-access buttons on the login page to try all three roles without typing credentials. The role switcher at the bottom of the sidebar lets you jump between them instantly.

| Role | Email | Password |
|---|---|---|
| Employee | employee@atomquest.in | demo123 |
| Manager (L1) | manager@atomquest.in | demo123 |
| Admin / HR | admin@atomquest.in | demo123 |

## Source Code

**GitHub:** https://github.com/Naiv-g/atomquest

---

## What this does

Most organisations track performance goals through spreadsheets and email threads. This makes it hard for managers to see where their team stands, and employees don't always know how their goals connect to what the company is actually trying to achieve.

This portal brings the whole process into one place. Employees create and submit goals, managers review and approve them, and everyone logs quarterly progress throughout the year. HR and admins can see completion rates across the org, export reports, and configure the review cycle.

---

## How to run locally

```bash
git clone https://github.com/Naiv-g/atomquest.git
cd atomquest
npm install
npm run dev
```

Open http://localhost:3000.

---

## Tech stack

| What | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | File-based routing, SSR, TypeScript out of the box |
| Language | TypeScript | Catches type errors early, cleaner component contracts |
| Styling | Vanilla CSS with CSS variables | No extra dependencies, full control over every detail |
| State | React Context + localStorage | Works without a backend, data persists between sessions |
| Charts | Recharts | Good defaults, responsive, works well with React |
| Exports | xlsx | Generates proper Excel files for achievement reports |
| Confetti | canvas-confetti | Used when an employee marks a goal as completed |
| Icons | Lucide React | Consistent, clean icon set |
| Deployment | Vercel | Free tier, automatic deploys from GitHub |

No database required. All data is stored in the browser's localStorage.

---

## Features

### Employee
- Create goals with a Thrust Area, target value, unit of measurement, and weightage
- The form validates that total weightage across all goals equals 100%, each goal has at least 10% weightage, and you can't have more than 8 goals
- Submit goals for manager review
- Log actual achievements each quarter when the check-in window is open
- See a live score preview as you type your actual value
- View quarter-by-quarter progress charts
- Get notified when goals are approved or returned

### Manager
- Review submitted goals, edit the target or weightage inline before approving
- Return goals with a note explaining what needs to change
- Approved goals get locked — the employee can't change them without admin intervention
- View the team's quarterly check-ins with planned vs actual figures side by side
- Add comments on individual goals during each quarter's check-in
- Push a shared goal to multiple team members at once (useful for department-wide KPIs)
- Team analytics showing scores by member and by thrust area, plus a check-in completion grid

### Admin / HR
- Dashboard showing goal completion rates by department
- Unlock approved goals when exceptions are needed (e.g. a role change mid-year), with a reason logged
- Configure the goal-setting window dates and which quarterly check-in windows are open
- Export achievement data, completion status, and the full audit log to Excel
- Manage escalation rules — which situations trigger notifications and after how many days
- Full audit trail showing every change made to goals after they were locked

---

## Goal scoring

Each goal type uses a different formula:

- **Higher is better (min):** Score = (Actual ÷ Target) × 100, capped at 150%
- **Lower is better (max):** Score = (Target ÷ Actual) × 100, capped at 150%
- **Timeline:** 100% if delivered on or before the target date, reduces by ~1% per day late (zeroes out at 90 days)
- **Zero-based:** 100% if actual = 0, otherwise 0%

The overall score shown on the dashboard is the weighted average across all goals.

---

## What the problem statement asked for, and where it's covered

| Requirement | Where |
|---|---|
| Goal creation with Thrust Area, UoM, Target, Weightage | Employee → Create Goal |
| Total weightage must equal 100% | Enforced in the create and edit forms |
| Minimum 10% per goal | Enforced in the create and edit forms |
| Maximum 8 goals per employee | Enforced on submission |
| Manager approval with ability to edit inline | Manager → Approvals |
| Goal locking after approval | Automatic on approval |
| Return with notes | Manager → Approvals (Return for Rework) |
| Shared goals from manager to team | Manager → Shared Goals |
| Q1–Q4 check-in windows | Employee → Check-ins |
| Four score formulas (min/max/timeline/zero) | Computed automatically from UoM type |
| Manager check-in comments | Manager → Team Check-ins |
| Achievement report (planned vs actual) | Admin → Reports → Export Excel |
| Completion dashboard | Admin → Dashboard, Admin → Reports |
| Audit trail | Admin → Audit Log |
| Admin can unlock goals | Admin → All Employees |
| Three user roles | Employee, Manager, Admin — all implemented |
| Analytics | Employee progress charts, manager team analytics, admin org analytics |
| Escalation rules | Admin → Escalations |
| Notifications | Sidebar notification count, in-app notification list |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                      Login page
│   └── dashboard/
│       ├── layout.tsx                Sidebar + header shell
│       ├── employee/
│       │   ├── page.tsx              Employee dashboard
│       │   ├── goals/                Goal list, create, edit, detail
│       │   ├── checkin/              Quarterly check-in form
│       │   └── progress/            Charts and achievement history
│       ├── manager/
│       │   ├── page.tsx              Manager dashboard
│       │   ├── approvals/            Goal approval workflow
│       │   ├── checkin/              Team check-in review and comments
│       │   ├── shared/               Push shared goals
│       │   └── analytics/           Team performance charts
│       └── admin/
│           ├── page.tsx              Admin dashboard
│           ├── employees/            All employees + goal unlock
│           ├── cycles/               Check-in window configuration
│           ├── reports/              Excel export
│           ├── analytics/            Org-wide charts
│           ├── escalations/          Escalation rules
│           └── audit/               Audit log
├── components/
│   ├── layout/                       Sidebar, Header
│   └── goals/                       GoalPulse ring component
├── contexts/
│   └── AppContext.tsx               All state and business logic
└── lib/
    ├── types.ts                     TypeScript types
    └── utils.ts                     Score computation, validation, export
```

---

## Notes

- This is a frontend-only demo. There is no backend database — everything runs in the browser using localStorage. This means data resets if you clear your browser storage.
- The "AI suggestions" in the goal creation form are pre-built templates per thrust area, not live API calls.
- Adding a real database (e.g. Supabase) would be straightforward — the AppContext functions map directly to CRUD operations.
