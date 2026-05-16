# ⚛️ AtomQuest — Goal Setting & Tracking Portal

> **AtomQuest Hackathon 1.0 Submission**  
> *In-House Goal Setting & Tracking Portal*

---

## 🚀 Live Demo

| | |
|---|---|
| **Live URL** | _[Add Vercel URL after deploy]_ |
| **Employee Login** | `employee@atomquest.in` / `demo123` |
| **Manager Login** | `manager@atomquest.in` / `demo123` |
| **Admin Login** | `admin@atomquest.in` / `demo123` |

---

## 📋 What This Solves

A fully digital, structured **Goal Lifecycle Management Portal** that eliminates fragmented spreadsheet-based tracking. Covers the complete employee goal journey — from creation & approval to quarterly check-ins and real-time performance visibility.

---

## ✅ Features Implemented

### Phase 1 — Goal Creation & Approval
- [x] Employee goal creation with Thrust Area, Title, Description, UoM, Target, Weightage
- [x] **AI Goal Suggestions** — smart templates per thrust area (unique feature)
- [x] Weightage validation: total = 100%, min 10%, max 8 goals
- [x] Manager (L1) approval workflow with **inline target/weightage editing**
- [x] Return for rework with mandatory notes
- [x] Goal locking on approval — no edits without Admin
- [x] Shared Goals — push departmental KPI to multiple employees

### Phase 2 — Achievement Tracking & Quarterly Check-ins
- [x] Quarterly update interface (Q1–Q4) with window enforcement
- [x] Status selection: Not Started / On Track / At Risk / Completed
- [x] Score computation: Min, Max, Timeline, Zero-based formulas
- [x] **Goal Pulse** — animated SVG score ring (unique feature)
- [x] Manager check-in module with structured comments
- [x] **Confetti celebration** on goal completion (unique feature)
- [x] Real-time score preview while entering actuals

### Reporting & Governance
- [x] Achievement Report — exportable Excel (Planned vs Actual)
- [x] Completion Dashboard — per-department completion rates
- [x] Audit Trail — full log of who changed what and when
- [x] Admin goal unlock with reason logging

### Bonus Features
- [x] Analytics Module — QoQ trends, dept heatmaps, thrust area pie, UoM distribution
- [x] Escalation Rules Engine — configurable triggers + escalation log
- [x] Notification System — in-app alerts for key events
- [x] Role Switcher — instant demo switching between all 3 roles

---

## 🏗️ Architecture

```
┌──────────────┐     HTTPS      ┌─────────────────────────────────┐
│   Employee   │ ─────────────▶ │                                 │
│  Manager L1  │                │      Next.js 16 (App Router)    │
│  Admin / HR  │ ◀───────────── │   + React Context (AppContext)  │
└──────────────┘                │   + localStorage Persistence    │
                                └──────────────┬──────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │  Browser localStorage│
                                    │  (State + Seed Data) │
                                    └─────────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │      Vercel          │
                                    │  (Edge Deployment)   │
                                    └─────────────────────┘
```

### Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, routing, role-based layouts |
| Language | TypeScript | Type safety across all modules |
| Styling | Vanilla CSS + CSS Variables | Full control, no runtime overhead |
| State | React Context API + localStorage | Zero backend cost, instant demo |
| Charts | Recharts | Lightweight, responsive analytics |
| Exports | xlsx library | Excel/CSV achievement reports |
| Animations | canvas-confetti | Goal completion celebrations |
| Icons | Lucide React | Consistent icon system |
| Hosting | Vercel | Free tier, instant deploy, CDN |

---

## 🎯 Unique / Special Features

1. **AI Goal Suggester** — When an employee selects a Thrust Area, smart goal templates are suggested with pre-filled UoM, labels, and descriptions. One-click to apply.

2. **Goal Pulse Ring** — Animated SVG circular progress ring showing weighted Q1 score. Color transitions (green → amber → red) based on performance level.

3. **Live Score Preview** — As a manager or employee types an actual value in check-in, the score percentage updates in real-time using the correct UoM formula.

4. **Completion Celebration** — Canvas confetti fires when any goal is marked Completed during check-in — a delightful micro-interaction.

5. **Check-in Heatmap** — Manager analytics shows a grid heatmap of which team member completed which quarter's check-in.

6. **Role Switcher** — Bottom of sidebar has instant role-switching for judges to demo all 3 journeys without re-logging in.

7. **Weightage Progress Bar** — On the goals list page, a live progress bar shows total weightage allocation across all goals, color-coded (green = 100%, red = over/under).

---

## 🧑‍💻 User Journeys

### Employee Journey
1. Login → Dashboard → Create Goal (select thrust area, get AI suggestions, set target + weightage)
2. Goals Page → Submit all goals for manager approval
3. Check-in Page → Log Q1 actuals → See live score preview → Save → Celebrate 🎉
4. Progress Page → View QoQ score trends and radar chart

### Manager Journey
1. Login → See pending approval alert on dashboard
2. Approvals → Review goals, edit target/weightage inline → Approve or Return
3. Check-in → View planned vs actual for each team member → Add structured comments
4. Shared Goals → Push departmental KPI to selected employees
5. Analytics → QoQ team trends + check-in heatmap

### Admin Journey
1. Login → See org-wide completion rates by department
2. Employees → View all employees' goal status → Unlock locked goals if needed
3. Cycle Config → Set goal-setting window dates + activate quarterly check-in windows
4. Reports → Export Achievement / Completion / Audit Excel files
5. Analytics → QoQ org trends, thrust area distribution, status heatmaps
6. Escalations → Configure trigger rules (no submission / no approval / no check-in)
7. Audit Log → Search and review all changes post-lock

---

## 💰 Cost Optimisation

- **Zero backend cost** — All state managed in React Context + localStorage. No database, no server.
- **No paid APIs** — AI suggestions are pre-built template data, zero API calls.
- **Static-first** — Next.js static rendering where possible; only client components where interactivity is needed.
- **Vercel Free Tier** — Hosting costs ₹0. Edge CDN included.
- **Lazy loading** — Recharts and xlsx loaded only when needed.

---

## 🏃 Running Locally

```bash
git clone <repo-url>
cd atomquest
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Login Page
│   └── dashboard/
│       ├── layout.tsx              # Sidebar + Header shell
│       ├── employee/               # Employee pages
│       │   ├── page.tsx            # Dashboard
│       │   ├── goals/              # Goals CRUD
│       │   ├── checkin/            # Quarterly check-in
│       │   └── progress/           # Progress analytics
│       ├── manager/                # Manager pages
│       │   ├── page.tsx            # Dashboard
│       │   ├── approvals/          # Goal approval workflow
│       │   ├── checkin/            # Team check-in review
│       │   ├── shared/             # Push shared goals
│       │   └── analytics/          # Team analytics
│       └── admin/                  # Admin pages
│           ├── page.tsx            # Dashboard
│           ├── employees/          # User management + unlock
│           ├── cycles/             # Cycle configuration
│           ├── reports/            # Excel exports
│           ├── analytics/          # Org analytics
│           ├── escalations/        # Escalation rules
│           └── audit/              # Audit trail
├── components/
│   ├── layout/                     # Sidebar, Header
│   └── goals/                      # GoalPulse, etc.
├── contexts/
│   └── AppContext.tsx              # Global state + all business logic
└── lib/
    ├── types.ts                    # TypeScript interfaces
    └── utils.ts                    # Score formulas, validators, exporters
```

---

## 📊 BRD Compliance Checklist

| Requirement | Status |
|---|---|
| Goal creation with Thrust Area, UoM, Target, Weightage | ✅ |
| Total weightage = 100% validation | ✅ |
| Min 10% per goal | ✅ |
| Max 8 goals per employee | ✅ |
| Manager approval + inline edit | ✅ |
| Goal locking post-approval | ✅ |
| Shared Goals (read-only title/target) | ✅ |
| Q1–Q4 check-in windows | ✅ |
| Min/Max/Timeline/Zero score formulas | ✅ |
| Manager check-in comments | ✅ |
| Achievement Report (Excel) | ✅ |
| Completion Dashboard | ✅ |
| Audit Trail | ✅ |
| Admin goal unlock | ✅ |
| 3 distinct user roles | ✅ |
| Analytics module (bonus) | ✅ |
| Escalation module (bonus) | ✅ |
| Email/Teams integration | ⏳ Planned |
| Azure AD SSO | ⏳ Planned |

---

*Built with ❤️ for AtomQuest Hackathon 1.0*
