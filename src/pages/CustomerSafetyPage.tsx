/**
 * Upay Sentinel AI - Customer Safety Experience (Mobile-First)
 * Calm, accessible, non-technical warning UI for account holders
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Hourglass,
} from 'lucide-react';
import { api } from '../services/api';

interface CustomerSafetyPageProps {
  onNavigate: (path: string) => void;
  incidentId?: string;
}

export const CustomerSafetyPage: React.FC<CustomerSafetyPageProps> = ({
  onNavigate,
  incidentId = 'TX-DEMO-49281',
}) => {
  const [responseState, setResponseState] = useState<'PROMPT' | 'RECOGNIZED' | 'UNRECOGNIZED'>('PROMPT');
  const [actionLoading, setActionLoading] = useState(false);

  const handleRecognize = async () => {
    setActionLoading(true);
    try {
      await api.quarantineRelease(incidentId);
      setResponseState('RECOGNIZED');
    } catch {
      setResponseState('RECOGNIZED');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnrecognized = async () => {
    setActionLoading(true);
    try {
      await api.quarantineFreeze(incidentId, 'Customer selected "I do not recognize this" on mobile safety prompt');
      setResponseState('UNRECOGNIZED');
    } catch {
      setResponseState('UNRECOGNIZED');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-5 text-slate-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to Command Center</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>upay Safety Sentinel</span>
        </div>
      </div>

      {responseState === 'PROMPT' && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Main Attention Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0d131f] border border-amber-500/40 shadow-xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-950/80 border border-amber-600 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/50">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white font-display">
                Your transaction needs attention
              </h2>
              <p className="text-xs text-slate-300">
                We noticed something unusual about this transaction and want to make sure it was really you.
              </p>
            </div>

            {/* Transaction Highlight */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Requested Amount</span>
              <div className="font-mono text-3xl font-black text-white tabular-nums">
                ৳18,500
              </div>
              <div className="text-xs text-slate-300 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>To: <strong className="text-white">WALLET-DEMO-809</strong></span>
                <span className="text-slate-400">19:46 Today</span>
              </div>
            </div>

            {/* Why you're seeing this - Plain Language */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-2 text-xs">
              <span className="font-bold text-slate-200 block text-[11px]">Why we are checking with you:</span>
              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>This is the first time sending funds to this recipient.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>The amount is higher than your customary daily transactions (usually around ৳2,900).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>This request was initiated from an unrecognized phone or tablet.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                disabled={actionLoading}
                onClick={handleRecognize}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-cyan-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionLoading ? 'Verifying...' : 'I RECOGNIZE THIS TRANSACTION'}</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={handleUnrecognized}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-rose-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{actionLoading ? 'Freezing...' : "I DON'T RECOGNIZE THIS (FREEZE)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State: Customer Confirms Recognition */}
      {responseState === 'RECOGNIZED' && (
        <div className="p-6 rounded-2xl bg-[#0d131f] border border-cyan-800 text-center space-y-4 animate-in fade-in-50 duration-200">
          <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Thank you for confirming</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Because this request originated on a newly seen device, please complete your one-time SMS verification code to finalize your transfer safely.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            A 6-digit verification code has been dispatched to your registered SIM ending in <strong className="text-white">•••042</strong>.
          </div>
          <button
            onClick={() => setResponseState('PROMPT')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Back to Warning Screen
          </button>
        </div>
      )}

      {/* State: Customer DOES NOT Recognize Transfer */}
      {responseState === 'UNRECOGNIZED' && (
        <div className="p-6 rounded-2xl bg-[#0d131f] border border-rose-800 text-center space-y-4 animate-in fade-in-50 duration-200">
          <div className="w-14 h-14 rounded-full bg-rose-950 border border-rose-600 text-rose-300 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Your safety is our top priority</h3>
            <p className="text-xs text-rose-300 font-semibold">
              We have temporarily paused this transfer. No funds were debited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2.5 text-xs text-slate-300">
            <span className="font-bold text-white block text-[11px]">Recommended Security Steps:</span>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="font-mono text-cyan-400 font-bold">1.</span>
                <span>Change your upay PIN immediately inside the official app.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-cyan-400 font-bold">2.</span>
                <span>Review all recent active sessions and remove unfamiliar devices.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-cyan-400 font-bold">3.</span>
                <span>Call official 24/7 upay customer support at <strong className="text-cyan-300">16268</strong>.</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
            Case <strong className="text-white">CASE-2026-8941</strong> has been automatically opened with our senior fraud analyst team for immediate verification.
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('/investigations/CASE-2026-8941')}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
            >
              View Analyst Case Dossier →
            </button>
            <button
              onClick={() => setResponseState('PROMPT')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
            >
              Reset Warning Demo
            </button>
          </div>
        </div>
      )}

      {/* Plain Language Reassurance Footer */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400 text-center">
        <span>upay will never ask for your PIN, OTP, or password over the phone or email.</span>
      </div>
    </div>
  );
};
