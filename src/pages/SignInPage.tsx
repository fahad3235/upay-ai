/**
 * Upay Sentinel AI - Private Authentication Gateway
 * Pixel-perfect implementation matching the provided split-screen screenshot (Image 3)
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { SystemUser } from '../types';

interface SignInPageProps {
  onLoginSuccess: (user: SystemUser) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('diudevcis');
  const [password, setPassword] = useState('diudevcis');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const data = await api.login(identifier.trim(), password);
      if (data && data.user) {
        onLoginSuccess(data.user);
      } else {
        setErrorMessage('Invalid credentials. Access restricted to authorized personnel.');
      }
    } catch (err: any) {
      const msg =
        err.message?.toLowerCase().includes('suspended') || err.message?.toLowerCase().includes('too many')
          ? 'Too many failed authentication attempts. Please try again shortly.'
          : 'Invalid credentials. Access restricted to authorized personnel.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans select-none bg-white">
      {/* LEFT PANE: Dark Navy Futuristic TrustGraph Illustration */}
      <div className="relative bg-[#0B1528] text-white p-10 lg:p-16 flex flex-col justify-between overflow-hidden">
        {/* Background Network Glow & SVG Graph */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"></div>

          {/* Connected Network Nodes SVG */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Glowing Connection Lines */}
            <line x1="120" y1="200" x2="280" y2="320" stroke="url(#netGrad)" strokeWidth="1.5" />
            <line x1="280" y1="320" x2="420" y2="240" stroke="url(#netGrad)" strokeWidth="1.5" />
            <line x1="420" y1="240" x2="520" y2="380" stroke="url(#netGrad)" strokeWidth="1.5" />
            <line x1="280" y1="320" x2="260" y2="460" stroke="url(#netGrad)" strokeWidth="1.5" />
            <line x1="260" y1="460" x2="400" y2="520" stroke="url(#netGrad)" strokeWidth="1.5" />
            <line x1="420" y1="240" x2="360" y2="390" stroke="url(#netGrad)" strokeWidth="1.5" />
            <line x1="360" y1="390" x2="520" y2="380" stroke="url(#netGrad)" strokeWidth="1.5" />
            <line x1="180" y1="380" x2="280" y2="320" stroke="url(#netGrad)" strokeWidth="1" />
            <line x1="340" y1="210" x2="420" y2="240" stroke="url(#netGrad)" strokeWidth="1" />
            <line x1="480" y1="180" x2="420" y2="240" stroke="url(#netGrad)" strokeWidth="1" />
            <line x1="260" y1="460" x2="180" y2="540" stroke="url(#netGrad)" strokeWidth="1" />
            <line x1="400" y1="520" x2="510" y2="500" stroke="url(#netGrad)" strokeWidth="1" />

            {/* Nodes with Halos */}
            <circle cx="280" cy="320" r="18" fill="#0284c7" opacity="0.3" className="animate-pulse" />
            <circle cx="280" cy="320" r="7" fill="#38bdf8" />

            <circle cx="420" cy="240" r="14" fill="#2563eb" opacity="0.3" />
            <circle cx="420" cy="240" r="6" fill="#60a5fa" />

            <circle cx="360" cy="390" r="22" fill="#38bdf8" opacity="0.25" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="360" cy="390" r="8" fill="#bae6fd" />

            <circle cx="120" cy="200" r="5" fill="#7dd3fc" />
            <circle cx="520" cy="380" r="6" fill="#38bdf8" />
            <circle cx="260" cy="460" r="6" fill="#60a5fa" />
            <circle cx="400" cy="520" r="5" fill="#93c5fd" />
            <circle cx="180" cy="380" r="4" fill="#38bdf8" />
            <circle cx="340" cy="210" r="4" fill="#38bdf8" />
            <circle cx="480" cy="180" r="4" fill="#7dd3fc" />
            <circle cx="180" cy="540" r="4" fill="#60a5fa" />
            <circle cx="510" cy="500" r="4" fill="#93c5fd" />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/20">
            <div className="relative">
              <Shield className="w-6 h-6 text-sky-400 stroke-[2]" />
              <span className="w-2 h-2 rounded-full bg-sky-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white font-display">
              UPAY SENTINEL AI
            </h2>
            <p className="text-[11px] font-mono tracking-[0.25em] text-sky-400 font-bold uppercase">
              TRUSTGRAPH
            </p>
          </div>
        </div>

        {/* Main Pitch in Center */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
            Before money moves, understand the risk.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            UPAY Sentinel AI continuously maps counterparties, payments, and entities into a dynamic trust graph. Detect anomalies, synthetic identities, and risk exposure in real time.
          </p>
        </div>

        {/* Bottom Synthetic Demo Pill */}
        <div className="relative z-10 pt-4">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-mono font-semibold tracking-wider text-slate-400 border border-slate-700/80 bg-slate-900/40">
            SYNTHETIC DEMO
          </span>
        </div>
      </div>

      {/* RIGHT PANE: Crisp White Login Form */}
      <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between items-center bg-white">
        <div className="w-full max-w-md my-auto space-y-7">
          {/* Welcome Titles */}
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-base">
              Secure workspace access
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Admin ID Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Email or admin ID
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Password Input with show/hide toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={e => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this device</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('diudevcis');
                  setPassword('diudevcis');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            {/* Subtitle */}
            <p className="text-xs text-slate-400 text-center font-medium">
              Authorized personnel only
            </p>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIdentifier('diudevcis');
                setPassword('diudevcis');
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 text-[11px] font-mono border border-slate-200/80 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Quick Fill Demo Admin:</span>
              <strong className="text-slate-800">diudevcis</strong> / <strong className="text-slate-800">diudevcis</strong>
            </button>
          </div>
        </div>

        {/* Bottom Footer Notice */}
        <div className="w-full pt-8 text-center">
          <p className="text-[11px] text-slate-400">
            Your session is protected by 256-bit TLS encryption • SOC 2 & GDPR compliant • Privacy Policy • Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};
