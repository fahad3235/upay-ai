# UPAY SENTINEL AI — ARCHITECTURAL DECISION RECORDS (ADR)

## ADR-001: Monolithic Single-Server Architecture for 36-Hour Hackathon Reliability
- **Context**: Hackathon requires reliable live presentation with no networking flakiness between distributed services.
- **Decision**: Deliver frontend and backend as a unified monolithic Express application (`server.ts`) hosting Vite dev middleware with integrated REST APIs, in-memory state with persistence, and client-side fallback.
- **Consequence**: Zero inter-service latency, instant boot, and 100% offline capability.

## ADR-002: Real Centralized Admin Control Plane ("Everything Changes from Admin")
- **Context**: The hackathon master specification mandates that Admin is not a static dashboard, but a real control plane where changes to CMS content, risk weights, risk thresholds, and feature flags immediately alter the actual application.
- **Decision**: Introduce a Centralized System Configuration Store in `server.ts` that serves `/api/admin/settings`, `/api/admin/content`, `/api/admin/risk`, and `/api/admin/features`. Public landing page and risk engine read from this central store.
- **Consequence**: When an admin updates a hero title, modifies a risk weight, or disables a feature flag, the public UI and backend calculations immediately reflect the new state.

## ADR-003: Deterministic Numerical Risk Engine vs. Grounded Generative Copilot
- **Context**: Financial safety requires explainable, auditable, mathematical certainty. LLMs cannot be trusted to generate non-deterministic risk scores or execute automated money locks.
- **Decision**: Numerical risk score (0-100) is strictly calculated by `riskEngine.ts` using configured additive weights. Gemini 3.8 Flash is used exclusively as an investigative narrative assistant bounded by strict evidence delimiters with a local fallback.
- **Consequence**: Zero hallucinated scores, mathematically verifiable signal contributions, and full compliance with Bangladesh Bank guidelines.

## ADR-004: Interactive SVG TrustGraph with Dynamic Physics over Heavy WebGL
- **Context**: Need high-aesthetic network visualizer with draggable nodes, particle streams, and halo effects that runs smoothly without external heavy dependencies.
- **Decision**: Build a custom native SVG graph engine with mathematical coordinate layouts, interactive node dragging, animated dash-offset strokes, and responsive slide-over drawer.
- **Consequence**: High frame rate, zero bundle bloat, and full control over styling.
