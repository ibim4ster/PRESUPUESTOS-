

import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { generateBudgetPdf } from '../services/pdfGenerator';
import { Budget, Client, LineItem, Product, PdfConfig, SystemType, ProductKit, User } from '../types';
import { SearchableSelect } from './SearchableSelect';

interface BudgetEditorProps {
  initialBudget?: Budget | null;
  onClose: () => void;
  currentSystem: SystemType;
  currentUser: User; // Added prop
}

// Icons
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const EraserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

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
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    setIsDrawing(true);
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

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if(isDrawing && canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onClear();
    }
  };

  return (
    <div className="border border-slate-300 rounded bg-white relative">
      <canvas 
        ref={canvasRef}
        className="w-full h-40 touch-none cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button 
        onClick={clear}
        className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 p-1 rounded text-slate-600"
        title="Limpiar firma"
      >
        <EraserIcon />
      </button>
      <div className="absolute bottom-2 left-2 text-xs text-slate-400 pointer-events-none">
        Firme aquí (dedo o ratón)
      </div>
    </div>
  );
};

export const BudgetEditor: React.FC<BudgetEditorProps> = ({ initialBudget, onClose, currentSystem, currentUser }) => {
  const isNew = !initialBudget;
  const isSage = currentSystem === 'sage';
  const saveBtnColor = isSage ? 'bg-[#00d061] text-black hover:bg-[#00b050]' : 'bg-red-600 text-white hover:bg-red-700';

  const [budget, setBudget] = useState<Budget>(() => {
    if (initialBudget) return initialBudget;
    
    // Auto-generate number for new budget
    const nextNumber = storageService.getNextBudgetNumber(currentSystem);
    
    return {
      id: crypto.randomUUID(),
      number: nextNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      clientId: '',
      clientData: { id: '', commercialName: '', legalName: '', cif: '', address: '', email: '', phone: '', paymentMethod: '' },
      validityDays: 15,
      lineItems: [],
      discountPercentage: 0,
      bonusAmount: 0,
      taxPercentage: 21,
      clientSignature: '',
      system: currentSystem,
      internalNotes: '',
      // ATTRIBUTION
      createdBy: currentUser.id,
      creatorName: currentUser.name
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

  useEffect(() => {
    setClients(storageService.getClients());
    setProducts(storageService.getProducts());
    setKits(storageService.getProductKits());
  }, []);

  useEffect(() => {
    if(!isSaved) {
      const timer = setTimeout(() => {
        saveWithLogs();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [budget, isSaved]);

  const saveWithLogs = () => {
      storageService.saveBudget(budget);
      
      // LOG THE ACTION
      const actionType = isNew ? 'PRESUPUESTO_CREADO' : 'PRESUPUESTO_MODIFICADO';
      storageService.addLog({
          userId: currentUser.id,
          userName: currentUser.name,
          action: actionType,
          details: `Presupuesto ${budget.number} (${budget.clientData.commercialName || 'Sin Cliente'})`
      });

      setIsSaved(true);
  };

  const updateBudget = (updates: Partial<Budget>) => {
    setBudget(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    setIsSaved(false);
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      updateBudget({ 
        clientId: client.id,
        clientData: { ...client }
      });
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      type: 'product',
      reference: '',
      description: '',
      units: 1,
      price: 0
    };
    updateBudget({ lineItems: [...budget.lineItems, newItem] });
  };

  const addSectionItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      type: 'section',
      reference: '',
      description: 'NUEVA SECCIÓN',
      units: 0,
      price: 0
    };
    updateBudget({ lineItems: [...budget.lineItems, newItem] });
  };

  const addProductAsLine = (product: Product) => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      type: 'product',
      productId: product.id,
      reference: product.reference,
      description: product.description,
      price: product.price,
      image: product.image,
      units: 1
    };
    updateBudget({ lineItems: [...budget.lineItems, newItem] });
  };

  const addKitAsLines = (kit: ProductKit) => {
      const section: LineItem = {
          id: crypto.randomUUID(),
          type: 'section',
          reference: '',
          description: kit.reference.toUpperCase(),
          units: 0,
          price: 0
      };

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
                  image: prod.image,
                  units: item.units
              });
          }
      });

      updateBudget({ lineItems: [...budget.lineItems, ...newItems] });
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    const newLines = budget.lineItems.map(item => item.id === id ? { ...item, ...updates } : item);
    updateBudget({ lineItems: newLines });
  };

  const removeLineItem = (id: string) => {
    updateBudget({ lineItems: budget.lineItems.filter(i => i.id !== id) });
  };

  const moveLineItem = (index: number, direction: 'up' | 'down') => {
    const newLines = [...budget.lineItems];
    if (direction === 'up' && index > 0) {
      [newLines[index], newLines[index - 1]] = [newLines[index - 1], newLines[index]];
    } else if (direction === 'down' && index < newLines.length - 1) {
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]];
    }
    updateBudget({ lineItems: newLines });
  };

  const productItems = budget.lineItems.filter(i => i.type !== 'section');
  const subtotal = productItems.reduce((acc, item) => acc + (item.units * item.price), 0);
  const discountAmount = subtotal * (budget.discountPercentage / 100);
  const baseAfterDiscount = subtotal - discountAmount;
  const taxableBase = Math.max(0, baseAfterDiscount - budget.bonusAmount);
  const taxAmount = taxableBase * (budget.taxPercentage / 100);
  const total = taxableBase + taxAmount;

  const handleGeneratePDF = () => {
    saveWithLogs();
    const doc = generateBudgetPdf(budget, company, pdfConfig);
    const fileName = `Presupuesto_${budget.number}_${budget.clientData.commercialName}.pdf`;
    doc.save(fileName);
  };

  const handlePreview = () => {
    saveWithLogs();
    try {
      const doc = generateBudgetPdf(budget, company, pdfConfig);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreviewModal(true);
    } catch (e) {
      console.error(e);
      alert("Error generando vista previa.");
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setShowPreviewModal(false);
    setPreviewUrl(null);
  };

  const handleSendEmail = () => {
      if (!budget.clientData.email) return alert('El cliente no tiene email registrado.');
      saveWithLogs();
      const subject = encodeURIComponent(`Presupuesto ${budget.number} - ${company.name}`);
      const body = encodeURIComponent(`Estimado/a ${budget.clientData.commercialName},\n\nAdjunto le remitimos el presupuesto nº ${budget.number} solicitado.\n\nQuedamos a su disposición para cualquier duda.\n\nAtentamente,\n${company.name}`);
      window.location.href = `mailto:${budget.clientData.email}?subject=${subject}&body=${body}`;
  };

  // Filter products relevant to current system or marked as both
  const availableProducts = products.filter(p => !p.system || p.system === 'both' || p.system === currentSystem);
  const availableKits = kits.filter(k => !k.system || k.system === 'both' || k.system === currentSystem);

  const clientOptions = clients.map(c => ({
    label: c.commercialName,
    value: c.id,
    subLabel: c.legalName
  }));

  const productOptions = availableProducts.map(p => ({
    label: `${p.reference} - ${p.description.substring(0, 30)}...`,
    value: p.id,
    subLabel: `${p.price.toFixed(2)}€`,
    image: p.image
  }));

  const kitOptions = availableKits.map(k => ({
      label: `📦 PACK: ${k.reference}`,
      value: k.id,
      subLabel: k.description
  }));

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-screen flex flex-col relative pb-10">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-white sticky top-0 z-20 rounded-t-xl shadow-sm gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 font-medium whitespace-nowrap">← Volver</button>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight truncate">
                  {isNew ? 'Nuevo Presupuesto' : `Editar: ${budget.number}`}
                </h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isSaved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {isSaved ? 'Guardado' : 'Guardando...'}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{currentSystem}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
            <button 
               onClick={handleSendEmail}
               className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm flex items-center gap-2"
               title="Enviar Email al Cliente"
            >
                <MailIcon /> <span className="hidden md:inline">Email</span>
            </button>
            <button 
              onClick={handlePreview}
              className="flex-1 md:flex-none justify-center px-4 py-3 md:py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2 font-medium text-sm"
            >
              <EyeIcon /> Vista Previa
            </button>
            <button 
              onClick={handleGeneratePDF} 
              className={`flex-1 md:flex-none justify-center px-4 py-3 md:py-2 rounded-lg shadow-md flex items-center gap-2 font-medium text-sm transition-colors ${saveBtnColor}`}
            >
              <SaveIcon /> Generar PDF
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
          
          {/* Top: Metadata Cards */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Client Card */}
            <div className="md:col-span-7 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <svg className={`w-4 h-4 ${isSage ? 'text-[#00d061]' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Datos del Cliente
                </h3>
                <div className="w-full sm:w-64">
                   <SearchableSelect 
                     options={clientOptions}
                     value={budget.clientId}
                     onChange={handleClientSelect}
                     placeholder="Buscar cliente..."
                   />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nombre Comercial</label>
                  <input 
                    className="w-full bg-white border border-gray-300 text-slate-900 rounded-md text-sm p-2 focus:border-accent focus:ring-accent" 
                    value={budget.clientData.commercialName} 
                    onChange={e => updateBudget({ clientData: {...budget.clientData, commercialName: e.target.value} })}
                    placeholder="Ej: Restaurante Pepe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Razón Social</label>
                  <input 
                    className="w-full bg-white border border-gray-300 text-slate-900 rounded-md text-sm p-2"
                    value={budget.clientData.legalName} 
                    onChange={e => updateBudget({ clientData: {...budget.clientData, legalName: e.target.value} })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">CIF/NIF</label>
                  <input 
                    className="w-full bg-white border border-gray-300 text-slate-900 rounded-md text-sm p-2"
                    value={budget.clientData.cif} 
                    onChange={e => updateBudget({ clientData: {...budget.clientData, cif: e.target.value} })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Dirección</label>
                  <input 
                    className="w-full bg-white border border-gray-300 text-slate-900 rounded-md text-sm p-2"
                    value={budget.clientData.address} 
                    onChange={e => updateBudget({ clientData: {...budget.clientData, address: e.target.value} })}
                  />
                </div>
              </div>
            </div>

            {/* Budget Settings Card */}
            <div className="md:col-span-5 bg-slate-50 p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Datos del Documento
              </h3>
              <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Número</label>
                    <input 
                      className="w-full bg-white border border-gray-300 text-slate-900 rounded-md font-mono text-sm p-2" 
                      value={budget.number} 
                      onChange={e => updateBudget({ number: e.target.value })} 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                      <select 
                        className="w-full bg-white border border-gray-300 text-slate-900 rounded-md text-sm p-2" 
                        value={budget.status} 
                        onChange={e => updateBudget({ status: e.target.value as any })}
                      >
                        <option value="draft">Borrador</option>
                        <option value="pending">Pendiente</option>
                        <option value="accepted">Aceptado</option>
                        <option value="rejected">Rechazado</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Validez</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="w-full bg-white border border-gray-300 text-slate-900 rounded-md text-sm pr-8 p-2" 
                          value={budget.validityDays} 
                          onChange={e => updateBudget({ validityDays: parseInt(e.target.value) })} 
                        />
                        <span className="absolute right-2 top-2 text-xs text-slate-400">días</span>
                      </div>
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Comercial</label>
                   <div className="bg-slate-100 rounded p-2 text-xs font-mono text-slate-600">
                       {budget.creatorName || currentUser.name}
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Notas Internas (Privado)</label>
                   <textarea 
                      className="w-full bg-white border border-gray-300 text-slate-900 rounded-md text-xs p-2 h-16 resize-none focus:border-accent focus:ring-accent"
                      placeholder="Notas solo para la empresa..."
                      value={budget.internalNotes || ''}
                      onChange={e => updateBudget({ internalNotes: e.target.value })}
                   />
                </div>
              </div>
            </div>
          </section>

          {/* Line Items Editor */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-lg font-bold text-slate-800">Conceptos y Productos</h3>
              <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                <button onClick={addSectionItem} className="flex-1 md:flex-none text-sm bg-white border border-slate-300 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium shadow-sm">
                  + Sección
                </button>
                <div className="w-full md:w-48">
                    <SearchableSelect 
                        options={kitOptions}
                        value=""
                        onChange={(val) => {
                             const k = kits.find(kit => kit.id === val);
                             if(k) addKitAsLines(k);
                        }}
                        placeholder="+ Añadir Pack..."
                    />
                </div>
                <div className="w-full md:w-64">
                    <SearchableSelect 
                        options={productOptions}
                        value=""
                        onChange={(val) => {
                            const p = products.find(prod => prod.id === val);
                            if(p) addProductAsLine(p);
                        }}
                        placeholder="+ Añadir Producto..."
                    />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-100 text-slate-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="w-12 py-3"></th>
                    <th className="px-4 py-3 text-left w-24">Ref</th>
                    <th className="px-4 py-3 text-left">Descripción / Producto</th>
                    <th className="px-4 py-3 text-right w-24">Uds</th>
                    <th className="px-4 py-3 text-right w-32">Precio</th>
                    <th className="px-4 py-3 text-right w-32">Total</th>
                    <th className="w-12 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {budget.lineItems.map((item, index) => {
                    if (item.type === 'section') {
                      return (
                        <tr key={item.id} className="bg-slate-100/50 hover:bg-slate-100">
                          <td className="p-2 text-center">
                              <div className="flex flex-col text-slate-400">
                                <button onClick={() => moveLineItem(index, 'up')} className="hover:text-slate-800 p-1"><ArrowUpIcon/></button>
                                <button onClick={() => moveLineItem(index, 'down')} className="hover:text-slate-800 p-1"><ArrowDownIcon/></button>
                              </div>
                          </td>
                          <td colSpan={5} className="p-2">
                            <input 
                              className="w-full bg-transparent font-bold text-slate-700 placeholder-slate-400 border-none focus:ring-0 uppercase tracking-wide p-2"
                              placeholder="TÍTULO DE SECCIÓN"
                              value={item.description}
                              onChange={e => updateLineItem(item.id, { description: e.target.value })}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => removeLineItem(item.id)} className="text-slate-400 hover:text-red-500 p-2"><TrashIcon/></button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id} className="group hover:bg-gray-50/80">
                        <td className="p-2 text-center">
                          <div className="flex flex-col text-slate-300 group-hover:text-slate-400">
                            <button onClick={() => moveLineItem(index, 'up')} className="hover:text-slate-800 p-1"><ArrowUpIcon/></button>
                            <button onClick={() => moveLineItem(index, 'down')} className="hover:text-slate-800 p-1"><ArrowDownIcon/></button>
                          </div>
                        </td>
                        <td className="p-2">
                          <input className="w-full text-xs text-slate-700 bg-white border border-gray-200 rounded px-2 py-2" 
                            value={item.reference} onChange={e => updateLineItem(item.id, { reference: e.target.value })} 
                            placeholder="REF"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} className="w-10 h-10 object-cover rounded border border-gray-200 bg-white" />
                            ) : (
                              <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-slate-300 text-xs flex-shrink-0">IMG</div>
                            )}
                            <textarea className="w-full text-slate-800 bg-white border border-gray-200 rounded px-2 py-2 resize-none h-auto min-h-[40px]" 
                              value={item.description} onChange={e => updateLineItem(item.id, { description: e.target.value })} 
                              rows={1}
                              placeholder="Descripción del producto"
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full text-right bg-white border border-gray-200 rounded text-slate-900 focus:border-accent focus:ring-accent p-2" 
                            value={item.units} onChange={e => updateLineItem(item.id, { units: parseFloat(e.target.value) })} 
                          />
                        </td>
                        <td className="p-2">
                          <input type="number" className="w-full text-right bg-white border border-gray-200 rounded text-slate-900 focus:border-accent focus:ring-accent p-2" 
                            value={item.price} onChange={e => updateLineItem(item.id, { price: parseFloat(e.target.value) })} 
                          />
                        </td>
                        <td className="p-2 text-right font-medium text-slate-900">
                          {(item.units * item.price).toFixed(2)} €
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => removeLineItem(item.id)} className="text-slate-300 hover:text-red-500 p-2"><TrashIcon/></button>
                        </td>
                      </tr>
                    )
                  })}
                  {budget.lineItems.length === 0 && (
                    <tr><td colSpan={7} className="p-12 text-center text-slate-400 italic">No hay líneas. Añade productos o secciones.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer Grid: Signature & Totals */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Signature */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PenIcon /> Firma Digital Cliente
              </h3>
              <SignaturePad 
                initial={budget.clientSignature}
                onSave={(data) => updateBudget({ clientSignature: data })}
                onClear={() => updateBudget({ clientSignature: undefined })}
              />
            </div>

            {/* Right: Totals */}
            <div className="bg-slate-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{subtotal.toFixed(2)} €</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Descuento (%)</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" className="w-16 bg-white border border-gray-300 rounded text-right text-sm p-1"
                    value={budget.discountPercentage}
                    onChange={e => updateBudget({ discountPercentage: parseFloat(e.target.value) })}
                  />
                  <span className="text-red-500 w-20 text-right">-{discountAmount.toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700 font-medium">Bono / Subvención</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" className="w-24 border-green-300 rounded text-right text-sm text-green-700 bg-white p-1"
                    value={budget.bonusAmount}
                    onChange={e => updateBudget({ bonusAmount: parseFloat(e.target.value) })}
                  />
                  <span className="text-green-700 w-12 text-right">€</span>
                </div>
              </div>

              <div className="border-t border-gray-300 my-2"></div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-800 font-medium">Base Imponible</span>
                <span className="font-bold">{taxableBase.toFixed(2)} €</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">IVA</span>
                <div className="flex items-center gap-2">
                  <select 
                    className="w-16 bg-white border border-gray-300 rounded text-right text-sm p-1"
                    value={budget.taxPercentage}
                    onChange={e => updateBudget({ taxPercentage: parseFloat(e.target.value) })}
                  >
                    <option value="21">21%</option>
                    <option value="10">10%</option>
                    <option value="4">4%</option>
                    <option value="0">0%</option>
                  </select>
                  <span className="text-slate-600 w-20 text-right">+{taxAmount.toFixed(2)} €</span>
                </div>
              </div>

              <div className="border-t border-slate-800 my-4"></div>
              
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-slate-900">TOTAL</span>
                <span className={`text-3xl font-bold ${isSage ? 'text-[#00d061]' : 'text-red-600'}`}>{total.toFixed(2)} €</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <EyeIcon /> Vista Previa del Documento ({isSage ? 'Sage' : 'Ágora'})
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleGeneratePDF}
                  className={`${saveBtnColor} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}
                >
                  <DownloadIcon /> Descargar PDF
                </button>
                <button 
                  onClick={closePreview}
                  className="bg-gray-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  <XIcon />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 relative">
              {previewUrl ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full border-0" 
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Cargando vista previa...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};