
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Client } from '../types';

export const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Client>({
    id: '', commercialName: '', legalName: '', cif: '', address: '', email: '', phone: '', paymentMethod: 'Transferencia'
  });

  useEffect(() => {
    const update = () => setClients([...storageService.getClients()]);
    update();
    const unsub = storageService.subscribe(update);
    return unsub;
  }, []);

  const handleSave = () => {
    if (!formData.commercialName) return alert('Nombre comercial requerido');
    
    const clientToSave = { ...formData, id: editingId || crypto.randomUUID() };
    storageService.saveClient(clientToSave);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Borrar cliente?')) {
      storageService.deleteClient(id);
    }
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingId(client.id);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ id: '', commercialName: '', legalName: '', cif: '', address: '', email: '', phone: '', paymentMethod: 'Transferencia' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Gestión de Clientes</h2>

      {/* Editor Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium mb-4">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="border p-2 rounded" placeholder="Nombre Comercial" 
            value={formData.commercialName} onChange={e => setFormData({...formData, commercialName: e.target.value})} 
          />
          <input 
            className="border p-2 rounded" placeholder="Razón Social (Legal)" 
            value={formData.legalName} onChange={e => setFormData({...formData, legalName: e.target.value})} 
          />
          <input 
            className="border p-2 rounded" placeholder="CIF / NIF" 
            value={formData.cif} onChange={e => setFormData({...formData, cif: e.target.value})} 
          />
          <input 
            className="border p-2 rounded" placeholder="Teléfono" 
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
          />
          <input 
            className="border p-2 rounded" placeholder="Email" type="email"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <select 
            className="border p-2 rounded" 
            value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
          >
            <option>Transferencia</option>
            <option>Domiciliación Bancaria</option>
            <option>Contado</option>
            <option>Tarjeta</option>
          </select>
          <div className="md:col-span-2">
            <textarea 
              className="border p-2 rounded w-full" placeholder="Dirección completa" 
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          {editingId && <button onClick={resetForm} className="px-4 py-2 text-slate-500">Cancelar</button>}
          <button onClick={handleSave} className="bg-accent text-white px-6 py-2 rounded shadow hover:bg-blue-600">
            Guardar Cliente
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-slate-500">
            <tr>
              <th className="px-6 py-3">Empresa</th>
              <th className="px-6 py-3">CIF</th>
              <th className="px-6 py-3">Contacto</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">
                  {c.commercialName}
                  <div className="text-xs text-slate-400 font-normal">{c.legalName}</div>
                </td>
                <td className="px-6 py-3">{c.cif}</td>
                <td className="px-6 py-3">
                  {c.email}<br/>{c.phone}
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-accent hover:underline">Editar</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
               <tr><td colSpan={4} className="p-6 text-center text-slate-400">No hay clientes registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
