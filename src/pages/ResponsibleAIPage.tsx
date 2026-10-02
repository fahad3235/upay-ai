/**
 * Upay Sentinel AI - Responsible AI (Premium White Theme)
 * DIU CPC × upay AI Hackathon 2026
 * Matches Section 16: Simple, premium white cards
 */

import React from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Eye,
  AlertCircle,
  Database,
} from 'lucide-react';

export const ResponsibleAIPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-xs text-slate-700">
      {/* Header Banner */}
      <div className="space-y-2 pb-4 border-b border-slate-200/90 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>UPAY SENTINEL AI GOVERNANCE CHARTER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
          Responsible AI, Ethics & Governance
        </h1>
        <p className="text-slate-500 text-xs max-w-2xl">
          Core principles guiding our explainable financial safety intelligence platform for the DIU CPC × upay AI Hackathon 2026.
        </p>
      </div>

      {/* Cards Required by Prompt #16 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SYNTHETIC DATA */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">SYNTHETIC DATA</h3>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            The prototype uses exclusively synthetic data engineered to mirror Bangladeshi mobile financial transaction patterns. Zero real customer financial accounts, phone numbers, or national identification credentials are used.
          </p>
        </div>

        {/* EXPLAINABILITY */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">EXPLAINABILITY</h3>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Every risk score has visible contributing signals (+31 amount anomaly, +18 recipient novelty, +15 device novelty, +12 velocity). We reject black-box opacity in favor of transparent mathematical contributions.
          </p>
        </div>

        {/* HUMAN OVERSIGHT */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">HUMAN OVERSIGHT</h3>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            AI assists investigation; it does not make final consequential decisions. High-impact financial actions (account blocks, cash-out halts, or regulatory escalations) strictly require licensed human analyst sign-off.
          </p>
        </div>

        {/* PRIVACY */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">PRIVACY</h3>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            No real customer financial information is used in the demo. In production, tokenized cryptographic hashes ensure models only evaluate behavioral vectors without ever exposing personal identification records.
          </p>
        </div>

        {/* LIMITATIONS */}
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3 md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">LIMITATIONS</h3>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Prototype results reflect synthetic benchmark corpora and require controlled validation before production use. Generative AI explanations must be verified against primary evidence records prior to formal regulatory filings.
          </p>
        </div>
      </div>
    </div>
  );
};
