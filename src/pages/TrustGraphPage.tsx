/**
 * Upay Sentinel AI - TrustGraph Page (Next-Gen Topological Intelligence)
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import {
  Share2,
  ShieldAlert,
  Info,
  Network,
  RotateCcw,
  Sparkles,
  Zap,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { TrustGraphCanvas } from '../components/graph/TrustGraphCanvas';
import { GraphData, GraphNode } from '../types';

interface TrustGraphPageProps {
  onNavigate: (path: string) => void;
  targetEntityId?: string;
}

export const TrustGraphPage: React.FC<TrustGraphPageProps> = ({
  onNavigate,
  targetEntityId,
}) => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadGraph();
  }, [targetEntityId]);

  const loadGraph = async (clusterId?: string) => {
    setLoading(true);
    setActiveCluster(clusterId || null);
    try {
      const res = await api.getGraph({
        entityId: targetEntityId,
        clusterId,
      });
      setGraphData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-4 pb-12 text-xs text-slate-800">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Title & Preset Scenarios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">TrustGraph Network Intelligence</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              TOPOLOGICAL INTELLIGENCE
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Interactive relationship graph connecting customers, devices, transactions, recipients, and cash-out agents.
          </p>
        </div>

        {/* Quick Cluster Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 text-[11px] hidden md:inline font-medium">Quick Presets:</span>
          <button
            onClick={() => loadGraph('CLUSTER-SMURF-904')}
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-colors flex items-center gap-1.5 ${
              activeCluster === 'CLUSTER-SMURF-904'
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mule Extraction Ring</span>
          </button>
          <button
            onClick={() => loadGraph()}
            className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors shadow-2xs ${
              !activeCluster
                ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            Show Full Network
          </button>
        </div>
      </div>

      {/* Network Stats Bar */}
      {graphData && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-slate-400 text-[10px] font-semibold block">TOTAL NODES</span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">{graphData.summary.totalNodes}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-slate-400 text-[10px] font-semibold block">TRANSACTION LINKS</span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">{graphData.summary.totalLinks}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 shadow-xs">
            <span className="text-rose-700 text-[10px] block font-bold">FLAGGED ENTITIES</span>
            <span className="font-mono text-xl font-black text-rose-700 tabular-nums">{graphData.summary.flaggedNodes}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs">
            <span className="text-amber-700 text-[10px] block font-bold">SUSPICIOUS RINGS</span>
            <span className="font-mono text-xl font-bold text-amber-700 tabular-nums">{graphData.summary.suspiciousClusters}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-slate-400 text-[10px] font-semibold block">NETWORK DENSITY</span>
            <span className="font-mono text-xl font-bold text-sky-700 tabular-nums">{graphData.summary.networkDensity}</span>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport */}
      {loading || !graphData ? (
        <div className="h-[640px] rounded-2xl border border-slate-200/90 bg-white flex flex-col items-center justify-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-400">Computing topological eigenvalues and network clusters...</p>
        </div>
      ) : (
        <TrustGraphCanvas
          data={graphData}
          onSelectNode={node => setSelectedNode(node)}
          selectedNodeId={selectedNode?.id || targetEntityId}
          height="640px"
          onActionNotice={handleActionNotice}
        />
      )}

      {/* Methodology Guide */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-sky-700 font-bold">
          <Info className="w-4 h-4" />
          <span>TrustGraph Topological Defense Architecture</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <strong className="text-slate-900 block mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Rapid Dispersion Chains (Smurfing)
            </strong>
            Identifies intermediary accounts transferring funds within 10 minutes of arrival without habitual holding periods, typical of automated cash extraction syndicates.
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <strong className="text-slate-900 block mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              Shared Emulator Hardware Fingerprinting
            </strong>
            Detects multiple synthetic customer accounts authenticating from the identical hardware identifier (`DEV-DEMO-104`) with zero typing delay cadence.
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <strong className="text-slate-900 block mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              Outlier Cash-Out Terminal Concentration
            </strong>
            Measures outlier cash-out velocity and volume ratios at agent terminals (`AGENT-DEMO-007`) compared to regional geographic medians.
          </div>
        </div>
      </div>
    </div>
  );
};
