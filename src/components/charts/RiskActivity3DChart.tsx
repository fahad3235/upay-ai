/**
 * Upay Sentinel AI - 3D Isometric Risk Activity Chart
 * High-Fidelity 3D Cylindrical / Column Isometric Visualization
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Eye,
  Info,
  Maximize2,
} from 'lucide-react';

export interface TimelineDataPoint {
  time: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
  totalBDT?: number;
}

interface RiskActivity3DChartProps {
  data: TimelineDataPoint[];
  className?: string;
  onSelectHour?: (point: TimelineDataPoint) => void;
}

export const RiskActivity3DChart: React.FC<RiskActivity3DChartProps> = ({
  data,
  className = '',
  onSelectHour,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeTier, setActiveTier] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [viewMode, setViewMode] = useState<'3D_PILLARS' | '3D_RIBBON'>('3D_PILLARS');
  const [perspectiveDepth, setPerspectiveDepth] = useState<number>(25); // degrees tilt

  // Calculate totals and maximums for proportional scaling
  const chartMetrics = useMemo(() => {
    let maxTotal = 0;
    let grandTotalTxs = 0;
    let grandTotalCritical = 0;
    let grandTotalHigh = 0;
    let grandTotalMedium = 0;
    let grandTotalLow = 0;

    data.forEach(d => {
      const sum = d.low + d.medium + d.high + d.critical;
      if (sum > maxTotal) maxTotal = sum;
      grandTotalTxs += sum;
      grandTotalCritical += d.critical;
      grandTotalHigh += d.high;
      grandTotalMedium += d.medium;
      grandTotalLow += d.low;
    });

    return {
      maxTotal: Math.max(maxTotal, 1),
      grandTotalTxs,
      grandTotalCritical,
      grandTotalHigh,
      grandTotalMedium,
      grandTotalLow,
    };
  }, [data]);

  // SVG dimensions for 3D Isometric Projection
  const svgWidth = 720;
  const svgHeight = 240;
  const groundY = 195;
  const maxBarHeight = 135;
  const colWidth = 34;
  const depthX = 14;
  const depthY = 8;

  const numCols = data.length;
  const spacing = (svgWidth - 80) / numCols;

  return (
    <div className={`p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5">
              <span>Risk Activity Chart</span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                3D ISOMETRIC
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Hourly synthetic volume extruded across risk classification tiers with isometric depth rendering.
          </p>
        </div>

        {/* Interactive Tier Filters & 3D Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold">
            <button
              onClick={() => setViewMode('3D_PILLARS')}
              className={`px-2 py-1 rounded-md transition-all ${
                viewMode === '3D_PILLARS' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              3D Pillars
            </button>
            <button
              onClick={() => setViewMode('3D_RIBBON')}
              className={`px-2 py-1 rounded-md transition-all ${
                viewMode === '3D_RIBBON' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              3D Ribbon
            </button>
          </div>

          {/* Interactive Tier Badges */}
          <div className="flex items-center gap-1.5 text-[10.5px]">
            <button
              onClick={() => setActiveTier(activeTier === 'LOW' ? 'ALL' : 'LOW')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold transition-all border ${
                activeTier === 'LOW' || activeTier === 'ALL'
                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                  : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Low</span>
            </button>

            <button
              onClick={() => setActiveTier(activeTier === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold transition-all border ${
                activeTier === 'MEDIUM' || activeTier === 'ALL'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Medium</span>
            </button>

            <button
              onClick={() => setActiveTier(activeTier === 'HIGH' ? 'ALL' : 'HIGH')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold transition-all border ${
                activeTier === 'HIGH' || activeTier === 'ALL'
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>High / Critical</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Visual Stage */}
      <div className="relative w-full h-64 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/90 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center select-none group">
        {/* 3D Perspective Background Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grid3d" width="40" height="24" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 24 M 0 0 L 40 24" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid3d)" />
          </svg>
        </div>

        {/* Floating 3D Tooltip when hovering over a pillar */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div
            className="absolute top-3 z-30 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-white shadow-xl border border-slate-700/60 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-4"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {data[hoveredIdx].time} Surveillance Window
              </div>
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <span>Total: {data[hoveredIdx].low + data[hoveredIdx].medium + data[hoveredIdx].high + data[hoveredIdx].critical} Events</span>
                {data[hoveredIdx].totalBDT && (
                  <span className="text-[10.5px] font-mono text-slate-300">
                    (৳{(data[hoveredIdx].totalBDT! / 1000).toFixed(0)}k BDT)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-700 pl-3 font-mono text-[11px]">
              <span className="text-rose-400 font-bold">
                Crit: {data[hoveredIdx].critical}
              </span>
              <span className="text-orange-400 font-bold">
                High: {data[hoveredIdx].high}
              </span>
              <span className="text-amber-300">
                Med: {data[hoveredIdx].medium}
              </span>
              <span className="text-sky-300">
                Low: {data[hoveredIdx].low}
              </span>
            </div>
          </div>
        )}

        {/* 3D Isometric SVG Canvas */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-64"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* 3D Gradients for Faces */}
            {/* Low Risk (Sky Blue) */}
            <linearGradient id="skyFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="skySide" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <linearGradient id="skyTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>

            {/* Medium Risk (Amber) */}
            <linearGradient id="amberFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="amberSide" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="amberTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>

            {/* High / Critical Risk (Rose & Red) */}
            <linearGradient id="roseFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <linearGradient id="roseSide" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9f1239" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="roseTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fecdd3" />
              <stop offset="100%" stopColor="#fda4af" />
            </linearGradient>

            {/* Critical Cap Glow */}
            <linearGradient id="redFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="redSide" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="redTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            {/* Drop Shadow Filter */}
            <filter id="pillarShadow" x="-20%" y="-10%" width="150%" height="150%">
              <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.14" />
            </filter>
            <filter id="hoverGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 3D Baseline Floor Shadow */}
          <line
            x1="30"
            y1={groundY}
            x2={svgWidth - 30}
            y2={groundY}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Render each 3D Isometric Column */}
          {data.map((point, idx) => {
            const isHovered = hoveredIdx === idx;
            const x = 50 + idx * spacing;
            const yOffset = isHovered ? -8 : 0; // Elevation lift on hover

            // Calculate heights for active tier selection
            const showLow = activeTier === 'ALL' || activeTier === 'LOW';
            const showMed = activeTier === 'ALL' || activeTier === 'MEDIUM';
            const showHigh = activeTier === 'ALL' || activeTier === 'HIGH';

            const lowVal = showLow ? point.low : 0;
            const medVal = showMed ? point.medium : 0;
            const highVal = showHigh ? point.high : 0;
            const critVal = showHigh ? point.critical : 0;

            const total = lowVal + medVal + highVal + critVal;
            const normRatio = maxBarHeight / chartMetrics.maxTotal;

            const hLow = lowVal * normRatio;
            const hMed = medVal * normRatio;
            const hHigh = highVal * normRatio;
            const hCrit = critVal * normRatio;

            // Stacking Y positions
            const yBase = groundY + yOffset;
            const yLow = yBase - hLow;
            const yMed = yLow - hMed;
            const yHigh = yMed - hHigh;
            const yCrit = yHigh - hCrit;
            const topY = yCrit;

            return (
              <g
                key={point.time}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectHour && onSelectHour(point)}
              >
                {/* 3D Base Drop Shadow Oval */}
                <ellipse
                  cx={x + colWidth / 2 + depthX / 2}
                  cy={groundY + 3}
                  rx={isHovered ? colWidth * 0.75 : colWidth * 0.58}
                  ry={isHovered ? 6 : 4}
                  fill="#64748b"
                  fillOpacity={isHovered ? 0.35 : 0.18}
                  className="transition-all duration-200"
                />

                {/* SEGMENT 1: LOW RISK 3D BLOCK */}
                {hLow > 0 && (
                  <g filter={isHovered ? 'url(#hoverGlow)' : 'url(#pillarShadow)'}>
                    {/* Front Face */}
                    <rect
                      x={x}
                      y={yLow}
                      width={colWidth}
                      height={hLow}
                      fill="url(#skyFront)"
                      rx={1}
                    />
                    {/* Right Shaded Face */}
                    <polygon
                      points={`
                        ${x + colWidth},${yLow} 
                        ${x + colWidth + depthX},${yLow - depthY} 
                        ${x + colWidth + depthX},${yBase - depthY} 
                        ${x + colWidth},${yBase}
                      `}
                      fill="url(#skySide)"
                    />
                    {/* Top Face Cap (if top of stack) */}
                    {hMed === 0 && hHigh === 0 && hCrit === 0 && (
                      <polygon
                        points={`
                          ${x},${yLow} 
                          ${x + depthX},${yLow - depthY} 
                          ${x + colWidth + depthX},${yLow - depthY} 
                          ${x + colWidth},${yLow}
                        `}
                        fill="url(#skyTop)"
                      />
                    )}
                  </g>
                )}

                {/* SEGMENT 2: MEDIUM RISK 3D BLOCK */}
                {hMed > 0 && (
                  <g filter={isHovered ? 'url(#hoverGlow)' : 'url(#pillarShadow)'}>
                    {/* Front Face */}
                    <rect
                      x={x}
                      y={yMed}
                      width={colWidth}
                      height={hMed}
                      fill="url(#amberFront)"
                      rx={1}
                    />
                    {/* Right Shaded Face */}
                    <polygon
                      points={`
                        ${x + colWidth},${yMed} 
                        ${x + colWidth + depthX},${yMed - depthY} 
                        ${x + colWidth + depthX},${yLow - depthY} 
                        ${x + colWidth},${yLow}
                      `}
                      fill="url(#amberSide)"
                    />
                    {/* Top Face Cap (if top of stack) */}
                    {hHigh === 0 && hCrit === 0 && (
                      <polygon
                        points={`
                          ${x},${yMed} 
                          ${x + depthX},${yMed - depthY} 
                          ${x + colWidth + depthX},${yMed - depthY} 
                          ${x + colWidth},${yMed}
                        `}
                        fill="url(#amberTop)"
                      />
                    )}
                  </g>
                )}

                {/* SEGMENT 3: HIGH RISK 3D BLOCK */}
                {hHigh > 0 && (
                  <g filter={isHovered ? 'url(#hoverGlow)' : 'url(#pillarShadow)'}>
                    {/* Front Face */}
                    <rect
                      x={x}
                      y={yHigh}
                      width={colWidth}
                      height={hHigh}
                      fill="url(#roseFront)"
                      rx={1}
                    />
                    {/* Right Shaded Face */}
                    <polygon
                      points={`
                        ${x + colWidth},${yHigh} 
                        ${x + colWidth + depthX},${yHigh - depthY} 
                        ${x + colWidth + depthX},${yMed - depthY} 
                        ${x + colWidth},${yMed}
                      `}
                      fill="url(#roseSide)"
                    />
                    {/* Top Face Cap (if top of stack) */}
                    {hCrit === 0 && (
                      <polygon
                        points={`
                          ${x},${yHigh} 
                          ${x + depthX},${yHigh - depthY} 
                          ${x + colWidth + depthX},${yHigh - depthY} 
                          ${x + colWidth},${yHigh}
                        `}
                        fill="url(#roseTop)"
                      />
                    )}
                  </g>
                )}

                {/* SEGMENT 4: CRITICAL RISK 3D CAP */}
                {hCrit > 0 && (
                  <g filter={isHovered ? 'url(#hoverGlow)' : 'url(#pillarShadow)'}>
                    {/* Front Face */}
                    <rect
                      x={x}
                      y={yCrit}
                      width={colWidth}
                      height={hCrit}
                      fill="url(#redFront)"
                      rx={1}
                    />
                    {/* Right Shaded Face */}
                    <polygon
                      points={`
                        ${x + colWidth},${yCrit} 
                        ${x + colWidth + depthX},${yCrit - depthY} 
                        ${x + colWidth + depthX},${yHigh - depthY} 
                        ${x + colWidth},${yHigh}
                      `}
                      fill="url(#redSide)"
                    />
                    {/* Top Face Cap (Specular Highlight) */}
                    <polygon
                      points={`
                        ${x},${yCrit} 
                        ${x + depthX},${yCrit - depthY} 
                        ${x + colWidth + depthX},${yCrit - depthY} 
                        ${x + colWidth},${yCrit}
                      `}
                      fill="url(#redTop)"
                    />
                  </g>
                )}

                {/* Front specular highlight line for realistic glass / metallic depth */}
                <line
                  x1={x + 2}
                  y1={topY}
                  x2={x + 2}
                  y2={yBase}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeOpacity="0.45"
                  strokeLinecap="round"
                />

                {/* Top Badge: Total Count */}
                <text
                  x={x + colWidth / 2}
                  y={topY - 14}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="bold"
                  fill={isHovered ? '#0284c7' : '#64748b'}
                  fontFamily="monospace"
                >
                  {total}
                </text>

                {/* X-Axis Hour Label */}
                <text
                  x={x + colWidth / 2}
                  y={groundY + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#0f172a' : '#64748b'}
                  fontFamily="monospace"
                >
                  {point.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Metrics Row */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Low: <strong>{chartMetrics.grandTotalLow}</strong></span>
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Medium: <strong>{chartMetrics.grandTotalMedium}</strong></span>
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>High/Critical: <strong>{chartMetrics.grandTotalHigh + chartMetrics.grandTotalCritical}</strong></span>
          </span>
        </div>

        <span className="font-mono text-[10px] text-slate-400">
          Click any 3D pillar to drill down into transaction log
        </span>
      </div>
    </div>
  );
};
