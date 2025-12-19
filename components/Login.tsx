
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { User } from '../types';

// Fix: Type casting for motion components to avoid environment-specific TS errors
const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;
const MotionForm = motion.form as any;
const MotionButton = motion.button as any;

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

// Apple-style Spring Physics
const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Default: Light Mode
  const [step, setStep] = useState<'login' | 'force_change'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Force Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const users = storageService.getUsers();
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!foundUser) {
            triggerError('Credenciales no válidas');
            setLoading(false);
            return;
        }

        const inputHash = await authService.hashPassword(password);
        if (inputHash === foundUser.passwordHash) {
            const lastChange = foundUser.lastPasswordChange ? new Date(foundUser.lastPasswordChange).getTime() : new Date(foundUser.createdAt).getTime();
            if (Date.now() - lastChange > FIFTEEN_DAYS_MS) {
                setPendingUser(foundUser);
                setStep('force_change');
                setLoading(false);
                return;
            }
            completeLogin(foundUser);
        } else {
            triggerError('Contraseña incorrecta');
            setLoading(false);
        }
    } catch (e) {
        triggerError('Error de conexión');
        setLoading(false);
    }
  };

  const handleForceChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!pendingUser) return;
      if(newPassword.length < 6) return triggerError('Mínimo 6 caracteres');
      if(newPassword !== confirmPassword) return triggerError('Las contraseñas no coinciden');

      setLoading(true);
      const newHash = await authService.hashPassword(newPassword);
      const updatedUser: User = { 
          ...pendingUser, 
          passwordHash: newHash, 
          lastPasswordChange: new Date().toISOString() 
      };

      storageService.saveUser(updatedUser);
      storageService.addLog({ userId: updatedUser.id, userName: updatedUser.name, action: 'PASSWORD_ROTATED', details: 'Rotación obligatoria.' });
      completeLogin(updatedUser);
  };

  const completeLogin = (user: User) => {
      authService.setSession(user);
      storageService.addLog({ userId: user.id, userName: user.name, action: 'LOGIN', details: 'Acceso autorizado.' });
      onLoginSuccess(user);
  };

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center p-6 transition-colors duration-700 ease-in-out font-sans overflow-hidden ${isDarkMode ? 'bg-[#020617]' : 'bg-gray-50'}`}>
      
      {/* Theme Toggle Button */}
      <MotionButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-8 right-8 z-50 p-3 rounded-2xl border transition-all duration-300 shadow-xl ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-gray-200 text-slate-600'}`}
      >
        <AnimatePresence mode="wait">
          {isDarkMode ? (
            <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sun className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Moon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionButton>

      {/* --- ANIMATED MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <MotionDiv 
          animate={{ 
            scale: isDarkMode ? [1, 1.2, 1] : [1.2, 1, 1.2],
            x: isDarkMode ? [0, 100, 0] : [0, -100, 0],
            y: isDarkMode ? [0, -50, 0] : [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100/60'}`}
        />
        <MotionDiv 
          animate={{ 
            scale: isDarkMode ? [1.1, 1.3, 1.1] : [1, 1.2, 1],
            x: isDarkMode ? [0, -80, 0] : [0, 80, 0],
            y: isDarkMode ? [0, 100, 0] : [0, -100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[140px] transition-colors duration-1000 ${isDarkMode ? 'bg-indigo-600/15' : 'bg-indigo-50/60'}`}
        />
        <div className={`absolute inset-0 opacity-[0.03] noise pointer-events-none ${isDarkMode ? 'mix-blend-overlay' : 'mix-blend-multiply'}`} />
      </div>

      <MotionDiv 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ 
            opacity: 1, 
            scale: 1,
            x: isShaking ? [-8, 8, -8, 8, 0] : 0
        }}
        transition={springConfig}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <MotionDiv 
            initial={{ opacity: 0, y: -20, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            className={`w-20 h-20 rounded-[28px] shadow-2xl flex items-center justify-center mb-8 relative group transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20' : 'bg-white border border-gray-100 shadow-slate-200'}`}
          >
            <ShieldCheck className={`w-10 h-10 relative z-10 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-blue-600'}`} />
          </MotionDiv>
          
          <MotionH1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.2 }}
            className={`text-4xl font-extrabold tracking-tighter transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            Gravity <span className="text-blue-600">Manager</span>
          </MotionH1>
          <MotionP 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-sm mt-3 font-medium uppercase tracking-[0.2em] transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Control de Acceso
          </MotionP>
        </div>

        {/* Login Card */}
        <MotionDiv 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
          className={`backdrop-blur-3xl rounded-[2.5rem] p-10 relative overflow-hidden transition-all duration-500 border ${isDarkMode ? 'bg-slate-900/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border-white/10' : 'bg-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-white'}`}
        >
          {/* Internal Glow Effect */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'bg-gradient-to-b from-white/[0.03] to-transparent opacity-100' : 'opacity-0'}`} />

          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <MotionForm 
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin} 
                className="space-y-7 relative z-10"
              >
                {error && (
                  <MotionDiv 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-bold border transition-colors duration-500 ${isDarkMode ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-100'}`}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </MotionDiv>
                )}

                <div className="space-y-2.5">
                  <label className={`text-[10px] font-black uppercase tracking-[0.25em] ml-1 transition-colors duration-500 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Identificador</label>
                  <div className="relative group">
                    <UserIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isDarkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                    <input 
                      type="text" 
                      autoComplete="username"
                      className={`w-full border-2 rounded-2xl pl-12 pr-4 py-4 transition-all font-medium outline-none ${isDarkMode ? 'bg-slate-950/40 border-transparent text-white placeholder-slate-600 focus:bg-slate-950/60 focus:border-blue-500/30' : 'bg-gray-100/50 border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5'}`}
                      placeholder="Nombre de usuario"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className={`text-[10px] font-black uppercase tracking-[0.25em] ml-1 transition-colors duration-500 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Clave de Acceso</label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isDarkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`w-full border-2 rounded-2xl pl-12 pr-12 py-4 transition-all font-medium outline-none ${isDarkMode ? 'bg-slate-950/40 border-transparent text-white placeholder-slate-600 focus:bg-slate-950/60 focus:border-blue-500/30' : 'bg-gray-100/50 border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5'}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <MotionButton 
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading}
                  className={`w-full relative group/btn rounded-2xl overflow-hidden font-black py-4 flex items-center justify-center gap-3 transition-all duration-500 ${isDarkMode ? 'bg-white text-slate-950' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'}`}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm">ENTRAR AL SISTEMA</span>
                      <ChevronRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </MotionButton>
              </MotionForm>
            ) : (
              <MotionForm 
                key="force-change-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleForceChange} 
                className="space-y-7 text-center relative z-10"
              >
                 <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center border transition-colors duration-500 ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <h2 className={`text-2xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Actualización</h2>
                    <p className={`text-sm leading-relaxed px-4 transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Por seguridad, define una nueva contraseña para continuar.</p>
                 </div>

                 {error && (
                    <div className={`p-4 rounded-2xl text-xs font-bold border ${isDarkMode ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-100'}`}>
                      {error}
                    </div>
                 )}

                 <div className="space-y-3">
                   <input 
                      type="password" 
                      className={`w-full border-2 rounded-2xl px-5 py-4 transition-all font-medium outline-none ${isDarkMode ? 'bg-slate-950/40 border-transparent text-white placeholder-slate-600 focus:bg-slate-950/60 focus:border-orange-500/30' : 'bg-gray-100/50 border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-100'}`}
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                   />
                   <input 
                      type="password" 
                      className={`w-full border-2 rounded-2xl px-5 py-4 transition-all font-medium outline-none ${isDarkMode ? 'bg-slate-950/40 border-transparent text-white placeholder-slate-600 focus:bg-slate-950/60 focus:border-orange-500/30' : 'bg-gray-100/50 border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-100'}`}
                      placeholder="Confirmar contraseña"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                   />
                 </div>

                 <MotionButton 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-600/10 hover:bg-orange-500 transition-all text-sm"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'ACTUALIZAR Y ACCEDER'}
                </MotionButton>
              </MotionForm>
            )}
          </AnimatePresence>
        </MotionDiv>

        {/* System Footer Metadata */}
        <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`mt-10 flex justify-center items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}
        >
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> 
             System Active
           </div>
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 
             AES-256 v2.6.0
           </div>
        </MotionDiv>

      </MotionDiv>
    </div>
  );
};
