/**
 * Upay Sentinel AI - TrustGraph Financial Intelligence
 * Core Type Definitions
 * DIU CPC × upay AI Hackathon 2026
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TransactionType = 
  | 'SEND_MONEY' 
  | 'CASH_OUT' 
  | 'MERCHANT_PAY' 
  | 'MOBILE_RECHARGE' 
  | 'ADD_MONEY' 
  | 'UTILITY_BILL';

export type TransactionStatus = 'COMPLETED' | 'FLAGGED' | 'BLOCKED' | 'UNDER_REVIEW';

export interface RiskSignal {
  id: string;
  name: string;
  score: number; // e.g. +31
  category: 'AMOUNT' | 'RECIPIENT' | 'DEVICE' | 'VELOCITY' | 'TIMING' | 'NETWORK' | 'BEHAVIOR';
  description: string;
  observedValue: string;
  baselineValue: string;
  deviationPercentage?: number;
  evidence: string;
}

export interface RiskAssessment {
  transactionId: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // 0 - 100
  signals: RiskSignal[];
  primarySignal: string;
  anomalyScore: number; // 0.0 - 1.0 (Isolation Forest style)
  behavioralDeviationPct: number;
  networkRiskScore: number;
  explanation: string;
  recommendedAction: 'ALLOW' | 'STEP_UP_AUTH' | 'FLAG_FOR_REVIEW' | 'PAUSE_AND_VERIFY' | 'IMMEDIATE_ESCALATION';
  requiresHumanReview: boolean;
  timestamp: string;
}

export interface Transaction {
  id: string; // e.g. TX-DEMO-49281
  timestamp: string;
  customerId: string;
  customerName: string;
  amount: number; // in BDT (৳)
  type: TransactionType;
  channel: 'APP' | 'USSD' | 'QR' | 'API';
  status: TransactionStatus;
  recipientId: string;
  recipientName: string;
  recipientType: 'CUSTOMER' | 'MERCHANT' | 'AGENT' | 'BILLER';
  isNewRecipient: boolean;
  deviceId: string;
  isNewDevice: boolean;
  deviceModel?: string;
  ipAddress?: string;
  agentId?: string;
  riskAssessment: RiskAssessment;
  locationCity?: string;
  quarantineStatus?: 'NONE' | 'IN_ESCROW' | 'RELEASED' | 'BLOCKED_BY_SENDER' | 'BLOCKED_BY_ANALYST';
  escrowExpiresAt?: string;
}

export interface BehavioralDNA {
  customerId: string;
  recentMedianAmount: number;
  recentAvgAmount: number;
  amountStdDev: number;
  typicalTxPerHour: number;
  typicalDailyCount: number;
  activeHoursStart: number; // 0 - 23
  activeHoursEnd: number; // 0 - 23
  knownDevices: string[];
  knownRecipients: string[];
  favoriteTypes: TransactionType[];
  accountAgeDays: number;
  profileRiskScore: number; // 0 - 100
  lastActivityTimestamp: string;
}

export interface Customer {
  id: string; // e.g. CUS-DEMO-1042
  name: string;
  phoneMasked: string; // e.g. +880 17•• ••••42
  emailMasked: string;
  nidMasked: string;
  kycTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  accountCreated: string;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED' | 'RESTRICTED';
  totalTransactions: number;
  totalVolumeBDT: number;
  behavioralDNA: BehavioralDNA;
  currentRiskLevel: RiskLevel;
  activeAlertCount: number;
}

export interface Agent {
  id: string; // e.g. AGENT-DEMO-007
  name: string;
  location: string;
  phoneMasked: string;
  dailyCashOutVolume: number;
  dailyCashInVolume: number;
  totalCustomersToday: number;
  cashOutRatio: number; // e.g. 0.82
  peerDeviationPct: number; // deviation from peer agents in same cluster
  status: 'NOMINAL' | 'REQUIRES_REVIEW' | 'WATCHLIST';
  riskScore: number;
  anomalyNotes: string[];
}

export interface Merchant {
  id: string;
  businessName: string;
  category: string;
  location: string;
  dailyVolume: number;
  riskScore: number;
}

export interface Device {
  id: string; // e.g. DEV-DEMO-104
  model: string;
  os: string;
  firstSeen: string;
  associatedCustomers: string[];
  isEmulator: boolean;
  isRooted: boolean;
  riskScore: number;
}

// TrustGraph structures
export type GraphEntityType = 'CUSTOMER' | 'WALLET' | 'DEVICE' | 'MERCHANT' | 'AGENT' | 'RECIPIENT' | 'TRANSACTION';

export interface GraphNode {
  id: string;
  name: string;
  type: GraphEntityType;
  riskScore: number;
  riskLevel: RiskLevel;
  isFlagged: boolean;
  degree?: number;
  clusterId?: string;
  metadata?: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: 'SENT_TO' | 'RECEIVED_FROM' | 'USED_DEVICE' | 'PAID_MERCHANT' | 'VISITED_AGENT' | 'SHARED_DEVICE' | 'TRANSFER_CHAIN';
  amount?: number;
  timestamp?: string;
  isSuspicious?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  summary: {
    totalNodes: number;
    totalLinks: number;
    flaggedNodes: number;
    suspiciousClusters: number;
    networkDensity: number;
  };
}

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus = 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  category: 'AUTHENTICATION' | 'DEVICE' | 'RECIPIENT' | 'TRANSACTION' | 'NETWORK' | 'ALERT';
  description: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  metadata?: Record<string, string>;
}

export interface InvestigationCase {
  id: string; // e.g. CASE-2026-8941
  title: string;
  customerId: string;
  customerName: string;
  transactionId?: string;
  amountBDT?: number;
  priority: CasePriority;
  riskScore: number;
  primarySignal: string;
  createdTime: string;
  updatedTime: string;
  assignedTo: string;
  status: CaseStatus;
  timeline: TimelineEvent[];
  structuredEvidence: {
    transactionFacts: string[];
    behavioralAnomalies: string[];
    networkFindings: string[];
    riskSignalsSummary: string[];
  };
  aiAnalysis?: {
    summary: string;
    whatHappened: string;
    whyRisky: string;
    keyEvidence: string[];
    alternativeExplanations: string[];
    recommendedChecks: string[];
    confidence: number;
    generatedAt: string;
    isAiFallback?: boolean;
  };
  analystNotes: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
  enforcementActions?: {
    action: 'FREEZE_WALLET' | 'LOCK_DEVICE' | 'FILE_SAR' | 'REQUEST_BIOMETRIC' | 'UNFREEZE';
    timestamp: string;
    actor: string;
    details?: string;
  }[];
  dualAuthRequired?: boolean;
  dualAuthStatus?: 'NONE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  dualAuthRequestedBy?: string;
  dualAuthApprovedBy?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action:
    | 'LOGIN'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'SESSION_REVOKED'
    | 'ACCOUNT_CREATED'
    | 'ACCOUNT_UPDATED'
    | 'ACCOUNT_DISABLED'
    | 'ACCOUNT_ENABLED'
    | 'PASSWORD_CHANGED'
    | 'PASSWORD_RESET'
    | 'EMERGENCY_LOCKDOWN'
    | 'MAINTENANCE_ENABLED'
    | 'MAINTENANCE_DISABLED'
    | 'CASE_OPENED'
    | 'CASE_ASSIGNED'
    | 'CASE_UPDATED'
    | 'NOTE_ADDED'
    | 'STATUS_CHANGED'
    | 'SCENARIO_CREATED'
    | 'DEMO_RESET'
    | 'REPORT_GENERATED'
    | 'ADMIN_SETTING_CHANGED'
    | 'ENFORCEMENT_ACTION'
    | 'SAR_FILED'
    | 'BATCH_TRIAGE'
    | 'USER_CREATED'
    | 'USER_MODIFIED'
    | 'USER_DISABLED'
    | 'USER_ENABLED'
    | 'CONTENT_CMS_UPDATED'
    | 'RISK_CONFIG_UPDATED'
    | 'FEATURE_FLAGS_UPDATED'
    | 'QUARANTINE_RELEASED'
    | 'QUARANTINE_FROZEN'
    | 'DUAL_AUTH_REQUESTED'
    | 'DUAL_AUTH_APPROVED'
    | 'DYNAMIC_RULE_CREATED'
    | 'DYNAMIC_RULE_TOGGLED'
    | 'GOAML_EXPORTED';
  resource: string;
  details: string;
  prevHash?: string;
  hash?: string;
}

export interface DynamicRule {
  id: string;
  name: string;
  description: string;
  conditionField: 'amount' | 'velocity' | 'isEmulator' | 'isNewRecipient' | 'isNight' | 'riskScore';
  conditionOperator: '>' | '<' | '==' | '!=' | '>=' | '<=';
  conditionValue: string | number | boolean;
  action: 'FLAG_FOR_REVIEW' | 'STEP_UP_2FA' | 'SOFT_QUARANTINE' | 'BLOCK';
  mode: 'ACTIVE' | 'SHADOW';
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  shadowMatchesCount?: number;
  falsePositiveRate?: number;
}

export interface CopilotFinOpsStats {
  totalQueries: number;
  cacheHits: number;
  piiScrubbedCount: number;
  tokensSavedEstimate: number;
  costSavedUSD: number;
  cacheHitRatePct: number;
}

export interface GoAMLReportData {
  reportCode: 'STR' | 'SAR';
  btrn: string; // Bangladesh Transaction Reference Number
  reportingEntity: string;
  filingDate: string;
  customerKYC: {
    name: string;
    customerId: string;
    phone: string;
    nid: string;
    kycTier: string;
  };
  transactionFacts: {
    transactionId: string;
    amountBDT: number;
    destinationWallet: string;
    channel: string;
    timestamp: string;
  };
  suspicionReason: string;
  tamperHash: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  category: 'ACCOUNT_TAKEOVER' | 'SCAM' | 'SUSPICIOUS_NETWORK' | 'HIGH_VELOCITY' | 'NORMAL' | 'AGENT_ANOMALY';
  badge: string;
  expectedRiskScore: number;
  targetCustomerId: string;
  executionStepsCount: number;
}

export interface ModelMetrics {
  name: string;
  version: string;
  type: string;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  detectionRate: number;
  avgInvestigationTimeSec: number;
  syntheticSampleSize: number;
  featuresUsed: string[];
  datasetLabel: string;
}

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MEMBER'
  | 'VIEWER'
  | 'RISK_ANALYST'
  | 'INVESTIGATOR'
  | 'REVIEWER'
  | 'DEMO_OPERATOR'
  | 'CONTENT_MANAGER';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  avatar?: string;
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  lastLogin: string;
  permissions: string[];
}

export interface RiskWeights {
  amountWeight: number; // default 30
  recipientWeight: number; // default 20
  deviceWeight: number; // default 15
  velocityWeight: number; // default 15
  behaviorWeight: number; // default 10
  networkWeight: number; // default 10
}

export interface RiskThresholds {
  lowMax: number; // default 29
  mediumMax: number; // default 59
  highMax: number; // default 79
}

export interface FeatureFlags {
  dashboardEnabled: boolean;
  transactionsEnabled: boolean;
  trustGraphEnabled: boolean;
  investigationsEnabled: boolean;
  copilotEnabled: boolean;
  simulationEnabled: boolean;
  customerSafetyEnabled: boolean;
  reportsEnabled: boolean;
}

export interface SiteContent {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  demoLabel: string;
  footerText: string;
}

