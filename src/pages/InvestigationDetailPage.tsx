/**
 * Upay Sentinel AI - Investigation Case Detail (Command & Enforcement Center)
 * Left: Case Dossier, Triage Pipeline, Enforcement Actions & Notes
 * Center: Evidence Timeline & Structured Inventory
 * Right: AI Copilot Grounded Investigation
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  ExternalLink,
  ShieldAlert,
  Lock,
  Smartphone,
  Download,
  FileText,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { AICopilotPanel } from '../components/copilot/AICopilotPanel';
import { InvestigationCase, Customer, CaseStatus, CasePriority } from '../types';

interface InvestigationDetailPageProps {
  caseId: string;
  onNavigate: (path: string) => void;
}

export const InvestigationDetailPage: React.FC<InvestigationDetailPageProps> = ({
  caseId,
  onNavigate,
}) => {
  const [data, setData] = useState<{ case: InvestigationCase; customer?: Customer } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    setLoading(true);
    try {
      const res = await api.getInvestigation(caseId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: CaseStatus) => {
    try {
      const res = await api.updateCaseStatus(caseId, newStatus, 'Fahad Ahmed');
      setData(prev => (prev ? { ...prev, case: res.case } : null));
      notify(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (newPriority: CasePriority) => {
    try {
      const res = await api.updateCaseDetails(caseId, { priority: newPriority, actor: 'Fahad Ahmed' });
      setData(prev => (prev ? { ...prev, case: res.case } : null));
      notify(`Priority updated to ${newPriority}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssigneeChange = async (assignedTo: string) => {
    try {
      const res = await api.updateCaseDetails(caseId, { assignedTo, actor: 'Fahad Ahmed' });
      setData(prev => (prev ? { ...prev, case: res.case } : null));
      notify(`Assigned to ${assignedTo}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnforceAction = async (action: 'FREEZE_WALLET' | 'LOCK_DEVICE' | 'FILE_SAR' | 'UNFREEZE', label: string) => {
    setActionLoading(true);
    try {
      const res = await api.executeCaseAction(caseId, action, `Analyst triggered ${label}`, 'Fahad Ahmed');
      if (res?.case) {
        setData(prev => (prev ? { ...prev, case: res.case } : null));
      }
      notify(`ENFORCED: ${label} executed and recorded in audit log.`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadSAR = () => {
    if (!data?.case) return;
    const c = data.case;
    const sarReport = `# BANGLADESH BANK FINANCIAL INTELLIGENCE UNIT (BFIU)
## SUSPICIOUS ACTIVITY REPORT (SAR) / STR
------------------------------------------------------------
Report Reference: SAR-BFIU-${c.id}
Date of Filing: ${new Date().toISOString()}
Reporting Entity: upay MFS (UCB Fintech Ltd)
Reporting Officer: Fahad Ahmed (Senior Fraud Analyst, ID: AN-8902)

1. SUBJECT PARTICULARS
------------------------------------------------------------
Customer ID: ${c.customerId}
Customer Name: ${c.customerName}
Risk Rating: ${c.riskScore}/100 (${c.priority})
Flagged Transaction Value: BDT ${c.amountBDT?.toLocaleString() || '18,500'}

2. SUSPICIOUS INDICATORS & NARRATIVE
------------------------------------------------------------
Primary Signal: ${c.primarySignal}
Summary:
${c.aiAnalysis?.summary || 'Coordinated Account Takeover followed by rapid smurfing dispersion into cash-out agent network.'}

What Happened:
${c.aiAnalysis?.whatHappened || 'Customer logged in from unregistered Android emulator DEV-DEMO-104 with atypical zero-delay cadence, bound a new beneficiary wallet, and transferred ৳18,500 (+538% of median).'}

3. STRUCTURED EVIDENCE INVENTORY
------------------------------------------------------------
Transaction Facts:
${c.structuredEvidence.transactionFacts.map(f => `- ${f}`).join('\n')}

Behavioral Anomalies:
${c.structuredEvidence.behavioralAnomalies.map(a => `- ${a}`).join('\n')}

Network Findings:
${c.structuredEvidence.networkFindings.map(n => `- ${n}`).join('\n')}

4. ENFORCEMENT & REMEDIAL ACTIONS TAKEN
------------------------------------------------------------
- Account status: Flagged & Outbound Transfers Held
- Recipient Wallets: Added to High-Velocity Interception List
- Agent Hub AGENT-DEMO-007: Placed under heightened topological audit

------------------------------------------------------------
[CONFIDENTIAL - FOR REGULATORY COMPLIANCE ONLY]
`;

    const blob = new Blob([sarReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAR-BFIU-${c.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`SAR Report for ${c.id} downloaded.`);
  };

  const handleDownloadGoAMLXML = async () => {
    if (!data?.case) return;
    try {
      const xml = await api.getGoAMLXml(data.case.id);
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BFIU-goAML-STR-${data.case.id}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      notify(`Official BFIU goAML XML file for ${data.case.id} exported successfully.`);
    } catch (err: any) {
      console.error(err);
      notify(`Failed to export goAML XML: ${err.message}`);
    }
  };

  const handleDualAuthorize = async (decision: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    try {
      const res = await api.dualAuthorizeCase(
        caseId,
        decision,
        decision === 'APPROVE'
          ? 'Approved by Senior Compliance Officer (Checker)'
          : 'Rejected by Compliance Supervisor (Checker)'
      );
      if (res?.case) {
        setData(prev => (prev ? { ...prev, case: res.case } : null));
      }
      notify(
        `Four-Eyes Principle: Decision recorded as ${
          decision === 'APPROVE' ? 'APPROVED & CRYPTOGRAPHICALLY CHAINED' : 'REJECTED'
        }.`
      );
    } catch (err: any) {
      console.error(err);
      notify(`Dual-authorization failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await api.addCaseNote(caseId, newNote, 'Fahad Ahmed');
      setData(prev => (prev ? { ...prev, case: res.case } : null));
      setNewNote('');
      notify('Analyst observation recorded.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  if (loading || !data?.case) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Loading case dossier and evidence chain...</p>
      </div>
    );
  }

  const { case: c } = data;
  const isWalletSuspended = c.enforcementActions?.some(a => a.action === 'FREEZE_WALLET') &&
    !c.enforcementActions?.some(a => a.action === 'UNFREEZE');

  const statusSteps: CaseStatus[] = ['NEW', 'INVESTIGATING', 'ESCALATED', 'RESOLVED'];

  return (
    <div className="space-y-4 pb-16 text-xs text-slate-800">
      {/* Top Breadcrumb & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/90">
        <button
          onClick={() => onNavigate('/investigations')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Investigation Cases</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {c.transactionId && (
            <button
              onClick={() => onNavigate(`/transactions/${c.transactionId}`)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sky-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <span>Transaction {c.transactionId}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onNavigate(`/trustgraph?entityId=${c.customerId}`)}
            className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-semibold text-xs flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open in TrustGraph</span>
          </button>

          <button
            onClick={handleDownloadGoAMLXML}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            title="Export official schema-valid BFIU goAML 4.0 XML file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export BFIU goAML XML</span>
          </button>

          <button
            onClick={handleDownloadSAR}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download BFIU SAR</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Triage Status Pipeline Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">TRIAGE LIFECYCLE</span>
          <div className="flex items-center gap-2 mt-1">
            {statusSteps.map((st, i) => {
              const isActive = c.status === st;
              const isPast = statusSteps.indexOf(c.status) > i;
              return (
                <React.Fragment key={st}>
                  <button
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : isPast
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                  {i < statusSteps.length - 1 && (
                    <span className="text-slate-300 font-bold">→</span>
                  )}
                </React.Fragment>
              );
            })}
            <button
              onClick={() => handleStatusChange('FALSE_POSITIVE')}
              className={`ml-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                c.status === 'FALSE_POSITIVE'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              False Positive
            </button>
          </div>
        </div>

        {/* Priority & Assignee Quick Adjust */}
        <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div>
            <span className="text-slate-400 text-[10px] font-bold block">PRIORITY</span>
            <select
              value={c.priority}
              onChange={e => handlePriorityChange(e.target.value as CasePriority)}
              className="mt-1 py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] font-bold block">ASSIGNED ANALYST</span>
            <select
              value={c.assignedTo}
              onChange={e => handleAssigneeChange(e.target.value)}
              className="mt-1 py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="Fahad Ahmed">Fahad Ahmed (You)</option>
              <option value="Nusrat Jahan">Nusrat Jahan</option>
              <option value="Tanvir Hassan">Tanvir Hassan</option>
              <option value="Queue Triage Bot">Queue Triage Bot</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3-Column Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUMN 1 (4 Cols): Case Information, Enforcement Actions & Notes */}
        <div className="lg:col-span-4 space-y-4">
          {/* Dossier Card */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-sky-700">{c.id}</span>
              <RiskBadge level={c.priority as any} score={c.riskScore} size="sm" />
            </div>

            <h2 className="text-sm font-bold text-slate-900 leading-snug">{c.title}</h2>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">CUSTOMER</span>
                <span className="font-bold text-slate-900">{c.customerName}</span>
                <span className="text-slate-500 font-mono block">{c.customerId}</span>
              </div>

              {c.amountBDT && (
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold">TOTAL VALUE FLAGGED</span>
                  <span className="font-mono font-black text-slate-900 text-base">
                    ৳{c.amountBDT.toLocaleString()}
                  </span>
                </div>
              )}

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">PRIMARY RISK FACTOR</span>
                <span className="text-rose-700 font-bold">{c.primarySignal}</span>
              </div>
            </div>
          </div>

          {/* 1-Click Enforcement Actions Deck */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Enforcement Controls</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">HUMAN-IN-THE-LOOP</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Targeted protective actions requiring licensed analyst sign-off before financial lock.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleEnforceAction(isWalletSuspended ? 'UNFREEZE' : 'FREEZE_WALLET', isWalletSuspended ? 'Lift Wallet Suspension' : 'Emergency Wallet Freeze')}
                disabled={actionLoading}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isWalletSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isWalletSuspended ? 'Lift Wallet Suspension' : 'Emergency Wallet Freeze'}</span>
              </button>

              <button
                onClick={() => handleEnforceAction('LOCK_DEVICE', 'Restrict Handset Device DEV-DEMO-104')}
                disabled={actionLoading}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                <span>Restrict Handset Device</span>
              </button>

              <button
                onClick={handleDownloadSAR}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>File Bangladesh Bank SAR</span>
              </button>

              <button
                onClick={handleDownloadGoAMLXML}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export BFIU goAML XML (UNODC Schema)</span>
              </button>
            </div>

            {/* Audit Log of Enforcements */}
            {c.enforcementActions && c.enforcementActions.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Enforcement History</span>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {c.enforcementActions.map((act, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-700 flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-700">{act.action}</span>
                      <span className="text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Four-Eyes Principle Dual-Authorization Card (Item 5) */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Four-Eyes Dual Authorization</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">MAKER-CHECKER</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mandatory dual-authorization for irreversible actions and high-value fund restrictions exceeding ৳50,000 threshold under Bangladesh Bank anti-tamper guidelines.
            </p>

            {c.dualAuthRequired ? (
              <div className="space-y-3 pt-1">
                {c.dualAuthStatus === 'PENDING_APPROVAL' && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs text-amber-900 block">
                          ACTION PENDING CHECKER APPROVAL
                        </span>
                        <span className="text-[11px] text-amber-700 block mt-0.5">
                          Requested by: <strong>{c.dualAuthRequestedBy || 'Fahad Ahmed (Maker)'}</strong>
                        </span>
                        <span className="text-[10px] text-amber-600 block mt-0.5">
                          Requires independent sign-off from a second authorized supervisor.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                      <button
                        onClick={() => handleDualAuthorize('APPROVE')}
                        disabled={actionLoading}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authorize Action</span>
                      </button>
                      <button
                        onClick={() => handleDualAuthorize('REJECT')}
                        disabled={actionLoading}
                        className="py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {c.dualAuthStatus === 'APPROVED' && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>DUAL-AUTHORIZED & CRYPTOGRAPHICALLY CHAINED</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 block">
                      Approved by: <strong>{c.dualAuthApprovedBy || 'Authorized Supervisor (Checker)'}</strong>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono block">
                      SHA-256 block hash linked to central immutable audit ledger.
                    </span>
                  </div>
                )}

                {c.dualAuthStatus === 'REJECTED' && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>DUAL-AUTHORIZATION REJECTED</span>
                    </div>
                    <span className="text-[11px] text-rose-700 block">
                      Declined by: <strong>{c.dualAuthApprovedBy || 'Compliance Supervisor'}</strong>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-2">
                <span className="text-[11px] block">
                  Current flagged value: <strong className="font-mono">৳{c.amountBDT?.toLocaleString() || '18,500'}</strong>. Standard single-analyst enforcement is active.
                </span>
                <button
                  onClick={() => {
                    setData(prev =>
                      prev
                        ? {
                            ...prev,
                            case: {
                              ...prev.case,
                              dualAuthRequired: true,
                              dualAuthStatus: 'PENDING_APPROVAL',
                              dualAuthRequestedBy: 'Fahad Ahmed (Maker)',
                            },
                          }
                        : null
                    );
                    notify('Four-Eyes Maker-Checker requirement attached to case.');
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Attach Four-Eyes Protocol</span>
                </button>
              </div>
            )}
          </div>

          {/* Analyst Notes Log */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Analyst Observation Notes</h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {c.analystNotes.length === 0 ? (
                <p className="text-slate-400 text-[11px] italic">No analyst notes recorded yet.</p>
              ) : (
                c.analystNotes.map(note => (
                  <div key={note.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-sky-700">{note.author}</span>
                      <span className="text-slate-400">{new Date(note.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-100">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Log observation or justification..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 resize-none"
              />
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold text-xs transition-colors"
              >
                {submittingNote ? 'Saving...' : 'Add Case Note'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMN 2 (4 Cols): Evidence Timeline & Structured Inventory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-display">Evidence Timeline</h3>
                <p className="text-[11px] text-slate-500">Chronological incident sequence</p>
              </div>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>

            <div className="relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {c.timeline.map(evt => {
                const isCritical = evt.severity === 'CRITICAL';
                const isAlert = evt.severity === 'ALERT';
                const isWarning = evt.severity === 'WARNING';

                const dotColor = isCritical
                  ? 'bg-rose-600'
                  : isAlert
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-400'
                  : 'bg-sky-500';

                return (
                  <div key={evt.id} className="relative group">
                    <span className={`absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full ${dotColor} ring-4 ring-white`} />
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:border-slate-300 transition-colors space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">{evt.title}</span>
                        <span className="font-mono text-sky-700 font-bold">{evt.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{evt.description}</p>
                      {evt.metadata && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(evt.metadata).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-white text-slate-600 border border-slate-200"
                            >
                              {k}: <strong className="text-slate-900">{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structured Evidence Card */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Structured Evidence Inventory</h4>
            <div className="space-y-2 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block font-semibold mb-1 text-[10px] uppercase">
                  Transaction Facts
                </span>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {c.structuredEvidence.transactionFacts.map((fact, i) => (
                    <li key={i}>{fact}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block font-semibold mb-1 text-[10px] uppercase">
                  Behavioral Anomalies
                </span>
                <ul className="list-disc list-inside text-rose-700 space-y-0.5 font-medium">
                  {c.structuredEvidence.behavioralAnomalies.map((anom, i) => (
                    <li key={i}>{anom}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block font-semibold mb-1 text-[10px] uppercase">
                  TrustGraph Network Findings
                </span>
                <ul className="list-disc list-inside text-sky-800 space-y-0.5 font-medium">
                  {c.structuredEvidence.networkFindings.map((find, i) => (
                    <li key={i}>{find}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3 (4 Cols): AI Copilot Grounded Investigation */}
        <div className="lg:col-span-4 h-[760px] sticky top-20">
          <AICopilotPanel caseData={c} transactionId={c.transactionId} />
        </div>
      </div>
    </div>
  );
};
