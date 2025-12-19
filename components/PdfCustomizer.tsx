
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { PdfConfig, DEFAULT_LEGAL_TEXTS, CustomLegalText, PdfSystemConfig, SystemType } from '../types';

export const PdfCustomizer: React.FC = () => {
  const [config, setConfig] = useState<PdfConfig | null>(null);
  const [activeTab, setActiveTab] = useState<SystemType>('agora');
  const [newClause, setNewClause] = useState('');

  useEffect(() => {
    const update = () => setConfig(storageService.getPdfConfig());
    update();
    const unsub = storageService.subscribe(update);
    return unsub;
  }, []);

  const handleSave = () => {
    if (config) {
      storageService.savePdfConfig(config);
      alert('¡Diseño guardado correctamente!');
    }
  };

  const currentConfig = config ? config[activeTab] : null;

  const updateCurrentConfig = (updates: Partial<PdfSystemConfig>) => {
    if (!config) return;
    setConfig({ ...config, [activeTab]: { ...config[activeTab], ...updates } });
  };

  if (!config || !currentConfig) return <div className="p-8 text-center theme-text-muted">Cargando configuración...</div>;

  const labels = { agora: 'Ágora', sage: 'Sage 50', sage200: 'Sage 200', sagedespachos: 'Sage Despachos' };

  return (
    <div className="space-y-8 pb-20 theme-text-main">
      <div className="flex flex-col md:flex-row justify-between items-center theme-card p-4 rounded-xl shadow-sm sticky top-0 z-10 gap-4">
        <div>
           <h2 className="text-2xl font-bold">Personalizador de PDF</h2>
           <p className="theme-text-muted">Configura la apariencia de tus presupuestos.</p>
        </div>
        <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold">GUARDAR DISEÑO</button>
      </div>

      <div className="bg-slate-400/10 p-1 rounded-lg w-full max-w-2xl mx-auto flex">
          {(['agora', 'sage', 'sage200', 'sagedespachos'] as SystemType[]).map(sys => (
             <button key={sys} onClick={() => setActiveTab(sys)} className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-md transition-all ${activeTab === sys ? 'theme-bg-card shadow-sm theme-text-main' : 'theme-text-muted hover:theme-text-main'}`}>{labels[sys]}</button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="space-y-6">
           <div className="theme-card p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-4 border-b theme-border pb-2">Estilo {labels[activeTab]}</h3>
              <div className="space-y-4">
                 <div><label className="block text-xs font-bold theme-text-muted mb-1">Color Principal</label><input type="color" className="h-10 w-full rounded theme-border cursor-pointer bg-transparent" value={currentConfig.primaryColor} onChange={e => updateCurrentConfig({ primaryColor: e.target.value})} /></div>
                 <div><label className="block text-xs font-bold theme-text-muted mb-1">Color Secundario</label><input type="color" className="h-10 w-full rounded theme-border cursor-pointer bg-transparent" value={currentConfig.secondaryColor} onChange={e => updateCurrentConfig({ secondaryColor: e.target.value})} /></div>
              </div>
           </div>
           <div className="theme-card p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-4 border-b theme-border pb-2">Opciones</h3>
              <div className="space-y-3">
                {['showCoverPage', 'showLogo', 'showCompanyDetails', 'showImages', 'showLegal', 'showSignatures', 'showPageNumbers'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:theme-bg-main p-1 rounded">
                        <input type="checkbox" checked={(currentConfig as any)[opt]} onChange={e => updateCurrentConfig({[opt]: e.target.checked})} className="rounded text-blue-600 w-4 h-4" />
                        <span className="capitalize">{opt.replace(/show/,'').replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                ))}
              </div>
           </div>
        </div>

        <div className="space-y-6 md:col-span-2">
           <div className="theme-card p-6 rounded-xl shadow-sm h-full">
              <h3 className="font-bold mb-4 border-b theme-border pb-2">Cláusulas Legales</h3>
              <div className="mb-6">
                <div className="space-y-2">{DEFAULT_LEGAL_TEXTS.map(txt => (<label key={txt.id} className="flex items-start gap-2 p-2 hover:theme-bg-main rounded transition-colors cursor-pointer"><input type="checkbox" checked={currentConfig.legalTextIds.includes(txt.id)} onChange={e => { const newIds = e.target.checked ? [...currentConfig.legalTextIds, txt.id] : currentConfig.legalTextIds.filter(lid => lid !== txt.id); updateCurrentConfig({ legalTextIds: newIds }); }} className="mt-1 w-4 h-4"/><span className="text-xs">{txt.text}</span></label>))}</div>
              </div>
              <div className="flex gap-2 mb-4"><input className="flex-1 theme-input border rounded text-sm p-2 outline-none" placeholder="Nueva cláusula..." value={newClause} onChange={(e) => setNewClause(e.target.value)} /><button onClick={() => { if(newClause.trim()) { updateCurrentConfig({ customLegalTexts: [...(currentConfig.customLegalTexts || []), { id: crypto.randomUUID(), text: newClause, active: true }] }); setNewClause(''); } }} className="theme-bg-main theme-text-main px-4 rounded font-bold">+</button></div>
              <div><label className="block text-xs font-bold theme-text-muted mb-1">Texto Pie de Página</label><textarea className="w-full theme-input border rounded text-sm p-2 h-20 resize-none" value={currentConfig.footerText} onChange={e => updateCurrentConfig({ footerText: e.target.value})} /></div>
           </div>
        </div>
      </div>
    </div>
  );
}
