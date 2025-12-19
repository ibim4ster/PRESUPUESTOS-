
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { generateBudgetPdf } from '../services/pdfGenerator';
import { aiService } from '../services/ai';
import { Budget, Client, LineItem, Product, PdfConfig, SystemType, ProductKit, User, BudgetEvent, PaymentTerm, EmailTemplate } from '../types';
import { SearchableSelect } from './SearchableSelect';

interface BudgetEditorProps {
  initialBudget?: Budget | null;
  onClose: () => void;
  currentSystem: SystemType;
  currentUser: User; 
  onShowToast: (text: string, type: 'success' | 'error', subtext?: string) => void; 
}

// Icons
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const EraserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const SignaturePad = ({ onSave, onClear, initial }: { onSave: (data: string) => void, onClear: () => void, initial?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx && initial) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0); img.src = initial; }
    }
  }, []);
  const startDrawing = (e: any) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = 'currentColor'; setIsDrawing(true);
  };
  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopDrawing = () => { if(isDrawing && canvasRef.current) { onSave(canvasRef.current.toDataURL()); } setIsDrawing(false); };
  return (
    <div className="border theme-border rounded theme-bg-main relative theme-text-main">
      <canvas ref={canvasRef} className="w-full h-40 touch-none cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
      <button onClick={() => { const canvas = canvasRef.current; if (canvas) { canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height); onClear(); } }} className="absolute top-2 right-2 theme-bg-card p-1 rounded theme-text-muted"><EraserIcon /></button>
      <div className="absolute bottom-2 left-2 text-[10px] theme-text-muted pointer-events-none uppercase font-bold tracking-widest opacity-30">Firme aquí</div>
    </div>
  );
};

export const BudgetEditor: React.FC<BudgetEditorProps> = ({ initialBudget, onClose, currentSystem, currentUser, onShowToast }) => {
  const isNew = !initialBudget;
  const isSage = currentSystem === 'sage';
  const saveBtnColor = isSage ? 'bg-[#00d061] text-black' : 'bg-red-600 text-white';

  const [budget, setBudget] = useState<Budget>(() => {
    if (initialBudget) return initialBudget;
    return {
      id: crypto.randomUUID(), number: storageService.getNextBudgetNumber(currentSystem), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      status: 'draft', clientId: '', clientData: { id: '', commercialName: '', legalName: '', cif: '', address: '', email: '', phone: '', paymentMethod: '' },
      validityDays: 15, lineItems: [], discountPercentage: 0, bonusAmount: 0, taxPercentage: 21, withholdingTax: 0, clientSignature: '', system: currentSystem, internalNotes: '', createdBy: currentUser.id, creatorName: currentUser.name,
      presentationText: '', events: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), authorName: currentUser.name, text: 'Presupuesto creado', type: 'creation' }]
    };
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [company] = useState(storageService.getCompanyProfile());
  const [pdfConfig] = useState(storageService.getPdfConfig());
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => { setClients(storageService.getClients()); setProducts(storageService.getProducts()); }, []);

  const updateBudget = (updates: Partial<Budget>) => { setBudget(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() })); setIsSaved(false); };
  const updateLineItem = (id: string, updates: Partial<LineItem>) => { const newLines = budget.lineItems.map(item => item.id === id ? { ...item, ...updates } : item); updateBudget({ lineItems: newLines }); };
  
  const productItems = budget.lineItems.filter(i => i.type !== 'section');
  const subtotal = productItems.reduce((acc, item) => acc + (item.units * item.price * (1 - (item.discount || 0) / 100)), 0);
  const taxableBase = Math.max(0, subtotal * (1 - budget.discountPercentage / 100) - budget.bonusAmount);
  const total = taxableBase * (1 + budget.taxPercentage / 100) - (taxableBase * (budget.withholdingTax || 0) / 100);

  const clientOptions = clients.map(c => ({ label: c.commercialName, value: c.id, subLabel: c.legalName }));
  const productOptions = products.filter(p => !p.system || p.system === 'both' || p.system === currentSystem).map(p => ({ label: p.reference, value: p.id, subLabel: `${p.price}€ - ${p.description.substring(0,30)}...`, image: p.image }));

  return (
    <div className="theme-card rounded-xl shadow-lg border theme-border min-h-screen flex flex-col relative pb-10 theme-text-main">
        <div className="px-6 py-4 border-b theme-border flex flex-col md:flex-row justify-between items-center theme-bg-card sticky top-0 z-30 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="theme-text-muted hover:theme-text-main font-bold">← Volver</button>
            <h2 className="text-xl font-bold">{isNew ? 'Nuevo Presupuesto' : `Editar: ${budget.number}`}</h2>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isSaved ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{isSaved ? 'Guardado' : 'Guardando...'}</span>
          </div>
          <div className="flex gap-2">
              <button onClick={() => { storageService.saveBudget(budget); setIsSaved(true); onShowToast('Guardado', 'success'); }} className="px-4 py-2 theme-bg-main theme-text-main rounded-lg font-bold border theme-border"><SaveIcon /></button>
              <button onClick={() => { const doc = generateBudgetPdf(budget, company, pdfConfig); doc.save(`${budget.number}.pdf`); }} className={`px-6 py-2 rounded-lg font-bold ${saveBtnColor}`}>GENERAR PDF</button>
          </div>
        </div>

        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="theme-bg-main p-6 rounded-xl border theme-border">
                <h3 className="font-bold mb-4">Información del Cliente</h3>
                <SearchableSelect className="mb-4" options={clientOptions} value={budget.clientId} onChange={(id) => { const c = clients.find(cl => cl.id === id); if(c) updateBudget({ clientId: id, clientData: c }); }} />
                <div className="grid grid-cols-2 gap-4">
                    <input className="theme-input p-2 rounded text-sm col-span-2" placeholder="Nombre Comercial" value={budget.clientData.commercialName} readOnly />
                    <input className="theme-input p-2 rounded text-sm" placeholder="CIF" value={budget.clientData.cif} readOnly />
                    <input className="theme-input p-2 rounded text-sm" placeholder="Teléfono" value={budget.clientData.phone} readOnly />
                </div>
            </div>
            <div className="theme-bg-main p-6 rounded-xl border theme-border">
                <h3 className="font-bold mb-4">Detalles Documento</h3>
                <div className="space-y-4">
                    <div><label className="block text-[10px] font-bold theme-text-muted mb-1 uppercase">Número</label><input className="w-full theme-input p-2 rounded font-mono" value={budget.number} onChange={e => updateBudget({number: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold theme-text-muted mb-1 uppercase">Validez (días)</label><input type="number" className="w-full theme-input p-2 rounded" value={budget.validityDays} onChange={e => updateBudget({validityDays: parseInt(e.target.value)})} /></div>
                        <div><label className="block text-[10px] font-bold theme-text-muted mb-1 uppercase">IVA (%)</label><select className="w-full theme-input p-2 rounded" value={budget.taxPercentage} onChange={e => updateBudget({taxPercentage: parseFloat(e.target.value)})}><option value="21">21%</option><option value="10">10%</option><option value="4">4%</option></select></div>
                    </div>
                </div>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-xl overflow-hidden">
            <div className="p-4 theme-bg-table-header border-b theme-border flex justify-between items-center">
                <h3 className="font-bold">Líneas del Presupuesto</h3>
                <div className="w-64"><SearchableSelect options={productOptions} value="" onChange={(id) => { const p = products.find(pr => pr.id === id); if(p) updateBudget({ lineItems: [...budget.lineItems, { id: crypto.randomUUID(), type: 'product', reference: p.reference, description: p.description, price: p.price, units: 1, discount: 0, image: p.image }] }); }} placeholder="+ Añadir producto..." /></div>
            </div>
            <table className="w-full text-sm">
                <thead className="theme-bg-table-header theme-text-muted text-xs uppercase font-bold border-b theme-border">
                    <tr><th className="px-4 py-3 text-left">Concepto</th><th className="px-4 py-3 text-right w-24">Uds</th><th className="px-4 py-3 text-right w-32">Precio</th><th className="px-4 py-3 text-right w-32">Total</th><th className="w-12"></th></tr>
                </thead>
                <tbody className="divide-y theme-border">
                    {budget.lineItems.map(item => (
                        <tr key={item.id} className="hover:theme-bg-main/30">
                            <td className="px-4 py-3"><div className="font-bold text-xs">{item.reference}</div><input className="w-full bg-transparent outline-none theme-text-main" value={item.description} onChange={e => updateLineItem(item.id, {description: e.target.value})} /></td>
                            <td className="px-4 py-3"><input type="number" className="w-full theme-input p-1 rounded text-right" value={item.units} onChange={e => updateLineItem(item.id, {units: parseFloat(e.target.value)})} /></td>
                            <td className="px-4 py-3"><input type="number" className="w-full theme-input p-1 rounded text-right" value={item.price} onChange={e => updateLineItem(item.id, {price: parseFloat(e.target.value)})} /></td>
                            <td className="px-4 py-3 text-right font-bold">{(item.units * item.price).toFixed(2)} €</td>
                            <td className="px-4 py-3 text-center"><button onClick={() => updateBudget({ lineItems: budget.lineItems.filter(i => i.id !== item.id)})} className="text-red-500 opacity-50 hover:opacity-100"><TrashIcon /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="theme-bg-main p-6 rounded-xl border theme-border">
                <h3 className="font-bold mb-4 flex items-center gap-2"><PenIcon /> Firma de Aceptación</h3>
                <SignaturePad initial={budget.clientSignature} onSave={(s) => updateBudget({clientSignature: s})} onClear={() => updateBudget({clientSignature: ''})} />
            </div>
            <div className="theme-bg-card p-6 rounded-xl border theme-border space-y-4 shadow-inner">
                <div className="flex justify-between items-center text-sm"><span className="theme-text-muted">Subtotal</span><span className="font-bold">{subtotal.toFixed(2)} €</span></div>
                <div className="flex justify-between items-center text-sm"><span className="theme-text-muted">Descuento Global (%)</span><input type="number" className="w-20 theme-input p-1 rounded text-right" value={budget.discountPercentage} onChange={e => updateBudget({discountPercentage: parseFloat(e.target.value)})} /></div>
                <div className="border-t theme-border pt-4 flex justify-between items-end">
                    <span className="text-xl font-bold uppercase tracking-tighter">Total Presupuesto</span>
                    <span className="text-4xl font-black text-[var(--accent-color)]">{total.toFixed(2)} €</span>
                </div>
            </div>
          </section>
        </div>
    </div>
  );
};
