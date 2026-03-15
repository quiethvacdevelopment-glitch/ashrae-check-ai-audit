import React, { useState, useContext } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { ProjectContext } from '../../App';
import { performAIAction } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function ConsultantTab() {
  const context = useContext(ProjectContext);
  if (!context) return null;
  const { consultantResult: result, setConsultantResult: setResult } = context;
  const [question, setQuestion] = useState('');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    if (!context) return;
    setLoading(true);
    try {
      const res = await performAIAction(
        { 
          type: 'consultant',
          projectName: context.projectName,
          projectType: context.projectType,
          additionalInfo: context.additionalInfo,
          specialQuestion: question || template
        },
        context.normativeFiles,
        context.projectFiles
      );
      setResult(res || '');
    } catch (error) {
      console.error(error);
      setResult('An error occurred during consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">2. AI Engineer-Consultant</h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
          This tool is your personal AI engineer-consultant. Ask specific questions, request complex calculations (e.g., insolation or load-bearing structures), or ask to write technical specifications.
        </p>

        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 space-y-3">
          <p className="text-xs text-pink-800/70 font-medium">
            CALCULATIONS WILL BE PRESENTED IN PROFESSIONAL MATHEMATICAL FORMAT.
          </p>
          <p className="text-xs text-pink-800/70 italic">
            Example: "Calculate ventilation volumes according to ASHRAE 62.1..."
          </p>
        </div>
      </div>

      {!result && !loading && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QUESTION TO CONSULTANT</h3>
            </div>
            <p className="text-[10px] text-slate-400 italic">Describe your question or problem that requires an engineering solution:</p>
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: Calculate ventilation volumes according to ASHRAE 62.1..."
              rows={6}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none italic shadow-inner"
            />
            
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">OR CHOOSE FROM TEMPLATE</label>
              <select 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="">-- Select a saved query --</option>
                {context.templates.map(t => (
                  <option key={t.id} value={t.title}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleConsult}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            EXECUTE
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Calculating...</p>
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

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed italic">
          Disclaimer: In all domains, this data is generated by AI and has approximately 90% accuracy. The provided answers are advisory. Final responsibility lies with the designer.
        </p>
      </div>
    </div>
  );
}
