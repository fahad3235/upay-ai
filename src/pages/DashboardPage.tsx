/**
 * Upay Sentinel AI - Analyst Command Center / Overview
 * Pixel-perfect redesign matching Image 5 from user specifications
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Flag,
  Shield,
  Briefcase,
  Gauge,
  FlaskConical,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Activity,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onTriggerDemoScenario: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
}) => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('7D');
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.getTransactions({ limit: 6, riskLevel: 'HIGH' });
      setRecentTransactions(res.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Sparkline SVG helper
  const renderSparkline = (color: string, pathD: string) => (
    <svg className="w-20 h-6 overflow-visible" viewBox="0 0 80 24" fill="none">
      <path d={pathD} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // Dynamic Activity Data based on selected time range
  const activityData: Record<
    '24H' | '7D' | '30D',
    {
      subtitle: string;
      data: Array<{ label: string; total: number; flagged: number }>;
    }
  > = {
    '24H': {
      subtitle: 'Hourly monitored transactions vs flagged events (past 24 hours)',
      data: [
        { label: '00:00', total: 18, flagged: 2 },
        { label: '03:00', total: 11, flagged: 1 },
        { label: '06:00', total: 15, flagged: 1 },
        { label: '09:00', total: 46, flagged: 6 },
        { label: '12:00', total: 68, flagged: 10 },
        { label: '15:00', total: 72, flagged: 12 },
        { label: '18:00', total: 54, flagged: 9 },
        { label: '21:00', total: 29, flagged: 6 },
      ],
    },
    '7D': {
      subtitle: 'Daily monitored transactions vs flagged events (past 7 days)',
      data: [
        { label: 'Sep 26', total: 42, flagged: 6 },
        { label: 'Sep 27', total: 40, flagged: 8 },
        { label: 'Sep 28', total: 38, flagged: 5 },
        { label: 'Sep 29', total: 28, flagged: 4 },
        { label: 'Sep 30', total: 48, flagged: 11 },
        { label: 'Oct 01', total: 82, flagged: 22 },
        { label: 'Oct 02', total: 35, flagged: 9 },
      ],
    },
    '30D': {
      subtitle: 'Periodic transaction volume trends across the past 30 days',
      data: [
        { label: 'Sep 03', total: 112, flagged: 14 },
        { label: 'Sep 06', total: 134, flagged: 19 },
        { label: 'Sep 09', total: 128, flagged: 15 },
        { label: 'Sep 12', total: 145, flagged: 21 },
        { label: 'Sep 15', total: 160, flagged: 28 },
        { label: 'Sep 18', total: 142, flagged: 18 },
        { label: 'Sep 21', total: 155, flagged: 24 },
        { label: 'Sep 24', total: 178, flagged: 32 },
        { label: 'Sep 27', total: 164, flagged: 26 },
        { label: 'Sep 30', total: 192, flagged: 38 },
        { label: 'Oct 02', total: 118, flagged: 20 },
      ],
    },
  };

  const currentActivity = activityData[timeRange];
  const maxActivityTotal = Math.max(...currentActivity.data.map(d => d.total), 1);

  return (
    <div className="space-y-6 pb-12 font-sans select-none text-slate-800">
      {/* Page Title & Subtitle */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good evening, Sentinel Admin
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-semibold tracking-wider font-mono">
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span>SYNTHETIC DEMO</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Here's your risk picture at a glance — every figure below is synthetic demo data.
        </p>
      </div>

      {/* Row 1: 5 KPI Stat Cards in a row (Matching Image 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: TOTAL TRANSACTIONS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              TOTAL TRANSACTIONS
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {timeRange === '30D' ? '1,528' : '313'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                {timeRange === '24H' ? '+14.2% vs prev. 24h' : timeRange === '7D' ? '+0.0% vs prev. 7d' : '+24.5% vs prev. 30d'}
              </span>
              {renderSparkline('#3b82f6', 'M 0 18 Q 20 22, 35 12 T 60 8 T 80 14')}
            </div>
          </div>
        </div>

        {/* Card 2: FLAGGED TRANSACTIONS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              FLAGGED TRANSACTIONS
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {timeRange === '24H' ? '47' : timeRange === '7D' ? '155' : '232'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                {timeRange === '24H' ? '+4.2% vs prev. 24h' : timeRange === '7D' ? '+0.0% vs prev. 7d' : '+18.1% vs prev. 30d'}
              </span>
              {renderSparkline('#f43f5e', 'M 0 16 Q 15 8, 30 18 T 55 10 T 80 20')}
            </div>
          </div>
        </div>

        {/* Card 3: HIGH / CRITICAL RISK */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              HIGH / CRITICAL RISK
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {timeRange === '30D' ? '84' : '39'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                {timeRange === '24H' ? '+0.0% vs prev. 24h' : timeRange === '7D' ? '+0.0% vs prev. 7d' : '+7.6% vs prev. 30d'}
              </span>
              {renderSparkline('#f43f5e', 'M 0 18 Q 20 8, 40 18 T 60 12 T 80 22')}
            </div>
          </div>
        </div>

        {/* Card 4: OPEN INVESTIGATIONS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              OPEN INVESTIGATIONS
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">3</div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                +0.0% vs prev. period
              </span>
              {renderSparkline('#10b981', 'M 0 16 L 80 16')}
            </div>
          </div>
        </div>

        {/* Card 5: AVERAGE RISK SCORE */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
              AVERAGE RISK SCORE
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {timeRange === '24H' ? '32.3' : timeRange === '7D' ? '31.8' : '33.5'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                {timeRange === '24H' ? '-19.1% vs prev. 24h' : timeRange === '7D' ? '-21.4% vs prev. 7d' : '-14.0% vs prev. 30d'}
              </span>
              {renderSparkline('#10b981', 'M 0 18 Q 25 18, 45 10 T 80 6')}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Transaction Activity & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transaction Activity Bar Chart (2/3 width) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transaction Activity</h3>
                <p className="text-xs text-slate-400">{currentActivity.subtitle}</p>
              </div>

              {/* Time Toggle Pills */}
              <div className="flex items-center p-1 bg-slate-100 rounded-full w-fit">
                {(['24H', '7D', '30D'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTimeRange(tab)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      timeRange === tab
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Bar Chart Canvas / SVG with Dynamic Heights and Hover Tooltip */}
            <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-100">
              {currentActivity.data.map((col, idx) => {
                const heightPct = Math.max(14, Math.round((col.total / maxActivityTotal) * 100));
                const flaggedPct = Math.round((col.flagged / col.total) * 100);
                const normalCount = col.total - col.flagged;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover Floating Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-xl shadow-xl whitespace-nowrap space-y-0.5 border border-slate-700">
                      <div className="font-bold text-slate-100 flex items-center justify-between gap-2">
                        <span>{col.label}</span>
                        <span className="text-slate-400 font-mono">Total: {col.total}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="flex items-center gap-1 text-blue-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
                          Normal: {normalCount}
                        </span>
                        <span className="flex items-center gap-1 text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block"></span>
                          Flagged: {col.flagged} ({flaggedPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Bar Wrapper */}
                    <div className="w-full max-w-[42px] flex items-end justify-center h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-blue-100 hover:bg-blue-200 rounded-t-md transition-all duration-300 relative flex items-start justify-center cursor-pointer shadow-2xs"
                      >
                        {/* Flagged portion at bottom of bar */}
                        <div
                          style={{ height: `${flaggedPct}%` }}
                          className="w-full bg-rose-400/90 hover:bg-rose-500 rounded-t-xs rounded-b-md absolute bottom-0 transition-all duration-300"
                        ></div>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-3 font-medium tracking-tight">
                      {col.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Normal Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Flagged / Suspicious</span>
            </div>
            <div className="ml-auto text-[11px] text-slate-400 font-mono hidden sm:block">
              Hover bars for detailed telemetry
            </div>
          </div>
        </div>

        {/* Right: Risk Distribution Donut Chart (1/3 width) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Risk Distribution</h3>
            <p className="text-xs text-slate-400 mb-6">All monitored transactions by risk band</p>

            {/* Donut Chart with Center Text */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                {/* Low Segment: 50.5% (approx 120 of 238 circumference) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#86efac"
                  strokeWidth="12"
                  strokeDasharray="120 238"
                  strokeDashoffset="0"
                  fill="none"
                />
                {/* Medium Segment: 37.1% (approx 88 of 238) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#fde047"
                  strokeWidth="12"
                  strokeDasharray="88 238"
                  strokeDashoffset="-120"
                  fill="none"
                />
                {/* High Segment: 11.2% (approx 26 of 238) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#fdba74"
                  strokeWidth="12"
                  strokeDasharray="26 238"
                  strokeDashoffset="-208"
                  fill="none"
                />
                {/* Critical Segment: 1.3% (approx 4 of 238) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#f87171"
                  strokeWidth="12"
                  strokeDasharray="4 238"
                  strokeDashoffset="-234"
                  fill="none"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  313
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  TRANSACTIONS
                </span>
              </div>
            </div>
          </div>

          {/* Donut Legend List */}
          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-600 font-medium">Low 50.5%</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">158</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-600 font-medium">Medium 37.1%</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">116</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                <span className="text-slate-600 font-medium">High 11.2%</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">35</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600 font-medium">Critical 1.3%</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent High-Risk Activity & System Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent High-Risk Activity Table (2/3 width) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent High-Risk Activity</h3>
              <p className="text-xs text-slate-400">Transactions scoring HIGH or CRITICAL, newest first</p>
            </div>
            <button
              onClick={() => onNavigate('/transactions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">CUSTOMER</th>
                  <th className="py-2.5 px-3">AMOUNT</th>
                  <th className="py-2.5 px-3">RISK</th>
                  <th className="py-2.5 px-3">TIME</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { id: 'TX-DEMO-ATO', customer: 'Karim Sarkar', amount: '৳18,500', risk: 86, level: 'HIGH', time: '16:12', status: 'Quarantined' },
                  { id: 'TX-DEMO-290', customer: 'Tanvir Rahman', amount: '৳15,000', risk: 88, level: 'CRITICAL', time: '15:45', status: 'Blocked' },
                  { id: 'TX-DEMO-283', customer: 'Mehedi Hasan', amount: '৳24,500', risk: 78, level: 'HIGH', time: '14:20', status: 'Flagged' },
                  { id: 'TX-DEMO-238', customer: 'Liton Begum', amount: '৳27,675', risk: 58, level: 'MEDIUM', time: '13:47', status: 'Completed' },
                  { id: 'TX-DEMO-243', customer: 'Ferdous Molla', amount: '৳33,121', risk: 40, level: 'MEDIUM', time: '12:03', status: 'Completed' },
                ].map(row => (
                  <tr
                    key={row.id}
                    onClick={() => onNavigate(`/transactions`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{row.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{row.customer}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{row.amount}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.level === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700'
                            : row.level === 'HIGH'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {row.risk} pts
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{row.time}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Intelligence Signals Card (1/3 width) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Intelligence</h3>
            <p className="text-xs text-slate-400 mb-5">Behavioral signals across the network</p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Behavioral anomaly signals</div>
                    <div className="text-[10px] text-slate-400">Velocity & amount deviations</div>
                  </div>
                </div>
                <span className="text-base font-black text-slate-900 font-mono">786</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Active Smurfing Clusters</div>
                    <div className="text-[10px] text-slate-400">Multi-wallet syndicates</div>
                  </div>
                </div>
                <span className="text-base font-black text-slate-900 font-mono">4</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hardware Emulators</div>
                    <div className="text-[10px] text-slate-400">Rooted device signatures</div>
                  </div>
                </div>
                <span className="text-base font-black text-slate-900 font-mono">12</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('/trustgraph')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Dynamic TrustGraph</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
