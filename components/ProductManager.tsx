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
// Fix: Added the missing TrashIcon definition
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

export const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'kits'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<ProductKit[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({ id: '', reference: '', description: '', price: 0, costPrice: 0, category: '', stock: 0, minStock: 5, image: '', system: 'both' });
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  const [kitFormData, setKitFormData] = useState<ProductKit>({ id: '', reference: '', description: '', system: 'both', items: [] });
  const [filter, setFilter] = useState<'all' | SystemType>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => { setProducts([...storageService.getProducts()]); setKits([...storageService.getProductKits()]); };
    update();
    return storageService.subscribe(update);
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, image: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const handleAiDescription = async () => {
      if(!formData.description) return alert('Escribe algo básico primero.');
      setIsAiLoading(true);
      const improved = await aiService.polishDescription(formData.description);
      setFormData({...formData, description: improved});
      setIsAiLoading(false);
  };

  const handleSave = () => {
    if (!formData.description || !formData.reference) return alert('Datos incompletos');
    storageService.saveProduct({ ...formData, id: editingId || crypto.randomUUID() });
    resetForm();
  };

  const handleDelete = (id: string) => { if (confirm('¿Borrar producto?')) storageService.deleteProduct(id); };
  const handleEdit = (p: Product) => { setFormData({ ...p, price: p.price || 0, costPrice: p.costPrice || 0, category: p.category || '', stock: p.stock || 0, minStock: p.minStock || 5 }); setEditingId(p.id); };
  const resetForm = () => { setEditingId(null); setFormData({ id: '', reference: '', description: '', price: 0, costPrice: 0, category: '', stock: 0, minStock: 5, image: '', system: 'both' }); };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          let importedCount = 0;
          const startIndex = lines[0].toLowerCase().includes('referencia') ? 1 : 0;
          for (let i = startIndex; i < lines.length; i++) {
              const line = lines[i].trim(); if (!line) continue;
              const parts = line.split(/[;,]/); if (parts.length < 3) continue;
              const rawSystem = parts[7]?.trim().toLowerCase().replace(/\s+/g, '');
              let system: SystemType | 'both' = 'both';
              if (['agora', 'sage', 'sage200', 'sagedespachos'].includes(rawSystem)) system = rawSystem as SystemType;
              storageService.saveProduct({ id: crypto.randomUUID(), reference: parts[0]?.trim() || 'N/A', description: parts[1]?.trim() || 'Sin descripción', price: parseFloat(parts[2]?.replace(',', '.') || '0') || 0, costPrice: parseFloat(parts[3]?.replace(',', '.') || '0') || 0, stock: parseInt(parts[4] || '0') || 0, minStock: parseInt(parts[5] || '5') || 5, category: parts[6]?.trim() || '', system });
              importedCount++;
          }
          alert(`Se han importado ${importedCount} productos correctamente.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
      const bom = "\uFEFF"; const headers = "Referencia;Descripción;Precio;Coste;Stock;StockMinimo;Categoría;Sistema";
      const example = "REF-001;TPV Táctil;450.00;300.00;10;2;Hardware;agora";
      const blob = new Blob([bom + headers + "\n" + example], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "plantilla_productos.csv"; link.click();
  };

  const filteredProducts = products.filter(p => {
    const matchesSystem = filter === 'all' || p.system === filter || p.system === 'both';
    const matchesSearch = p.reference.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || p.category === categoryFilter;
    return matchesSystem && matchesSearch && matchesCategory;
  });

  const marginPercent = formData.price > 0 ? ((formData.price - (formData.costPrice || 0)) / formData.price) * 100 : 0;

  const handleSaveKit = () => {
    if (!kitFormData.reference || !kitFormData.description) return alert('Datos incompletos');
    storageService.saveProductKit({ ...kitFormData, id: editingKitId || crypto.randomUUID() });
    resetKitForm();
  };

  const resetKitForm = () => { setEditingKitId(null); setKitFormData({ id: '', reference: '', description: '', system: 'both', items: [] }); };
  const handleDeleteKit = (id: string) => { if(confirm('¿Borrar pack?')) storageService.deleteProductKit(id); };
  const handleEditKit = (k: ProductKit) => { setKitFormData(k); setEditingKitId(k.id); };

  const systemLabels: Record<string, string> = { both: 'Ambos', agora: 'Ágora', sage: 'Sage 50', sage200: 'Sage 200', sagedespachos: 'Sage Despachos' };

  return (
    <div className="space-y-6 pb-12 theme-text-main">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h2 className="text-2xl font-bold">Gestor de Catálogo</h2><p className="text-sm theme-text-muted">Administra tus soluciones comerciales.</p></div>
        <div className="flex items-center gap-2 flex-wrap">
             {activeTab === 'products' && (
                 <>
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border theme-border rounded-lg theme-text-muted hover:theme-bg-card transition-all"><DownloadIcon /> Plantilla</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-blue-500/30 theme-bg-card text-blue-500 rounded-lg hover:bg-blue-500/10 transition-all"><UploadIcon /> Importar CSV</button>
                    <input type="file" accept=".csv,.txt" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                 </>
             )}
             <div className="flex theme-bg-main rounded-xl p-1 border theme-border">
                 <button onClick={() => setActiveTab('products')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'products' ? 'theme-bg-card shadow-sm theme-text-main' : 'theme-text-muted hover:theme-text-main'}`}>Productos</button>
                 <button onClick={() => setActiveTab('kits')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'kits' ? 'theme-bg-card shadow-sm theme-text-main' : 'theme-text-muted hover:theme-text-main'}`}>Packs / Kits</button>
             </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="relative w-full md:w-80"><input type="text" placeholder="Buscar por referencia o nombre..." className="w-full pl-10 pr-4 py-2.5 theme-input border theme-border rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><div className="absolute left-3 top-3 theme-text-muted"><SearchIcon /></div></div>
                 <div className="flex gap-2 w-full md:w-auto"><select className="flex-1 md:flex-none theme-input border theme-border rounded-xl text-xs font-bold p-2.5 cursor-pointer outline-none transition-all" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="">Todas las Categorías</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select><div className="flex theme-bg-main rounded-xl border theme-border overflow-hidden text-[10px] font-black uppercase"><button onClick={() => setFilter('all')} className={`px-3 py-1 transition-colors ${filter === 'all' ? 'bg-[var(--accent-color)] text-white' : 'theme-text-muted hover:theme-bg-card'}`}>TODOS</button><button onClick={() => setFilter('agora')} className={`px-3 py-1 transition-colors ${filter === 'agora' ? 'bg-[var(--accent-color)] text-white' : 'theme-text-muted hover:theme-bg-card'}`}>AGORA</button><button onClick={() => setFilter('sage')} className={`px-3 py-1 transition-colors ${filter === 'sage' ? 'bg-[var(--accent-color)] text-white' : 'theme-text-muted hover:theme-bg-card'}`}>SAGE</button></div></div>
            </div>

            <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-5">
                    <h3 className="font-bold theme-text-main flex items-center gap-2">{editingId ? '✏️ Editar Producto' : '📦 Nuevo Producto'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1 ml-1">Referencia</label><input className="w-full theme-input border theme-border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all" placeholder="Ej: REF-001" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} /></div>
                        <div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1 ml-1">Categoría</label><input className="w-full theme-input border theme-border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all" placeholder="Ej: Hardware" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} list="cats" /><datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist></div>
                        <div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1 ml-1">Precio Venta (€)</label><input className="w-full theme-input border theme-border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all font-mono" type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} /></div>
                        <div><div className="flex justify-between items-center mb-1 ml-1"><label className="text-[10px] font-black uppercase theme-text-muted">Coste (€)</label><span className={`text-[10px] font-bold px-1.5 rounded-full ${marginPercent > 30 ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>Margen: {marginPercent.toFixed(1)}%</span></div><input className="w-full theme-input border theme-border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all font-mono" type="number" step="0.01" value={formData.costPrice || ''} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} /></div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-4 theme-bg-main p-4 rounded-xl border theme-border"><div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1 ml-1">Stock Actual</label><input className="w-full theme-input border theme-border p-2 rounded-lg text-sm font-bold" type="number" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} /></div><div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1 ml-1">Aviso Stock Mín.</label><input className="w-full theme-input border theme-border p-2 rounded-lg text-sm" type="number" value={formData.minStock || 5} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} /></div></div>
                        <div className="md:col-span-2"><label className="block text-[10px] font-black uppercase theme-text-muted mb-2 ml-1">Sistema Destino</label><div className="flex flex-wrap gap-2">{Object.keys(systemLabels).map(sys => (<button key={sys} onClick={() => setFormData({...formData, system: sys as any})} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${formData.system === sys ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'theme-bg-main theme-text-muted theme-border hover:theme-bg-card'}`}>{systemLabels[sys]}</button>))}</div></div>
                    </div>
                    <div><div className="flex justify-between items-center mb-1 ml-1"><label className="text-[10px] font-black uppercase theme-text-muted">Descripción Comercial</label><button onClick={handleAiDescription} disabled={isAiLoading} className="text-[10px] bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full font-bold hover:bg-purple-500/20 transition-all flex items-center gap-1"><SparklesIcon /> {isAiLoading ? 'Redactando...' : 'Optimizar con IA'}</button></div><textarea className="w-full theme-input border theme-border p-3 rounded-xl h-24 text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none resize-none transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                    <div className="flex justify-end gap-3">{editingId && <button onClick={resetForm} className="px-5 py-2 theme-text-muted font-bold hover:theme-text-main transition-colors text-sm">Cancelar</button>}<button onClick={handleSave} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all font-bold text-sm uppercase tracking-tight">{editingId ? 'Actualizar Producto' : 'Guardar en Catálogo'}</button></div>
                </div>
                <div className="w-full md:w-64 flex flex-col items-center gap-4">
                    <label className="block text-[10px] font-black uppercase theme-text-muted w-full text-center">Imagen del Producto</label>
                    <div className="w-full aspect-square border-2 border-dashed theme-border rounded-2xl flex items-center justify-center theme-bg-main relative group overflow-hidden">{formData.image ? <img src={formData.image} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" /> : <div className="theme-text-muted"><ImageIcon /></div>}<input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" /></div>
                    <p className="text-[9px] theme-text-muted text-center italic">Formatos: JPG, PNG, WEBP. Max 2MB.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(p => (
                    <div key={p.id} className="theme-card p-4 rounded-xl shadow-sm border theme-border hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex gap-4">
                            <div className="w-14 h-14 theme-bg-main rounded-lg flex-shrink-0 flex items-center justify-center border theme-border overflow-hidden">{p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <BoxIcon />}</div>
                            <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate theme-text-main">{p.reference}</div><div className="text-[10px] theme-text-muted truncate mb-2">{p.description}</div><div className="flex items-center justify-between"><span className="font-bold text-sm theme-text-main">{p.price.toFixed(2)}€</span><span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${p.system === 'agora' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-600'}`}>{p.system === 'both' ? 'Global' : p.system}</span></div></div>
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all flex items-center justify-center gap-3"><button onClick={() => handleEdit(p)} className="bg-white text-slate-900 p-2 rounded-full hover:scale-110 transition-all shadow-lg"><SearchIcon /></button><button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white p-2 rounded-full hover:scale-110 transition-all shadow-lg"><TrashIcon /></button></div>
                    </div>
                ))}
            </div>
        </>
      ) : (
        <div className="text-center py-12 theme-text-muted italic theme-card border theme-border rounded-2xl">Lógica de Packs bajo desarrollo visual...</div>
      )}
    </div>
  );
};