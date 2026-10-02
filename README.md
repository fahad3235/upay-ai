# UPAY SENTINEL AI
### TrustGraph Financial Intelligence Platform
**DIU CPC × upay — AI HACKATHON 2026**

[![GitHub Repository](https://img.shields.io/badge/GitHub-fahad3235%2Fupay--ai-blue.svg?logo=github)](https://github.com/fahad3235/upay-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg?logo=node.js)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-8E75B2.svg?logo=google-gemini)](https://ai.google.dev)

> *"Before money moves, understand the risk. See the signal, understand the network, protect the money."*

---

## 1. Project Overview

### 1.1 The Problem Addressed
Mobile Financial Services (MFS) platforms like **upay** process millions of daily transactions across cash-ins, P2P transfers, merchant payments, utility bills, and cash-outs. Traditional financial fraud defense mechanisms rely heavily on static, single-transaction threshold rules. In production, this causes two critical structural failures:
1. **High False-Positive Fatigue**: Legitimate transactions (e.g., emergency medical payments, seasonal festival remittances, or Eid bonuses) are erroneously blocked, degrading user trust and burdening compliance desks.
2. **Coordinated Syndicate Evasion**: Advanced fraud networks deliberately stay beneath static transaction limits by leveraging account takeover (ATO), multi-hop smurfing dispersion chains, emulator device farms, and compromised agent cash-out nodes.

**One transaction rarely tells the whole story.** Risk does not arise solely from the monetary amount; it is the confluence of hardware discontinuity, behavioral velocity, novel counterparties, off-hours timing, and graph proximity to illicit aggregation hubs.

### 1.2 Proposed Solution: UPAY SENTINEL AI
**UPAY SENTINEL AI** is an explainable financial safety and risk intelligence platform engineered specifically for modern MFS ecosystems. The platform synthesizes deterministic transaction anomaly scoring, customer behavioral DNA profiling, topological graph intelligence (TrustGraph), and grounded Generative AI into a unified analyst workbench and customer protection system.

```
                   SYNTHETIC TRANSACTION INGESTION
                                 │
                                 ▼
                     FEATURE EXTRACTION ENGINE
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     TRANSACTION ENGINE   BEHAVIORAL ENGINE     GRAPH ENGINE
     (Velocity/Z-Score)   (Customer DNA/Time)  (TrustGraph ML)
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 ▼
                    DETERMINISTIC RISK ENGINE
                   (Additive Signals: 0 - 100)
                                 │
                                 ▼
                        STRUCTURED EVIDENCE
                    (<evidence> Bounded Schema)
                                 │
                                 ▼
                     GROUNDED GEMINI COPILOT
                 (Explanatory AI Investigator)
                                 │
                                 ▼
                     HUMAN ANALYST WORKBENCH
               (1-Click Freeze / SAR Report / Triage)
```

### 1.3 Purpose & Core Philosophy
- **Deterministic Numerical Truth**: LLMs are never permitted to guess numerical risk scores or execute autonomous money holds. Risk math is strictly deterministic, auditable, and bounded (0–100).
- **Grounded AI Explainability**: Generative AI (Gemini 3.8 Flash) acts as an expert financial crime investigator that digests structured evidence to produce plain-language case summaries, counter-hypotheses, and recommended investigative checklists.
- **Privacy & Responsible AI**: Built on 100% synthetic, privacy-safe data. No demographic or protected personal attributes are ever used in scoring.

---

## 2. Features

### 2.1 Implemented Features Matrix
| Feature Module | Path | Description & Impact |
| :--- | :--- | :--- |
| **Analyst Command Center** | `/dashboard` | Real-time monitoring metrics (1,120 transactions, flagged exposure, risk tier distributions, and priority triage queue). |
| **TrustGraph Topological Visualizer** | `/trustgraph` | Interactive draggable SVG network graph with directional animated particle flows, multi-entity filters (Customer, Device, Wallet, Agent, Merchant), and smurf ring halo detection. |
| **Live Surveillance Risk Feed** | `/live-risk` | Simulated real-time transaction ingestion engine with Play, Pause, Speed adjustment (1x/2x/5x), and on-demand incident trigger buttons. |
| **Case Investigation Workbench** | `/investigations` | End-to-end case triage, 1-click account/wallet freeze, audit log timeline, and automated BFIU-compliant SAR report generation. |
| **Simulation Lab & "What-If" Engine** | `/simulation` | Interactive scenario builder featuring the signature **"7-Minute Incident"** (Account Takeover) with live sensitivity sliders. |
| **AI Copilot & Investigation Assistant** | `/copilot` | Dedicated interactive investigator powered by Gemini 3.8 Flash for ad-hoc transaction querying and anomaly interrogation. |
| **Customer Safety Mobile Experience** | `/safety` | Consumer-facing, non-technical plain-language warning interface with *"I recognize this"* vs *"Block & Secure"* response flows. |
| **Responsible AI & Governance Center** | `/responsible-ai` | Algorithmic transparency dashboard detailing mathematical signal decomposition, demographic invariance, and model validation curves. |
| **Model Intelligence & Analytics** | `/intelligence` | Performance benchmarks, confusion matrices, precision-recall trade-offs, and feature importance breakdowns. |
| **Admin Control Plane & RBAC** | `/admin` | Live configuration cockpit to tune risk weights, toggle platform feature flags, manage team credentials, and inspect immutable audit logs. |

### 2.2 How AI Components are Used
1. **Gemini 3.8 Flash LLM (`@google/genai`)**:
   - **Role**: Explanatory narrative generation and case investigation copilot.
   - **Boundary**: Ingests strict, pre-sanitized `<evidence>` delimiters containing transaction attributes, behavioral baseline deviations, and graph neighbors.
   - **Output**: Generates structured investigative case summaries, alternative non-fraud explanations (to mitigate confirmation bias), and prioritized analyst checklists.
   - **Zero-Failure Fallback**: If an external API key is absent or network throttling occurs, the system seamlessly activates an embedded deterministic rule-based explainability engine without breaking any UI flow.

---

## 3. Technology Stack

- **Frontend Core**: React 19 (`react`, `react-dom`), TypeScript 7.0, Vite 8.3
- **Styling & UI**: Tailwind CSS v4, Motion (`motion`), Lucide React icons (`lucide-react`)
- **Data Visualization**: Recharts 3.10, Custom SVG Drag-and-Drop Graph Canvas with Particle Physics
- **Full-Stack Application Server**: Node.js, Express 4.21, `tsx` runtime with Vite dev middleware
- **AI & LLM Services**: Google Gemini 3.8 Flash via `@google/genai` TypeScript SDK
- **Data Architecture**: In-memory relational store with 100% synthetic MFS dataset (110 customers, 1,120 transactions, 30 devices, 20 agents, 30 merchants)
- **Security & Quality**: Automated security regression suite, race-condition verification, and type checking (`tsc --noEmit`)

---

## 4. Requirements & Prerequisites

### 4.1 System & Software Requirements
- **Node.js**: `v18.0.0` or higher (`v20.x` or `v22.x` recommended)
- **Package Manager**: `npm` (v9+) or `bun` / `yarn`
- **Operating System**: Cross-platform (Windows 10/11, macOS, Linux)
- **Browser**: Modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave) or Firefox / Safari with ES2022+ and SVG support
- **Hardware**: Standard laptop/desktop (minimum 4 GB RAM, 1 GHz multi-core CPU)

---

## 5. Installation and Setup

Follow these step-by-step instructions to clone, configure, and execute UPAY SENTINEL AI locally:

### Step 1: Clone the Repository
```bash
git clone https://github.com/fahad3235/upay-ai.git
cd upay-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the provided `.env.example` file to `.env`:
```bash
# On Linux/macOS:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

---

## 6. Environment Variables

All sensitive values use placeholders. Never commit actual secret keys to source control.

| Variable Name | Required | Default Value | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | The network port on which the Express full-stack server listens. |
| `GEMINI_API_KEY` | Optional | `""` *(empty)* | Google Gemini API key used by `@google/genai` to invoke Gemini 3.8 Flash for AI Copilot investigations. |

> **Note on AI Resilience**: A `GEMINI_API_KEY` is **not strictly mandatory** to evaluate the platform. If left blank, UPAY SENTINEL AI automatically engages its high-precision deterministic explanation engine, guaranteeing that judges and evaluators will experience full functionality without external API barriers.

---

## 7. Run and Build Commands

### Development Mode (Recommended for Evaluation)
Starts the combined full-stack Express server and Vite development environment with hot-module reloading:
```bash
npm run dev
```
Once started, access the application in your browser at:  
👉 **`http://localhost:3000`**

### Production Build
Compiles TypeScript, bundles assets, and optimizes CSS using Vite:
```bash
npm run build
```

### Preview Production Build
Starts the production preview server:
```bash
npm run preview
```

### Type Checking & Linting
Validates TypeScript typings across the entire codebase:
```bash
npm run lint
```

---

## 8. Live Deployment URL

- **Primary Repository**: [https://github.com/fahad3235/upay-ai](https://github.com/fahad3235/upay-ai)
- **Live Deployment Link**: [https://upay-ai.vercel.app](https://upay-ai.vercel.app) *(or evaluate locally via `npm run dev` at `http://localhost:3000`)*

---

## 9. Testing Instructions

The project includes automated verification test scripts as well as interactive validation scenarios for judges.

### 9.1 Automated Test Execution

Ensure the application server is running (`npm run dev`) in one terminal, then execute the following tests:

1. **Verify Security & Threat Defenses**:
   ```bash
   npm run test:security
   ```
   *Verifies rate limiting, prompt-injection sanitization, audit trail immutability, and RBAC authorization.*

2. **Verify Concurrency & Race Condition Handlers**:
   ```bash
   npm run test:race
   ```
   *Simulates concurrent triage actions and wallet freezing to verify transactional integrity.*

3. **Verify Core Platform Innovations**:
   ```bash
   npm run test:innovations
   ```
   *Validates mathematical risk decomposition, behavioral DNA deviation calculation, and graph centrality scoring.*

### 9.2 Guided Scenario Walkthrough for Judges: "The 7-Minute Incident"
To observe the synchronized multi-engine intelligence in under 3 minutes:
1. Navigate to **Simulation Lab** (`/simulation`).
2. Click on the pre-loaded incident: **"7-Minute Account Takeover (CUS-DEMO-1042)"**.
3. Step through the timeline:
   - **Minute 0**: Baseline legitimate user Tanvir Rahman (median ৳2,900, trusted device).
   - **Minute 2**: Unrecognized Android Emulator (`DEV-DEMO-104`) logs in from cloud hosting IP.
   - **Minute 4**: Zero-keystroke cadence authentication & immediate registration of unknown recipient (`WALLET-DEMO-809`).
   - **Minute 6**: Outlier transfer of ৳18,500 (+538% deviation). Risk Engine fires **Score: 86 (HIGH)**.
   - **Minute 7**: TrustGraph connects counterparty to smurfing hub `CLUSTER-SMURF-904`.
4. Click **"Open Investigation Case"** to inspect the Gemini Copilot evidence breakdown, trigger a **1-Click Wallet Freeze**, and export a **BFIU-Compliant SAR Report**.

---

## 10. Other Configuration & Access Credentials

### 10.1 Administrative Control Plane Access
The application includes a fully functional Admin Control Plane to calibrate risk weights and toggle features live:
- **Admin URL**: `http://localhost:3000/admin` (or `/login`)
- **Username**: `diudevcis`
- **Password**: `diudevcis`
- **Role**: Lead Compliance Administrator / System Architect

### 10.2 Synthetic Dataset Integrity Disclosures
- **100% Synthetic Data**: In accordance with international privacy regulations and Section 7 of the contest guidelines, all customer names, phone numbers, transaction amounts, and device IDs are synthetically generated.
- **No Private Data Stored**: The repository contains no real banking credentials, PII, or proprietary telecommunications records.
- **Zero Third-Party Tracking**: No external analytics cookies or tracking beacons are loaded.

---

### Team Information & Acknowledgments
- **Project**: UPAY SENTINEL AI
- **Repository**: [fahad3235/upay-ai](https://github.com/fahad3235/upay-ai)
- **Contest**: DIU CPC × upay — AI HACKATHON 2026
- **Developer**: Md. Fahad (`@fahad3235`)
