import React, { useState, useContext } from 'react';
import { Play, Info, CheckSquare, Square, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProjectContext } from '../../App';
import { performAIAction } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const auditDirections = [
  { id: 'arch', label: 'Architecture' },
  { id: 'struct', label: 'Structures' },
  { id: 'hvac', label: 'HVAC (Ventilation)' },
  { id: 'water', label: 'Water & Sewage' },
  { id: 'fire', label: 'Fire Safety' },
  { id: 'power', label: 'Electricity' },
];

export function AuditTab() {
  const context = useContext(ProjectContext);
  if (!context) return null;
  const { auditResult: result, setAuditResult: setResult } = context;
  const [selectedDirections, setSelectedDirections] = useState<string[]>(['arch', 'struct', 'hvac', 'water', 'fire', 'power']);
  const [counts, setCounts] = useState<Record<string, number>>({
    arch: 5, struct: 5, hvac: 5, water: 5, fire: 5, power: 5
  });
  const [specialQuestion, setSpecialQuestion] = useState('');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDirection = (id: string) => {
    setSelectedDirections(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const updateCount = (id: string, val: number) => {
    setCounts(prev => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const handleAudit = async () => {
    if (!context) return;
    setLoading(true);
    try {
      const res = await performAIAction(
        { 
          type: 'general',
          selectedDirectionsWithCounts: selectedDirections.map(id => ({
            label: auditDirections.find(d => d.id === id)?.label || id,
            count: counts[id]
          })),
          specialQuestion: specialQuestion || template,
          projectName: context.projectName,
          projectType: context.projectType,
          additionalInfo: context.additionalInfo
        },
        context.normativeFiles,
        context.projectFiles
      );
      setResult(res || '');
    } catch (error) {
      console.error(error);
      setResult('An error occurred during the audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">1. General Audit</h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
          This tool performs a complete check of the project by comparing it with the normative documents you provided.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Info className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">HOW TO USE:</h4>
          </div>
          <ol className="text-xs text-blue-800/70 space-y-1.5 list-decimal pl-4 font-medium">
            <li>Select the engineering domains for inspection (e.g., Architecture).</li>
            <li>Define the target quantity of primary issues for the AI to identify.</li>
            <li>(Optional) Provide a specific inquiry to focus the audit on particular concerns.</li>
            <li>Click "Start Comprehensive Audit".</li>
          </ol>
        </div>
      </div>

      {!result && !loading && (
        <>
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Audit Directions</h3>
            <div className="grid grid-cols-2 gap-4">
              {auditDirections.map((dir) => {
                const isSelected = selectedDirections.includes(dir.id);
                return (
                  <div 
                    key={dir.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                      isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200 hover:border-slate-300"
                    )}
                    onClick={() => toggleDirection(dir.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                      <span className={cn("text-xs font-bold", isSelected ? "text-blue-700" : "text-slate-600")}>{dir.label}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">count:</span>
                      <input 
                        type="number" 
                        value={counts[dir.id]} 
                        onChange={(e) => updateCount(dir.id, parseInt(e.target.value))}
                        className="w-12 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SPECIAL QUESTION FOR AUDIT (OPTIONAL)</h3>
            </div>
            <p className="text-[10px] text-slate-400 italic">If you have a specific question, state it here, and the AI will focus on it first:</p>
            <textarea 
              value={specialQuestion}
              onChange={(e) => setSpecialQuestion(e.target.value)}
              placeholder="e.g., Does the project's ventilation system comply with ASHRAE 62.1 requirements for multifunctional buildings?"
              rows={4}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none italic"
            />
            
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">OR CHOOSE FROM TEMPLATE</label>
              <select 
                value={template}
                onChange={(e) => {
                  const val = e.target.value;
                  setTemplate(val);
                  if (val) setSpecialQuestion(val);
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="">-- Select a saved query --</option>
                {context.templates.map(t => (
                  <option key={t.id} value={t.description}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleAudit}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            START GENERAL AUDIT
          </button>
        </>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Performing complete audit...</p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{result}</ReactMarkdown>
          <button 
            onClick={() => setResult('')}
            className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
          >
            Clear Results
          </button>
        </div>
      )}
    </div>
  );
}
