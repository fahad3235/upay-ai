# UPAY SENTINEL AI — PROJECT MAP & ARCHITECTURE

## System Architecture Diagram

```
                 ADMIN CONTROL PLANE (/admin)
  (Content CMS · Risk Weights · Feature Flags · RBAC · Scenarios)
                             │
                             ▼
              CENTRAL CONFIG SERVICE (server.ts)
                             │
      ┌──────────────────────┴──────────────────────┐
      ▼                                             ▼
PUBLIC APPLICATION                            ANALYST WORKSPACE
- Landing Page (CMS-driven)                   - Dashboard (/dashboard)
- How It Works (/how-it-works)                - Live Risk Feed (/live-risk)
- Responsible AI (/responsible-ai)            - Transactions (/transactions)
- Customer Safety (/safety)                   - TrustGraph Canvas (/trustgraph)
                                              - Investigations Hub (/investigations)
                                              - Simulation Lab (/simulation)
                                              - Gemini AI Copilot (/copilot)

                             ▲
                             │
                   CORE BACKEND SERVICES
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   RISK ENGINE         TRUSTGRAPH ML       GROUNDED GEMINI COPILOT
 (Configurable weights  (Topological ring   (Delimited evidence prompt
  & custom thresholds)   centrality engine)  with offline fallback)
```

## Directory & File Responsibilities

### Backend Core
- [`server.ts`](file:///c:/AI%20HACATHON%20UPAY/server.ts): Express server, Vite middleware, RBAC middleware, REST APIs, Config store.
- [`src/data/syntheticDataset.ts`](file:///c:/AI%20HACATHON%20UPAY/src/data/syntheticDataset.ts): Seed generation for 110 customers, 1,120 transactions, devices, agents, cases, audit logs.
- [`src/engine/riskEngine.ts`](file:///c:/AI%20HACATHON%20UPAY/src/engine/riskEngine.ts): Deterministic additive feature engine (0-100 score).

### Frontend Routing & Layout
- [`src/App.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/App.tsx): Client-side hash routing, layout frame, auth provider.
- [`src/components/layout/TopNavbar.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/components/layout/TopNavbar.tsx): Breadcrumb bar, `⌘K` command palette trigger, real-time surveillance marquee ticker.
- [`src/components/layout/Sidebar.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/components/layout/Sidebar.tsx): Global navigation hierarchy with feature flag awareness.
- [`src/components/common/CommandPalette.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/components/common/CommandPalette.tsx): Instant keyboard shortcut palette.

### Key Pages
- [`src/pages/LandingPage.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/pages/LandingPage.tsx): Public showcase consuming CMS content from backend.
- [`src/pages/DashboardPage.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/pages/DashboardPage.tsx): Executive KPI cards, risk distribution, interactive priority queue.
- [`src/pages/TrustGraphPage.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/pages/TrustGraphPage.tsx): Full topological explorer using `TrustGraphCanvas.tsx`.
- [`src/pages/InvestigationsPage.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/pages/InvestigationsPage.tsx): Multi-case batch triage and registry.
- [`src/pages/InvestigationDetailPage.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/pages/InvestigationDetailPage.tsx): 3-column dossier, triage stepper, 1-click enforcement, BFIU SAR download.
- [`src/pages/SimulationLabPage.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/pages/SimulationLabPage.tsx): What-If sensitivity sliders and circular SVG risk meter.
- [`src/pages/AdminPage.tsx`](file:///c:/AI%20HACATHON%20UPAY/src/pages/AdminPage.tsx): Full control plane (Branding, Risk Control, Feature Flags, Team RBAC, Scenarios, Audit).
