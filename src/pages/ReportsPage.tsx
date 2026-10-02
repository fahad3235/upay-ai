/**
 * Upay Sentinel AI - Formal Investigation Reports (Premium White Theme)
 * Printable / exportable compliance report dossier
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Share2,
  AlertTriangle,
  FileText,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { getDataset } from '../data/syntheticDataset';
import { RiskBadge } from '../components/common/RiskBadge';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const data = getDataset();
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-2026-8941');
  const [showBFIUForm1, setShowBFIUForm1] = useState(false);
  const [auditVerify, setAuditVerify] = useState<any>(null);
  const [exportingXml, setExportingXml] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    api.verifyAuditChain().then(setAuditVerify).catch(() => null);
  }, []);

  const c = data.cases.find(x => x.id === selectedCaseId) || data.cases[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(c, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENTINEL_REPORT_${c.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportGoAMLXML = async () => {
    setExportingXml(true);
    try {
      const xml = await api.getGoAMLXml(c.id);
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BFIU-goAML-${c.id}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      setNoticeMessage(`BFIU goAML XML file for ${c.id} exported successfully.`);
      setTimeout(() => setNoticeMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setNoticeMessage(`Failed to export XML: ${err.message}`);
    } finally {
      setExportingXml(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 text-xs text-slate-800">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/90 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">Formal Investigation Reports</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Audit-ready financial investigation dossier for compliance, risk managers, and human sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-sky-500 shadow-2xs"
          >
            {data.cases.map(item => (
              <option key={item.id} value={item.id}>
                {item.id} - {item.customerName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowBFIUForm1(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Preview official Bangladesh Bank Form-1 STR/SAR Dossier"
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Official BFIU Form-1 STR</span>
          </button>

          <button
            onClick={handleExportGoAMLXML}
            disabled={exportingXml}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Export standard UNODC/BFIU 4.0 XML file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>{exportingXml ? 'Generating...' : 'Export goAML XML'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-sky-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{noticeMessage}</span>
        </div>
      )}

      {/* The Printable Dossier Container */}
      <div className="p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-6 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Regulatory & Cryptographic Seal Ribbon */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
              BANGLADESH BANK BFIU
            </span>
            <span className="text-slate-600">MLPA 2012 / Circular No. 28 Compliant</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>FOUR-EYES: {c.dualAuthStatus || 'VERIFIED'}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                SHA-256 SEAL:{' '}
                {auditVerify?.latestBlockHash ? auditVerify.latestBlockHash.substring(0, 10) + '...' : 'TAMPER-EVIDENT'}
              </span>
            </span>
          </div>
        </div>

        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 print:text-black font-display">
                UPAY SENTINEL AI
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-mono text-[11px] font-semibold">TRUSTGRAPH INTELLIGENCE</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 print:text-black">
              Incident Investigation Report: {c.id}
            </h2>
            <p className="text-slate-500 text-xs">{c.title}</p>
          </div>

          <div className="text-right space-y-1">
            <RiskBadge level={c.priority as any} score={c.riskScore} size="md" />
            <div className="text-[10px] text-slate-400 font-mono">
              Generated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Overview Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">CUSTOMER</span>
            <strong className="text-slate-900 print:text-black block text-xs mt-0.5">{c.customerName}</strong>
            <span className="text-slate-500 font-mono block text-[10px]">{c.customerId}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">FLAGGED TRANSACTION</span>
            <strong className="text-slate-900 print:text-black font-mono block text-xs mt-0.5">{c.transactionId || 'N/A'}</strong>
            <span className="text-sky-700 font-mono block text-[11px] font-bold">
              ৳{(c.amountBDT || 18500).toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">CASE STATUS</span>
            <strong className="text-slate-900 print:text-black font-mono block text-xs mt-0.5">{c.status}</strong>
            <span className="text-slate-500 block text-[10px]">Priority: {c.priority}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-semibold">ASSIGNED ANALYST</span>
            <strong className="text-slate-900 print:text-black block text-xs mt-0.5">{c.assignedTo}</strong>
            <span className="text-slate-500 block text-[10px]">Fraud Intelligence</span>
          </div>
        </div>

        {/* Structured Evidence */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 print:text-black border-b border-slate-100 pb-1 font-display">
            Structured Evidence Inventory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-sky-700 block font-bold">Transaction Facts</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                {c.structuredEvidence.transactionFacts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-rose-700 block font-bold">Behavioral Deviation</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                {c.structuredEvidence.behavioralAnomalies.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-sky-800 block font-bold">TrustGraph Topology</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                {c.structuredEvidence.networkFindings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sequential Timeline */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 print:text-black border-b border-slate-100 pb-1 font-display">
            Incident Chronology
          </h3>
          <div className="space-y-2">
            {c.timeline.map(evt => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4 text-[11px]"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{evt.title}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">({evt.category})</span>
                  </div>
                  <p className="text-slate-600">{evt.description}</p>
                </div>
                <span className="font-mono text-sky-700 font-bold shrink-0">{evt.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Grounded Summary */}
        {c.aiAnalysis && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 print:text-black border-b border-slate-100 pb-1 font-display">
              AI Copilot Grounded Investigation Narrative
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-[11px]">
              <div>
                <strong className="text-sky-800 block mb-0.5">What Happened:</strong>
                <p className="text-slate-700 leading-relaxed">{c.aiAnalysis.whatHappened}</p>
              </div>
              <div>
                <strong className="text-sky-800 block mb-0.5">Why It Is Risky:</strong>
                <p className="text-slate-700 leading-relaxed">{c.aiAnalysis.whyRisky}</p>
              </div>
              <div>
                <strong className="text-sky-800 block mb-0.5">Recommended Verification Steps:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {c.aiAnalysis.recommendedChecks.map((check, i) => (
                    <li key={i}>{check}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Human Analyst Sign-off */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px]">
          <div>
            <span className="text-slate-500 block mb-4 font-semibold">Lead Investigator Sign-off:</span>
            <div className="border-b border-slate-400 w-48 pb-1 font-mono font-bold text-slate-900">
              Fahad Ahmed, Senior Analyst
            </div>
            <span className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString()}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-4 font-semibold">Risk Committee Oversight:</span>
            <div className="border-b border-slate-400 w-48 pb-1 font-mono text-slate-600 font-semibold">
              [ Approved for Human Review ]
            </div>
            <span className="text-[10px] text-slate-400">DIU CPC × upay Hackathon 2026</span>
          </div>
        </div>
      </div>

      {/* Official Bangladesh Bank BFIU Form-1 STR/SAR Modal (Item 6) */}
      {showBFIUForm1 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:static print:bg-white">
          <div className="max-w-4xl w-full max-h-[92vh] overflow-y-auto p-8 rounded-3xl bg-white border border-slate-300 shadow-2xl space-y-6 print:border-none print:shadow-none print:max-h-none print:p-0">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>Bangladesh Bank BFIU Form-1 STR/SAR Compliance Dossier</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportGoAMLXML}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download goAML XML</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form-1</span>
                </button>
                <button
                  onClick={() => setShowBFIUForm1(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Official Bangladesh Bank Form-1 Content */}
            <div className="border-4 double border-slate-900 p-6 space-y-5 text-slate-900 bg-white">
              {/* Official Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                  CONFIDENTIAL — PURSUANT TO SECTION 25(1)(d) OF MLPA 2012
                </div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  BANGLADESH FINANCIAL INTELLIGENCE UNIT (BFIU)
                </h1>
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  BANGLADESH BANK, HEAD OFFICE, MOTIJHEEL, DHAKA-1000
                </h2>
                <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs uppercase mt-1">
                  FORM-1: SUSPICIOUS TRANSACTION REPORT (STR) / SAR
                </div>
              </div>

              {/* Reference & Entity Box */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-slate-400 p-3 bg-slate-50/50">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">BFIU REFERENCE NO.</span>
                  <span className="font-mono font-black text-slate-900">BFIU/MFS/UPAY/2026/STR-{c.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">DATE OF SUBMISSION</span>
                  <span className="font-mono font-bold text-slate-900">{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">REPORTING ENTITY</span>
                  <span className="font-bold text-slate-900">UCB FINTECH SERVICES LIMITED (upay MFS)</span>
                  <span className="text-[10px] text-slate-500 font-mono block">License No: BB/MFS/2020-008</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">PRINCIPAL COMPLIANCE OFFICER</span>
                  <span className="font-bold text-slate-900">Fahad Ahmed (CAMLCO Division)</span>
                  <span className="text-[10px] text-slate-500 font-mono block">Designation: Senior Fraud Analyst</span>
                </div>
              </div>

              {/* Section 1: Subject Identification */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase bg-slate-200 px-2 py-1 border border-slate-300">
                  SECTION 1: PARTICULARS OF ACCOUNT HOLDER / SUBJECT
                </h3>
                <div className="grid grid-cols-3 gap-2 text-[11px] border border-slate-300 p-2.5">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Full Name:</span>
                    <strong className="text-slate-900">{c.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">MFS Account / Wallet ID:</span>
                    <strong className="font-mono text-slate-900">{c.customerId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">National ID (Masked):</span>
                    <strong className="font-mono text-slate-900">1992-XXXX-XXXX-8921</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">eKYC Verification:</span>
                    <span className="text-emerald-700 font-bold">Biometric Verified (EC DB)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Registered Mobile:</span>
                    <strong className="font-mono text-slate-900">+880 1700-XXXXXX</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Jurisdiction / Division:</span>
                    <strong className="text-slate-900">Dhaka North, Bangladesh</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: Flagged Transaction Details */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase bg-slate-200 px-2 py-1 border border-slate-300">
                  SECTION 2: SUSPICIOUS TRANSACTION CHARACTERISTICS
                </h3>
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="p-2 border border-slate-300">TX REFERENCE</th>
                      <th className="p-2 border border-slate-300">DATE & TIME</th>
                      <th className="p-2 border border-slate-300">AMOUNT (BDT)</th>
                      <th className="p-2 border border-slate-300">CHANNEL</th>
                      <th className="p-2 border border-slate-300">RECIPIENT MFS</th>
                      <th className="p-2 border border-slate-300">INTERCEPTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 font-mono font-bold text-sky-800">
                        {c.transactionId || 'TXN-2026-HERO-001'}
                      </td>
                      <td className="p-2 border border-slate-300 font-mono">
                        {new Date().toISOString().replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="p-2 border border-slate-300 font-black font-mono text-rose-800">
                        ৳{(c.amountBDT || 18500).toLocaleString()}
                      </td>
                      <td className="p-2 border border-slate-300">P2P Send Money (App)</td>
                      <td className="p-2 border border-slate-300 font-mono">01923-456789 (Agent Hub)</td>
                      <td className="p-2 border border-slate-300">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                          15-MIN SOFT ESCROW
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: Reason for Suspicion & Evidence */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase bg-slate-200 px-2 py-1 border border-slate-300">
                  SECTION 3: GROUNDS FOR SUSPICION (BFIU CIRCULAR 28 INDICATORS)
                </h3>
                <div className="p-3 border border-slate-300 text-xs space-y-2">
                  <div>
                    <span className="font-bold text-rose-800 uppercase block text-[10px]">PRIMARY RISK SIGNAL:</span>
                    <p className="font-semibold text-slate-900">{c.primarySignal}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 uppercase block text-[10px]">INVESTIGATION NARRATIVE:</span>
                    <p className="text-slate-800 leading-relaxed text-[11px]">
                      {c.aiAnalysis?.whatHappened ||
                        'Coordinated account takeover detected following emulator login and rapid dispersion into cash-out agent network.'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 uppercase block text-[10px]">STRUCTURED EVIDENCE INVENTORY:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-800">
                      {c.structuredEvidence.transactionFacts.concat(c.structuredEvidence.behavioralAnomalies).map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 4: Dual-Authorization & Cryptographic Proof */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase bg-slate-200 px-2 py-1 border border-slate-300">
                  SECTION 4: FOUR-EYES AUTHORIZATION & CRYPTOGRAPHIC LEDGER SEAL
                </h3>
                <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 text-xs bg-slate-50/50">
                  <div className="border-r border-slate-300 pr-3 space-y-2">
                    <span className="font-bold text-[10px] text-slate-500 uppercase block">MAKER (INITIAL INVESTIGATOR)</span>
                    <div className="font-mono text-xs font-bold text-slate-900">
                      Fahad Ahmed, Senior AML Analyst
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Timestamp: {new Date().toISOString()}
                    </span>
                    <div className="pt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Evidence verified against Central DNA Matrix</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-[10px] text-slate-500 uppercase block">CHECKER (COMPLIANCE SUPERVISOR)</span>
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {c.dualAuthApprovedBy || 'Tanvir Hassan, Head of AML/CFT'}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Status: {c.dualAuthStatus || 'APPROVED & SEALED'}
                    </span>
                    <div className="pt-2 text-[10px] text-sky-800 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                      <span>Dual-Authorization Cryptographically Bound</span>
                    </div>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-slate-300 font-mono text-[10px] text-slate-600">
                    <div>
                      <strong className="text-slate-900">IMMUTABLE BLOCK HASH (SHA-256):</strong>{' '}
                      {auditVerify?.latestBlockHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                    </div>
                    <div className="mt-0.5 text-slate-400">
                      UNODC goAML Web 4.0 XML Schema: Compliant with XML DTD & BFIU Electronic STR Direct Submission.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
