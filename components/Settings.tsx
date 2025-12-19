
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { CompanyProfile, CloudConfig, AppTheme } from '../types';
import { EmailTemplates } from './EmailTemplates';

export const Settings: React.FC = () => {
  const [company, setCompany] = useState<CompanyProfile>({ name: '', cif: '', address: '', email: '', phone: '', terms: '' });
  const [cloud, setCloud] = useState<CloudConfig>({ apiKey: '', authDomain: '', projectId: '', enabled: false });
  const [connectionStatus, setConnectionStatus] = useState<{success?: boolean, message?: string} | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [user, setUser] = useState(authService.getSession());
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(user?.themePreference || 'classic');
  const [monthlyGoal, setMonthlyGoal] = useState<number>(user?.monthlyGoal || 0);

  useEffect(() => {
    setCompany(storageService.getCompanyProfile());
    setCloud(storageService.getCloudConfig());
  }, []);

  const handleSaveCompany = () => { 
    storageService.saveCompanyProfile(company); 
    alert('Datos de empresa guardados correctamente.'); 
  };

  const handleSavePreferences = () => {
      if(user) {
          // Obtenemos el usuario más fresco de la base de datos para no perder campos
          const allUsers = storageService.getUsers();
          const dbUser = allUsers.find(u => u.id === user.id);
          
          const updatedUser = { 
            ...(dbUser || user), 
            themePreference: selectedTheme, 
            monthlyGoal: monthlyGoal 
          };
          
          storageService.saveUser(updatedUser);
          authService.setSession(updatedUser);
          setUser(updatedUser);
          
          // Forzamos un pequeño delay para que el notify de storage haga su trabajo
          setTimeout(() => {
              alert('Preferencias actualizadas correctamente.');
          }, 100);
      }
  };

  const handleSaveCloud = () => { storageService.saveCloudConfig(cloud); alert('Configuración guardada.'); setConnectionStatus(null); };
  const handleTestConnection = async () => { setIsTesting(true); setConnectionStatus(null); const result = await storageService.testConnection(); setConnectionStatus(result); setIsTesting(false); };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => setCompany({ ...company, logo: event.target?.result as string });
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
        }
      }
      reader.readAsText(file);
    }
  }

  const inputClass = "w-full border theme-border rounded-lg p-2.5 text-sm theme-input outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all";
  const sectionClass = "theme-card p-6 rounded-xl shadow-sm space-y-6 border theme-border";

  return (
    <div className="space-y-6 pb-12 theme-text-main">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Configuración Global</h2>
          <button onClick={() => window.location.reload()} className="text-xs theme-bg-card theme-text-muted px-3 py-1.5 rounded font-bold border theme-border hover:theme-bg-main transition-colors">🔄 Recargar App</button>
      </div>

      <section className={sectionClass}>
          <div className="flex justify-between items-center mb-4 border-b theme-border pb-2">
              <h3 className="text-lg font-bold">Mis Preferencias</h3>
              <button onClick={handleSavePreferences} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-bold shadow-md hover:bg-slate-800 transition-all">Guardar Ajustes</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <label className="block text-sm font-bold theme-text-muted mb-3">Tema Visual</label>
                  <div className="grid grid-cols-3 gap-4">
                      {['classic', 'ocean', 'midnight'].map(t => (
                        <div key={t} onClick={() => setSelectedTheme(t as AppTheme)} className={`cursor-pointer border-2 rounded-xl p-2 flex flex-col gap-2 transition-all group ${selectedTheme === t ? 'border-[var(--accent-color)] theme-bg-main shadow-inner' : 'theme-border hover:theme-bg-main'}`}>
                            <div className={`h-12 rounded-lg transition-transform group-hover:scale-95 ${t === 'classic' ? 'bg-slate-900' : t === 'ocean' ? 'bg-cyan-600' : 'bg-black border border-white/20'}`}></div>
                            <div className="text-[10px] text-center font-black uppercase tracking-widest">{t === 'classic' ? 'Clásico' : t === 'ocean' ? 'Océano' : 'Noche'}</div>
                        </div>
                      ))}
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-bold theme-text-muted mb-3">Objetivo Mensual (€)</label>
                  <div className="relative group"><input type="number" className={inputClass} value={monthlyGoal} onChange={(e) => setMonthlyGoal(parseFloat(e.target.value))} /><span className="absolute right-3 top-2.5 theme-text-muted font-bold">€</span></div>
                  <p className="text-[11px] theme-text-muted mt-2 leading-relaxed italic">Define tu meta de ventas para ver el progreso real en tiempo real desde tu Dashboard.</p>
              </div>
          </div>
      </section>

      <section className="theme-card border theme-border rounded-xl overflow-hidden shadow-sm">
          <EmailTemplates />
      </section>

      {authService.isAdmin(user) && (
          <section className={sectionClass}>
             <div className="flex justify-between items-start mb-4 border-b theme-border pb-2">
                <div><h3 className="text-lg font-bold">☁️ Sincronización en la Nube (Firebase)</h3><p className="text-xs theme-text-muted mt-1">Sincroniza tus datos entre dispositivos y comerciales.</p></div>
                <div className="flex items-center gap-2"><span className={`text-xs font-black ${cloud.enabled ? 'text-green-500' : 'theme-text-muted'}`}>{cloud.enabled ? 'CONECTADO' : 'DESCONECTADO'}</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={cloud.enabled} onChange={e => setCloud({...cloud, enabled: e.target.checked})} /><div className="w-11 h-6 theme-bg-main border theme-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label></div>
             </div>
             {cloud.enabled && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                     {connectionStatus && (<div className={`p-4 rounded-xl text-sm border ${connectionStatus.success ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}><strong className="block mb-1">{connectionStatus.success ? 'Conexión Exitosa' : 'Error de Conexión'}</strong>{connectionStatus.message}</div>)}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div><label className="block text-xs font-bold theme-text-muted mb-1">API Key</label><input className={`${inputClass} font-mono text-[10px]`} value={cloud.apiKey} onChange={e => setCloud({...cloud, apiKey: e.target.value})} /></div>
                         <div><label className="block text-xs font-bold theme-text-muted mb-1">Auth Domain</label><input className={`${inputClass} font-mono text-[10px]`} value={cloud.authDomain} onChange={e => setCloud({...cloud, authDomain: e.target.value})} /></div>
                         <div><label className="block text-xs font-bold theme-text-muted mb-1">Project ID</label><input className={`${inputClass} font-mono text-[10px]`} value={cloud.projectId} onChange={e => setCloud({...cloud, projectId: e.target.value})} /></div>
                     </div>
                     <div className="flex gap-4 mt-4 border-t theme-border pt-4">
                        <button onClick={handleSaveCloud} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-slate-900 transition-all">Guardar Configuración</button>
                        <button onClick={handleTestConnection} disabled={isTesting} className={`px-4 py-2 rounded-lg text-sm font-bold border theme-border ${isTesting ? 'opacity-50' : 'hover:theme-bg-main'} transition-all`}>{isTesting ? 'Probando...' : '🔍 Probar Conexión'}</button>
                     </div>
                 </div>
             )}
          </section>
      )}

      <section className={sectionClass}>
        <div className="flex justify-between items-center mb-4 border-b theme-border pb-2"><h3 className="text-lg font-bold">Datos Fiscales de la Empresa</h3><button onClick={handleSaveCompany} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-all">Guardar Cambios</button></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
             <label className="block text-xs font-bold uppercase theme-text-muted mb-2 ml-1">Logo Corporativo</label>
             <div className="border-2 border-dashed theme-border rounded-2xl h-40 flex items-center justify-center theme-bg-main relative overflow-hidden group hover:border-[var(--accent-color)] transition-all">
               {company.logo ? (<img src={company.logo} className="absolute inset-0 w-full h-full object-contain p-4 transition-transform group-hover:scale-105" />) : (<span className="text-xs theme-text-muted font-bold">Subir Logo</span>)}
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
               {company.logo && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white text-[10px] font-bold uppercase tracking-tighter">Cambiar Imagen</span></div>}
             </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold theme-text-muted mb-1 ml-1">Razón Social</label><input className={inputClass} value={company.name} onChange={e => setCompany({...company, name: e.target.value})} /></div>
            <div><label className="block text-xs font-bold theme-text-muted mb-1 ml-1">CIF / NIF</label><input className={inputClass} value={company.cif} onChange={e => setCompany({...company, cif: e.target.value})} /></div>
            <div><label className="block text-xs font-bold theme-text-muted mb-1 ml-1">Email</label><input className={inputClass} value={company.email} onChange={e => setCompany({...company, email: e.target.value})} /></div>
            <div><label className="block text-xs font-bold theme-text-muted mb-1 ml-1">Teléfono</label><input className={inputClass} value={company.phone} onChange={e => setCompany({...company, phone: e.target.value})} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold theme-text-muted mb-1 ml-1">Dirección Postal</label><textarea className={`${inputClass} h-20 resize-none`} value={company.address} onChange={e => setCompany({...company, address: e.target.value})} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold theme-text-muted mb-1 ml-1">Términos Legales (Defecto)</label><textarea className={`${inputClass} h-24 resize-none leading-tight`} value={company.terms} onChange={e => setCompany({...company, terms: e.target.value})} /></div>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-lg font-bold mb-4 border-b theme-border pb-2">Copias de Seguridad</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={handleBackup} className="theme-bg-main theme-text-main border theme-border px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-md transition-all flex items-center gap-2">⬇ Exportar JSON</button>
          <label className="theme-bg-main theme-text-main border theme-border px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:shadow-md transition-all flex items-center gap-2">⬆ Importar JSON<input type="file" accept=".json" className="hidden" onChange={handleRestore} /></label>
        </div>
      </section>
    </div>
  );
};
