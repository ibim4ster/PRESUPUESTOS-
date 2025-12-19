
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
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const EraserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>;
const GitBranchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>;

const SignaturePad = ({ onSave, onClear, initial }: { onSave: (data: string) => void, onClear: () => void, initial?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx && initial) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = initial;
      }
    }
  }, []);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineWidth = 2; ctx.lineCap = 'round'; setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y); ctx.stroke();
  };

  const stopDrawing = () => { if(isDrawing && canvasRef.current) { onSave(canvasRef.current.toDataURL()); } setIsDrawing(false); };
  const clear = () => { const canvas = canvasRef.current; if (canvas) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0, 0, canvas.width, canvas.height); onClear(); } };

  return (
    <div className="border border-slate-300 rounded bg-white relative">
      <canvas ref={canvasRef} className="w-full h-40 touch-none cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
      <button onClick={clear} className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 p-1 rounded text-slate-600" title="Limpiar firma"><EraserIcon /></button>
      <div className="absolute bottom-2 left-2 text-xs text-slate-400 pointer-events-none">Firme aquí (dedo o ratón)</div>
    </div>
  );
};

// VISUAL STATUS STEPPER COMPONENT
const StatusStepper = ({ status, onChange, rejectionReason }: { status: string, onChange: (s: any) => void, rejectionReason?: string }) => {
    const steps = [
        { id: 'draft', label: 'Borrador', color: 'bg-gray-200 text-gray-600' },
        { id: 'pending', label: 'Pendiente', color: 'bg-orange-100 text-orange-600' },
        { id: 'accepted', label: 'Aceptado', color: 'bg-green-100 text-green-600' },
        { id: 'rejected', label: 'Rechazado', color: 'bg-red-100 text-red-600' }
    ];
    
    const currentIndex = steps.findIndex(s => s.id === status);

    return (
        <div className="w-full mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {steps.map((step, idx) => {
                    const isActive = step.id === status;
                    const isPast = idx < currentIndex;
                    
                    return (
                        <div key={step.id} className="flex items-center cursor-pointer" onClick={() => onChange(step.id)}>
                            <div className={`
                                px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2
                                ${isActive ? `${step.color} ring-2 ring-offset-1 ring-slate-200 scale-105 shadow-sm` : isPast ? 'bg-slate-100 text-slate-400' : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'}
                            `}>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>}
                                {step.label}
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="w-6 h-0.5 mx-2 bg-gray-100">
                                    <div className={`h-full bg-slate-300 transition-all ${isPast ? 'w-full' : 'w-0'}`}></div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            {status === 'rejected' && rejectionReason && (
                <div className="bg-red-50 text-red-800 text-xs p-2 rounded border border-red-100 inline-block mt-1 animate-in fade-in slide-in-from-top-1">
                    <strong>Motivo:</strong> {rejectionReason}
                </div>
            )}
        </div>
    );
};

export const BudgetEditor: React.FC<BudgetEditorProps> = ({ initialBudget, onClose, currentSystem, currentUser, onShowToast }) => {
  const isNew = !initialBudget;
  const isSage = currentSystem === 'sage';
  const saveBtnColor = isSage ? 'bg-[#00d061] text-black hover:bg-[#00b050]' : 'bg-red-600 text-white hover:bg-red-700';

  const [budget, setBudget] = useState<Budget>(() => {
    if (initialBudget) return initialBudget;
    const nextNumber = storageService.getNextBudgetNumber(currentSystem);
    return {
      id: crypto.randomUUID(), number: nextNumber, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      status: 'draft', clientId: '', clientData: { id: '', commercialName: '', legalName: '', cif: '', address: '', email: '', phone: '', paymentMethod: '' },
      validityDays: 15, lineItems: [], discountPercentage: 0, bonusAmount: 0, taxPercentage: 21, withholdingTax: 0, clientSignature: '', system: currentSystem, internalNotes: '', createdBy: currentUser.id, creatorName: currentUser.name,
      presentationText: '', // NEW
      events: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), authorName: currentUser.name, text: 'Presupuesto creado', type: 'creation' }]
    };
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<ProductKit[]>([]);
  const [company] = useState(storageService.getCompanyProfile());
  const [pdfConfig] = useState(storageService.getPdfConfig());
  const [isSaved, setIsSaved] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState('');
  
  // Profitability Widget State
  const [showProfitability, setShowProfitability] = useState(false);

  // Rejection Reason Modal
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [pendingRejection, setPendingRejection] = useState<string | null>(null);

  // Email Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // CTRL+S to Save
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              saveWithLogs();
              onShowToast('Presupuesto Guardado', 'success');
          }
          // ESC to Close Preview
          if (e.key === 'Escape' && (showPreviewModal || showEmailModal)) {
              closePreview();
              setShowEmailModal(false);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [budget, showPreviewModal, showEmailModal]);

  useEffect(() => {
    setClients(storageService.getClients());
    setProducts(storageService.getProducts());
    setKits(storageService.getProductKits());
    setTemplates(storageService.getTemplates());
  }, []);

  useEffect(() => {
    if(!isSaved) { const timer = setTimeout(() => { saveWithLogs(); }, 1500); return () => clearTimeout(timer); }
  }, [budget, isSaved]);

  const saveWithLogs = () => {
      storageService.saveBudget(budget);
      const actionType = isNew ? 'PRESUPUESTO_CREADO' : 'PRESUPUESTO_MODIFICADO';
      storageService.addLog({ userId: currentUser.id, userName: currentUser.name, action: actionType, details: `Presupuesto ${budget.number} (${budget.clientData.commercialName || 'Sin Cliente'})` });
      setIsSaved(true);
  };

  const handleStatusChange = (newStatus: any) => {
      if (newStatus === 'rejected') {
          setShowRejectionModal(true);
      } else {
          updateBudget({ status: newStatus });
      }
  };

  const confirmRejection = (reason: string) => {
      updateBudget({ status: 'rejected', rejectionReason: reason });
      setShowRejectionModal(false);
  };

  const updateBudget = (updates: Partial<Budget>) => {
    if (updates.status && updates.status !== budget.status) {
        const event: BudgetEvent = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), authorName: currentUser.name, text: `Estado cambiado de ${budget.status} a ${updates.status}`, type: 'status_change' };
        setBudget(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString(), events: [...(prev.events || []), event] }));
    } else {
        setBudget(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    }
    setIsSaved(false);
  };

  const addEvent = () => {
      if(!newEventText.trim()) return;
      const event: BudgetEvent = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), authorName: currentUser.name, text: newEventText, type: 'note' };
      setBudget(prev => ({ ...prev, events: [...(prev.events || []), event], updatedAt: new Date().toISOString() }));
      setNewEventText('');
      setIsSaved(false);
  };

  const handleCreateRevision = () => {
      if (confirm('¿Crear una nueva revisión de este presupuesto?')) {
          const nextVersion = (budget.version || 0) + 1;
          const newNumber = `${budget.number.split('/')[0]}/R${nextVersion}`;
          const revision: Budget = {
              ...budget,
              id: crypto.randomUUID(),
              number: newNumber,
              parentBudgetId: budget.id,
              version: nextVersion,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'draft',
              clientSignature: undefined,
              events: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), authorName: currentUser.name, text: `Revisión R${nextVersion} creada desde ${budget.number}`, type: 'creation' }]
          };
          
          storageService.saveBudget(revision);
          setBudget(revision);
          onShowToast(`Revisión ${newNumber} creada`, 'success');
      }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) { 
        // Auto-fill presentation text if empty
        const defaultText = budget.presentationText || `Estimado/a ${client.commercialName},\n\nGracias por su interés en nuestras soluciones. Adjunto encontrará el detalle de nuestra propuesta valorada.\n\nQuedamos a su disposición para cualquier consulta.\n\nAtentamente,`;
        updateBudget({ clientId: client.id, clientData: { ...client }, presentationText: defaultText }); 
    }
  };

  const addLineItem = () => { }; 
  const addSectionItem = () => { const newItem: LineItem = { id: crypto.randomUUID(), type: 'section', reference: '', description: 'NUEVA SECCIÓN', units: 0, price: 0 }; updateBudget({ lineItems: [...budget.lineItems, newItem] }); };
  
  // UPDATED: Now includes costPrice
  const addProductAsLine = (product: Product) => { 
      const newItem: LineItem = { 
          id: crypto.randomUUID(), 
          type: 'product', 
          productId: product.id, 
          reference: product.reference, 
          description: product.description, 
          price: product.price, 
          costPrice: product.costPrice || 0, // COPY COST PRICE
          image: product.image, 
          units: 1, 
          discount: 0, 
          isRecurring: product.isRecurring 
      }; 
      updateBudget({ lineItems: [...budget.lineItems, newItem] }); 
  };

  // UPDATED: Now includes costPrice
  const addKitAsLines = (kit: ProductKit) => {
      const section: LineItem = { id: crypto.randomUUID(), type: 'section', reference: '', description: kit.reference.toUpperCase(), units: 0, price: 0 };
      const newItems: LineItem[] = [section];
      kit.items.forEach(item => { 
          const prod = products.find(p => p.id === item.productId); 
          if (prod) { 
              newItems.push({ 
                  id: crypto.randomUUID(), 
                  type: 'product', 
                  productId: prod.id, 
                  reference: prod.reference, 
                  description: prod.description, 
                  price: prod.price, 
                  costPrice: prod.costPrice || 0, // COPY COST PRICE
                  image: prod.image, 
                  units: item.units, 
                  discount: 0, 
                  isRecurring: prod.isRecurring 
              }); 
          } 
      });
      updateBudget({ lineItems: [...budget.lineItems, ...newItems] });
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => { const newLines = budget.lineItems.map(item => item.id === id ? { ...item, ...updates } : item); updateBudget({ lineItems: newLines }); };
  const removeLineItem = (id: string) => { updateBudget({ lineItems: budget.lineItems.filter(i => i.id !== id) }); };
  const moveLineItem = (index: number, direction: 'up' | 'down') => { const newLines = [...budget.lineItems]; if (direction === 'up' && index > 0) { [newLines[index], newLines[index - 1]] = [newLines[index - 1], newLines[index]]; } else if (direction === 'down' && index < newLines.length - 1) { [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]]; } updateBudget({ lineItems: newLines }); };

  // --- CALCULATIONS ---
  const productItems = budget.lineItems.filter(i => i.type !== 'section');
  const subtotal = productItems.reduce((acc, item) => { const disc = item.discount || 0; const finalPrice = item.price * (1 - disc / 100); return acc + (item.units * finalPrice); }, 0);
  const discountAmount = subtotal * (budget.discountPercentage / 100);
  const baseAfterDiscount = subtotal - discountAmount;
  const taxableBase = Math.max(0, baseAfterDiscount - budget.bonusAmount);
  const taxAmount = taxableBase * (budget.taxPercentage / 100);
  const withholdingAmount = taxableBase * ((budget.withholdingTax || 0) / 100);
  const total = taxableBase + taxAmount - withholdingAmount;

  // --- PROFITABILITY CALCULATION ---
  const totalCost = productItems.reduce((acc, item) => acc + (item.units * (item.costPrice || 0)), 0);
  const netProfit = taxableBase - totalCost;
  const marginPercentage = taxableBase > 0 ? (netProfit / taxableBase) * 100 : 0;
  
  let marginColor = 'text-gray-500';
  let marginBg = 'bg-gray-100';
  if (marginPercentage > 30) { marginColor = 'text-green-600'; marginBg = 'bg-green-100'; }
  else if (marginPercentage > 15) { marginColor = 'text-orange-600'; marginBg = 'bg-orange-100'; }
  else { marginColor = 'text-red-600'; marginBg = 'bg-red-100'; }

  // --- PAYMENT TERMS LOGIC ---
  const handleAddPaymentTerm = () => {
      const currentTerms = budget.paymentTerms || [];
      const remainingAmount = total - currentTerms.reduce((s, t) => s + t.amount, 0);
      const remainingPercent = Math.max(0, 100 - currentTerms.reduce((s, t) => s + t.percentage, 0));
      
      const newTerm: PaymentTerm = {
          id: crypto.randomUUID(),
          concept: currentTerms.length === 0 ? 'Firma del Presupuesto' : 'Entrega / Finalización',
          percentage: remainingPercent,
          amount: remainingAmount
      };
      updateBudget({ paymentTerms: [...currentTerms, newTerm] });
  };
  
  const updatePaymentTerm = (id: string, field: keyof PaymentTerm, value: any) => {
      const currentTerms = budget.paymentTerms || [];
      const updatedTerms = currentTerms.map(t => {
          if (t.id !== id) return t;
          const updated = { ...t, [field]: value };
          // Auto-calculate logic
          if (field === 'percentage') {
              updated.amount = total * (value / 100);
          } else if (field === 'amount') {
              updated.percentage = (value / total) * 100;
          }
          return updated;
      });
      updateBudget({ paymentTerms: updatedTerms });
  };

  const removePaymentTerm = (id: string) => {
      updateBudget({ paymentTerms: (budget.paymentTerms || []).filter(t => t.id !== id) });
  };


  const handleGeneratePDF = () => { saveWithLogs(); const doc = generateBudgetPdf(budget, company, pdfConfig); const fileName = `Presupuesto_${budget.number}_${budget.clientData.commercialName}.pdf`; doc.save(fileName); };
  const handlePreview = () => { saveWithLogs(); try { const doc = generateBudgetPdf(budget, company, pdfConfig); const blob = doc.output('blob'); const url = URL.createObjectURL(blob); setPreviewUrl(url); setShowPreviewModal(true); } catch (e) { onShowToast("Error generando vista previa", 'error'); } };
  const closePreview = () => { if (previewUrl) { URL.revokeObjectURL(previewUrl); } setShowPreviewModal(false); setPreviewUrl(null); };
  
  // EMAIL HANDLING
  const openEmailModal = () => {
      if (!budget.clientData.email) return onShowToast('El cliente no tiene email registrado', 'error');
      setEmailData({ 
          to: budget.clientData.email, 
          subject: `Presupuesto ${budget.number} - ${company.name}`, 
          body: `Estimado/a ${budget.clientData.commercialName},\n\nAdjunto le remitimos el presupuesto nº ${budget.number}.\n\nQuedamos a la espera de sus comentarios.\n\nAtentamente,\n${company.name}` 
      });
      setShowEmailModal(true);
  };

  const applyTemplate = (tplId: string) => {
      const tpl = templates.find(t => t.id === tplId);
      if(!tpl) return;
      const parsedBody = tpl.body
        .replace('{{cliente}}', budget.clientData.commercialName)
        .replace('{{numero}}', budget.number)
        .replace('{{total}}', total.toFixed(2));
      
      const parsedSubject = tpl.subject.replace('{{numero}}', budget.number);
      
      setEmailData({ ...emailData, subject: parsedSubject, body: parsedBody });
  };

  const generateAiEmail = async () => {
      if(!aiService.isAvailable()) return onShowToast('Configura tu API KEY en .env', 'error');
      setIsAiGenerating(true);
      const res = await aiService.generateEmail('send', budget.clientData.commercialName, budget.number);
      setEmailData({ ...emailData, subject: res.subject, body: res.body });
      setIsAiGenerating(false);
  };

  const generateAiIntro = async () => {
      if(!aiService.isAvailable()) return onShowToast('Configura tu API KEY en .env', 'error');
      setIsAiGenerating(true);
      const products = budget.lineItems.filter(l => l.type === 'product').map(l => l.description);
      const intro = await aiService.generateIntro(budget.clientData.commercialName, products);
      if(intro) updateBudget({ presentationText: intro });
      setIsAiGenerating(false);
  };

  const handleSendRealEmail = () => {
      saveWithLogs(); 
      const subject = encodeURIComponent(emailData.subject); 
      const body = encodeURIComponent(emailData.body); 
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      setShowEmailModal(false);
  };

  const availableProducts = products.filter(p => !p.system || p.system === 'both' || p.system === currentSystem);
  const availableKits = kits.filter(k => !k.system || k.system === 'both' || k.system === currentSystem);
  const clientOptions = clients.map(c => ({ label: c.commercialName, value: c.id, subLabel: c.legalName }));
  
  // UPDATED: Show stock in dropdown and added safety check for price
  const productOptions = availableProducts.map(p => ({ 
      label: `${p.reference} - ${p.description.substring(0, 30)}... (Stock: ${p.stock || 0})`, 
      value: p.id, 
      subLabel: `${(p.price || 0).toFixed(2)}€`, 
      image: p.image 
  }));
  const kitOptions = availableKits.map(k => ({ label: `📦 PACK: ${k.reference}`, value: k.id, subLabel: k.description }));

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-screen flex flex-col relative pb-10">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-white sticky top-0 z-20 rounded-t-xl shadow-sm gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 font-medium whitespace-nowrap">← Volver</button>
            <div className="overflow-hidden"><div className="flex items-center gap-2"><h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight truncate">{isNew ? 'Nuevo Presupuesto' : `Editar: ${budget.number}`}</h2><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isSaved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{isSaved ? 'Guardado' : 'Guardando...'}</span><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{currentSystem}</span></div></div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
              <div className="hidden lg:flex text-[10px] text-slate-400 gap-3 mr-4 border-r border-slate-200 pr-4">
                  <span>Ctrl+S: Guardar</span>
              </div>
              {!isNew && (
                  <button 
                    onClick={handleCreateRevision}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm flex items-center gap-2 border border-blue-200"
                    title="Crear una nueva versión"
                  >
                      <GitBranchIcon /> <span className="hidden lg:inline">Crear Revisión</span>
                  </button>
              )}
              <button onClick={openEmailModal} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm flex items-center gap-2" title="Enviar Email al Cliente"><MailIcon /> <span className="hidden md:inline">Email</span></button><button onClick={handlePreview} className="flex-1 md:flex-none justify-center px-4 py-3 md:py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2 font-medium text-sm"><EyeIcon /> Vista Previa</button><button onClick={handleGeneratePDF} className={`flex-1 md:flex-none justify-center px-4 py-3 md:py-2 rounded-lg shadow-md flex items-center gap-2 font-medium text-sm transition-colors ${saveBtnColor}`}><SaveIcon /> Generar PDF</button></div>
        </div>

        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
          
          {/* Status Pipeline Visualizer */}
          <StatusStepper 
            status={budget.status} 
            onChange={handleStatusChange} 
            rejectionReason={budget.rejectionReason}
          />

          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2"><h3 className="font-bold text-slate-800 flex items-center gap-2">Datos del Cliente</h3><div className="w-full sm:w-64"><SearchableSelect options={clientOptions} value={budget.clientId} onChange={handleClientSelect} placeholder="Buscar cliente..."/></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-500 mb-1">Nombre Comercial</label><input className="w-full bg-white text-slate-900 border border-gray-300 rounded-md text-sm p-2" value={budget.clientData.commercialName} onChange={e => updateBudget({ clientData: {...budget.clientData, commercialName: e.target.value} })} /></div><div><label className="block text-xs font-medium text-slate-500 mb-1">Razón Social</label><input className="w-full bg-white text-slate-900 border border-gray-300 rounded-md text-sm p-2" value={budget.clientData.legalName} onChange={e => updateBudget({ clientData: {...budget.clientData, legalName: e.target.value} })} /></div><div><label className="block text-xs font-medium text-slate-500 mb-1">CIF/NIF</label><input className="w-full bg-white text-slate-900 border border-gray-300 rounded-md text-sm p-2" value={budget.clientData.cif} onChange={e => updateBudget({ clientData: {...budget.clientData, cif: e.target.value} })} /></div><div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-500 mb-1">Dirección</label><input className="w-full bg-white text-slate-900 border border-gray-300 rounded-md text-sm p-2" value={budget.clientData.address} onChange={e => updateBudget({ clientData: {...budget.clientData, address: e.target.value} })} /></div></div>
            </div>
            <div className="md:col-span-5 bg-slate-50 p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Datos del Documento</h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Número</label>
                      <input className="w-full bg-white text-slate-900 border border-gray-300 rounded-md font-mono text-sm p-2" value={budget.number} onChange={e => updateBudget({ number: e.target.value })} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Validez</label>
                      <div className="relative">
                          <input type="number" className="w-full bg-white text-slate-900 border border-gray-300 rounded-md text-sm pr-8 p-2" value={budget.validityDays} onChange={e => updateBudget({ validityDays: parseInt(e.target.value) })} />
                          <span className="absolute right-2 top-2 text-xs text-slate-400">días</span>
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Comercial</label>
                      <div className="bg-slate-100 rounded p-2 text-xs font-mono text-slate-600">{budget.creatorName || currentUser.name}</div>
                  </div>
              </div>
            </div>
          </section>

          {/* Presentation Text Area */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 relative group">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquareIcon /> Carta de Presentación
                  </h3>
                  <button 
                    onClick={generateAiIntro} 
                    disabled={isAiGenerating}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors"
                  >
                      <SparklesIcon /> {isAiGenerating ? 'Redactando...' : 'Generar con IA'}
                  </button>
              </div>
              <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-slate-800 h-24 focus:ring-2 focus:ring-slate-800 outline-none resize-none"
                  placeholder="Escriba aquí una introducción personalizada..."
                  value={budget.presentationText || ''}
                  onChange={e => updateBudget({ presentationText: e.target.value })}
              />
          </section>

          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible relative z-10">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-t-xl"><h3 className="text-lg font-bold text-slate-800">Conceptos y Productos</h3><div className="flex flex-wrap gap-2 w-full md:w-auto items-center"><button onClick={addSectionItem} className="flex-1 md:flex-none text-sm bg-white border border-slate-300 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium shadow-sm">+ Sección</button><div className="w-full md:w-48"><SearchableSelect options={kitOptions} value="" onChange={(val) => { const k = kits.find(kit => kit.id === val); if(k) addKitAsLines(k); }} placeholder="+ Añadir Pack..."/></div><div className="w-full md:w-64"><SearchableSelect options={productOptions} value="" onChange={(val) => { const p = products.find(prod => prod.id === val); if(p) addProductAsLine(p); }} placeholder="+ Añadir Producto..."/></div></div></div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-100 text-slate-600 text-xs uppercase font-semibold"><tr><th className="w-12 py-3"></th><th className="px-4 py-3 text-left w-24">Ref</th><th className="px-4 py-3 text-left">Descripción / Producto</th><th className="px-4 py-3 text-right w-24">Uds</th><th className="px-4 py-3 text-right w-32">Precio</th><th className="px-4 py-3 text-right w-24">Dto %</th><th className="px-4 py-3 text-right w-32">Total</th><th className="w-12 py-3"></th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {budget.lineItems.map((item, index) => {
                    if (item.type === 'section') { return ( <tr key={item.id} className="bg-slate-100/50 hover:bg-slate-100"><td className="p-2 text-center"><div className="flex flex-col text-slate-400"><button onClick={() => moveLineItem(index, 'up')} className="hover:text-slate-800 p-1"><ArrowUpIcon/></button><button onClick={() => moveLineItem(index, 'down')} className="hover:text-slate-800 p-1"><ArrowDownIcon/></button></div></td><td colSpan={6} className="p-2"><input className="w-full bg-transparent font-bold text-slate-700 placeholder-slate-400 border-none focus:ring-0 uppercase tracking-wide p-2" placeholder="TÍTULO DE SECCIÓN" value={item.description} onChange={e => updateLineItem(item.id, { description: e.target.value })}/></td><td className="p-2 text-center"><button onClick={() => removeLineItem(item.id)} className="text-slate-400 hover:text-red-500 p-2"><TrashIcon/></button></td></tr> ); }
                    const discount = item.discount || 0; const finalPrice = item.price * (1 - discount / 100);
                    return (
                      <tr key={item.id} className="group hover:bg-gray-50/80">
                        <td className="p-2 text-center"><div className="flex flex-col text-slate-300 group-hover:text-slate-400"><button onClick={() => moveLineItem(index, 'up')} className="hover:text-slate-800 p-1"><ArrowUpIcon/></button><button onClick={() => moveLineItem(index, 'down')} className="hover:text-slate-800 p-1"><ArrowDownIcon/></button></div></td>
                        <td className="p-2"><input className="w-full text-xs text-slate-700 bg-white border border-gray-200 rounded px-2 py-2" value={item.reference} onChange={e => updateLineItem(item.id, { reference: e.target.value })} placeholder="REF" /></td>
                        <td className="p-2">
                            <div className="flex items-start gap-3">
                                {item.image ? (<img src={item.image} className="w-10 h-10 object-cover rounded border border-gray-200 bg-white mt-1" />) : (<div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-slate-300 text-xs flex-shrink-0 mt-1">IMG</div>)}
                                <div className="flex-1 relative">
                                    <textarea className="w-full text-slate-800 bg-white border border-gray-200 rounded px-2 py-2 resize-none h-auto min-h-[40px] pr-8" value={item.description} onChange={e => updateLineItem(item.id, { description: e.target.value })} rows={2} placeholder="Descripción del producto" />
                                    {item.isRecurring && <span className="text-[10px] text-purple-600 bg-purple-50 px-1 rounded font-bold flex items-center gap-1 w-fit mt-1"><RefreshIcon/> Recurrente (Anual)</span>}
                                </div>
                            </div>
                        </td>
                        <td className="p-2"><input type="number" className="w-full text-right bg-white border border-gray-200 rounded text-slate-900 p-2" value={item.units} onChange={e => updateLineItem(item.id, { units: parseFloat(e.target.value) })} /></td>
                        <td className="p-2"><input type="number" className="w-full text-right bg-white border border-gray-200 rounded text-slate-900 p-2" value={item.price} onChange={e => updateLineItem(item.id, { price: parseFloat(e.target.value) })} /></td>
                        <td className="p-2"><input type="number" min="0" max="100" className="w-full text-right bg-white border border-gray-200 rounded text-slate-900 p-2" value={item.discount || 0} onChange={e => updateLineItem(item.id, { discount: parseFloat(e.target.value) })} /></td>
                        <td className="p-2 text-right font-medium text-slate-900"><div className="flex flex-col"><span>{(item.units * finalPrice).toFixed(2)} €</span>{discount > 0 && (<span className="text-[10px] text-slate-400 line-through">{(item.units * item.price).toFixed(2)} €</span>)}</div></td>
                        <td className="p-2 text-center"><button onClick={() => removeLineItem(item.id)} className="text-slate-300 hover:text-red-500 p-2"><TrashIcon/></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PenIcon /> Firma Digital Cliente</h3><SignaturePad initial={budget.clientSignature} onSave={(data) => updateBudget({ clientSignature: data })} onClear={() => updateBudget({ clientSignature: undefined })} /></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="font-bold text-slate-800 mb-4">Línea de Tiempo (Notas CRM)</h3><div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">{(budget.events || []).map(event => (<div key={event.id} className="flex gap-3 text-sm"><div className="mt-1 flex-shrink-0"><div className={`w-2 h-2 rounded-full ${event.type === 'status_change' ? 'bg-orange-500' : 'bg-slate-300'}`}></div></div><div><div className="flex items-center gap-2"><span className="font-bold text-slate-700 text-xs">{event.authorName}</span><span className="text-slate-400 text-[10px]">{new Date(event.timestamp).toLocaleString()}</span></div><p className="text-slate-600">{event.text}</p></div></div>))}</div><div className="flex gap-2"><input className="flex-1 text-sm border border-gray-300 rounded p-2 bg-white text-slate-900" placeholder="Escribe una nota interna..." value={newEventText} onChange={(e) => setNewEventText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEvent()} /><button onClick={addEvent} className="bg-slate-800 text-white p-2 rounded hover:bg-slate-700"><SendIcon /></button></div></div>
            </div>
            
            <div className="space-y-4">
                {/* Financial Totals Panel */}
                <div className="bg-slate-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 h-fit relative">
                    <div className="flex justify-between text-sm text-slate-600"><span>Subtotal (Neto)</span><span className="font-semibold text-slate-800">{subtotal.toFixed(2)} €</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-600">Descuento Global (%)</span><div className="flex items-center gap-2"><input type="number" className="w-16 bg-white border border-gray-300 rounded text-right text-sm p-1 text-slate-900" value={budget.discountPercentage} onChange={e => updateBudget({ discountPercentage: parseFloat(e.target.value) })} /><span className="text-red-500 w-20 text-right">-{discountAmount.toFixed(2)} €</span></div></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-green-700 font-medium">Bono / Subvención</span><div className="flex items-center gap-2"><input type="number" className="w-24 border-green-300 rounded text-right text-sm text-green-700 bg-white p-1" value={budget.bonusAmount} onChange={e => updateBudget({ bonusAmount: parseFloat(e.target.value) })} /><span className="text-green-700 w-12 text-right">€</span></div></div>
                    <div className="border-t border-gray-300 my-2"></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-800 font-medium">Base Imponible</span><span className="font-bold">{taxableBase.toFixed(2)} €</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-600">IVA</span><div className="flex items-center gap-2"><select className="w-16 bg-white border border-gray-300 rounded text-right text-sm p-1 text-slate-900" value={budget.taxPercentage} onChange={e => updateBudget({ taxPercentage: parseFloat(e.target.value) })}><option value="21">21%</option><option value="10">10%</option><option value="4">4%</option><option value="0">0%</option></select><span className="text-slate-600 w-20 text-right">+{taxAmount.toFixed(2)} €</span></div></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-blue-600 font-medium">Retención IRPF (%)</span><div className="flex items-center gap-2"><input type="number" className="w-16 bg-white border border-blue-200 text-blue-800 rounded text-right text-sm p-1" value={budget.withholdingTax || 0} onChange={e => updateBudget({ withholdingTax: parseFloat(e.target.value) })} /><span className="text-blue-600 w-20 text-right">-{withholdingAmount.toFixed(2)} €</span></div></div>
                    <div className="border-t border-slate-800 my-4"></div>
                    <div className="flex justify-between items-end"><span className="text-xl font-bold text-slate-900">TOTAL</span><span className={`text-3xl font-bold ${isSage ? 'text-[#00d061]' : 'text-red-600'}`}>{total.toFixed(2)} €</span></div>
                </div>

                {/* Profitability Widget (NEW) */}
                <div className="bg-gray-800 text-white p-4 rounded-xl shadow-lg border border-gray-700 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm flex items-center gap-2 text-gray-200"><TrendingUpIcon /> Análisis de Rentabilidad</h4>
                        <button onClick={() => setShowProfitability(!showProfitability)} className="text-gray-400 hover:text-white transition-colors">{showProfitability ? <EyeIcon /> : <EyeOffIcon />}</button>
                    </div>
                    
                    {showProfitability ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                             <div className="flex justify-between text-xs">
                                 <span className="text-gray-400">Coste Total (Productos)</span>
                                 <span className="font-mono">{totalCost.toFixed(2)} €</span>
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
                    ) : (
                        <div className="text-xs text-gray-500 italic text-center py-2">Información oculta (Solo ojos internos)</div>
                    )}
                </div>

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
            </div>
          </section>
        </div>
      </div>
      
      {/* Rejection Reason Modal */}
      {showRejectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">¿Por qué se ha perdido esta venta?</h3>
                  <div className="space-y-2 mb-4">
                      {['Precio demasiado alto', 'Competencia (Otra solución)', 'Proyecto cancelado / Pospuesto', 'Falta de funcionalidades', 'Mala reputación / Confianza', 'Otro'].map(reason => (
                          <button 
                            key={reason}
                            onClick={() => setPendingRejection(reason)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${pendingRejection === reason ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-700'}`}
                          >
                              {reason}
                          </button>
                      ))}
                  </div>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowRejectionModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm">Cancelar</button>
                      <button 
                        disabled={!pendingRejection}
                        onClick={() => pendingRejection && confirmRejection(pendingRejection)} 
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Confirmar Rechazo
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><MailIcon /> Enviar Email al Cliente</h3>
                      <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto space-y-4">
                      
                      <div className="flex gap-2 overflow-x-auto pb-2">
                          {templates.map(tpl => (
                              <button 
                                key={tpl.id} 
                                onClick={() => applyTemplate(tpl.id)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 whitespace-nowrap"
                              >
                                  {tpl.name}
                              </button>
                          ))}
                          <button 
                            onClick={generateAiEmail} 
                            disabled={isAiGenerating}
                            className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-700 hover:bg-purple-100 whitespace-nowrap flex items-center gap-1"
                          >
                              <SparklesIcon /> {isAiGenerating ? 'Generando...' : 'Redactar con IA'}
                          </button>
                      </div>

                      <div className="grid gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Destinatario</label>
                              <input className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-slate-900" value={emailData.to} readOnly />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Asunto</label>
                              <input className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-slate-900 font-bold" value={emailData.subject} onChange={e => setEmailData({...emailData, subject: e.target.value})} />
                          </div>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Mensaje</label>
                              <textarea className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-slate-900 h-60 resize-none leading-relaxed" value={emailData.body} onChange={e => setEmailData({...emailData, body: e.target.value})} />
                          </div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                      <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 text-slate-600 hover:bg-gray-200 rounded font-bold text-sm">Cancelar</button>
                      <button onClick={handleSendRealEmail} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-bold text-sm flex items-center gap-2 shadow-md">
                          <SendIcon /> Abrir Correo
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showPreviewModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"><div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"><div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10"><h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><EyeIcon /> Vista Previa</h3><div className="flex gap-2"><button onClick={handleGeneratePDF} className={`${saveBtnColor} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}><DownloadIcon /> Descargar PDF</button><button onClick={closePreview} className="bg-gray-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-gray-200"><XIcon /></button></div></div><div className="flex-1 bg-slate-100 relative">{previewUrl ? (<iframe src={previewUrl} className="w-full h-full border-0" title="PDF Preview" />) : (<div className="flex items-center justify-center h-full text-slate-400">Cargando vista previa...</div>)}</div></div></div>)}
    </>
  );
};
