/**
 * Upay Sentinel AI - Frontend API Client
 * Connects to server-side endpoints with graceful client-side fallback
 * DIU CPC × upay AI Hackathon 2026
 */

import {
  Transaction,
  Customer,
  Agent,
  InvestigationCase,
  GraphData,
  ModelMetrics,
  AuditLog,
  SiteContent,
  FeatureFlags,
  RiskWeights,
  RiskThresholds,
  SystemUser,
  AdminRole,
  DynamicRule,
  CopilotFinOpsStats,
} from '../types';
import {
  getDataset,
  resetDatasetToSeed,
  addTransactionToDataset,
  getDynamicRules,
  addDynamicRule,
  toggleDynamicRule,
  updateTransactionQuarantine,
  updateCaseDualAuth,
  evaluateDryRun,
  verifyAuditChain,
  addAuditLog,
} from '../data/syntheticDataset';
import { evaluateTransactionRisk, getGlobalRiskConfig, setGlobalRiskConfig } from '../engine/riskEngine';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('upay_sentinel_token');
}

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function fetchAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('upay_sentinel_token');
    localStorage.removeItem('upay_sentinel_user');
    if (typeof window !== 'undefined' && window.location.hash !== '#/signin') {
      window.location.hash = '/signin';
    }
  }
  return res;
}

export const api = {
  // Dashboard
  async getDashboard() {
    try {
      const res = await fetchAuth(`${API_BASE}/dashboard`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      // Fallback using in-memory dataset
      const data = getDataset();
      const txs = data.transactions;
      const highRiskTxs = txs.filter(t => t.riskAssessment.riskLevel === 'HIGH' || t.riskAssessment.riskLevel === 'CRITICAL');
      const flaggedValue = highRiskTxs.reduce((sum, t) => sum + t.amount, 0);

      const distribution = {
        LOW: txs.filter(t => t.riskAssessment.riskLevel === 'LOW').length,
        MEDIUM: txs.filter(t => t.riskAssessment.riskLevel === 'MEDIUM').length,
        HIGH: txs.filter(t => t.riskAssessment.riskLevel === 'HIGH').length,
        CRITICAL: txs.filter(t => t.riskAssessment.riskLevel === 'CRITICAL').length,
      };

      const signalCounts: Record<string, number> = {};
      txs.forEach(t => {
        t.riskAssessment.signals.forEach(s => {
          signalCounts[s.name] = (signalCounts[s.name] || 0) + 1;
        });
      });

      const topSignals = Object.entries(signalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const timelineData = [
        { time: '14:00', low: 48, medium: 8, high: 2, critical: 0 },
        { time: '15:00', low: 55, medium: 12, high: 3, critical: 1 },
        { time: '16:00', low: 62, medium: 10, high: 2, critical: 0 },
        { time: '17:00', low: 74, medium: 14, high: 4, critical: 1 },
        { time: '18:00', low: 88, medium: 19, high: 6, critical: 2 },
        { time: '19:00', low: 95, medium: 22, high: 9, critical: 4 },
        { time: '20:00', low: 68, medium: 16, high: 5, critical: 2 },
      ];

      return {
        metrics: {
          transactionsMonitored: txs.length,
          highRiskEvents: highRiskTxs.length,
          activeInvestigations: data.cases.filter(c => c.status === 'INVESTIGATING' || c.status === 'NEW').length,
          suspiciousNetworks: data.graphData.summary.suspiciousClusters,
          flaggedTransactionValue: flaggedValue,
          modelConfidence: 94.2,
          environment: 'SYNTHETIC_DEMO',
        },
        distribution,
        topSignals,
        timelineData,
        recentTransactions: txs.slice(0, 10),
      };
    }
  },

  // Transactions
  async getTransactions(params?: { status?: string; riskLevel?: string; search?: string; limit?: number; offset?: number }) {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.riskLevel) query.set('riskLevel', params.riskLevel);
      if (params?.search) query.set('search', params.search);
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));

      const res = await fetchAuth(`${API_BASE}/transactions?${query.toString()}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      let list = [...data.transactions];
      if (params?.status) list = list.filter(t => t.status === params.status);
      if (params?.riskLevel) list = list.filter(t => t.riskAssessment.riskLevel === params.riskLevel);
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          t =>
            t.id.toLowerCase().includes(q) ||
            t.customerId.toLowerCase().includes(q) ||
            t.customerName.toLowerCase().includes(q) ||
            t.recipientId.toLowerCase().includes(q) ||
            t.deviceId.toLowerCase().includes(q)
        );
      }
      const start = params?.offset || 0;
      const count = params?.limit || 50;
      return {
        total: list.length,
        offset: start,
        limit: count,
        transactions: list.slice(start, start + count),
      };
    }
  },

  async getTransaction(id: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/transactions/${id}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      const tx = data.transactions.find(t => t.id === id);
      const customer = tx ? data.customers.find(c => c.id === tx.customerId) : undefined;
      const relatedCase = tx ? data.cases.find(c => c.transactionId === tx.id || c.customerId === tx.customerId) : undefined;
      return { transaction: tx, customer, relatedCase };
    }
  },

  // Customers
  async getCustomers(params?: { search?: string; riskLevel?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.riskLevel) query.set('riskLevel', params.riskLevel);
      const res = await fetchAuth(`${API_BASE}/customers?${query.toString()}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      let list = [...data.customers];
      if (params?.riskLevel) list = list.filter(c => c.currentRiskLevel === params.riskLevel);
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(c => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
      }
      return { customers: list };
    }
  },

  async getCustomer(id: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/customers/${id}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      const customer = data.customers.find(c => c.id === id);
      const recentTxs = data.transactions.filter(t => t.customerId === id).slice(0, 15);
      const relatedCases = data.cases.filter(c => c.customerId === id);
      return { customer, recentTransactions: recentTxs, cases: relatedCases };
    }
  },

  // Agents
  async getAgents() {
    try {
      const res = await fetchAuth(`${API_BASE}/agents`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return { agents: getDataset().agents };
    }
  },

  async getAgent(id: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/agents/${id}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      const agent = data.agents.find(a => a.id === id);
      const relatedTxs = data.transactions.filter(t => t.agentId === id).slice(0, 10);
      return { agent, relatedTransactions: relatedTxs };
    }
  },

  // Graph
  async getGraph(params?: { entityId?: string; clusterId?: string; riskLevel?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.entityId) query.set('entityId', params.entityId);
      if (params?.clusterId) query.set('clusterId', params.clusterId);
      if (params?.riskLevel) query.set('riskLevel', params.riskLevel);
      const res = await fetchAuth(`${API_BASE}/graph?${query.toString()}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      let nodes = [...data.graphData.nodes];
      let links = [...data.graphData.links];
      if (params?.clusterId) {
        nodes = nodes.filter(n => n.clusterId === params.clusterId);
        const nodeIds = new Set(nodes.map(n => n.id));
        links = links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
      } else if (params?.entityId) {
        const targetId = params.entityId;
        const directLinks = links.filter(l => l.source === targetId || l.target === targetId);
        const neighborIds = new Set<string>([targetId]);
        directLinks.forEach(l => {
          neighborIds.add(l.source);
          neighborIds.add(l.target);
        });
        nodes = nodes.filter(n => neighborIds.has(n.id));
        links = links.filter(l => neighborIds.has(l.source) && neighborIds.has(l.target));
      }
      if (params?.riskLevel) {
        nodes = nodes.filter(n => n.riskLevel === params.riskLevel);
      }
      return { nodes, links, summary: data.graphData.summary };
    }
  },

  // Investigations
  async getInvestigations() {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return { cases: getDataset().cases };
    }
  },

  async getInvestigation(id: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations/${id}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      const c = data.cases.find(x => x.id === id);
      const customer = c ? data.customers.find(cust => cust.id === c.customerId) : undefined;
      return { case: c, customer };
    }
  },

  async addCaseNote(caseId: string, text: string, author = 'Analyst') {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author }),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const c = getDataset().cases.find(x => x.id === caseId);
      if (c) {
        const note = { id: `NOTE-${Date.now()}`, author, text, timestamp: new Date().toISOString() };
        c.analystNotes.push(note);
        return { note, case: c };
      }
      throw new Error('Case not found');
    }
  },

  async updateCaseStatus(caseId: string, status: string, actor = 'Analyst') {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations/${caseId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actor }),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const c = getDataset().cases.find(x => x.id === caseId);
      if (c) {
        c.status = status as any;
        c.updatedTime = new Date().toISOString();
        return { case: c };
      }
      throw new Error('Case not found');
    }
  },

  async updateCaseDetails(caseId: string, patch: { priority?: string; assignedTo?: string; status?: string; actor?: string }) {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const c = getDataset().cases.find(x => x.id === caseId);
      if (c) {
        if (patch.priority) c.priority = patch.priority as any;
        if (patch.assignedTo) c.assignedTo = patch.assignedTo;
        if (patch.status) c.status = patch.status as any;
        c.updatedTime = new Date().toISOString();
        return { case: c };
      }
      throw new Error('Case not found');
    }
  },

  async executeCaseAction(caseId: string, action: string, details = '', actor = 'Fahad Ahmed') {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations/${caseId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details, actor }),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      const c = data.cases.find(x => x.id === caseId);
      if (c) {
        if (!c.enforcementActions) c.enforcementActions = [];
        const newAct = {
          action: action as any,
          timestamp: new Date().toISOString(),
          actor,
          details,
        };
        c.enforcementActions.unshift(newAct);
        c.updatedTime = new Date().toISOString();
        if (action === 'FREEZE_WALLET') {
          const cust = data.customers.find(cust => cust.id === c.customerId);
          if (cust) cust.status = 'SUSPENDED';
        } else if (action === 'UNFREEZE') {
          const cust = data.customers.find(cust => cust.id === c.customerId);
          if (cust) cust.status = 'ACTIVE';
        }
        return { success: true, case: c, action: newAct };
      }
      throw new Error('Case not found');
    }
  },

  async batchUpdateCases(caseIds: string[], action: 'UPDATE_STATUS' | 'UPDATE_PRIORITY' | 'ASSIGN_ANALYST', value: string, actor = 'Analyst') {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseIds, action, value, actor }),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      const updated: typeof data.cases = [];
      caseIds.forEach(id => {
        const c = data.cases.find(x => x.id === id);
        if (c) {
          if (action === 'UPDATE_STATUS') c.status = value as any;
          if (action === 'UPDATE_PRIORITY') c.priority = value as any;
          if (action === 'ASSIGN_ANALYST') c.assignedTo = value;
          c.updatedTime = new Date().toISOString();
          updated.push(c);
        }
      });
      return { success: true, updatedCount: updated.length, cases: updated };
    }
  },

  // Copilot Investigation
  async explainCase(body: {
    caseId?: string;
    transactionId?: string;
    evidence?: any;
    userQuery?: string;
    messages?: Array<{ role: 'user' | 'assistant'; text?: string; content?: string }>;
    history?: any[];
  }) {
    try {
      const res = await fetchAuth(`${API_BASE}/copilot/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      // Deterministic explainable client fallback if network unavailable
      const q = (body.userQuery || '').toLowerCase();
      let fallbackText = '';
      if (q.includes('python') || q.includes('code') || q.includes('sql')) {
        fallbackText = `### Anomaly Detection Algorithm (Python Snippet)

\`\`\`python
import numpy as np

def compute_zscore(amount: float, baseline_median: float, baseline_std: float) -> float:
    """Computes deviation z-score against historical 90-day baseline."""
    if baseline_std <= 0:
        return 0.0
    return (amount - baseline_median) / baseline_std

# Example for flagged transaction:
score = compute_zscore(18500.0, 2900.0, 1015.0)
print(f"Computed Z-Score: {score:.2f} (CRITICAL ANOMALY)")
\`\`\`
*Generated by UPAY Sentinel resilient local client fallback.*`;
      } else if (q.includes('sar') || q.includes('report') || q.includes('bfiu')) {
        fallbackText = `### Suspicious Activity Report (SAR) Regulatory Draft
**Target Subject:** CUS-DEMO-1042 | **Jurisdiction:** Bangladesh Bank BFIU

#### 1. Telemetry Overview
* **Outbound Value:** ৳18,500 (+538% variance above 90-day median)
* **Hardware ID:** DEV-DEMO-104 (Android Emulator fingerprint detected)
* **Destination Wallet:** WALLET-DEMO-809

#### 2. Risk Indicators
* Mule ring convergence at high-volume agent hub AGENT-DEMO-007.
* Zero typing delay indicates scripted credential ingestion (ATO).

#### 3. Recommended Action
* Maintain administrative hold pending verified customer callback.`;
      } else {
        fallbackText = `### Grounded Investigation Analysis

**What Happened:**
Suspicious outbound transfer activity flagged for customer ${body.caseId || 'CUS-DEMO-1042'}. Transaction shows immediate value escalation (+538%) and unfamiliar hardware pairing (Android Emulator DEV-DEMO-104).

**Why It Matters:**
- High-variance departure from synthetic 90-day baseline.
- Hardware node exhibits Android emulator runtime characteristics.
- Intermediary destination links to high-volume cash-out hub AGENT-DEMO-007.

**Recommended Analyst Verification:**
1. Execute customer voice callback via verified registered SIM.
2. Cross-reference SMS OTP distribution timing against auth logs.
3. Place temporary administrative hold on destination cash-out at AGENT-DEMO-007.`;
      }

      return {
        analysis: fallbackText,
        isGrounded: true,
        source: 'SENTINEL_CLIENT_FALLBACK',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Simulation Lab
  async runScenario(scenarioId: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const data = getDataset();
      const heroCust = data.customers.find(c => c.id === 'CUS-DEMO-1042')!;
      const heroTx = data.transactions.find(t => t.id === 'TX-DEMO-49281')!;
      const heroCase = data.cases.find(c => c.id === 'CASE-2026-8941')!;
      return {
        scenarioName: 'The 7-Minute Incident (Account Takeover)',
        customer: heroCust,
        transaction: heroTx,
        case: heroCase,
        steps: heroCase.timeline,
        status: 'EXECUTED',
      };
    }
  },

  async runWhatIf(body: any) {
    try {
      const res = await fetchAuth(`${API_BASE}/simulation/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const assessment = evaluateTransactionRisk({
        transactionId: 'TX-SIM-WHATIF',
        amount: body.amount || 18500,
        recipientId: body.isNewRecipient ? 'REC-UNKNOWN' : 'REC-CURRENT',
        isNewRecipient: body.isNewRecipient ?? true,
        deviceId: body.isNewDevice ? 'DEV-UNKNOWN' : 'DEV-CURRENT',
        isNewDevice: body.isNewDevice ?? true,
        timestamp: body.isNightWindow ? '2026-10-01T02:30:00Z' : '2026-10-01T14:30:00Z',
        recentVelocityCount: body.recentVelocityCount ?? 3,
        connectedToFlaggedCluster: body.connectedToFlaggedCluster ?? true,
        baseline: {
          customerId: 'CUS-SIM-WHATIF',
          recentMedianAmount: body.baselineMedian || 2900,
          recentAvgAmount: (body.baselineMedian || 2900) * 1.15,
          amountStdDev: (body.baselineMedian || 2900) * 0.35,
          typicalTxPerHour: 0.4,
          typicalDailyCount: 2,
          activeHoursStart: 8,
          activeHoursEnd: 22,
          knownDevices: body.isNewDevice ? ['DEV-OTHER'] : ['DEV-CURRENT'],
          knownRecipients: body.isNewRecipient ? ['REC-OTHER'] : ['REC-CURRENT'],
          favoriteTypes: ['SEND_MONEY'] as any,
          accountAgeDays: 340,
          profileRiskScore: 20,
          lastActivityTimestamp: new Date().toISOString(),
        },
      });
      return {
        assessment,
        disclaimer: 'Illustrative sensitivity analysis based on synthetic rule thresholds — not a live production decision.',
      };
    }
  },

  // Admin & System
  async resetDemo() {
    try {
      const res = await fetchAuth(`${API_BASE}/admin/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      resetDatasetToSeed();
      return { success: true, message: 'Synthetic demo database restored to seed state.' };
    }
  },

  async getModelMetrics(): Promise<{ metrics: ModelMetrics[] }> {
    try {
      const res = await fetchAuth(`${API_BASE}/model/metrics`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return { metrics: getDataset().modelMetrics };
    }
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    try {
      const res = await fetchAuth(`${API_BASE}/audit-logs`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return { logs: getDataset().auditLogs };
    }
  },

  // Public Configuration
  async getConfig(): Promise<{
    content: SiteContent;
    features: FeatureFlags;
    riskConfig: any;
    activeUsersCount: number;
  }> {
    try {
      const res = await fetchAuth(`${API_BASE}/config`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return {
        content: {
          siteName: 'upay SENTINEL AI',
          tagline: 'Before money moves, understand the risk.',
          heroTitle: 'Before money moves, understand the risk.',
          heroSubtitle: 'Real-time explainable financial safety intelligence platform combining customer DNA, TrustGraph topology, and grounded generative AI.',
          heroCta: 'EXPLORE DEMO',
          demoLabel: 'SYNTHETIC DEMO',
          footerText: 'DIU CPC × upay — AI Hackathon 2026',
        },
        features: {
          dashboardEnabled: true,
          transactionsEnabled: true,
          trustGraphEnabled: true,
          investigationsEnabled: true,
          copilotEnabled: true,
          simulationEnabled: true,
          customerSafetyEnabled: true,
          reportsEnabled: true,
        },
        riskConfig: getGlobalRiskConfig(),
        activeUsersCount: 5,
      };
    }
  },

  // Authentication (Strict Server-Side Handshake with Static Client Fallback)
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('upay_sentinel_token', data.token);
          localStorage.setItem('upay_sentinel_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch {
      // Server unreachable, fall through to static client fallback
    }

    // Client-side authentication fallback for static deployments (Netlify / Vercel / GitHub Pages)
    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    if (
      (normalizedEmail === 'diudevcis' && cleanPassword === 'diudevcis') ||
      (normalizedEmail === 'admin.nusrat@upay.demo' && cleanPassword === 'diudevcis')
    ) {
      const isSuper = normalizedEmail === 'diudevcis';
      const user: SystemUser = {
        id: isSuper ? 'USR-001' : 'USR-002',
        name: isSuper ? 'Fahad Ahmed (Super Admin)' : 'Nusrat Jahan',
        email: isSuper ? 'diudevcis' : 'admin.nusrat@upay.demo',
        role: isSuper ? 'SUPER_ADMIN' : 'ADMIN',
        department: isSuper ? 'Financial Crime & Safety' : 'MFS Risk Surveillance',
        status: 'ACTIVE',
        lastLogin: new Date().toISOString(),
        permissions: ['*'],
      };
      const token = 'SESS-CLIENT-STANDALONE-' + Date.now();
      localStorage.setItem('upay_sentinel_token', token);
      localStorage.setItem('upay_sentinel_user', JSON.stringify(user));
      return { token, user };
    }

    throw new Error('Invalid credentials. For hackathon evaluation, use diudevcis / diudevcis.');
  },

  logout() {
    const token = localStorage.getItem('upay_sentinel_token');
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }
    localStorage.removeItem('upay_sentinel_token');
    localStorage.removeItem('upay_sentinel_user');
  },

  getStoredUser(): SystemUser | null {
    try {
      const str = localStorage.getItem('upay_sentinel_user');
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },

  async revokeOtherSessions() {
    const res = await fetchAuth(`${API_BASE}/auth/revoke-others`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to revoke other sessions');
    return await res.json();
  },

  // Admin Control Plane
  async getAdminConfig() {
    try {
      const res = await fetchAuth(`${API_BASE}/admin/config`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return {
        content: {
          siteName: 'upay SENTINEL AI',
          tagline: 'Before money moves, understand the risk.',
          heroTitle: 'Before money moves, understand the risk.',
          heroSubtitle: 'Real-time explainable financial safety intelligence platform combining customer DNA, TrustGraph topology, and grounded generative AI.',
          heroCta: 'EXPLORE DEMO',
          demoLabel: 'SYNTHETIC DEMO',
          footerText: 'DIU CPC × upay — AI Hackathon 2026',
        },
        features: {
          dashboardEnabled: true,
          transactionsEnabled: true,
          trustGraphEnabled: true,
          investigationsEnabled: true,
          copilotEnabled: true,
          simulationEnabled: true,
          customerSafetyEnabled: true,
          reportsEnabled: true,
        },
        riskConfig: getGlobalRiskConfig(),
        usersCount: 5,
        activeSessionsCount: 1,
      };
    }
  },

  async updateAdminContent(updates: Partial<SiteContent>) {
    const res = await fetchAuth(`${API_BASE}/admin/content`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update content');
    return await res.json();
  },

  async updateAdminRisk(payload: { weights?: Partial<RiskWeights>; thresholds?: Partial<RiskThresholds> }) {
    const res = await fetchAuth(`${API_BASE}/admin/risk`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update risk config' }));
      throw new Error(err.error || 'Failed to update risk config');
    }
    const data = await res.json();
    // Also sync local engine
    if (data.riskConfig) {
      setGlobalRiskConfig(data.riskConfig);
    }
    return data;
  },

  async updateAdminFeatures(updates: Partial<FeatureFlags>) {
    const res = await fetchAuth(`${API_BASE}/admin/features`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update feature flags');
    return await res.json();
  },

  async getAdminUsers(): Promise<{ users: SystemUser[]; roles: string[] }> {
    try {
      const res = await fetchAuth(`${API_BASE}/admin/users`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return {
        users: [
          {
            id: 'USR-001',
            name: 'Fahad Ahmed (Super Admin)',
            email: 'diudevcis',
            role: 'SUPER_ADMIN',
            department: 'Financial Crime & Safety',
            status: 'ACTIVE',
            lastLogin: new Date().toISOString(),
            permissions: ['*'],
          },
          {
            id: 'USR-002',
            name: 'Nusrat Jahan',
            email: 'admin.nusrat@upay.demo',
            role: 'ADMIN',
            department: 'MFS Risk Surveillance',
            status: 'ACTIVE',
            lastLogin: '2026-10-01T08:15:00Z',
            permissions: ['dashboard.view', 'transactions.view', 'transactions.investigate'],
          },
        ],
        roles: ['SUPER_ADMIN', 'ADMIN', 'MEMBER', 'VIEWER'],
      };
    }
  },

  async createAdminUser(user: { name: string; email: string; role: AdminRole; department: string; password?: string }) {
    const res = await fetchAuth(`${API_BASE}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create user' }));
      throw new Error(err.error || 'Failed to create user');
    }
    return await res.json();
  },

  async updateAdminUser(id: string, updates: Partial<SystemUser>) {
    const res = await fetchAuth(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
  },

  async toggleAdminUserStatus(id: string) {
    const res = await fetchAuth(`${API_BASE}/admin/users/${id}/disable`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to toggle user status' }));
      throw new Error(err.error || 'Failed to toggle user status');
    }
    return await res.json();
  },

  async revokeUserSessions(userId: string) {
    const res = await fetchAuth(`${API_BASE}/admin/users/${userId}/revoke-sessions`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to revoke user sessions');
    return await res.json();
  },

  async resetUserPassword(userId: string, newPassword?: string) {
    const res = await fetchAuth(`${API_BASE}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) throw new Error('Failed to reset user password');
    return await res.json();
  },

  async emergencyLockdown() {
    const res = await fetchAuth(`${API_BASE}/admin/emergency-lockdown`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Emergency lockdown failed' }));
      throw new Error(err.error || 'Emergency lockdown failed');
    }
    return await res.json();
  },

  async toggleMaintenanceMode(enabled?: boolean) {
    const res = await fetchAuth(`${API_BASE}/admin/maintenance-mode`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error('Failed to toggle maintenance mode');
    return await res.json();
  },

  async getSecurityStats() {
    const res = await fetchAuth(`${API_BASE}/admin/security-stats`);
    if (!res.ok) throw new Error('Failed to fetch security stats');
    return await res.json();
  },

  // Soft Quarantine Controls (Item 2)
  async quarantineFreeze(transactionId: string, reason?: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/transactions/${transactionId}/quarantine-freeze`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const tx = updateTransactionQuarantine(transactionId, 'BLOCKED_BY_SENDER');
    addAuditLog({
      actor: 'Customer Self-Service Safety Shield',
      action: 'QUARANTINE_FROZEN',
      resource: transactionId,
      details: `Immediate fund freeze executed during 15-minute escrow. Recipient extraction blocked. Reason: ${reason || 'Customer abort'}`,
    });
    return {
      success: true,
      message: 'Transaction successfully frozen in escrow. Outbound funds safeguarded.',
      transaction: tx,
    };
  },

  async quarantineRelease(transactionId: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/transactions/${transactionId}/quarantine-release`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch {}
    const tx = updateTransactionQuarantine(transactionId, 'RELEASED');
    addAuditLog({
      actor: 'Authorized Analyst / 2FA Verified',
      action: 'QUARANTINE_RELEASED',
      resource: transactionId,
      details: 'Manual authorization of quarantined funds executed. Recipient wallet credited.',
    });
    return {
      success: true,
      message: 'Escrow released. Funds credited to recipient account.',
      transaction: tx,
    };
  },

  // Dynamic Rules Engine (Item 3)
  async getRules(): Promise<{ rules: DynamicRule[] }> {
    try {
      const res = await fetchAuth(`${API_BASE}/rules`);
      if (res.ok) return await res.json();
    } catch {}
    return { rules: getDynamicRules() };
  },

  async createRule(rule: Partial<DynamicRule>) {
    try {
      const res = await fetchAuth(`${API_BASE}/rules`, {
        method: 'POST',
        body: JSON.stringify(rule),
      });
      if (res.ok) return await res.json();
    } catch {}
    const newRule: DynamicRule = {
      id: `RULE-${Date.now().toString().slice(-4)}`,
      name: rule.name || 'New Dynamic Safety Rule',
      description: rule.description || 'Custom behavioral rule created via control console',
      enabled: rule.enabled ?? true,
      conditionField: rule.conditionField || 'amount',
      conditionOperator: rule.conditionOperator || '>',
      conditionValue: rule.conditionValue || 15000,
      action: rule.action || 'FLAG_FOR_REVIEW',
      mode: rule.mode || 'ACTIVE',
      createdBy: 'Fahad Ahmed (Super Admin)',
      createdAt: new Date().toISOString(),
    };
    addDynamicRule(newRule);
    return { success: true, rule: newRule };
  },

  async toggleRule(ruleId: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/rules/${ruleId}/toggle`, {
        method: 'PUT',
      });
      if (res.ok) return await res.json();
    } catch {}
    const updated = toggleDynamicRule(ruleId);
    return { success: true, rule: updated };
  },

  async dryRunRule(params: { conditionField: string; conditionOperator: string; conditionValue: any }) {
    try {
      const res = await fetchAuth(`${API_BASE}/rules/dry-run`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, ...evaluateDryRun(params as any) };
  },

  // FinOps Telemetry (Item 4)
  async getFinOpsStats(): Promise<CopilotFinOpsStats & { activeCacheEntries: number }> {
    try {
      const res = await fetchAuth(`${API_BASE}/copilot/finops`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      totalQueries: 1420,
      cacheHits: 940,
      piiScrubbedCount: 1120,
      tokensSavedEstimate: 658000,
      costSavedUSD: 4.82,
      cacheHitRatePct: 66.2,
      activeCacheEntries: 64,
    };
  },

  // Four-Eyes Dual Authorization (Item 5)
  async dualAuthorizeCase(caseId: string, decision: 'APPROVE' | 'REJECT', notes?: string) {
    try {
      const res = await fetchAuth(`${API_BASE}/investigations/${caseId}/dual-authorize`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const c = updateCaseDualAuth(caseId, decision === 'APPROVE' ? 'APPROVED' : 'REJECTED', 'Fahad Ahmed (Super Admin)');
    return { success: true, case: c };
  },

  // Cryptographic SHA-256 Audit Verification (Item 5)
  async verifyAuditChain(): Promise<{
    isValid: boolean;
    totalBlocks: number;
    latestBlockHash: string;
    genesisHash: string;
    verifiedAt: string;
    brokenBlockId?: string;
    reason?: string;
  }> {
    try {
      const res = await fetchAuth(`${API_BASE}/audit-logs/verify`);
      if (res.ok) return await res.json();
    } catch {}
    return verifyAuditChain() as any;
  },

  // Official Bangladesh Bank goAML XML (Item 6)
  async getGoAMLXml(caseId: string): Promise<string> {
    try {
      const res = await fetchAuth(`${API_BASE}/reports/${caseId}/goaml-xml`);
      if (res.ok) return await res.text();
    } catch {}
    const c = getDataset().cases.find(x => x.id === caseId) || getDataset().cases[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<report xmlns="http://www.unodc.org/goaml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <rentity_id>UPAY-MFS-BFIU-0941</rentity_id>
  <submission_code>E-STR</submission_code>
  <report_date>${new Date().toISOString()}</report_date>
  <currency_code_local>BDT</currency_code_local>
  <reason>${c.aiAnalysis?.whatHappened || 'Account Takeover & Fund Dispersion'}</reason>
  <action>${c.status}</action>
  <transaction>
    <transaction_number>${c.transactionId || 'TX-UNKNOWN'}</transaction_number>
    <amount>${c.amountBDT || 18500}</amount>
    <customer_id>${c.customerId}</customer_id>
  </transaction>
</report>`;
  },
};
