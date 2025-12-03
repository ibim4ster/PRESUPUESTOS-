
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { CompanyProfile } from '../types';

export const Settings: React.FC = () => {
  const [company, setCompany] = useState<CompanyProfile>({ name: '', cif: '', address: '', email: '', phone: '', terms: '' });

  useEffect(() => {
    setCompany(storageService.getCompanyProfile());
  }, []);

  const handleSave = () => {
    storageService.saveCompanyProfile(company);
    alert('Datos de empresa guardados correctamente.');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setCompany({ ...company, logo: res });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = () => storageService.exportData();
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(storageService.importData(ev.target?.result as string)) {
          alert("Datos restaurados. Recargue la página.");
          window.location.reload();
        } else {
          alert("Error al importar.");
        }
      }
      reader.readAsText(file);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Configuración de Empresa</h2>
          <p className="text-slate-500">Gestiona los datos fiscales y copias de seguridad.</p>
        </div>
        <button onClick={handleSave} className="bg-accent text-white px-6 py-2 rounded shadow hover:bg-blue-600 font-medium">
          Guardar Datos
        </button>
      </div>

      {/* Company Data */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-slate-800">Datos Fiscales y de Contacto</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
             <label className="block text-sm font-medium mb-2 text-slate-700">Logo Empresa</label>
             <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-gray-50 relative overflow-hidden group">
               {company.logo ? (
                 <img src={company.logo} className="absolute inset-0 w-full h-full object-contain p-2" alt="Company Logo" />
               ) : (
                 <div className="text-center p-4">
                   <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                     <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                   <span className="text-xs text-slate-500">Subir Logo</span>
                 </div>
               )}
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <span className="text-white text-xs font-bold">Cambiar</span>
               </div>
             </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Razón Social / Nombre</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 focus:ring-2 focus:ring-accent outline-none" placeholder="Ej: Mi Empresa S.L." value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">CIF / NIF</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 focus:ring-2 focus:ring-accent outline-none" placeholder="Ej: B12345678" value={company.cif} onChange={e => setCompany({...company, cif: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email de Contacto</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 focus:ring-2 focus:ring-accent outline-none" placeholder="info@miempresa.com" value={company.email} onChange={e => setCompany({...company, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 focus:ring-2 focus:ring-accent outline-none" placeholder="900 000 000" value={company.phone} onChange={e => setCompany({...company, phone: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Dirección Completa</label>
              <textarea className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 focus:ring-2 focus:ring-accent outline-none resize-none h-20" placeholder="Calle, Número, CP, Ciudad..." value={company.address} onChange={e => setCompany({...company, address: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Términos Legales por Defecto</label>
              <textarea className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 focus:ring-2 focus:ring-accent outline-none h-24" placeholder="Estos términos aparecerán al principio de la sección legal en el PDF..." value={company.terms} onChange={e => setCompany({...company, terms: e.target.value})} />
            </div>
          </div>
        </div>
      </section>

      {/* Backup */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-slate-800">Copia de Seguridad</h3>
        <p className="text-sm text-slate-500 mb-4">Exporta todos tus datos (clientes, productos, historial) a un archivo seguro o restaura una copia anterior.</p>
        <div className="flex gap-4">
          <button onClick={handleBackup} className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Backup
          </button>
          <label className="bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300 cursor-pointer flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar Backup
            <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
          </label>
        </div>
      </section>
      
      <div className="text-center text-xs text-slate-400 mt-8">
        <p>Para configurar el aspecto visual de los documentos, vaya a la sección <strong>Personalizar PDF</strong> en el menú lateral.</p>
      </div>
    </div>
  );
};
