/**
 * Upay Sentinel AI - How It Works (Premium White Theme)
 * DIU CPC × upay AI Hackathon 2026
 * Matches Section 4: 01 DETECT, 02 CONNECT, 03 EXPLAIN
 */

import React from 'react';
import {
  Share2,
  ShieldCheck,
  Eye,
  Layers,
  ArrowRight,
  Activity,
  Play,
  Dna,
  Cpu,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
  onTriggerDemoScenario: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onNavigate,
  onTriggerDemoScenario,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 text-xs text-slate-700">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200/90 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          <Share2 className="w-4 h-4 text-sky-600" />
          <span>UPAY SENTINEL AI ARCHITECTURE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
          How Upay Sentinel AI Works
        </h1>
        <p className="text-slate-500 text-xs max-w-2xl">
          A three-stage explainable pipeline connecting transaction behavior, anomaly signals, and network relationships.
        </p>
      </div>

      {/* The 3 Core Stages */}
      <div className="space-y-6">
        {/* 01 DETECT */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-3xl font-black text-sky-600">01</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              BEHAVIORAL ENGINE
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-display">DETECT: Identify Unusual Transaction Behavior</h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            Every transaction is evaluated in real time against the customer's synthetic Behavioral DNA baseline. The engine looks for amount spikes (+538% above 90-day median), unverified hardware device logins, novel counterparties, and rapid transaction velocity within 60-minute windows.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-slate-900 block font-mono">Amount Anomaly</strong>
              <span className="text-slate-500">0–30 weighted pts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-slate-900 block font-mono">New Recipient</strong>
              <span className="text-slate-500">0–20 weighted pts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-slate-900 block font-mono">New Device</strong>
              <span className="text-slate-500">0–15 weighted pts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-slate-900 block font-mono">Velocity Spike</strong>
              <span className="text-slate-500">0–15 weighted pts</span>
            </div>
          </div>
        </div>

        {/* 02 CONNECT */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-3xl font-black text-sky-600">02</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              TRUSTGRAPH
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-display">CONNECT: Reveal Relationships & Suspicious Patterns</h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            One transaction rarely tells the whole story. TrustGraph maps relationships across Customer, Device, Wallet, Merchant, and Agent nodes. It identifies whether an unknown recipient links via shared hardware or transfer chains to a flagged cash-out agent (e.g. AGENT-DEMO-007 in CLUSTER-SMURF-904).
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/trustgraph')}
              className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Interactive TrustGraph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 03 EXPLAIN */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-3xl font-black text-sky-600">03</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              AI COPILOT
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-display">EXPLAIN: Give Analysts Evidence & Next Steps</h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            Sentinel passes structured evidence to Gemini 3.8 Flash to synthesize: What Happened, Why It Matters, and What the Analyst Should Verify. If the API is offline, an instant deterministic rule-based explanation activates seamlessly without breaking the user experience.
          </p>
          <div className="pt-2 flex gap-2">
            <button
              onClick={onTriggerDemoScenario}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Account Takeover Scenario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Closing Statement (Prompt #4 Requirement) */}
      <div className="text-center pt-8 border-t border-slate-200">
        <p className="text-sm font-bold text-slate-800 tracking-tight font-display">
          Built for responsible AI-assisted financial safety.
        </p>
        <span className="text-[11px] text-slate-400 mt-1 block">
          Synthetic intelligence demonstrator for DIU CPC × upay AI Hackathon 2026
        </span>
      </div>
    </div>
  );
};
