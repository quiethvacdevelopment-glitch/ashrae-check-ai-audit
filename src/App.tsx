/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, createContext, useContext, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { AccessExpiredOverlay } from './components/AccessExpiredOverlay';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { AuditTab } from './components/tabs/AuditTab';
import { ConsultantTab } from './components/tabs/ConsultantTab';
import { ChatTab } from './components/tabs/ChatTab';
import { ProblemsTab } from './components/tabs/ProblemsTab';
import { PlansTab } from './components/tabs/PlansTab';
import { VolumesTab } from './components/tabs/VolumesTab';
import { TemplatesTab } from './components/tabs/TemplatesTab';
import { FolderOpen, Save, FileText, X, Trash2 } from 'lucide-react';

interface Template {
  id: number;
  title: string;
  description: string;
}

interface ProjectContextType {
  normativeFiles: File[];
  setNormativeFiles: React.Dispatch<React.SetStateAction<File[]>>;
  projectFiles: File[];
  setProjectFiles: React.Dispatch<React.SetStateAction<File[]>>;
  projectName: string;
  setProjectName: (name: string) => void;
  projectType: string;
  setProjectType: (type: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (info: string) => void;
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

function AppContent() {
  const { user, loading, hasAccess } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('audit');
  const [normativeFiles, setNormativeFiles] = useState<File[]>([]);
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Residential Building');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [templates, setTemplates] = useState<Template[]>([
    { id: 1, title: 'Insolation Calculation', description: 'Calculates the duration of insolation in residential rooms according to ASHRAE standards.' },
    { id: 2, title: 'Fire Exits', description: 'Checks the number and width of evacuation exits in multifunctional buildings.' },
    { id: 3, title: 'Parking Spaces', description: 'Calculates the required number of parking spaces based on the number of apartments.' },
  ]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const projectData = {
      projectName,
      projectType,
      additionalInfo,
      normativeFilesCount: normativeFiles.length,
      projectFilesCount: projectFiles.length,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName || 'project'}_config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.projectName !== undefined) setProjectName(data.projectName);
        if (data.projectType !== undefined) setProjectType(data.projectType);
        if (data.additionalInfo !== undefined) setAdditionalInfo(data.additionalInfo);
        alert("Project data restored successfully.");
      } catch (err) {
        console.error("Error parsing project file", err);
        alert("Error reading file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const contextValue: ProjectContextType = {
    normativeFiles, setNormativeFiles,
    projectFiles, setProjectFiles,
    projectName, setProjectName,
    projectType, setProjectType,
    additionalInfo, setAdditionalInfo,
    templates, setTemplates
  };

  const removeFile = (type: 'normative' | 'project', index: number) => {
    if (type === 'normative') {
      setNormativeFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setProjectFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const totalSize = [...normativeFiles, ...projectFiles].reduce((acc, file) => acc + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
  const progressPercent = Math.min((totalSize / (50 * 1024 * 1024)) * 100, 100);

  // Check for payment success on URL return from checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Auth loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show login/signup page
  if (!user) {
    return <AuthPage />;
  }

  return (
    <ProjectContext.Provider value={contextValue}>
      {/* Access expired overlay — shows over dashboard */}
      {!hasAccess && <AccessExpiredOverlay />}
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Action Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-3 w-full">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Context Volume:</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500">{totalSizeMB} / 50.0 MB</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] text-slate-400 font-medium italic">All data is processed securely within your local browser environment.</p>
                <p className="text-[10px] text-amber-600 font-medium italic">Normative Base: The number of pages should not exceed 300.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleOpen} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                Open Project
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden w-full">
          <div className="w-full h-full p-8 flex gap-8">
            {/* Left Sidebar Configuration */}
            {activeTab !== 'templates' && (
              <div className="w-80 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">
                {/* Normative Base */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-blue-600">Normative Base</h3>
                    <button 
                      onClick={() => document.getElementById('normative-upload')?.click()}
                      className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
                    >
                      ADD
                      <input 
                        id="normative-upload"
                        type="file" 
                        multiple 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={(e) => e.target.files && setNormativeFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                    Attach ASHRAE standards (PDF):
                  </p>
                  <div className="space-y-2">
                    {normativeFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="text-[10px] text-slate-600 truncate font-medium">{f.name}</span>
                        </div>
                        <button 
                          onClick={() => removeFile('normative', i)} 
                          className="text-slate-300 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {normativeFiles.length === 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                        <p className="text-[10px] text-slate-400 italic">Example: ASHRAE 90.1-2019</p>
                      </div>
                    )}
                  </div>
                  {normativeFiles.length > 0 && (
                    <button 
                      onClick={() => setNormativeFiles([])}
                      className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      CLEAR LIST
                    </button>
                  )}
                </div>

                {/* Project Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Project Details</h3>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Project Name</label>
                    <input 
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., Residential Complex in New York"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                    <select 
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option>Residential Building</option>
                      <option>Public Building</option>
                      <option>Industrial Building</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Additional Information</label>
                    <textarea 
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Specify number of floors..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Project Files */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800">PROJECT FILES</h3>
                    <button 
                      onClick={() => document.getElementById('project-upload')?.click()}
                      className="px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      ATTACH
                      <input 
                        id="project-upload"
                        type="file" 
                        multiple 
                        accept=".pdf,.png,.jpg,.jpeg" 
                        className="hidden" 
                        onChange={(e) => e.target.files && setProjectFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {projectFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-[10px] text-slate-600 truncate font-medium">{f.name}</span>
                        </div>
                        <button 
                          onClick={() => removeFile('project', i)} 
                          className="text-slate-300 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {projectFiles.length > 0 && (
                    <button 
                      onClick={() => setProjectFiles([])}
                      className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      CLEAR LIST
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {activeTab === 'audit' && <AuditTab />}
              {activeTab === 'consultant' && <ConsultantTab />}
              {activeTab === 'problems' && <ProblemsTab />}
              {activeTab === 'plans' && <PlansTab />}
              {activeTab === 'volumes' && <VolumesTab />}
              {activeTab === 'templates' && <TemplatesTab />}
              {activeTab === 'chat' && <ChatTab />}
            </div>
          </div>
        </main>

        <footer className="py-6 px-8 text-center border-t border-slate-200 bg-white">
          <p className="text-[11px] text-slate-400 font-medium">© 2024 ASHRAE Check AI Audit - All rights reserved.</p>
        </footer>
      </div>
    </ProjectContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
