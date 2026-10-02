/**
 * Upay Sentinel AI - Reusable Radial Progress Component
 * Premium White Fintech Risk Intelligence Gauge
 * DIU CPC × upay AI Hackathon 2026
 */

import React from 'react';
import { RiskLevel } from '../../types';

export interface RadialProgressProps {
  /** Numeric value between 0 and max (typically 0-100) */
  value: number;
  /** Maximum possible value (defaults to 100) */
  max?: number;
  /** Predefined size or custom diameter in pixels */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Thickness of the progress arc in pixels (optional, auto-derived if omitted) */
  strokeWidth?: number;
  /** Color theme mode: 'risk' automatically maps 0-100 to low/medium/high/critical colors */
  variant?: 'risk' | 'sky' | 'emerald' | 'amber' | 'rose' | 'neutral';
  /** Show the numeric value in the center */
  showValue?: boolean;
  /** Unit or suffix displayed next to or below value (e.g. "%" or "/100") */
  valueSuffix?: string;
  /** Optional text label below the score (e.g. "HIGH RISK") */
  label?: string;
  /** Optional secondary subtitle */
  sublabel?: string;
  /** Optional custom CSS classes for the outer wrapper */
  className?: string;
  /** Show pulsing warning beacon when in high/critical tier */
  pulseOnCritical?: boolean;
  /** Display interactive tooltip with exact ratio */
  title?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  strokeWidth,
  variant = 'risk',
  showValue = true,
  valueSuffix,
  label,
  sublabel,
  className = '',
  pulseOnCritical = true,
  title,
}) => {
  // Clamp value between 0 and max
  const clampedValue = Math.min(Math.max(0, Number.isFinite(value) ? value : 0), max);
  const percentage = (clampedValue / max) * 100;

  // Determine diameter and default stroke width based on size prop
  const diameter = typeof size === 'number'
    ? size
    : {
        xs: 36,
        sm: 48,
        md: 72,
        lg: 96,
        xl: 128,
      }[size] || 72;

  const stroke = strokeWidth || (diameter <= 40 ? 3.5 : diameter <= 60 ? 4.5 : diameter <= 90 ? 6 : 8);

  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Derive risk tier from score (standard fintech boundary: <40 Low, 40-69 Med, 70-84 High, >=85 Critical)
  const getRiskTier = (val: number): {
    level: RiskLevel;
    strokeColor: string;
    bgColor: string;
    textColor: string;
    ringColor: string;
    defaultLabel: string;
  } => {
    if (val >= 85) {
      return {
        level: 'CRITICAL',
        strokeColor: '#e11d48', // rose-600
        bgColor: '#ffe4e6', // rose-100
        textColor: 'text-rose-600',
        ringColor: 'rgba(225, 29, 72, 0.15)',
        defaultLabel: 'CRITICAL',
      };
    }
    if (val >= 70) {
      return {
        level: 'HIGH',
        strokeColor: '#ea580c', // orange-600
        bgColor: '#ffedd5', // orange-100
        textColor: 'text-orange-600',
        ringColor: 'rgba(234, 88, 12, 0.15)',
        defaultLabel: 'HIGH RISK',
      };
    }
    if (val >= 40) {
      return {
        level: 'MEDIUM',
        strokeColor: '#d97706', // amber-600
        bgColor: '#fef3c7', // amber-100
        textColor: 'text-amber-600',
        ringColor: 'rgba(217, 119, 6, 0.12)',
        defaultLabel: 'MED RISK',
      };
    }
    return {
      level: 'LOW',
      strokeColor: '#0284c7', // sky-600
      bgColor: '#e0f2fe', // sky-100
      textColor: 'text-sky-700',
      ringColor: 'rgba(2, 132, 199, 0.1)',
      defaultLabel: 'LOW RISK',
    };
  };

  const riskMeta = getRiskTier(clampedValue);

  // Variant color mapping
  const getColor = () => {
    if (variant === 'risk') return riskMeta.strokeColor;
    if (variant === 'emerald') return '#059669';
    if (variant === 'sky') return '#0284c7';
    if (variant === 'amber') return '#d97706';
    if (variant === 'rose') return '#e11d48';
    return '#475569'; // neutral slate
  };

  const currentColor = getColor();
  const isCriticalOrHigh = clampedValue >= 70;
  const displayLabel = label !== undefined ? label : (diameter >= 80 ? riskMeta.defaultLabel : undefined);

  // Center typography size classes
  const getValueTextSize = () => {
    if (diameter <= 40) return 'text-[11px] font-black';
    if (diameter <= 56) return 'text-xs font-black';
    if (diameter <= 80) return 'text-base font-extrabold';
    if (diameter <= 110) return 'text-2xl font-black tracking-tight';
    return 'text-3xl font-black tracking-tight';
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      title={title || `Risk Score: ${Math.round(clampedValue)} / ${max}`}
      className={`relative inline-flex flex-col items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: diameter, height: diameter }}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="transform -rotate-90 origin-center"
      >
        {/* Subtle background glow circle for elevated tiers */}
        {variant === 'risk' && isCriticalOrHigh && (
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke={riskMeta.ringColor}
            strokeWidth={stroke + 6}
            className={pulseOnCritical && clampedValue >= 85 ? 'animate-pulse' : ''}
          />
        )}

        {/* Inactive Background Track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0" // slate-200
          strokeWidth={stroke}
          className="transition-colors"
        />

        {/* Active Progress Bar */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={currentColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
        {showValue && (
          <div className="flex items-baseline justify-center">
            <span
              className={`font-mono tabular-nums leading-none ${getValueTextSize()} ${
                variant === 'risk' ? riskMeta.textColor : 'text-slate-900'
              }`}
            >
              {Math.round(clampedValue)}
            </span>
            {valueSuffix && (
              <span className="text-[9px] font-mono text-slate-400 font-semibold ml-0.5">
                {valueSuffix}
              </span>
            )}
          </div>
        )}

        {displayLabel && (
          <span
            className={`font-bold uppercase tracking-wider block mt-0.5 truncate max-w-[85%] ${
              diameter <= 80 ? 'text-[8px]' : 'text-[9px]'
            } ${variant === 'risk' ? riskMeta.textColor : 'text-slate-500'}`}
          >
            {displayLabel}
          </span>
        )}

        {sublabel && diameter >= 96 && (
          <span className="text-[8px] text-slate-400 font-mono mt-0.5 block truncate max-w-[85%]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
