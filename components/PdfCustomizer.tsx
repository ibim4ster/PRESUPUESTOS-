
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
      alert('¡Diseño guardado correctamente! Los próximos PDFs usarán esta configuración.');
    }
  };

  const currentConfig = config ? config[activeTab] : null;

  const updateCurrentConfig = (updates: Partial<PdfSystemConfig>) => {
    if (!config) return;
    setConfig({
      ...config,
      [activeTab]: { ...config[activeTab], ...updates }
    });
  };

  const compressImage = (file: File, maxWidth = 500): Promise<string> => {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
              const img = new Image();
              img.src = event.target?.result as string;
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;

                  if (width > maxWidth) {
                      height = Math.round((height * maxWidth) / width);
                      width = maxWidth;
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/png', 0.8));
              };
          };
      });
  };

  const handlePartnerUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: string) => {
    if (!config) return;
    const file = e.target.files?.[0];
    if (file) {
      try {
          const compressed = await compressImage(file, 400);
          const currentLogos = config[activeTab].partnerLogos;
          updateCurrentConfig({
              partnerLogos: { ...currentLogos, [slot]: compressed }
          });
      } catch (e) {
          alert('Error al procesar la imagen.');
      }
    }
  };

  const handleRemovePartner = (slot: string) => {
      if(!config) return;
      const currentLogos = config[activeTab].partnerLogos;
      updateCurrentConfig({
          partnerLogos: { ...currentLogos, [slot]: '' }
      });
  };

  const handleAddCustomClause = () => {
    if (!currentConfig || !newClause.trim()) return;
    const newItem: CustomLegalText = {
        id: crypto.randomUUID(),
        text: newClause,
        active: true
    };
    updateCurrentConfig({
        customLegalTexts: [...(currentConfig.customLegalTexts || []), newItem]
    });
    setNewClause('');
  };

  const handleDeleteCustomClause = (id: string) => {
    if (!currentConfig) return;
    updateCurrentConfig({
        customLegalTexts: currentConfig.customLegalTexts.filter(c => c.id !== id)
    });
  };

  const toggleCustomClause = (id: string) => {
    if (!currentConfig) return;
    updateCurrentConfig({
        customLegalTexts: currentConfig.customLegalTexts.map(c => 
            c.id === id ? { ...c, active: !c.active } : c
        )
    });
  };

  const toggleLegalDefault = (id: string, checked: boolean) => {
      if(!currentConfig) return;
      const newIds = checked 
          ? [...currentConfig.legalTextIds, id]
          : currentConfig.legalTextIds.filter(lid => lid !== id);
      updateCurrentConfig({ legalTextIds: newIds });
  };

  if (!config || !currentConfig) return <div className="p-8 text-center">Cargando configuración...</div>;

  const labels = {
      agora: 'Ágora',
      sage: 'Sage 50',
      sage200: 'Sage 200',
      sagedespachos: 'Sage Despachos'
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-primary">Personalizador de PDF</h2>
           <p className="text-slate-500">Diseña la apariencia de tus presupuestos por sistema.</p>
        </div>
        <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow hover:bg-slate-800 flex items-center gap-2 font-bold transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
           GUARDAR DISEÑO
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-200 p-1 rounded-lg w-full max-w-2xl mx-auto flex overflow-x-auto">
          {(['agora', 'sage', 'sage200', 'sagedespachos'] as SystemType[]).map(sys => (
             <button 
                key={sys}
                onClick={() => setActiveTab(sys)}
                className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap ${
                    activeTab === sys 
                        ? sys === 'agora' ? 'bg-red-600 text-white shadow' : 'bg-[#00d061] text-black shadow' 
                        : 'text-slate-600 hover:text-slate-800'
                }`}
             >
                {labels[sys]}
             </button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Column 1: Branding */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className={`font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2`}>
                 <span className={`w-3 h-3 rounded-full ${activeTab === 'agora' ? 'bg-red-600' : 'bg-[#00d061]'}`}></span>
                 Estilo {labels[activeTab]}
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Color Principal</label>
                    <div className="flex items-center gap-2">
                       <input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={currentConfig.primaryColor} onChange={e => updateCurrentConfig({ primaryColor: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Color Secundario</label>
                    <div className="flex items-center gap-2">
                       <input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={currentConfig.secondaryColor} onChange={e => updateCurrentConfig({ secondaryColor: e.target.value})} />
                    </div>
                 </div>
                 <div className="mt-6 border-t pt-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Texto del Título (H1)</label>
                    <input className="w-full border border-gray-300 rounded text-sm p-2 bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none" value={currentConfig.titleText} onChange={e => updateCurrentConfig({ titleText: e.target.value})} />
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Opciones de Visualización</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={currentConfig.showLogo} onChange={e => updateCurrentConfig({showLogo: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Logo Empresa
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={currentConfig.showCompanyDetails} onChange={e => updateCurrentConfig({showCompanyDetails: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Datos Empresa
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={currentConfig.showImages} onChange={e => updateCurrentConfig({showImages: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Imágenes Productos
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={currentConfig.showLegal} onChange={e => updateCurrentConfig({showLegal: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Sección Legal
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={currentConfig.showSignatures} onChange={e => updateCurrentConfig({showSignatures: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Cajas de Firma
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={currentConfig.showPageNumbers} onChange={e => updateCurrentConfig({showPageNumbers: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Numeración de Páginas
                </label>
                 <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                   <input type="checkbox" checked={currentConfig.showQr} onChange={e => updateCurrentConfig({showQr: e.target.checked})} className="rounded text-accent w-4 h-4" />
                   Mostrar Código QR (Validación)
                </label>
              </div>
           </div>
        </div>

        {/* Column 2: Legal Texts */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Cláusulas Legales ({labels[activeTab]})</h3>
              
              <div className="mb-6">
                  <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Textos por Defecto</p>
                  <div className="space-y-2">
                     {DEFAULT_LEGAL_TEXTS.map(txt => (
                        <label key={txt.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 cursor-pointer transition-colors">
                           <input 
                             type="checkbox" 
                             checked={currentConfig.legalTextIds.includes(txt.id)} 
                             onChange={e => toggleLegalDefault(txt.id, e.target.checked)} 
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
                     {(currentConfig.customLegalTexts || []).map(txt => (
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
                     {(!currentConfig.customLegalTexts || currentConfig.customLegalTexts.length === 0) && (
                         <div className="text-xs text-slate-400 italic text-center py-2">No hay cláusulas personalizadas</div>
                     )}
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Texto Pie de Página (Footer)</label>
                 <textarea 
                    className="w-full border border-gray-300 rounded text-sm p-2 h-20 bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none resize-none" 
                    value={currentConfig.footerText} 
                    onChange={e => updateCurrentConfig({ footerText: e.target.value})}
                    placeholder="Ej: Gracias por su confianza."
                 />
              </div>
           </div>
        </div>

        {/* Column 3: Partner Logos */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Logos Footer ({labels[activeTab]})</h3>
              
              <div className="space-y-6">
                 {['slot1', 'slot2', 'slot3'].map((p, index) => {
                   
                   let label = `Logo ${index + 1}`;
                   if(activeTab === 'agora') {
                       if(index === 0) label = "Logo Ágora";
                       if(index === 1) label = "Logo Concord";
                       if(index === 2) label = "Logo Cashlogy";
                   } else {
                       label = `Logo ${labels[activeTab]} Partner ${index + 1}`;
                   }

                   return (
                   <div key={p}>
                      <label className="block text-xs font-bold uppercase mb-2 text-slate-500 tracking-wider">{label}</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors relative group">
                         <div className="h-12 flex items-center justify-center overflow-hidden w-full">
                           {/* @ts-ignore */}
                           {currentConfig.partnerLogos[p as keyof typeof currentConfig.partnerLogos] ? 
                             /* @ts-ignore */
                             <img src={currentConfig.partnerLogos[p as keyof typeof currentConfig.partnerLogos]} className="max-h-full max-w-full object-contain" /> : 
                             <span className="text-xs text-gray-300">Sin logo</span>
                           }
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 pointer-events-none transition-opacity">
                             <span className="bg-white px-2 py-1 text-xs rounded shadow text-slate-700 font-bold">Cambiar</span>
                         </div>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handlePartnerUpload(e, p)} accept="image/*" />
                      </div>
                      {/* @ts-ignore */}
                      {currentConfig.partnerLogos[p as keyof typeof currentConfig.partnerLogos] && (
                          <button 
                            onClick={() => handleRemovePartner(p)}
                            className="text-xs text-red-400 hover:text-red-600 mt-1 w-full text-center"
                          >
                            Eliminar Logo
                          </button>
                      )}
                   </div>
                 )})}
              </div>
              <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 leading-relaxed">
                 <strong>Nota:</strong> Estos logos son específicos para los presupuestos de {labels[activeTab]}.
              </div>
           </div>
        </div>
      
      </div>
    </div>
  );
}