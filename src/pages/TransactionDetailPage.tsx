/**
 * Upay Sentinel AI - Transaction Detail Page (Most Important Screen)
 * DIU CPC × upay AI Hackathon 2026
 * Matches Section 7 specifications: Risk Panel, Signals, Behavior Comparison, Timeline, Action CTAs
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  CheckCircle2,
  Smartphone,
  CreditCard,
  User,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Lock,
  Unlock,
  Hourglass,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { RadialProgress } from '../components/common/RadialProgress';
import { SignalCard } from '../components/common/SignalCard';
import { AICopilotPanel } from '../components/copilot/AICopilotPanel';
import { Transaction, Customer, InvestigationCase } from '../types';

interface TransactionDetailPageProps {
  transactionId: string;
  onNavigate: (path: string) => void;
}

export const TransactionDetailPage: React.FC<TransactionDetailPageProps> = ({
  transactionId,
  onNavigate,
}) => {
  const [data, setData] = useState<{
    transaction: Transaction;
    customer: Customer;
    relatedCase?: InvestigationCase;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [quarantineActionLoading, setQuarantineActionLoading] = useState(false);
  const [quarantineMsg, setQuarantineMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [transactionId]);

  useEffect(() => {
    if (data?.transaction?.quarantineStatus === 'IN_ESCROW' && data.transaction.escrowExpiresAt) {
      const calculateRemaining = () => {
        const diff = Math.max(0, Math.floor((new Date(data.transaction.escrowExpiresAt!).getTime() - Date.now()) / 1000));
        setSecondsRemaining(diff);
      };
      calculateRemaining();
      const interval = setInterval(calculateRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.transaction]);

  const handleQuarantineFreeze = async () => {
    if (!data?.transaction) return;
    setQuarantineActionLoading(true);
    try {
      const res = await api.quarantineFreeze(data.transaction.id, 'Sender emergency self-service freeze');
      setData({
        ...data,
        transaction: res.transaction,
      });
      setQuarantineMsg('Emergency Freeze Confirmed: Transaction aborted and funds secured.');
    } catch (err: any) {
      setQuarantineMsg(err.message || 'Freeze action failed');
    } finally {
      setQuarantineActionLoading(false);
    }
  };

  const handleQuarantineRelease = async () => {
    if (!data?.transaction) return;
    setQuarantineActionLoading(true);
    try {
      const res = await api.quarantineRelease(data.transaction.id);
      setData({
        ...data,
        transaction: res.transaction,
      });
      setQuarantineMsg('Escrow Released: 2FA clearance validated, recipient account credited.');
    } catch (err: any) {
      setQuarantineMsg(err.message || 'Release action failed');
    } finally {
      setQuarantineActionLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getTransaction(transactionId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data?.transaction) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Loading transaction intelligence dossier...</p>
      </div>
    );
  }

  const { transaction: tx, customer, relatedCase } = data;
  const assessment = tx.riskAssessment;

  return (
    <div className="space-y-6 pb-16 text-xs text-slate-800">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/90">
        <button
          onClick={() => onNavigate('/transactions')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/trustgraph')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-sky-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>VIEW IN TRUSTGRAPH</span>
          </button>

          <button
            onClick={() => {
              if (relatedCase) onNavigate(`/investigations/${relatedCase.id}`);
              else setShowCopilotModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>INVESTIGATE</span>
          </button>
        </div>
      </div>

      {/* 15-MINUTE SOFT QUARANTINE / ESCROW BANNER (Item 2) */}
      {tx.quarantineStatus === 'IN_ESCROW' && (
        <div className="p-5 rounded-2xl border-2 border-amber-400 bg-linear-to-r from-amber-50 via-amber-100/70 to-orange-50 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300 shadow-xs">
                <Hourglass className="w-6 h-6 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                    15-MIN SOFT ESCROW ACTIVE
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-900">
                    Auto-Disbursement In: <strong className="text-sm font-black text-amber-700 tabular-nums">{formatTimer(secondsRemaining)}</strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Temporary Grace Window: Outbound transfer of ৳{tx.amount.toLocaleString()} is held in reversible escrow.
                </h3>
                <p className="text-[11px] text-slate-600 max-w-2xl leading-relaxed">
                  Recipient wallet cannot cash out or forward these funds until the countdown expires or 2FA callback clears. If this was not authorized by the customer, trigger an instant freeze below to recover 100% of funds immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled={quarantineActionLoading}
                onClick={handleQuarantineFreeze}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>INSTANT FREEZE (ABORT)</span>
              </button>
              <button
                disabled={quarantineActionLoading}
                onClick={handleQuarantineRelease}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>RELEASE ESCROW</span>
              </button>
            </div>
          </div>
          {quarantineMsg && (
            <div className="mt-3 p-2.5 rounded-lg bg-white/90 border border-amber-300 text-xs font-semibold text-slate-800">
              {quarantineMsg}
            </div>
          )}
        </div>
      )}

      {tx.quarantineStatus === 'BLOCKED_BY_SENDER' && (
        <div className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50 text-rose-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-200 text-rose-800 flex items-center justify-center">
              <Lock className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-900">Escrow Aborted & Frozen by Sender</span>
              <span className="text-[11px] text-slate-600">Funds remained inside MFS custody. ATO fund extraction prevented before cash-out.</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-600 text-white shadow-xs">FROZEN & PROTECTED</span>
        </div>
      )}

      {tx.quarantineStatus === 'RELEASED' && (
        <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-900">Escrow Clearance Complete</span>
              <span className="text-[11px] text-slate-600">2FA verification satisfied. Transferred ৳{tx.amount.toLocaleString()} to recipient wallet.</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white shadow-xs">CLEARED & SETTLED</span>
        </div>
      )}

      {/* Transaction Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              TRANSACTION DOSSIER
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black font-mono text-slate-900">{tx.id}</h1>
              <RiskBadge level={assessment.riskLevel} score={assessment.riskScore} size="md" />
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 font-semibold">
                {tx.status}
              </span>
            </div>
          </div>

          <div className="md:text-right p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Amount</span>
            <div className="font-mono text-3xl font-black text-slate-900 tabular-nums">
              ৳{tx.amount.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {new Date(tx.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Core Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-[11px]">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">CUSTOMER</span>
            <strong className="text-slate-900 block text-xs mt-0.5">{tx.customerName}</strong>
            <span className="text-slate-500 font-mono text-[10px]">{tx.customerId}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">DEVICE</span>
            <strong className={`block text-xs mt-0.5 font-mono ${tx.isNewDevice ? 'text-amber-700 font-bold' : 'text-slate-900'}`}>
              {tx.deviceId}
            </strong>
            <span className="text-slate-500 text-[10px]">{tx.isNewDevice ? 'Unverified Handset' : 'Verified Handset'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">RECIPIENT</span>
            <strong className="text-slate-900 block text-xs mt-0.5 truncate">{tx.recipientName}</strong>
            <span className="text-slate-500 font-mono text-[10px]">{tx.recipientId}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">CHANNEL</span>
            <strong className="text-slate-900 block text-xs mt-0.5 font-mono">{tx.channel} · {tx.type}</strong>
            <span className="text-slate-500 text-[10px]">{tx.locationCity || 'Dhaka, Bangladesh'}</span>
          </div>
        </div>
      </div>

      {/* LARGE RISK PANEL (Prompt #7 Requirement) */}
      <div className="p-6 rounded-2xl border-2 border-rose-200 bg-rose-50/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <RadialProgress
            value={assessment.riskScore}
            size={84}
            strokeWidth={7}
            variant="risk"
            showValue={true}
            valueSuffix="/100"
            label={assessment.riskLevel}
            pulseOnCritical={true}
            title={`Risk Decision: ${assessment.riskScore}/100 (${assessment.riskLevel})`}
          />

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider font-mono">
              COMPOSITE RISK DECISION
            </span>
            <div className="flex items-baseline gap-3">
              <div className="font-mono text-4xl sm:text-5xl font-black text-rose-600 tracking-tight">
                {assessment.riskScore} <span className="text-2xl text-rose-400 font-normal">/ 100</span>
              </div>
              <span className="px-3 py-1 rounded-lg text-sm font-extrabold bg-rose-600 text-white">
                {assessment.riskLevel} RISK
              </span>
            </div>
            <p className="text-xs text-rose-900 max-w-xl pt-0.5">
              Engine Confidence: <strong className="font-mono font-bold">{assessment.confidence}%</strong> · Recommended Operational Policy: <strong className="font-mono font-bold text-rose-700">{assessment.recommendedAction}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onNavigate('/trustgraph')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-sky-600" />
            <span>VIEW IN TRUSTGRAPH</span>
          </button>
          <button
            onClick={() => {
              if (relatedCase) onNavigate(`/investigations/${relatedCase.id}`);
              else onNavigate('/investigations/CASE-2026-8941');
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>INVESTIGATE CASE</span>
          </button>
        </div>
      </div>

      {/* WHY WAS THIS FLAGGED? & BEHAVIOR COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Signals Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-display">WHY WAS THIS FLAGGED?</h3>
                <p className="text-[11px] text-slate-500">Decomposition of explainable contributing risk factors</p>
              </div>
              <span className="font-mono text-xs font-bold text-rose-600">
                Total Score: {assessment.riskScore}
              </span>
            </div>

            <div className="space-y-2">
              {assessment.signals.map(sig => (
                <SignalCard
                  key={sig.id}
                  signal={sig}
                  onInspect={() => onNavigate('/trustgraph')}
                />
              ))}
            </div>
          </div>

          {/* BEHAVIOR COMPARISON (Prompt #7 Requirement) */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-display">BEHAVIOR COMPARISON</h3>
                <p className="text-[11px] text-slate-500">Observed transfer value measured against historical customer median</p>
              </div>
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-slate-500 text-[10px] font-semibold uppercase block">Current Event</span>
                <span className="font-mono text-xl font-black text-rose-600 tabular-nums">
                  ৳{tx.amount.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 text-[10px] font-semibold uppercase block">Recent Typical</span>
                <span className="font-mono text-xl font-bold text-slate-800 tabular-nums">
                  ৳2,900
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-slate-500 text-[10px] font-semibold uppercase block">Deviation</span>
                <span className="font-mono text-xl font-black text-rose-600">
                  +538%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              Significantly above recent synthetic baseline. Customer Tanvir Rahman has transacted 35 times over the past 340 days without ever moving more than ৳5,800 in a single transfer.
            </p>
          </div>
        </div>

        {/* Right Column: Timeline & Copilot (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* TIMELINE (Prompt #7 Requirement) */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-display">TIMELINE</h3>
                <p className="text-[11px] text-slate-500">Chronological telemetry leading to this flagged event</p>
              </div>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>

            <div className="relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {[
                { time: '19:41', title: 'New device detected', desc: 'Session initialized on unverified Android emulator DEV-DEMO-104.', dot: 'bg-amber-500' },
                { time: '19:44', title: 'New recipient registered', desc: 'Counterparty WALLET-DEMO-809 saved to quick transfers.', dot: 'bg-sky-500' },
                { time: '19:46', title: 'High-value transaction', desc: 'Outbound send money request of ৳18,500 (+538% deviation).', dot: 'bg-rose-600' },
                { time: '19:47', title: 'Rapid follow-up attempted', desc: 'Second transfer of ৳15,000 initiated 93s later (blocked).', dot: 'bg-rose-600' },
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <span className={`absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full ${step.dot} ring-4 ring-white`} />
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-xs">{step.title}</strong>
                      <span className="font-mono text-[11px] text-sky-700 font-bold">{step.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded AI Copilot Preview */}
          <div className="h-[480px]">
            <AICopilotPanel
              transactionId={tx.id}
              caseData={relatedCase}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
