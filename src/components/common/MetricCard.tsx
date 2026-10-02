/**
 * Upay Sentinel AI - Metric Card (Premium White Theme)
 * Dense, scannable fintech statistic display with tabular numerals
 * DIU CPC × upay AI Hackathon 2026
 */

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  trend?: string;
  isDanger?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  trend,
  isDanger,
}) => {
  return (
    <div
      className={`p-4 rounded-xl border bg-white ${
        isDanger
          ? 'border-rose-200 shadow-xs'
          : 'border-slate-200/90 shadow-xs'
      } text-xs text-slate-600 transition-all hover:border-slate-300`}
    >
      <div className="flex items-center justify-between text-slate-500 mb-1.5">
        <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
            {badge}
          </span>
        )}
      </div>

      <div className="font-mono text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
        {value}
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
        <span>{subtitle || 'Synthetic Dataset'}</span>
        {trend && (
          <span className={`font-mono font-semibold ${isDanger ? 'text-rose-600' : 'text-emerald-600'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
