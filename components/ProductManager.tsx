
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Product, ProductKit, ProductKitItem, SystemType } from '../types';
import { SearchableSelect } from './SearchableSelect';

export const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'kits'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<ProductKit[]>([]);
  
  // Product Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    id: '', reference: '', description: '', price: 0, image: '', system: 'both'
  });
  
  // Kit Form State
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  const [kitFormData, setKitFormData] = useState<ProductKit>({
    id: '', reference: '', description: '', system: 'both', items: []
  });

  const [filter, setFilter] = useState<'all' | SystemType>('all');

  useEffect(() => {
    const update = () => {
        setProducts([...storageService.getProducts()]);
        setKits([...storageService.getProductKits()]);
    };
    update();
    const unsub = storageService.subscribe(update);
    return unsub;
  }, []);

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
    setFormData(p);
    setEditingId(p.id);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ id: '', reference: '', description: '', price: 0, image: '', system: 'both' });
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    return p.system === filter || p.system === 'both' || !p.system;
  });

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
          return acc + (p ? p.price * item.units : 0);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Gestor de Catálogo</h2>
        <div className="flex bg-slate-200 rounded-lg p-1">
             <button 
                onClick={() => setActiveTab('products')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'products' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
             >
                Productos Individuales
             </button>
             <button 
                onClick={() => setActiveTab('kits')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'kits' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
             >
                Packs / Kits
             </button>
        </div>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <>
            <div className="flex justify-end mb-4">
                <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden text-xs">
                    <button onClick={() => setFilter('all')} className={`px-2 py-1.5 font-bold ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-gray-50'}`}>Todos</button>
                    <button onClick={() => setFilter('agora')} className={`px-2 py-1.5 font-bold ${filter === 'agora' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-gray-50'}`}>Ágora</button>
                    <button onClick={() => setFilter('sage')} className={`px-2 py-1.5 font-bold ${filter === 'sage' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-gray-50'}`}>Sage 50</button>
                    <button onClick={() => setFilter('sage200')} className={`px-2 py-1.5 font-bold ${filter === 'sage200' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-gray-50'}`}>Sage 200</button>
                    <button onClick={() => setFilter('sagedespachos')} className={`px-2 py-1.5 font-bold ${filter === 'sagedespachos' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-gray-50'}`}>Sage Desp.</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Referencia</label>
                    <input 
                        className="w-full border border-gray-300 p-2 rounded bg-white text-slate-900 focus:ring-2 focus:ring-accent focus:border-transparent outline-none" 
                        placeholder="Ej: REF-001" 
                        value={formData.reference} 
                        onChange={e => setFormData({...formData, reference: e.target.value})} 
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Precio (€)</label>
                    <input 
                        className="w-full border border-gray-300 p-2 rounded bg-white text-slate-900 focus:ring-2 focus:ring-accent focus:border-transparent outline-none" 
                        placeholder="0.00" 
                        type="number" 
                        step="0.01"
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                    />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Sistema Asignado</label>
                        <div className="flex flex-wrap gap-3">
                            {['both', 'agora', 'sage', 'sage200', 'sagedespachos'].map(sys => (
                                <label key={sys} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                    <input 
                                        type="radio" 
                                        name="system" 
                                        checked={formData.system === sys} 
                                        onChange={() => setFormData({...formData, system: sys as any})} 
                                    />
                                    <span className="text-xs font-medium">{systemLabels[sys]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Descripción</label>
                    <textarea 
                    className="w-full border border-gray-300 p-2 rounded h-24 bg-white text-slate-900 focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none" 
                    placeholder="Descripción del producto..."
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    {editingId && <button onClick={resetForm} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancelar</button>}
                    <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2 rounded shadow hover:bg-slate-800 font-medium">
                    {editingId ? 'Actualizar' : 'Guardar Producto'}
                    </button>
                </div>
                </div>
                
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                {formData.image ? (
                    <img src={formData.image} alt="Preview" className="max-h-40 object-contain mb-4 bg-white p-2 rounded shadow-sm" />
                ) : (
                    <div className="text-slate-400 mb-4 text-center text-sm">Sin imagen</div>
                )}
                <label className="cursor-pointer bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded text-sm hover:bg-gray-50 hover:text-slate-900 transition-colors shadow-sm">
                    Subir Imagen
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex space-x-4 hover:shadow-md transition-shadow relative">
                    <span className={`absolute top-2 right-2 text-[10px] uppercase font-bold px-1.5 rounded text-white ${
                        p.system === 'sage' || p.system?.startsWith('sage') ? 'bg-[#00d061]' : p.system === 'agora' ? 'bg-red-500' : 'bg-slate-400'
                    }`}>
                        {p.system === 'both' ? 'TODOS' : p.system}
                    </span>
                    <div className="w-16 h-16 bg-gray-50 rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <span className="text-xl">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate pr-6">{p.reference}</div>
                    <div className="text-sm text-slate-500 truncate" title={p.description}>{p.description}</div>
                    <div className="font-mono text-slate-800 font-bold mt-1">{p.price.toFixed(2)} €</div>
                    </div>
                    <div className="flex flex-col space-y-2 justify-center">
                    <button onClick={() => handleEdit(p)} className="text-xs bg-slate-100 p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Editar">✏️</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-50 p-1.5 rounded hover:bg-red-100 text-red-600" title="Borrar">🗑️</button>
                    </div>
                </div>
                ))}
            </div>
        </>
      )}

      {/* KITS TAB */}
      {activeTab === 'kits' && (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{editingKitId ? 'Editar Pack' : 'Crear Nuevo Pack'}</h3>
                    <p className="text-xs text-slate-500">Agrupa varios productos para añadirlos rápidamente a los presupuestos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nombre del Pack</label>
                            <input 
                                className="w-full border border-gray-300 p-2 rounded bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none" 
                                placeholder="Ej: TPV Completo Ágora" 
                                value={kitFormData.reference} 
                                onChange={e => setKitFormData({...kitFormData, reference: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Descripción</label>
                            <textarea 
                                className="w-full border border-gray-300 p-2 rounded h-20 bg-white text-slate-900 focus:ring-2 focus:ring-accent outline-none resize-none" 
                                placeholder="Descripción del pack..." 
                                value={kitFormData.description} 
                                onChange={e => setKitFormData({...kitFormData, description: e.target.value})} 
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Sistema</label>
                             <div className="flex flex-wrap gap-2">
                                {['both', 'agora', 'sage', 'sage200', 'sagedespachos'].map(sys => (
                                    <label key={sys} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                        <input 
                                            type="radio" 
                                            name="kitSystem" 
                                            checked={kitFormData.system === sys} 
                                            onChange={() => setKitFormData({...kitFormData, system: sys as any})} 
                                        />
                                        <span className="text-xs">{systemLabels[sys]}</span>
                                    </label>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Contenido del Pack</label>
                        
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
                                    <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200">
                                        <div className="w-8 h-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                            {prod.image ? <img src={prod.image} className="w-full h-full object-cover" /> : <span className="text-xs">📦</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold truncate">{prod.reference}</div>
                                            <div className="text-[10px] text-slate-500 truncate">{prod.description}</div>
                                        </div>
                                        <div className="w-16">
                                            <input 
                                                type="number" min="1" 
                                                className="w-full text-right text-xs p-1 border border-gray-300 rounded bg-white text-slate-900"
                                                value={item.units}
                                                onChange={(e) => updateKitItemUnits(idx, parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <button onClick={() => removeProductFromKit(idx)} className="text-slate-400 hover:text-red-500 px-1">×</button>
                                    </div>
                                )
                            })}
                            {kitFormData.items.length === 0 && (
                                <div className="text-center text-slate-400 text-xs py-4 italic">Añade productos para formar el pack</div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                            <div className="text-xs text-slate-500">
                                <strong>{kitFormData.items.length}</strong> productos
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                Total Calculado: {calculateKitPrice(kitFormData.items).toFixed(2)} €
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    {editingKitId && <button onClick={resetKitForm} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold">Cancelar</button>}
                    <button onClick={handleSaveKit} className="bg-slate-900 text-white px-6 py-2 rounded shadow hover:bg-slate-800 text-sm font-bold">
                        {editingKitId ? 'Actualizar Pack' : 'Guardar Pack'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kits.map(kit => (
                    <div key={kit.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                             <div>
                                 <div className="font-bold text-slate-800">{kit.reference}</div>
                                 <div className="text-xs text-slate-500">{kit.description}</div>
                             </div>
                             <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white ${
                                 kit.system === 'sage' || kit.system?.startsWith('sage') ? 'bg-[#00d061]' : kit.system === 'agora' ? 'bg-red-500' : 'bg-slate-400'
                             }`}>
                                {kit.system === 'both' ? 'TODOS' : kit.system}
                             </span>
                        </div>
                        <div className="bg-gray-50 rounded p-2 mb-3 text-xs space-y-1 text-slate-600">
                            {kit.items.slice(0, 3).map((it, i) => {
                                const p = products.find(prod => prod.id === it.productId);
                                return p ? <div key={i} className="truncate">• {it.units}x {p.reference}</div> : null;
                            })}
                            {kit.items.length > 3 && <div className="text-slate-400 italic">+ {kit.items.length - 3} más...</div>}
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                            <div className="font-mono font-bold text-slate-800 text-sm">{calculateKitPrice(kit.items).toFixed(2)} €</div>
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