# Full Platform Boost Implementation Plan: Ultra UI, Next-Gen TrustGraph & Advanced Case Management

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform UPAY SENTINEL AI into a tier-1, hackathon-winning fintech defense platform featuring an interactive animated TrustGraph with particle flow and cluster halos, a robust investigation & case management command center with 1-click enforcement and SAR generation, and a high-aesthetic glassmorphism UI with real-time risk tickers and Cmd+K command palette.

**Architecture:** 
- Visual Layer: React 19 + Tailwind CSS v4 design system with custom micro-animations, glowing status badges, glassmorphic surfaces, and quick command palette.
- Graph Layer: Interactive SVG graph engine with draggable physics, animated SVG stroke/particle paths along money trails, multi-hop neighbor spotlighting, and quick camera presets.
- Management Layer: Full lifecycle case investigation triage (status transitions, priority management, analyst assignment, 1-click account/device freezing, SAR export) with audit trail logging both on Express server and in-memory client fallback.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, Express, Vite, @google/genai SDK.

---

### Task 1: Next-Gen TrustGraph Canvas (Interactive Physics, Animated Particle Streams & Smurf Ring Halos)

**Files:**
- Modify: `src/components/graph/TrustGraphCanvas.tsx`
- Modify: `src/pages/TrustGraphPage.tsx`
- Modify: `src/index.css`

**Step 1: Enhance CSS with animated money-flow dash stroke keyframes**
Add custom keyframe animations in `src/index.css` for `.flow-dash` and glowing risk halos.

**Step 2: Add interactive node drag physics and node position state**
In `TrustGraphCanvas.tsx`, track custom node offsets via React state, allowing users to drag nodes around on the SVG canvas while maintaining edge connectivity smoothly.

**Step 3: Implement animated particle flow along transaction edges**
Add SVG `<circle>` or `<path>` elements with `stroke-dashoffset` animation that visibly travel from sender -> intermediate wallets -> cash-out agents, visually demonstrating smurfing money dispersion.

**Step 4: Implement multi-hop neighbor spotlighting and cluster halos**
When a node is hovered or selected:
- Highlight immediate 1-hop and 2-hop connected nodes and edges.
- Dim non-connected nodes to 20% opacity.
- Render a pulsing danger halo around nodes belonging to `CLUSTER-SMURF-904` or nodes flagged CRITICAL/HIGH.

**Step 5: Add camera preset controls & Quick-Action Entity Drawer**
- Add toolbar buttons: "Focus Smurf Ring", "Focus Cash-Out Hub", "Reset View", "Toggle Flow Animation".
- Enhance the slide-over Entity Drawer with:
  * Entity centrality stats (Degree, Flow Volume, Risk Score).
  * 1-Click Action Buttons: "Freeze Wallet", "Blacklist Device IMEI", "View in Gemini Copilot", "Create Urgent Case".

---

### Task 2: Advanced Case & Investigation Management Hub

**Files:**
- Modify: `src/pages/InvestigationsPage.tsx`
- Modify: `src/pages/InvestigationDetailPage.tsx`
- Modify: `src/services/api.ts`
- Modify: `server.ts`

**Step 1: Add backend endpoints for case actions & batch management**
In `server.ts`, implement:
- `PATCH /api/investigations/:id`: update priority, assignedTo, status.
- `POST /api/investigations/:id/actions`: perform "FREEZE_WALLET", "LOCK_DEVICE", "FILE_SAR".
- `POST /api/investigations/batch`: batch update status and assignees.

**Step 2: Add API service methods with offline dataset fallback**
In `src/services/api.ts`, add `executeCaseAction`, `updateCaseDetails`, and `batchUpdateCases` with dataset updates.

**Step 3: Build interactive case triage controls on `InvestigationDetailPage.tsx`**
- Status pipeline selector (NEW → INVESTIGATING → ESCALATED → RESOLVED / DISMISSED) with visual stepper.
- Priority toggle (LOW, MEDIUM, HIGH, CRITICAL).
- Analyst assignment dropdown.
- Quick Enforcement Action Bar:
  * "🚨 Freeze Customer Wallet"
  * "📱 Restrict Device IMEI"
  * "📑 Generate & Export Official SAR Report" (instant download of formatted markdown/text report for Bangladesh Bank compliance).

**Step 4: Add Batch Triage and Advanced Filtering to `InvestigationsPage.tsx`**
- Checkbox multi-select for cases.
- Batch action bar: "Mark Investigating", "Escalate Selected", "Assign to Me".
- Search by case ID, customer name, transaction amount, or risk score.

---

### Task 3: Ultra-Premium UI & Design System Overhaul (Front Everything)

**Files:**
- Modify: `src/components/layout/TopNavbar.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Create: `src/components/common/CommandPalette.tsx`
- Create: `src/components/common/ToastContainer.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Step 1: Build the Global Command Palette (Cmd+K / Ctrl+K)**
Create `src/components/common/CommandPalette.tsx`:
- Triggered by `Ctrl+K`, `Cmd+K`, or search bar in top navbar.
- Instant fuzzy search across:
  * Pages (Dashboard, Live Risk, TrustGraph, Simulation Lab, etc.)
  * Scenarios ("Run 7-Minute Incident", "Reset Demo Database")
  * High-Risk Cases ("CASE-2026-8941", "Tanvir Rahman")
  * Nodes ("AGENT-DEMO-007", "WALLET-DEMO-809")
- Keyboard navigable (ArrowUp, ArrowDown, Enter, Esc).

**Step 2: Add Real-Time Live Risk Ticker in `TopNavbar.tsx`**
- Display an animated live ticker showing the latest synthetic transaction stream events.
- Glowing pulse badge indicating "SENTINEL SURVEILLANCE ACTIVE • 94.2% ACCURACY".
- Quick action button to trigger the signature "7-Minute Incident" demo from anywhere in the app.

**Step 3: Implement Toast Notification System**
Create lightweight toast notification context/dispatcher for immediate visual feedback when an analyst freezes an account, updates a case, copies evidence, or triggers a demo scenario.

**Step 4: Polish Sidebar & Header Aesthetics**
- Polished badge counters for active cases and high-risk alerts.
- Ultra-clean dark slate / modern glass borders with high contrast text.

---

### Task 4: High-Impact Dashboard & Simulation Lab Upgrades

**Files:**
- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/pages/SimulationLabPage.tsx`

**Step 1: Enhance Dashboard KPI Cards & Triage Queue**
- Add live pulse dot indicators on high-risk metrics.
- Clickable risk level cards (clicking "CRITICAL (18)" filters the priority triage queue immediately).
- Visual risk sparkline / gauge in the triage queue table.

**Step 2: Upgrade Simulation Lab with Interactive Risk Gauge**
- Modern SVG circular animated gauge showing live risk score (0-100) with color shift (Green -> Amber -> Red).
- Real-time dynamic signal breakdown bars that adjust instantaneously as the user slides amount, hardware familiarity, counterparty age, and graph proximity.
- Quick preset buttons: "7-Minute ATO", "Smurfing Dispersion", "Normal Grocery Payment", "Off-Hours Medical Emergency".

---

### Task 5: Testing, Typecheck & Verification

**Files:**
- Run: `npm run lint` (`tsc --noEmit`)
- Run: API verification tests via powershell commands
- Run: Subagent browser verification to confirm all pages, graph animations, and triage actions work seamlessly without console errors.
