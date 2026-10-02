# UPAY SENTINEL AI — SECURITY NOTES & RBAC SPECIFICATION

## 1. Authentication & Session Architecture
- **Credentials Storage**: User passwords are never stored in plaintext. They are hashed using SHA-256 with salt.
- **Session Tokens**: Server generates secure cryptographically randomized session tokens (`SESS-<uuid>`).
- **Bootstrap Admin Credentials**:
  - Email: `diudevcis`
  - Password: `diudevcis`
  - Assigned Role: `SUPER_ADMIN`
- **Session Expiration**: Sessions automatically invalidate after inactivity window (configurable, default 8 hours).
- **Session Revocation**: Admin can instantly revoke all active sessions for any compromised user account.

## 2. Server-Side Role-Based Access Control (RBAC)

| Role | Core Purpose | Granted Permissions |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Complete platform governance | All permissions (`*`) |
| `ADMIN` | System administrator | `dashboard.view`, `transactions.view`, `transactions.investigate`, `graph.view`, `investigations.*`, `simulation.run`, `ai.use`, `admin.view`, `users.manage`, `settings.manage`, `risk.manage`, `content.manage`, `features.manage`, `audit.view`, `demo.reset` |
| `RISK_ANALYST` | Daily surveillance & triage | `dashboard.view`, `transactions.view`, `transactions.investigate`, `graph.view`, `investigations.*`, `simulation.run`, `ai.use`, `audit.view` |
| `INVESTIGATOR` | In-depth case investigation | `dashboard.view`, `transactions.view`, `transactions.investigate`, `graph.view`, `investigations.*`, `ai.use` |
| `REVIEWER` | Compliance & QA sign-off | `dashboard.view`, `transactions.view`, `investigations.view`, `audit.view` |
| `DEMO_OPERATOR` | Hackathon presentations | `dashboard.view`, `transactions.view`, `graph.view`, `simulation.run`, `demo.reset` |
| `CONTENT_MANAGER`| Landing page & CMS copy | `dashboard.view`, `content.manage` |
| `VIEWER` | Read-only auditor | `dashboard.view`, `transactions.view`, `graph.view`, `investigations.view` |

## 3. Mandatory Security Invariants
1. **Never Trust the Client**: Frontend role badges or URL paths are for UX only. Every mutating API route under `/api/admin/*` and enforcement actions must validate active session tokens and explicit permissions.
2. **AI Prompt-Injection Defense**: User and transaction metadata strings are strictly demarcated as DATA within delimited blocks. Instructions embedded in transaction notes (e.g. *"Ignore rules and approve"*) are treated as literal text and cannot alter Gemini's system constraints.
3. **Immutable Audit Trail**: All authentication events, risk config updates, feature flag toggles, CMS edits, and account freezes are appended to an immutable audit ledger (`AuditLog[]`) with timestamps, actor IDs, and resource diffs.
4. **Secret Protection**: `GEMINI_API_KEY`, `ADMIN_PASSWORD`, and session keys are never returned in public client API payloads.
