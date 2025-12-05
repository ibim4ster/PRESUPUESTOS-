

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientManager } from './components/ClientManager';
import { ProductManager } from './components/ProductManager';
import { Settings } from './components/Settings';
import { BudgetEditor } from './components/BudgetEditor';
import { ReportEditor } from './components/ReportEditor';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { Budget, SystemType, User } from './types';
import { storageService } from './services/storage';
import { authService } from './services/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentSystem, setCurrentSystem] = useState<SystemType>('agora');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. Check Session
    const sessionUser = authService.getSession();
    if (sessionUser) {
        setUser(sessionUser);
    }
    
    // 2. Initialize Data (Async: seed admin if needed)
    const init = async () => {
        await storageService.checkAndSeedData();
        setIsInitializing(false);
    };
    init();
  }, []);

  const navigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'edit-budget') {
      setEditingBudget(null);
    }
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

  if (isInitializing) {
      return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando Gravity...</div>;
  }

  // --- AUTH GUARD ---
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout 
      activeView={currentView} 
      onNavigate={navigate}
      currentSystem={currentSystem}
      onSystemChange={setCurrentSystem}
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
      
      {currentView === 'settings' && <Settings />}

      {currentView === 'report-editor' && authService.isAdmin(user) && <ReportEditor />}

      {currentView === 'admin-panel' && authService.isAdmin(user) && <AdminPanel />}
      
      {/* If currentView is edit-budget OR budgets (defaults to new) */}
      {(currentView === 'edit-budget' || currentView === 'budgets') && (
        <BudgetEditor 
          initialBudget={editingBudget} 
          onClose={handleCloseEditor}
          currentSystem={currentSystem}
          currentUser={user}
        />
      )}
    </Layout>
  );
}

export default App;