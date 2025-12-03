
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Product } from '../types';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    id: '', reference: '', description: '', price: 0, image: ''
  });

  useEffect(() => {
    setProducts(storageService.getProducts());
  }, []);

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
    setProducts(storageService.getProducts());
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Borrar producto?')) {
      storageService.deleteProduct(id);
      setProducts(storageService.getProducts());
    }
  };

  const handleEdit = (p: Product) => {
    setFormData(p);
    setEditingId(p.id);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ id: '', reference: '', description: '', price: 0, image: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Catálogo de Productos</h2>

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
            <button onClick={handleSave} className="bg-accent text-white px-6 py-2 rounded shadow hover:bg-blue-600 font-medium">
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
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex space-x-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-gray-50 rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
              {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <span className="text-xl">📦</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 truncate">{p.reference}</div>
              <div className="text-sm text-slate-500 truncate" title={p.description}>{p.description}</div>
              <div className="font-mono text-accent font-bold mt-1">{p.price.toFixed(2)} €</div>
            </div>
            <div className="flex flex-col space-y-2 justify-center">
              <button onClick={() => handleEdit(p)} className="text-xs bg-slate-100 p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Editar">✏️</button>
              <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-50 p-1.5 rounded hover:bg-red-100 text-red-600" title="Borrar">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
