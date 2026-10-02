/**
 * Upay Sentinel AI - Simulated Live Risk Feed (Premium White Theme)
 * Real-time synthetic event stream generator and risk processor with Radial Progress Telemetry
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Radio,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { RadialProgress } from '../components/common/RadialProgress';
import { Transaction } from '../types';
import { evaluateTransactionRisk } from '../engine/riskEngine';
import { getDataset, addTransactionToDataset } from '../data/syntheticDataset';

interface LiveRiskPageProps {
  onNavigate: (path: string) => void;
}

export const LiveRiskPage: React.FC<LiveRiskPageProps> = ({ onNavigate }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [stream, setStream] = useState<Transaction[]>([]);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [speedMs, setSpeedMs] = useState(3000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial load from dataset
    const initialTxs = getDataset().transactions.slice(0, 12);
    setStream(initialTxs);
  }, []);

  // Stream generator timer
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      generateSyntheticStreamEvent();
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, speedMs]);

  const generateSyntheticStreamEvent = (isForceIncident = false) => {
    const data = getDataset();
    const customers = data.customers;
    const randomCust = customers[Math.floor(Math.random() * customers.length)];
    const isAnomalous = isForceIncident || Math.random() < 0.22;

    const baseMedian = randomCust.behavioralDNA.recentMedianAmount;
    const amount = isAnomalous
      ? Math.round(baseMedian * (3.5 + Math.random() * 2.5))
      : Math.round(baseMedian * (0.3 + Math.random() * 1.2));

    const isNewDev = isAnomalous;
    const devId = isNewDev ? 'DEV-DEMO-104' : randomCust.behavioralDNA.knownDevices[0] || 'DEV-DEMO-101';
    const isNewRec = isAnomalous;
    const recId = isNewRec ? `WALLET-DEMO-${800 + Math.floor(Math.random() * 50)}` : randomCust.behavioralDNA.knownRecipients[0] || 'CUS-DEMO-1002';

    const txId = `TX-LIVE-${Date.now().toString().slice(-5)}`;
    const nowTime = new Date().toISOString();

    const assessment = evaluateTransactionRisk({
      transactionId: txId,
      amount,
      recipientId: recId,
      isNewRecipient: isNewRec,
      deviceId: devId,
      isNewDevice: isNewDev,
      timestamp: nowTime,
      recentVelocityCount: isAnomalous ? 3 : 1,
      connectedToFlaggedCluster: isAnomalous,
      baseline: randomCust.behavioralDNA,
    });

    const newTx: Transaction = {
      id: txId,
      timestamp: nowTime,
      customerId: randomCust.id,
      customerName: randomCust.name,
      amount,
      type: 'SEND_MONEY',
      channel: 'APP',
      status: assessment.riskLevel === 'CRITICAL' ? 'BLOCKED' : (assessment.riskLevel === 'HIGH' ? 'FLAGGED' : 'COMPLETED'),
      recipientId: recId,
      recipientName: isNewRec ? `Unverified (${recId})` : 'Known Contact',
      recipientType: 'CUSTOMER',
      isNewRecipient: isNewRec,
      deviceId: devId,
      isNewDevice: isNewDev,
      deviceModel: isNewDev ? 'Xiaomi Redmi Note 12 (Emulated)' : 'Samsung Galaxy A54',
      riskAssessment: assessment,
    };

    // Add to global synthetic dataset & stream
    addTransactionToDataset(newTx);
    setStream(prev => [newTx, ...prev.slice(0, 35)]);
  };

  const filteredStream = stream.filter(tx => {
    if (filterTier === 'ALL') return true;
    if (filterTier === 'HIGH_CRITICAL') return tx.riskAssessment.riskLevel === 'HIGH' || tx.riskAssessment.riskLevel === 'CRITICAL';
    if (filterTier === 'LOW') return tx.riskAssessment.riskLevel === 'LOW';
    return true;
  });

  // Calculate live stream statistics for Radial Progress telemetry
  const streamStats = useMemo(() => {
    if (stream.length === 0) {
      return { averageRisk: 0, highRiskPct: 0, peakScore: 0 };
    }
    const totalScore = stream.reduce((acc, t) => acc + t.riskAssessment.riskScore, 0);
    const avg = Math.round(totalScore / stream.length);
    const highRiskCount = stream.filter(t => t.riskAssessment.riskScore >= 70).length;
    const highPct = Math.round((highRiskCount / stream.length) * 100);
    const peak = Math.max(...stream.map(t => t.riskAssessment.riskScore));
    return { averageRisk: avg, highRiskPct: highPct, peakScore: peak };
  }, [stream]);

  return (
    <div className="space-y-6 pb-16 text-xs text-slate-800">
      {/* Header and Controls */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">Simulated Live Risk Feed</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-sky-50 border border-sky-200 text-sky-700 font-bold">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isRunning ? 'STREAM ACTIVE' : 'STREAM PAUSED'}</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time synthetic transaction ingestion pipeline with dynamic radial risk score telemetry.
          </p>
        </div>

        {/* Stream Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => setIsRunning(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Feed</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Feed</span>
            </button>
          )}

          <button
            onClick={() => generateSyntheticStreamEvent(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm shadow-rose-600/20"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Inject Incident Event</span>
          </button>

          <button
            onClick={() => {
              setStream([]);
              setIsRunning(true);
            }}
            title="Reset Stream Buffer"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Time Radial Telemetry Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Live Stream Average Risk Gauge */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              STREAM MEAN RISK
            </span>
            <div className="text-sm font-bold text-slate-900 leading-snug">
              Average Event Score
            </div>
            <p className="text-[11px] text-slate-500">
              Moving average computed across {stream.length} buffered transactions.
            </p>
          </div>
          <RadialProgress
            value={streamStats.averageRisk}
            size={76}
            strokeWidth={6.5}
            variant="risk"
            showValue={true}
            valueSuffix="/100"
            label="MEAN"
            title={`Live Stream Average Risk: ${streamStats.averageRisk}`}
          />
        </div>

        {/* Metric 2: High & Critical Incident Proportion */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              FLAGGED RATIO
            </span>
            <div className="text-sm font-bold text-slate-900 leading-snug">
              High-Risk Density
            </div>
            <p className="text-[11px] text-slate-500">
              Percentage of transactions flagged above threshold (score ≥ 70).
            </p>
          </div>
          <RadialProgress
            value={streamStats.highRiskPct}
            size={76}
            strokeWidth={6.5}
            variant={streamStats.highRiskPct >= 30 ? 'rose' : streamStats.highRiskPct >= 15 ? 'amber' : 'sky'}
            showValue={true}
            valueSuffix="%"
            label="FLAGGED"
            title={`Flagged Proportion: ${streamStats.highRiskPct}%`}
          />
        </div>

        {/* Metric 3: Peak Detected Anomaly Score */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              PEAK ANOMALY
            </span>
            <div className="text-sm font-bold text-slate-900 leading-snug">
              Max Stream Severity
            </div>
            <p className="text-[11px] text-slate-500">
              Highest scoring anomalous transaction currently in memory buffer.
            </p>
          </div>
          <RadialProgress
            value={streamStats.peakScore}
            size={76}
            strokeWidth={6.5}
            variant="risk"
            showValue={true}
            valueSuffix="/100"
            label="PEAK"
            title={`Peak Anomaly: ${streamStats.peakScore}`}
          />
        </div>
      </div>

      {/* Filter and Cadence Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'ALL', label: 'All Ingested Events' },
            { id: 'HIGH_CRITICAL', label: 'Flagged (≥ 70) Only' },
            { id: 'LOW', label: 'Nominal Baseline' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterTier(f.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                filterTier === f.id
                  ? 'bg-white text-sky-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-semibold text-slate-700">Ingestion Cadence:</span>
          {[
            { label: 'Fast (1.5s)', ms: 1500 },
            { label: 'Normal (3s)', ms: 3000 },
            { label: 'Relaxed (5s)', ms: 5000 },
          ].map(s => (
            <button
              key={s.ms}
              onClick={() => setSpeedMs(s.ms)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors ${
                speedMs === s.ms
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Transaction Stream List with Radial Progress Gauges */}
      <div className="space-y-2.5">
        {filteredStream.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white text-slate-400 space-y-2">
            <Radio className="w-8 h-8 text-sky-600 mx-auto animate-pulse" />
            <p className="text-slate-600 font-medium">Awaiting incoming synthetic stream events...</p>
            <span className="text-[11px] text-slate-400">Stream is actively listening for live synthetic telemetry.</span>
          </div>
        ) : (
          filteredStream.map(tx => {
            const isHighOrCritical =
              tx.riskAssessment.riskLevel === 'HIGH' || tx.riskAssessment.riskLevel === 'CRITICAL';

            return (
              <div
                key={tx.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isHighOrCritical
                    ? 'bg-rose-50/60 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Left: Radial Progress Gauge + Tx Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Real-time Radial Progress Gauge */}
                  <RadialProgress
                    value={tx.riskAssessment.riskScore}
                    size={46}
                    strokeWidth={4.5}
                    variant="risk"
                    showValue={true}
                    pulseOnCritical={true}
                    title={`${tx.id} Risk Score: ${tx.riskAssessment.riskScore}/100`}
                  />

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-900 text-sm">{tx.id}</span>
                      <RiskBadge level={tx.riskAssessment.riskLevel} size="sm" showScore={false} />
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-900 font-semibold">{tx.customerName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({tx.customerId})</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-500 text-[11px] flex-wrap">
                      <span className="font-mono text-slate-900 font-bold text-xs tabular-nums">
                        ৳{tx.amount.toLocaleString()}
                      </span>
                      <span>·</span>
                      <span>Recipient: <strong className="text-slate-700">{tx.recipientName}</strong></span>
                      <span>·</span>
                      <span>Device: <span className={`font-mono ${tx.isNewDevice ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>{tx.deviceId}</span></span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Signals & Action Button */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right max-w-xs">
                    <span className={`text-[11px] font-bold block truncate ${isHighOrCritical ? 'text-rose-800' : 'text-slate-800'}`}>
                      {tx.riskAssessment.primarySignal}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {tx.riskAssessment.signals.length} contributing factor{tx.riskAssessment.signals.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate(`/transactions/${tx.id}`)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
                      isHighOrCritical
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                        : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
