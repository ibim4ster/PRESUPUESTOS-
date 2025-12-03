
import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { Budget } from '../types';

interface DashboardProps {
  onEditBudget: (budget: Budget) => void;
  onNewBudget: () => void;
}

// Icons
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

export const Dashboard: React.FC<DashboardProps> = ({ onEditBudget, onNewBudget }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState({ totalMonth: 0, pending: 0, accepted: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allBudgets = storageService.getBudgets();
    setBudgets(allBudgets);

    const now = new Date();
    const currentMonth = now.getMonth();
    
    const monthlyTotal = allBudgets
      .filter(b => new Date(b.createdAt).getMonth() === currentMonth)
      .reduce((acc, b) => {
        // Filter out sections for calc
        const productItems = b.lineItems.filter(i => i.type !== 'section');
        const subtotal = productItems.reduce((s, i) => s + (i.units * i.price), 0);
        return acc + subtotal;
      }, 0);

    setStats({
      totalMonth: monthlyTotal,
      pending: allBudgets.filter(b => b.status === 'pending').length,
      accepted: allBudgets.filter(b => b.status === 'accepted').length,
    });
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if(window.confirm('¿Está seguro de eliminar este presupuesto definitivamente?')) {
      // 1. Update UI immediately for feedback
      setBudgets(prev => prev.filter(b => b.id !== id));
      
      // 2. Perform actual deletion
      storageService.deleteBudget(id);
      
      // 3. Recalculate stats
      setTimeout(loadData, 100);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    e.preventDefault();
    
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      number: storageService.getNextBudgetNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      clientSignature: undefined,
    };
    storageService.saveBudget(newBudget);
    loadData();
  };

  const handleEditClick = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    e.preventDefault();
    onEditBudget(budget);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel Principal</h2>
          <p className="text-slate-500 text-sm">Resumen de actividad comercial</p>
        </div>
        <button 
          onClick={onNewBudget}
          className="w-full md:w-auto bg-accent hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 font-medium"
        >
          <PlusIcon /> Nuevo Presupuesto
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-28 md:h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="60" height="60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V9h-1.5v9.09J12 18.5l-.91-.36V9h-1.5v9.09L9 18.5V11H7.5v7.5h.71l5.2-2.08V11h-1.5v7.09z"/></svg>
          </div>
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Presupuestado (Mes)</div>
          <div className="text-3xl font-bold text-slate-800">{stats.totalMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-28 md:h-32">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Pendientes</div>
          <div className="text-3xl font-bold text-orange-500">{stats.pending}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-28 md:h-32">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Aceptados</div>
          <div className="text-3xl font-bold text-green-500">{stats.accepted}</div>
        </div>
      </div>

      {/* Recent Budgets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-bold text-slate-800 flex items-center gap-2">
          <span>Últimos Presupuestos</span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Nº</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(budget => {
                const total = budget.lineItems
                  .filter(i => i.type !== 'section')
                  .reduce((s, i) => s + (i.units * i.price), 0);
                  
                return (
                  <tr 
                    key={budget.id} 
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onClick={(e) => handleEditClick(e, budget)}
                  >
                    <td className="px-6 py-4 text-slate-600">{new Date(budget.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{budget.number}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{budget.clientData.commercialName}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border 
                        ${budget.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                          budget.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                          budget.status === 'draft' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {budget.status === 'draft' ? 'BORRADOR' :
                         budget.status === 'pending' ? 'PENDIENTE' :
                         budget.status === 'accepted' ? 'ACEPTADO' : 'RECHAZADO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          type="button"
                          onClick={(e) => handleDuplicate(e, budget)}
                          className="p-2 text-slate-400 hover:text-accent hover:bg-blue-50 rounded transition-colors"
                          title="Duplicar"
                        >
                          <CopyIcon />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleEditClick(e, budget)}
                          className="p-2 text-slate-400 hover:text-accent hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDelete(e, budget.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <span className="text-2xl">📭</span>
                    <span>No hay presupuestos creados aún.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
