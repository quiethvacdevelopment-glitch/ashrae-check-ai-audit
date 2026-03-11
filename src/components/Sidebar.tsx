import React from 'react';
import { 
  Building2, 
  Construction, 
  Wind, 
  Droplets, 
  Flame, 
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ModuleId = 'arch' | 'struct' | 'hvac' | 'water' | 'fire' | 'power';

interface SidebarProps {
  activeModule: ModuleId;
  onModuleChange: (id: ModuleId) => void;
}

const modules = [
  { id: 'arch', name: 'Architectural Audit', icon: Building2 },
  { id: 'struct', name: 'Structural Audit', icon: Construction },
  { id: 'hvac', name: 'HVAC Systems', icon: Wind },
  { id: 'water', name: 'Water Supply', icon: Droplets },
  { id: 'fire', name: 'Fire Suppression', icon: Flame },
  { id: 'power', name: 'Power Supply', icon: Zap },
] as const;

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-72 bg-[#151619] border-r border-white/10 flex flex-col h-screen overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <LayoutDashboard className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tighter text-xl leading-none">ASHRAE Check AI</h1>
            <p className="text-emerald-500/70 text-[10px] uppercase tracking-widest font-mono mt-1">Smart Audit Engine</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold px-4 mb-4">Modules</p>
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-emerald-500 text-black shadow-[0_4px_12px_rgba(16,185,129,0.2)]" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-black" : "text-emerald-500/70 group-hover:text-emerald-500")} />
              <span className="text-sm font-medium">{module.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 bg-black/20 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs font-bold text-white/50">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Engineer</p>
            <p className="text-xs text-white/40 truncate">Expert Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
