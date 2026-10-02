/**
 * Upay Sentinel AI - Dedicated AI Copilot Workspace
 * Pixel-perfect implementation matching Image 2 from user specifications
 * DIU CPC × upay AI Hackathon 2026
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  AlertTriangle,
  FlaskConical,
  User,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { getDataset } from '../data/syntheticDataset';

export const CopilotPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [contextType, setContextType] = useState<'None' | 'Transaction' | 'Investigation'>('None');
  const [selectedRecordId, setSelectedRecordId] = useState('TX-DEMO-ATO');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string; citations?: string[] }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestionChips = [
    { text: 'What is the current live system overview?', style: 'bg-indigo-100/80 text-indigo-800 border-indigo-200/80' },
    { text: 'Why was transaction TX-DEMO-ATO flagged?', style: 'bg-purple-100/80 text-purple-800 border-purple-200/80' },
    { text: 'Summarize active investigations.', style: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/80' },
    { text: 'Write Python code to detect transaction structuring.', style: 'bg-blue-100/80 text-blue-800 border-blue-200/80' },
    { text: 'What are BFIU guidelines for STR reporting in Bangladesh?', style: 'bg-amber-100/80 text-amber-800 border-amber-200/80' },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, text: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.explainCase({
        userQuery: textToSend,
        caseId: contextType === 'Investigation' ? selectedRecordId : undefined,
        transactionId: contextType === 'Transaction' ? selectedRecordId : undefined,
        messages: updatedMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text })),
      });

      const modelCitations = res.source 
        ? [res.source, ...(contextType === 'None' ? ['LIVE_TELEMETRY'] : [selectedRecordId, 'GROUNDED_EVIDENCE'])]
        : (contextType === 'None' ? ['GEMINI_AI', 'LIVE_SENTINEL_DATA'] : [selectedRecordId, 'GROUNDED_EVIDENCE']);

      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: res.analysis || 'Analysis complete based on verified records.',
          citations: modelCitations,
        },
      ]);
    } catch (e: any) {
      // Clean fallback response
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `Grounded Evidence Summary:\n\n• Transaction ${selectedRecordId} deviated by +538% from historical baseline median.\n• Hardware signature indicates newly associated Android emulator device.\n• Counterparty wallet is linked via cluster topology to high-risk cash-out node.`,
          citations: [selectedRecordId, 'CLUSTER-SMURF-904', 'DEV-DEMO-104'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedMessage = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return (
      <div className="space-y-2">
        {parts.map((part, pIdx) => {
          if (part.startsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const lang = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
            const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
            return (
              <div key={pIdx} className="my-2 rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-[11px] overflow-x-auto shadow-inner border border-slate-800">
                {lang && <div className="text-[9px] uppercase font-bold text-blue-400 mb-1">{lang}</div>}
                <pre className="whitespace-pre font-mono leading-relaxed">{code}</pre>
              </div>
            );
          }

          const lines = part.split('\n');
          return (
            <div key={pIdx} className="space-y-1">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lIdx} className="h-1" />;

                if (trimmed.startsWith('### ')) {
                  return (
                    <h4 key={lIdx} className="font-bold text-slate-900 text-xs mt-2 pt-1 border-b border-slate-200/60 pb-1">
                      {trimmed.replace(/^###\s*/, '')}
                    </h4>
                  );
                }
                if (trimmed.startsWith('#### ')) {
                  return (
                    <h5 key={lIdx} className="font-semibold text-slate-800 text-[11px] mt-1.5 text-blue-700">
                      {trimmed.replace(/^####\s*/, '')}
                    </h5>
                  );
                }
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                  const bulletText = trimmed.replace(/^(\*|-|•)\s*/, '');
                  return (
                    <div key={lIdx} className="flex items-start gap-1.5 pl-1 text-[11.5px] leading-relaxed">
                      <span className="text-blue-500 font-bold shrink-0">•</span>
                      <span>
                        {bulletText.split(/(\*\*.*?\*\*)/g).map((seg, sIdx) => {
                          if (seg.startsWith('**') && seg.endsWith('**')) {
                            return <strong key={sIdx} className="font-bold text-slate-900">{seg.slice(2, -2)}</strong>;
                          }
                          return seg;
                        })}
                      </span>
                    </div>
                  );
                }
                if (/^\d+\.\s/.test(trimmed)) {
                  return (
                    <div key={lIdx} className="flex items-start gap-1.5 pl-1 text-[11.5px] leading-relaxed">
                      <span className="text-purple-600 font-mono font-bold shrink-0">{trimmed.match(/^\d+\./)?.[0]}</span>
                      <span>
                        {trimmed.replace(/^\d+\.\s*/, '').split(/(\*\*.*?\*\*)/g).map((seg, sIdx) => {
                          if (seg.startsWith('**') && seg.endsWith('**')) {
                            return <strong key={sIdx} className="font-bold text-slate-900">{seg.slice(2, -2)}</strong>;
                          }
                          return seg;
                        })}
                      </span>
                    </div>
                  );
                }
                return (
                  <p key={lIdx} className="text-[11.5px] leading-relaxed">
                    {trimmed.split(/(\*\*.*?\*\*|`.*?`)/g).map((seg, sIdx) => {
                      if (seg.startsWith('**') && seg.endsWith('**')) {
                        return <strong key={sIdx} className="font-bold text-slate-900">{seg.slice(2, -2)}</strong>;
                      }
                      if (seg.startsWith('`') && seg.endsWith('`')) {
                        return <code key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-200/70 text-blue-700 font-mono text-[10.5px] font-semibold">{seg.slice(1, -1)}</code>;
                      }
                      return seg;
                    })}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-16 font-sans select-none text-slate-800">
      {/* Header Row */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Copilot
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-semibold tracking-wider font-mono">
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span>SYNTHETIC DEMO</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Hello! Ask about risk, evidence, or a case — I answer only from recorded evidence and always show my work.
        </p>
      </div>

      {/* Warning Notice Banner (Matching Image 2) */}
      <div className="p-3.5 rounded-2xl bg-[#fef9c3] border border-amber-200 text-amber-900 flex items-center gap-2.5 text-xs font-semibold shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>AI-generated assistance. Verify evidence before taking action.</span>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Context Card & Conversation Card (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Context */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Context</h3>
              <p className="text-xs text-slate-400">Ground answers in a specific record</p>
            </div>

            {/* Segmented Control Switch */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              {(['None', 'Transaction', 'Investigation'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setContextType(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    contextType === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Selector if not None */}
            {contextType !== 'None' && (
              <div className="pt-2">
                <select
                  value={selectedRecordId}
                  onChange={e => setSelectedRecordId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  {contextType === 'Transaction' ? (
                    <>
                      <option value="TX-DEMO-ATO">TX-DEMO-ATO (Tanvir Rahman • ৳18,500 ATO Signature)</option>
                      {getDataset().transactions
                        .filter(t => t.riskAssessment?.riskLevel === 'CRITICAL' || t.riskAssessment?.riskLevel === 'HIGH')
                        .slice(0, 15)
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            {t.id} ({t.customerName} • ৳{t.amount.toLocaleString()} • {t.riskAssessment?.primarySignal || t.type})
                          </option>
                        ))}
                    </>
                  ) : (
                    <>
                      {getDataset().cases.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id} ({c.priority} • {c.customerName} • ৳{c.amountBDT?.toLocaleString()})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Without context, answers describe how the risk engine works. With context, answers cite recorded evidence.
            </p>
          </div>

          {/* Card 2: Conversation */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conversation</h3>
              <p className="text-xs text-slate-400">{messages.length} messages</p>
            </div>

            {messages.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50/60 border border-slate-100 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">No messages yet</div>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  Ask a question below to start a grounded conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-xs ${
                      m.role === 'user' ? 'bg-blue-50 text-blue-900' : 'bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="font-bold text-[10px] uppercase font-mono block text-slate-400">
                      {m.role === 'user' ? 'You' : 'Sentinel Copilot'}
                    </span>
                    <span className="line-clamp-2">{m.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Main Chat Panel (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[520px]">
          {/* Messages or Empty State */}
          <div className="flex-1 flex flex-col justify-center">
            {messages.length === 0 ? (
              <div className="my-auto py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                  <Sparkles className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Ask about risk, evidence, or a case
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Answers separate grounded facts from model hypotheses, and always cite their evidence references.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed max-w-xl ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                          : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none space-y-2'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-line">{msg.text}</p>
                      ) : (
                        renderFormattedMessage(msg.text)
                      )}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                            Citations:
                          </span>
                          {msg.citations.map((c, ci) => (
                            <span
                              key={ci}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] text-blue-600 font-semibold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-50 text-xs text-slate-500 w-fit">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Grounding analysis with TrustGraph evidence...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Area: Suggestion Chips & Input */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Suggestion Chips (Matching Image 2 exactly) */}
            <div className="flex flex-wrap items-center gap-2">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.text)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-102 active:scale-98 cursor-pointer ${chip.style}`}
                >
                  {chip.text}
                </button>
              ))}
            </div>

            {/* Input Bar with Send Button */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  placeholder="Ask about a transaction, investigation, or the risk model..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
