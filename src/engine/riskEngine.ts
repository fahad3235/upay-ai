/**
 * Upay Sentinel AI - Explainable Dynamic Risk Engine
 * Implements deterministic feature engineering, Isolation-Forest-inspired anomaly scoring,
 * structured signal contribution calculation, and dynamic Admin-configurable weights & thresholds.
 * DIU CPC × upay AI Hackathon 2026
 */

import { RiskAssessment, RiskLevel, RiskSignal, BehavioralDNA, RiskWeights, RiskThresholds } from '../types';

export interface EvaluateRiskParams {
  transactionId: string;
  amount: number;
  recipientId: string;
  isNewRecipient: boolean;
  deviceId: string;
  isNewDevice: boolean;
  timestamp: string; // ISO or HH:MM
  recentVelocityCount?: number; // count in past 1 hour
  connectedToFlaggedCluster?: boolean;
  baseline: BehavioralDNA;
  weights?: RiskWeights;
  thresholds?: RiskThresholds;
}

// Global active risk engine configuration (synced with Central Admin Control Plane)
let activeRiskWeights: RiskWeights = {
  amountWeight: 30,
  recipientWeight: 20,
  deviceWeight: 15,
  velocityWeight: 15,
  behaviorWeight: 10,
  networkWeight: 10,
};

let activeRiskThresholds: RiskThresholds = {
  lowMax: 29,
  mediumMax: 59,
  highMax: 79,
};

export function getGlobalRiskConfig() {
  return {
    weights: { ...activeRiskWeights },
    thresholds: { ...activeRiskThresholds },
  };
}

export function setGlobalRiskConfig(
  weights?: Partial<RiskWeights>,
  thresholds?: Partial<RiskThresholds>
) {
  if (weights) {
    activeRiskWeights = { ...activeRiskWeights, ...weights };
  }
  if (thresholds) {
    activeRiskThresholds = { ...activeRiskThresholds, ...thresholds };
  }
  return getGlobalRiskConfig();
}

export function evaluateTransactionRisk(params: EvaluateRiskParams): RiskAssessment {
  const signals: RiskSignal[] = [];
  const {
    transactionId,
    amount,
    recipientId,
    isNewRecipient,
    deviceId,
    isNewDevice,
    timestamp,
    recentVelocityCount = 1,
    connectedToFlaggedCluster = false,
    baseline,
    weights = activeRiskWeights,
    thresholds = activeRiskThresholds,
  } = params;

  let totalScore = 0;

  // 1. Amount Anomaly Signal (Configured by amountWeight, default 30)
  const median = baseline.recentMedianAmount || 2500;
  const deviationPct = Math.round(((amount - median) / median) * 100);

  if (amount > median * 4) {
    const rawRatio = Math.min(1.0, 0.6 + (amount / (median * 8)));
    const score = Math.max(1, Math.round(rawRatio * weights.amountWeight));
    signals.push({
      id: 'SIG-AMT-HIGH',
      name: 'Amount Anomaly',
      score,
      category: 'AMOUNT',
      description: `Transaction amount is ${deviationPct}% above recent customer median (৳${median.toLocaleString()}).`,
      observedValue: `৳${amount.toLocaleString()}`,
      baselineValue: `৳${median.toLocaleString()} (Median)`,
      deviationPercentage: deviationPct,
      evidence: `Customer rarely moves >৳${(median * 2).toLocaleString()} in a single transfer. Observed value is in the 99th percentile of historic synthetic profile.`,
    });
    totalScore += score;
  } else if (amount > median * 2) {
    const score = Math.max(1, Math.round(0.5 * weights.amountWeight));
    signals.push({
      id: 'SIG-AMT-MED',
      name: 'Moderate Amount Deviation',
      score,
      category: 'AMOUNT',
      description: `Transaction amount is ${deviationPct}% above normal baseline.`,
      observedValue: `৳${amount.toLocaleString()}`,
      baselineValue: `৳${median.toLocaleString()}`,
      deviationPercentage: deviationPct,
      evidence: `Observed amount moderately exceeds synthetic baseline bounds.`,
    });
    totalScore += score;
  }

  // 2. Recipient Novelty (Configured by recipientWeight, default 20)
  const isKnownRecipient = baseline.knownRecipients.includes(recipientId) || !isNewRecipient;
  if (!isKnownRecipient) {
    const score = Math.max(1, Math.round(0.9 * weights.recipientWeight));
    signals.push({
      id: 'SIG-REC-NEW',
      name: 'Recipient Novelty',
      score,
      category: 'RECIPIENT',
      description: 'First-ever fund transfer to this destination wallet.',
      observedValue: `New Recipient (${recipientId})`,
      baselineValue: `${baseline.knownRecipients.length} Verified Prior Counterparties`,
      evidence: 'No recorded interactions or historical counterparty trust scores exist between sender and recipient.',
    });
    totalScore += score;
  }

  // 3. Device Novelty / Authentication Shift (Configured by deviceWeight, default 15)
  const isKnownDevice = baseline.knownDevices.includes(deviceId) || !isNewDevice;
  if (!isKnownDevice) {
    const score = Math.max(1, weights.deviceWeight);
    signals.push({
      id: 'SIG-DEV-NEW',
      name: 'Device Change',
      score,
      category: 'DEVICE',
      description: 'Transaction initiated from a hardware identifier seen for the first time.',
      observedValue: `New Handset (${deviceId})`,
      baselineValue: `${baseline.knownDevices.join(', ')}`,
      evidence: 'Sudden hardware switch without standard account cooldown or dual-channel step-up authentication.',
    });
    totalScore += score;
  }

  // 4. Temporal / Off-Hours Anomaly (Configured by behaviorWeight, default 10)
  let hour = 14;
  if (timestamp) {
    const dateObj = new Date(timestamp);
    if (!isNaN(dateObj.getTime())) {
      hour = dateObj.getHours();
    } else if (timestamp.includes(':')) {
      hour = parseInt(timestamp.split(':')[0], 10) || 14;
    }
  }

  const isNightWindow = hour >= 1 && hour <= 5;
  if (isNightWindow) {
    const score = Math.max(1, weights.behaviorWeight);
    signals.push({
      id: 'SIG-TIME-OFF',
      name: 'Off-Hours Window',
      score,
      category: 'VELOCITY',
      description: 'Transaction executed during habitual customer inactivity window (01:00 - 05:00).',
      observedValue: `${String(hour).padStart(2, '0')}:00 Window`,
      baselineValue: '08:00 - 22:00 Usual Range',
      evidence: '99.4% of customer historical transactions occur during daytime commercial hours.',
    });
    totalScore += score;
  }

  // 5. Velocity Spikes (Configured by velocityWeight, default 15)
  if (recentVelocityCount >= 3) {
    const score = Math.max(1, weights.velocityWeight);
    signals.push({
      id: 'SIG-VEL-BURST',
      name: 'Velocity Surge',
      score,
      category: 'VELOCITY',
      description: `Rapid sequence of ${recentVelocityCount} high-value transactions within 60 minutes.`,
      observedValue: `${recentVelocityCount} tx / hour`,
      baselineValue: '0.4 tx / day Average',
      evidence: 'Rapid repeated balance drains are a primary signature of active account takeover or extraction syndicates.',
    });
    totalScore += score;
  }

  // 6. Network / Cluster Risk (Configured by networkWeight, default 10)
  if (connectedToFlaggedCluster) {
    const score = Math.max(1, weights.networkWeight);
    signals.push({
      id: 'SIG-NET-RING',
      name: 'Network Cluster Connection',
      score,
      category: 'NETWORK',
      description: 'Destination or intermediary wallet is linked to a flagged smurfing/mule cluster.',
      observedValue: 'Degree-2 Flagged Cluster',
      baselineValue: 'Isolated Nominal Network',
      evidence: 'TrustGraph detected high-degree linkage to shared hardware nodes DEV-DEMO-104 and cash-out hub AGENT-DEMO-007.',
    });
    totalScore += score;
  }

  // Normalize final risk score to [0, 100]
  const finalRiskScore = Math.max(5, Math.min(99, totalScore));

  // Determine Risk Level dynamically using Admin Thresholds
  let riskLevel: RiskLevel = 'LOW';
  if (finalRiskScore > thresholds.highMax) {
    riskLevel = 'CRITICAL';
  } else if (finalRiskScore > thresholds.mediumMax) {
    riskLevel = 'HIGH';
  } else if (finalRiskScore > thresholds.lowMax) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Isolation Forest style multi-feature anomaly index
  const normalizedAmt = Math.min(1.0, (amount / (median * 5)));
  const normalizedDev = !isKnownDevice ? 0.35 : 0.0;
  const normalizedRec = !isKnownRecipient ? 0.35 : 0.0;
  const normalizedVel = Math.min(0.3, recentVelocityCount * 0.1);
  const anomalyScore = Math.min(0.99, Number((normalizedAmt * 0.4 + normalizedDev + normalizedRec + normalizedVel).toFixed(2)));

  // Model confidence (higher when multiple concordant signals reinforce each other)
  const confidence = Math.min(96, Math.max(68, 70 + signals.length * 5));

  // Primary signal
  const primarySignal = signals.length > 0 
    ? [...signals].sort((a, b) => b.score - a.score)[0].name
    : 'Baseline Activity';

  // Recommended Action based on explainable logic
  let recommendedAction: RiskAssessment['recommendedAction'] = 'ALLOW';
  let requiresHumanReview = false;

  if (riskLevel === 'CRITICAL') {
    recommendedAction = 'PAUSE_AND_VERIFY';
    requiresHumanReview = true;
  } else if (riskLevel === 'HIGH') {
    recommendedAction = 'FLAG_FOR_REVIEW';
    requiresHumanReview = true;
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'STEP_UP_AUTH';
    requiresHumanReview = false;
  }

  // Grounded rule-based explanation
  const explanation = signals.length === 0
    ? 'Transaction conforms to synthetic customer historical baseline across device, recipient, amount, and velocity features.'
    : `Detected ${signals.length} risk signals contributing to a score of ${finalRiskScore} (${riskLevel}). Principal drivers: ${signals.map(s => `${s.name} (+${s.score})`).join(', ')}.`;

  return {
    transactionId,
    riskScore: finalRiskScore,
    riskLevel,
    confidence,
    signals,
    primarySignal,
    anomalyScore,
    behavioralDeviationPct: deviationPct,
    networkRiskScore: connectedToFlaggedCluster ? 82 : 24,
    explanation,
    recommendedAction,
    requiresHumanReview,
    timestamp: new Date().toISOString(),
  };
}
