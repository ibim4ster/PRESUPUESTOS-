
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { Client, Budget } from '../types';

// Icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

export const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [clientBudgets, setClientBudgets] = useState<Budget[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Client>({
    id: '', commercialName: '', legalName: '', cif: '', address: '', email: '', phone: '', paymentMethod: 'Transferencia', notes: ''
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Borrar cliente y todos sus datos asociados?')) {
      storageService.deleteClient(id);
      if (editingId === id) resetForm();
    }
  };

  const handleEdit = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(client);
    setEditingId(client.id);
  };

  const handleRowClick = (client: Client) => {
      const allBudgets = storageService.getBudgets();
      const related = allBudgets.filter(b => b.clientId === client.id);
      setClientBudgets(related);
      setViewClient(client);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ id: '', commercialName: '', legalName: '', cif: '', address: '', email: '', phone: '', paymentMethod: 'Transferencia', notes: '' });
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          let importedCount = 0;
          const startIndex = lines[0].toLowerCase().includes('nombre comercial') ? 1 : 0;
          for (let i = startIndex; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              const parts = line.split(/[;,]/);
              if (parts.length < 3) continue;
              const newClient: Client = {
                  id: crypto.randomUUID(),
                  commercialName: parts[0]?.trim() || 'Sin Nombre',
                  legalName: parts[1]?.trim() || '',
                  cif: parts[2]?.trim() || '',
                  phone: parts[3]?.trim() || '',
                  email: parts[4]?.trim() || '',
                  address: parts[5]?.trim() || '',
                  paymentMethod: parts[6]?.trim() || 'Transferencia',
                  notes: ''
              };
              storageService.saveClient(newClient);
              importedCount++;
          }
          alert(`Se han importado ${importedCount} clientes correctamente.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
      const headers = "Nombre Comercial;Razón Social;CIF;Teléfono;Email;Dirección;Forma de Pago";
      const example = "Restaurante Ejemplo;Restaurante Ejemplo S.L.;B12345678;910000000;contacto@ejemplo.com;Calle Principal 1, Madrid;Transferencia";
      const bom = "\uFEFF"; 
      const csvContent = bom + headers + "\n" + example;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "plantilla_clientes_gravity.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const calculateClientTotal = (budgets: Budget[]) => budgets.filter(b => b.status === 'accepted').reduce((acc, b) => acc + b.lineItems.filter(l => l.type !== 'section').reduce((s, i) => s + i.price * i.units, 0), 0);

  const filteredClients = clients.filter(c => 
    c.commercialName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.legalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full border theme-border rounded-lg p-2.5 text-sm theme-input focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-shadow";
  const labelClass = "block text-xs font-bold uppercase theme-text-muted mb-1.5 ml-1";

  return (
    <div className="space-y-8 pb-12 theme-text-main">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
           <p className="theme-text-muted text-sm">Administra tu cartera de clientes y datos de facturación.</p>
        </div>
        <div className="flex items-center gap-2">
            <input type="file" accept=".csv,.txt" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
            <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border theme-border rounded-md theme-text-muted hover:theme-bg-card transition-colors"><DownloadIcon /> Plantilla</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-blue-500/30 theme-bg-card text-blue-500 rounded-md hover:bg-blue-500/10 transition-colors"><UploadIcon /> Importar CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
             <div className="theme-card rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b theme-border theme-bg-table-header flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold flex items-center gap-2">Cartera de Clientes <span className="text-xs font-bold theme-bg-main px-2 py-0.5 rounded border theme-border theme-text-muted">{clients.length}</span></h3>
                    <div className="relative w-full sm:w-64">
                        <input type="text" placeholder="Buscar empresa, CIF..." className="w-full pl-9 pr-3 py-2 theme-input rounded-lg text-sm outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <div className="absolute left-3 top-2.5 theme-text-muted"><SearchIcon /></div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                    <thead className="text-xs theme-text-muted uppercase theme-bg-table-header border-b theme-border">
                        <tr><th className="px-6 py-3">Empresa / Razón Social</th><th className="px-6 py-3">CIF / NIF</th><th className="px-6 py-3">Contacto</th><th className="px-6 py-3 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                        {filteredClients.map(c => (
                        <tr key={c.id} onClick={() => handleRowClick(c)} className="hover:theme-bg-main transition-colors cursor-pointer">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg theme-bg-main border theme-border flex items-center justify-center theme-text-muted font-bold text-xs shadow-sm">{getInitials(c.commercialName)}</div>
                                    <div>
                                        <div className="font-bold">{c.commercialName}</div>
                                        <div className="text-xs theme-text-muted">{c.legalName}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono theme-text-muted text-xs">{c.cif}</td>
                            <td className="px-6 py-4"><div className="theme-text-muted text-xs flex flex-col gap-1.5">{c.email && (<span className="flex items-center gap-2"><MailIcon /> {c.email}</span>)}{c.phone && (<span className="flex items-center gap-2"><PhoneIcon /> {c.phone}</span>)}</div></td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <button onClick={(e) => handleEdit(c, e)} className="p-2 theme-text-muted hover:text-blue-500 hover:theme-bg-main rounded-lg"><EditIcon /></button>
                                    <button onClick={(e) => handleDelete(c.id, e)} className="p-2 theme-text-muted hover:text-red-500 hover:theme-bg-main rounded-lg"><TrashIcon /></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="theme-card p-6 rounded-xl shadow-sm sticky top-4">
                <div className="flex justify-between items-center mb-6 pb-4 border-b theme-border">
                    <h3 className="font-bold flex items-center gap-2">{editingId ? <EditIcon /> : <UserPlusIcon />}{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                    {editingId && (<button onClick={resetForm} className="text-xs theme-text-muted hover:theme-text-main flex items-center gap-1 theme-bg-main px-2 py-1 rounded"><XIcon /> Cancelar</button>)}
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className={labelClass}>Nombre Comercial</label><input className={inputClass} placeholder="Ej: Restaurante El Puerto" value={formData.commercialName} onChange={e => setFormData({...formData, commercialName: e.target.value})} /></div>
                    <div><label className={labelClass}>Razón Social (Legal)</label><input className={inputClass} placeholder="Ej: Hostelería del Mar S.L." value={formData.legalName} onChange={e => setFormData({...formData, legalName: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>CIF / NIF</label><input className={inputClass} placeholder="B12345678" value={formData.cif} onChange={e => setFormData({...formData, cif: e.target.value})} /></div>
                        <div><label className={labelClass}>Teléfono</label><input className={inputClass} placeholder="600112233" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                    </div>
                    <div><label className={labelClass}>Email</label><input className={inputClass} type="email" placeholder="contacto@cliente.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                    <div><label className={labelClass}>Forma de Pago</label><select className={inputClass} value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}><option>Transferencia</option><option>Domiciliación Bancaria</option><option>Contado</option><option>Tarjeta</option><option>Financiación</option></select></div>
                    <div><label className={labelClass}>Dirección Completa</label><textarea className={`${inputClass} resize-none h-24`} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                    <div><label className={labelClass}>Notas Internas</label><textarea className={`${inputClass} resize-none h-20 opacity-90`} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 shadow-lg mt-2 flex justify-center items-center gap-2"><SaveIcon /> {editingId ? 'Actualizar Datos' : 'Guardar Cliente'}</button>
                </form>
            </div>
        </div>
      </div>

      {viewClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="theme-card w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between p-6 border-b theme-border theme-bg-table-header">
                      <div><h3 className="text-xl font-bold">{viewClient.commercialName}</h3><p className="theme-text-muted text-sm">{viewClient.legalName} • {viewClient.cif}</p></div>
                      <button onClick={() => setViewClient(null)} className="p-2 hover:theme-bg-main rounded-full theme-text-muted"><XIcon /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 theme-bg-card">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="p-4 theme-bg-main rounded-xl border theme-border"><span className="text-xs font-bold text-green-500 uppercase">Volumen Facturado</span><div className="text-2xl font-bold mt-1">{calculateClientTotal(clientBudgets).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div></div>
                          <div className="p-4 theme-bg-main rounded-xl border theme-border"><span className="text-xs font-bold text-blue-500 uppercase">Presupuestos Aceptados</span><div className="text-2xl font-bold mt-1">{clientBudgets.filter(b => b.status === 'accepted').length}</div></div>
                          <div className="p-4 theme-bg-main rounded-xl border theme-border"><span className="text-xs font-bold theme-text-muted uppercase">Último Contacto</span><div className="text-2xl font-bold mt-1">{clientBudgets.length > 0 ? new Date(Math.max(...clientBudgets.map(b => new Date(b.createdAt).getTime()))).toLocaleDateString() : 'N/A'}</div></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div><h4 className="font-bold mb-4 flex items-center gap-2"><FileTextIcon /> Historial de Presupuestos</h4><div className="space-y-3">{clientBudgets.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(b => (<div key={b.id} className="flex justify-between items-center p-3 border theme-border rounded-lg hover:theme-bg-main"><div><div className="font-bold text-sm">{b.number}</div><div className="text-xs theme-text-muted">{new Date(b.createdAt).toLocaleDateString()}</div></div><div className="text-right"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${b.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'theme-bg-main theme-text-muted'}`}>{b.status}</span></div></div>))}{clientBudgets.length === 0 && <p className="theme-text-muted text-sm italic">Sin historial.</p>}</div></div>
                          <div><h4 className="font-bold mb-4">Notas Internas</h4><div className="theme-bg-main p-4 rounded-lg border theme-border text-sm leading-relaxed min-h-[150px] opacity-80">{viewClient.notes || 'No hay notas registradas para este cliente.'}</div><div className="mt-6"><h4 className="font-bold mb-2">Datos Contacto</h4><p className="text-sm theme-text-muted mb-1"><strong>Email:</strong> {viewClient.email || '-'}</p><p className="text-sm theme-text-muted mb-1"><strong>Tel:</strong> {viewClient.phone || '-'}</p><p className="text-sm theme-text-muted"><strong>Dirección:</strong> {viewClient.address || '-'}</p></div></div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
