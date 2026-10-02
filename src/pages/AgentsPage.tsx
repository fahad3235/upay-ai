/**
 * Upay Sentinel AI - Agent Monitoring & Surveillance
 * Monitors cash-out ratios and peer deviations
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { Agent } from '../types';

interface AgentsPageProps {
  onNavigate: (path: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ onNavigate }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await api.getAgents();
      setAgents(res.agents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = agents.filter(
    a => a.id.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-display">Agent Monitoring & Risk Surveillance</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              PEER BENCHMARKING
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Monitors cash-out vs cash-in ratios and regional cluster deviations to detect potential mule aggregation points.
          </p>
        </div>

        <div className="text-slate-400 font-mono text-xs">
          Monitored Agents: <strong className="text-white font-bold">{agents.length}</strong>
        </div>
      </div>

      {/* Responsible Wording Callout */}
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          Compliance Notice: Flagged agent patterns indicate statistical peer variance requiring operational review; they do not constitute proof of criminal misconduct.
        </span>
      </div>

      {/* Agents Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold text-[11px]">
                <th className="py-2.5 px-3">AGENT ID</th>
                <th className="py-2.5 px-3">AGENT OUTLET NAME</th>
                <th className="py-2.5 px-3">LOCATION</th>
                <th className="py-2.5 px-3">DAILY CASH-OUT</th>
                <th className="py-2.5 px-3">CASH-OUT RATIO</th>
                <th className="py-2.5 px-3">PEER DEVIATION</th>
                <th className="py-2.5 px-3">SURVEILLANCE STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading agent network...
                  </td>
                </tr>
              ) : (
                filtered.map(a => {
                  const isSuspicious = a.status === 'REQUIRES_REVIEW' || a.id === 'AGENT-DEMO-007';
                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSuspicious ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        {a.id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">
                        {a.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {a.location}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white tabular-nums">
                        ৳{a.dailyCashOutVolume.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {(a.cashOutRatio * 100).toFixed(0)}% Outbound
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono font-bold ${
                            a.peerDeviationPct > 100 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {a.peerDeviationPct > 0 ? `+${a.peerDeviationPct}%` : `${a.peerDeviationPct}%`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status === 'REQUIRES_REVIEW'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigate(`/agents/${a.id}`)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 font-semibold text-[11px] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AgentDetailPage: React.FC<{ agentId: string; onNavigate: (path: string) => void }> = ({
  agentId,
  onNavigate,
}) => {
  const [data, setData] = useState<{ agent: Agent; relatedTransactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  const loadAgent = async () => {
    setLoading(true);
    try {
      const res = await api.getAgent(agentId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data?.agent) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Loading agent dossier...</p>
      </div>
    );
  }

  const { agent: a, relatedTransactions } = data;

  return (
    <div className="space-y-5 pb-16 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={() => onNavigate('/agents')}
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Back to Agents
        </button>

        <button
          onClick={() => onNavigate('/trustgraph')}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs"
        >
          View in TrustGraph Topology
        </button>
      </div>

      <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-display">{a.name}</h1>
            <span className="font-mono text-cyan-400 font-bold">{a.id}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
              {a.status}
            </span>
          </div>
          <div className="text-slate-400 text-xs">{a.location} · Contact: {a.phoneMasked}</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 block">DAILY CASH-OUT DISBURSED</span>
          <span className="font-mono text-2xl font-black text-white tabular-nums">
            ৳{a.dailyCashOutVolume.toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-400 block mt-0.5">
            +{a.peerDeviationPct}% vs Savar regional peer median
          </span>
        </div>
      </div>

      {/* Anomaly Observation Notes */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
        <h4 className="font-bold text-sm text-white">Statistical Observation Log</h4>
        <div className="space-y-2 text-xs">
          {a.anomalyNotes.map((note, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2">
              <span className="font-mono text-rose-400 font-bold">•</span>
              <span className="text-slate-300">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
