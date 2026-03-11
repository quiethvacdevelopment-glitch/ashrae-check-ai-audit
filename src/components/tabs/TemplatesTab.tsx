import React, { useContext, useState } from 'react';
import { Bookmark, Plus, Trash2, Edit3, X, Check } from 'lucide-react';
import { ProjectContext } from '../../App';

export function TemplatesTab() {
  const context = useContext(ProjectContext);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  if (!context) return null;

  const { templates, setTemplates } = context;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newTemplate = {
      id: Date.now(),
      title: newTitle,
      description: newDesc
    };
    setTemplates(prev => [...prev, newTemplate]);
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleUpdate = (id: number) => {
    if (!newTitle.trim()) return;
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, title: newTitle, description: newDesc } : t));
    setEditingId(null);
    setNewTitle('');
    setNewDesc('');
  };

  const handleDelete = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setDeleteConfirmId(null);
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setNewTitle(t.title);
    setNewDesc(t.description);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">6. Templates</h2>
          <p className="text-sm text-slate-500">Manage your saved queries and calculation models.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setNewTitle(''); setNewDesc(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            CREATE NEW
          </button>
        )}
      </div>

      {(isAdding || editingId !== null) && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest">
              {editingId !== null ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}
            </h3>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-blue-400 hover:text-blue-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-400 uppercase">TITLE</label>
              <input 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Example: Thermal calculation"
                className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-400 uppercase">DESCRIPTION</label>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this template do..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>
            <button 
              onClick={() => editingId !== null ? handleUpdate(editingId) : handleAdd()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
            >
              <Check className="w-4 h-4" />
              {editingId !== null ? 'SAVE CHANGES' : 'ADD TEMPLATE'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:border-blue-200 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-all">
                <Bookmark className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">{t.title}</h4>
                <p className="text-xs text-slate-400">{t.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              {deleteConfirmId === t.id ? (
                <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg animate-in zoom-in-95">
                  <span className="text-[9px] font-bold text-red-600 px-2 uppercase">Delete?</span>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="p-1.5 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => startEdit(t)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(t.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {templates.length === 0 && !isAdding && (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <Bookmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No saved templates yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
