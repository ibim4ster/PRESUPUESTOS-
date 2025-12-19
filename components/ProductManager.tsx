
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { aiService } from '../services/ai';
import { Product, ProductKit, ProductKitItem, SystemType } from '../types';
import { SearchableSelect } from './SearchableSelect';

// Icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

export const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'kits'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<ProductKit[]>([]);
  
  // Product Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    id: '', reference: '', description: '', price: 0, costPrice: 0, category: '', stock: 0, minStock: 5, image: '', system: 'both'
  });
  
  // Kit Form State
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  const [kitFormData, setKitFormData] = useState<ProductKit>({
    id: '', reference: '', description: '', system: 'both', items: []
  });

  const [filter, setFilter] = useState<'all' | SystemType>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => {
        setProducts([...storageService.getProducts()]);
        setKits([...storageService.getProductKits()]);
    };
    update();
    const unsub = storageService.subscribe(update);
    return unsub;
  }, []);

  // Extract unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  // --- PRODUCT LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiDescription = async () => {
      if(!formData.description) return alert('Escribe algo básico primero para que la IA pueda mejorarlo.');
      if(!aiService.isAvailable()) return alert('Error: API KEY no configurada en .env');
      
      setIsAiLoading(true);
      const improved = await aiService.polishDescription(formData.description);
      setFormData({...formData, description: improved});
      setIsAiLoading(false);
  };

  const handleSave = () => {
    if (!formData.description || !formData.reference) return alert('Datos incompletos');
    const prodToSave = { ...formData, id: editingId || crypto.randomUUID() };
    storageService.saveProduct(prodToSave);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Borrar producto?')) {
      storageService.deleteProduct(id);
    }
  };

  const handleEdit = (p: Product) => {
    setFormData({ 
        ...p, 
        price: p.price || 0,
        costPrice: p.costPrice || 0, 
        category: p.category || '',
        stock: p.stock !== undefined ? p.stock : 0,
        minStock: p.minStock !== undefined ? p.minStock : 5
    });
    setEditingId(p.id);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ id: '', reference: '', description: '', price: 0, costPrice: 0, category: '', stock: 0, minStock: 5, image: '', system: 'both' });
  };

  // --- CSV IMPORT ---
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          let importedCount = 0;

          // Skip header row if present
          const startIndex = lines[0].toLowerCase().includes('referencia') ? 1 : 0;

          for (let i = startIndex; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              // Expected format: Reference;Description;Price;Cost;Stock;StockMin;Category;System
              const parts = line.split(/[;,]/); // Allow ; or ,
              if (parts.length < 3) continue;

              // Improved System Parsing: Remove spaces and lowercase to handle "Sage Despachos" -> "sagedespachos"
              const rawSystem = parts[7]?.trim().toLowerCase().replace(/\s+/g, '');
              let system: SystemType | 'both' = 'both';
              
              if (['agora', 'sage', 'sage200', 'sagedespachos'].includes(rawSystem)) {
                  system = rawSystem as SystemType;
              }

              const newProd: Product = {
                  id: crypto.randomUUID(),
                  reference: parts[0]?.trim() || 'N/A',
                  description: parts[1]?.trim() || 'Sin descripción',
                  price: parseFloat(parts[2]?.replace(',', '.') || '0') || 0,
                  costPrice: parseFloat(parts[3]?.replace(',', '.') || '0') || 0,
                  stock: parseInt(parts[4] || '0') || 0, 
                  minStock: parseInt(parts[5] || '5') || 5,
                  category: parts[6]?.trim() || '',
                  system: system
              };
              
              storageService.saveProduct(newProd);
              importedCount++;
          }
          alert(`Se han importado ${importedCount} productos correctamente.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
      const headers = "Referencia;Descripción;Precio;Coste;Stock;StockMinimo;Categoría;Sistema";
      const example = "REF-001;Software Gestión;450.00;300.00;999;0;Software;sagedespachos";
      // Add BOM for Excel compatibility
      const bom = "\uFEFF";
      const csvContent = bom + headers + "\n" + example;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "plantilla_productos_gravity.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => {
    const matchesSystem = filter === 'all' || p.system === filter || p.system === 'both' || !p.system;
    const matchesSearch = p.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || p.category === categoryFilter;
    
    return matchesSystem && matchesSearch && matchesCategory;
  });

  // Calculate Margin
  const marginPercent = formData.price > 0 && formData.costPrice !== undefined
    ? ((formData.price - formData.costPrice) / formData.price) * 100 
    : 0;

  // --- KIT LOGIC ---
  const handleSaveKit = () => {
    if (!kitFormData.reference || !kitFormData.description) return alert('Datos incompletos');
    const kitToSave = { ...kitFormData, id: editingKitId || crypto.randomUUID() };
    storageService.saveProductKit(kitToSave);
    resetKitForm();
  };

  const resetKitForm = () => {
    setEditingKitId(null);
    setKitFormData({ id: '', reference: '', description: '', system: 'both', items: [] });
  };

  const handleDeleteKit = (id: string) => {
      if(confirm('¿Borrar este Pack?')) {
          storageService.deleteProductKit(id);
      }
  };

  const handleEditKit = (k: ProductKit) => {
      setKitFormData(k);
      setEditingKitId(k.id);
  };

  const addProductToKit = (prodId: string) => {
      setKitFormData(prev => ({
          ...prev,
          items: [...prev.items, { productId: prodId, units: 1 }]
      }));
  };

  const removeProductFromKit = (index: number) => {
      const newItems = [...kitFormData.items];
      newItems.splice(index, 1);
      setKitFormData(prev => ({ ...prev, items: newItems }));
  };

  const updateKitItemUnits = (index: number, units: number) => {
      const newItems = [...kitFormData.items];
      newItems[index].units = units;
      setKitFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateKitPrice = (kitItems: ProductKitItem[]) => {
      return kitItems.reduce((acc, item) => {
          const p = products.find(prod => prod.id === item.productId);
          return acc + ((p?.price || 0) * item.units);
      }, 0);
  };

  const productOptions = products.map(p => ({
      label: p.reference,
      subLabel: p.description,
      value: p.id,
      image: p.image
  }));

  const systemLabels: Record<string, string> = {
      both: 'Ambos/Todos',
      agora: 'Ágora',
      sage: 'Sage 50',
      sage200: 'Sage 200',
      sagedespachos: 'Sage Despachos'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold theme-text-main">Gestor de Catálogo</h2>
            <p className="text-sm theme-text-muted">Administra productos, stock y packs.</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
             {activeTab === 'products' && (
                 <div className="flex gap-2">
                    <input 
                        type="file" 
                        accept=".csv,.txt" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImportCSV} 
                    />
                    <button 
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border theme-border rounded-md theme-text-muted hover:bg-[var(--hover-bg)] hover:text-[var(--text-main)] transition-colors"
                        title="Descargar plantilla CSV"
                    >
                        <DownloadIcon /> Plantilla
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        <UploadIcon /> Importar CSV
                    </button>
                 </div>
             )}
             <div className="flex bg-[var(--hover-bg)] rounded-lg p-1 border theme-border">
                 <button 
                    onClick={() => setActiveTab('products')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'products' ? 'bg-[var(--bg-card)] shadow theme-text-main' : 'theme-text-muted'}`}
                 >
                    Productos
                 </button>
                 <button 
                    onClick={() => setActiveTab('kits')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'kits' ? 'bg-[var(--bg-card)] shadow theme-text-main' : 'theme-text-muted'}`}
                 >
                    Packs
                 </button>
             </div>
        </div>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                 <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Buscar producto..." 
                        className="w-full pl-9 pr-3 py-2 theme-input border theme-border rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5 theme-text-muted">
                        <SearchIcon />
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select 
                        className="theme-input border theme-border rounded-lg text-xs font-bold p-2 cursor-pointer focus:outline-none"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Todas las Categorías</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <div className="flex theme-card rounded-lg border theme-border overflow-hidden text-xs flex-shrink-0">
                        <button onClick={() => setFilter('all')} className={`px-2 py-1.5 font-bold ${filter === 'all' ? 'bg-[var(--accent-color)] text-white' : 'theme-text-muted hover:bg-[var(--hover-bg)]'}`}>Todos</button>
                        <button onClick={() => setFilter('agora')} className={`px-2 py-1.5 font-bold ${filter === 'agora' ? 'bg-[var(--accent-color)] text-white' : 'theme-text-muted hover:bg-[var(--hover-bg)]'}`}>Ágora</button>
                        <button onClick={() => setFilter('sage')} className={`px-2 py-1.5 font-bold ${filter === 'sage' ? 'bg-[var(--accent-color)] text-white' : 'theme-text-muted hover:bg-[var(--hover-bg)]'}`}>Sage</button>
                    </div>
                </div>
            </div>

            <div className="theme-card p-6 rounded-xl shadow-sm border theme-border flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-medium theme-text-main">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    
                    {/* FIXED: Proper Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold theme-text-muted mb-1">Referencia</label>
                            <input 
                                className="w-full border theme-border p-2 rounded theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none" 
                                placeholder="Ej: REF-001" 
                                value={formData.reference} 
                                onChange={e => setFormData({...formData, reference: e.target.value})} 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold theme-text-muted mb-1 flex items-center gap-1"><TagIcon/> Categoría</label>
                            <div className="relative">
                                <input 
                                    className="w-full border theme-border p-2 rounded theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none" 
                                    placeholder="Ej: Hardware" 
                                    value={formData.category || ''} 
                                    onChange={e => setFormData({...formData, category: e.target.value})} 
                                    list="category-suggestions"
                                />
                                <datalist id="category-suggestions">
                                    {categories.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold theme-text-muted mb-1">P. Venta (€)</label>
                            <input 
                                className="w-full border theme-border p-2 rounded theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none" 
                                placeholder="0.00" 
                                type="number" 
                                step="0.01"
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-xs font-bold theme-text-muted">P. Coste (€)</label>
                                <span className={`text-[10px] font-bold px-1.5 rounded ${marginPercent > 30 ? 'bg-green-100 text-green-700' : marginPercent > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                    Margen: {isNaN(marginPercent) ? '0.00' : marginPercent.toFixed(2)}%
                                </span>
                            </div>
                            <input 
                                className="w-full border theme-border p-2 rounded theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none" 
                                placeholder="0.00" 
                                type="number" 
                                step="0.01"
                                value={formData.costPrice || ''} 
                                onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} 
                            />
                        </div>

                        {/* Stock Section - Full Width in Mobile, Split in Grid */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-blue-50/20 p-3 rounded-lg border border-blue-100/30">
                            <div>
                                <label className="block text-[10px] font-bold text-blue-500 mb-1 uppercase">Stock Actual</label>
                                <div className="flex items-center gap-2">
                                    <BoxIcon />
                                    <input 
                                        className="w-full border theme-border p-1.5 rounded theme-input focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                                        type="number" 
                                        value={formData.stock || ''} 
                                        onChange={e => setFormData({...formData, stock: parseFloat(e.target.value) || 0})} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-blue-500 mb-1 uppercase">Stock Mínimo (Alerta)</label>
                                <input 
                                    className="w-full border theme-border p-1.5 rounded theme-input focus:ring-2 focus:ring-blue-500 outline-none" 
                                    type="number" 
                                    value={formData.minStock || ''} 
                                    onChange={e => setFormData({...formData, minStock: parseFloat(e.target.value) || 0})} 
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold theme-text-muted mb-1">Sistema Asignado</label>
                            <div className="flex flex-wrap gap-3">
                                {['both', 'agora', 'sage', 'sage200', 'sagedespachos'].map(sys => (
                                    <label key={sys} className="flex items-center gap-2 cursor-pointer bg-[var(--bg-main)] px-2 py-1 rounded border theme-border hover:bg-[var(--hover-bg)]">
                                        <input 
                                            type="radio" 
                                            name="system" 
                                            checked={formData.system === sys} 
                                            onChange={() => setFormData({...formData, system: sys as any})} 
                                        />
                                        <span className="text-xs font-medium theme-text-main">{systemLabels[sys]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold theme-text-muted mb-1 flex justify-between">
                            <span>Descripción</span>
                            <button 
                                onClick={handleAiDescription}
                                disabled={isAiLoading}
                                className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-purple-200 transition-colors disabled:opacity-50"
                            >
                                <SparklesIcon /> {isAiLoading ? 'Pensando...' : 'Mejorar con IA'}
                            </button>
                        </label>
                        <textarea 
                        className="w-full border theme-border p-2 rounded h-24 theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none resize-none" 
                        placeholder="Ej: TPV completo con pantalla táctil e impresora..."
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                        {editingId && <button onClick={resetForm} className="px-4 py-2 theme-text-muted hover:text-[var(--text-main)]">Cancelar</button>}
                        <button onClick={handleSave} className="bg-[var(--accent-color)] text-white px-6 py-2 rounded shadow hover:opacity-90 font-medium">
                        {editingId ? 'Actualizar' : 'Guardar Producto'}
                        </button>
                    </div>
                </div>
                
                <div className="w-full md:w-1/3 flex flex-col items-center justify-start border-2 border-dashed theme-border rounded-lg p-4 bg-[var(--bg-main)] h-fit mt-10">
                    {formData.image ? (
                        <img src={formData.image} alt="Preview" className="max-h-40 object-contain mb-4 bg-white p-2 rounded shadow-sm" />
                    ) : (
                        <div className="theme-text-muted mb-4 text-center">
                            <div className="w-20 h-20 bg-[var(--bg-card)] rounded-lg flex items-center justify-center mx-auto mb-2 border theme-border">
                                <ImageIcon />
                            </div>
                            <span className="text-xs">Sin imagen</span>
                        </div>
                    )}
                    <label className="cursor-pointer bg-[var(--bg-card)] border theme-border theme-text-main px-4 py-2 rounded text-sm hover:bg-[var(--hover-bg)] transition-colors shadow-sm">
                        Subir Imagen
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(p => {
                    const currentStock = p.stock || 0;
                    const minStock = p.minStock || 0;
                    const isLowStock = currentStock <= minStock;

                    return (
                        <div key={p.id} className="theme-card p-4 rounded-lg shadow-sm border theme-border flex space-x-4 hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                <span className={`text-[10px] uppercase font-bold px-1.5 rounded text-white ${
                                    p.system === 'sage' || p.system?.startsWith('sage') ? 'bg-[#00d061]' : p.system === 'agora' ? 'bg-red-500' : 'bg-slate-400'
                                }`}>
                                    {p.system === 'both' ? 'TODOS' : p.system}
                                </span>
                                {isLowStock ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1 border border-red-200">
                                        ⚠️ Stock Bajo ({currentStock})
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                                        Stock: {currentStock}
                                    </span>
                                )}
                            </div>
                            
                            <div className="w-16 h-16 bg-[var(--bg-main)] rounded flex-shrink-0 flex items-center justify-center overflow-hidden border theme-border theme-text-muted">
                            {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ImageIcon />}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                            <div className="font-bold theme-text-main truncate pr-16 text-sm">{p.reference}</div>
                            <div className="text-xs theme-text-muted truncate" title={p.description}>{p.description}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="font-mono theme-text-main font-bold text-sm">{(p.price || 0).toFixed(2)} €</div>
                                {p.category && <span className="text-[9px] bg-[var(--bg-main)] theme-text-muted px-1 rounded border theme-border flex items-center gap-1"><TagIcon/> {p.category}</span>}
                            </div>
                            </div>
                            <div className="flex flex-col space-y-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(p)} className="text-xs bg-[var(--bg-main)] p-1.5 rounded hover:bg-[var(--hover-bg)] theme-text-main" title="Editar">✏️</button>
                            <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-50 p-1.5 rounded hover:bg-red-100 text-red-600" title="Borrar">🗑️</button>
                            </div>
                        </div>
                    );
                })}
                {filteredProducts.length === 0 && (
                     <div className="col-span-full text-center py-12 theme-text-muted italic">No se encontraron productos</div>
                )}
            </div>
        </>
      )}

      {/* KITS TAB */}
      {activeTab === 'kits' && (
        <div className="space-y-8">
            <div className="theme-card p-6 rounded-xl shadow-sm border theme-border flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-bold theme-text-main mb-1">{editingKitId ? 'Editar Pack' : 'Crear Nuevo Pack'}</h3>
                    <p className="text-xs theme-text-muted">Agrupa varios productos para añadirlos rápidamente a los presupuestos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-4">
                        <div>
                            <label className="block text-xs font-bold theme-text-muted mb-1">Nombre del Pack</label>
                            <input 
                                className="w-full border theme-border p-2 rounded theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none" 
                                placeholder="Ej: TPV Completo Ágora" 
                                value={kitFormData.reference} 
                                onChange={e => setKitFormData({...kitFormData, reference: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold theme-text-muted mb-1">Descripción</label>
                            <textarea 
                                className="w-full border theme-border p-2 rounded h-20 theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none resize-none" 
                                placeholder="Descripción del pack..." 
                                value={kitFormData.description} 
                                onChange={e => setKitFormData({...kitFormData, description: e.target.value})} 
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold theme-text-muted mb-1">Sistema</label>
                             <div className="flex flex-wrap gap-2">
                                {['both', 'agora', 'sage', 'sage200', 'sagedespachos'].map(sys => (
                                    <label key={sys} className="flex items-center gap-2 cursor-pointer bg-[var(--bg-main)] px-2 py-1 rounded border theme-border">
                                        <input 
                                            type="radio" 
                                            name="kitSystem" 
                                            checked={kitFormData.system === sys} 
                                            onChange={() => setKitFormData({...kitFormData, system: sys as any})} 
                                        />
                                        <span className="text-xs theme-text-main">{systemLabels[sys]}</span>
                                    </label>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-[var(--bg-main)] rounded-lg p-4 border theme-border flex flex-col">
                        <label className="block text-xs font-bold theme-text-muted mb-2">Contenido del Pack</label>
                        
                        <div className="mb-4">
                            <SearchableSelect 
                                options={productOptions}
                                value=""
                                onChange={(val) => addProductToKit(val)}
                                placeholder="+ Añadir Producto al Pack..."
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 max-h-60 pr-1 custom-scrollbar">
                            {kitFormData.items.map((item, idx) => {
                                const prod = products.find(p => p.id === item.productId);
                                if(!prod) return null;
                                return (
                                    <div key={idx} className="flex items-center gap-3 theme-card p-2 rounded border theme-border">
                                        <div className="w-8 h-8 rounded bg-[var(--bg-main)] border theme-border flex items-center justify-center overflow-hidden theme-text-muted">
                                            {prod.image ? <img src={prod.image} className="w-full h-full object-cover" /> : <ImageIcon />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold truncate theme-text-main">{prod.reference}</div>
                                            <div className="text-[10px] theme-text-muted truncate">{prod.description}</div>
                                        </div>
                                        <div className="w-16">
                                            <input 
                                                type="number" min="1" 
                                                className="w-full text-right text-xs p-1 border theme-border rounded theme-input"
                                                value={item.units}
                                                onChange={(e) => updateKitItemUnits(idx, parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <button onClick={() => removeProductFromKit(idx)} className="text-slate-400 hover:text-red-500 px-1">×</button>
                                    </div>
                                )
                            })}
                            {kitFormData.items.length === 0 && (
                                <div className="text-center theme-text-muted text-xs py-4 italic">Añade productos para formar el pack</div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t theme-border flex justify-between items-center">
                            <div className="text-xs theme-text-muted">
                                <strong>{kitFormData.items.length}</strong> productos
                            </div>
                            <div className="text-sm font-bold theme-text-main">
                                Total Calculado: {calculateKitPrice(kitFormData.items).toFixed(2)} €
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t theme-border pt-4">
                    {editingKitId && <button onClick={resetKitForm} className="px-4 py-2 theme-text-muted hover:text-[var(--text-main)] text-sm font-bold">Cancelar</button>}
                    <button onClick={handleSaveKit} className="bg-[var(--accent-color)] text-white px-6 py-2 rounded shadow hover:opacity-90 text-sm font-bold">
                        {editingKitId ? 'Actualizar Pack' : 'Guardar Pack'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kits.map(kit => (
                    <div key={kit.id} className="theme-card p-4 rounded-lg shadow-sm border theme-border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                             <div>
                                 <div className="font-bold theme-text-main">{kit.reference}</div>
                                 <div className="text-xs theme-text-muted">{kit.description}</div>
                             </div>
                             <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white ${
                                 kit.system === 'sage' || kit.system?.startsWith('sage') ? 'bg-[#00d061]' : kit.system === 'agora' ? 'bg-red-500' : 'bg-slate-400'
                             }`}>
                                {kit.system === 'both' ? 'TODOS' : kit.system}
                             </span>
                        </div>
                        <div className="bg-[var(--bg-main)] rounded p-2 mb-3 text-xs space-y-1 theme-text-muted">
                            {kit.items.slice(0, 3).map((it, i) => {
                                const p = products.find(prod => prod.id === it.productId);
                                return p ? <div key={i} className="truncate">• {it.units}x {p.reference}</div> : null;
                            })}
                            {kit.items.length > 3 && <div className="text-slate-400 italic">+ {kit.items.length - 3} más...</div>}
                        </div>
                        <div className="flex justify-between items-center border-t theme-border pt-2">
                            <div className="font-mono font-bold theme-text-main text-sm">{calculateKitPrice(kit.items).toFixed(2)} €</div>
                            <div className="space-x-2">
                                <button onClick={() => handleEditKit(kit)} className="text-blue-600 hover:underline text-xs font-bold">Editar</button>
                                <button onClick={() => handleDeleteKit(kit.id)} className="text-red-500 hover:underline text-xs font-bold">Borrar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
