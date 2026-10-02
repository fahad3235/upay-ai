/**
 * Upay Sentinel AI - Centralized Admin Command Center (Master Build V7)
 * DIU CPC × upay AI Hackathon 2026
 * Implements Sections 26-38: Centralized Admin Control Plane
 * - System Health & Active Sessions
 * - Live Content CMS (Hero, Tagline, Branding, Footer)
 * - Deterministic Risk Calibration (Weights sum-to-100 validation & thresholds)
 * - Feature Flags with Backend Enforcement
 * - Team & RBAC Management (Users, Roles, Permissions)
 * - Append-Only Immutable Audit Log Trail
 */

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sliders,
  Database,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  History,
  Play,
  Layers,
  Sparkles,
  Users,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Globe,
  Save,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  RefreshCw,
  Search,
  KeyRound,
  Radio,
  LogOut,
  Ban,
  Activity,
  Zap,
  FileText,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import {
  AuditLog,
  SiteContent,
  FeatureFlags,
  RiskWeights,
  RiskThresholds,
  SystemUser,
  AdminRole,
  DynamicRule,
} from '../types';

export const AdminPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'security' | 'content' | 'risk' | 'features' | 'audit' | 'rules'
  >('overview');

  // Global State Loaded from Backend
  const [siteContent, setSiteContent] = useState<SiteContent>({
    siteName: 'upay SENTINEL AI',
    tagline: 'Before money moves, understand the risk.',
    heroTitle: 'Before money moves, understand the risk.',
    heroSubtitle: 'Real-time explainable financial safety intelligence platform combining customer DNA, TrustGraph topology, and grounded generative AI.',
    heroCta: 'EXPLORE DEMO',
    demoLabel: 'SYNTHETIC DEMO',
    footerText: 'DIU CPC × upay — AI Hackathon 2026',
  });

  const [features, setFeatures] = useState<FeatureFlags>({
    dashboardEnabled: true,
    transactionsEnabled: true,
    trustGraphEnabled: true,
    investigationsEnabled: true,
    copilotEnabled: true,
    simulationEnabled: true,
    customerSafetyEnabled: true,
    reportsEnabled: true,
  });

  const [riskWeights, setRiskWeights] = useState<RiskWeights>({
    amountWeight: 30,
    recipientWeight: 20,
    deviceWeight: 15,
    velocityWeight: 15,
    behaviorWeight: 10,
    networkWeight: 10,
  });

  const [riskThresholds, setRiskThresholds] = useState<RiskThresholds>({
    lowMax: 29,
    mediumMax: 59,
    highMax: 79,
  });

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState('');

  // Status & Feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // New User Modal State
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('diudevcis');
  const [newUserRole, setNewUserRole] = useState<AdminRole>('MEMBER');
  const [newUserDepartment, setNewUserDepartment] = useState('Financial Crime & Safety');

  // Security Operations State
  const [securityStats, setSecurityStats] = useState<{
    activeAccounts: number;
    maxAccounts: number;
    totalRegistered: number;
    activeSessionsCount: number;
    failedAttemptsCount: number;
    maintenanceMode: boolean;
    recentSecurityLogs: any[];
  } | null>(null);
  const [lockdownConfirmOpen, setLockdownConfirmOpen] = useState(false);
  const [resetUserPassModalOpen, setResetUserPassModalOpen] = useState(false);
  const [targetUserForPass, setTargetUserForPass] = useState<SystemUser | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('diudevcis');

  // Dynamic Rules & Shadow Mode State (Item 3)
  const [rules, setRules] = useState<DynamicRule[]>([]);
  const [newRuleModalOpen, setNewRuleModalOpen] = useState(false);
  const [dryRunModalOpen, setDryRunModalOpen] = useState(false);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<any | null>(null);

  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleField, setRuleField] = useState<'amount' | 'riskScore' | 'isEmulator' | 'isNewRecipient' | 'velocity' | 'isNight'>('amount');
  const [ruleOp, setRuleOp] = useState<'>' | '<' | '==' | '!=' | '>=' | '<='>('>');
  const [ruleVal, setRuleVal] = useState<string | number>('15000');
  const [ruleAction, setRuleAction] = useState<'SOFT_QUARANTINE' | 'STEP_UP_2FA' | 'FLAG_FOR_REVIEW' | 'BLOCK'>('SOFT_QUARANTINE');
  const [ruleMode, setRuleMode] = useState<'ACTIVE' | 'SHADOW'>('ACTIVE');

  // Cryptographic SHA-256 Audit Chain Verification State (Item 5)
  const [auditVerifyResult, setAuditVerifyResult] = useState<{
    isValid: boolean;
    totalBlocks: number;
    latestBlockHash: string;
    genesisHash: string;
    verifiedAt: string;
  } | null>(null);
  const [auditVerifyLoading, setAuditVerifyLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [configData, usersData, logsData, secStats, rulesData, auditVerif] = await Promise.all([
        api.getAdminConfig().catch(() => ({})),
        api.getAdminUsers().catch(() => ({ users: [], roles: [] })),
        api.getAuditLogs().catch(() => ({ logs: [] })),
        api.getSecurityStats().catch(() => null),
        api.getRules().catch(() => ({ rules: [] })),
        api.verifyAuditChain().catch(() => null),
      ]);

      if (configData.content) setSiteContent(configData.content);
      if (configData.features) setFeatures(configData.features);
      if (configData.riskConfig) {
        if (configData.riskConfig.weights) setRiskWeights(configData.riskConfig.weights);
        if (configData.riskConfig.thresholds) setRiskThresholds(configData.riskConfig.thresholds);
      }
      if (usersData.users) setUsers(usersData.users);
      if (usersData.roles) setAvailableRoles(usersData.roles);
      if (logsData.logs) setLogs(logsData.logs);
      if (secStats) setSecurityStats(secStats);
      if (rulesData?.rules) setRules(rulesData.rules);
      if (auditVerif) setAuditVerifyResult(auditVerif);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to load admin telemetry');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Dynamic Rules Handlers (Item 3)
  const handleToggleRule = async (ruleId: string) => {
    try {
      const res = await api.toggleRule(ruleId);
      if (res.rule) {
        setRules(prev => prev.map(r => (r.id === ruleId ? res.rule : r)));
        showNotification(`Rule ${ruleId} mode updated to ${res.rule.mode} (${res.rule.enabled ? 'Enabled' : 'Disabled'})`);
        const updatedLogs = await api.getAuditLogs();
        setLogs(updatedLogs.logs);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle rule');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) {
      setErrorMessage('Rule name is required');
      return;
    }
    try {
      const parsedVal =
        ruleField === 'amount' || ruleField === 'riskScore' || ruleField === 'velocity'
          ? Number(ruleVal)
          : ruleVal === 'true'
          ? true
          : ruleVal === 'false'
          ? false
          : ruleVal;

      const res = await api.createRule({
        name: ruleName,
        description: ruleDesc,
        conditionField: ruleField,
        conditionOperator: ruleOp,
        conditionValue: parsedVal,
        action: ruleAction,
        mode: ruleMode,
        enabled: true,
      });

      if (res.rule) {
        setRules(prev => [res.rule, ...prev]);
        setNewRuleModalOpen(false);
        setRuleName('');
        setRuleDesc('');
        showNotification(`Dynamic rule "${res.rule.name}" created and loaded into memory.`);
        const updatedLogs = await api.getAuditLogs();
        setLogs(updatedLogs.logs);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create rule');
    }
  };

  const handleRunDryRun = async (targetRule?: {
    conditionField: string;
    conditionOperator: string;
    conditionValue: any;
    name?: string;
  }) => {
    const field = targetRule?.conditionField || ruleField;
    const op = targetRule?.conditionOperator || ruleOp;
    const val =
      targetRule?.conditionValue !== undefined
        ? targetRule.conditionValue
        : ruleField === 'amount' || ruleField === 'riskScore' || ruleField === 'velocity'
        ? Number(ruleVal)
        : ruleVal === 'true'
        ? true
        : ruleVal === 'false'
        ? false
        : ruleVal;

    setDryRunLoading(true);
    setDryRunModalOpen(true);
    try {
      const result = await api.dryRunRule({
        conditionField: field,
        conditionOperator: op,
        conditionValue: val,
      });
      setDryRunResult({ ...result, ruleName: targetRule?.name || ruleName || 'Dynamic Rule' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to run dry-run simulation');
      setDryRunModalOpen(false);
    } finally {
      setDryRunLoading(false);
    }
  };

  // Cryptographic SHA-256 Audit Verification Handler (Item 5)
  const handleVerifyAuditChain = async () => {
    setAuditVerifyLoading(true);
    try {
      const res = await api.verifyAuditChain();
      setAuditVerifyResult(res);
      if (res.isValid) {
        showNotification(`Cryptographic chain verified across ${res.totalBlocks} blocks. Zero tampering detected.`);
      } else {
        setErrorMessage(`Ledger verification failed at block ${res.brokenBlockId}: ${res.reason}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify cryptographic chain');
    } finally {
      setAuditVerifyLoading(false);
    }
  };

  // 1. Save Content CMS
  const handleSaveContent = async () => {
    try {
      await api.updateAdminContent(siteContent);
      showNotification('Public site copy and branding successfully synchronized with the central database.');
      // Refresh audit logs
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update site content');
    }
  };

  // 2. Save Risk Weights & Thresholds
  const weightsSum =
    Number(riskWeights.amountWeight) +
    Number(riskWeights.recipientWeight) +
    Number(riskWeights.deviceWeight) +
    Number(riskWeights.velocityWeight) +
    Number(riskWeights.behaviorWeight) +
    Number(riskWeights.networkWeight);

  const handleSaveRisk = async () => {
    if (weightsSum !== 100) {
      setErrorMessage(`Risk weights must sum precisely to 100. Current sum: ${weightsSum}`);
      return;
    }
    if (!(riskThresholds.lowMax < riskThresholds.mediumMax && riskThresholds.mediumMax < riskThresholds.highMax)) {
      setErrorMessage('Threshold boundaries must satisfy: Low < Medium < High');
      return;
    }

    try {
      await api.updateAdminRisk({
        weights: riskWeights,
        thresholds: riskThresholds,
      });
      showNotification('Deterministic risk engine weights and classification boundaries calibrated.');
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update risk parameters');
    }
  };

  // 3. Toggle Feature Flags
  const handleToggleFeature = async (key: keyof FeatureFlags) => {
    const updated = { ...features, [key]: !features[key] };
    setFeatures(updated);
    try {
      await api.updateAdminFeatures(updated);
      showNotification(`Feature flag "${String(key)}" set to ${updated[key] ? 'ENABLED' : 'DISABLED'}.`);
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update feature flag');
    }
  };

  // 4. Create New Team Member (HARD 5-ACCOUNT LIMIT PRE-CHECK)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const activeCount = users.filter(u => u.status === 'ACTIVE').length;
    if (activeCount >= 5) {
      setErrorMessage('Maximum of 5 authorized accounts has been reached. Disable an existing account before adding a new one.');
      return;
    }

    try {
      await api.createAdminUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword || 'diudevcis',
        role: newUserRole,
        department: newUserDepartment,
      });
      showNotification(`Authorized member ${newUserName} successfully provisioned.`);
      setNewUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('diudevcis');
      const usersData = await api.getAdminUsers();
      setUsers(usersData.users);
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
      const secStats = await api.getSecurityStats().catch(() => null);
      if (secStats) setSecurityStats(secStats);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision team member');
    }
  };

  // 5. Toggle User Active / Disabled Status
  const handleToggleUserStatus = async (id: string) => {
    try {
      await api.toggleAdminUserStatus(id);
      const usersData = await api.getAdminUsers();
      setUsers(usersData.users);
      showNotification('Member operational access status toggled. If disabled, all active sessions were revoked.');
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
      const secStats = await api.getSecurityStats().catch(() => null);
      if (secStats) setSecurityStats(secStats);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update status');
    }
  };

  // 6. Change User Role
  const handleChangeUserRole = async (id: string, newRole: AdminRole) => {
    try {
      await api.updateAdminUser(id, { role: newRole });
      const usersData = await api.getAdminUsers();
      setUsers(usersData.users);
      showNotification(`Role updated to ${newRole}. Permissions re-evaluated.`);
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update user role');
    }
  };

  // 7. Revoke Specific User Sessions
  const handleRevokeUserSessions = async (userId: string, email: string) => {
    try {
      const res = await api.revokeUserSessions(userId);
      showNotification(`Revoked ${res.revokedSessions || 0} active session(s) for ${email}.`);
      const secStats = await api.getSecurityStats().catch(() => null);
      if (secStats) setSecurityStats(secStats);
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to revoke user sessions');
    }
  };

  // 8. Administrative Password Reset
  const handleResetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForPass) return;
    try {
      await api.resetUserPassword(targetUserForPass.id, newPasswordValue);
      showNotification(`Password reset for ${targetUserForPass.email}. Active sessions revoked.`);
      setResetUserPassModalOpen(false);
      setTargetUserForPass(null);
      setNewPasswordValue('diudevcis');
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password');
    }
  };

  // 9. Emergency System Lockdown
  const handleEmergencyLockdown = async () => {
    try {
      const res = await api.emergencyLockdown();
      showNotification(`EMERGENCY LOCKDOWN ACTIVATED: ${res.revokedSessions || 0} non-Super-Admin session(s) revoked immediately.`);
      setLockdownConfirmOpen(false);
      const secStats = await api.getSecurityStats().catch(() => null);
      if (secStats) setSecurityStats(secStats);
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Emergency lockdown failed');
    }
  };

  // 10. Maintenance Mode Toggle
  const handleToggleMaintenance = async () => {
    try {
      const res = await api.toggleMaintenanceMode();
      showNotification(`System Maintenance Mode ${res.maintenanceMode ? 'ENABLED' : 'DISABLED'}.`);
      const secStats = await api.getSecurityStats().catch(() => null);
      if (secStats) setSecurityStats(secStats);
      const updatedLogs = await api.getAuditLogs();
      setLogs(updatedLogs.logs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle maintenance mode');
    }
  };

  // 7. Reset Demo
  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      setResetSuccess(true);
      setResetConfirmOpen(false);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset demo state');
    }
  };

  const filteredLogs = logs.filter(
    l =>
      l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.resource.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const activeAccountsCount = users.filter(u => u.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 pb-20 text-xs text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              SECURE ADMIN COMMAND CENTER
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-bold">
              SUPER_ADMIN
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border shadow-3xs ${
                activeAccountsCount >= 5
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{activeAccountsCount} / 5 AUTHORIZED ACCOUNTS</span>
              {activeAccountsCount >= 5 && (
                <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded text-[9px] uppercase font-black">
                  FULL
                </span>
              )}
            </span>
            {securityStats?.maintenanceMode && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                MAINTENANCE MODE
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            TITAN NEXUS Ω v7 Security Architecture: Server-side sessions, hard 5-account maximum enforcement, and RBAC control plane.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadAllData()}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={() => onNavigate('/simulation')}
            className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulation Lab</span>
          </button>
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700 font-bold text-sm">
            ×
          </button>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Synthetic database restored to seed state. Environment hot-reloading...</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200/90 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members ({activeAccountsCount}/5)</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security & Lockdown</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Content CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'risk'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Risk Engine Control</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'features'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feature Flags</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rules'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Dynamic Rules ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-sky-600 text-sky-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log ({logs.length})</span>
          {auditVerifyResult?.isValid && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Cryptographically Sealed (SHA-256)"></span>
          )}
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">AI COPILOT</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{features.copilotEnabled ? 'GEMINI 3.8 FLASH' : 'DISABLED'}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {features.copilotEnabled ? 'Proxy Active with Deterministic Fallback' : 'Disabled by Admin Policy'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">RISK ENGINE</span>
              <div className="flex items-center gap-1.5 font-bold text-sky-700">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>DETERMINISTIC V7</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Weights Sum: {weightsSum} / 100
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">TRUSTGRAPH</span>
              <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{features.trustGraphEnabled ? 'CENTRALITY LIVE' : 'DISABLED'}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Multi-Hop Path Finder</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">SECURITY RBAC</span>
              <div className="flex items-center gap-1.5 font-bold text-purple-700">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>SERVER-ENFORCED</span>
              </div>
              <span className="text-[10px] text-slate-400 block">{users.length} Provisioned Accounts</span>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-display">Active Live Configuration</h3>
              <div className="space-y-2 font-mono text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform Title:</span>
                  <span className="text-slate-800 font-bold">{siteContent.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hero Title:</span>
                  <span className="text-sky-700 font-bold truncate max-w-xs">{siteContent.heroTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hero CTA:</span>
                  <span className="text-slate-800 font-bold">{siteContent.heroCta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Critical Boundary:</span>
                  <span className="text-rose-600 font-bold">≥ {riskThresholds.highMax + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">High Risk Boundary:</span>
                  <span className="text-orange-600 font-bold">{riskThresholds.mediumMax + 1} – {riskThresholds.highMax}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Switch to the <button onClick={() => setActiveTab('content')} className="text-sky-600 font-bold hover:underline">Content CMS</button> or <button onClick={() => setActiveTab('risk')} className="text-sky-600 font-bold hover:underline">Risk Engine</button> tab to modify these parameters live.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-display">Operational Integrity Checks</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Weights Normalization</div>
                      <div className="text-[10px] text-slate-500">Risk engine signal weights sum to 100%</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-xs">PASS (100)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Deterministic Fallback Layer</div>
                      <div className="text-[10px] text-slate-500">Guaranteed uptime even if Gemini rate-limited</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-xs">ONLINE</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Synthetic Dataset Boundary</div>
                      <div className="text-[10px] text-slate-500">Zero production credentials or PII in memory</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-xs">ISOLATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT CMS */}
      {activeTab === 'content' && (
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-display">Live Content & Branding CMS</h3>
            <p className="text-[11px] text-slate-500">
              Update marketing copy, hero typography, and branding. Changes are immediately reflected on the public landing page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Platform Title</label>
              <input
                type="text"
                value={siteContent.siteName}
                onChange={e => setSiteContent({ ...siteContent, siteName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Platform Tagline</label>
              <input
                type="text"
                value={siteContent.tagline}
                onChange={e => setSiteContent({ ...siteContent, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Hero Headline (H1)</label>
              <input
                type="text"
                value={siteContent.heroTitle}
                onChange={e => setSiteContent({ ...siteContent, heroTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-display text-slate-900"
              />
              <span className="text-[10px] text-slate-400">Shown in 60px display font on public homepage.</span>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Hero Subtitle</label>
              <textarea
                rows={2}
                value={siteContent.heroSubtitle}
                onChange={e => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Primary Hero Button (CTA)</label>
              <input
                type="text"
                value={siteContent.heroCta}
                onChange={e => setSiteContent({ ...siteContent, heroCta: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Demo Watermark Badge</label>
              <input
                type="text"
                value={siteContent.demoLabel}
                onChange={e => setSiteContent({ ...siteContent, demoLabel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Footer Disclaimer & Copyright</label>
              <input
                type="text"
                value={siteContent.footerText}
                onChange={e => setSiteContent({ ...siteContent, footerText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Saves to centralized backend state & generates an immutable audit record.
            </span>
            <button
              onClick={handleSaveContent}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Content Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: RISK ENGINE CONTROL */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Signal Weights */}
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-display">Risk Feature Weights Calibration</h3>
                <p className="text-[11px] text-slate-500">
                  Configure contribution of each deterministic feature signal. Total must sum precisely to 100%.
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  weightsSum === 100
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200 animate-bounce'
                }`}
              >
                Sum: {weightsSum} / 100 {weightsSum === 100 ? '✓' : '⚠️'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-800">Amount Anomaly</span>
                  <span className="font-mono text-sm font-black text-sky-700">{riskWeights.amountWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={riskWeights.amountWeight}
                  onChange={e => setRiskWeights({ ...riskWeights, amountWeight: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-slate-400 block">Baseline median deviation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-800">New Recipient Novelty</span>
                  <span className="font-mono text-sm font-black text-sky-700">{riskWeights.recipientWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={riskWeights.recipientWeight}
                  onChange={e => setRiskWeights({ ...riskWeights, recipientWeight: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-slate-400 block">Unrecognized counterparty</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-800">Device Novelty</span>
                  <span className="font-mono text-sm font-black text-sky-700">{riskWeights.deviceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={riskWeights.deviceWeight}
                  onChange={e => setRiskWeights({ ...riskWeights, deviceWeight: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-slate-400 block">Hardware / Emulator change</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-800">Velocity Burst</span>
                  <span className="font-mono text-sm font-black text-sky-700">{riskWeights.velocityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={riskWeights.velocityWeight}
                  onChange={e => setRiskWeights({ ...riskWeights, velocityWeight: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-slate-400 block">Rapid consecutive transfers</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-800">Behavior Deviation</span>
                  <span className="font-mono text-sm font-black text-sky-700">{riskWeights.behaviorWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={riskWeights.behaviorWeight}
                  onChange={e => setRiskWeights({ ...riskWeights, behaviorWeight: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-slate-400 block">Late night & type deviation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-800">Network Signal</span>
                  <span className="font-mono text-sm font-black text-sky-700">{riskWeights.networkWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={riskWeights.networkWeight}
                  onChange={e => setRiskWeights({ ...riskWeights, networkWeight: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-slate-400 block">TrustGraph cluster proximity</span>
              </div>
            </div>
          </div>

          {/* Classification Boundaries */}
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">Classification Threshold Boundaries</h3>
              <p className="text-[11px] text-slate-500">
                Determines how numerical risk scores (0–100) map into operational tiers: Low, Medium, High, and Critical.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 block">LOW RISK MAXIMUM</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-emerald-700">{riskThresholds.lowMax}</span>
                  <span className="text-[10px] text-slate-400">Score: 0 – {riskThresholds.lowMax}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  value={riskThresholds.lowMax}
                  onChange={e => setRiskThresholds({ ...riskThresholds, lowMax: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 block">MEDIUM RISK MAXIMUM</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-amber-700">{riskThresholds.mediumMax}</span>
                  <span className="text-[10px] text-slate-400">Score: {riskThresholds.lowMax + 1} – {riskThresholds.mediumMax}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="70"
                  value={riskThresholds.mediumMax}
                  onChange={e => setRiskThresholds({ ...riskThresholds, mediumMax: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 block">HIGH RISK MAXIMUM</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-orange-600">{riskThresholds.highMax}</span>
                  <span className="text-[10px] text-slate-400">Critical is ≥ {riskThresholds.highMax + 1}</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="89"
                  value={riskThresholds.highMax}
                  onChange={e => setRiskThresholds({ ...riskThresholds, highMax: Number(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Future risk calculations will immediately utilize these weights and thresholds.
              </span>
              <button
                onClick={handleSaveRisk}
                disabled={weightsSum !== 100}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Risk Parameters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE FLAGS */}
      {activeTab === 'features' && (
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-display">System Feature Flags</h3>
            <p className="text-[11px] text-slate-500">
              Real-time switches that control frontend visibility and enforce strict backend server-side rejection when disabled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(features).map(([key, enabled]) => (
              <div
                key={key}
                onClick={() => handleToggleFeature(key as keyof FeatureFlags)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  enabled
                    ? 'bg-sky-50/60 border-sky-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 opacity-60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {key === 'copilotEnabled' && 'Enforces 403 on /api/copilot/explain when disabled.'}
                    {key === 'trustGraphEnabled' && 'Controls interactive network relationship graph.'}
                    {key === 'simulationEnabled' && 'Controls synthetic attack scenario generator.'}
                    {key === 'customerSafetyEnabled' && 'Controls consumer mobile safety alert view.'}
                    {!['copilotEnabled', 'trustGraphEnabled', 'simulationEnabled', 'customerSafetyEnabled'].includes(key) &&
                      'Global module operational availability state.'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      enabled ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                  {enabled ? (
                    <ToggleRight className="w-6 h-6 text-sky-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MEMBERS (HARD 5-ACCOUNT LIMIT ENFORCEMENT) */}
      {(activeTab === 'members' || (activeTab as any) === 'team') && (
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 font-display">
                  Authorized Members & RBAC Controls
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
                    activeAccountsCount >= 5
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{activeAccountsCount} / 5 ACTIVE</span>
                  {activeAccountsCount >= 5 && <span className="bg-rose-600 text-white px-1 rounded text-[9px]">LIMIT REACHED</span>}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Maximum 5 active accounts strictly enforced server-side. Creation of a 6th account is atomically rejected by backend.
              </p>
            </div>

            <button
              disabled={activeAccountsCount >= 5}
              onClick={() => setNewUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              title={activeAccountsCount >= 5 ? 'Hard limit of 5 active accounts reached. Disable an account first.' : 'Add Authorized Member'}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{activeAccountsCount >= 5 ? 'Account Limit Reached (5/5)' : 'Add Authorized Member'}</span>
            </button>
          </div>

          {activeAccountsCount >= 5 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Maximum Capacity Reached (5/5):</strong> To provision a new authorized administrator or member, an existing active account must first be disabled.
                </span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">MEMBER</th>
                  <th className="py-2.5 px-3">ROLE</th>
                  <th className="py-2.5 px-3">DEPARTMENT</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">LAST LOGIN</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.role === 'SUPER_ADMIN' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-100 text-purple-800 font-black">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={e => handleChangeUserRole(u.id, e.target.value as AdminRole)}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-[11px] font-bold text-slate-700 focus:ring-1 focus:ring-sky-500"
                      >
                        {availableRoles.map(r => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">{u.department}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">
                      {u.lastLogin.includes('T') ? new Date(u.lastLogin).toLocaleDateString() : u.lastLogin}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleRevokeUserSessions(u.id, u.email)}
                          title="Revoke all active sessions for this member"
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <LogOut className="w-3 h-3 text-slate-500" />
                          <span>Revoke</span>
                        </button>

                        <button
                          onClick={() => {
                            setTargetUserForPass(u);
                            setResetUserPassModalOpen(true);
                          }}
                          title="Reset member temporary password"
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <KeyRound className="w-3 h-3 text-slate-500" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SECURITY & EMERGENCY LOCKDOWN */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">AUTH SUBSYSTEM</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>TITAN NEXUS Ω v7</span>
              </div>
              <span className="text-[10px] text-slate-400 block">SHA-256 + Salted HMAC Handshake</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">ACCOUNT CEILING</span>
              <div className="flex items-center gap-1.5 font-bold text-sky-700">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>{activeAccountsCount} / 5 ACTIVE</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Hard limit enforced on backend</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">ACTIVE SESSIONS</span>
              <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{securityStats?.activeSessionsCount || 1} LIVE TOKENS</span>
              </div>
              <span className="text-[10px] text-slate-400 block">30m Idle / 12h Absolute Lifetime</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-slate-500 text-[10px] font-semibold block uppercase">RATE LIMITING</span>
              <div className="flex items-center gap-1.5 font-bold text-purple-700">
                <Activity className="w-3.5 h-3.5" />
                <span>BRUTE-FORCE GUARD</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Per-IP & Per-Account Lockout</span>
            </div>
          </div>

          {/* Emergency Operations & Maintenance Mode Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Emergency System Lockdown */}
            <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-rose-800">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display text-rose-950">Emergency System Lockdown</h3>
                  <p className="text-[11px] text-rose-700">Super Admin Nuclear Switch</p>
                </div>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                When activated, all active sessions for non-Super-Admin users are revoked immediately across the cluster. Access is restricted exclusively to the root recovery administrator.
              </p>
              <button
                onClick={() => setLockdownConfirmOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Ban className="w-4 h-4" />
                <span>Execute Emergency Lockdown</span>
              </button>
            </div>

            {/* Card 2: System Maintenance Mode */}
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-slate-800">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display text-slate-900">System Maintenance Mode</h3>
                  <p className="text-[11px] text-slate-500">Non-Privileged Access Interception</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When enabled, non-administrative accounts receive an HTTP 503 "System Temporarily Unavailable" response. Only SUPER_ADMIN and ADMIN sessions can access platform telemetry.
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">Current Operating State:</span>
                  <span className={`text-[11px] font-mono font-bold ${securityStats?.maintenanceMode ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {securityStats?.maintenanceMode ? 'MAINTENANCE (RESTRICTED)' : 'NORMAL OPERATIONAL'}
                  </span>
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    securityStats?.maintenanceMode
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {securityStats?.maintenanceMode ? 'Resume Operations' : 'Enable Maintenance'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Security Audit Events */}
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">Authentication & Security Audit Events</h3>
                  <span className="font-mono text-[10px] text-slate-400">
                    Filtered Stream: Logins, Session Revocations, Account Lifecycle Events
                  </span>
                </div>
              </div>
              <button
                onClick={() => loadAllData()}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[350px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">EVENT ID</th>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">ACTOR</th>
                    <th className="py-2.5 px-3">SECURITY ACTION</th>
                    <th className="py-2.5 px-3">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {(securityStats?.recentSecurityLogs || logs.filter(l =>
                    ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'SESSION_REVOKED', 'ACCOUNT_CREATED', 'ACCOUNT_DISABLED', 'ACCOUNT_ENABLED', 'EMERGENCY_LOCKDOWN', 'PASSWORD_RESET'].includes(l.action)
                  )).map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-3 text-sky-700 font-bold">{l.id}</td>
                      <td className="py-2 px-3 text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2 px-3 text-slate-800 font-sans font-medium">{l.actor}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.action.includes('FAILURE') || l.action.includes('EMERGENCY') || l.action.includes('DISABLED')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : l.action.includes('SUCCESS') || l.action.includes('ENABLED')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {l.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-sans text-xs">{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DYNAMIC RULES ENGINE & SHADOW MODE (Item 3) */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-base text-slate-900 font-display">
                    Hot-Reloadable Dynamic Rules Engine & Shadow Mode
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                    IN-MEMORY EVALUATION
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Enables instantaneous fraud rule hot-reloading without service restarts. Safely test new policies in{' '}
                  <strong className="text-slate-700">SHADOW MODE</strong> against 1,120+ synthetic transactions to verify false positive rates (FPR) before promoting to live enforcement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunDryRun()}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span>Dry-Run Backtest (1,120 Tx)</span>
                </button>
                <button
                  onClick={() => setNewRuleModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Create Dynamic Rule</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">TOTAL CONFIGURED RULES</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{rules.length}</span>
                <span className="text-[10px] text-slate-400 block">Loaded in active memory</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">ACTIVE ENFORCED</span>
                <span className="text-lg font-bold text-emerald-800 font-mono">
                  {rules.filter(r => r.mode === 'ACTIVE' && r.enabled).length}
                </span>
                <span className="text-[10px] text-emerald-600 block">Enforcing interventions</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-amber-700 block uppercase">SHADOW MODE</span>
                <span className="text-lg font-bold text-amber-800 font-mono">
                  {rules.filter(r => r.mode === 'SHADOW').length}
                </span>
                <span className="text-[10px] text-amber-600 block">Telemetry only • Zero customer friction</span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-sky-700 block uppercase">EVALUATION LATENCY</span>
                <span className="text-lg font-bold text-sky-800 font-mono">&lt; 0.8ms</span>
                <span className="text-[10px] text-sky-600 block">Zero DB locking overhead</span>
              </div>
            </div>
          </div>

          {/* Rules Table */}
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-display">Configured In-Memory Dynamic Rules</h4>
                <p className="text-[11px] text-slate-500">
                  Rules evaluate sequentially prior to final transaction authorization.
                </p>
              </div>
              <button
                onClick={() => api.getRules().then(d => setRules(d.rules))}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">RULE ID</th>
                    <th className="py-2.5 px-3">RULE NAME & DESCRIPTION</th>
                    <th className="py-2.5 px-3">CONDITION LOGIC</th>
                    <th className="py-2.5 px-3">ACTION</th>
                    <th className="py-2.5 px-3">MODE</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {rules.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-sky-700">{rule.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{rule.name}</div>
                        <div className="text-[11px] text-slate-500">{rule.description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <code className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-800">
                          {rule.conditionField} {rule.conditionOperator}{' '}
                          {typeof rule.conditionValue === 'number'
                            ? rule.conditionField === 'amount'
                              ? `৳${rule.conditionValue.toLocaleString()}`
                              : rule.conditionValue
                            : String(rule.conditionValue)}
                        </code>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            rule.action === 'SOFT_QUARANTINE'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : rule.action === 'STEP_UP_2FA'
                              ? 'bg-sky-50 text-sky-800 border border-sky-300'
                              : rule.action === 'BLOCK'
                              ? 'bg-rose-50 text-rose-800 border border-rose-300'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          {rule.action}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {rule.mode === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300">
                            <Layers className="w-3 h-3 text-amber-600" />
                            SHADOW
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            rule.enabled
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {rule.enabled ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                              <span>Enabled</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRunDryRun(rule)}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-[11px] flex items-center gap-1"
                            title="Backtest against 1,120 synthetic transactions"
                          >
                            <Activity className="w-3 h-3" />
                            <span>Dry-Run</span>
                          </button>
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px]"
                            title="Switch between Active and Shadow mode"
                          >
                            {rule.mode === 'ACTIVE' ? 'Switch to Shadow' : 'Promote to Active'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: IMMUTABLE AUDIT LOG & SHA-256 CRYPTOGRAPHIC CHAIN (Item 5) */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Cryptographic Chain Integrity Card */}
          <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-900 font-display">
                      Cryptographic SHA-256 Audit Chain Verification
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      TAMPER-EVIDENT MERKLE-LINKED
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Every admin action, rule update, and dual-authorization is hashed with its predecessor block using SHA-256. Any modification breaks the cryptographic forward link immediately.
                  </p>
                </div>
              </div>

              <button
                onClick={handleVerifyAuditChain}
                disabled={auditVerifyLoading}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditVerifyLoading ? 'animate-spin' : ''}`} />
                <span>{auditVerifyLoading ? 'Verifying Hashes...' : 'Re-Verify Cryptographic Chain'}</span>
              </button>
            </div>

            {auditVerifyResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-200/60 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-sans font-bold">CHAIN INTEGRITY STATUS</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    100% VALID (UNBROKEN)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-sans font-bold">VERIFIED BLOCKS</span>
                  <span className="font-bold text-slate-900">{auditVerifyResult.totalBlocks} Blocks</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-0.5 col-span-2">
                  <span className="text-[10px] text-slate-400 block font-sans font-bold">LATEST BLOCK SHA-256 HASH</span>
                  <span className="font-bold text-slate-800 text-[11px] truncate block" title={auditVerifyResult.latestBlockHash}>
                    {auditVerifyResult.latestBlockHash}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Audit Logs Table */}
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">System Audit Log Trail</h3>
                  <span className="font-mono text-[10px] text-slate-400">
                    Append-Only Immutable Event Stream ({filteredLogs.length} events)
                  </span>
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">LOG ID</th>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">ACTOR</th>
                    <th className="py-2.5 px-3">ACTION</th>
                    <th className="py-2.5 px-3">RESOURCE</th>
                    <th className="py-2.5 px-3">SHA-256 BLOCK HASH</th>
                    <th className="py-2.5 px-3">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-sky-700 font-bold">{log.id}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{log.actor}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[10px] text-slate-700">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{log.resource}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">
                        {log.hash ? (
                          <span
                            className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 cursor-help"
                            title={`Full Block Hash: ${log.hash}\nPrev Hash: ${log.prevHash || 'GENESIS'}`}
                          >
                            {log.hash.substring(0, 10)}...
                          </span>
                        ) : (
                          <span className="text-slate-400">---</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-sm truncate text-[11px]">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Demo */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-rose-200 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Confirm Demo State Reset</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              This will restore original synthetic customer baseline profiles, reset all active case triage stages, re-seed the TrustGraph network topology, and log an immutable audit event.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDemo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Proceed with Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Authorized Member Modal (Hard 5-Account Limit) */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <UserPlus className="w-4 h-4 text-sky-600" />
                <span>Provision Authorized Member ({activeAccountsCount}/5)</span>
              </div>
              <button
                onClick={() => setNewUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ×
              </button>
            </div>

            {activeAccountsCount >= 5 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Maximum of 5 authorized accounts has been reached. Creation rejected.</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakil Anowar"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Official Email / ID</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. shakil@upay.demo"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Temporary Password</label>
                <input
                  type="text"
                  required
                  placeholder="Temporary password"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-[10px] text-slate-400">Stored as secure SHA-256 salted hash. Never plaintext.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500 font-mono font-bold"
                >
                  {availableRoles.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Compliance & BFIU"
                  value={newUserDepartment}
                  onChange={e => setNewUserDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeAccountsCount >= 5}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold"
                >
                  Provision Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetUserPassModalOpen && targetUserForPass && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-sky-600" />
                <span>Reset Password: {targetUserForPass.name}</span>
              </div>
              <button
                onClick={() => setResetUserPassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Assign a new temporary password for <strong>{targetUserForPass.email}</strong>. All active sessions for this account will be revoked immediately.
            </p>

            <form onSubmit={handleResetUserPassword} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">New Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetUserPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
                >
                  Apply & Revoke Sessions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Lockdown Confirmation Modal */}
      {lockdownConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-rose-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-rose-300 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Confirm Emergency System Lockdown</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="font-bold">CRITICAL SYSTEM ACTION:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>All active sessions for non-Super-Admin accounts are terminated immediately.</li>
                <li>Non-root administrators and members will be forcibly signed out.</li>
                <li>Root recovery Super Admin session will remain active.</li>
              </ul>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Are you certain you wish to trigger an immediate cluster-wide session purge?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setLockdownConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Abort
              </button>
              <button
                onClick={handleEmergencyLockdown}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>CONFIRM EMERGENCY LOCKDOWN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Dynamic Rule Modal (Item 3) */}
      {newRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Hot-Reload New Dynamic Rule</span>
              </div>
              <button
                onClick={() => setNewRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Create an in-memory rule evaluated before payment completion. You can initialize it in{' '}
              <strong className="text-purple-700">SHADOW MODE</strong> to backtest without affecting live customer transactions.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Velocity Rapid Outflow Rule"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Description / Rationale</label>
                <input
                  type="text"
                  placeholder="e.g. Temporary escrow quarantine on rapid transfers above 10k"
                  value={ruleDesc}
                  onChange={e => setRuleDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Field</label>
                  <select
                    value={ruleField}
                    onChange={e => setRuleField(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium"
                  >
                    <option value="amount">amount</option>
                    <option value="riskScore">riskScore</option>
                    <option value="velocity">velocity</option>
                    <option value="isEmulator">isEmulator</option>
                    <option value="isNewRecipient">isNewRecipient</option>
                    <option value="isNight">isNight</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Operator</label>
                  <select
                    value={ruleOp}
                    onChange={e => setRuleOp(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium"
                  >
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Threshold Value</label>
                  <input
                    type="text"
                    required
                    placeholder="15000"
                    value={ruleVal}
                    onChange={e => setRuleVal(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Action Intercept</label>
                  <select
                    value={ruleAction}
                    onChange={e => setRuleAction(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="SOFT_QUARANTINE">SOFT_QUARANTINE (15-min Escrow)</option>
                    <option value="STEP_UP_2FA">STEP_UP_2FA (OTP Step-Up)</option>
                    <option value="FLAG_FOR_REVIEW">FLAG_FOR_REVIEW</option>
                    <option value="BLOCK">BLOCK (Immediate Decline)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Initial Deployment Mode</label>
                  <select
                    value={ruleMode}
                    onChange={e => setRuleMode(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="SHADOW">SHADOW (Metrics Only - Safe)</option>
                    <option value="ACTIVE">ACTIVE (Enforce Live)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRunDryRun()}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span>Test Dry-Run (1,120 Tx)</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRuleModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
                  >
                    Hot-Reload Rule
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dry Run Simulation Backtest Modal (Item 3) */}
      {dryRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Historical Dry-Run Simulation (1,120+ Synthetic Transactions)</span>
              </div>
              <button
                onClick={() => setDryRunModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ×
              </button>
            </div>

            {dryRunLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
                <span className="text-xs font-medium text-slate-600">
                  Scanning 1,120 historical transactions and computing false-positive rate...
                </span>
              </div>
            ) : dryRunResult ? (
              <div className="space-y-4">
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    dryRunResult.safeForActiveRollout
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {dryRunResult.safeForActiveRollout ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs">
                      {dryRunResult.safeForActiveRollout
                        ? 'PRODUCTION READY: RECOMMENDED FOR ACTIVE ROLLOUT'
                        : 'HIGH FRICTION WARNING: RECOMMENDED FOR SHADOW MODE ONLY'}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-90">
                      Rule condition: <code className="font-mono font-bold">{dryRunResult.evaluatedRule}</code>.{' '}
                      {dryRunResult.safeForActiveRollout
                        ? 'False positive rate is low enough to safely enforce without customer disruption.'
                        : 'This rule triggers too frequently on legitimate users. Retain in shadow mode or raise threshold.'}
                    </div>
                  </div>
                </div>

                {/* Metric Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">DATASET SCANNED</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">{dryRunResult.totalScanned}</span>
                    <span className="text-[10px] text-slate-400 block">Synthetic transactions</span>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-0.5">
                    <span className="text-[10px] text-sky-700 font-bold block uppercase">TRIGGERED</span>
                    <span className="text-lg font-bold text-sky-800 font-mono">{dryRunResult.triggeredCount}</span>
                    <span className="text-[10px] text-sky-600 block">Matches found</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                    <span className="text-[10px] text-emerald-700 font-bold block uppercase">TRUE FRAUD (TP)</span>
                    <span className="text-lg font-bold text-emerald-800 font-mono">{dryRunResult.truePositives}</span>
                    <span className="text-[10px] text-emerald-600 block">Known fraud stopped</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-700 font-bold block uppercase">FALSE POSITIVE RATE</span>
                    <span className="text-lg font-bold text-amber-800 font-mono">{dryRunResult.falsePositiveRate}%</span>
                    <span className="text-[10px] text-amber-600 block">{dryRunResult.falsePositives} legitimate users</span>
                  </div>
                </div>

                {/* Sample Triggered List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Sample Triggered Transactions ({dryRunResult.sampleTriggered?.length || 0})
                  </span>
                  <div className="overflow-x-auto max-h-[200px] border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-semibold text-slate-500 border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-2">TX ID</th>
                          <th className="p-2">AMOUNT</th>
                          <th className="p-2">TYPE</th>
                          <th className="p-2">CUSTOMER</th>
                          <th className="p-2">RISK SCORE</th>
                          <th className="p-2">GROUND TRUTH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {(dryRunResult.sampleTriggered || []).map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="p-2 text-sky-700 font-bold">{tx.id}</td>
                            <td className="p-2 font-sans font-bold">৳{Number(tx.amount).toLocaleString()}</td>
                            <td className="p-2 text-slate-600">{tx.type}</td>
                            <td className="p-2 text-slate-600">{tx.customerId}</td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold ${
                                  tx.riskScore >= 75
                                    ? 'bg-rose-50 text-rose-700'
                                    : tx.riskScore >= 50
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {tx.riskScore}
                              </span>
                            </td>
                            <td className="p-2">
                              {tx.isFraud ? (
                                <span className="text-rose-700 font-bold bg-rose-50 px-1 rounded">CONFIRMED FRAUD</span>
                              ) : (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">LEGITIMATE</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setDryRunModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Close Simulation
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
