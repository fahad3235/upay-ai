/**
 * Upay Sentinel AI - Investigations Directory & Case Queue
 * High-fidelity, real-time reactive implementation matching Image 4 specifications
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Share2,
  ChevronDown,
  Sparkles,
  FlaskConical,
  TrendingUp,
  AlertCircle,
  Minus,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { getDataset } from '../data/syntheticDataset';
import { InvestigationCase, CaseStatus, CasePriority } from '../types';

interface InvestigationsPageProps {
  onNavigate: (path: string) => void;
}

function formatDate(isoString?: string): string {
  if (!isoString) return '02 Oct 2026, 11:12';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return (
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return isoString;
  }
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({ onNavigate }) => {
  const [cases, setCases] = useState<InvestigationCase[]>(() => {
    return getDataset().cases || [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const [investigatorFilter, setInvestigatorFilter] = useState('All investigators');
  const [activeMenuCaseId, setActiveMenuCaseId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('CUS-DEMO-1042');
  const [newAmount, setNewAmount] = useState('18500');
  const [newPriority, setNewPriority] = useState<CasePriority>('HIGH');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await api.getInvestigations();
      if (res?.cases && res.cases.length > 0) {
        setCases(res.cases);
      }
    } catch (e) {
      console.error('Error fetching investigations:', e);
    }
  };

  const handleAdvanceStatus = async (caseId: string, newStatus: CaseStatus) => {
    setActiveMenuCaseId(null);
    try {
      await api.updateCaseStatus(caseId, newStatus, 'Fahad Ahmed');
      setCases(prev =>
        prev.map(c =>
          c.id === caseId
            ? { ...c, status: newStatus, updatedTime: new Date().toISOString() }
            : c
        )
      );
    } catch (e) {
      console.error('Failed to advance case status:', e);
    }
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const data = getDataset();
    const cust = data.customers.find(c => c.id === newCustomerId) || data.customers[0];
    const newCaseId = `CASE-2026-${Math.floor(8951 + Math.random() * 900)}`;

    const createdCase: InvestigationCase = {
      id: newCaseId,
      title: newTitle.trim(),
      customerId: cust.id,
      customerName: cust.name,
      transactionId: `TX-DEMO-${Math.floor(100 + Math.random() * 899)}`,
      amountBDT: Number(newAmount) || 15000,
      priority: newPriority,
      riskScore: newPriority === 'CRITICAL' ? 92 : newPriority === 'HIGH' ? 81 : 55,
      primarySignal: 'Analyst Initiated Case',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      assignedTo: 'Fahad Ahmed (Super Admin)',
      status: 'NEW',
      timeline: [
        {
          id: `EVT-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          title: 'Investigation Initiated by Analyst',
          category: 'ALERT',
          description: `Manual case opened: ${newTitle.trim()}`,
          severity: newPriority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        },
      ],
      structuredEvidence: {
        transactionFacts: [`Customer flagged for manual review with ৳${newAmount} activity.`],
        behavioralAnomalies: ['Analyst escalation.'],
        networkFindings: ['Awaiting graph traversal.'],
        riskSignalsSummary: ['Manual Review Required (+30)'],
      },
      analystNotes: [
        {
          id: `NOTE-${Date.now()}`,
          author: 'Fahad Ahmed',
          text: `Case manually created: ${newTitle.trim()}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    data.cases.unshift(createdCase);
    setCases([createdCase, ...cases]);
    setShowNewModal(false);
    setNewTitle('');
    onNavigate(`/investigations/${createdCase.id}`);
  };

  // Dynamic status counts
  const countNew = cases.filter(c => c.status === 'NEW').length;
  const countInvestigating = cases.filter(c => c.status === 'INVESTIGATING').length;
  const countEscalated = cases.filter(c => c.status === 'ESCALATED').length;
  const countResolved = cases.filter(c => c.status === 'RESOLVED').length;
  const countFalsePositive = cases.filter(c => c.status === 'FALSE_POSITIVE').length;

  // Extract unique investigator names
  const uniqueInvestigators = useMemo(() => {
    const set = new Set<string>();
    cases.forEach(c => {
      if (c.assignedTo && c.assignedTo !== 'Unassigned') {
        set.add(c.assignedTo);
      }
    });
    return Array.from(set);
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Status filter
      if (statusFilter !== 'All statuses') {
        const s = statusFilter.toUpperCase().replace(/\s+/g, '_');
        if (c.status !== s) return false;
      }

      // Priority filter
      if (priorityFilter !== 'All priorities') {
        if (priorityFilter.includes('Critical') && c.priority !== 'CRITICAL') return false;
        if (priorityFilter.includes('High') && c.priority !== 'HIGH') return false;
        if (priorityFilter.includes('Medium') && c.priority !== 'MEDIUM') return false;
        if (priorityFilter.includes('Low') && c.priority !== 'LOW') return false;
      }

      // Investigator filter
      if (investigatorFilter !== 'All investigators') {
        if (investigatorFilter === 'Unassigned') {
          if (c.assignedTo && c.assignedTo !== 'Unassigned') return false;
        } else {
          if (c.assignedTo !== investigatorFilter) return false;
        }
      }

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          (c.transactionId && c.transactionId.toLowerCase().includes(q)) ||
          c.customerName.toLowerCase().includes(q) ||
          c.customerId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.primarySignal.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [cases, statusFilter, priorityFilter, investigatorFilter, searchTerm]);

  const toggleStatusFilter = (targetStatus: string) => {
    if (statusFilter.toUpperCase().replace(/\s+/g, '_') === targetStatus) {
      setStatusFilter('All statuses');
    } else {
      setStatusFilter(targetStatus);
    }
  };

  return (
    <div
      className="space-y-6 pb-16 font-sans select-none text-slate-800"
      onClick={() => setActiveMenuCaseId(null)}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 tracking-wider uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GOOD EVENING</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Investigations
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-semibold tracking-wider font-mono">
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              <span>SYNTHETIC DEMO</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Your case queue, sorted and ready — {cases.length} high-risk events monitored with grounded evidence.
          </p>
        </div>

        {/* Action Button: + New investigation */}
        <button
          onClick={e => {
            e.stopPropagation();
            setShowNewModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New investigation</span>
        </button>
      </div>

      {/* Row of 5 Status Metric Cards (Interactive click-to-filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* NEW */}
        <div
          onClick={() => toggleStatusFilter('NEW')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:border-blue-300 hover:shadow-md ${
            statusFilter.toUpperCase() === 'NEW'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              NEW
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{countNew}</div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting triage</div>
          </div>
        </div>

        {/* INVESTIGATING */}
        <div
          onClick={() => toggleStatusFilter('INVESTIGATING')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:border-amber-300 hover:shadow-md ${
            statusFilter.toUpperCase() === 'INVESTIGATING'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
              : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              INVESTIGATING
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{countInvestigating}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active work</div>
          </div>
        </div>

        {/* ESCALATED */}
        <div
          onClick={() => toggleStatusFilter('ESCALATED')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:border-orange-300 hover:shadow-md ${
            statusFilter.toUpperCase() === 'ESCALATED'
              ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
              : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              ESCALATED
            </span>
            <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{countEscalated}</div>
            <div className="text-[11px] text-slate-400 mt-1">Needs senior review</div>
          </div>
        </div>

        {/* RESOLVED */}
        <div
          onClick={() => toggleStatusFilter('RESOLVED')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:border-emerald-300 hover:shadow-md ${
            statusFilter.toUpperCase() === 'RESOLVED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
              : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              RESOLVED
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{countResolved}</div>
            <div className="text-[11px] text-slate-400 mt-1">Closed this period</div>
          </div>
        </div>

        {/* FALSE POSITIVE */}
        <div
          onClick={() => toggleStatusFilter('FALSE_POSITIVE')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:border-purple-300 hover:shadow-md ${
            statusFilter.toUpperCase().replace(/\s+/g, '_') === 'FALSE_POSITIVE'
              ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
              : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              FALSE POSITIVE
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{countFalsePositive}</div>
            <div className="text-[11px] text-slate-400 mt-1">Cleared as benign</div>
          </div>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search case, transaction, customer, typology..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
        >
          <option value="All statuses">All statuses ({cases.length})</option>
          <option value="NEW">New ({countNew})</option>
          <option value="INVESTIGATING">Investigating ({countInvestigating})</option>
          <option value="ESCALATED">Escalated ({countEscalated})</option>
          <option value="RESOLVED">Resolved ({countResolved})</option>
          <option value="FALSE_POSITIVE">False Positive ({countFalsePositive})</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
        >
          <option value="All priorities">All priorities</option>
          <option value="P1 • Critical">P1 • Critical</option>
          <option value="P2 • High">P2 • High</option>
          <option value="P3 • Medium">P3 • Medium</option>
          <option value="P4 • Low">P4 • Low</option>
        </select>

        <select
          value={investigatorFilter}
          onChange={e => setInvestigatorFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
        >
          <option value="All investigators">All investigators</option>
          <option value="Unassigned">Unassigned</option>
          {uniqueInvestigators.map(inv => (
            <option key={inv} value={inv}>
              {inv}
            </option>
          ))}
        </select>

        {(statusFilter !== 'All statuses' ||
          priorityFilter !== 'All priorities' ||
          investigatorFilter !== 'All investigators' ||
          searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter('All statuses');
              setPriorityFilter('All priorities');
              setInvestigatorFilter('All investigators');
              setSearchTerm('');
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Cases Data Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4">CASE ID</th>
                <th className="py-3.5 px-4">PRIORITY</th>
                <th className="py-3.5 px-4">RELATED TRANSACTION</th>
                <th className="py-3.5 px-4">CUSTOMER</th>
                <th className="py-3.5 px-4">INVESTIGATOR</th>
                <th className="py-3.5 px-4">CREATED</th>
                <th className="py-3.5 px-4">LAST ACTIVITY</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No investigation cases match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map(row => {
                  const txRiskLevel =
                    row.priority === 'CRITICAL'
                      ? 'Critical'
                      : row.priority === 'HIGH'
                      ? 'High risk'
                      : row.priority === 'MEDIUM'
                      ? 'Medium'
                      : 'Low';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onNavigate(`/investigations/${row.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* CASE ID */}
                      <td className="py-4 px-4 font-mono font-bold text-blue-600 hover:underline">
                        <div className="flex flex-col">
                          <span>{row.id}</span>
                          <span className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[180px]">
                            {row.title}
                          </span>
                        </div>
                      </td>

                      {/* PRIORITY */}
                      <td className="py-4 px-4">
                        {row.priority === 'CRITICAL' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffe4e6] text-[#be123c]">
                            P1 • Critical
                          </span>
                        )}
                        {row.priority === 'HIGH' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffedd5] text-[#c2410c]">
                            P2 • High
                          </span>
                        )}
                        {row.priority === 'MEDIUM' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef9c3] text-[#a16207]">
                            P3 • Medium
                          </span>
                        )}
                        {row.priority === 'LOW' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                            P4 • Low
                          </span>
                        )}
                      </td>

                      {/* RELATED TRANSACTION */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">
                            {row.transactionId || '—'}
                          </span>
                          {txRiskLevel === 'Critical' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ffe4e6] text-[#be123c]">
                              <AlertCircle className="w-3 h-3" />
                              <span>Critical</span>
                            </span>
                          )}
                          {txRiskLevel === 'High risk' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ffedd5] text-[#c2410c]">
                              <TrendingUp className="w-3 h-3" />
                              <span>High risk</span>
                            </span>
                          )}
                          {txRiskLevel === 'Medium' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef9c3] text-[#a16207]">
                              <Minus className="w-3 h-3" />
                              <span>Medium</span>
                            </span>
                          )}
                          {txRiskLevel === 'Low' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                              <Check className="w-3 h-3" />
                              <span>Low risk</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td className="py-4 px-4 text-slate-700">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{row.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{row.customerId}</span>
                        </div>
                      </td>

                      {/* INVESTIGATOR */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {row.assignedTo || 'Unassigned'}
                      </td>

                      {/* CREATED */}
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(row.createdTime)}
                      </td>

                      {/* LAST ACTIVITY */}
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(row.updatedTime)}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-4">
                        {row.status === 'NEW' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                            New
                          </span>
                        )}
                        {row.status === 'INVESTIGATING' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fef9c3] text-[#a16207]">
                            Investigating
                          </span>
                        )}
                        {row.status === 'ESCALATED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ffedd5] text-[#c2410c]">
                            Escalated
                          </span>
                        )}
                        {row.status === 'RESOLVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                            Resolved
                          </span>
                        )}
                        {row.status === 'FALSE_POSITIVE' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">
                            False Positive
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate(`/investigations/${row.id}`)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Open &gt;
                          </button>

                          <button
                            onClick={() => onNavigate(`/trustgraph`)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1 hover:bg-slate-50 shadow-2xs transition-colors"
                          >
                            <Share2 className="w-3 h-3 text-blue-600" />
                            <span>Graph</span>
                          </button>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenuCaseId(activeMenuCaseId === row.id ? null : row.id)
                              }
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1 hover:bg-slate-50 shadow-2xs transition-colors"
                            >
                              <span>Advance...</span>
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>

                            {activeMenuCaseId === row.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs">
                                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                                  Set Status
                                </div>
                                {(
                                  [
                                    'NEW',
                                    'INVESTIGATING',
                                    'ESCALATED',
                                    'RESOLVED',
                                    'FALSE_POSITIVE',
                                  ] as CaseStatus[]
                                ).map(st => (
                                  <button
                                    key={st}
                                    onClick={() => handleAdvanceStatus(row.id, st)}
                                    className={`w-full text-left px-2.5 py-1.5 hover:bg-slate-50 font-medium ${
                                      row.status === st
                                        ? 'text-blue-600 font-bold bg-blue-50/50'
                                        : 'text-slate-700'
                                    }`}
                                  >
                                    {st.replace('_', ' ')}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Investigation */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Open New Investigation Case</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Case Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unexplained Structuring Velocity on High-Risk Wallet"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Customer
                  </label>
                  <select
                    value={newCustomerId}
                    onChange={e => setNewCustomerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    {getDataset().customers.slice(0, 15).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Amount (৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Initial Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CRITICAL', 'HIGH', 'MEDIUM'] as CasePriority[]).map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        newPriority === p
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/20"
                >
                  Create &amp; Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
