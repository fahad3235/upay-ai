/**
 * Upay Sentinel AI - Risk Badge (Premium White Theme)
 * Enforces multi-modal risk communication (Color + Icon + Label + Score)
 * Never relies on color alone.
 */

import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showScore = true,
}) => {
  const getStyle = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-700',
          icon: AlertOctagon,
          label: 'CRITICAL RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-700',
          icon: AlertTriangle,
          label: 'HIGH RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-800',
          icon: AlertCircle,
          label: 'MEDIUM RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-300',
          text: 'text-slate-700',
          icon: CheckCircle2,
          label: 'LOW RISK',
        };
    }
  };

  const config = getStyle();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-md border ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      <Icon className={`${iconSizes} shrink-0`} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono tabular-nums pl-1 border-l border-current/30">
          {score}
        </span>
      )}
    </span>
  );
};
