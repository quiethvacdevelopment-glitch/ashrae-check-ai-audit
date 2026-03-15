import React from 'react';
import { LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onUpgradeClick?: () => void;
}

export function Header({ onUpgradeClick }: HeaderProps) {
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
            <div className="flex items-center gap-3">
              {isTrialActive ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Free Trial</span>
                    <span className="text-xs font-bold text-white leading-none">{trialDaysLeft} days left</span>
                  </div>
                  <button 
                    onClick={onUpgradeClick}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-500/20 transition-all uppercase tracking-wider active:scale-95"
                  >
                    Upgrade
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Premium Access
                  </span>
                </div>
              )}
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
