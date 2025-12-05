
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Client } from '../types';

// Icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

export const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commercialName) return alert('Nombre comercial requerido');
    
    const clientToSave = { ...formData, id: editingId || crypto.randomUUID() };
    storageService.saveClient(clientToSave);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Borrar cliente y todos sus datos asociados?')) {
      storageService.deleteClient(id);
      if (editingId === id) resetForm();
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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const filteredClients = clients.filter(c => 
    c.commercialName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.legalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow";
  const labelClass = "block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1";

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Gestión de Clientes</h2>
           <p className="text-slate-500 text-sm">Administra tu cartera de clientes y datos de facturación.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LIST SECTION */}
        <div className="xl:col-span-2 space-y-4">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        Cartera de Clientes
                        <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-slate-500">{clients.length}</span>
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar empresa, CIF..." 
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-slate-400">
                            <SearchIcon />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-white border-b border-gray-100">
                        <tr>
                        <th className="px-6 py-3">Empresa / Razón Social</th>
                        <th className="px-6 py-3">CIF / NIF</th>
                        <th className="px-6 py-3">Contacto</th>
                        <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredClients.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                                        {getInitials(c.commercialName)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{c.commercialName}</div>
                                        <div className="text-xs text-slate-500">{c.legalName}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-600 text-xs">
                                {c.cif}
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-slate-600 text-xs flex flex-col gap-1.5">
                                    {c.email && (
                                        <span className="flex items-center gap-2 text-slate-500 font-medium">
                                            <MailIcon /> {c.email}
                                        </span>
                                    )}
                                    {c.phone && (
                                        <span className="flex items-center gap-2 text-slate-500 font-medium">
                                            <PhoneIcon /> {c.phone}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(c)} 
                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar Cliente"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(c.id)} 
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar Cliente"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))}
                        {filteredClients.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No hay clientes que coincidan con la búsqueda.</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* FORM SECTION (STICKY) */}
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {editingId ? <EditIcon /> : <UserPlusIcon />}
                        {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h3>
                    {editingId && (
                        <button onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            <XIcon /> Cancelar
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className={labelClass}>Nombre Comercial</label>
                        <input 
                            className={inputClass} 
                            placeholder="Ej: Restaurante El Puerto" 
                            value={formData.commercialName} onChange={e => setFormData({...formData, commercialName: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Razón Social (Legal)</label>
                        <input 
                            className={inputClass} 
                            placeholder="Ej: Hostelería del Mar S.L." 
                            value={formData.legalName} onChange={e => setFormData({...formData, legalName: e.target.value})} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>CIF / NIF</label>
                            <input 
                                className={inputClass} 
                                placeholder="B12345678" 
                                value={formData.cif} onChange={e => setFormData({...formData, cif: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Teléfono</label>
                            <input 
                                className={inputClass} 
                                placeholder="600112233" 
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input 
                            className={inputClass} type="email"
                            placeholder="contacto@cliente.com" 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Forma de Pago</label>
                        <select 
                            className={`${inputClass} cursor-pointer`}
                            value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                        >
                            <option>Transferencia</option>
                            <option>Domiciliación Bancaria</option>
                            <option>Contado</option>
                            <option>Tarjeta</option>
                            <option>Financiación</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Dirección Completa</label>
                        <textarea 
                            className={`${inputClass} resize-none h-24`} 
                            placeholder="Av. Principal 123, 28001 Madrid..." 
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                        />
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg mt-2 flex justify-center items-center gap-2">
                        <SaveIcon />
                        {editingId ? 'Actualizar Datos' : 'Guardar Cliente'}
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};
