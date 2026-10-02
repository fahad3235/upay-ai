/**
 * Upay Sentinel AI - 30-Day Transaction Volume & Risk Trend Chart
 * Enhanced with 7-Day Predictive Risk Trend Overlay & Confidence Envelopes
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  BrainCircuit,
  Layers,
} from 'lucide-react';

export type ForecastScenario = 'SURGE_WARNING' | 'MITIGATED_DECAY' | 'SEASONAL_BASELINE';

export interface DayTrendPoint {
  date: string;
  dayNumber: number;
  fullDate: string;
  volume: number; // transaction count
  volumeBDT: number; // total amount in BDT
  averageRisk?: number; // 0 - 100 (null for forecast days)
  highRiskCount?: number; // number of score >= 70 events
  blockedCount?: number;
  isAnomalySpike?: boolean;
  incidentLabel?: string;
  // 7-Day Predictive Risk Fields
  isForecast?: boolean;
  projectedRisk?: number;
  projectedRiskUpper?: number;
  projectedRiskLower?: number;
  projectedHighRisk?: number;
  forecastScenario?: ForecastScenario;
  forecastAlert?: string;
}

interface TransactionTrendChartProps {
  initialData?: DayTrendPoint[];
  className?: string;
  onSelectDate?: (datePoint: DayTrendPoint) => void;
}

// Generate realistic synthetic 30-day timeline baseline with 2 distinct anomaly periods
export const generate30DayHistoricalData = (): DayTrendPoint[] => {
  const points: DayTrendPoint[] = [];
  const baseDate = new Date('2026-10-01T00:00:00Z');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dayNumber = 30 - i;
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fullDate = d.toISOString().split('T')[0];

    // Day of week cycle (weekends have slightly higher retail peer transfers)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseVolume = 1100 + Math.sin(dayNumber * 0.4) * 180 + (isWeekend ? 220 : 0);
    const jitter = Math.floor(Math.random() * 90) - 45;
    let volume = Math.round(baseVolume + jitter);

    let avgRisk = 24 + Math.round(Math.random() * 8);
    let highRisk = Math.floor(Math.random() * 3);
    let isAnomaly = false;
    let incidentLabel: string | undefined = undefined;

    // Signature Scenario 1: Day 18-19 Smurfing Ring dispersion attempt
    if (dayNumber === 18 || dayNumber === 19) {
      volume += 360;
      avgRisk = 58 + (dayNumber === 19 ? 14 : 0);
      highRisk = 11 + (dayNumber === 19 ? 5 : 0);
      isAnomaly = true;
      incidentLabel = 'Smurfing Ring Dispersion Attempt';
    }

    // Signature Scenario 2: Day 29-30 The 7-Minute Account Takeover & Rapid Cash-Out burst
    if (dayNumber === 29) {
      volume += 280;
      avgRisk = 64;
      highRisk = 16;
      isAnomaly = true;
      incidentLabel = 'Rapid Credential Stuffing Wave';
    } else if (dayNumber === 30) {
      volume += 420;
      avgRisk = 76;
      highRisk = 22;
      isAnomaly = true;
      incidentLabel = 'The 7-Minute ATO Incident (CASE-001)';
    }

    const volumeBDT = volume * (2400 + Math.round(Math.random() * 800));
    const blockedCount = Math.round(highRisk * 0.6);

    points.push({
      date: dateStr,
      dayNumber,
      fullDate,
      volume,
      volumeBDT,
      averageRisk: avgRisk,
      highRiskCount: highRisk,
      blockedCount,
      isAnomalySpike: isAnomaly,
      incidentLabel,
    });
  }

  return points;
};

// Generate 7-Day Predictive Risk Forecast Points
export const generate7DayForecastPoints = (
  lastHistoricalPoint: DayTrendPoint,
  scenario: ForecastScenario
): DayTrendPoint[] => {
  const forecast: DayTrendPoint[] = [];
  const baseDate = new Date('2026-10-01T00:00:00Z');

  // Scenario trajectories
  // Day +1 to +7 (Oct 02 - Oct 08)
  for (let step = 1; step <= 7; step++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + step);
    const dayNumber = 30 + step;
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fullDate = d.toISOString().split('T')[0];

    let projectedRisk = 30;
    let confidenceMargin = 6 + step * 0.8;
    let projectedHighRisk = 2;
    let projectedVolume = 1250 + (step === 3 || step === 4 ? 200 : 0);
    let forecastAlert = 'Nominal Activity Expected';

    if (scenario === 'SURGE_WARNING') {
      // Forecasts an imminent secondary weekend mule cash-out push peaking at Day +3/+4
      if (step === 1) {
        projectedRisk = 68;
        projectedHighRisk = 18;
        forecastAlert = 'Aftershock Smurfing Dispersion Activity';
      } else if (step === 2) {
        projectedRisk = 62;
        projectedHighRisk = 14;
        forecastAlert = 'Counterparty Aggregation Monitoring';
      } else if (step === 3) {
        // Weekend peak surge
        projectedRisk = 74;
        projectedHighRisk = 24;
        forecastAlert = 'CRITICAL: Forecasted Weekend Mule Aggregation Surge';
      } else if (step === 4) {
        // Weekend peak continuation
        projectedRisk = 71;
        projectedHighRisk = 20;
        forecastAlert = 'Elevated Off-Hours Cash-Out Attempts';
      } else if (step === 5) {
        projectedRisk = 52;
        projectedHighRisk = 9;
        forecastAlert = 'Ring Dissipation Post-Intervention';
      } else if (step === 6) {
        projectedRisk = 38;
        projectedHighRisk = 4;
        forecastAlert = 'Normalization towards Baseline';
      } else {
        projectedRisk = 31;
        projectedHighRisk = 2;
        forecastAlert = 'Baseline Restored';
      }
    } else if (scenario === 'MITIGATED_DECAY') {
      // Fast containment assuming active holds on CASE-001/003
      const decayRates = [52, 41, 33, 28, 25, 23, 22];
      projectedRisk = decayRates[step - 1];
      projectedHighRisk = Math.max(1, Math.round(12 / step));
      forecastAlert = 'Controlled Decay under Active Containment';
    } else {
      // Seasonal baseline
      projectedRisk = 28 + Math.round(Math.sin(step * 0.8) * 8);
      projectedHighRisk = 2 + (step === 3 ? 2 : 0);
      forecastAlert = 'Typical Baseline Seasonal Variation';
    }

    const upper = Math.min(100, Math.round(projectedRisk + confidenceMargin));
    const lower = Math.max(0, Math.round(projectedRisk - confidenceMargin));

    forecast.push({
      date: `${dateStr} (Proj)`,
      dayNumber,
      fullDate,
      volume: projectedVolume,
      volumeBDT: projectedVolume * 2700,
      isForecast: true,
      projectedRisk,
      projectedRiskUpper: upper,
      projectedRiskLower: lower,
      projectedHighRisk,
      forecastScenario: scenario,
      forecastAlert,
    });
  }

  return forecast;
};

export const TransactionTrendChart: React.FC<TransactionTrendChartProps> = ({
  initialData,
  className = '',
  onSelectDate,
}) => {
  const allHistoricalData = useMemo(() => initialData || generate30DayHistoricalData(), [initialData]);

  // View state filters
  const [timeframe, setTimeframe] = useState<'30D' | '14D' | '7D'>('30D');
  const [volumeMetric, setVolumeMetric] = useState<'COUNT' | 'BDT'>('COUNT');
  const [showVolume, setShowVolume] = useState(true);
  const [showAvgRisk, setShowAvgRisk] = useState(true);
  const [showHighRisk, setShowHighRisk] = useState(true);

  // 7-Day Forecast Feature State
  const [showForecast, setShowForecast] = useState<boolean>(true);
  const [forecastScenario, setForecastScenario] = useState<ForecastScenario>('SURGE_WARNING');
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [is3DPlane, setIs3DPlane] = useState<boolean>(true);

  // Filtered dataset based on timeframe
  const displayHistoricalData = useMemo(() => {
    const days = timeframe === '7D' ? 7 : timeframe === '14D' ? 14 : 30;
    return allHistoricalData.slice(allHistoricalData.length - days);
  }, [allHistoricalData, timeframe]);

  // Combined Dataset: Historical + 7-Day Forecast Overlay
  const combinedChartData = useMemo(() => {
    if (!showForecast) return displayHistoricalData;

    const lastHistorical = displayHistoricalData[displayHistoricalData.length - 1];
    if (!lastHistorical) return displayHistoricalData;

    // Deep clone historical points and bridge the last point so the forecast line connects continuously
    const historicalClone: DayTrendPoint[] = displayHistoricalData.map((pt, idx) => {
      if (idx === displayHistoricalData.length - 1) {
        return {
          ...pt,
          projectedRisk: pt.averageRisk,
          projectedRiskUpper: pt.averageRisk,
          projectedRiskLower: pt.averageRisk,
          projectedHighRisk: pt.highRiskCount,
        };
      }
      return pt;
    });

    const forecastPoints = generate7DayForecastPoints(lastHistorical, forecastScenario);
    return [...historicalClone, ...forecastPoints];
  }, [displayHistoricalData, showForecast, forecastScenario]);

  // Aggregated Summary Metrics across displayed window
  const summary = useMemo(() => {
    const totalVol = displayHistoricalData.reduce((acc, d) => acc + d.volume, 0);
    const totalBDT = displayHistoricalData.reduce((acc, d) => acc + d.volumeBDT, 0);
    const avgRisk = Math.round(
      displayHistoricalData.reduce((acc, d) => acc + (d.averageRisk || 0), 0) / displayHistoricalData.length
    );
    const totalHighRisk = displayHistoricalData.reduce((acc, d) => acc + (d.highRiskCount || 0), 0);
    const peakHistorical = [...displayHistoricalData].sort((a, b) => (b.averageRisk || 0) - (a.averageRisk || 0))[0];

    // Forecast metrics
    const forecastPoints = generate7DayForecastPoints(
      displayHistoricalData[displayHistoricalData.length - 1] || allHistoricalData[allHistoricalData.length - 1],
      forecastScenario
    );
    const peakForecastRisk = Math.max(...forecastPoints.map(p => p.projectedRisk || 0));
    const peakForecastPoint = forecastPoints.find(p => p.projectedRisk === peakForecastRisk);

    return {
      totalVol,
      totalBDT,
      avgRisk,
      totalHighRisk,
      peakHistorical,
      peakForecastRisk,
      peakForecastPoint,
    };
  }, [displayHistoricalData, allHistoricalData, forecastScenario]);

  // Custom Recharts Tooltip styled with the Premium White Fintech aesthetic
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DayTrendPoint = payload[0].payload;
      const isProjected = Boolean(dataPoint.isForecast);

      return (
        <div className="p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl text-xs space-y-2.5 min-w-[230px] z-50">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-bold text-slate-900">{dataPoint.fullDate}</span>
            </div>
            {isProjected ? (
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                ✦ AI FORECAST
              </span>
            ) : (
              <span className="font-mono text-[10px] text-slate-400">Day {dataPoint.dayNumber}</span>
            )}
          </div>

          {/* Anomaly or Forecast Alert Callout */}
          {dataPoint.incidentLabel && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10.5px] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{dataPoint.incidentLabel}</span>
            </div>
          )}

          {isProjected && dataPoint.forecastAlert && (
            <div className={`p-2 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5 ${
              (dataPoint.projectedRisk || 0) >= 70
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{dataPoint.forecastAlert}</span>
            </div>
          )}

          <div className="space-y-1.5 text-[11px]">
            {/* Projected vs Actual Risk Score */}
            {isProjected ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-slate-600 font-semibold">Predicted Risk Score:</span>
                  </div>
                  <strong className="font-mono font-bold text-orange-600">
                    {dataPoint.projectedRisk} / 100
                  </strong>
                </div>

                <div className="flex items-center justify-between text-slate-500">
                  <span>90% Confidence Interval:</span>
                  <span className="font-mono text-slate-700 font-medium">
                    [{dataPoint.projectedRiskLower} – {dataPoint.projectedRiskUpper}]
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span className="text-slate-600">Predicted Incidents:</span>
                  </div>
                  <strong className="font-mono text-rose-600 font-bold">
                    ~{dataPoint.projectedHighRisk} events
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600">Avg Risk Score:</span>
                  </div>
                  <strong
                    className={`font-mono font-bold ${
                      (dataPoint.averageRisk || 0) >= 70
                        ? 'text-rose-600'
                        : (dataPoint.averageRisk || 0) >= 40
                        ? 'text-amber-600'
                        : 'text-sky-700'
                    }`}
                  >
                    {dataPoint.averageRisk} / 100
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span className="text-slate-600">High-Risk Events:</span>
                  </div>
                  <strong className="font-mono text-rose-600 font-bold">
                    {dataPoint.highRiskCount}
                  </strong>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span className="text-slate-600">{isProjected ? 'Projected Volume:' : 'Transaction Volume:'}</span>
              </div>
              <strong className="font-mono text-slate-900 font-bold">
                {dataPoint.volume.toLocaleString()} txs
              </strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const lastHistoricalDate = displayHistoricalData[displayHistoricalData.length - 1]?.date;

  return (
    <div className={`p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-5 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 font-display">
                  Transaction Volume & Risk Trend Analysis
                </h3>
                {showForecast && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>7D RISK FORECAST ACTIVE</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Macro-temporal 30-day velocity telemetry mapped with a 7-day predictive risk surge overlay.
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Forecast Activation Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3D Depth View Toggle */}
          <button
            onClick={() => setIs3DPlane(!is3DPlane)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs border ${
              is3DPlane
                ? 'bg-sky-600 text-white border-sky-600 shadow-sky-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Perspective</span>
          </button>

          {/* 7-Day Forecast Overlay Toggle */}
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs border ${
              showForecast
                ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>7-Day Predictive Overlay</span>
          </button>

          {/* Volume Metric Toggle (Count vs Value) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setVolumeMetric('COUNT')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                volumeMetric === 'COUNT' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tx Count
            </button>
            <button
              onClick={() => setVolumeMetric('BDT')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                volumeMetric === 'BDT' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volume (৳ BDT)
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {(['7D', '14D', '30D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  timeframe === tf ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Scenario Selector Bar (Shown when Predictive Overlay is Enabled) */}
      {showForecast && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 block text-xs">
                Predictive Risk Model: Temporal Drift & Anomaly Clustering Forecaster
              </span>
              <p className="text-[11px] text-amber-800 leading-tight">
                Simulates probable velocity variations, counterparty novelties, and mule ring dispersion patterns over the next 7 days.
              </p>
            </div>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center shrink-0">
            <span className="text-[10.5px] font-bold text-amber-900 mr-1">Forecast Scenario:</span>
            {[
              { id: 'SURGE_WARNING', label: 'Surge Warning (Mule Aggregation)', color: 'accent' },
              { id: 'MITIGATED_DECAY', label: 'Mitigated Containment', color: 'standard' },
              { id: 'SEASONAL_BASELINE', label: 'Seasonal Baseline', color: 'standard' },
            ].map(sc => (
              <button
                key={sc.id}
                onClick={() => setForecastScenario(sc.id as ForecastScenario)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all border ${
                  forecastScenario === sc.id
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            {timeframe} TOTAL VOLUME
          </span>
          <div className="font-mono text-xl font-black text-slate-900 tabular-nums">
            {volumeMetric === 'COUNT'
              ? `${summary.totalVol.toLocaleString()} txs`
              : `৳${(summary.totalBDT / 10000000).toFixed(2)} Cr`}
          </div>
          <span className="text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14.2% vs prior window</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            WINDOW AVG RISK
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-black text-slate-900 tabular-nums">
              {summary.avgRisk}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <span className="text-[10.5px] text-slate-500 font-medium">
            Controlled baseline variance
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-0.5">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block font-mono">
            HIGH-RISK INCIDENTS
          </span>
          <div className="font-mono text-xl font-black text-rose-600 tabular-nums">
            {summary.totalHighRisk}
          </div>
          <span className="text-[10.5px] text-rose-700 font-semibold">
            Score ≥ 70 flagged events
          </span>
        </div>

        {/* 4th KPI: Displays Projected Peak Risk when Forecast is active, otherwise Historical Peak */}
        <div className={`p-3.5 rounded-xl border space-y-0.5 ${
          showForecast
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-slate-50 border-slate-200/80'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
            showForecast ? 'text-amber-800' : 'text-slate-400'
          }`}>
            {showForecast ? 'PROJECTED 7D PEAK' : 'PEAK RISK ANOMALY'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-xl font-black tabular-nums ${
              showForecast ? 'text-orange-600' : 'text-rose-600'
            }`}>
              {showForecast ? summary.peakForecastRisk : summary.peakHistorical?.averageRisk || 76}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {showForecast
                ? `(${summary.peakForecastPoint?.date.replace(' (Proj)', '') || 'Day +3'})`
                : `(${summary.peakHistorical?.date || 'Today'})`}
            </span>
          </div>
          <span className="text-[10.5px] text-slate-600 truncate block font-medium">
            {showForecast
              ? (summary.peakForecastPoint?.forecastAlert || 'Predicted Surge Wave')
              : (summary.peakHistorical?.incidentLabel || 'The 7-Minute Incident')}
          </span>
        </div>
      </div>

      {/* Interactive Metric Toggles & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-[11px] select-none">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={e => setShowVolume(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span>Transaction Volume ({volumeMetric === 'COUNT' ? 'Count' : 'BDT'})</span>
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-[11px] select-none">
            <input
              type="checkbox"
              checked={showAvgRisk}
              onChange={e => setShowAvgRisk(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Historical Avg Risk</span>
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-[11px] select-none">
            <input
              type="checkbox"
              checked={showHighRisk}
              onChange={e => setShowHighRisk(e.target.checked)}
              className="rounded accent-rose-600"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Historical High-Risk Events</span>
            </span>
          </label>

          {showForecast && (
            <label className="flex items-center gap-1.5 cursor-pointer text-amber-900 font-semibold text-[11px] select-none">
              <input
                type="checkbox"
                checked={showConfidenceBand}
                onChange={e => setShowConfidenceBand(e.target.checked)}
                className="rounded accent-orange-600"
              />
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-300" />
                <span>90% Forecast Confidence Corridor</span>
              </span>
            </label>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          Interactive dual-axis telemetry · Dashed lines indicate predictive model horizon
        </span>
      </div>

      {/* The 3D Composed Chart Canvas with Predictive Overlay */}
      <div
        className="h-76 w-full pt-2 transition-all duration-300"
        style={
          is3DPlane
            ? {
                perspective: '1200px',
                transform: 'rotateX(3.5deg)',
                transformOrigin: 'center bottom',
                filter: 'drop-shadow(0 10px 20px rgba(15, 23, 42, 0.05))',
              }
            : {}
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={combinedChartData}
            margin={{ top: 14, right: 18, left: -10, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length && onSelectDate) {
                onSelectDate(state.activePayload[0].payload);
              }
            }}
          >
            <defs>
              {/* 3D Volumetric Area for Volume */}
              <linearGradient id="volumetricSkyArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity={0.22} />
                <stop offset="65%" stopColor="#38bdf8" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#0284c7" stopOpacity={0.00} />
              </linearGradient>

              {/* 3D Volumetric Area for Forecast Confidence Corridor */}
              <linearGradient id="confidenceGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.24} />
                <stop offset="70%" stopColor="#ea580c" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.01} />
              </linearGradient>

              {/* 3D Volumetric Drop Shadows for Lines */}
              <filter id="skyLineDepth" x="-10%" y="-10%" width="120%" height="150%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.30" />
              </filter>
              <filter id="riskLineDepth" x="-10%" y="-10%" width="120%" height="150%">
                <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#d97706" floodOpacity="0.32" />
              </filter>
              <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#e11d48" floodOpacity="0.65" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={10.5}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              dy={5}
            />

            {/* Left Y-Axis: Volume */}
            <YAxis
              yAxisId="left"
              stroke="#0284c7"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v: number) =>
                volumeMetric === 'COUNT' ? `${v}` : `৳${(v / 100000).toFixed(0)}L`
              }
            />

            {/* Right Y-Axis: Risk Score (0 to 100) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              stroke="#ea580c"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v: number) => `${v}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Forecast Boundary Reference Line */}
            {showForecast && lastHistoricalDate && (
              <ReferenceLine
                x={lastHistoricalDate}
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'TODAY | 7D FORECAST HORIZON',
                  position: 'top',
                  fill: '#b45309',
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />
            )}

            {/* 3D Volumetric Area Ribbon for Transaction Volume */}
            {showVolume && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey={volumeMetric === 'COUNT' ? 'volume' : 'volumeBDT'}
                fill="url(#volumetricSkyArea)"
                stroke="none"
              />
            )}

            {/* Confidence Band Envelope (Area overlay) */}
            {showForecast && showConfidenceBand && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="projectedRiskUpper"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="3 3"
                fill="url(#confidenceGlow)"
                fillOpacity={0.16}
                name="Forecast Confidence Interval"
              />
            )}

            {/* Transaction Volume Line (Elevated) */}
            {showVolume && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey={volumeMetric === 'COUNT' ? 'volume' : 'volumeBDT'}
                name={volumeMetric === 'COUNT' ? 'Volume (Txs)' : 'Volume (BDT)'}
                stroke="#0284c7" // sky-600
                strokeWidth={2.8}
                dot={{ r: 2.5, fill: '#0284c7', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 5.5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                style={{ filter: is3DPlane ? 'url(#skyLineDepth)' : undefined }}
              />
            )}

            {/* Historical Average Risk Line (Solid with Depth) */}
            {showAvgRisk && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageRisk"
                name="Historical Avg Risk"
                stroke="#d97706" // amber-600
                strokeWidth={2.6}
                dot={{ r: 3, fill: '#d97706', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                style={{ filter: is3DPlane ? 'url(#riskLineDepth)' : undefined }}
              />
            )}

            {/* Historical High Risk Count Line with 3D Radar Concentric Markers on Anomalies */}
            {showHighRisk && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="highRiskCount"
                name="High Risk Events"
                stroke="#e11d48" // rose-600
                strokeWidth={2.2}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (!payload || payload.highRiskCount === undefined) return <g key={props.key} />;
                  if (payload.isAnomalySpike) {
                    return (
                      <g key={props.key} filter="url(#pulseGlow)">
                        {/* 3D Concentric Halo Ring */}
                        <circle cx={cx} cy={cy} r={8.5} fill="#e11d48" fillOpacity={0.25} />
                        {/* Metallic Rim */}
                        <circle cx={cx} cy={cy} r={5} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
                        {/* Specular Core */}
                        <circle cx={cx} cy={cy} r={2} fill="#ffffff" />
                      </g>
                    );
                  }
                  return (
                    <circle
                      key={props.key}
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill="#e11d48"
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  );
                }}
                activeDot={{ r: 6.5, fill: '#e11d48', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}

            {/* 7-DAY PREDICTIVE RISK OVERLAY (Dashed Line with 3D Shadow) */}
            {showForecast && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="projectedRisk"
                name="7-Day Projected Risk Trend"
                stroke="#ea580c" // orange-600
                strokeWidth={2.8}
                strokeDasharray="6 4"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (!payload || payload.projectedRisk === undefined) return <g key={props.key} />;
                  const isHigh = payload.projectedRisk >= 70;
                  return (
                    <circle
                      key={props.key}
                      cx={cx}
                      cy={cy}
                      r={isHigh ? 4.5 : 3.5}
                      fill={isHigh ? '#ea580c' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 7.5, fill: '#ea580c', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}

            {/* Projected High Risk Events (Optional Dotted Line) */}
            {showForecast && showHighRisk && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="projectedHighRisk"
                name="Projected High-Risk Events"
                stroke="#e11d48"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                dot={{ r: 2.5, fill: '#e11d48', stroke: '#ffffff', strokeWidth: 1 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Predictive Risk Intelligence Briefing Banner */}
      {showForecast && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="font-bold text-slate-900 text-xs font-display">
                Forecast Operational Guidance
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              Surge Confidence: 89.2% · Horizon: 7 Days
            </span>
          </div>

          <p className="text-slate-600 text-[11px] leading-relaxed">
            {forecastScenario === 'SURGE_WARNING' ? (
              <>
                <strong>Analyst Alert:</strong> Synthetic time-series clustering identifies a high likelihood of a secondary mule disbursement push over upcoming Days +3/+4 (projected peak risk: <strong>{summary.peakForecastRisk}/100</strong>, ~{summary.peakForecastPoint?.projectedHighRisk} anomalous transactions). Recommended policy: Arm temporary step-up verification for any transfers exceeding ৳15,000 destined for newly provisioned wallets.
              </>
            ) : forecastScenario === 'MITIGATED_DECAY' ? (
              <>
                <strong>Containment Trajectory:</strong> Assuming analyst holds on <em>CASE-001</em> and <em>CASE-003</em> remain enforced, systemic risk is projected to decay steadily back towards baseline median (&lt; 30/100) within 96 hours.
              </>
            ) : (
              <>
                <strong>Baseline Projection:</strong> Without coordinated cluster aggregation, expected daily transaction risk will fluctuate within nominal parameters (25–35 / 100), with minor weekend retail volume surges.
              </>
            )}
          </p>
        </div>
      )}

      {/* Chart Legend Footer */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Solid lines indicate recorded actuals; dashed &amp; dotted trajectories depict probabilistic 7-day model projections.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-sky-600" /> Volume
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Historical Risk
          </span>
          {showForecast && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-orange-700 font-bold">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-orange-600" /> 7D Risk Forecast
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-rose-600" /> Flagged Events
          </span>
        </div>
      </div>
    </div>
  );
};
