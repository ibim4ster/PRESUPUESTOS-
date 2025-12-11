
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientManager } from './components/ClientManager';
import { ProductManager } from './components/ProductManager';
import { Settings } from './components/Settings';
import { BudgetEditor } from './components/BudgetEditor';
import { PdfCustomizer } from './components/PdfCustomizer';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { ExpenseManager } from './components/ExpenseManager'; // NEW
import { CalendarView } from './components/CalendarView'; // NEW
import { Budget, SystemType, User } from './types';
import { storageService } from './services/storage';
import { authService } from './services/auth';

// Minimalist Sound (Base64 MP3 - Subtle Ping)
const NOTIFICATION_SOUND = "data:audio/mpeg;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMmRVTRkthZGUuLy9yZXR1cm4gdm9pZDsv/+5BkAA/wAABAAAAgAAABAAAAiAAABAAAAgAAABMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//uQZAAAAAAABAAAAgAAABAAAAgAAABAAAAgAAABMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz/+5BkAAAAAAAIAAAACAAIAAAAAAAIAAAACAAIAMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//uQRAAA8AAAKAAAACAAIAP8AAAaAAAAKAAAAAgACADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMw==";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentSystem, setCurrentSystem] = useState<SystemType>('agora');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Notification State
  const [notification, setNotification] = useState<{show: boolean, type: 'system' | 'success' | 'error', text: string, subtext?: string} | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

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

  // --- SHOW NOTIFICATION HELPER ---
  const showToast = (text: string, type: 'success' | 'error' = 'success', subtext?: string) => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      setNotification({ show: true, type, text, subtext });
      notificationTimeoutRef.current = window.setTimeout(() => setNotification(null), 3000);
  };

  const handleSystemChange = (newSystem: SystemType) => {
      setCurrentSystem(newSystem);
      
      // Play Sound
      try {
          const audio = new Audio(NOTIFICATION_SOUND);
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio play blocked", e));
      } catch(e) {}

      // Show Premium Notification
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      setNotification({
          show: true,
          type: 'system',
          text: 'Sistema Activo Actualizado',
          subtext: systemLabels[newSystem]
      });
      notificationTimeoutRef.current = window.setTimeout(() => setNotification(null), 4000);
  };

  const navigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'edit-budget') setEditingBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setCurrentView('edit-budget');
  };

  const handleNewBudget = () => {
    setEditingBudget(null);
    setCurrentView('edit-budget');
  };

  const handleCloseEditor = () => {
    setCurrentView('dashboard');
    setEditingBudget(null);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (isInitializing) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando Gravity...</div>;
  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  const systemLabels = {
      agora: 'Ágora Restauración/Retail',
      sage: 'Sage 50',
      sage200: 'Sage 200',
      sagedespachos: 'Sage Despachos'
  };

  return (
    <>
      <Layout 
        activeView={currentView} 
        onNavigate={navigate}
        currentSystem={currentSystem}
        onSystemChange={handleSystemChange}
        user={user}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard' && (
          <Dashboard 
            onEditBudget={handleEditBudget} 
            onNewBudget={handleNewBudget} 
            currentSystem={currentSystem}
          />
        )}
        {currentView === 'clients' && <ClientManager />}
        {currentView === 'products' && <ProductManager />}
        {currentView === 'expenses' && <ExpenseManager />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'settings' && <Settings />}
        {currentView === 'pdf-customizer' && <PdfCustomizer />}
        {currentView === 'admin-panel' && authService.isAdmin(user) && <AdminPanel />}
        
        {(currentView === 'edit-budget' || currentView === 'budgets') && (
          <BudgetEditor 
            initialBudget={editingBudget} 
            onClose={handleCloseEditor}
            currentSystem={currentSystem}
            currentUser={user}
            onShowToast={showToast}
          />
        )}
      </Layout>

      {/* PREMIUM NOTIFICATION COMPONENT */}
      <div 
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${notification?.show ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}
      >
          {notification && (
            <div className={`
                flex items-center gap-4 px-6 py-4 rounded-full shadow-2xl backdrop-blur-xl border border-white/20
                ${notification.type === 'system' ? 'bg-slate-900/90 text-white' : 
                  notification.type === 'error' ? 'bg-red-900/90 text-white' : 'bg-white/90 text-slate-900 border-slate-200'}
            `}>
                <div className={`p-2 rounded-full ${notification.type === 'system' ? 'bg-white/10' : notification.type === 'error' ? 'bg-red-500/20' : 'bg-green-500/10'}`}>
                    {notification.type === 'system' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    )}
                    {notification.type === 'success' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {notification.type === 'error' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    )}
                </div>
                <div>
                    <h4 className="text-sm font-bold leading-none">{notification.text}</h4>
                    {notification.subtext && <p className="text-[11px] opacity-70 mt-1 font-medium tracking-wide uppercase">{notification.subtext}</p>}
                </div>
            </div>
          )}
      </div>
    </>
  );
}

export default App;
