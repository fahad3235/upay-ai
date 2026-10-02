/**
 * Upay Sentinel AI - Next-Gen TrustGraph Canvas Visualizer
 * Interactive physics, draggable nodes, animated directional particle flow,
 * multi-hop spotlighting, cluster halos, and instant analyst enforcement drawer.
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Search,
  X,
  ArrowRight,
  Laptop,
  User,
  CreditCard,
  Store,
  Building2,
  Sparkles,
  Lock,
  Play,
  Pause,
  ExternalLink,
  Target,
  Activity,
  Layers,
} from 'lucide-react';
import { GraphData, GraphNode, GraphEntityType } from '../../types';

interface TrustGraphCanvasProps {
  data: GraphData;
  onSelectNode?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
  height?: number | string;
  onActionNotice?: (msg: string) => void;
}

export const TrustGraphCanvas: React.FC<TrustGraphCanvasProps> = ({
  data,
  onSelectNode,
  selectedNodeId: propSelectedNodeId,
  height = '640px',
  onActionNotice,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [highlightSuspiciousOnly, setHighlightSuspiciousOnly] = useState(false);
  const [animationFlow, setAnimationFlow] = useState<'NORMAL' | 'FAST' | 'OFF'>('FAST');
  const [searchTerm, setSearchTerm] = useState('');
  const [frozenEntities, setFrozenEntities] = useState<Set<string>>(new Set());
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Dragging individual nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync internal selected node with props
  useEffect(() => {
    if (propSelectedNodeId) {
      const found = data.nodes.find(n => n.id === propSelectedNodeId);
      if (found) setSelectedNode(found);
    }
  }, [propSelectedNodeId, data.nodes]);

  // Compute organic 2D cluster layout
  const positionedNodes = useMemo(() => {
    const width = 940;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const activeNodes = data.nodes.filter(n => {
      if (entityFilter !== 'ALL' && n.type !== entityFilter) return false;
      if (riskFilter === 'HIGH_CRITICAL' && n.riskLevel !== 'HIGH' && n.riskLevel !== 'CRITICAL') return false;
      if (riskFilter === 'LOW' && n.riskLevel !== 'LOW') return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return n.id.toLowerCase().includes(q) || n.name.toLowerCase().includes(q);
      }
      return true;
    });

    return activeNodes.map((node, i) => {
      // If user has custom-dragged this node, prioritize custom coordinate
      if (nodePositions[node.id]) {
        return {
          ...node,
          x: nodePositions[node.id].x,
          y: nodePositions[node.id].y,
        };
      }

      let x = centerX;
      let y = centerY;

      if (node.clusterId === 'CLUSTER-SMURF-904') {
        // Prominent horizontal dispersion chain across center
        if (node.id === 'CUS-DEMO-1042') { x = centerX - 280; y = centerY - 30; }
        else if (node.id === 'DEV-DEMO-104') { x = centerX - 280; y = centerY + 120; }
        else if (node.id === 'WALLET-DEMO-809') { x = centerX - 100; y = centerY - 60; }
        else if (node.id === 'WALLET-DEMO-810') { x = centerX - 100; y = centerY + 60; }
        else if (node.id === 'WALLET-DEMO-811') { x = centerX + 100; y = centerY - 10; }
        else if (node.id === 'AGENT-DEMO-007') { x = centerX + 280; y = centerY - 10; }
        else {
          const angle = (i / 10) * Math.PI * 2;
          x = centerX + Math.cos(angle) * 160;
          y = centerY + Math.sin(angle) * 120;
        }
      } else if (node.id === 'DEV-DEMO-101') {
        x = centerX - 380;
        y = centerY - 150;
      } else if (node.id === 'CUS-DEMO-1002') {
        x = centerX - 360;
        y = centerY + 50;
      } else if (node.id === 'MERCHANT-DEMO-004') {
        x = centerX - 180;
        y = centerY - 180;
      } else {
        const angle = (i / (activeNodes.length || 1)) * Math.PI * 2;
        const radius = 240 + (i % 4) * 35;
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * (radius * 0.75);
      }

      return {
        ...node,
        x,
        y,
      };
    });
  }, [data.nodes, entityFilter, riskFilter, searchTerm, nodePositions]);

  const nodeMap = useMemo(() => new Map(positionedNodes.map(n => [n.id, n])), [positionedNodes]);

  const activeLinks = useMemo(() => {
    return data.links
      .map(link => {
        const sourceNode = nodeMap.get(link.source);
        const targetNode = nodeMap.get(link.target);
        if (!sourceNode || !targetNode) return null;
        return {
          ...link,
          sourceNode,
          targetNode,
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null)
      .filter(l => {
        if (highlightSuspiciousOnly && !l.isSuspicious) return false;
        return true;
      });
  }, [data.links, nodeMap, highlightSuspiciousOnly]);

  // Spotlight graph connections for hovered or selected node
  const activeFocusId = selectedNode?.id || hoveredNodeId;

  const connectedNodesSet = useMemo(() => {
    if (!activeFocusId) return null;
    const set = new Set<string>([activeFocusId]);
    data.links.forEach(l => {
      if (l.source === activeFocusId) set.add(l.target);
      if (l.target === activeFocusId) set.add(l.source);
    });
    return set;
  }, [activeFocusId, data.links]);

  // Mouse pan & node drag handling
  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (draggingNodeId) return; // Node drag active
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleSvgMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      // Convert to SVG space
      const svgX = (mouseX - pan.x) / zoom;
      const svgY = (mouseY - pan.y) / zoom;

      setNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: { x: Math.round(svgX), y: Math.round(svgY) },
      }));
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [draggingNodeId, isPanning, pan.x, pan.y, panStart, zoom]);

  const handleSvgMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Zoom and Camera Controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.45));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    setHoveredNodeId(null);
    if (onSelectNode) onSelectNode(null);
  };

  const handleFocusSmurfRing = () => {
    setZoom(1.35);
    setPan({ x: -130, y: -70 });
    const targetNode = data.nodes.find(n => n.id === 'CUS-DEMO-1042');
    if (targetNode) {
      setSelectedNode(targetNode);
      if (onSelectNode) onSelectNode(targetNode);
    }
  };

  const handleFocusCashOutAgent = () => {
    setZoom(1.6);
    setPan({ x: -360, y: -100 });
    const agent = data.nodes.find(n => n.id === 'AGENT-DEMO-007');
    if (agent) {
      setSelectedNode(agent);
      if (onSelectNode) onSelectNode(agent);
    }
  };

  const selectNode = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  // Action Drawer Enforcement
  const handleToggleFreeze = (entityId: string) => {
    const isFrozen = frozenEntities.has(entityId);
    setFrozenEntities(prev => {
      const next = new Set(prev);
      if (isFrozen) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });

    const msg = isFrozen
      ? `RESTORED: Restriction lifted on ${entityId}.`
      : `SECURITY HOLD: Wallet ${entityId} suspended & outbound ledger frozen.`;
    setActionSuccessMsg(msg);
    if (onActionNotice) onActionNotice(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const renderEntityIcon = (type: GraphEntityType) => {
    switch (type) {
      case 'CUSTOMER': return <User className="w-3.5 h-3.5" />;
      case 'DEVICE': return <Laptop className="w-3.5 h-3.5" />;
      case 'WALLET': return <CreditCard className="w-3.5 h-3.5" />;
      case 'AGENT': return <Building2 className="w-3.5 h-3.5" />;
      case 'MERCHANT': return <Store className="w-3.5 h-3.5" />;
      default: return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  const getNodeColor = (node: GraphNode) => {
    if (frozenEntities.has(node.id)) {
      return { fill: '#475569', stroke: '#1e293b', glow: 'rgba(71, 85, 105, 0.4)' };
    }
    if (node.riskLevel === 'CRITICAL') return { fill: '#e11d48', stroke: '#be123c', glow: 'rgba(225, 29, 72, 0.35)' };
    if (node.riskLevel === 'HIGH') return { fill: '#ea580c', stroke: '#c2410c', glow: 'rgba(234, 88, 12, 0.3)' };
    if (node.riskLevel === 'MEDIUM') return { fill: '#d97706', stroke: '#b45309', glow: 'rgba(217, 119, 6, 0.25)' };
    return { fill: '#0284c7', stroke: '#0369a1', glow: 'rgba(2, 132, 199, 0.2)' };
  };

  return (
    <div
      className="relative w-full rounded-2xl border border-slate-200/90 bg-slate-900/5 shadow-xs overflow-hidden select-none"
      style={{ height }}
    >
      {/* Top Floating Control Deck */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search node ID or name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white w-44 md:w-52"
            />
          </div>

          {/* Entity Filters */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
            {['ALL', 'CUSTOMER', 'DEVICE', 'WALLET', 'AGENT'].map(type => (
              <button
                key={type}
                onClick={() => setEntityFilter(type)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  entityFilter === type ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Quick Camera Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFocusSmurfRing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-[11px] transition-colors"
              title="Jump camera to 7-Minute ATO Mule Ring"
            >
              <Target className="w-3 h-3 text-rose-600" />
              <span>Smurf Ring</span>
            </button>
            <button
              onClick={handleFocusCashOutAgent}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-[11px] transition-colors"
              title="Jump camera to Agent 007 Cash-Out Hub"
            >
              <Building2 className="w-3 h-3 text-amber-600" />
              <span>Cash-Out Hub</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Animated Particle Flow Toggle */}
          <button
            onClick={() => {
              setAnimationFlow(prev => (prev === 'FAST' ? 'NORMAL' : prev === 'NORMAL' ? 'OFF' : 'FAST'));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs"
            title="Toggle money trail animation speed"
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-mono text-[11px]">Flow: {animationFlow}</span>
          </button>

          {/* Highlight Suspicious Only */}
          <button
            onClick={() => setHighlightSuspiciousOnly(!highlightSuspiciousOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors ${
              highlightSuspiciousOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Suspicious Only</span>
          </button>

          {/* Zoom & Reset */}
          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 divide-x divide-slate-200">
            <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleReset} title="Reset View" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Notice Toast */}
      {actionSuccessMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main SVG Graph Surface */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-[#f8fafc]"
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
      >
        <defs>
          <marker id="arrow-nominal" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-suspicious" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e11d48" />
          </marker>
          <marker id="arrow-selected" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
          </marker>

          {/* Soft Danger Glow Filter */}
          <filter id="glow-danger" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background cluster region for CLUSTER-SMURF-904 */}
          <rect
            x="160"
            y="200"
            width="600"
            height="195"
            rx="20"
            fill="rgba(225, 29, 72, 0.035)"
            stroke="rgba(225, 29, 72, 0.28)"
            strokeDasharray="5 5"
          />
          <text x="180" y="226" fill="#be123c" fontSize="11" fontWeight="800" className="tracking-wide">
            SYNTHETIC CLUSTER: CLUSTER-SMURF-904 (Mule Dispersion & Cash-Out Ring)
          </text>

          {/* Links / Edges */}
          {activeLinks.map(link => {
            const isSuspicious = link.isSuspicious;
            const isSelected = selectedNode && (link.source === selectedNode.id || link.target === selectedNode.id);
            const isHovered = hoveredNodeId && (link.source === hoveredNodeId || link.target === hoveredNodeId);
            const isDimmed = activeFocusId && !(link.source === activeFocusId || link.target === activeFocusId);

            // Determine flow animation class
            let strokeClass = 'transition-all duration-200';
            if (animationFlow !== 'OFF') {
              if (isSuspicious) {
                strokeClass += ' graph-edge-flow-fast';
              } else if (animationFlow === 'FAST' || isSelected) {
                strokeClass += ' graph-edge-flow';
              }
            }

            const strokeColor = isSuspicious
              ? '#e11d48'
              : (isSelected || isHovered)
              ? '#0284c7'
              : '#cbd5e1';

            const strokeWidth = (isSelected || isHovered) ? 2.8 : (isSuspicious ? 2.2 : 1.3);

            return (
              <g key={link.id} opacity={isDimmed ? 0.18 : 1.0}>
                {/* Visual line */}
                <line
                  x1={link.sourceNode.x}
                  y1={link.sourceNode.y}
                  x2={link.targetNode.x}
                  y2={link.targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={
                    isSuspicious
                      ? 'url(#arrow-suspicious)'
                      : (isSelected || isHovered)
                      ? 'url(#arrow-selected)'
                      : 'url(#arrow-nominal)'
                  }
                  className={strokeClass}
                />

                {/* Amount or relation badge on link */}
                {link.amount && (
                  <g
                    transform={`translate(${
                      (link.sourceNode.x + link.targetNode.x) / 2
                    }, ${(link.sourceNode.y + link.targetNode.y) / 2})`}
                  >
                    <rect
                      x="-28"
                      y="-16"
                      width="56"
                      height="15"
                      rx="4"
                      fill={isSuspicious ? '#fff1f2' : '#ffffff'}
                      stroke={isSuspicious ? '#fda4af' : '#e2e8f0'}
                      strokeWidth="1"
                    />
                    <text
                      y="-5"
                      fill={isSuspicious ? '#be123c' : '#475569'}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none"
                    >
                      ৳{link.amount >= 1000 ? `${(link.amount / 1000).toFixed(1)}k` : link.amount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {positionedNodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodesSet ? connectedNodesSet.has(node.id) : true;
            const isFrozen = frozenEntities.has(node.id);
            const colors = getNodeColor(node);
            const radius = node.type === 'AGENT' ? 23 : (node.type === 'CUSTOMER' ? 21 : 19);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                opacity={connectedNodesSet && !isConnected ? 0.22 : 1.0}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onMouseDown={e => {
                  e.stopPropagation();
                  setDraggingNodeId(node.id);
                }}
                onClick={e => {
                  e.stopPropagation();
                  selectNode(node);
                }}
                className="cursor-pointer group transition-opacity duration-200"
              >
                {/* Outer Selection Ring */}
                {isSelected && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Pulsing Risk Halo for High/Critical Nodes */}
                {(node.riskLevel === 'HIGH' || node.riskLevel === 'CRITICAL') && !isFrozen && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="2"
                    className={node.riskLevel === 'CRITICAL' ? 'halo-danger' : 'halo-warning'}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radius}
                  fill={colors.fill}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter={node.riskLevel === 'CRITICAL' ? 'url(#glow-danger)' : undefined}
                  className="transition-transform duration-150 group-hover:scale-110 shadow-md"
                />

                {/* Node Center Icon / Score */}
                {isFrozen ? (
                  <g transform="translate(-7, -7)">
                    <Lock className="w-3.5 h-3.5 text-white" />
                  </g>
                ) : (
                  <text
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {node.riskScore}
                  </text>
                )}

                {/* Node Label Below */}
                <text
                  y={radius + 15}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="800"
                  className="pointer-events-none drop-shadow-xs"
                >
                  {node.id}
                </text>

                {/* Secondary description */}
                <text
                  y={radius + 27}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9.5"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {isFrozen ? '[FROZEN]' : (node.name.length > 18 ? `${node.name.substring(0, 16)}...` : node.name)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Status Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm text-[11px] text-slate-700">
        <span className="font-bold text-slate-900">Topology Guide:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-200"></span>
          <span>Critical Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
          <span>Nominal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          <span>Frozen</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 font-medium">Drag any node to untangle • Click to inspect</span>
      </div>

      {/* Selected Entity Action Drawer */}
      {selectedNode && (
        <div className="absolute top-16 right-3 bottom-3 w-84 z-20 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 p-4 shadow-2xl flex flex-col text-xs text-slate-700 animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                {renderEntityIcon(selectedNode.type)}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{selectedNode.type}</span>
                <h4 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-1.5">
                  {selectedNode.id}
                  {frozenEntities.has(selectedNode.id) && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-white font-sans font-bold">
                      FROZEN
                    </span>
                  )}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-3.5 flex-1 overflow-y-auto">
            {/* Risk Assessment Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Risk Score</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedNode.riskLevel === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 border border-rose-300'
                      : selectedNode.riskLevel === 'HIGH'
                      ? 'bg-orange-50 text-orange-700 border border-orange-300'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}
                >
                  {selectedNode.riskScore} / 100 ({selectedNode.riskLevel})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedNode.isFlagged
                  ? 'Entity exhibits high degree connection to flagged cash-out points or suspicious device sharing.'
                  : 'Entity operating within normal synthetic baseline variance.'}
              </p>
            </div>

            {/* Centrality Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold">Degree Centrality</span>
                <span className="font-mono text-sky-700 font-bold text-xs">{selectedNode.degree || 3} peers</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold">Flow Proximity</span>
                <span className="font-mono text-slate-800 font-bold text-xs">
                  {selectedNode.clusterId ? 'Level 1 Hub' : 'Standard Node'}
                </span>
              </div>
              {selectedNode.clusterId && (
                <div className="col-span-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 block text-[10px] font-semibold">Flagged Syndicate Ring</span>
                  <span className="font-mono text-rose-900 font-bold">{selectedNode.clusterId}</span>
                </div>
              )}
            </div>

            {/* Direct Connected Neighbors */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-900 text-xs">Connected Neighbors ({
                data.links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length
              })</h5>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {data.links
                  .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                  .map(l => {
                    const peerId = l.source === selectedNode.id ? l.target : l.source;
                    const peerNode = data.nodes.find(n => n.id === peerId);
                    return (
                      <div
                        key={l.id}
                        onClick={() => peerNode && setSelectedNode(peerNode)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <ArrowRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-mono text-[11px] font-semibold text-slate-800 truncate">{peerId}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{l.type}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Instant Enforcement Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h5 className="font-bold text-slate-900 text-xs">Analyst Enforcement</h5>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleToggleFreeze(selectedNode.id)}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    frozenEntities.has(selectedNode.id)
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{frozenEntities.has(selectedNode.id) ? 'Lift Entity Restriction' : 'Freeze Entity & Outbound Ledger'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Routing */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            {selectedNode.type === 'CUSTOMER' && (
              <a
                href={`#/customers/${selectedNode.id}`}
                className="flex-1 text-center py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
              >
                View DNA
              </a>
            )}
            <a
              href={`#/copilot?entity=${selectedNode.id}`}
              className="flex-1 text-center py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Deep Scan</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
