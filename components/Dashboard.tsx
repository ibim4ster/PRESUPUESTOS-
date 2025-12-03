
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
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

// Helper for Initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const Dashboard: React.FC<DashboardProps> = ({ onEditBudget, onNewBudget }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState({ totalMonth: 0, pending: 0, accepted: 0 });

  useEffect(() => {
    loadData();
    // Subscribe to cloud updates
    const unsubscribe = storageService.subscribe(() => {
        loadData();
    });
    return unsubscribe;
  }, []);

  const loadData = () => {
    const allBudgets = storageService.getBudgets();
    setBudgets([...allBudgets]); // Clone to force re-render

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
      storageService.deleteBudget(id);
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
  };

  const handleEditClick = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    e.preventDefault();
    onEditBudget(budget);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="text-sm text-slate-500 font-medium mb-1">
             {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Buenos días</h2>
           <p className="text-slate-500">Aquí tienes un resumen de tu actividad comercial.</p>
        </div>
        <button 
          onClick={onNewBudget}
          className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-3 font-bold text-sm transform hover:-translate-y-1"
        >
          <div className="bg-white/20 p-1 rounded-full"><PlusIcon /></div>
          CREAR PRESUPUESTO
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="flex justify-between items-start">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">ESTE MES</span>
          </div>
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Volumen Presupuestado</div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500"></div>
          <div className="flex justify-between items-start">
             <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
             </div>
          </div>
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Pendientes de Aprobación</div>
            <div className="text-3xl font-bold text-slate-900">{stats.pending} <span className="text-lg text-slate-400 font-normal">docs</span></div>
          </div>
        </div>

        {/* Card 3: Accepted */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-500"></div>
          <div className="flex justify-between items-start">
             <div className="p-3 bg-green-50 text-green-500 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
             </div>
          </div>
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Presupuestos Aceptados</div>
            <div className="text-3xl font-bold text-slate-900">{stats.accepted} <span className="text-lg text-slate-400 font-normal">docs</span></div>
          </div>
        </div>
      </div>

      {/* Recent Budgets List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Actividad Reciente</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-8 py-4 w-32">Nº Doc</th>
                <th className="px-8 py-4">Cliente</th>
                <th className="px-8 py-4">Fecha</th>
                <th className="px-8 py-4 text-right">Importe</th>
                <th className="px-8 py-4 text-center">Estado</th>
                <th className="px-8 py-4 text-right">Acciones</th>
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
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={(e) => handleEditClick(e, budget)}
                  >
                    <td className="px-8 py-4">
                        <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{budget.number}</span>
                    </td>
                    <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(budget.clientData.commercialName || 'Unknown')}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">{budget.clientData.commercialName}</div>
                                <div className="text-xs text-slate-400">{budget.clientData.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-4 text-slate-500 text-xs font-medium uppercase">
                        {new Date(budget.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-4 text-slate-800 font-bold text-right font-mono">
                        {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${budget.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          budget.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          budget.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'}`}>
                        {budget.status === 'draft' ? 'Borrador' :
                         budget.status === 'pending' ? 'Pendiente' :
                         budget.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={(e) => handleDuplicate(e, budget)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Duplicar"
                        >
                          <CopyIcon />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleEditClick(e, budget)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDelete(e, budget.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-400 flex flex-col items-center gap-3">
                    <div className="bg-slate-50 p-4 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    </div>
                    <span className="font-medium">No hay presupuestos creados aún.</span>
                    <button onClick={onNewBudget} className="text-accent text-sm font-bold hover:underline">Crear el primero ahora</button>
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
