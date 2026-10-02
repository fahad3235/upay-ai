/**
 * Upay Sentinel AI - Hackathon Demo Guide & Presentation Script
 * Complete 3 to 5 minute presentation guide for hackathon judges
 * DIU CPC × upay AI Hackathon 2026
 */

import React from 'react';
import {
  Play,
  Share2,
  ShieldAlert,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface DemoGuidePageProps {
  onNavigate: (path: string) => void;
  onTriggerDemoScenario: () => void;
}

export const DemoGuidePage: React.FC<DemoGuidePageProps> = ({
  onNavigate,
  onTriggerDemoScenario,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-xs text-slate-300">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-800 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>OFFICIAL JUDGE PRESENTATION FLOW (3–5 MINUTES)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
          Hackathon Demo Script & Judge Q&A Guide
        </h1>
        <p className="text-slate-400 text-xs max-w-2xl">
          Follow this structured script during technical and business pitch presentations to demonstrate the full power of UPAY SENTINEL AI.
        </p>
      </div>

      {/* 5-Step Demo Script */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white font-display">Step-by-Step Presentation Script</h2>

        {/* Step 1 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyan-400 font-bold text-sm">STEP 1: THE OPENING HOOK (0:00 - 0:45)</span>
            <span className="text-slate-400 font-mono">Landing & Customer Baseline</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-white">Script:</strong> "Judges, one suspicious transaction rarely tells the whole story. If customer Tanvir Rahman suddenly transfers ৳18,500, a traditional rule either blocks it—annoying a good user—or misses it entirely. Let us look at Tanvir's baseline: he habitually transfers small amounts (median ৳2,900) from his personal handset."
          </p>
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => onNavigate('/customers/CUS-DEMO-1042')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
            >
              Open Customer CUS-DEMO-1042 Baseline →
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-xl border border-rose-900/60 bg-[#0d131f] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-rose-400 font-bold text-sm">STEP 2: TRIGGER THE 7-MINUTE INCIDENT (0:45 - 1:45)</span>
            <span className="text-slate-400 font-mono">Account Takeover Sequence</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-white">Script:</strong> "Now, observe the 7-Minute Incident Account Takeover. Notice what Sentinel observes: At 19:41, an unrecognized Android emulator (DEV-DEMO-104) logs in. At 19:44, a new counterparty (WALLET-DEMO-809) is added. At 19:46, an outbound transfer of ৳18,500 is initiated. 93 seconds later, a second transfer of ৳15,000 is attempted. Sentinel's risk engine instantly elevates the composite risk score to 86 HIGH."
          </p>
          <div className="pt-1">
            <button
              onClick={onTriggerDemoScenario}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Execute 7-Minute Incident Now</span>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyan-400 font-bold text-sm">STEP 3: DECOMPOSE THE EVIDENCE (1:45 - 2:30)</span>
            <span className="text-slate-400 font-mono">Transaction Signals Breakdown</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-white">Script:</strong> "Sentinel does not return a black-box 'Fraud=True'. Look at the decomposition: Amount Anomaly contributes +31, Recipient Novelty +18, Device Change +16, Network Clustering +14, and Rapid Velocity +12. Every number is backed by concrete synthetic observations."
          </p>
          <div className="pt-1">
            <button
              onClick={() => onNavigate('/transactions/TX-DEMO-49281')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
            >
              Inspect TX-DEMO-49281 Breakdown →
            </button>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyan-400 font-bold text-sm">STEP 4: UNVEIL THE NETWORK (2:30 - 3:30)</span>
            <span className="text-slate-400 font-mono">TrustGraph Topology</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-white">Script:</strong> "Is there something larger happening? We open TrustGraph. Notice: Recipient WALLET-DEMO-809 is linked via shared hardware node DEV-DEMO-104 directly to cash-out agent AGENT-DEMO-007 in cluster CLUSTER-SMURF-904. This is not an isolated fraud attempt; it is a coordinated mule extraction ring."
          </p>
          <div className="pt-1">
            <button
              onClick={() => onNavigate('/trustgraph')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
            >
              Open TrustGraph Visualizer →
            </button>
          </div>
        </div>

        {/* Step 5 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyan-400 font-bold text-sm">STEP 5: GROUNDED AI & HUMAN ACTION (3:30 - 4:30)</span>
            <span className="text-slate-400 font-mono">AI Copilot & Customer Safety</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-white">Script:</strong> "What should the analyst do next? Gemini 3.8 Flash, strictly grounded in the evidence, synthesizes What Happened, Why It Matters, and the 3 recommended next checks. Simultaneously, the customer receives a calm, non-technical safety notification on their phone. Sentinel empowers human analysts without taking reckless autonomous actions."
          </p>
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => onNavigate('/investigations/CASE-2026-8941')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
            >
              Open AI Copilot Dossier →
            </button>
            <button
              onClick={() => onNavigate('/safety')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
            >
              Open Customer Safety Warning →
            </button>
          </div>
        </div>
      </div>

      {/* Anticipated Judge Q&A */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d131f] space-y-4">
        <h3 className="text-base font-bold text-white font-display">Anticipated Judge Q&A Preparation</h3>
        <div className="space-y-3 text-[11px]">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block">Q1: "Why not let the LLM directly score the fraud probability?"</strong>
            <p className="text-slate-300">
              <strong>Answer:</strong> "LLMs are probabilistic generative models subject to hallucination and latency. In financial risk, decisions must be deterministic, auditable, and reproducible for regulators. Our deterministic feature and graph engines compute the risk score; Gemini’s role is purely to synthesize the structured facts into clear human investigation stories."
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block">Q2: "How does TrustGraph scale to millions of daily transactions?"</strong>
            <p className="text-slate-300">
              <strong>Answer:</strong> "In production, feature engineering is calculated via incremental graph projections and streaming bipartite counters (e.g. Apache Flink / GraphX). We only project 2-hop neighborhoods around flagged event nodes for visualization, keeping the browser payload lightweight and sub-50ms."
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block">Q3: "How do you protect customer privacy under banking regulations?"</strong>
            <p className="text-slate-300">
              <strong>Answer:</strong> "All identifiers are tokenized hashes. The AI model only receives anonymized structured evidence tags (e.g. 'amount_dev_pct: 538'), never raw PII or financial credentials. High-impact operational actions require human verification."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
