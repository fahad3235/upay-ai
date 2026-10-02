/**
 * Upay Sentinel AI - Root Application Component
 * DIU CPC × upay AI Hackathon 2026
 * Full navigation, client-side routing, and modal managers
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveRiskPage } from './pages/LiveRiskPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { CustomersPage, CustomerDetailPage } from './pages/CustomersPage';
import { AgentsPage, AgentDetailPage } from './pages/AgentsPage';
import { TrustGraphPage } from './pages/TrustGraphPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { SimulationLabPage } from './pages/SimulationLabPage';
import { CopilotPage } from './pages/CopilotPage';
import { ModelIntelligencePage } from './pages/ModelIntelligencePage';
import { ResponsibleAIPage } from './pages/ResponsibleAIPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { SignInPage } from './pages/SignInPage';
import { CustomerSafetyPage } from './pages/CustomerSafetyPage';
import { DemoGuidePage } from './pages/DemoGuidePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { api } from './services/api';
import { SystemUser } from './types';
import { ShieldAlert, Lock } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (window.location.hash) {
      return window.location.hash.replace('#', '') || '/signin';
    }
    return window.location.pathname || '/signin';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SystemUser | null>(() => api.getStoredUser());

  // Listen to hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPath(hash || '/signin');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If user logs out or has no session, redirect to /signin
  useEffect(() => {
    if (!user && currentPath !== '/signin') {
      window.location.hash = '/signin';
      setCurrentPath('/signin');
    }
    if (user && (currentPath === '/' || currentPath === '/signin' || currentPath === '/login')) {
      window.location.hash = '/dashboard';
      setCurrentPath('/dashboard');
    }
  }, [user, currentPath]);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigate('/signin');
  };

  const handleTriggerDemoScenario = async () => {
    try {
      await api.runScenario('7_MINUTE_INCIDENT');
      navigate('/investigations/CASE-2026-8941');
    } catch {
      navigate('/investigations/CASE-2026-8941');
    }
  };

  // If unauthenticated, render ONLY the private sign-in gateway
  if (!user) {
    return (
      <SignInPage
        onLoginSuccess={loggedInUser => {
          setUser(loggedInUser);
          navigate('/dashboard');
        }}
      />
    );
  }

  // Route matching logic for authenticated sessions
  const renderCurrentView = () => {
    const path = currentPath.split('?')[0];

    // Authenticated root redirects to dashboard
    if (path === '/' || path === '' || path === '/signin' || path === '/login') {
      return (
        <DashboardPage
          onNavigate={navigate}
          onTriggerDemoScenario={handleTriggerDemoScenario}
        />
      );
    }

    if (path === '/dashboard') {
      return (
        <DashboardPage
          onNavigate={navigate}
          onTriggerDemoScenario={handleTriggerDemoScenario}
        />
      );
    }

    if (path === '/live-risk') {
      return <LiveRiskPage onNavigate={navigate} />;
    }

    if (path === '/transactions') {
      const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');
      const search = searchParams.get('search') || '';
      return <TransactionsPage onNavigate={navigate} initialSearch={search} />;
    }

    if (path.startsWith('/transactions/')) {
      const id = path.replace('/transactions/', '');
      return <TransactionDetailPage transactionId={id} onNavigate={navigate} />;
    }

    if (path === '/customers') {
      return <CustomersPage onNavigate={navigate} />;
    }

    if (path.startsWith('/customers/')) {
      const id = path.replace('/customers/', '');
      return <CustomerDetailPage customerId={id} onNavigate={navigate} />;
    }

    if (path === '/agents') {
      return <AgentsPage onNavigate={navigate} />;
    }

    if (path.startsWith('/agents/')) {
      const id = path.replace('/agents/', '');
      return <AgentDetailPage agentId={id} onNavigate={navigate} />;
    }

    if (path === '/trustgraph') {
      return <TrustGraphPage onNavigate={navigate} />;
    }

    if (path === '/investigations') {
      return <InvestigationsPage onNavigate={navigate} />;
    }

    if (path.startsWith('/investigations/')) {
      const id = path.replace('/investigations/', '');
      return <InvestigationDetailPage caseId={id} onNavigate={navigate} />;
    }

    if (path === '/simulation') {
      return (
        <SimulationLabPage
          onNavigate={navigate}
          onTriggerDemoScenario={handleTriggerDemoScenario}
        />
      );
    }

    if (path === '/copilot') {
      return <CopilotPage onNavigate={navigate} />;
    }

    if (path === '/model-intelligence') {
      return <ModelIntelligencePage onNavigate={navigate} />;
    }

    if (path === '/responsible-ai') {
      return <ResponsibleAIPage />;
    }

    if (path === '/reports') {
      return <ReportsPage />;
    }

    if (path === '/safety' || path.startsWith('/safety/')) {
      const incidentId = path.startsWith('/safety/') ? path.replace('/safety/', '') : 'TX-DEMO-49281';
      return <CustomerSafetyPage onNavigate={navigate} incidentId={incidentId} />;
    }

    if (path === '/admin') {
      // Route authorization guard: SUPER_ADMIN or ADMIN only
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        return (
          <div className="max-w-md mx-auto my-16 bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-5 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">403 Forbidden</h2>
              <p className="text-xs text-slate-500 mt-1">
                Administrative privileges are required to access this control center.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-600 border border-slate-200 font-mono text-left space-y-1">
              <div>Account: <span className="font-semibold text-slate-800">{user.email}</span></div>
              <div>Role: <span className="font-bold text-amber-700">{user.role}</span></div>
              <div>Required: <span className="font-bold text-slate-900">SUPER_ADMIN | ADMIN</span></div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Return to Intelligence Dashboard
            </button>
          </div>
        );
      }
      return <AdminPage onNavigate={navigate} />;
    }

    if (path === '/how-it-works') {
      return (
        <HowItWorksPage
          onNavigate={navigate}
          onTriggerDemoScenario={handleTriggerDemoScenario}
        />
      );
    }

    if (path === '/demo' || path === '/about') {
      return (
        <DemoGuidePage
          onNavigate={navigate}
          onTriggerDemoScenario={handleTriggerDemoScenario}
        />
      );
    }

    // 404 Fallback
    return (
      <div className="p-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">404 - Dossier Not Found</h2>
        <p className="text-xs text-slate-500">The requested intelligence dossier does not exist.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold text-xs"
        >
          Return to Command Center
        </button>
      </div>
    );
  };

  const isCustomerSafetyView = currentPath.startsWith('/safety');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* If viewing the customer safety warning view, isolate the mobile view without analyst chrome */}
      {isCustomerSafetyView ? (
        <main className="flex-1 w-full min-h-screen bg-slate-100 flex items-center justify-center p-4">
          {renderCurrentView()}
        </main>
      ) : (
        <>
          {/* Global Sidebar Navigation */}
          <Sidebar
            currentPath={currentPath}
            onNavigate={navigate}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <TopNavbar
              currentPath={currentPath}
              onNavigate={navigate}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onTriggerDemoScenario={handleTriggerDemoScenario}
              user={user}
              onLogout={handleLogout}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1560px] w-full mx-auto">
              {renderCurrentView()}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
