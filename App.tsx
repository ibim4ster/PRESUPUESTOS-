
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientManager } from './components/ClientManager';
import { ProductManager } from './components/ProductManager';
import { Settings } from './components/Settings';
import { BudgetEditor } from './components/BudgetEditor';
import { PdfCustomizer } from './components/PdfCustomizer';
import { Budget } from './types';
import { storageService } from './services/storage';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    // Seed mock data if empty
    storageService.checkAndSeedData();
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

  return (
    <Layout activeView={currentView} onNavigate={navigate}>
      {currentView === 'dashboard' && (
        <Dashboard onEditBudget={handleEditBudget} onNewBudget={handleNewBudget} />
      )}
      
      {currentView === 'clients' && <ClientManager />}
      
      {currentView === 'products' && <ProductManager />}
      
      {currentView === 'settings' && <Settings />}

      {currentView === 'pdf-customizer' && <PdfCustomizer />}
      
      {/* If currentView is edit-budget OR budgets (defaults to new) */}
      {(currentView === 'edit-budget' || currentView === 'budgets') && (
        <BudgetEditor 
          initialBudget={editingBudget} 
          onClose={handleCloseEditor} 
        />
      )}
    </Layout>
  );
}

export default App;
