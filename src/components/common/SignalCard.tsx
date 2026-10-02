/**
 * Upay Sentinel AI - Signal Card (Premium White Theme)
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { RiskSignal } from '../../types';

interface SignalCardProps {
  signal: RiskSignal;
  onInspect?: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, onInspect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 text-xs text-slate-700 shadow-xs transition-colors hover:border-slate-300">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="font-bold text-slate-900">{signal.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">({signal.category})</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-extrabold text-rose-600 tabular-nums">
            +{signal.score}
          </span>
          <button className="text-slate-400 hover:text-slate-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <p className="mt-1 text-[11px] text-slate-600">{signal.description}</p>

      {/* Expanded Signal Details Drawer */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-[11px] animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Observed Value</span>
              <span className="font-mono font-bold text-slate-900 truncate block mt-0.5">{signal.observedValue}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Baseline Expectation</span>
              <span className="font-mono font-medium text-slate-700 truncate block mt-0.5">{signal.baselineValue}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase mb-1">Underlying Evidence</span>
            <p className="leading-relaxed">{signal.evidence}</p>
          </div>

          {onInspect && (
            <button
              onClick={onInspect}
              className="w-full text-center py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspect in TrustGraph</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
