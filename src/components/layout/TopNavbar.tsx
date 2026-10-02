/**
 * Upay Sentinel AI - Top Navigation Bar
 * Pixel-perfect navigation pills, search trigger, synthetic demo badge, and admin profile
 * Matching screenshots exactly
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  ArrowLeftRight,
  Share2,
  Briefcase,
  FlaskConical,
  Bot,
  BarChart3,
  Search,
  Bell,
  Menu,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { CommandPalette } from '../common/CommandPalette';
import { SystemUser } from '../../types';

interface TopNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenMobileMenu: () => void;
  onTriggerDemoScenario?: () => void;
  user?: SystemUser | null;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenMobileMenu,
  user,
  onLogout,
}) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { path: '/dashboard', label: 'Overview', icon: LayoutGrid },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/trustgraph', label: 'TrustGraph', icon: Share2 },
    { path: '/investigations', label: 'Investigations', icon: Briefcase, badge: '1' },
    { path: '/simulation', label: 'Simulation', icon: FlaskConical },
    { path: '/copilot', label: 'Copilot', icon: Bot },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-3 select-none">
        {/* Left: Mobile hamburger menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Top Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isLinkActive(link.path);

            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-500'}`} />
                <span>{link.label}</span>

                {link.badge && (
                  <span
                    className={`ml-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      active ? 'bg-rose-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Search command palette (Ctrl+K)"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Synthetic Demo Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-semibold tracking-wider font-mono">
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span>SYNTHETIC DEMO</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => onNavigate('/investigations')}
            title="Active Alerts"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center ring-1 ring-blue-200">
                SA
              </div>
              <div className="hidden md:block pr-1">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Sentinel Admin'}
                </div>
                <div className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">
                  {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : user?.role || 'SUPER ADMIN'}
                </div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Sentinel Admin'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{user?.email || 'admin@upay.com.bd'}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('/admin');
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Admin Control Center</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('/simulation');
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                    <span>Synthetic Lab Scenarios</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
