/**
 * Upay Sentinel AI - Transactions Directory
 * Pixel-perfect implementation matching Image 1 from user specifications
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Columns,
  Bookmark,
  Download,
  ChevronDown,
  ArrowUpDown,
  ArrowDown,
  Check,
  TrendingUp,
  Minus,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';
import { getDataset } from '../data/syntheticDataset';
import { Transaction } from '../types';

interface TransactionsPageProps {
  onNavigate: (path: string) => void;
  initialSearch?: string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onNavigate,
  initialSearch = '',
}) => {
  const [riskTab, setRiskTab] = useState<'All' | 'Low' | 'Medium' | 'High' | 'Critical'>('All');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  // Filter state
  const [riskLevelFilter, setRiskLevelFilter] = useState('All levels');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [minAmount, setMinAmount] = useState('0');
  const [maxAmount, setMaxAmount] = useState('Any');
  const [customerFilter, setCustomerFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');
  const [behavioralFilter, setBehavioralFilter] = useState('Any signal');
  const [investigationFilter, setInvestigationFilter] = useState('Any');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [timeframePreset, setTimeframePreset] = useState<'ALL' | '1D' | '7D' | '30D'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Master synthetic transactions list directly aligned with mock & full dataset
  const allTransactions: Array<{
    id: string;
    customer: string;
    amount: number;
    recipient: string;
    device: string;
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    behavioralSignal: string;
    timestamp: string;
    isoTimestamp: string;
    status: string;
  }> = useMemo(() => {
    const featured = [
      {
        id: 'TX-DEMO-ATO',
        customer: 'Tanvir Rahman',
        amount: 18500,
        recipient: 'WALLET-DEMO-809',
        device: 'Realme 11 Pro (demo)',
        riskScore: 86,
        riskLevel: 'High' as const,
        behavioralSignal: 'Velocity & Device Anomaly',
        timestamp: '02 Oct 2026, 19:46',
        isoTimestamp: '2026-10-02T19:46:12Z',
        status: 'Flagged',
      },
      {
        id: 'TX-DEMO-290',
        customer: 'Tanvir Rahman',
        amount: 15000,
        recipient: 'WALLET-DEMO-809',
        device: 'Redmi Note 12 (Emulated)',
        riskScore: 92,
        riskLevel: 'Critical' as const,
        behavioralSignal: 'Rooted Emulator Signature',
        timestamp: '02 Oct 2026, 19:47',
        isoTimestamp: '2026-10-02T19:47:45Z',
        status: 'Completed',
      },
      {
        id: 'TX-DEMO-283',
        customer: 'Mehedi Hasan',
        amount: 24500,
        recipient: 'WALLET-DEMO-810',
        device: 'Galaxy S23 (demo)',
        riskScore: 78,
        riskLevel: 'High' as const,
        behavioralSignal: 'Structuring Threshold Ring',
        timestamp: '02 Oct 2026, 14:22',
        isoTimestamp: '2026-10-02T14:22:00Z',
        status: 'Completed',
      },
      {
        id: 'TX-DEMO-238',
        customer: 'Karim Sarkar',
        amount: 27675,
        recipient: 'Nargis Akter',
        device: 'Redmi Note 13 (demo)',
        riskScore: 58,
        riskLevel: 'Medium' as const,
        behavioralSignal: 'Unusual Volume Deviation',
        timestamp: '02 Oct 2026, 13:47',
        isoTimestamp: '2026-10-02T13:47:00Z',
        status: 'Completed',
      },
      {
        id: 'TX-DEMO-006',
        customer: 'Kamal Khan',
        amount: 48000,
        recipient: 'WALLET-DEMO-812',
        device: 'Galaxy A15 (demo)',
        riskScore: 89,
        riskLevel: 'Critical' as const,
        behavioralSignal: 'Cross-Border Layering Burst',
        timestamp: '02 Oct 2026, 08:14',
        isoTimestamp: '2026-10-02T08:14:30Z',
        status: 'Flagged',
      },
      {
        id: 'TX-DEMO-096',
        customer: 'Tahmina Mahmud',
        amount: 24900,
        recipient: 'AGENT-DEMO-007',
        device: 'Realme C67 (demo)',
        riskScore: 91,
        riskLevel: 'Critical' as const,
        behavioralSignal: 'Agent Collusion Evasion',
        timestamp: '02 Oct 2026, 05:04',
        isoTimestamp: '2026-10-02T05:04:12Z',
        status: 'Blocked',
      },
      {
        id: 'TX-DEMO-243',
        customer: 'Ferdous Molla',
        amount: 29400,
        recipient: 'Multiple Recipients',
        device: 'Galaxy M34 (demo)',
        riskScore: 68,
        riskLevel: 'Medium' as const,
        behavioralSignal: 'Micro-Structuring Evasion',
        timestamp: '02 Oct 2026, 03:55',
        isoTimestamp: '2026-10-02T03:55:00Z',
        status: 'Completed',
      },
      {
        id: 'TX-DEMO-063',
        customer: 'Liton Begum',
        amount: 9500,
        recipient: 'Naim Islam',
        device: 'Oppo A58 (demo)',
        riskScore: 74,
        riskLevel: 'High' as const,
        behavioralSignal: 'Dormant Account Burst',
        timestamp: '02 Oct 2026, 06:28',
        isoTimestamp: '2026-10-02T06:28:45Z',
        status: 'Completed',
      },
      {
        id: 'TX-DEMO-251',
        customer: 'Shahnaz Khan',
        amount: 15000,
        recipient: 'Square Hospital (MERCHANT)',
        device: 'Realme 11 Pro (demo)',
        riskScore: 42,
        riskLevel: 'Medium' as const,
        behavioralSignal: 'New Device Nominal',
        timestamp: '01 Oct 2026, 13:40',
        isoTimestamp: '2026-10-01T13:40:00Z',
        status: 'Completed',
      },
      {
        id: 'TX-DEMO-225',
        customer: 'Laila Mia',
        amount: 35000,
        recipient: 'Multiple Staff Wallets',
        device: 'Galaxy M34 (demo)',
        riskScore: 28,
        riskLevel: 'Low' as const,
        behavioralSignal: 'Merchant Payroll Nominal',
        timestamp: '01 Oct 2026, 16:00',
        isoTimestamp: '2026-10-01T16:00:00Z',
        status: 'Completed',
      },
      {
        id: 'TX-DEMO-099',
        customer: 'Rasheda Mia',
        amount: 16800,
        recipient: 'Karim Uddin',
        device: 'Tecno Spark 20 (demo)',
        riskScore: 82,
        riskLevel: 'High' as const,
        behavioralSignal: 'SIM Swap & Credential Delta',
        timestamp: '02 Oct 2026, 09:01',
        isoTimestamp: '2026-10-02T09:01:40Z',
        status: 'Flagged',
      },
    ];

    const dataset = getDataset();
    const datasetTxs = dataset.transactions.map(t => {
      const levelMap: Record<string, 'Low' | 'Medium' | 'High' | 'Critical'> = {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        CRITICAL: 'Critical',
      };
      let formattedDate = '02 Oct 2026, 12:00';
      try {
        const d = new Date(t.timestamp);
        formattedDate =
          d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' +
          d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      } catch {}

      return {
        id: t.id,
        customer: t.customerName,
        amount: t.amount,
        recipient: t.recipientName || t.recipientId || '—',
        device: t.deviceModel ? `${t.deviceModel} (demo)` : `${t.deviceId} (demo)`,
        riskScore: t.riskAssessment?.riskScore || 20,
        riskLevel: levelMap[t.riskAssessment?.riskLevel] || 'Low',
        behavioralSignal: t.riskAssessment?.primarySignal || '—',
        timestamp: formattedDate,
        isoTimestamp: t.timestamp,
        status: t.status === 'FLAGGED' ? 'Flagged' : t.status === 'BLOCKED' ? 'Blocked' : 'Completed',
      };
    });

    const seen = new Set(featured.map(f => f.id));
    const merged = [...featured];
    datasetTxs.forEach(t => {
      if (!seen.has(t.id)) {
        merged.push(t);
        seen.add(t.id);
      }
    });
    return merged;
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(item => {
      // Risk tab filter
      if (riskTab !== 'All' && item.riskLevel !== riskTab) return false;

      // Risk level dropdown
      if (riskLevelFilter !== 'All levels' && item.riskLevel.toLowerCase() !== riskLevelFilter.toLowerCase()) {
        return false;
      }

      // Timeframe Preset Filter
      if (timeframePreset !== 'ALL' && item.isoTimestamp) {
        const itemTs = new Date(item.isoTimestamp).getTime();
        const refTime = new Date('2026-10-02T19:30:00Z').getTime();
        if (timeframePreset === '1D') {
          if (itemTs < refTime - 24 * 3600 * 1000) return false;
        } else if (timeframePreset === '7D') {
          if (itemTs < refTime - 7 * 24 * 3600 * 1000) return false;
        } else if (timeframePreset === '30D') {
          if (itemTs < refTime - 30 * 24 * 3600 * 1000) return false;
        }
      }

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.customer.toLowerCase().includes(q) ||
          item.recipient.toLowerCase().includes(q) ||
          item.device.toLowerCase().includes(q) ||
          item.behavioralSignal.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Customer filter
      if (customerFilter && !item.customer.toLowerCase().includes(customerFilter.toLowerCase())) {
        return false;
      }

      // Device filter
      if (deviceFilter && !item.device.toLowerCase().includes(deviceFilter.toLowerCase())) {
        return false;
      }

      // Recipient filter
      if (recipientFilter && !item.recipient.toLowerCase().includes(recipientFilter.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All statuses' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Min/Max amount
      if (minAmount && !isNaN(Number(minAmount)) && Number(minAmount) > 0 && item.amount < Number(minAmount)) {
        return false;
      }
      if (maxAmount && maxAmount !== 'Any' && !isNaN(Number(maxAmount)) && item.amount > Number(maxAmount)) {
        return false;
      }

      // Behavioral anomaly signal
      if (behavioralFilter !== 'Any signal' && !item.behavioralSignal.toLowerCase().includes(behavioralFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [
    allTransactions,
    riskTab,
    riskLevelFilter,
    timeframePreset,
    searchTerm,
    customerFilter,
    deviceFilter,
    recipientFilter,
    statusFilter,
    minAmount,
    maxAmount,
    behavioralFilter,
  ]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Amount (BDT)', 'Recipient', 'Device', 'Risk Score', 'Risk Level', 'Timestamp', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.customer,
      t.amount,
      t.recipient,
      t.device,
      t.riskScore,
      t.riskLevel,
      t.timestamp,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `upay_sentinel_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-16 font-sans select-none text-slate-800">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transactions
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-semibold tracking-wider font-mono">
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              <span>SYNTHETIC DEMO</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Explore every monitored transaction. All records are synthetic demo data.
          </p>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 hover:bg-slate-50 shadow-2xs transition-colors">
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Saved views</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 space-y-4">
        {/* RISK Filter Tabs */}
        <div className="flex items-center gap-2 pt-1 pb-2">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono mr-1">
            RISK
          </span>
          {(['All', 'Low', 'Medium', 'High', 'Critical'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setRiskTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                riskTab === tab
                  ? 'bg-blue-100 text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Controls Row 1 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search ID, customer, recipient..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                placeholder="mm / dd / yyyy"
                className="w-32 px-3 py-2 pr-8 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <span className="text-xs text-slate-400">to</span>

            <div className="relative">
              <input
                type="text"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                placeholder="mm / dd / yyyy"
                className="w-32 px-3 py-2 pr-8 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors">
              Apply
            </button>
          </div>

          {/* Quick Timeframe Preset Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {(['ALL', '1D', '7D', '30D'] as const).map(preset => (
              <button
                key={preset}
                onClick={() => {
                  setTimeframePreset(preset);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframePreset === preset
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset === 'ALL' ? 'All time' : preset === '1D' ? '24h / 1D' : preset}
              </button>
            ))}
          </div>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>

          {/* Columns Button */}
          <button className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
            <Columns className="w-3.5 h-3.5 text-slate-500" />
            <span>Columns</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Total Transactions Counter */}
          <span className="text-xs font-semibold text-slate-500 font-mono ml-auto">
            {filteredTransactions.length} transactions
          </span>
        </div>

        {/* Filter Controls Row 2 (Collapsible Fields Bar) */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 pt-3 pb-1 border-t border-slate-100 text-xs">
            {/* Risk level */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Risk level</label>
              <select
                value={riskLevelFilter}
                onChange={e => setRiskLevelFilter(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option>All levels</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option>All statuses</option>
                <option>Completed</option>
                <option>Flagged</option>
                <option>Blocked</option>
              </select>
            </div>

            {/* Min amount (৳) */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Min amount (৳)</label>
              <input
                type="number"
                value={minAmount}
                onChange={e => setMinAmount(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Max amount (৳) */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Max amount (৳)</label>
              <input
                type="text"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Customer */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Customer</label>
              <input
                type="text"
                value={customerFilter}
                onChange={e => setCustomerFilter(e.target.value)}
                placeholder="Name..."
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Device */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Device</label>
              <input
                type="text"
                value={deviceFilter}
                onChange={e => setDeviceFilter(e.target.value)}
                placeholder="Device..."
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Recipient */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Recipient</label>
              <input
                type="text"
                value={recipientFilter}
                onChange={e => setRecipientFilter(e.target.value)}
                placeholder="Recipient..."
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Behavioral anomaly */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Behavioral anomaly</label>
              <select
                value={behavioralFilter}
                onChange={e => setBehavioralFilter(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option>Any signal</option>
                <option>Amount Spike</option>
                <option>Device Change</option>
                <option>Rapid Velocity</option>
              </select>
            </div>

            {/* Investigation */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500">Investigation</label>
              <select
                value={investigationFilter}
                onChange={e => setInvestigationFilter(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option>Any</option>
                <option>Open Case</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredTransactions.length}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                  />
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600">
                    <span>Transaction ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600">
                    <span>Customer</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">RECIPIENT</th>
                <th className="py-3 px-3">DEVICE</th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">RISK LEVEL</th>
                <th className="py-3 px-3">BEHAVIORAL SIGNAL</th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600">
                    <span>Timestamp</span>
                    <ArrowDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map(row => {
                  const isSelected = selectedIds.has(row.id);

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onNavigate(`/transactions/${row.id}`)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3" onClick={e => handleToggleSelect(row.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                        />
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-blue-600 hover:underline">
                        {row.id}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">{row.customer}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                        ৳{row.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{row.recipient}</td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{row.device}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 w-28">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${row.riskScore}%` }}
                              className={`h-full rounded-full ${
                                row.riskScore > 80
                                  ? 'bg-[#92400e]'
                                  : row.riskScore >= 50
                                  ? 'bg-[#b45309]'
                                  : row.riskScore >= 30
                                  ? 'bg-[#0f766e]'
                                  : 'bg-[#10b981]'
                              }`}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-800 font-mono text-[11px] w-5 text-right">
                            {row.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {row.riskLevel === 'High' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffedd5] text-[#c2410c]">
                            <TrendingUp className="w-3 h-3" />
                            <span>High risk</span>
                          </span>
                        )}
                        {row.riskLevel === 'Low' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#dcfce7] text-[#15803d]">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Low</span>
                          </span>
                        )}
                        {row.riskLevel === 'Medium' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef9c3] text-[#a16207]">
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                            <span>Medium</span>
                          </span>
                        )}
                        {row.riskLevel === 'Critical' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffe4e6] text-[#be123c]">
                            <AlertCircle className="w-3 h-3" />
                            <span>Critical</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {row.behavioralSignal}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {row.timestamp}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800 font-mono">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-800 font-mono">
                {Math.min(currentPage * pageSize, filteredTransactions.length)}
              </span>{' '}
              of <span className="font-bold text-slate-800 font-mono">{filteredTransactions.length}</span> transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-medium text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
