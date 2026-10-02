/**
 * Upay Sentinel AI - Behavioral DNA Component (Premium White Theme)
 * Compares current observed event against customer's synthetic historical baseline
 * DIU CPC × upay AI Hackathon 2026
 */

import React from 'react';
import { Dna, Smartphone, UserCheck, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { BehavioralDNA } from '../../types';

interface BehavioralDNACardProps {
  dna: BehavioralDNA;
  currentAmount?: number;
  currentDeviceId?: string;
  currentRecipientId?: string;
  currentTimestamp?: string;
}

export const BehavioralDNACard: React.FC<BehavioralDNACardProps> = ({
  dna,
  currentAmount,
  currentDeviceId,
  currentRecipientId,
}) => {
  const isAmountAnomalous = currentAmount && currentAmount > dna.recentMedianAmount * 2;
  const isDeviceNew = currentDeviceId && !dna.knownDevices.includes(currentDeviceId);
  const isRecipientNew = currentRecipientId && !dna.knownRecipients.includes(currentRecipientId);
  const deviation = currentAmount
    ? Math.round(((currentAmount - dna.recentMedianAmount) / dna.recentMedianAmount) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 text-xs text-slate-700 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Customer Behavioral DNA</h4>
            <span className="text-[11px] text-slate-500">Calculated over {dna.accountAgeDays} recorded days</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Baseline Profile Score</span>
          <span className="font-mono text-sm font-bold text-sky-700">{dna.profileRiskScore} / 100</span>
        </div>
      </div>

      {/* Primary Baseline Comparisons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3 rounded-lg border ${isAmountAnomalous ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200/80'}`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Recent Median</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
            ৳{dna.recentMedianAmount.toLocaleString()}
          </div>
          {currentAmount && (
            <div className={`text-[10px] mt-1 font-semibold ${isAmountAnomalous ? 'text-rose-600' : 'text-slate-500'}`}>
              Current: ৳{currentAmount.toLocaleString()} ({deviation > 0 ? `+${deviation}%` : `${deviation}%`})
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Active Hours</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
            {dna.activeHoursStart}:00 – {dna.activeHoursEnd}:00
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Normal daylight diurnal pattern</div>
        </div>

        <div className={`p-3 rounded-lg border ${isDeviceNew ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200/80'}`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Known Devices</span>
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
            {dna.knownDevices.length} Handset{dna.knownDevices.length > 1 ? 's' : ''}
          </div>
          <div className={`text-[10px] mt-1 font-semibold truncate ${isDeviceNew ? 'text-amber-700' : 'text-slate-500'}`}>
            {currentDeviceId ? (isDeviceNew ? `New Device (${currentDeviceId})` : 'Known Device') : dna.knownDevices[0]}
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${isRecipientNew ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200/80'}`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Counterparties</span>
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
            {dna.knownRecipients.length} Recipient{dna.knownRecipients.length > 1 ? 's' : ''}
          </div>
          <div className={`text-[10px] mt-1 font-semibold ${isRecipientNew ? 'text-amber-700' : 'text-slate-500'}`}>
            {currentRecipientId ? (isRecipientNew ? 'Novel Recipient' : 'Trusted Counterparty') : 'High-trust circle'}
          </div>
        </div>
      </div>

      {/* Deviation Highlight Banner if Anomaly Exists */}
      {(isAmountAnomalous || isDeviceNew || isRecipientNew) && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-900 block">Behavioral Deviation Detected</span>
            Observed transaction departs significantly from synthetic baseline bounds:
            {isAmountAnomalous && ` Amount is +${deviation}% above historical median.`}
            {isDeviceNew && ' Session initiated on an unfamiliar hardware identifier.'}
            {isRecipientNew && ' First-ever fund movement to target destination wallet.'}
          </div>
        </div>
      )}
    </div>
  );
};
