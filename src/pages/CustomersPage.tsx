/**
 * Upay Sentinel AI - Customers Directory & Behavioral DNA
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  Dna,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { Customer } from '../types';

interface CustomersPageProps {
  onNavigate: (path: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [search, riskFilter]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({
        search: search.trim() || undefined,
        riskLevel: riskFilter || undefined,
      });
      setCustomers(res.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Customer Profiles & Behavioral DNA</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Synthetic customer profiles baselined across transaction volumes, devices, and counterparty familiarity.
          </p>
        </div>

        <div className="text-slate-400 font-mono text-xs">
          Total Synthetic Customers: <strong className="text-white font-bold">{customers.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#0d131f] border border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Customer ID (CUS-1042) or Name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Risk Profiles</option>
          <option value="CRITICAL">Critical Risk</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold text-[11px]">
                <th className="py-2.5 px-3">CUSTOMER ID</th>
                <th className="py-2.5 px-3">FULL NAME</th>
                <th className="py-2.5 px-3">PHONE (MASKED)</th>
                <th className="py-2.5 px-3">RECENT MEDIAN</th>
                <th className="py-2.5 px-3">KNOWN DEVICES</th>
                <th className="py-2.5 px-3">COUNTERPARTIES</th>
                <th className="py-2.5 px-3">RISK TIER</th>
                <th className="py-2.5 px-3">ALERTS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Loading customer profiles...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No customers match the query.
                  </td>
                </tr>
              ) : (
                customers.map(c => {
                  const isHero = c.id === 'CUS-DEMO-1042';
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isHero ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        {c.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-white block">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.kycTier} Verified</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                        {c.phoneMasked}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white tabular-nums">
                        ৳{c.behavioralDNA.recentMedianAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-300">
                          {c.behavioralDNA.knownDevices.length} Hardware ID{c.behavioralDNA.knownDevices.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-300">
                          {c.behavioralDNA.knownRecipients.length} Counterparties
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <RiskBadge level={c.currentRiskLevel} score={c.behavioralDNA.profileRiskScore} size="sm" />
                      </td>
                      <td className="py-2.5 px-3">
                        {c.activeAlertCount > 0 ? (
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-950 text-rose-400 border border-rose-800">
                            {c.activeAlertCount} Alert{c.activeAlertCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigate(`/customers/${c.id}`)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 font-semibold text-[11px] transition-colors"
                        >
                          View DNA
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CustomerDetailPage: React.FC<{ customerId: string; onNavigate: (path: string) => void }> = ({
  customerId,
  onNavigate,
}) => {
  const [data, setData] = useState<{ customer: Customer; recentTransactions: any[]; cases: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomer(customerId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data?.customer) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Loading customer profile & behavioral baseline...</p>
      </div>
    );
  }

  const { customer: c, recentTransactions, cases } = data;

  return (
    <div className="space-y-5 pb-16 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={() => onNavigate('/customers')}
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Back to Customers
        </button>

        <div className="flex items-center gap-2">
          {cases.length > 0 && (
            <button
              onClick={() => onNavigate(`/investigations/${cases[0].id}`)}
              className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-700 text-rose-300 font-bold text-xs"
            >
              Open Active Case ({cases[0].id})
            </button>
          )}
        </div>
      </div>

      {/* Customer Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-display">{c.name}</h1>
            <span className="font-mono text-cyan-400 font-semibold">{c.id}</span>
            <RiskBadge level={c.currentRiskLevel} score={c.behavioralDNA.profileRiskScore} size="sm" />
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Phone: <strong className="text-white font-mono">{c.phoneMasked}</strong></span>
            <span>·</span>
            <span>NID: <strong className="text-white font-mono">{c.nidMasked}</strong></span>
            <span>·</span>
            <span>KYC: <strong className="text-white">{c.kycTier}</strong></span>
            <span>·</span>
            <span>Tenure: <strong className="text-white">{c.behavioralDNA.accountAgeDays} days</strong></span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Volume</span>
          <span className="font-mono text-xl font-bold text-white tabular-nums">
            ৳{c.totalVolumeBDT.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{c.totalTransactions} transactions</span>
        </div>
      </div>

      {/* Behavioral DNA Baseline Card */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 block">Baseline Behavioral Fingerprint:</span>
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">HISTORICAL MEDIAN</span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">
              ৳{c.behavioralDNA.recentMedianAmount.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">STANDARD DEVIATION</span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">
              ±৳{c.behavioralDNA.amountStdDev.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">HABITUAL HOURS</span>
            <span className="font-mono text-lg font-bold text-white">
              {c.behavioralDNA.activeHoursStart}:00 – {c.behavioralDNA.activeHoursEnd}:00
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">PAIRED HARDWARE</span>
            <span className="font-mono text-sm font-bold text-cyan-400 truncate block">
              {c.behavioralDNA.knownDevices.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Ledger */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
        <h4 className="font-bold text-sm text-white">Recent Transactions for {c.name}</h4>
        <div className="space-y-1.5">
          {recentTransactions.map(tx => (
            <div
              key={tx.id}
              onClick={() => onNavigate(`/transactions/${tx.id}`)}
              className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 cursor-pointer flex items-center justify-between transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <RiskBadge level={tx.riskAssessment.riskLevel} score={tx.riskAssessment.riskScore} size="sm" />
                <span className="font-mono font-bold text-cyan-400">{tx.id}</span>
                <span className="text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</span>
                <span className="font-medium text-slate-300">To: {tx.recipientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-white tabular-nums">
                  ৳{tx.amount.toLocaleString()}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
