/**
 * Upay Sentinel AI - Global Command Palette (Cmd+K / Ctrl+K)
 * Universal shortcut search across pages, scenarios, high-risk entities, and demo triggers
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Command,
  ArrowRight,
  ShieldAlert,
  Play,
  Share2,
  Briefcase,
  Users,
  Cpu,
  Layers,
  Sparkles,
  Smartphone,
  RotateCcw,
  X,
  Building2,
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: 'PAGES' | 'SCENARIOS' | 'ENTITIES' | 'ACTIONS';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
  risk?: 'CRITICAL' | 'HIGH' | 'INFO';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onTriggerDemoScenario?: () => void;
  onResetDemo?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerDemoScenario,
  onResetDemo,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items: CommandItem[] = [
    // Scenarios & Quick Demos
    {
      id: 'scenario-7min',
      category: 'SCENARIOS',
      title: 'Run Signature "7-Minute Incident" ATO Demo',
      subtitle: 'Triggers emulator login DEV-DEMO-104, rapid transfer of ৳18,500 to smurfing cluster',
      icon: <Play className="w-4 h-4 text-rose-600 fill-rose-600" />,
      badge: 'SIGNATURE DEMO',
      risk: 'CRITICAL',
      action: () => {
        if (onTriggerDemoScenario) onTriggerDemoScenario();
        else onNavigate('/investigations/CASE-2026-8941');
        onClose();
      },
    },
    {
      id: 'scenario-simlab',
      category: 'SCENARIOS',
      title: 'Open Simulation Lab & What-If Engine',
      subtitle: 'Tune parameter sliders for amount, device trust, counterparty familiarity',
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
      action: () => {
        onNavigate('/simulation');
        onClose();
      },
    },

    // Navigation Pages
    {
      id: 'page-dashboard',
      category: 'PAGES',
      title: 'Analyst Command Center (Dashboard)',
      subtitle: 'Real-time metrics, risk distribution, priority triage queue',
      icon: <Cpu className="w-4 h-4 text-sky-600" />,
      action: () => {
        onNavigate('/dashboard');
        onClose();
      },
    },
    {
      id: 'page-trustgraph',
      category: 'PAGES',
      title: 'TrustGraph Topological Network Intelligence',
      subtitle: 'Interactive relationship visualizer, money flow particle trails, smurf rings',
      icon: <Share2 className="w-4 h-4 text-sky-600" />,
      action: () => {
        onNavigate('/trustgraph');
        onClose();
      },
    },
    {
      id: 'page-liverisk',
      category: 'PAGES',
      title: 'Simulated Live Risk Transaction Stream',
      subtitle: 'Live ingestion feed with variable speed and real-time inference',
      icon: <Layers className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onNavigate('/live-risk');
        onClose();
      },
    },
    {
      id: 'page-cases',
      category: 'PAGES',
      title: 'Investigation Cases & Triage Hub',
      subtitle: 'Active fraud cases, batch triage, regulatory SAR generation',
      icon: <Briefcase className="w-4 h-4 text-amber-600" />,
      action: () => {
        onNavigate('/investigations');
        onClose();
      },
    },
    {
      id: 'page-copilot',
      category: 'PAGES',
      title: 'Gemini AI Copilot Workspace',
      subtitle: 'Grounded generative reasoning bounded by structured evidence',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      action: () => {
        onNavigate('/copilot');
        onClose();
      },
    },
    {
      id: 'page-safety',
      category: 'PAGES',
      title: 'Customer Financial Safety Warning UX',
      subtitle: 'Mobile-first transparent warning interface for end-users',
      icon: <Smartphone className="w-4 h-4 text-sky-600" />,
      action: () => {
        onNavigate('/safety');
        onClose();
      },
    },

    // Key Entities
    {
      id: 'entity-case8941',
      category: 'ENTITIES',
      title: 'CASE-2026-8941: Account Takeover (Tanvir Rahman)',
      subtitle: 'Score: 86 HIGH · Flagged ৳18,500 · Emulator Handset DEV-DEMO-104',
      icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
      badge: 'SCORE 86',
      risk: 'CRITICAL',
      action: () => {
        onNavigate('/investigations/CASE-2026-8941');
        onClose();
      },
    },
    {
      id: 'entity-cluster904',
      category: 'ENTITIES',
      title: 'CLUSTER-SMURF-904: Mule Extraction Ring',
      subtitle: 'Topological ring connecting 6 entities to cash-out hub AGENT-DEMO-007',
      icon: <Share2 className="w-4 h-4 text-rose-600" />,
      badge: 'SYNDICATE',
      risk: 'HIGH',
      action: () => {
        onNavigate('/trustgraph?clusterId=CLUSTER-SMURF-904');
        onClose();
      },
    },
    {
      id: 'entity-tanvir',
      category: 'ENTITIES',
      title: 'Customer CUS-DEMO-1042 (Tanvir Rahman)',
      subtitle: 'Victim of signature 7-minute ATO scenario · Behavioral DNA profile',
      icon: <Users className="w-4 h-4 text-sky-600" />,
      action: () => {
        onNavigate('/customers/CUS-DEMO-1042');
        onClose();
      },
    },
    {
      id: 'entity-agent7',
      category: 'ENTITIES',
      title: 'Agent AGENT-DEMO-007 (Mule Cash-Out Terminal)',
      subtitle: 'Outlier cash-out ratio 0.88 · Boalia, Rajshahi hub',
      icon: <Building2 className="w-4 h-4 text-amber-600" />,
      badge: 'WATCHLIST',
      risk: 'HIGH',
      action: () => {
        onNavigate('/agents/AGENT-DEMO-007');
        onClose();
      },
    },

    // Actions
    {
      id: 'action-reset',
      category: 'ACTIONS',
      title: 'Reset Demo Database to Initial Seed State',
      subtitle: 'Restores synthetic transactions, clean device baselines, and cases',
      icon: <RotateCcw className="w-4 h-4 text-slate-500" />,
      action: () => {
        if (onResetDemo) onResetDemo();
        onClose();
      },
    },
  ];

  const filteredItems = items.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col text-xs text-slate-800 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-sky-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, page, entity ID (e.g. CUS-1042, ATO, Smurf)..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching commands or entities found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-50/90 border border-sky-200/80 text-sky-950'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-white shadow-2xs' : 'bg-slate-100'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold font-mono ${
                              item.risk === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-700'
                                : item.risk === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono shadow-3xs">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono shadow-3xs">↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono shadow-3xs">↵</kbd> select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono shadow-3xs">esc</kbd> close
            </span>
          </div>
          <span className="font-semibold text-sky-700">UPAY SENTINEL AI PALETTE</span>
        </div>
      </div>
    </div>
  );
};
