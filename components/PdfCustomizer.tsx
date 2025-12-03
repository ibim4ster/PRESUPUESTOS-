
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { PdfConfig, DEFAULT_LEGAL_TEXTS, CustomLegalText } from '../types';

export const PdfCustomizer: React.FC = () => {
  // Initialize with null to indicate loading, or default
  const [config, setConfig] = useState<PdfConfig | null>(null);
  const [newClause, setNewClause] = useState('');

  // Load config on mount to ensure freshness
  useEffect(() => {
    const update = () => setConfig(storageService.getPdfConfig());
    update();
    const unsub = storageService.subscribe(update);
    return unsub;
  }, []);

  const handleSave = () => {
    if (config) {
      storageService.savePdfConfig(config);
      alert('¡Diseño guardado correctamente! Los próximos PDFs usarán esta configuración.');
    }
  };

  const handlePartnerUpload = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    if (!config) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ 
            ...config, 
            partnerLogos: { ...config.partnerLogos, [name]: reader.result as string } 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomClause = () => {
    if (!config || !newClause.trim()) return;
    const newItem: CustomLegalText = {
        id: crypto.randomUUID(),
        text: newClause,
        active: true
    };
    setConfig({
        ...config,
        customLegalTexts: [...(config.customLegalTexts || []), newItem]
    });
    setNewClause('');
  };

  const handleDeleteCustomClause = (id: string) => {
    if (!config) return;
    setConfig({
        ...config,
        customLegalTexts: config.customLegalTexts.filter(c => c.id !== id)
    });
  };

  const toggleCustomClause = (id: string) => {
    if (!config) return;
    setConfig({
        ...config,
        customLegalTexts: config.customLegalTexts.map(c => 
            c.id === id ? { ...c, active: !c.active } : c
        )
    });
  };

  if (!config) return <div className="p-8 text-center">Cargando configuración...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
        <div>
           <h2 className="text-2xl font-bold text-primary">Personalizador de PDF</h2>
           <p className="text-slate-500">Diseña la apariencia de tus presupuestos.</p>
        </div>
        <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow hover:bg-slate-800 flex items-center gap-2 font-bold transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
           GUARDAR DISEÑO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Branding & Colors */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                 <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                 Colores ÁGORA
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Color Principal (Barra Superior y Totales)</label>
                    <div className="flex items-center gap-2">
                       <input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={config.primaryColor} onChange={e => setConfig({...config, primaryColor: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Color Secundario (Fondos)</label>
                    <div className="flex items-center gap-2">
                       <input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={config.secondaryColor} onChange={e => setConfig({...config, secondaryColor: e.target.value})} />
                    </div>
                 </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-4 mt-8 border-b pb-2 flex items-center gap-2">
                 <span className="w-3 h-3 bg-black rounded-full"></span>
                 Colores SAGE 50
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Color Principal (Negro)</label>
                    <div className="flex items-center gap-2">
                       <input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={config.sagePrimaryColor} onChange={e => setConfig({...config, sagePrimaryColor: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Color Secundario (Verde)</label>
                    <div className="flex items-center gap-2">
                       <input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={config.sageSecondaryColor} onChange={e => setConfig({...config, sageSecondaryColor: e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="mt-6 border-t pt-4">
                 <label className="block text-xs font-bold text-slate-500 mb-1">Texto del Título (H1)</label>
                 <input className="w-full border border-gray-300 rounded text-sm p-2 bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none" value={config.titleText} onChange={e => setConfig({...config, titleText: e.target.value})} />
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Elementos Visibles</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={config.showLogo} onChange={e => setConfig({...config, showLogo: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Logo Empresa
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={config.showCompanyDetails} onChange={e => setConfig({...config, showCompanyDetails: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Datos Empresa
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={config.showImages} onChange={e => setConfig({...config, showImages: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Imágenes Productos
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={config.showLegal} onChange={e => setConfig({...config, showLegal: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Sección Legal
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={config.showSignatures} onChange={e => setConfig({...config, showSignatures: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Cajas de Firma
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={config.showPageNumbers} onChange={e => setConfig({...config, showPageNumbers: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Numeración de Páginas
                </label>
                 <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={config.showQr} onChange={e => setConfig({...config, showQr: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Código QR (Validación)
                </label>
              </div>
           </div>
        </div>

        {/* Column 2: Legal Texts */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Cláusulas Legales</h3>
              
              <div className="mb-6">
                  <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Textos por Defecto</p>
                  <div className="space-y-2">
                     {DEFAULT_LEGAL_TEXTS.map(txt => (
                        <label key={txt.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 cursor-pointer transition-colors">
                           <input 
                             type="checkbox" 
                             checked={config.legalTextIds.includes(txt.id)} 
                             onChange={e => {
                                const newIds = e.target.checked 
                                  ? [...config.legalTextIds, txt.id]
                                  : config.legalTextIds.filter(id => id !== txt.id);
                                setConfig({...config, legalTextIds: newIds});
                             }} 
                             className="mt-1 rounded text-accent w-4 h-4 flex-shrink-0"
                           />
                           <span className="text-xs text-slate-700 leading-relaxed">{txt.text}</span>
                        </label>
                     ))}
                  </div>
              </div>

              <div className="mb-6">
                 <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Cláusulas Personalizadas</p>
                 <div className="flex gap-2 mb-3">
                     <input 
                        className="flex-1 border border-gray-300 rounded text-sm p-2 bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none"
                        placeholder="Escribe una nueva cláusula..."
                        value={newClause}
                        onChange={(e) => setNewClause(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddCustomClause();
                        }}
                     />
                     <button onClick={handleAddCustomClause} className="bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded text-slate-700 text-lg font-bold transition-colors">+</button>
                 </div>
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                     {(config.customLegalTexts || []).map(txt => (
                        <div key={txt.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors">
                           <input 
                             type="checkbox" 
                             checked={txt.active} 
                             onChange={() => toggleCustomClause(txt.id)} 
                             className="mt-1 rounded text-accent w-4 h-4 flex-shrink-0 cursor-pointer"
                           />
                           <span className={`text-xs text-slate-600 leading-relaxed flex-1 ${!txt.active ? 'opacity-50 line-through' : ''}`}>{txt.text}</span>
                           <button onClick={() => handleDeleteCustomClause(txt.id)} className="text-slate-400 hover:text-red-500 px-1 font-bold text-lg" title="Eliminar">×</button>
                        </div>
                     ))}
                     {(!config.customLegalTexts || config.customLegalTexts.length === 0) && (
                         <div className="text-xs text-slate-400 italic text-center py-2">No hay cláusulas personalizadas</div>
                     )}
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Texto Pie de Página (Footer)</label>
                 <textarea 
                    className="w-full border border-gray-300 rounded text-sm p-2 h-20 bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none resize-none" 
                    value={config.footerText} 
                    onChange={e => setConfig({...config, footerText: e.target.value})}
                    placeholder="Ej: Gracias por su confianza. Presupuesto válido por 15 días."
                 />
              </div>
           </div>
        </div>

        {/* Column 3: Partner Logos */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Logos Footer (Partners)</h3>
              <div className="space-y-6">
                 {['agora', 'concord', 'cashloogy'].map(p => (
                   <div key={p}>
                      <label className="block text-xs font-bold uppercase mb-2 text-slate-500 tracking-wider">{p}</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors relative group">
                         <div className="h-12 flex items-center justify-center overflow-hidden w-full">
                           {/* @ts-ignore */}
                           {config.partnerLogos[p as keyof typeof config.partnerLogos] ? 
                             /* @ts-ignore */
                             <img src={config.partnerLogos[p as keyof typeof config.partnerLogos]} className="max-h-full max-w-full object-contain" /> : 
                             <span className="text-xs text-gray-300">Sin logo</span>
                           }
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 pointer-events-none transition-opacity">
                             <span className="bg-white px-2 py-1 text-xs rounded shadow text-slate-700 font-bold">Cambiar</span>
                         </div>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handlePartnerUpload(e, p)} accept="image/*" />
                      </div>
                      {/* @ts-ignore */}
                      {config.partnerLogos[p as keyof typeof config.partnerLogos] && (
                          <button 
                            onClick={() => setConfig({...config, partnerLogos: {...config.partnerLogos, [p]: ''}})}
                            className="text-xs text-red-400 hover:text-red-600 mt-1 w-full text-center"
                          >
                            Eliminar Logo
                          </button>
                      )}
                   </div>
                 ))}
              </div>
              <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 leading-relaxed">
                 <strong>Nota:</strong> Los logos cargados aquí aparecerán alineados en el centro del pie de página de la última hoja del documento PDF generado.
              </div>
           </div>
        </div>
      
      </div>
    </div>
  );
}
