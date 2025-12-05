
import React, { useState } from 'react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            authService.setSession(foundUser);
            onLoginSuccess(foundUser);
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    } catch (e) {
        setError('Error al procesar el login.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
         <div className="p-8 pb-6 border-b border-gray-100 flex flex-col items-center">
             <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                 G
             </div>
             <h1 className="text-2xl font-bold text-slate-900">Bienvenido a Gravity</h1>
             <p className="text-slate-500 text-sm mt-1">Gestión comercial y presupuestos</p>
         </div>
         
         <form onSubmit={handleLogin} className="p-8 pt-6 space-y-5">
             {error && (
                 <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                     {error}
                 </div>
             )}

             <div>
                 <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Usuario</label>
                 <input 
                    type="text" 
                    className="w-full border-gray-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none font-medium"
                    placeholder="Ej. admin"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoFocus
                 />
             </div>

             <div>
                 <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Contraseña</label>
                 <input 
                    type="password" 
                    className="w-full border-gray-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                 />
             </div>

             <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
             >
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
                {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>}
             </button>
         </form>
         
         <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-gray-100">
             &copy; {new Date().getFullYear()} Gravity Manager System
         </div>
      </div>
    </div>
  );
};
