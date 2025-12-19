
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientManager } from './components/ClientManager';
import { ProductManager } from './components/ProductManager';
import { Settings } from './components/Settings';
import { BudgetEditor } from './components/BudgetEditor';
import { PdfCustomizer } from './components/PdfCustomizer';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { ExpenseManager } from './components/ExpenseManager';
import { CalendarView } from './components/CalendarView';
import { CommandPalette } from './components/CommandPalette';
import { Budget, SystemType, User } from './types';
import { storageService } from './services/storage';
import { authService } from './services/auth';

// Fix: Type casting for motion components
const MotionDiv = motion.div as any;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentSystem, setCurrentSystem] = useState<SystemType>('agora');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [notification, setNotification] = useState<{show: boolean, type: 'system' | 'success' | 'error', text: string, subtext?: string} | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    const sessionUser = authService.getSession();
    if (sessionUser) setUser(sessionUser);
    const init = async () => {
        await storageService.checkAndSeedData();
        setIsInitializing(false);
    };
    init();
  }, []);

  useEffect(() => {
      if(!user) return;
      const unsub = storageService.subscribe(() => {
          const updatedUsers = storageService.getUsers();
          const me = updatedUsers.find(u => u.id === user.id);
          if (me) {
              if (me.themePreference !== user.themePreference || me.monthlyGoal !== user.monthlyGoal) {
                  setUser(me);
                  authService.setSession(me);
              }
          }
      });
      return unsub;
  }, [user]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsCmdOpen(prev => !prev); }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const playNotificationSound = (type: 'success' | 'error' | 'system' = 'system') => {
      try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();
          const now = ctx.currentTime;
          const gain = ctx.createGain();
          gain.connect(ctx.destination);
          if (type === 'error') {
              const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.1);
              gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
              osc.connect(gain); osc.start(now); osc.stop(now + 0.15);
          } else if (type === 'success') {
              const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now);
              gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.03, now + 0.02); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
              osc.connect(gain); osc.start(now); osc.stop(now + 0.4);
          } else {
              const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(750, now);
              gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.04, now + 0.005); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
              osc.connect(gain); osc.start(now); osc.stop(now + 0.1);
          }
      } catch(e) {}
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success', subtext?: string) => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      setNotification({ show: true, type, text, subtext });
      playNotificationSound(type);
      notificationTimeoutRef.current = window.setTimeout(() => { setNotification(prev => prev ? { ...prev, show: false } : null); }, 3000);
  };

  const handleSystemChange = (newSystem: SystemType) => {
      setCurrentSystem(newSystem);
      playNotificationSound('system');
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      setNotification({ show: true, type: 'system', text: 'Sistema Activo Actualizado', subtext: systemLabels[newSystem] });
      notificationTimeoutRef.current = window.setTimeout(() => { setNotification(prev => prev ? { ...prev, show: false } : null); }, 4000);
  };

  const navigate = (view: string) => { setCurrentView(view); if (view !== 'edit-budget') setEditingBudget(null); };
  const handleEditBudget = (budget: Budget) => { setEditingBudget(budget); setCurrentView('edit-budget'); };
  const handleNewBudget = () => { setEditingBudget(null); setCurrentView('edit-budget'); };
  const handleCloseEditor = () => { setCurrentView('dashboard'); setEditingBudget(null); };
  const handleLoginSuccess = (loggedInUser: User) => { setUser(loggedInUser); setCurrentView('dashboard'); };
  const handleLogout = () => { authService.logout(); setUser(null); };

  if (isInitializing) return <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white gap-4"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><div className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Gravity Loading...</div></div>;
  
  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  const systemLabels = { agora: 'Ágora Restauración/Retail', sage: 'Sage 50', sage200: 'Sage 200', sagedespachos: 'Sage Despachos' };

  return (
    <AnimatePresence mode="wait">
      <MotionDiv
        key="main-app"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      >
        <Layout 
          activeView={currentView} 
          onNavigate={navigate}
          currentSystem={currentSystem}
          onSystemChange={handleSystemChange}
          user={user}
          onLogout={handleLogout}
        >
          <AnimatePresence mode="wait">
            <MotionDiv
              key={currentView}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <Dashboard onEditBudget={handleEditBudget} onNewBudget={handleNewBudget} currentSystem={currentSystem} />}
              {currentView === 'clients' && <ClientManager />}
              {currentView === 'products' && <ProductManager />}
              {currentView === 'expenses' && <ExpenseManager />}
              {currentView === 'calendar' && <CalendarView />}
              {currentView === 'settings' && <Settings />}
              {currentView === 'pdf-customizer' && <PdfCustomizer />}
              {currentView === 'admin-panel' && authService.isAdmin(user) && <AdminPanel />}
              {(currentView === 'edit-budget' || currentView === 'budgets') && (
                <BudgetEditor initialBudget={editingBudget} onClose={handleCloseEditor} currentSystem={currentSystem} currentUser={user} onShowToast={showToast} />
              )}
            </MotionDiv>
          </AnimatePresence>
        </Layout>

        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onNavigate={navigate} onEditBudget={handleEditBudget} />

        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ease-in-out pointer-events-none ${notification?.show ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'}`}>
            {notification && (
              <div className={`flex items-center gap-4 px-6 py-4 rounded-full shadow-2xl backdrop-blur-xl border border-white/20 ${notification.type === 'system' ? 'bg-slate-900/90 text-white' : notification.type === 'error' ? 'bg-red-900/90 text-white' : 'bg-white/90 text-slate-900 border-slate-200'}`}>
                  <div className={`p-2 rounded-full ${notification.type === 'system' ? 'bg-white/10' : notification.type === 'error' ? 'bg-red-500/20' : 'bg-green-500/10'}`}>
                      {notification.type === 'system' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>}
                      {notification.type === 'success' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>}
                      {notification.type === 'error' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                  </div>
                  <div>
                      <h4 className="text-sm font-bold leading-none">{notification.text}</h4>
                      {notification.subtext && <p className="text-[11px] opacity-70 mt-1 font-medium tracking-wide uppercase">{notification.subtext}</p>}
                  </div>
              </div>
            )}
        </div>
      </MotionDiv>
    </AnimatePresence>
  );
}

export default App;
