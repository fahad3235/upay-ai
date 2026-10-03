# UPAY SENTINEL AI - AI TEAM MEMORY (TITAN NEXUS Ω)

## Specialist Team Routing Table

| Logical Specialist | Domain & Responsibility | Active Artifacts |
| :--- | :--- | :--- |
| **NEXUS** | Orchestration & Proportional Lifecycle Execution | `PROJECT_STATE.md`, `docs/DECISIONS.md` |
| **ATLAS** | Codebase mapping, asset discovery, preservation of working features | `docs/PROJECT_MAP.md` |
| **ARCHITECT** | Unified monolithic Express + Vite SPA data flow | `server.ts`, `src/services/api.ts` |
| **UX & FRONTEND** | Premium White Fintech Design System, Syne typography, Micro-animations | `src/index.css`, `src/components/*` |
| **RISK** | Configurable additive feature engine, customer DNA baselines | `src/engine/riskEngine.ts` |
| **GRAPH** | TrustGraph SVG canvas, draggable physics, particle flows, halos | `src/components/graph/TrustGraphCanvas.tsx` |
| **AI** | Grounded Gemini Copilot, prompt safety delimiters, deterministic fallback | `src/components/copilot/AICopilotPanel.tsx` |
| **SECURITY** | Session auth, password hashing, server-side RBAC, audit logging | `server.ts`, `docs/SECURITY_NOTES.md` |
| **DEMO** | Hackathon presentation flow & 60-second WOW story | `docs/DEMO_SCRIPT.md` |
| **QA** | Acceptance testing, type safety (`tsc --noEmit`), build verification | `package.json` |

## Key Rules & Invariants
1. **Source of Truth Rule**: Config in backend database is the ultimate authority. If Admin updates hero title or risk weights, the change propagates immediately to the public landing page and risk engine.
2. **Deterministic Numerical Truth**: Gemini never computes or changes the numerical risk score (0-100). The mathematical risk engine does.
3. **No Agent Theater**: We do not invoke unnecessary independent processes or fake workers. All logic is proportionally routed and verified.
4. **Preserve Existing Code**: Never delete working endpoints or core UI features without direct replacement and proof.
