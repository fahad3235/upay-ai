/**
 * Upay Sentinel AI - Left Icon Rail Navigation
 * Pixel-perfect implementation matching provided design screenshots
 * DIU CPC × upay AI Hackathon 2026
 */

import React from 'react';
import {
  LayoutGrid,
  ArrowLeftRight,
  Share2,
  Briefcase,
  FlaskConical,
  Bot,
  BarChart3,
  Users,
  Building2,
  Sliders,
  FileText,
  ToggleLeft,
  Receipt,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface RailItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const primaryNavItems: RailItem[] = [
    { path: '/dashboard', label: 'Overview', icon: LayoutGrid },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/trustgraph', label: 'TrustGraph', icon: Share2 },
    { path: '/investigations', label: 'Investigations', icon: Briefcase, badge: '1' },
    { path: '/simulation', label: 'Simulation Lab', icon: FlaskConical },
    { path: '/copilot', label: 'AI Copilot', icon: Bot },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const secondaryNavItems: RailItem[] = [
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/agents', label: 'Agents', icon: Building2 },
    { path: '/model-intelligence', label: 'Model Intelligence', icon: Sliders },
    { path: '/responsible-ai', label: 'Responsible AI', icon: FileText },
    { path: '/admin', label: 'Admin Settings', icon: ToggleLeft },
    { path: '/live-risk', label: 'Live Audit Feed', icon: Receipt },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-[70px] bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-4 transition-transform duration-200 ease-in-out select-none md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Logo Squircle */}
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={() => handleNav('/dashboard')}
            title="UPAY Sentinel AI - Home"
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/25 transition-transform hover:scale-105 active:scale-95"
          >
            <Shield className="w-5 h-5 fill-white/20 stroke-[2.2]" />
          </button>

          {/* Primary Navigation Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const active = isItemActive(item.path);

              return (
                <div key={item.path} className="relative group flex items-center justify-center">
                  <button
                    onClick={() => handleNav(item.path)}
                    aria-label={item.label}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </button>

                  {/* Badge if present */}
                  {item.badge && !active && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs pointer-events-none ring-2 ring-white">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip */}
                  <div className="absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtle Divider */}
          <div className="w-6 h-px bg-slate-200 my-1"></div>

          {/* Secondary Navigation Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            {secondaryNavItems.map(item => {
              const Icon = item.icon;
              const active = isItemActive(item.path);

              return (
                <div key={item.path} className="relative group flex items-center justify-center">
                  <button
                    onClick={() => handleNav(item.path)}
                    aria-label={item.label}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                  </button>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Lab Flask Icon */}
        <div className="relative group flex items-center justify-center pt-2">
          <button
            onClick={() => handleNav('/simulation')}
            title="Lab & Synthetic Scenarios"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isItemActive('/simulation')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <FlaskConical className="w-4 h-4 stroke-[1.8]" />
          </button>
          <div className="absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            Simulation Lab
          </div>
        </div>
      </aside>
    </>
  );
};
