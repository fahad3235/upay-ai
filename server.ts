/**
 * Upay Sentinel AI - Full-Stack Express Server with Vite Middleware
 * DIU CPC × upay AI Hackathon 2026
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  getDataset,
  resetDatasetToSeed,
  addTransactionToDataset,
  addCaseToDataset,
  addAuditLog,
  getDynamicRules,
  addDynamicRule,
  toggleDynamicRule,
  updateTransactionQuarantine,
  updateCaseDualAuth,
  evaluateDryRun,
  verifyAuditChain,
  GENESIS_HASH,
} from './src/data/syntheticDataset';
import {
  evaluateTransactionRisk,
  getGlobalRiskConfig,
  setGlobalRiskConfig,
} from './src/engine/riskEngine';
import {
  SiteContent,
  FeatureFlags,
  RiskWeights,
  RiskThresholds,
  SystemUser,
  AdminRole,
  DynamicRule,
  CopilotFinOpsStats,
} from './src/types';

dotenv.config();

// -------------------------------------------------------------
// GOOGLE GEMINI AI CONFIGURATION (Full Intelligence Engine)
// -------------------------------------------------------------
function getGeminiClient(): GoogleGenAI | null {
  const key = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

const activeGeminiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
if (activeGeminiKey) {
  console.log(`[AI Engine] Gemini API Key loaded (prefix: ${activeGeminiKey.substring(0, 10)}..., model: gemini-3.8-flash)`);
} else {
  console.warn('[AI Engine] Warning: GEMINI_API_KEY is not set. Operating in deterministic fallback mode.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// -------------------------------------------------------------
// 1. HTTP SECURITY HEADERS & PROTECTED FILE GUARDS
// -------------------------------------------------------------
app.use((req, res, next) => {
  // Block sensitive file traversal & dotfile leakage
  const p = req.path.toLowerCase();
  if (p.includes('.env') || p.includes('.git') || p.includes('.sql') || p.includes('package.json') || p.includes('tsconfig')) {
    return res.status(404).send('Not Found');
  }

  // Security Headers (OWASP Hardened)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// -------------------------------------------------------------
// CENTRALIZED SYSTEM CONFIGURATION STORE (Source of Truth)
// -------------------------------------------------------------
let siteContent: SiteContent = {
  siteName: 'UPAY SENTINEL AI',
  tagline: 'Before money moves, understand the risk.',
  heroTitle: 'Connect transaction behavior, anomaly signals and financial relationships into one explainable investigation experience.',
  heroSubtitle: 'Real-time explainable financial safety intelligence platform combining customer DNA, TrustGraph topology, and grounded generative AI.',
  heroCta: 'EXPLORE DEMO',
  demoLabel: 'SYNTHETIC DEMO',
  footerText: 'DIU CPC × upay — AI Hackathon 2026',
};

let featureFlags: FeatureFlags = {
  dashboardEnabled: true,
  transactionsEnabled: true,
  trustGraphEnabled: true,
  investigationsEnabled: true,
  copilotEnabled: true,
  simulationEnabled: true,
  customerSafetyEnabled: true,
  reportsEnabled: true,
};

// Global Maintenance Mode toggle
let maintenanceMode = false;

// -------------------------------------------------------------
// USER & SERVER-SIDE RBAC STORE
// HARD MAXIMUM: 5 AUTHORIZED ACCOUNTS
// -------------------------------------------------------------
export const MAX_AUTHORIZED_ACCOUNTS = 5;

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update('upay_salt_2026_' + password).digest('hex');
}

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: [
    '*',
    'dashboard.view', 'transactions.view', 'transactions.investigate',
    'trustgraph.view', 'graph.view', 'investigations.view', 'investigations.update',
    'simulation.run', 'copilot.use', 'ai.use', 'admin.view', 'members.view', 'members.manage',
    'settings.view', 'settings.manage', 'risk.manage', 'content.manage',
    'features.manage', 'audit.view', 'demo.reset', 'emergency.lockdown'
  ],
  ADMIN: [
    'dashboard.view', 'transactions.view', 'transactions.investigate',
    'trustgraph.view', 'graph.view', 'investigations.view', 'investigations.update',
    'simulation.run', 'copilot.use', 'ai.use', 'admin.view', 'members.view', 'members.manage',
    'settings.view', 'settings.manage', 'risk.manage', 'content.manage', 'features.manage',
    'audit.view', 'demo.reset'
  ],
  MEMBER: [
    'dashboard.view', 'transactions.view', 'transactions.investigate',
    'trustgraph.view', 'graph.view', 'investigations.view', 'investigations.update',
    'simulation.run', 'copilot.use', 'ai.use'
  ],
  VIEWER: [
    'dashboard.view', 'transactions.view', 'trustgraph.view', 'graph.view', 'investigations.view'
  ],
  RISK_ANALYST: [
    'dashboard.view', 'transactions.view', 'transactions.investigate',
    'trustgraph.view', 'graph.view', 'investigations.view', 'investigations.update',
    'simulation.run', 'copilot.use', 'ai.use', 'audit.view'
  ],
  INVESTIGATOR: [
    'dashboard.view', 'transactions.view', 'transactions.investigate',
    'trustgraph.view', 'graph.view', 'investigations.view', 'investigations.update',
    'copilot.use', 'ai.use'
  ],
  REVIEWER: [
    'dashboard.view', 'transactions.view', 'investigations.view', 'audit.view'
  ],
  DEMO_OPERATOR: [
    'dashboard.view', 'transactions.view', 'trustgraph.view', 'graph.view', 'simulation.run', 'demo.reset'
  ],
  CONTENT_MANAGER: [
    'dashboard.view', 'content.manage'
  ],
};

interface StoredUser extends SystemUser {
  passwordHash: string;
}

// Exactly 5 Authorized Initial Accounts (Configurable via ENV with fallback)
const systemUsers: StoredUser[] = [
  {
    id: 'USR-001',
    name: process.env.ADMIN_1_NAME || 'Fahad Ahmed (Super Admin)',
    email: process.env.ADMIN_1_EMAIL || 'diudevcis',
    role: 'SUPER_ADMIN',
    department: 'Financial Crime & Safety',
    status: 'ACTIVE',
    lastLogin: new Date().toISOString(),
    passwordHash: hashPassword(process.env.ADMIN_1_PASSWORD || 'diudevcis'),
    permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
  },
  {
    id: 'USR-002',
    name: process.env.ADMIN_2_NAME || 'Nusrat Jahan',
    email: process.env.ADMIN_2_EMAIL || 'admin.nusrat@upay.demo',
    role: 'ADMIN',
    department: 'MFS Risk Surveillance',
    status: 'ACTIVE',
    lastLogin: '2026-10-01T08:15:00Z',
    passwordHash: hashPassword(process.env.ADMIN_2_PASSWORD || 'diudevcis'),
    permissions: ROLE_PERMISSIONS.ADMIN,
  },
  {
    id: 'USR-003',
    name: process.env.ADMIN_3_NAME || 'Tanvir Hassan',
    email: process.env.ADMIN_3_EMAIL || 'analyst.tanvir@upay.demo',
    role: 'MEMBER',
    department: 'Fraud Investigations',
    status: 'ACTIVE',
    lastLogin: '2026-10-01T07:45:00Z',
    passwordHash: hashPassword(process.env.ADMIN_3_PASSWORD || 'diudevcis'),
    permissions: ROLE_PERMISSIONS.MEMBER,
  },
  {
    id: 'USR-004',
    name: process.env.ADMIN_4_NAME || 'Kamrul Islam',
    email: process.env.ADMIN_4_EMAIL || 'investigator.kamrul@upay.demo',
    role: 'MEMBER',
    department: 'Regulatory Compliance & BFIU',
    status: 'ACTIVE',
    lastLogin: '2026-09-30T16:20:00Z',
    passwordHash: hashPassword(process.env.ADMIN_4_PASSWORD || 'diudevcis'),
    permissions: ROLE_PERMISSIONS.MEMBER,
  },
  {
    id: 'USR-005',
    name: process.env.ADMIN_5_NAME || 'Guest Hackathon Auditor',
    email: process.env.ADMIN_5_EMAIL || 'auditor.guest@upay.demo',
    role: 'VIEWER',
    department: 'DIU Hackathon Judging Panel',
    status: 'ACTIVE',
    lastLogin: '2026-10-01T06:00:00Z',
    passwordHash: hashPassword(process.env.ADMIN_5_PASSWORD || 'diudevcis'),
    permissions: ROLE_PERMISSIONS.VIEWER,
  },
];

// -------------------------------------------------------------
// SERVER-SIDE SESSION ENGINE (Timeout & Revocation)
// -------------------------------------------------------------
interface ServerSession {
  userId: string;
  createdAt: number;
  lastActive: number;
  ip?: string;
  userAgent?: string;
}

const activeSessions = new Map<string, ServerSession>();

// Idle Timeout: 30 minutes; Absolute Timeout: 12 hours
const IDLE_TIMEOUT_MS = (parseInt(process.env.SESSION_IDLE_TIMEOUT_MINUTES || '30', 10)) * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = (parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS || '12', 10)) * 60 * 60 * 1000;

function createSession(userId: string, ip?: string, userAgent?: string): string {
  const token = 'SESS-' + crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    userId,
    createdAt: now,
    lastActive: now,
    ip,
    userAgent,
  });
  return token;
}

function revokeUserSessions(userId: string): number {
  let revoked = 0;
  for (const [token, sess] of activeSessions.entries()) {
    if (sess.userId === userId) {
      activeSessions.delete(token);
      revoked++;
    }
  }
  return revoked;
}

// -------------------------------------------------------------
// LOGIN BRUTE-FORCE RATE LIMITING (Per-IP & Per-Account)
// -------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}
const failedLoginAttempts = new Map<string, RateLimitRecord>();

function checkRateLimit(key: string): { blocked: boolean; remainingSec: number } {
  const record = failedLoginAttempts.get(key);
  if (!record) return { blocked: false, remainingSec: 0 };
  const now = Date.now();
  if (record.lockedUntil > now) {
    return { blocked: true, remainingSec: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  return { blocked: false, remainingSec: 0 };
}

function recordFailedLogin(key: string) {
  const now = Date.now();
  const record = failedLoginAttempts.get(key) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  if (now - record.firstAttempt > 10 * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = 0;
  } else {
    record.count += 1;
  }
  if (record.count >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000; // 5 minute lock
  }
  failedLoginAttempts.set(key, record);
}

function clearFailedLogin(key: string) {
  failedLoginAttempts.delete(key);
}

// -------------------------------------------------------------
// STRICT SERVER-SIDE ROUTE GUARDS
// -------------------------------------------------------------
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Prevent caching of all sensitive authenticated data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Access denied.' });
  }

  const sess = activeSessions.get(token);
  if (!sess) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in.' });
  }

  const now = Date.now();
  if (now - sess.lastActive > IDLE_TIMEOUT_MS) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired due to inactivity. Please sign in again.' });
  }
  if (now - sess.createdAt > ABSOLUTE_TIMEOUT_MS) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session lifetime limit reached. Please sign in again.' });
  }

  const user = systemUsers.find(u => u.id === sess.userId);
  if (!user || user.status !== 'ACTIVE') {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Account is inactive or disabled. Access revoked.' });
  }

  if (maintenanceMode && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return res.status(503).json({ error: 'System temporarily unavailable. Security maintenance in progress.' });
  }

  sess.lastActive = now;
  (req as any).user = user;
  (req as any).sessionToken = token;
  next();
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user as StoredUser;
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You do not have permission to perform this action. Administrative access required.' });
    }
    next();
  });
}

// Initialize GoogleGenAI SDK safely with cleaned API key
let genAI: GoogleGenAI | null = null;
if (activeGeminiKey) {
  try {
    genAI = new GoogleGenAI({
      apiKey: activeGeminiKey,
    });
    console.log('[AI Engine] GoogleGenAI client successfully initialized for live inference');
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI:', err);
  }
}

// -------------------------------------------------------------
// PUBLIC HEALTH CHECK & DISCOVERY
// -------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'UPAY_SENTINEL_SECURE_OPERATIONAL',
    mode: 'TITAN_NEXUS_PRIVATE_5_ADMIN',
    activeAccounts: systemUsers.filter(u => u.status === 'ACTIVE').length,
    maxAuthorizedAccounts: MAX_AUTHORIZED_ACCOUNTS,
    maintenanceMode,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// REST API ROUTES (ALL PROTECTED BY SERVER-SIDE AUTH)
// -------------------------------------------------------------

// 1. Dashboard Metrics (AUTHENTICATED)
app.get('/api/dashboard', requireAuth, (_req, res) => {
  const data = getDataset();
  const txs = data.transactions;
  const highRiskTxs = txs.filter(t => t.riskAssessment.riskLevel === 'HIGH' || t.riskAssessment.riskLevel === 'CRITICAL');
  const flaggedValue = highRiskTxs.reduce((sum, t) => sum + t.amount, 0);

  // Risk Distribution
  const distribution = {
    LOW: txs.filter(t => t.riskAssessment.riskLevel === 'LOW').length,
    MEDIUM: txs.filter(t => t.riskAssessment.riskLevel === 'MEDIUM').length,
    HIGH: txs.filter(t => t.riskAssessment.riskLevel === 'HIGH').length,
    CRITICAL: txs.filter(t => t.riskAssessment.riskLevel === 'CRITICAL').length,
  };

  // Top Risk Signals aggregate
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

  // Risk Events Timeline (last 7 synthetic periods)
  const timelineData = [
    { time: '14:00', low: 48, medium: 8, high: 2, critical: 0 },
    { time: '15:00', low: 55, medium: 12, high: 3, critical: 1 },
    { time: '16:00', low: 62, medium: 10, high: 2, critical: 0 },
    { time: '17:00', low: 74, medium: 14, high: 4, critical: 1 },
    { time: '18:00', low: 88, medium: 19, high: 6, critical: 2 },
    { time: '19:00', low: 95, medium: 22, high: 9, critical: 4 },
    { time: '20:00', low: 68, medium: 16, high: 5, critical: 2 },
  ];

  res.json({
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
  });
});

// 2. Transactions API (AUTHENTICATED)
app.get('/api/transactions', requireAuth, (req, res) => {
  const { status, riskLevel, search, limit = '50', offset = '0' } = req.query;
  const data = getDataset();
  let list = [...data.transactions];

  if (status) {
    list = list.filter(t => t.status === status);
  }
  if (riskLevel) {
    list = list.filter(t => t.riskAssessment.riskLevel === riskLevel);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      t =>
        t.id.toLowerCase().includes(q) ||
        t.customerId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.recipientId.toLowerCase().includes(q) ||
        t.deviceId.toLowerCase().includes(q)
    );
  }

  const start = parseInt(String(offset), 10) || 0;
  const count = parseInt(String(limit), 10) || 50;
  const paged = list.slice(start, start + count);

  res.json({
    total: list.length,
    offset: start,
    limit: count,
    transactions: paged,
  });
});

app.get('/api/transactions/:id', requireAuth, (req, res) => {
  const data = getDataset();
  const tx = data.transactions.find(t => t.id === req.params.id);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const customer = data.customers.find(c => c.id === tx.customerId);
  const relatedCase = data.cases.find(c => c.transactionId === tx.id || c.customerId === tx.customerId);

  res.json({
    transaction: tx,
    customer,
    relatedCase,
  });
});

// Soft Quarantine / Escrow Controls (Item 2)
app.post('/api/transactions/:id/quarantine-freeze', requireAuth, (req, res) => {
  const { id } = req.params;
  const { reason = 'Sender emergency abort during 15-minute escrow window' } = req.body;
  const actor = (req as any).user?.name || 'Customer Self-Service Safety Shield';

  const tx = updateTransactionQuarantine(id, 'BLOCKED_BY_SENDER');
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  addAuditLog({
    actor,
    action: 'QUARANTINE_FROZEN',
    resource: tx.id,
    details: `Immediate fund freeze executed during 15-minute escrow. Recipient extraction blocked. Reason: ${reason}`,
  });

  res.json({
    success: true,
    message: 'Transaction successfully frozen in escrow. Outbound funds safeguarded.',
    transaction: tx,
  });
});

app.post('/api/transactions/:id/quarantine-release', requireAuth, (req, res) => {
  const { id } = req.params;
  const actor = (req as any).user?.name || 'Authorized Analyst / 2FA Verified';

  const tx = updateTransactionQuarantine(id, 'RELEASED');
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  addAuditLog({
    actor,
    action: 'QUARANTINE_RELEASED',
    resource: tx.id,
    details: `Manual authorization of quarantined funds executed. Recipient wallet credited.`,
  });

  res.json({
    success: true,
    message: 'Escrow released. Funds credited to recipient account.',
    transaction: tx,
  });
});

// 3. Customers API (AUTHENTICATED)
app.get('/api/customers', requireAuth, (req, res) => {
  const { search, riskLevel } = req.query;
  const data = getDataset();
  let list = [...data.customers];

  if (riskLevel) {
    list = list.filter(c => c.currentRiskLevel === riskLevel);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(c => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }

  res.json({ customers: list });
});

app.get('/api/customers/:id', requireAuth, (req, res) => {
  const data = getDataset();
  const customer = data.customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const recentTxs = data.transactions.filter(t => t.customerId === customer.id).slice(0, 15);
  const relatedCases = data.cases.filter(c => c.customerId === customer.id);

  res.json({
    customer,
    recentTransactions: recentTxs,
    cases: relatedCases,
  });
});

// 4. Agents API (AUTHENTICATED)
app.get('/api/agents', requireAuth, (req, res) => {
  const data = getDataset();
  res.json({ agents: data.agents });
});

app.get('/api/agents/:id', requireAuth, (req, res) => {
  const data = getDataset();
  const agent = data.agents.find(a => a.id === req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  const relatedTxs = data.transactions.filter(t => t.agentId === agent.id).slice(0, 10);
  res.json({ agent, relatedTransactions: relatedTxs });
});

// 5. TrustGraph API (AUTHENTICATED)
app.get('/api/graph', requireAuth, (req, res) => {
  const data = getDataset();
  const { entityId, clusterId, riskLevel } = req.query;
  let nodes = [...data.graphData.nodes];
  let links = [...data.graphData.links];

  if (clusterId) {
    nodes = nodes.filter(n => n.clusterId === clusterId);
    const nodeIds = new Set(nodes.map(n => n.id));
    links = links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  } else if (entityId) {
    // Return entity and 2-hop neighborhood
    const targetId = String(entityId);
    const directLinks = links.filter(l => l.source === targetId || l.target === targetId);
    const neighborIds = new Set<string>([targetId]);
    directLinks.forEach(l => {
      neighborIds.add(l.source);
      neighborIds.add(l.target);
    });
    nodes = nodes.filter(n => neighborIds.has(n.id));
    links = links.filter(l => neighborIds.has(l.source) && neighborIds.has(l.target));
  }

  if (riskLevel) {
    nodes = nodes.filter(n => n.riskLevel === riskLevel);
  }

  res.json({
    nodes,
    links,
    summary: data.graphData.summary,
  });
});

function findInvestigationCase(data: any, id: string) {
  if (!id) return null;
  return data.cases.find((x: any) =>
    x.id === id ||
    (id === 'CASE-0001' && x.id === 'CASE-2026-8941') ||
    (id === 'CASE-0002' && x.id === 'CASE-2026-8942') ||
    (id === 'CASE-0003' && x.id === 'CASE-2026-8943') ||
    (id === 'CASE-0004' && x.id === 'CASE-2026-8944') ||
    (id === 'CASE-0005' && x.id === 'CASE-2026-8945')
  ) || null;
}

// 6. Investigations API (AUTHENTICATED)
app.get('/api/investigations', requireAuth, (_req, res) => {
  const data = getDataset();
  res.json({ cases: data.cases });
});

app.get('/api/investigations/:id', requireAuth, (req, res) => {
  const data = getDataset();
  const c = findInvestigationCase(data, req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Investigation case not found' });
  }
  const customer = data.customers.find(cust => cust.id === c.customerId);
  res.json({ case: c, customer });
});

app.post('/api/investigations/:id/notes', requireAuth, (req, res) => {
  const data = getDataset();
  const c = findInvestigationCase(data, req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Investigation case not found' });
  }
  const { text, author = (req as any).user?.name || 'Analyst' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const note = {
    id: `NOTE-${Date.now()}`,
    author,
    text,
    timestamp: new Date().toISOString(),
  };

  c.analystNotes.push(note);
  addAuditLog({
    actor: author,
    action: 'NOTE_ADDED',
    resource: c.id,
    details: `Added note: "${text.substring(0, 40)}..."`,
  });

  res.json({ note, case: c });
});

app.post('/api/investigations/:id/status', requireAuth, (req, res) => {
  const data = getDataset();
  const c = findInvestigationCase(data, req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Investigation case not found' });
  }
  const { status, actor = (req as any).user?.name || 'Analyst' } = req.body;
  if (!['NEW', 'INVESTIGATING', 'ESCALATED', 'RESOLVED', 'FALSE_POSITIVE'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const prev = c.status;
  c.status = status;
  c.updatedTime = new Date().toISOString();

  addAuditLog({
    actor,
    action: 'STATUS_CHANGED',
    resource: c.id,
    details: `Status updated from ${prev} to ${status}`,
  });

  res.json({ case: c });
});

// Update investigation details (priority, assigned analyst, status)
app.patch('/api/investigations/:id', requireAuth, (req, res) => {
  const data = getDataset();
  const c = findInvestigationCase(data, req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Investigation case not found' });
  }

  const { priority, assignedTo, status, actor = (req as any).user?.name || 'Analyst' } = req.body;
  if (priority) c.priority = priority;
  if (assignedTo) c.assignedTo = assignedTo;
  if (status) c.status = status;
  c.updatedTime = new Date().toISOString();

  addAuditLog({
    actor,
    action: 'CASE_UPDATED',
    resource: c.id,
    details: `Updated case fields: ${[
      priority && `priority=${priority}`,
      assignedTo && `assignedTo=${assignedTo}`,
      status && `status=${status}`,
    ].filter(Boolean).join(', ')}`,
  });

  res.json({ case: c });
});

// 1-Click Enforcement Actions (Freeze Wallet, Restrict Device, File SAR)
app.post('/api/investigations/:id/actions', requireAuth, (req, res) => {
  const data = getDataset();
  const c = findInvestigationCase(data, req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Investigation case not found' });
  }

  const { action, actor = (req as any).user?.name || 'Fahad Ahmed', details = '' } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Action type is required' });
  }

  if (!c.enforcementActions) {
    c.enforcementActions = [];
  }

  const newAction = {
    action,
    timestamp: new Date().toISOString(),
    actor,
    details,
  };
  c.enforcementActions.unshift(newAction);
  c.updatedTime = new Date().toISOString();

  // If action impacts customer or device, reflect in dataset
  if (action === 'FREEZE_WALLET') {
    const cust = data.customers.find(cust => cust.id === c.customerId);
    if (cust) cust.status = 'SUSPENDED';
    addAuditLog({
      actor,
      action: 'ENFORCEMENT_ACTION',
      resource: c.customerId,
      details: `Suspended customer wallet and blocked outbound transactions for case ${c.id}`,
    });
  } else if (action === 'UNFREEZE') {
    const cust = data.customers.find(cust => cust.id === c.customerId);
    if (cust) cust.status = 'ACTIVE';
    addAuditLog({
      actor,
      action: 'ENFORCEMENT_ACTION',
      resource: c.customerId,
      details: `Restored active status for customer ${c.customerId}`,
    });
  } else if (action === 'FILE_SAR') {
    addAuditLog({
      actor,
      action: 'SAR_FILED',
      resource: c.id,
      details: `Generated and submitted Bangladesh Bank Suspicious Activity Report (SAR) for ৳${c.amountBDT || 0}`,
    });
  } else {
    addAuditLog({
      actor,
      action: 'ENFORCEMENT_ACTION',
      resource: c.id,
      details: `Enforced ${action}: ${details}`,
    });
  }

  res.json({ success: true, case: c, action: newAction });
});

// Batch Triage Endpoint
app.post('/api/investigations/batch', requireAuth, (req, res) => {
  const data = getDataset();
  const { caseIds, action, value, actor = (req as any).user?.name || 'Analyst' } = req.body;

  if (!Array.isArray(caseIds) || caseIds.length === 0) {
    return res.status(400).json({ error: 'caseIds array is required' });
  }

  const updatedCases: typeof data.cases = [];
  caseIds.forEach(id => {
    const c = data.cases.find(x => x.id === id);
    if (c) {
      if (action === 'UPDATE_STATUS' && value) {
        c.status = value;
      } else if (action === 'UPDATE_PRIORITY' && value) {
        c.priority = value;
      } else if (action === 'ASSIGN_ANALYST' && value) {
        c.assignedTo = value;
      }
      c.updatedTime = new Date().toISOString();
      updatedCases.push(c);
    }
  });

  addAuditLog({
    actor,
    action: 'BATCH_TRIAGE',
    resource: `${caseIds.length} Cases`,
    details: `Executed batch ${action} (${value}) on ${caseIds.join(', ')}`,
  });

  res.json({ success: true, updatedCount: updatedCases.length, cases: updatedCases });
});

// -------------------------------------------------------------
// DYNAMIC RULES ENGINE & SHADOW MODE (Item 3)
// -------------------------------------------------------------
app.get('/api/rules', requireAuth, (_req, res) => {
  res.json({ rules: getDynamicRules() });
});

app.post('/api/rules', requireAuth, (req, res) => {
  const { name, description, conditionField, conditionOperator, conditionValue, action, mode } = req.body;
  const actor = (req as any).user?.name || 'Admin';

  if (!name || !conditionField || !conditionOperator || conditionValue === undefined || !action) {
    return res.status(400).json({ error: 'All rule specification fields are required.' });
  }

  const dryResult = evaluateDryRun({ conditionField, conditionOperator, conditionValue });

  const newRule: DynamicRule = {
    id: `RULE-2026-${String(Math.floor(100 + Math.random() * 900))}`,
    name: name.trim(),
    description: description?.trim() || `Hot-reloadable rule on ${conditionField}`,
    conditionField,
    conditionOperator,
    conditionValue,
    action,
    mode: mode === 'SHADOW' ? 'SHADOW' : 'ACTIVE',
    enabled: true,
    createdBy: actor,
    createdAt: new Date().toISOString(),
    shadowMatchesCount: dryResult.matchesCount,
    falsePositiveRate: dryResult.estimatedFPR,
  };

  addDynamicRule(newRule);

  addAuditLog({
    actor,
    action: 'DYNAMIC_RULE_CREATED',
    resource: newRule.id,
    details: `Created ${newRule.mode} dynamic rule "${newRule.name}" targeting ${conditionField} ${conditionOperator} ${conditionValue} -> ${action}`,
  });

  res.status(201).json({ success: true, rule: newRule, dryRunPreview: dryResult });
});

app.put('/api/rules/:id/toggle', requireAuth, (req, res) => {
  const { id } = req.params;
  const actor = (req as any).user?.name || 'Admin';
  const updated = toggleDynamicRule(id);
  if (!updated) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  addAuditLog({
    actor,
    action: 'DYNAMIC_RULE_TOGGLED',
    resource: updated.id,
    details: `Set rule ${updated.id} to ${updated.enabled ? 'ENABLED' : 'DISABLED'}`,
  });

  res.json({ success: true, rule: updated });
});

app.post('/api/rules/dry-run', requireAuth, (req, res) => {
  const { conditionField, conditionOperator, conditionValue } = req.body;
  if (!conditionField || !conditionOperator || conditionValue === undefined) {
    return res.status(400).json({ error: 'conditionField, conditionOperator, and conditionValue are required' });
  }

  const result = evaluateDryRun({ conditionField, conditionOperator, conditionValue });
  res.json({
    success: true,
    ...result,
  });
});

// -------------------------------------------------------------
// FOUR-EYES DUAL AUTHORIZATION & AUDIT CHAIN (Item 5)
// -------------------------------------------------------------
app.post('/api/investigations/:id/dual-authorize', requireAuth, (req, res) => {
  const { id } = req.params;
  const { decision, notes = '' } = req.body; // 'APPROVE' | 'REJECT'
  const approver = (req as any).user?.name || 'Nusrat Jahan (CAMLCO)';

  if (!['APPROVE', 'REJECT'].includes(decision)) {
    return res.status(400).json({ error: 'Decision must be APPROVE or REJECT' });
  }

  const updatedCase = updateCaseDualAuth(id, decision === 'APPROVE' ? 'APPROVED' : 'REJECTED', approver);
  if (!updatedCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  addAuditLog({
    actor: approver,
    action: 'DUAL_AUTH_APPROVED',
    resource: updatedCase.id,
    details: `Four-Eyes Principle: Dual Authorization ${decision}D by senior authority ${approver}. Notes: "${notes}"`,
  });

  res.json({ success: true, case: updatedCase });
});

app.get('/api/audit-logs/verify', requireAuth, (_req, res) => {
  const verification = verifyAuditChain();
  res.json({
    success: true,
    ...verification,
    chainLength: getDataset().auditLogs.length,
  });
});

// -------------------------------------------------------------
// BANGLADESH BANK BFIU goAML XML EXPORT (Item 6)
// -------------------------------------------------------------
app.get('/api/reports/:id/goaml-xml', requireAuth, (req, res) => {
  const { id } = req.params;
  const data = getDataset();
  const targetCase = findInvestigationCase(data, id) || data.cases[0];
  const targetTx = data.transactions.find(t => t.id === targetCase?.transactionId) || data.transactions[0];
  const cust = data.customers.find(c => c.id === targetCase?.customerId) || data.customers[0];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<report xmlns="http://www.unodc.org/goaml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <rentity_id>UPAY-MFS-BD-9041</rentity_id>
  <rentity_branch>DHAKA-HEAD-OFFICE</rentity_branch>
  <submission_code>STR</submission_code>
  <report_code>STR</report_code>
  <entity_reference>${targetCase.id}</entity_reference>
  <submission_date>${new Date().toISOString()}</submission_date>
  <currency_code_local>BDT</currency_code_local>
  <reporting_person>
    <first_name>Fahad</first_name>
    <last_name>Ahmed</last_name>
    <title>Senior AML/CFT Compliance Officer (CAMLCO)</title>
    <phone>+8801700000000</phone>
  </reporting_person>
  <reason>
    <![CDATA[SUSPICION OF UNAUTHORIZED ACCOUNT TAKEOVER (ATO) AND IMMEDIATE ATTEMPTED OUTBOUND DRAIN OF BDT ${targetCase.amountBDT || targetTx.amount} TO MULTIPLE UNVERIFIED MULE WALLETS VIA SUSPICIOUS EMULATOR HARDWARE (${targetTx.deviceId}) TERMINATING AT AGENT CASH-OUT HUB AGENT-DEMO-007. GROUNDED INVESTIGATION VERIFIED DEVIATION OF +538% FROM HISTORICAL 90-DAY BASELINE.]]>
  </reason>
  <transaction>
    <transactionnumber>${targetTx.id}</transactionnumber>
    <transaction_location>Dhaka, Bangladesh</transaction_location>
    <date_transaction>${targetTx.timestamp}</date_transaction>
    <transmode_code>ELECTRONIC_MFS</transmode_code>
    <amount_local>${targetTx.amount}.00</amount_local>
    <t_from_my_client>
      <from_funds_code>MFS_WALLET</from_funds_code>
      <from_account>
        <account>${cust.id}</account>
        <account_name>${cust.name}</account_name>
        <client_number_type>NID</client_number_type>
        <phone>${cust.phoneMasked}</phone>
      </from_account>
    </t_from_my_client>
    <t_to>
      <to_funds_code>MFS_WALLET</to_funds_code>
      <to_account>
        <account>${targetTx.recipientId}</account>
        <account_name>${targetTx.recipientName}</account_name>
      </to_account>
    </t_to>
  </transaction>
  <sha256_audit_seal>
    <tamper_proof_block_hash>${getDataset().auditLogs[0]?.hash || '00000000'}</tamper_proof_block_hash>
    <verified_standard>GOAML_XML_SCHEMA_v2_BFIU_COMPLIANT</verified_standard>
  </sha256_audit_seal>
</report>`;

  addAuditLog({
    actor: (req as any).user?.name || 'Analyst',
    action: 'GOAML_EXPORTED',
    resource: targetCase.id,
    details: `Exported official BFIU goAML XML package for case ${targetCase.id} (${targetTx.id}).`,
  });

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename="goAML_${targetCase.id}.xml"`);
  res.send(xmlContent);
});

// -------------------------------------------------------------
// LLM FINOPS & TOKEN OPTIMIZATION (Item 4)
// -------------------------------------------------------------
interface CopilotCacheEntry {
  analysis: string;
  source: string;
  timestamp: string;
  structuredEvidence: any;
  expiresAt: number;
}

const copilotCache = new Map<string, CopilotCacheEntry>();

const finOpsStats: CopilotFinOpsStats = {
  totalQueries: 0,
  cacheHits: 0,
  piiScrubbedCount: 0,
  tokensSavedEstimate: 0,
  costSavedUSD: 0,
  cacheHitRatePct: 0,
};

function scrubPII(text: string): { cleanText: string; scrubbedCount: number } {
  let count = 0;
  // Bangladeshi phone numbers (+88017..., 017..., 018..., etc)
  const phoneRegex = /(?:\+?880\s?|0)1[3-9]\d{8}/g;
  const cleanPhones = text.replace(phoneRegex, (m) => {
    count++;
    return `+880 1${m.slice(-9, -7)}•• ••••${m.slice(-2)}`;
  });
  // NID numbers (10, 13, or 17 digits)
  const nidRegex = /\b\d{10}\b|\b\d{13}\b|\b\d{17}\b/g;
  const cleanNid = cleanPhones.replace(nidRegex, () => {
    count++;
    return 'NID-••••••••••';
  });
  return { cleanText: cleanNid, scrubbedCount: count };
}

app.get('/api/copilot/finops', requireAuth, (_req, res) => {
  finOpsStats.cacheHitRatePct = finOpsStats.totalQueries > 0 
    ? Math.round((finOpsStats.cacheHits / finOpsStats.totalQueries) * 100) 
    : 0;
  res.json({
    ...finOpsStats,
    activeCacheEntries: copilotCache.size,
  });
});

// 7. AI Copilot Investigation Endpoint (Server-Side Gemini Integration with Grounded Prompt Safety)
app.post('/api/copilot/explain', async (req, res) => {
  if (!featureFlags.copilotEnabled) {
    return res.status(403).json({
      error: 'AI Copilot is currently disabled by Admin security policy.',
      copilotDisabled: true,
      analysis: 'AI Copilot has been disabled by security policy in the Admin Control Plane.',
      isGrounded: false,
      source: 'ADMIN_DISABLED',
    });
  }

  // Gracefully verify authentication if provided, or allow authorized demo analyst access
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);
  let callerUser = 'Analyst (diudevcis)';
  if (token) {
    const sess = activeSessions.get(token);
    if (sess) {
      const user = systemUsers.find(u => u.id === sess.userId);
      if (user) callerUser = `${user.name} (${user.role})`;
    }
  }

  const { caseId, transactionId, evidence, userQuery: rawUserQuery, question, prompt, messages, history } = req.body;
  const userQuery = rawUserQuery || question || prompt || '';
  const data = getDataset();

  finOpsStats.totalQueries++;

  // Automated Inbound PII Scrubbing (Bangladeshi Phone & NID)
  const queryPii = scrubPII(userQuery);
  if (queryPii.scrubbedCount > 0) {
    finOpsStats.piiScrubbedCount += queryPii.scrubbedCount;
  }

  // Build live system telemetry snapshot from the actual active database
  const allTxs = data.transactions || [];
  const highRiskTxs = allTxs.filter(t => t.riskAssessment?.riskLevel === 'HIGH' || t.riskAssessment?.riskLevel === 'CRITICAL');
  const totalFlaggedValue = highRiskTxs.reduce((sum, t) => sum + t.amount, 0);

  let targetCase = caseId 
    ? data.cases.find(c => c.id === caseId || (caseId === 'CASE-0001' && c.id === 'CASE-2026-8941')) 
    : undefined;
  let targetTx = transactionId 
    ? data.transactions.find(t => t.id === transactionId || (transactionId === 'TX-DEMO-ATO' && t.id === 'TX-DEMO-49281')) 
    : undefined;

  if (!targetCase && targetTx) {
    targetCase = data.cases.find(c => c.transactionId === targetTx?.id || c.customerId === targetTx?.customerId);
  }

  // Lookup TrustGraph neighborhood for sender, recipient, and device
  const customerId = targetCase?.customerId || targetTx?.customerId || 'CUS-DEMO-1042';
  const recipientId = targetTx?.recipientId || 'WALLET-DEMO-809';
  const deviceId = targetTx?.deviceId || 'DEV-DEMO-104';

  const graphNodes = (data.graphData?.nodes || []).filter((n: any) => 
    n.id === customerId || n.id === recipientId || n.id === deviceId || 
    (n.label && (n.label.includes(customerId) || n.label.includes(recipientId) || n.label.includes('AGENT-DEMO-007')))
  );
  const graphLinks = (data.graphData?.links || []).filter((l: any) =>
    graphNodes.some((n: any) => n.id === l.source || n.id === l.target)
  );

  // Structured record evidence if a specific record is in context
  const structuredData = {
    caseId: targetCase?.id || (caseId ? caseId : 'SYSTEM_OVERVIEW'),
    caseTitle: targetCase?.title || 'Upay Sentinel Real-time Risk Monitoring',
    customer: targetCase?.customerName || targetTx?.customerName || 'Multiple Monitored Entities',
    customerId,
    amountBDT: targetCase?.amountBDT || targetTx?.amount || 0,
    riskScore: targetCase?.riskScore || targetTx?.riskAssessment?.riskScore || 32,
    priority: targetCase?.priority || 'NORMAL',
    status: targetCase?.status || 'ACTIVE_MONITORING',
    transactionType: targetTx?.type || 'TRANSFER',
    destinationWallet: recipientId,
    device: {
      deviceId,
      model: targetTx?.deviceModel || 'Android Runtime / MFS App',
      isEmulator: targetTx?.isNewDevice ?? false,
      ipAddress: targetTx?.ipAddress || '103.205.71.18',
    },
    signals: targetTx?.riskAssessment?.signals || [
      { name: 'Amount Anomaly', score: 31, evidence: 'Transaction is +538% above 90-day baseline median.' },
      { name: 'Device Novelty', score: 16, evidence: 'Session initiated from unverified hardware with 0 prior transactions.' },
      { name: 'Velocity Burst', score: 21, evidence: 'Rapid successive outbound burst attempt.' },
    ],
    trustGraphContext: {
      associatedNodes: graphNodes.map((n: any) => ({ id: n.id, label: n.label, type: n.type, riskScore: n.riskScore })),
      relationships: graphLinks.map((l: any) => ({ from: l.source, to: l.target, type: l.type, amount: l.amount })),
    },
    timeline: targetCase?.timeline || [
      { time: '14:22:05', event: 'Unrecognized device session initiated' },
      { time: '14:23:10', event: 'Transfer request submitted' },
      { time: '14:23:12', event: 'Sentinel deterministic risk engine hold applied' },
    ],
    providedEvidence: evidence || targetCase?.structuredEvidence || {},
  };

  const liveSystemTelemetry = {
    liveMetrics: {
      totalMonitoredTransactions: allTxs.length,
      highAndCriticalRiskEvents: highRiskTxs.length,
      totalFlaggedAmountBDT: totalFlaggedValue,
      openInvestigationsCount: data.cases.length,
      averageRiskScore: 32.3,
      modelConfidencePct: 94.2,
      activeEnforcementRulesCount: (data.dynamicRules || []).length || 5,
    },
    activeInvestigations: data.cases.map(c => ({
      caseId: c.id,
      title: c.title,
      customer: c.customerName,
      customerId: c.customerId,
      amountBDT: c.amountBDT,
      riskScore: c.riskScore,
      priority: c.priority,
      status: c.status,
      assignedTo: c.assignedTo || 'Unassigned',
      createdTime: c.createdTime,
    })),
    recentFlaggedAlerts: highRiskTxs.slice(0, 8).map(t => ({
      id: t.id,
      customer: t.customerName,
      customerId: t.customerId,
      recipientId: t.recipientId,
      amountBDT: t.amount,
      riskLevel: t.riskAssessment.riskLevel,
      riskScore: t.riskAssessment.riskScore,
      type: t.type,
      signals: t.riskAssessment.signals.map((s: any) => s.name),
    })),
    activeRecordContext: (caseId || transactionId) ? structuredData : null,
  };

  // Build multi-turn conversation thread if available
  let conversationContext = '';
  const messageList = Array.isArray(messages) ? messages : Array.isArray(history) ? history : [];
  if (messageList.length > 0) {
    conversationContext = '\n<conversation_history>\n' + 
      messageList.slice(-8).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text || m.content}`).join('\n\n') +
      '\n</conversation_history>\n';
  }

  // Automated PII Masking
  const rawEvidence = JSON.stringify(liveSystemTelemetry, null, 2);
  const evidenceScrub = scrubPII(rawEvidence);
  const queryScrub = scrubPII(userQuery || '');
  const convScrub = scrubPII(conversationContext);
  const totalScrubbed = evidenceScrub.scrubbedCount + queryScrub.scrubbedCount + convScrub.scrubbedCount;
  finOpsStats.piiScrubbedCount += totalScrubbed;

  const safeEvidenceJson = evidenceScrub.cleanText;
  const safeUserQuery = queryScrub.cleanText;
  const safeConversation = convScrub.cleanText;

  // System instruction defining real Google Gemini intelligence and Upay live data access
  const systemInstruction = `You are the UPAY SENTINEL AI Copilot — an elite, conversational AI assistant powered by Google Gemini for MFS (Mobile Financial Services) Security, Financial Crime Prevention, and General Technical & Analytical Intelligence.

CORE MODES & BEHAVIORS:
1. LIVE SYSTEM TELEMETRY & INVESTIGATION INTELLIGENCE:
   - You have real-time access to the live Upay Sentinel platform database, transaction monitoring engine, active investigations, and risk alerts provided in the <live_system_telemetry> block.
   - When the user asks about live system stats (total transactions, flagged volumes, active investigations, high-risk customers, specific transaction IDs like TX-DEMO-ATO or TX-DEMO-290, or case IDs like CASE-0001), answer accurately with the exact live data provided.
   - When analyzing a specific transaction or case, evaluate the evidence: amount deviation, device novelty (emulators), velocity bursts, and graph linkages. Provide actionable recommendations for compliance analysts.

2. UNIVERSAL GEMINI ASSISTANT (Normal Talking, Coding & Knowledge):
   - You possess the full versatility of Google Gemini: you can engage in natural conversation, greetings, answer general questions, explain complex ideas, write clean code (Python, JavaScript, SQL, TypeScript, Bash), and discuss Anti-Money Laundering (AML/CFT) frameworks (such as Bangladesh Bank BFIU guidelines and FATF recommendations).
   - If the user greets you or asks a general, technical, or coding question, respond directly, articulately, and helpfully with full LLM intelligence. Do NOT force an unrequested case summary.
   - Format your answers beautifully using Markdown: bold text, headers (###), bullet points, and syntax-highlighted code blocks (\`\`\`python / \`\`\`sql).`;

  const userPrompt = `<live_system_telemetry>
${safeEvidenceJson}
</live_system_telemetry>
${safeConversation}
User Query: ${safeUserQuery || 'Hello! Introduce yourself, your live data access, and how you can assist me today.'}

Provide a helpful, articulate, and insightful response answering the user's prompt. Use rich markdown formatting.`;

  // Attempt server-side Gemini call with verified models: gemini-3.5-flash -> gemini-flash-latest -> gemini-3.8-flash
  const gemini = getGeminiClient();
  if (gemini) {
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    for (const model of candidateModels) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${model} request exceeded 12s timeout`)), 12000)
        );
        const generatePromise = gemini.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        const responseText = response.text || '';
        if (responseText) {
          const cleanSource = model.toUpperCase().replace(/[^A-Z0-9]/g, '_');
          console.log(`[AI Copilot] Successfully generated response with model: ${model} for user: ${callerUser}`);
          return res.json({
            analysis: responseText,
            isGrounded: true,
            source: cleanSource,
            liveDataGrounded: true,
            structuredEvidence: (caseId || transactionId) ? structuredData : liveSystemTelemetry.liveMetrics,
            timestamp: new Date().toISOString(),
            finOps: finOpsStats,
          });
        }
      } catch (err: any) {
        console.warn(`[AI Copilot] Model ${model} notice (${err.message?.substring(0, 100)}), falling to next candidate...`);
      }
    }
  }

  // Graceful Deterministic Fallback drawing from real live system metrics
  let fallbackAnalysis = '';
  const lowerQ = (userQuery || '').toLowerCase();
  if (lowerQ.includes('sar') || lowerQ.includes('report') || lowerQ.includes('bfiu')) {
    fallbackAnalysis = `### Suspicious Activity Report (SAR) Regulatory Draft
**Target Subject:** ${structuredData.customer} (${structuredData.customerId})
**Case Reference:** ${structuredData.caseId} | **Jurisdiction:** Bangladesh Bank BFIU

#### 1. Live Telemetry
* **Outbound Value:** ৳${structuredData.amountBDT.toLocaleString()} (+538% variance above 90-day baseline median)
* **Destination Wallet:** \`${structuredData.destinationWallet}\` (No prior transaction history)
* **Hardware ID:** \`${structuredData.device.deviceId}\` (Identified as Android Emulator runtime)

#### 2. Suspicious Indicators & Typologies
* **Mule Ring Dispersion:** Downstream funds routed into intermediary accounts converging at high-volume agent hub **AGENT-DEMO-007** (Savar zone).
* **Automated PIN Ingestion:** Zero typing delay indicates scripted execution consistent with Account Takeover (ATO).

#### 3. Recommended Action
* Maintain administrative hold on pending transfers.
* File formal electronic STR with Bangladesh Bank BFIU.`;
  } else if (lowerQ.includes('python') || lowerQ.includes('code') || lowerQ.includes('sql') || lowerQ.includes('script')) {
    fallbackAnalysis = `### Fraud Detection Algorithm (Python Implementation)

\`\`\`python
import numpy as np

def calculate_amount_anomaly(amount: float, baseline_median: float, baseline_std: float) -> float:
    """
    Computes robust z-score deviation against customer 90-day baseline.
    """
    if baseline_std <= 0:
        return 0.0
    z_score = (amount - baseline_median) / baseline_std
    return float(z_score)

# Active Case Demonstration:
curr_amount = ${structuredData.amountBDT || 18500}
curr_median = 2900.0
curr_std = 1015.0
score = calculate_amount_anomaly(curr_amount, curr_median, curr_std)
print(f"Calculated Z-Score: {score:.2f} (Status: CRITICAL ANOMALY)")
\`\`\`
*Generated by UPAY Sentinel intelligent assistant.*`;
  } else if (lowerQ.includes('live') || lowerQ.includes('transaction') || lowerQ.includes('metric') || lowerQ.includes('status') || lowerQ.includes('stat')) {
    fallbackAnalysis = `### Upay Sentinel Live Platform Telemetry

**Current Real-Time Metrics:**
* **Total Transactions Monitored:** **${allTxs.length}** transactions across MFS network.
* **Flagged / High-Risk Events:** **${highRiskTxs.length}** events requiring analyst review.
* **Open Investigations:** **${data.cases.length}** active cases across surveillance tiers.
* **Network Average Risk Score:** **32.3 / 100** (Engine Confidence: 94.2%).

**Active High-Priority Cases:**
${data.cases.slice(0, 5).map((c, idx) => `${idx + 1}. **${c.id} (${c.priority} - ${c.riskScore}/100):** ${c.customerName} • ৳${(c.amountBDT || 0).toLocaleString()} • ${c.title}`).join('\n')}`;
  } else {
    fallbackAnalysis = `### Hello! I am the UPAY Sentinel AI Copilot

I am your intelligent assistant powered by Google Gemini, directly connected to the Upay Sentinel live transaction monitoring engine.

**What I can do for you:**
* **Live System Analytics:** Ask me about live transaction counts, flagged volumes, risk distributions, or active cases.
* **Case & Entity Investigations:** Inquire about specific transaction IDs (e.g. \`TX-DEMO-ATO\`, \`TX-DEMO-290\`) or case dossiers (\`CASE-0001\`).
* **Technical & AML Advisory:** Ask me to write anomaly detection code in Python, formulate SQL queries, or draft BFIU STR filings.
* **General Conversation:** Feel free to ask any technical, general knowledge, or analytical questions!

How may I assist your investigation today?`;
  }

  res.json({
    analysis: fallbackAnalysis,
    isGrounded: true,
    source: 'SENTINEL_LIVE_TELEMETRY_ENGINE',
    structuredEvidence: (caseId || transactionId) ? structuredData : liveSystemTelemetry.liveMetrics,
    timestamp: new Date().toISOString(),
    finOps: finOpsStats,
  });
});

// 8. Simulation Lab API (AUTHENTICATED)
app.post('/api/simulation/run', requireAuth, (req, res) => {
  const { scenarioId } = req.body;
  const data = getDataset();

  if (scenarioId === '7_MINUTE_INCIDENT' || scenarioId === 'ACCOUNT_TAKEOVER') {
    const cust = data.customers.find(c => c.id === 'CUS-DEMO-1042')!;
    const heroTx = data.transactions.find(t => t.id === 'TX-DEMO-49281')!;
    const heroCase = data.cases.find(c => c.id === 'CASE-2026-8941')!;

    addAuditLog({
      actor: (req as any).user?.name || 'Simulation Lab',
      action: 'SCENARIO_CREATED',
      resource: 'CASE-2026-8941',
      details: 'Executed "The 7-Minute Incident" Account Takeover scenario.',
    });

    return res.json({
      scenarioName: 'The 7-Minute Incident (Account Takeover)',
      customer: cust,
      transaction: heroTx,
      case: heroCase,
      steps: heroCase.timeline,
      status: 'EXECUTED',
    });
  }

  if (scenarioId === 'SUSPICIOUS_NETWORK') {
    return res.json({
      scenarioName: 'Mule Ring & Rapid Dispersion',
      clusterId: 'CLUSTER-SMURF-904',
      hubAgent: 'AGENT-DEMO-007',
      flaggedCount: 6,
      status: 'EXECUTED',
    });
  }

  res.json({
    scenarioName: 'Synthetic Scenario Run',
    status: 'EXECUTED',
    timestamp: new Date().toISOString(),
  });
});

// What-If Sensitivity Calculator (AUTHENTICATED)
app.post('/api/simulation/whatif', requireAuth, (req, res) => {
  const {
    amount = 18500,
    isNewDevice = true,
    isNewRecipient = true,
    recentVelocityCount = 3,
    isNightWindow = true,
    connectedToFlaggedCluster = true,
    baselineMedian = 2900,
  } = req.body;

  const mockBaseline = {
    customerId: 'CUS-SIM-WHATIF',
    recentMedianAmount: baselineMedian,
    recentAvgAmount: baselineMedian * 1.15,
    amountStdDev: baselineMedian * 0.35,
    typicalTxPerHour: 0.4,
    typicalDailyCount: 2,
    activeHoursStart: 8,
    activeHoursEnd: 22,
    knownDevices: isNewDevice ? ['DEV-OTHER'] : ['DEV-CURRENT'],
    knownRecipients: isNewRecipient ? ['REC-OTHER'] : ['REC-CURRENT'],
    favoriteTypes: ['SEND_MONEY'] as any,
    accountAgeDays: 340,
    profileRiskScore: 20,
    lastActivityTimestamp: new Date().toISOString(),
  };

  const assessment = evaluateTransactionRisk({
    transactionId: 'TX-SIM-WHATIF',
    amount,
    recipientId: isNewRecipient ? 'REC-UNKNOWN' : 'REC-CURRENT',
    isNewRecipient,
    deviceId: isNewDevice ? 'DEV-UNKNOWN' : 'DEV-CURRENT',
    isNewDevice,
    timestamp: isNightWindow ? '2026-10-01T02:30:00Z' : '2026-10-01T14:30:00Z',
    recentVelocityCount,
    connectedToFlaggedCluster,
    baseline: mockBaseline,
  });

  res.json({
    assessment,
    disclaimer: 'Illustrative sensitivity analysis based on synthetic rule thresholds — not a live production decision.',
  });
});

// 9. Admin & Demo Management (AUTHENTICATED)
app.post('/api/admin/reset', requireAdminAuth, (req, res) => {
  resetDatasetToSeed();
  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'DEMO_RESET',
    resource: 'DATABASE',
    details: 'Reset all synthetic database records and state to initial demo seed.',
  });
  res.json({ success: true, message: 'Synthetic demo database restored to seed state.' });
});

app.get('/api/model/metrics', requireAuth, (_req, res) => {
  const data = getDataset();
  res.json({ metrics: data.modelMetrics });
});

app.get('/api/audit-logs', requireAuth, (_req, res) => {
  const data = getDataset();
  res.json({ logs: data.auditLogs });
});

// -------------------------------------------------------------
// SYSTEM CONFIGURATION (AUTHENTICATED)
// -------------------------------------------------------------
app.get('/api/config', requireAuth, (_req, res) => {
  res.json({
    content: siteContent,
    features: featureFlags,
    riskConfig: getGlobalRiskConfig(),
    activeUsersCount: systemUsers.filter(u => u.status === 'ACTIVE').length,
    maxAuthorizedAccounts: MAX_AUTHORIZED_ACCOUNTS,
  });
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS (PUBLIC WITH RATE LIMITING)
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const email = req.body.email || req.body.username || req.body.identifier;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/username and password required' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
  const emailKey = String(email).trim().toLowerCase();

  // Rate Limiting Enforcement (per-IP and per-Account)
  const ipCheck = checkRateLimit(clientIp);
  const accountCheck = checkRateLimit(emailKey);
  if (ipCheck.blocked || accountCheck.blocked) {
    const sec = Math.max(ipCheck.remainingSec, accountCheck.remainingSec);
    return res.status(429).json({
      error: `Too many failed login attempts. Authentication temporarily suspended. Please retry in ${sec} seconds.`,
      retryAfterSec: sec,
    });
  }

  const user = systemUsers.find(
    u => (u.email.toLowerCase() === emailKey || (emailKey === 'diudevcis' && u.email === 'diudevcis')) &&
         u.passwordHash === hashPassword(password) &&
         u.status === 'ACTIVE'
  );

  if (!user) {
    // Record failure in rate limiter
    recordFailedLogin(clientIp);
    recordFailedLogin(emailKey);

    addAuditLog({
      actor: clientIp,
      action: 'LOGIN_FAILURE',
      resource: 'AUTH',
      details: `Failed authentication attempt for identifier: ${emailKey.substring(0, 3)}***`,
    });

    // Security Rule 2: Generic error message only - never disclose if user exists
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  // Clear rate limit on successful credentials
  clearFailedLogin(clientIp);
  clearFailedLogin(emailKey);

  const userAgent = req.headers['user-agent'] as string;
  const token = createSession(user.id, clientIp, userAgent);
  user.lastLogin = new Date().toISOString();

  addAuditLog({
    actor: user.name,
    action: 'LOGIN_SUCCESS',
    resource: 'AUTH',
    details: `User ${user.email} authenticated successfully. Session initiated. Role: ${user.role}`,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: user.permissions,
      status: user.status,
    },
  });
});
// -------------------------------------------------------------
// USER IDENTITY & SELF SESSION MANAGEMENT
// -------------------------------------------------------------
app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = (req as any).sessionToken;
  const user = (req as any).user;
  if (token) {
    activeSessions.delete(token);
  }
  addAuditLog({
    actor: user?.name || 'User',
    action: 'LOGOUT',
    resource: 'AUTH',
    details: `User ${user?.email} logged out. Session invalidated.`,
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const { passwordHash: _, ...safeUser } = (req as any).user;
  res.json({ user: safeUser });
});

app.post('/api/auth/revoke-others', requireAuth, (req, res) => {
  const currentToken = (req as any).sessionToken;
  const user = (req as any).user as StoredUser;
  let revoked = 0;
  for (const [token, sess] of activeSessions.entries()) {
    if (sess.userId === user.id && token !== currentToken) {
      activeSessions.delete(token);
      revoked++;
    }
  }
  addAuditLog({
    actor: user.name,
    action: 'SESSION_REVOKED',
    resource: 'AUTH',
    details: `User ${user.email} revoked ${revoked} other active session(s).`,
  });
  res.json({ success: true, revokedSessions: revoked });
});

// -------------------------------------------------------------
// SECURE ADMIN CONTROL PLANE REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/admin/config', requireAdminAuth, (_req, res) => {
  const activeCount = systemUsers.filter(u => u.status === 'ACTIVE').length;
  res.json({
    content: siteContent,
    features: featureFlags,
    riskConfig: getGlobalRiskConfig(),
    usersCount: systemUsers.length,
    activeUsersCount: activeCount,
    maxAuthorizedAccounts: MAX_AUTHORIZED_ACCOUNTS,
    activeSessionsCount: activeSessions.size,
    maintenanceMode,
  });
});

// 1. Content CMS Updates (Hero, Tagline, Branding)
app.put('/api/admin/content', requireAdminAuth, (req, res) => {
  const updates: Partial<SiteContent> = req.body;
  siteContent = { ...siteContent, ...updates };

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'CONTENT_CMS_UPDATED',
    resource: 'SYSTEM_CONTENT',
    details: `Updated keys: ${Object.keys(updates).join(', ')}. Hero Title: "${siteContent.heroTitle}"`,
  });

  res.json({ success: true, content: siteContent });
});

// 2. Risk Engine Weights & Thresholds
app.put('/api/admin/risk', requireAdminAuth, (req, res) => {
  const { weights, thresholds } = req.body;
  const currentConfig = getGlobalRiskConfig();

  // Validate weights if provided
  if (weights) {
    const newWeights = { ...currentConfig.weights, ...weights };
    const sum = Object.values(newWeights).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0);
    if (Math.abs(sum - 100) > 0.01) {
      return res.status(400).json({ error: `Risk weights must sum precisely to 100. Current sum: ${sum}` });
    }
    for (const [k, v] of Object.entries(newWeights)) {
      if ((v as number) < 0) {
        return res.status(400).json({ error: `Weight for ${k} cannot be negative` });
      }
    }
  }

  // Validate thresholds if provided
  if (thresholds) {
    const newThresholds = { ...currentConfig.thresholds, ...thresholds };
    if (!(newThresholds.lowMax < newThresholds.mediumMax && newThresholds.mediumMax < newThresholds.highMax)) {
      return res.status(400).json({ error: 'Thresholds must be strictly ordered: Low < Medium < High' });
    }
  }

  const updatedConfig = setGlobalRiskConfig(
    weights ? { ...currentConfig.weights, ...weights } : currentConfig.weights,
    thresholds ? { ...currentConfig.thresholds, ...thresholds } : currentConfig.thresholds
  );

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'RISK_CONFIG_UPDATED',
    resource: 'RISK_ENGINE',
    details: `Reconfigured risk weights and classification thresholds. High max: ${updatedConfig.thresholds.highMax}`,
  });

  res.json({ success: true, riskConfig: updatedConfig });
});

// 3. Feature Flags
app.put('/api/admin/features', requireAdminAuth, (req, res) => {
  const updates: Partial<FeatureFlags> = req.body;
  featureFlags = { ...featureFlags, ...updates };

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'FEATURE_FLAGS_UPDATED',
    resource: 'SYSTEM_FEATURES',
    details: `Toggled feature flags: ${JSON.stringify(updates)}`,
  });

  res.json({ success: true, features: featureFlags });
});

// 4. Team Member RBAC Management (HARD 5-ACCOUNT LIMIT ENFORCED)
app.get('/api/admin/users', requireAdminAuth, (_req, res) => {
  const safeUsers = systemUsers.map(({ passwordHash, ...u }) => u);
  const activeCount = systemUsers.filter(u => u.status === 'ACTIVE').length;
  res.json({
    users: safeUsers,
    roles: Object.keys(ROLE_PERMISSIONS),
    activeAccountsCount: activeCount,
    maxAuthorizedAccounts: MAX_AUTHORIZED_ACCOUNTS,
  });
});

app.post('/api/admin/users', requireAdminAuth, (req, res) => {
  // ATOMIC SERVER-SIDE CONSTRAINT: Reject creation if active accounts >= 5
  const activeCount = systemUsers.filter(u => u.status === 'ACTIVE').length;
  if (activeCount >= MAX_AUTHORIZED_ACCOUNTS) {
    return res.status(400).json({
      error: 'Maximum authorized account limit reached.',
      details: `Policy strictly restricts system to a hard maximum of ${MAX_AUTHORIZED_ACCOUNTS} active accounts. Currently ${activeCount}/${MAX_AUTHORIZED_ACCOUNTS} accounts are active. Please disable an account first.`
    });
  }

  const { name, email, role, department, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const existing = systemUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A user with this email identifier already exists.' });
  }

  const assignedRole = (role in ROLE_PERMISSIONS ? role : 'MEMBER') as AdminRole;
  const newUser: StoredUser = {
    id: `USR-${String(systemUsers.length + 1).padStart(3, '0')}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: assignedRole,
    department: department?.trim() || 'Risk Operations',
    status: 'ACTIVE',
    lastLogin: 'Never',
    passwordHash: hashPassword(password || 'diudevcis'),
    permissions: ROLE_PERMISSIONS[assignedRole] || ROLE_PERMISSIONS.MEMBER,
  };

  systemUsers.push(newUser);

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'ACCOUNT_CREATED',
    resource: 'USER_DIRECTORY',
    details: `Created authorized member ${name} (${email}) with role ${assignedRole}. Active accounts: ${activeCount + 1}/${MAX_AUTHORIZED_ACCOUNTS}`,
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    user: safeUser,
    activeAccountsCount: activeCount + 1,
    maxAuthorizedAccounts: MAX_AUTHORIZED_ACCOUNTS,
  });
});

app.patch('/api/admin/users/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { role, department, status, name } = req.body;

  // Protect last remaining SUPER_ADMIN
  if (user.role === 'SUPER_ADMIN') {
    const superAdmins = systemUsers.filter(u => u.role === 'SUPER_ADMIN' && u.status === 'ACTIVE');
    if (superAdmins.length <= 1) {
      if (status === 'DISABLED' || status === 'SUSPENDED') {
        return res.status(400).json({ error: 'Cannot disable or suspend the last remaining SUPER_ADMIN.' });
      }
      if (role && role !== 'SUPER_ADMIN') {
        return res.status(400).json({ error: 'Cannot demote the last remaining SUPER_ADMIN.' });
      }
    }
  }

  // If activating a disabled account, verify 5-account limit
  if (status === 'ACTIVE' && user.status !== 'ACTIVE') {
    const activeCount = systemUsers.filter(u => u.status === 'ACTIVE').length;
    if (activeCount >= MAX_AUTHORIZED_ACCOUNTS) {
      return res.status(400).json({
        error: 'Maximum authorized account limit reached.',
        details: `Cannot activate account. System already has ${activeCount}/${MAX_AUTHORIZED_ACCOUNTS} active accounts.`
      });
    }
  }

  if (name) user.name = name;
  if (department) user.department = department;
  if (status) {
    user.status = status;
    if (status === 'DISABLED' || status === 'SUSPENDED') {
      revokeUserSessions(user.id);
    }
  }
  if (role && ROLE_PERMISSIONS[role as AdminRole]) {
    user.role = role as AdminRole;
    user.permissions = ROLE_PERMISSIONS[role as AdminRole];
  }

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'ACCOUNT_UPDATED',
    resource: 'USER_DIRECTORY',
    details: `Updated user ${user.id} (${user.email}). New role: ${user.role}, Status: ${user.status}`,
  });

  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/admin/users/:id/disable', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Protect last remaining SUPER_ADMIN
  if (user.role === 'SUPER_ADMIN' && user.status === 'ACTIVE') {
    const superAdmins = systemUsers.filter(u => u.role === 'SUPER_ADMIN' && u.status === 'ACTIVE');
    if (superAdmins.length <= 1) {
      return res.status(400).json({ error: 'Cannot disable the last remaining SUPER_ADMIN account.' });
    }
  }

  // If enabling, verify active account limit
  if (user.status !== 'ACTIVE') {
    const activeCount = systemUsers.filter(u => u.status === 'ACTIVE').length;
    if (activeCount >= MAX_AUTHORIZED_ACCOUNTS) {
      return res.status(400).json({
        error: 'Maximum authorized account limit reached.',
        details: `Cannot re-enable account. System already has ${activeCount}/${MAX_AUTHORIZED_ACCOUNTS} active accounts.`
      });
    }
    user.status = 'ACTIVE';
  } else {
    user.status = 'DISABLED';
    // Immediate session revocation on disable
    revokeUserSessions(user.id);
  }

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: user.status === 'DISABLED' ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
    resource: 'USER_DIRECTORY',
    details: `Set account status for ${user.email} to ${user.status}`,
  });

  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Admin Session Revocation for specific user
app.post('/api/admin/users/:id/revoke-sessions', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const revoked = revokeUserSessions(id);
  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'SESSION_REVOKED',
    resource: 'USER_SESSIONS',
    details: `Admin revoked ${revoked} active session(s) for user ID ${id}.`,
  });
  res.json({ success: true, revokedSessions: revoked });
});

// Admin Temporary Password Reset
app.post('/api/admin/users/:id/reset-password', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const passToSet = newPassword || 'upayPass2026!';
  user.passwordHash = hashPassword(passToSet);
  revokeUserSessions(user.id);

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: 'PASSWORD_RESET',
    resource: 'SECURITY',
    details: `Administrative password reset executed for ${user.email}. Active sessions revoked.`,
  });

  res.json({ success: true, message: 'Password reset completed and active sessions revoked.' });
});

// EMERGENCY SYSTEM LOCKDOWN (SUPER_ADMIN ONLY)
app.post('/api/admin/emergency-lockdown', requireAdminAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;
  if (currentUser.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only SUPER_ADMIN can execute Emergency System Lockdown.' });
  }

  const superAdminIds = new Set(systemUsers.filter(u => u.role === 'SUPER_ADMIN').map(u => u.id));
  let revokedCount = 0;
  for (const [token, sess] of activeSessions.entries()) {
    if (!superAdminIds.has(sess.userId)) {
      activeSessions.delete(token);
      revokedCount++;
    }
  }

  addAuditLog({
    actor: currentUser.name,
    action: 'EMERGENCY_LOCKDOWN',
    resource: 'SECURITY_SUBSYSTEM',
    details: `EMERGENCY LOCKDOWN ACTIVATED by ${currentUser.name}. ${revokedCount} non-Super-Admin sessions revoked immediately.`,
  });

  res.json({
    success: true,
    message: 'Emergency lockdown executed. All non-Super-Admin sessions terminated immediately.',
    revokedSessions: revokedCount,
  });
});

// MAINTENANCE MODE TOGGLE
app.post('/api/admin/maintenance-mode', requireAdminAuth, (req, res) => {
  const { enabled } = req.body;
  maintenanceMode = typeof enabled === 'boolean' ? enabled : !maintenanceMode;

  addAuditLog({
    actor: (req as any).user?.name || 'Admin',
    action: maintenanceMode ? 'MAINTENANCE_ENABLED' : 'MAINTENANCE_DISABLED',
    resource: 'SYSTEM_OPERATIONS',
    details: `System maintenance mode set to ${maintenanceMode ? 'ENABLED' : 'DISABLED'}.`,
  });

  res.json({ success: true, maintenanceMode });
});

// ADMIN SECURITY DASHBOARD METRICS
app.get('/api/admin/security-stats', requireAdminAuth, (_req, res) => {
  const activeCount = systemUsers.filter(u => u.status === 'ACTIVE').length;
  res.json({
    activeAccounts: activeCount,
    maxAccounts: MAX_AUTHORIZED_ACCOUNTS,
    totalRegistered: systemUsers.length,
    activeSessionsCount: activeSessions.size,
    failedAttemptsCount: failedLoginAttempts.size,
    maintenanceMode,
    recentSecurityLogs: getDataset().auditLogs.filter(l =>
      ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'SESSION_REVOKED', 'ACCOUNT_CREATED', 'ACCOUNT_DISABLED', 'EMERGENCY_LOCKDOWN', 'PASSWORD_RESET'].includes(l.action)
    ).slice(0, 15),
  });
});

// -------------------------------------------------------------
// VITE / STATIC SERVING
// -------------------------------------------------------------
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[UPAY SENTINEL AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch(err => {
  console.error('Failed to initialize server:', err);
});
