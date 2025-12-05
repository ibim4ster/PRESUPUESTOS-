

import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { generateBudgetPdf } from '../services/pdfGenerator';
import { PdfTemplate, Budget } from '../types';

// Icons
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const LayoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const TypeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;

export const ReportEditor: React.FC = () => {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const data = storageService.getTemplates();
    setTemplates(data);
    if(data.length > 0 && !selectedId) setSelectedId(data[0].id);
  }, []);

  const activeTemplate = templates.find(t => t.id === selectedId);

  // Update logic
  const updateTemplate = (updates: Partial<PdfTemplate>) => {
    if (!activeTemplate) return;
    const updated = { ...activeTemplate, ...updates };
    const newTemplates = templates.map(t => t.id === activeTemplate.id ? updated : t);
    setTemplates(newTemplates);
    // Debounce Save? For now direct save
    storageService.saveTemplate(updated);
  };

  // Create
  const handleCreate = () => {
      const base = templates[0]; // Copy first as base
      const newTpl: PdfTemplate = {
          ...base,
          id: crypto.randomUUID(),
          name: 'Nueva Plantilla',
          isDefault: false
      };
      storageService.saveTemplate(newTpl);
      setTemplates([...templates, newTpl]);
      setSelectedId(newTpl.id);
  };

  // Delete
  const handleDelete = (id: string) => {
      if(templates.length <= 1) return alert("Debe haber al menos una plantilla.");
      if(confirm("¿Eliminar plantilla?")) {
          storageService.deleteTemplate(id);
          const remain = templates.filter(t => t.id !== id);
          setTemplates(remain);
          setSelectedId(remain[0].id);
      }
  };

  // Preview Logic
  useEffect(() => {
    if (!activeTemplate) return;
    
    // Create Mock Budget
    const mockBudget: Budget = {
        id: 'preview', number: 'PRE-2024-001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'draft', clientId: '1', 
        clientData: { id: '1', commercialName: 'Empresa Ejemplo S.L.', legalName: 'Empresa Ejemplo S.L.', cif: 'B12345678', address: 'Calle Principal 123, Madrid', email: 'cliente@ejemplo.com', phone: '912345678', paymentMethod: 'Transferencia' },
        validityDays: 15, discountPercentage: 10, bonusAmount: 0, taxPercentage: 21, system: 'agora',
        lineItems: [
            { id: '1', type: 'section', reference: '', description: 'HARDWARE TPV', units: 0, price: 0 },
            { id: '2', type: 'product', reference: 'TPV-01', description: 'Terminal Punto de Venta Táctil 15"', units: 1, price: 850 },
            { id: '3', type: 'product', reference: 'PRN-02', description: 'Impresora Térmica 80mm Corte Automático', units: 2, price: 120 },
            { id: '4', type: 'section', reference: '', description: 'SERVICIOS', units: 0, price: 0 },
            { id: '5', type: 'product', reference: 'INS-01', description: 'Instalación y Configuración in-situ', units: 4, price: 45 }
        ]
    };
    const company = storageService.getCompanyProfile();
    
    try {
        const doc = generateBudgetPdf(mockBudget, company, activeTemplate);
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }

  }, [activeTemplate]); // Re-run when template changes

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6 pb-4">
        
        {/* SIDEBAR: Templates List */}
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm uppercase">Plantillas</h3>
                <button onClick={handleCreate} className="text-slate-500 hover:text-slate-900"><PlusIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {templates.map(t => (
                    <div 
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all group relative ${
                            selectedId === t.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-gray-100 hover:border-gray-300'
                        }`}
                    >
                        <div className="font-bold text-sm truncate">{t.name}</div>
                        <div className="text-[10px] opacity-70 flex justify-between mt-1">
                            <span>{t.layout}</span>
                            {t.isDefault && <span className="bg-green-500 text-white px-1 rounded">Defecto</span>}
                        </div>
                        {selectedId === t.id && (
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="p-1 hover:text-red-400"><TrashIcon/></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* EDITOR: Configuration */}
        {activeTemplate && (
        <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <input 
                    className="w-full font-bold text-lg text-slate-800 bg-transparent outline-none focus:border-b-2 border-slate-900" 
                    value={activeTemplate.name}
                    onChange={e => updateTemplate({ name: e.target.value })}
                />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* Style Section */}
                <section className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><PaletteIcon/> Colores</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Primario</label>
                            <div className="flex items-center gap-2">
                                <input type="color" className="w-8 h-8 rounded cursor-pointer border-none" value={activeTemplate.primaryColor} onChange={e => updateTemplate({primaryColor: e.target.value})} />
                                <span className="text-xs font-mono">{activeTemplate.primaryColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Secundario</label>
                            <div className="flex items-center gap-2">
                                <input type="color" className="w-8 h-8 rounded cursor-pointer border-none" value={activeTemplate.secondaryColor} onChange={e => updateTemplate({secondaryColor: e.target.value})} />
                                <span className="text-xs font-mono">{activeTemplate.secondaryColor}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Layout Section */}
                <section className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><LayoutIcon/> Estructura</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {['modern', 'classic', 'minimal'].map(l => (
                            <button 
                                key={l}
                                onClick={() => updateTemplate({ layout: l as any })}
                                className={`py-2 text-xs font-bold rounded border ${activeTemplate.layout === l ? 'bg-slate-100 border-slate-400 text-slate-900' : 'bg-white border-gray-200 text-slate-500'}`}
                            >
                                {l.charAt(0).toUpperCase() + l.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Fuente</label>
                        <select 
                            className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-slate-800"
                            value={activeTemplate.font}
                            onChange={e => updateTemplate({ font: e.target.value as any })}
                        >
                            <option value="helvetica">Helvetica (Sans)</option>
                            <option value="times">Times New Roman (Serif)</option>
                            <option value="courier">Courier (Mono)</option>
                        </select>
                    </div>
                </section>

                {/* Visibility Section */}
                <section className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><TypeIcon/> Contenido</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={activeTemplate.showLogo} onChange={e => updateTemplate({showLogo: e.target.checked})} className="accent-slate-900"/> Logo Empresa
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={activeTemplate.showImages} onChange={e => updateTemplate({showImages: e.target.checked})} className="accent-slate-900"/> Imágenes de Producto
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={activeTemplate.showLegal} onChange={e => updateTemplate({showLegal: e.target.checked})} className="accent-slate-900"/> Textos Legales
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={activeTemplate.showSignatures} onChange={e => updateTemplate({showSignatures: e.target.checked})} className="accent-slate-900"/> Cajas de Firma
                        </label>
                    </div>
                </section>

                <div className="pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                         <input type="checkbox" checked={activeTemplate.isDefault} onChange={e => updateTemplate({ isDefault: e.target.checked })} className="accent-slate-900 w-4 h-4"/>
                         Usar como Plantilla por Defecto
                    </label>
                </div>

            </div>
        </div>
        )}

        {/* PREVIEW */}
        <div className="flex-1 bg-slate-200 rounded-xl shadow-inner p-8 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full rounded shadow-2xl bg-white" />
            ) : (
                <div className="text-slate-400 font-bold">Generando Vista Previa...</div>
            )}
        </div>

    </div>
  );
};