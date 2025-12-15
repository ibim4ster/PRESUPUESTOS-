
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { CompanyProfile, CloudConfig, AppTheme } from '../types';
import { EmailTemplates } from './EmailTemplates'; // NEW IMPORT

export const Settings: React.FC = () => {
  const [company, setCompany] = useState<CompanyProfile>({ name: '', cif: '', address: '', email: '', phone: '', terms: '' });
  const [cloud, setCloud] = useState<CloudConfig>({ apiKey: '', authDomain: '', projectId: '', enabled: false });
  const [connectionStatus, setConnectionStatus] = useState<{success?: boolean, message?: string} | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [user, setUser] = useState(authService.getSession());
  
  // Theme & Goals state
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
          const updatedUser = { ...user, themePreference: selectedTheme, monthlyGoal: monthlyGoal };
          storageService.saveUser(updatedUser);
          authService.setSession(updatedUser);
          setUser(updatedUser);
          alert('Preferencias actualizadas. La interfaz se actualizará automáticamente.');
      }
  };

  const handleSaveCloud = () => {
    storageService.saveCloudConfig(cloud);
    alert('Configuración guardada. Realiza la prueba de conexión para verificar.');
    setConnectionStatus(null);
  };

  const handleTestConnection = async () => {
      setIsTesting(true);
      setConnectionStatus(null);
      const result = await storageService.testConnection();
      setConnectionStatus(result);
      setIsTesting(false);
  };

  const compressImage = (file: File, maxWidth = 500): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png', 0.8));
            };
        };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 400); // 400px width limit
        setCompany({ ...company, logo: compressedBase64 });
      } catch (err) {
        console.error("Error compressing image", err);
        alert("Error al procesar la imagen");
      }
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
    <div className="space-y-6 pb-12">
      <h2 className="text-2xl font-bold text-primary">Configuración Global</h2>

      {/* PERSONAL PREFERENCES */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-slate-800">Mis Preferencias</h3>
              <button onClick={handleSavePreferences} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700">Guardar Mis Ajustes</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <label className="block text-sm font-bold text-slate-600 mb-3">Tema Visual</label>
                  <div className="grid grid-cols-3 gap-4">
                      <div 
                        onClick={() => setSelectedTheme('classic')}
                        className={`cursor-pointer border-2 rounded-lg p-2 flex flex-col gap-2 ${selectedTheme === 'classic' ? 'border-slate-800 bg-slate-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                          <div className="h-8 bg-slate-900 rounded"></div>
                          <div className="text-xs text-center font-bold text-slate-700">Clásico</div>
                      </div>
                      <div 
                        onClick={() => setSelectedTheme('ocean')}
                        className={`cursor-pointer border-2 rounded-lg p-2 flex flex-col gap-2 ${selectedTheme === 'ocean' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                          <div className="h-8 bg-indigo-900 rounded"></div>
                          <div className="text-xs text-center font-bold text-indigo-700">Océano</div>
                      </div>
                      <div 
                        onClick={() => setSelectedTheme('midnight')}
                        className={`cursor-pointer border-2 rounded-lg p-2 flex flex-col gap-2 ${selectedTheme === 'midnight' ? 'border-zinc-800 bg-zinc-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                          <div className="h-8 bg-zinc-950 rounded"></div>
                          <div className="text-xs text-center font-bold text-zinc-700">Noche</div>
                      </div>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-slate-600 mb-3">Objetivo Mensual de Ventas (Gamificación)</label>
                  <div className="relative">
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded-lg p-3 text-slate-900 bg-white font-mono font-bold pl-8 focus:ring-2 focus:ring-slate-900 outline-none"
                        value={monthlyGoal}
                        onChange={(e) => setMonthlyGoal(parseFloat(e.target.value))}
                      />
                      <span className="absolute left-3 top-3 text-slate-400">€</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Introduce tu meta de facturación mensual para ver la barra de progreso en el Dashboard.</p>
              </div>
          </div>
      </section>

      {/* NEW: Email Templates */}
      <section>
          <EmailTemplates />
      </section>

      {/* Cloud Sync - ONLY ADMIN */}
      {authService.isAdmin(user) && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-4 border-b pb-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        ☁️ Sincronización en la Nube (Google Firebase)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Conecta esta app a tu cuenta de Google para tener los mismos datos en PC y Móvil.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${cloud.enabled ? 'text-green-600' : 'text-slate-400'}`}>
                        {cloud.enabled ? 'ACTIVADO' : 'DESACTIVADO'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={cloud.enabled} onChange={e => setCloud({...cloud, enabled: e.target.checked})} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
             </div>

             {cloud.enabled && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                     
                     {/* Status Indicator */}
                     {connectionStatus && (
                         <div className={`p-4 rounded text-sm border ${connectionStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                             <strong className="block mb-1">{connectionStatus.success ? '✅ Conexión Exitosa' : '❌ Error de Conexión'}</strong>
                             {connectionStatus.message}
                         </div>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">API Key</label>
                             <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 font-mono text-xs" 
                                placeholder="AIzaSy..." 
                                value={cloud.apiKey} onChange={e => setCloud({...cloud, apiKey: e.target.value})} 
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Auth Domain</label>
                             <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 font-mono text-xs" 
                                placeholder="proyecto.firebaseapp.com" 
                                value={cloud.authDomain} onChange={e => setCloud({...cloud, authDomain: e.target.value})} 
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Project ID</label>
                             <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 font-mono text-xs" 
                                placeholder="proyecto-id" 
                                value={cloud.projectId} onChange={e => setCloud({...cloud, projectId: e.target.value})} 
                             />
                         </div>
                     </div>
                     
                     <div className="flex gap-4 mt-4 border-t pt-4">
                        <button onClick={handleSaveCloud} className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-slate-900">
                            Guardar Configuración
                        </button>
                        <button 
                            onClick={handleTestConnection} 
                            disabled={isTesting}
                            className={`px-4 py-2 rounded text-sm font-bold border ${isTesting ? 'bg-gray-100 text-gray-400' : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                        >
                            {isTesting ? 'Probando...' : '🔍 Probar Conexión'}
                        </button>
                     </div>
                 </div>
             )}
          </section>
      )}

      {/* Company Data */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-slate-800">Datos Fiscales de la Empresa</h3>
            <button onClick={handleSaveCompany} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700">
              Guardar Cambios
            </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
             <label className="block text-sm font-medium mb-2 text-slate-700">Logo</label>
             <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-gray-50 relative overflow-hidden group">
               {company.logo ? (
                 <img src={company.logo} className="absolute inset-0 w-full h-full object-contain p-2" alt="Logo" />
               ) : (
                 <span className="text-xs text-slate-500">Subir Logo</span>
               )}
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
             </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Razón Social</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">CIF / NIF</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900" value={company.cif} onChange={e => setCompany({...company, cif: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900" value={company.email} onChange={e => setCompany({...company, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
              <input className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900" value={company.phone} onChange={e => setCompany({...company, phone: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Dirección</label>
              <textarea className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 h-20 resize-none" value={company.address} onChange={e => setCompany({...company, address: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Términos Legales (Defecto)</label>
              <textarea className="w-full bg-white border border-gray-300 p-2 rounded text-slate-900 h-20 resize-none" value={company.terms} onChange={e => setCompany({...company, terms: e.target.value})} />
            </div>
          </div>
        </div>
      </section>

      {/* Backup */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-slate-800">Copia de Seguridad Manual</h3>
        <div className="flex gap-4">
          <button onClick={handleBackup} className="bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-medium hover:bg-slate-300">
            ⬇ Exportar JSON
          </button>
          <label className="bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-medium hover:bg-slate-300 cursor-pointer">
            ⬆ Importar JSON
            <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
          </label>
        </div>
      </section>
    </div>
  );
};