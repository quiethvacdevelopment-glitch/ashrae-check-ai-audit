import React, { useState, useContext } from 'react';
import { Layout, Play, Loader2 } from 'lucide-react';
import { ProjectContext } from '../../App';
import { performAIAction } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function PlansTab() {
  const context = useContext(ProjectContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [specialQuestion, setSpecialQuestion] = useState('');

  const handleAudit = async () => {
    if (!context) return;
    setLoading(true);
    try {
      const res = await performAIAction(
        { 
          type: 'plans',
          projectName: context.projectName,
          projectType: context.projectType,
          additionalInfo: context.additionalInfo,
          specialQuestion: specialQuestion || "Perform a graphical analysis of the floor plans and find ergonomic or normative problems."
        },
        context.normativeFiles,
        context.projectFiles
      );
      setResult(res || '');
    } catch (error) {
      console.error(error);
      setResult('An error occurred during the analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">4. Floor Plans (Graphical)</h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
          This tool analyzes drawings as images. It can spot ergonomic errors, door opening inconsistencies, room area deviations, and other visual problems.
        </p>
      </div>

      {!result && !loading && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SPECIAL QUESTION FOR DRAWINGS (OPTIONAL)</h3>
            </div>
            <p className="text-[10px] text-slate-400 italic">If you have a specific question, state it here, and the AI will focus on it first:</p>
            <textarea 
              value={specialQuestion}
              onChange={(e) => setSpecialQuestion(e.target.value)}
              placeholder="Example: Do the bathroom dimensions comply with the norms for people with disabilities..."
              rows={4}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none italic"
            />
          </div>

          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <Layout className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-400 text-sm mb-6">Click the button to start graphical analysis:</p>
            <button 
              onClick={handleAudit}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              <Play className="w-4 h-4 fill-current" />
              START ANALYSIS
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Performing graphical analysis...</p>
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
