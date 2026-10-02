/**
 * Upay Sentinel AI - Analyst Portal Login
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState } from 'react';
import { Share2, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('fahad.ahmed@sentinel.upay.demo');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: 'Fahad Ahmed',
      role: 'Senior Fraud Analyst',
    });
  };

  const handleQuickLogin = (name: string, role: string) => {
    onLoginSuccess({ name, role });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 text-xs text-slate-300">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#0d131f] space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-900/40">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">UPAY SENTINEL AI</h2>
          <p className="text-slate-400 text-xs">TrustGraph Financial Intelligence Command Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-400 block text-[11px] font-medium">Analyst Email</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 block text-[11px] font-medium">Security Credential</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950"
          >
            <span>Authenticate to Sentinel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Evaluator 1-Click Access for Hackathon Judges */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Demo Access for Hackathon Judges
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('Fahad Ahmed', 'Senior Fraud Analyst')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <strong className="text-white block text-[11px]">Fahad Ahmed</strong>
              <span className="text-[10px] text-cyan-400">Senior Fraud Analyst</span>
            </button>
            <button
              onClick={() => handleQuickLogin('Sabrina Akter', 'Risk Operations Manager')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <strong className="text-white block text-[11px]">Sabrina Akter</strong>
              <span className="text-[10px] text-cyan-400">Risk Manager</span>
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 text-center">
          DIU CPC × upay AI Hackathon 2026 · Synthetic Evaluation Mode
        </div>
      </div>
    </div>
  );
};
