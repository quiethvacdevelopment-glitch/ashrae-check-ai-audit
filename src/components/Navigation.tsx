import React from 'react';
import { cn } from '../lib/utils';

export type TabId = 'audit' | 'consultant' | 'problems' | 'plans' | 'volumes' | 'templates' | 'chat';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

const tabs = [
  { id: 'audit', label: '1. AUDIT', sub: 'Full Inspection' },
  { id: 'consultant', label: '2. CONSULTANT', sub: 'Calculations & Questions' },
  { id: 'problems', label: '3. PROBLEMS', sub: 'Dynamic Analysis' },
  { id: 'plans', label: '4. PLANS', sub: 'Local Analysis' },
  { id: 'volumes', label: '5. VOLUMES', sub: 'Actual vs Estimate' },
  { id: 'templates', label: '6. TEMPLATES', sub: 'Query Management' },
  { id: 'chat', label: '7. AI ASSISTANT', sub: 'Interactive Chat' },
] as const;

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6">
      <div className="flex gap-8 max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "py-4 px-1 border-b-2 transition-all relative group text-left",
                isActive 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <p className="text-[11px] font-bold tracking-tight">{tab.label}</p>
              <p className={cn(
                "text-[10px] mt-0.5",
                isActive ? "text-blue-600/70" : "text-slate-400"
              )}>{tab.sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
