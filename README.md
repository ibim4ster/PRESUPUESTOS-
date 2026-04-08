# PRESUPUESTOS- - Sistema de Gestión de Presupuestos Multi-ERP

Una aplicación web moderna para la creación y gestión de presupuestos comerciales con soporte para múltiples sistemas ERP (Ágora y Sage). [1](#0-0) 

## 🚀 Características Principales

### Gestión de Presupuestos
- Creación y edición de presupuestos con cálculo automático de totales, IVA e IRPF [2](#0-1) 
- Generación de PDFs personalizados por sistema ERP [3](#0-2) 
- Seguimiento de estados (pendiente, aceptado, rechazado)
- Gestión de plazos de pago y vencimientos [4](#0-3) 

### Multi-ERP
- Soporte para Ágora, Sage 50, Sage 200 y Sage Despachos [5](#0-4) 
- Configuración visual independiente para cada sistema
- Filtrado de productos por sistema

### Gestión de Clientes y Productos
- Base de datos de clientes con historial de presupuestos [6](#0-5) 
- Catálogo de productos y kits/packs
- Control de gastos para cálculo de rentabilidad

### IA Integrada
- Generación asistida de textos comerciales con IA [7](#0-6) 
- Mejora de descripciones de productos

## 🏗️ Arquitectura

### Patrón Local-First con Sincronización
La aplicación utiliza un patrón "Dual-Write" donde los datos se guardan inmediatamente en localStorage para respuesta instantánea y luego se sincronizan con Firebase Firestore [8](#0-7) .

### Estructura de Componentes
- **BudgetEditor**: Editor principal de presupuestos
- **ClientManager**: Gestión de clientes y su historial
- **ProductManager**: Catálogo de productos
- **PdfCustomizer**: Personalización de PDFs por sistema [9](#0-8) 
- **Settings**: Configuración global de la aplicación [10](#0-9) 

## 📦 Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar Firebase (opcional para modo local):
   - Crear proyecto en Firebase Console
   - Configurar credenciales en Settings [11](#0-10) 

4. Iniciar aplicación:
```bash
npm start
```

## 🔧 Configuración

### Configuración de Empresa
- Datos fiscales (CIF, dirección, etc.) [12](#0-11) 
- Logo y preferencias visuales

### Personalización de PDFs
- Colores y branding por sistema ERP [13](#0-12) 
- Cláusulas legales personalizadas [14](#0-13) 
- Logos de partners en footer [15](#0-14) 

## 🌐 Idioma

La aplicación utiliza terminología en español para alinearse con los sistemas ERP objetivo:
- **Presupuesto**: Budget/Quote
- **Cliente**: Client/Customer  
- **Producto**: Product
- **Gasto**: Expense
- **Tarea**: Task [16](#0-15) 

## 🔐 Seguridad

- Sistema de autenticación con rotación de contraseñas cada 15 días
- Almacenamiento seguro de hashes de contraseñas
- Sesiones gestionadas en sessionStorage

## 📊 Flujo de Trabajo

1. **Configuración Inicial**: Datos de empresa y sistemas ERP
2. **Gestión de Catálogo**: Carga de productos y clientes
3. **Creación de Presupuestos**: Uso del editor con asistencia de IA
4. **Generación de PDF**: Exportación con branding personalizado
5. **Seguimiento**: Control de estados y plazos de pago

## 🛠️ Tecnologías

- React con TypeScript
- Firebase Firestore (sincronización)
- jsPDF (generación de PDFs)
- Tailwind CSS (estilos)
- IA para generación de texto

---

## Notes

Este README está basado en la estructura y funcionalidades observadas en el códigobase. La aplicación está diseñada específicamente para el mercado español con integración con sistemas ERP locales como Ágora y Sage. El patrón local-first asegura funcionamiento offline con sincronización cuando hay conexión.

Wiki pages you might want to explore:
- [Settings & PDF Customizer (ibim4ster/PRESUPUESTOS-)](/wiki/ibim4ster/PRESUPUESTOS-#4.6)
- [Glossary (ibim4ster/PRESUPUESTOS-)](/wiki/ibim4ster/PRESUPUESTOS-#7)

### Citations

**File:** components/BudgetEditor.tsx (L515-521)
```typescript
                  <button 
                    onClick={generateAiIntro} 
                    disabled={isAiGenerating}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors"
                  >
                      <SparklesIcon /> {isAiGenerating ? 'Redactando...' : 'Generar con IA'}
                  </button>
```

**File:** components/BudgetEditor.tsx (L598-614)
```typescript
                             </div>
                             <div className="flex justify-between text-xs">
                                 <span className="text-gray-400">Base Imponible</span>
                                 <span className="font-mono">{taxableBase.toFixed(2)} €</span>
                             </div>
                             <div className="h-px bg-gray-600 my-2"></div>
                             <div className="flex justify-between items-center">
                                 <span className="text-xs font-bold uppercase text-gray-300">Beneficio Neto</span>
                                 <span className={`font-mono font-bold text-lg ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{netProfit.toFixed(2)} €</span>
                             </div>
                             <div className="bg-gray-900 rounded-lg p-2 flex items-center justify-between border border-gray-700">
                                 <span className="text-xs font-bold text-gray-400">Margen Comercial</span>
                                 <span className={`text-sm font-bold px-2 py-0.5 rounded ${marginBg} ${marginColor}`}>
                                     {marginPercentage.toFixed(2)}%
                                 </span>
                             </div>
                        </div>
```

**File:** components/BudgetEditor.tsx (L620-642)
```typescript
                {/* Payment Terms Widget (NEW) */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2"><CalendarIcon /> Vencimientos / Plazos de Pago</h4>
                    <div className="space-y-2 mb-3">
                        {(budget.paymentTerms || []).map((term) => (
                            <div key={term.id} className="flex gap-2 items-center text-xs">
                                <input className="flex-1 border border-gray-300 rounded p-1.5 bg-white text-slate-800" value={term.concept} onChange={e => updatePaymentTerm(term.id, 'concept', e.target.value)} placeholder="Concepto (ej: Firma)" />
                                <div className="w-16 relative">
                                    <input className="w-full border border-gray-300 rounded p-1.5 bg-white text-slate-800 text-right pr-4" type="number" value={term.percentage} onChange={e => updatePaymentTerm(term.id, 'percentage', parseFloat(e.target.value))} />
                                    <span className="absolute right-1 top-1.5 text-gray-400">%</span>
                                </div>
                                <div className="w-20 relative">
                                    <input className="w-full border border-gray-300 rounded p-1.5 bg-gray-50 text-slate-500 text-right pr-4" type="number" value={term.amount.toFixed(2)} readOnly />
                                    <span className="absolute right-1 top-1.5 text-gray-400">€</span>
                                </div>
                                <input type="date" className="w-24 border border-gray-300 rounded p-1.5 bg-white text-slate-800" value={term.date || ''} onChange={e => updatePaymentTerm(term.id, 'date', e.target.value)} />
                                <button onClick={() => removePaymentTerm(term.id)} className="text-slate-400 hover:text-red-500"><XIcon /></button>
                            </div>
                        ))}
                        {(budget.paymentTerms || []).length === 0 && <div className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded">Pago único por defecto</div>}
                    </div>
                    <button onClick={handleAddPaymentTerm} className="w-full py-1.5 text-xs font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 dashed">+ Añadir Plazo</button>
                </div>
```

**File:** services/pdfGenerator.ts (L307-340)
```typescript
  if (config.showLegal) {
      if (finalY > pageHeight - 80) { doc.addPage(); finalY = 20; }
      doc.setFontSize(8); doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]); doc.setFont('helvetica', 'bold'); doc.text("TÉRMINOS Y CONDICIONES", 15, finalY);
      finalY += 5;
      doc.setTextColor(80); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      let legalText = company.terms + "\n";
      config.legalTextIds.forEach(id => { const t = DEFAULT_LEGAL_TEXTS.find(lt => lt.id === id); if (t) legalText += `• ${t.text}\n`; });
      if (config.customLegalTexts) config.customLegalTexts.forEach(clt => { if (clt.active) legalText += `• ${clt.text}\n`; });
      const splitLegal = doc.splitTextToSize(legalText, pageWidth - 30);
      doc.text(splitLegal, 15, finalY);
      finalY += (splitLegal.length * 3) + 10;
  } else { finalY += 20; }

  if (config.showSignatures) {
      if (finalY > pageHeight - 50) { doc.addPage(); finalY = 40; }
      const boxW = 80; const boxH = 35;
      doc.setDrawColor(200); doc.setLineWidth(0.1);
      doc.rect(15, finalY, boxW, boxH);
      doc.setFontSize(7); doc.setTextColor(150); doc.text("Firma y Sello de la Empresa", 17, finalY + 4);
      const clientBoxX = pageWidth - 15 - boxW;
      doc.rect(clientBoxX, finalY, boxW, boxH);
      doc.text("Aceptación del Cliente", clientBoxX + 2, finalY + 4);
      if (budget.clientSignature) { try { doc.addImage(budget.clientSignature, 'PNG', clientBoxX + 10, finalY + 5, boxW - 20, boxH - 10); } catch(e) {} }
  }

  const footerY = pageHeight - 15;
  const logoH = 10;
  const activeLogos = Object.values(config.partnerLogos).filter(l => !!l && l.length > 0);
  if (activeLogos.length > 0) {
      const gap = 5; const w = 20;
      let startX = (pageWidth - (activeLogos.length * w) - ((activeLogos.length - 1) * gap)) / 2;
      activeLogos.forEach(logo => { if (logo) { try { doc.addImage(logo, 'PNG', startX, footerY - 5, w, logoH, undefined, 'FAST'); startX += w + gap; } catch (e) {} } });
  }
  if (config.footerText) { doc.setFontSize(7); doc.setTextColor(150); doc.text(config.footerText, pageWidth / 2, pageHeight - 20, { align: 'center' }); }
```

**File:** services/storage.ts (L46-51)
```typescript
const DEFAULT_PDF_CONFIG: PdfConfig = {
    agora: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#dc2626', secondaryColor: '#f8fafc', partnerLogos: { slot1: LOGO_AGORA, slot2: LOGO_CONCORD, slot3: LOGO_CASHLOGY } },
    sage: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#000000', secondaryColor: '#e6ffef', partnerLogos: {} },
    sage200: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#000000', secondaryColor: '#e6ffef', partnerLogos: {} },
    sagedespachos: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#000000', secondaryColor: '#e6ffef', partnerLogos: {} }
};
```

**File:** services/storage.ts (L127-127)
```typescript
  subscribe: (listener: Listener) => { listeners.push(listener); return () => { const idx = listeners.indexOf(listener); if (idx > -1) listeners.splice(idx, 1); }; },
```

**File:** components/ClientManager.tsx (L371-387)
```typescript
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileTextIcon /> Historial de Presupuestos</h4>
                              <div className="space-y-3">
                                  {clientBudgets.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(b => (
                                      <div key={b.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                          <div>
                                              <div className="font-bold text-sm text-slate-800">{b.number}</div>
                                              <div className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</div>
                                          </div>
                                          <div className="text-right">
                                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${b.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                                          </div>
                                      </div>
                                  ))}
                                  {clientBudgets.length === 0 && <p className="text-slate-400 text-sm italic">Sin historial.</p>}
                              </div>
```

**File:** components/PdfCustomizer.tsx (L115-121)
```typescript
      <div className="bg-slate-200 p-1 rounded-lg w-full max-w-2xl mx-auto flex overflow-x-auto">
          {(['agora', 'sage', 'sage200', 'sagedespachos'] as SystemType[]).map(sys => (
             <button key={sys} onClick={() => setActiveTab(sys)} className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === sys ? sys === 'agora' ? 'bg-red-600 text-white shadow' : 'bg-[#00d061] text-black shadow' : 'text-slate-600 hover:text-slate-800'}`}>
                {labels[sys]}
             </button>
          ))}
      </div>
```

**File:** components/PdfCustomizer.tsx (L129-132)
```typescript
                 <div><label className="block text-xs font-bold text-slate-500 mb-1">Color Principal</label><div className="flex items-center gap-2"><input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={currentConfig.primaryColor} onChange={e => updateCurrentConfig({ primaryColor: e.target.value})} /></div></div>
                 <div><label className="block text-xs font-bold text-slate-500 mb-1">Color Secundario</label><div className="flex items-center gap-2"><input type="color" className="h-10 w-full rounded border-gray-200 cursor-pointer" value={currentConfig.secondaryColor} onChange={e => updateCurrentConfig({ secondaryColor: e.target.value})} /></div></div>
                 <div className="mt-6 border-t pt-4"><label className="block text-xs font-bold text-slate-500 mb-1">Texto del Título (Header)</label><input className="w-full border border-gray-300 rounded text-sm p-2 bg-white text-slate-900" value={currentConfig.titleText} onChange={e => updateCurrentConfig({ titleText: e.target.value})} /></div>
              </div>
```

**File:** components/PdfCustomizer.tsx (L175-178)
```typescript
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Cláusulas Legales ({labels[activeTab]})</h3>
              <div className="mb-6"><p className="text-xs text-slate-500 mb-2 font-bold uppercase">Textos por Defecto</p><div className="space-y-2">{DEFAULT_LEGAL_TEXTS.map(txt => (<label key={txt.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 cursor-pointer transition-colors"><input type="checkbox" checked={currentConfig.legalTextIds.includes(txt.id)} onChange={e => toggleLegalDefault(txt.id, e.target.checked)} className="mt-1 rounded text-accent w-4 h-4 flex-shrink-0"/><span className="text-xs text-slate-700 leading-relaxed">{txt.text}</span></label>))}</div></div>
              <div className="mb-6"><p className="text-xs text-slate-500 mb-2 font-bold uppercase">Cláusulas Personalizadas</p><div className="flex gap-2 mb-3"><input className="flex-1 border border-gray-300 rounded text-sm p-2 bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none" placeholder="Escribe una nueva cláusula..." value={newClause} onChange={(e) => setNewClause(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomClause(); }}/><button onClick={handleAddCustomClause} className="bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded text-slate-700 text-lg font-bold transition-colors">+</button></div><div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">{(currentConfig.customLegalTexts || []).map(txt => (<div key={txt.id} className ... (truncated)
```

**File:** components/PdfCustomizer.tsx (L184-192)
```typescript
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Logos Footer ({labels[activeTab]})</h3>
              <div className="space-y-6">
                 {['slot1', 'slot2', 'slot3'].map((p, index) => {
                   let label = `Logo ${index + 1}`;
                   if(activeTab === 'agora') { if(index === 0) label = "Logo Ágora"; if(index === 1) label = "Logo Concord"; if(index === 2) label = "Logo Cashlogy"; } else { label = `Logo ${labels[activeTab]} Partner ${index + 1}`; }
                   return (<div key={p}><label className="block text-xs font-bold uppercase mb-2 text-slate-500 tracking-wider">{label}</label><div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors relative group"><div className="h-12 flex items-center justify-center overflow-hidden w-full">{/* @ts-ignore */}{currentConfig.partnerLogos[p as keyof typeof currentConfig.partnerLogos] ? /* @ts-ignore */<img src={currentConfig.partnerLogos[p as keyof typeof currentConfig.partnerLogos]} className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-gray-300">Sin logo</span>}</div><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg- ... (truncated)
                 })}
              </div>
```

**File:** components/Settings.tsx (L215-237)
```typescript
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">API Key</label>
                             <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 font-mono text-xs" 
                                placeholder="AIzaSy..." 
                                value={cloud.apiKey} onChange={e => setCloud({...cloud, apiKey: e.target.value})} 
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Auth Domain</label>
                             <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 font-mono text-xs" 
                                placeholder="proyecto.firebaseapp.com" 
                                value={cloud.authDomain} onChange={e => setCloud({...cloud, authDomain: e.target.value})} 
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Project ID</label>
                             <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 font-mono text-xs" 
                                placeholder="proyecto-id" 
                                value={cloud.projectId} onChange={e => setCloud({...cloud, projectId: e.target.value})} 
                             />
                         </div>
                     </div>
```

**File:** components/Settings.tsx (L256-265)
```typescript
      {/* Company Data */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-slate-800">Datos Fiscales de la Empresa</h3>
            <button onClick={handleSaveCompany} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700">
              Guardar Cambios
            </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
```
