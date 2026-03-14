import React from 'react';
import { LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, signOut, isTrialActive, trialDaysLeft } = useAuth();
  return (
    <header className="bg-[#1e293b] text-white py-4 px-8 border-b border-slate-800">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-white">ASHRAE Check AI Audit</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Interactive Audit of Building Norms</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-slate-400">
              {user?.email || 'User'}
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-white uppercase">
                Premium
                {isTrialActive && (
                  <span className="text-blue-400 ml-2 normal-case font-medium">
                    ({trialDaysLeft} days left)
                  </span>
                )}
              </span>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
