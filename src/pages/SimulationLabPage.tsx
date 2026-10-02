/**
 * Upay Sentinel AI - Simulation Lab (Premium White Fintech MVP)
 * DIU CPC × upay AI Hackathon 2026
 * Matches Section 11 & 12: Scenario Buttons, Animation Stepper, and the 60-Second WOW Demo
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Smartphone,
  CreditCard,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskAssessment } from '../types';

interface SimulationLabPageProps {
  onNavigate: (path: string) => void;
  onTriggerDemoScenario: () => void;
}

export const SimulationLabPage: React.FC<SimulationLabPageProps> = ({
  onNavigate,
  onTriggerDemoScenario,
}) => {
  // Stepper state for animated scenario execution
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastScenarioName, setLastScenarioName] = useState<string>('');

  // What-If State
  const [amount, setAmount] = useState<number>(18500);
  const [isNewDevice, setIsNewDevice] = useState<boolean>(true);
  const [isNewRecipient, setIsNewRecipient] = useState<boolean>(true);
  const [isNightWindow, setIsNightWindow] = useState<boolean>(true);
  const [recentVelocity, setRecentVelocity] = useState<number>(3);
  const [connectedToCluster, setConnectedToCluster] = useState<boolean>(true);
  const [baselineMedian, setBaselineMedian] = useState<number>(2900);

  // Computed assessment state
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  const calculateWhatIf = async () => {
    try {
      const res = await api.runWhatIf({
        amount,
        isNewDevice,
        isNewRecipient,
        isNightWindow,
        recentVelocityCount: recentVelocity,
        connectedToFlaggedCluster: connectedToCluster,
        baselineMedian,
      });
      setAssessment(res.assessment);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    calculateWhatIf();
  }, [amount, isNewDevice, isNewRecipient, isNightWindow, recentVelocity, connectedToCluster, baselineMedian]);

  // Execute scenario with animation stepper: EVENT -> ANALYZE -> CONNECT -> RISK -> INVESTIGATE
  const runAnimatedScenario = (name: string, callback: () => void) => {
    setIsSimulating(true);
    setLastScenarioName(name);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 500);
    setTimeout(() => setActiveStep(3), 1000);
    setTimeout(() => setActiveStep(4), 1500);
    setTimeout(() => {
      setActiveStep(5);
      setIsSimulating(false);
      callback();
    }, 2000);
  };

  const handleScenarioClick = (type: string) => {
    switch (type) {
      case 'NORMAL':
        setAmount(2500);
        setIsNewDevice(false);
        setIsNewRecipient(false);
        setIsNightWindow(false);
        setRecentVelocity(1);
        setConnectedToCluster(false);
        runAnimatedScenario('Normal Activity', () => {});
        break;
      case 'ACCOUNT_TAKEOVER':
        runAnimatedScenario('Account Takeover (The 7-Minute Incident)', () => {
          onTriggerDemoScenario();
        });
        break;
      case 'POTENTIAL_SCAM':
        setAmount(12000);
        setIsNewDevice(false);
        setIsNewRecipient(true);
        setIsNightWindow(false);
        setRecentVelocity(3);
        setConnectedToCluster(false);
        runAnimatedScenario('Potential Scam (Urgent Recipient Push)', () => {});
        break;
      case 'SUSPICIOUS_NETWORK':
        setAmount(18500);
        setIsNewDevice(true);
        setIsNewRecipient(true);
        setConnectedToCluster(true);
        runAnimatedScenario('Suspicious Network (Smurfing Ring)', () => {
          onNavigate('/trustgraph');
        });
        break;
      case 'HIGH_VELOCITY':
        setAmount(8000);
        setIsNewDevice(false);
        setIsNewRecipient(true);
        setIsNightWindow(false);
        setRecentVelocity(6);
        setConnectedToCluster(false);
        runAnimatedScenario('High Velocity Rapid Burst', () => {});
        break;
      case 'UNUSUAL_AMOUNT':
        setAmount(24000);
        setIsNewDevice(false);
        setIsNewRecipient(false);
        setIsNightWindow(false);
        setRecentVelocity(1);
        setConnectedToCluster(false);
        runAnimatedScenario('Unusual Amount (+538% Deviation)', () => {});
        break;
      case 'NEW_DEVICE':
        setAmount(4200);
        setIsNewDevice(true);
        setIsNewRecipient(false);
        setIsNightWindow(false);
        setRecentVelocity(1);
        setConnectedToCluster(false);
        runAnimatedScenario('New Device Authentication', () => {});
        break;
      case 'AGENT_ANOMALY':
        setAmount(29500);
        setIsNewDevice(true);
        setIsNewRecipient(true);
        setIsNightWindow(true);
        setRecentVelocity(4);
        setConnectedToCluster(true);
        runAnimatedScenario('Agent Cash-Out Anomaly Hub', () => {
          onNavigate('/agents/AGENT-DEMO-007');
        });
        break;
    }
  };

  return (
    <div className="space-y-6 pb-16 text-xs text-slate-800">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">Create a Risk Event</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              SIMULATION LAB
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Inject controlled synthetic financial events, observe explainable feature scoring, and trace the full investigation flow.
          </p>
        </div>

        {/* Primary WOW Demo Button */}
        <button
          onClick={() => handleScenarioClick('ACCOUNT_TAKEOVER')}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all hover:scale-102"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>RUN ACCOUNT TAKEOVER SCENARIO</span>
        </button>
      </div>

      {/* Visual Animation Stepper (Prompt #11 Requirement: EVENT -> ANALYZE -> CONNECT -> RISK -> INVESTIGATE) */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900 uppercase font-mono">
            Intelligence Pipeline Execution Flow
          </span>
          {lastScenarioName && (
            <span className="text-[11px] text-sky-700 font-semibold font-mono">
              Running: {lastScenarioName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { step: 1, label: 'EVENT', desc: 'Synthetic Ingest' },
            { step: 2, label: 'ANALYZE', desc: 'Feature Extraction' },
            { step: 3, label: 'CONNECT', desc: 'TrustGraph Lookup' },
            { step: 4, label: 'RISK', desc: 'Score Calculation' },
            { step: 5, label: 'INVESTIGATE', desc: 'AI Copilot Ready' },
          ].map(s => {
            const isActive = activeStep >= s.step;
            const isCurrent = activeStep === s.step;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20 scale-102'
                    : isActive
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200/70'
                }`}
              >
                <span className={`font-mono text-xs font-black block ${isCurrent ? 'text-white' : ''}`}>
                  0{s.step}
                </span>
                <span className="font-bold text-xs block">{s.label}</span>
                <span className={`text-[10px] block mt-0.5 ${isCurrent ? 'text-sky-100' : 'text-slate-500'}`}>
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Large Scenario Presets (Prompt #11 Requirement: 8 pre-built scenarios) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 font-display">Pre-Built Scenarios</h3>
          <span className="text-[11px] text-slate-400 font-medium">8 Scenarios Available</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'NORMAL', label: 'Normal activity', desc: 'Baseline family remittance', color: 'hover:border-sky-300' },
            { id: 'ACCOUNT_TAKEOVER', label: 'Account takeover', desc: '7-Minute credential extract', color: 'hover:border-rose-400 border-rose-200 bg-rose-50/50' },
            { id: 'POTENTIAL_SCAM', label: 'Potential scam', desc: 'High urgency unknown transfer', color: 'hover:border-amber-300' },
            { id: 'SUSPICIOUS_NETWORK', label: 'Suspicious network', desc: 'Smurfing aggregation ring', color: 'hover:border-purple-300' },
            { id: 'HIGH_VELOCITY', label: 'High velocity', desc: 'Rapid consecutive drain burst', color: 'hover:border-orange-300' },
            { id: 'UNUSUAL_AMOUNT', label: 'Unusual amount', desc: '+538% value deviation', color: 'hover:border-amber-300' },
            { id: 'NEW_DEVICE', label: 'New device', desc: 'Unpaired hardware pairing', color: 'hover:border-sky-300' },
            { id: 'AGENT_ANOMALY', label: 'Agent anomaly', desc: 'Disproportionate cash-out point', color: 'hover:border-rose-300' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => handleScenarioClick(btn.id)}
              disabled={isSimulating}
              className={`p-3.5 rounded-2xl border border-slate-200/90 bg-white text-left transition-all shadow-2xs hover:shadow-sm hover:scale-[1.01] disabled:opacity-50 ${btn.color}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-xs font-display text-slate-900 capitalize">{btn.label}</span>
                <Play className="w-3 h-3 text-sky-600 fill-sky-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{btn.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sensitivity Customizer */}
      <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900 font-display">Interactive Sensitivity 'WHAT-IF?' Customizer</h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Fine-tune transaction signals in real time to observe explainable score adjustments.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-mono font-semibold">
            Real-time recalculation based on synthetic risk engine.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Amount Slider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Transaction Amount</span>
                <span className="font-mono text-base font-extrabold text-sky-700 tabular-nums">
                  ৳{amount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="35000"
                step="500"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>৳500</span>
                <span>User Median: ৳{baselineMedian.toLocaleString()}</span>
                <span>৳35,000</span>
              </div>
            </div>

            {/* Toggle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setIsNewDevice(!isNewDevice)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isNewDevice ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-900">Hardware Recognition</span>
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="font-bold text-xs">
                  {isNewDevice ? (
                    <span className="text-amber-800">Unrecognized Device (+16)</span>
                  ) : (
                    <span className="text-sky-700">Known Handset (+0)</span>
                  )}
                </div>
              </div>

              <div
                onClick={() => setIsNewRecipient(!isNewRecipient)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isNewRecipient ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-900">Counterparty Novelty</span>
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="font-bold text-xs">
                  {isNewRecipient ? (
                    <span className="text-amber-800">First-Time Recipient (+18)</span>
                  ) : (
                    <span className="text-sky-700">Frequent Trusted Contact (+0)</span>
                  )}
                </div>
              </div>

              <div
                onClick={() => setIsNightWindow(!isNightWindow)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isNightWindow ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-900">Diurnal Timing Window</span>
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="font-bold text-xs">
                  {isNightWindow ? (
                    <span className="text-amber-800">Off-Hours / 02:30 AM (+10)</span>
                  ) : (
                    <span className="text-sky-700">Daytime Transacting (+0)</span>
                  )}
                </div>
              </div>

              <div
                onClick={() => setConnectedToCluster(!connectedToCluster)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  connectedToCluster ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-900">TrustGraph Linkage</span>
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="font-bold text-xs">
                  {connectedToCluster ? (
                    <span className="text-rose-700">Linked to Mule Ring (+14)</span>
                  ) : (
                    <span className="text-sky-700">Isolated Nominal Network (+0)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Assessment Output (5 Cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Simulated Output Assessment
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-sky-50 text-sky-700 font-bold border border-sky-200">
                LIVE ENGINE
              </span>
            </div>

            {assessment && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[10px] font-semibold">PREDICTED RISK SCORE</span>
                    <div className="font-mono text-3xl font-black text-slate-900 tabular-nums">
                      {assessment.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500">
                      Primary: <strong className="text-rose-700">{assessment.primarySignal}</strong>
                    </span>
                  </div>

                  {/* Circular Risk Meter */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`transition-all duration-500 ${
                          assessment.riskScore >= 85
                            ? 'text-rose-600'
                            : assessment.riskScore >= 70
                            ? 'text-orange-500'
                            : assessment.riskScore >= 40
                            ? 'text-amber-500'
                            : 'text-sky-600'
                        }`}
                        strokeDasharray={`${assessment.riskScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <RiskBadge level={assessment.riskLevel} score={assessment.riskScore} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Additive Signal Decomposition ({assessment.signals.length}):
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {assessment.signals.length === 0 ? (
                      <p className="text-emerald-700 text-[11px] italic">No risk signals triggered. Nominal behavior.</p>
                    ) : (
                      assessment.signals.map(s => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-[11px]"
                        >
                          <span className="text-slate-800 font-medium">{s.name}</span>
                          <span className="font-mono text-rose-600 font-bold">+{s.score}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Policy Recommendation:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      assessment.recommendedAction === 'IMMEDIATE_ESCALATION'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : assessment.recommendedAction === 'PAUSE_AND_VERIFY' || assessment.recommendedAction === 'FLAG_FOR_REVIEW'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {assessment.recommendedAction}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[10.5px]">
                    Requires Human Review: <strong className="text-slate-800">{assessment.requiresHumanReview ? 'YES' : 'NO'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('/trustgraph?clusterId=CLUSTER-SMURF-904')}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View in TrustGraph</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                  </button>
                  <button
                    onClick={() => onNavigate('/copilot')}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Scan with Copilot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
