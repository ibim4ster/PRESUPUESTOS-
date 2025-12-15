import React, { useState } from 'react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

// Icons
const EyeIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const UserIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LockIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldCheckIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const AlertTriangleIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'login' | 'force_change'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Force Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const users = storageService.getUsers();
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!foundUser) {
            setError('Usuario o contraseña incorrectos.');
            setLoading(false);
            return;
        }

        const inputHash = await authService.hashPassword(password);
        if (inputHash === foundUser.passwordHash) {
            
            // Check Security Rotation (15 days)
            const lastChange = foundUser.lastPasswordChange ? new Date(foundUser.lastPasswordChange).getTime() : new Date(foundUser.createdAt).getTime();
            const now = Date.now();
            
            if (now - lastChange > FIFTEEN_DAYS_MS) {
                setPendingUser(foundUser);
                setStep('force_change');
                setLoading(false);
                return;
            }

            // Success
            completeLogin(foundUser);
        } else {
            setError('Usuario o contraseña incorrectos.');
            setLoading(false);
        }
    } catch (e) {
        setError('Error al procesar el login.');
        setLoading(false);
    }
  };

  const handleForceChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!pendingUser) return;
      if(newPassword.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
      if(newPassword !== confirmPassword) return setError('Las contraseñas no coinciden.');

      setLoading(true);
      
      const newHash = await authService.hashPassword(newPassword);
      const updatedUser: User = { 
          ...pendingUser, 
          passwordHash: newHash, 
          lastPasswordChange: new Date().toISOString() 
      };

      storageService.saveUser(updatedUser);
      storageService.addLog({ userId: updatedUser.id, userName: updatedUser.name, action: 'PASSWORD_ROTATED', details: 'Cambio de contraseña obligatorio por seguridad (15 días).' });
      
      completeLogin(updatedUser);
  };

  const completeLogin = (user: User) => {
      authService.setSession(user);
      storageService.addLog({ userId: user.id, userName: user.name, action: 'LOGIN_EXITOSO', details: 'Inicio de sesión' });
      onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/10 backdrop-blur-xl bg-white/5 relative z-10">
         
         {/* HEADER */}
         <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center">
             <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-blue-500/30">G</div>
             <h1 className="text-2xl font-bold text-white tracking-tight">Gravity Manager</h1>
             <p className="text-slate-400 text-sm mt-1">Plataforma de Gestión Integral</p>
         </div>
         
         {step === 'login' ? (
             <form onSubmit={handleLogin} className="p-8 pt-6 space-y-6">
                 {error && (
                     <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm font-medium border border-red-500/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                         {error}
                     </div>
                 )}

                 <div className="space-y-1">
                     <label className="block text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider">Usuario</label>
                     <div className="relative group">
                        <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors"><UserIcon /></div>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium placeholder-slate-600" 
                            placeholder="Ej. admin" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            autoFocus 
                        />
                     </div>
                 </div>

                 <div className="space-y-1">
                     <label className="block text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider">Contraseña</label>
                     <div className="relative group">
                        <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors"><LockIcon /></div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-12 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium placeholder-slate-600" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-3 text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors" 
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                     </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3.5 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4 active:scale-[0.98]"
                 >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Iniciar Sesión'}
                 </button>
             </form>
         ) : (
             <form onSubmit={handleForceChange} className="p-8 pt-4 space-y-6">
                 <div className="text-center">
                     <div className="flex justify-center mb-4"><AlertTriangleIcon /></div>
                     <h2 className="text-xl font-bold text-white mb-2">Caducidad de Seguridad</h2>
                     <p className="text-sm text-slate-400 leading-relaxed">
                         Por políticas de seguridad, su contraseña debe renovarse cada 15 días. Por favor, establezca una nueva.
                     </p>
                 </div>

                 {error && (
                     <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm font-medium border border-red-500/20 flex items-center gap-2">
                         {error}
                     </div>
                 )}

                 <div className="space-y-4">
                     <div>
                         <label className="block text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider mb-1">Nueva Contraseña</label>
                         <input 
                            type="password" 
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none font-medium placeholder-slate-600"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            autoFocus
                         />
                     </div>
                     <div>
                         <label className="block text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider mb-1">Confirmar Contraseña</label>
                         <input 
                            type="password" 
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none font-medium placeholder-slate-600"
                            placeholder="Repita la contraseña"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                         />
                     </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg hover:shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-[0.98]"
                 >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>Actualizar y Acceder <ShieldCheckIcon className="w-4 h-4 text-white" /></>
                    )}
                 </button>
             </form>
         )}
         
         <div className="bg-white/5 p-4 text-center text-[10px] text-slate-500 border-t border-white/5 font-medium tracking-wide">
             SECURE ACCESS • ENCRYPTED END-TO-END
         </div>
      </div>
    </div>
  );
};