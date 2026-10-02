/**
 * Upay Sentinel AI - Landing Page (Premium White Fintech MVP)
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import {
  Share2,
  ShieldCheck,
  ArrowRight,
  Play,
  Activity,
  Layers,
  Sparkles,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { api } from '../services/api';
import { SiteContent } from '../types';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onTriggerDemoScenario: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onTriggerDemoScenario,
}) => {
  const [content, setContent] = useState<SiteContent>({
    siteName: 'UPAY SENTINEL AI',
    tagline: 'Before money moves, understand the risk.',
    heroTitle: 'Before money moves, understand the risk.',
    heroSubtitle: 'Connect transaction behavior, anomaly signals and financial relationships into one explainable investigation view.',
    heroCta: 'Explore Demo',
    demoLabel: 'SYNTHETIC DEMO',
    footerText: 'DIU CPC × upay AI Hackathon 2026',
  });

  useEffect(() => {
    api.getConfig().then(cfg => {
      if (cfg && cfg.content) {
        setContent(cfg.content);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="w-full text-slate-800 space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>DIU CPC × upay AI HACKATHON 2026</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-[11px] text-sky-700">{content.demoLabel || 'SYNTHETIC DEMO'}</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-700 font-mono tracking-wider block">
                {content.siteName}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-display text-balance">
                {content.heroTitle}
              </h1>
            </div>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              {content.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/dashboard')}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all hover:scale-102"
              >
                <span>{content.heroCta || 'Explore Demo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onTriggerDemoScenario}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all hover:scale-102"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Run Simulation</span>
              </button>

              <button
                onClick={() => onNavigate('/trustgraph')}
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                View TrustGraph
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Detect unusual behavior</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span>Understand connected activity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Support human investigation</span>
              </div>
            </div>
          </div>

          {/* Hero Visual: Clean White TrustGraph Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-white border border-slate-200/90 p-5 shadow-lg shadow-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
                  <span className="font-mono text-xs font-bold text-slate-900">INCIDENT: TX-DEMO-49281</span>
                </div>
                <span className="text-[10px] font-mono text-sky-700 font-bold uppercase px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                  SYNTHETIC DEMO
                </span>
              </div>

              {/* Miniature TrustGraph Preview */}
              <div className="relative h-48 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full">
                  <line x1="60" y1="95" x2="150" y2="55" stroke="#e11d48" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="150" y1="55" x2="250" y2="95" stroke="#e11d48" strokeWidth="2.5" />
                  <line x1="250" y1="95" x2="340" y2="95" stroke="#e11d48" strokeWidth="2.5" />

                  {/* Customer Node */}
                  <g transform="translate(60, 95)">
                    <circle r="18" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">CUSTOMER</text>
                  </g>

                  {/* Device Node */}
                  <g transform="translate(150, 55)">
                    <circle r="16" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">DEVICE</text>
                  </g>

                  {/* Transaction Node */}
                  <g transform="translate(250, 95)">
                    <circle r="18" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="bold">TRANSACTION</text>
                  </g>

                  {/* Recipient Node */}
                  <g transform="translate(340, 95)">
                    <circle r="18" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">RECIPIENT</text>
                  </g>
                </svg>

                <div className="absolute top-2 right-2">
                  <RiskBadge level="HIGH" score={86} size="sm" />
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-500 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span>Connection: Customer → Device → Transaction → Recipient</span>
                  <span className="text-rose-600 font-bold">HIGH RISK: 86 / 100</span>
                </div>
              </div>

              {/* Risk Summary Box */}
              <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900">৳18,500 Outbound Flagged</span>
                  <span className="font-mono text-xs font-bold text-rose-700">Confidence: 91%</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-tight">
                  Signals: Amount Anomaly (+31) · Recipient Novelty (+18) · Device Change (+16) · Network Hub (+14)
                </p>
              </div>

              <button
                onClick={() => onNavigate('/transactions/TX-DEMO-49281')}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sky-700 font-bold text-xs transition-colors text-center"
              >
                Inspect Flagged Transaction Details →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Section: 01 DETECT, 02 CONNECT, 03 EXPLAIN */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider font-mono">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Built for responsible AI-assisted financial safety
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <span className="font-mono text-2xl font-black text-sky-600">01</span>
            <h3 className="text-lg font-bold text-slate-900">DETECT</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Identify unusual transaction behavior. Analyzes amount deviations against customer baseline DNA, novel hardware pairings, and rapid burst velocities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <span className="font-mono text-2xl font-black text-sky-600">02</span>
            <h3 className="text-lg font-bold text-slate-900">CONNECT</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Reveal relationships and suspicious patterns. TrustGraph visualizes multi-hop transfer chains, shared emulator handsets, and cash-out aggregation hubs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <span className="font-mono text-2xl font-black text-sky-600">03</span>
            <h3 className="text-lg font-bold text-slate-900">EXPLAIN</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Give analysts evidence and next steps. Grounded AI Copilot answers What Happened, Why It Matters, and produces actionable checklists for human sign-off.
            </p>
          </div>
        </div>
      </section>

      {/* Primary Call to Action */}
      <section className="max-w-6xl mx-auto px-4 text-center py-6 space-y-4">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-100 space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Experience explainable risk intelligence
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Explore the analyst dashboard or launch the signature 60-Second WOW Demo.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all"
            >
              Launch Analyst Dashboard
            </button>
            <button
              onClick={() => onNavigate('/simulation')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Simulation Lab
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
