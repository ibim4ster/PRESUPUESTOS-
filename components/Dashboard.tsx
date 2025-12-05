
import React, { useEffect, useState, useMemo } from 'react';
import { storageService } from '../services/storage';
import { Budget, SystemType } from '../types';

interface DashboardProps {
  onEditBudget: (budget: Budget) => void;
  onNewBudget: () => void;
  currentSystem: SystemType;
}

// Icons
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>;

// Helper for Initials
const getInitials = (name: string) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const calculateTotal = (budget: Budget) => {
    return budget.lineItems
      .filter(i => i.type !== 'section')
      .reduce((s, i) => s + (i.units * i.price), 0);
};

export const Dashboard: React.FC<DashboardProps> = ({ onEditBudget, onNewBudget, currentSystem }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState({ totalMonth: 0, pending: 0, accepted: 0 });
  
  // Advanced Filter & Sort State
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  
  const [filters, setFilters] = useState({
      global: '',
      number: '',
      client: '',
      dateStart: '',
      dateEnd: '',
      minAmount: '',
      maxAmount: '',
      status: 'all',
      commercial: ''
  });

  const isSage = currentSystem === 'sage';
  const buttonColor = isSage ? 'bg-black hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700';

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
        loadData();
    });
    return unsubscribe;
  }, [currentSystem]); 

  const loadData = () => {
    const allBudgets = storageService.getBudgets().filter(b => (b.system || 'agora') === currentSystem);
    setBudgets([...allBudgets]); 

    const now = new Date();
    const currentMonth = now.getMonth();
    
    const monthlyTotal = allBudgets
      .filter(b => new Date(b.createdAt).getMonth() === currentMonth)
      .reduce((acc, b) => acc + calculateTotal(b), 0);

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
      number: storageService.getNextBudgetNumber(currentSystem),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      clientSignature: undefined,
      system: currentSystem,
    };
    storageService.saveBudget(newBudget);
  };

  const handleEditClick = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    e.preventDefault();
    onEditBudget(budget);
  };

  // --- SORTING LOGIC ---
  const handleSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  // --- FILTERING & PROCESSING LOGIC ---
  const processedBudgets = useMemo(() => {
      let result = [...budgets];

      // 1. Filter
      result = result.filter(b => {
          // Global Search
          if (filters.global) {
             const term = filters.global.toLowerCase();
             const matchesGlobal = 
                b.number.toLowerCase().includes(term) ||
                b.clientData.commercialName.toLowerCase().includes(term) ||
                b.clientData.cif.toLowerCase().includes(term);
             if (!matchesGlobal) return false;
          }

          // Column Filters
          if (filters.number && !b.number.toLowerCase().includes(filters.number.toLowerCase())) return false;
          if (filters.client && !b.clientData.commercialName.toLowerCase().includes(filters.client.toLowerCase())) return false;
          if (filters.commercial && !(b.creatorName || '').toLowerCase().includes(filters.commercial.toLowerCase())) return false;
          if (filters.status !== 'all' && b.status !== filters.status) return false;

          // Date Range
          const bDate = new Date(b.createdAt).getTime();
          if (filters.dateStart && bDate < new Date(filters.dateStart).getTime()) return false;
          // End date set to end of day
          if (filters.dateEnd) {
              const endDate = new Date(filters.dateEnd);
              endDate.setHours(23, 59, 59, 999);
              if (bDate > endDate.getTime()) return false;
          }

          // Amount Range
          const total = calculateTotal(b);
          if (filters.minAmount && total < parseFloat(filters.minAmount)) return false;
          if (filters.maxAmount && total > parseFloat(filters.maxAmount)) return false;

          return true;
      });

      // 2. Sort
      if (sortConfig) {
          result.sort((a, b) => {
              let valA: any = '';
              let valB: any = '';

              switch (sortConfig.key) {
                  case 'number': valA = a.number; valB = b.number; break;
                  case 'client': valA = a.clientData.commercialName; valB = b.clientData.commercialName; break;
                  case 'date': valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); break;
                  case 'amount': valA = calculateTotal(a); valB = calculateTotal(b); break;
                  case 'status': valA = a.status; valB = b.status; break;
                  case 'commercial': valA = a.creatorName || ''; valB = b.creatorName || ''; break;
              }

              if (typeof valA === 'string') {
                  valA = valA.toLowerCase();
                  valB = valB.toLowerCase();
              }

              if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      } else {
          // Default Sort: Newest First
          result.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return result;
  }, [budgets, filters, sortConfig]);


  // Helper for Sort Header
  const SortableHeader = ({ label, sortKey, width }: { label: string, sortKey: string, width?: string }) => (
      <th 
        className={`px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none ${width || ''}`}
        onClick={() => handleSort(sortKey)}
      >
          <div className="flex items-center gap-2">
              {label}
              <span className="text-slate-400">
                  {sortConfig?.key === sortKey ? (
                      sortConfig.direction === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
                  ) : <SortIcon />}
              </span>
          </div>
      </th>
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="text-sm text-slate-500 font-medium mb-1">
             {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Buenos días</h2>
           <p className="text-slate-500">
             Resumen de actividad en <strong className="uppercase">{currentSystem}</strong>.
           </p>
        </div>
        <button 
          onClick={onNewBudget}
          className={`w-full md:w-auto ${buttonColor} text-white px-6 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 font-bold text-sm transform hover:-translate-y-1`}
        >
          <div className="bg-white/20 p-1 rounded-full"><PlusIcon /></div>
          CREAR PRESUPUESTO
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-full h-1 ${isSage ? 'bg-[#00d061]' : 'bg-blue-600'}`}></div>
          <div className="flex justify-between items-start">
             <div className={`p-3 rounded-xl ${isSage ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${isSage ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-700'}`}>ESTE MES</span>
          </div>
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Volumen Presupuestado</div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
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
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
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
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              Actividad Reciente
              <span className="bg-gray-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{processedBudgets.length}</span>
          </h3>

          <div className="flex gap-2 w-full md:w-auto items-center">
              <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Búsqueda rápida..." 
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow"
                    value={filters.global}
                    onChange={(e) => setFilters({...filters, global: e.target.value})}
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                    <SearchIcon />
                </div>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-gray-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}
                title="Filtros Avanzados por Columna"
              >
                  <FilterIcon /> 
                  <span className="hidden sm:inline">Filtros</span>
              </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <SortableHeader label="Nº Doc" sortKey="number" width="w-32" />
                <SortableHeader label="Cliente" sortKey="client" />
                <SortableHeader label="Fecha" sortKey="date" />
                <SortableHeader label="Importe" sortKey="amount" />
                <SortableHeader label="Estado" sortKey="status" />
                <SortableHeader label="Comercial" sortKey="commercial" />
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
              {/* ADVANCED FILTER ROW */}
              {showFilters && (
                  <tr className="bg-slate-100/50 border-b border-gray-200 animate-in fade-in duration-200">
                      <td className="px-6 py-2">
                          <input 
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none focus:border-slate-500"
                            placeholder="Buscar Nº..."
                            value={filters.number}
                            onChange={e => setFilters({...filters, number: e.target.value})}
                          />
                      </td>
                      <td className="px-6 py-2">
                          <input 
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none focus:border-slate-500"
                            placeholder="Buscar Cliente..."
                            value={filters.client}
                            onChange={e => setFilters({...filters, client: e.target.value})}
                          />
                      </td>
                      <td className="px-6 py-2">
                          <div className="flex flex-col gap-1">
                              <input 
                                type="date" 
                                className="w-full text-[10px] p-1 border border-gray-300 rounded bg-white outline-none"
                                value={filters.dateStart}
                                onChange={e => setFilters({...filters, dateStart: e.target.value})}
                              />
                              <input 
                                type="date" 
                                className="w-full text-[10px] p-1 border border-gray-300 rounded bg-white outline-none"
                                value={filters.dateEnd}
                                onChange={e => setFilters({...filters, dateEnd: e.target.value})}
                              />
                          </div>
                      </td>
                      <td className="px-6 py-2">
                          <div className="flex gap-1">
                              <input 
                                type="number" 
                                className="w-20 text-xs p-1.5 border border-gray-300 rounded bg-white outline-none"
                                placeholder="Min €"
                                value={filters.minAmount}
                                onChange={e => setFilters({...filters, minAmount: e.target.value})}
                              />
                              <input 
                                type="number" 
                                className="w-20 text-xs p-1.5 border border-gray-300 rounded bg-white outline-none"
                                placeholder="Max €"
                                value={filters.maxAmount}
                                onChange={e => setFilters({...filters, maxAmount: e.target.value})}
                              />
                          </div>
                      </td>
                      <td className="px-6 py-2">
                          <select 
                             className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none cursor-pointer"
                             value={filters.status}
                             onChange={e => setFilters({...filters, status: e.target.value})}
                          >
                              <option value="all">Todos</option>
                              <option value="draft">Borrador</option>
                              <option value="pending">Pendiente</option>
                              <option value="accepted">Aceptado</option>
                              <option value="rejected">Rechazado</option>
                          </select>
                      </td>
                      <td className="px-6 py-2">
                          <input 
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white outline-none focus:border-slate-500"
                            placeholder="Comercial..."
                            value={filters.commercial}
                            onChange={e => setFilters({...filters, commercial: e.target.value})}
                          />
                      </td>
                      <td className="px-6 py-2 text-right">
                          <button 
                            onClick={() => setFilters({ global: '', number: '', client: '', dateStart: '', dateEnd: '', minAmount: '', maxAmount: '', status: 'all', commercial: '' })}
                            className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                          >
                              Limpiar
                          </button>
                      </td>
                  </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedBudgets.map(budget => {
                const total = calculateTotal(budget);
                  
                return (
                  <tr 
                    key={budget.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={(e) => handleEditClick(e, budget)}
                  >
                    <td className="px-6 py-4">
                        <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{budget.number}</span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${isSage ? 'bg-black' : 'bg-red-600'} flex items-center justify-center text-white text-xs font-bold`}>
                                {getInitials(budget.clientData.commercialName || 'Unknown')}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">{budget.clientData.commercialName}</div>
                                <div className="text-xs text-slate-400">{budget.clientData.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium uppercase">
                        {new Date(budget.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-bold font-mono">
                        {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 text-center">
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
                    <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {getInitials(budget.creatorName || 'Sistema')}
                            </div>
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{budget.creatorName || 'Sistema'}</span>
                         </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Action buttons always visible now */}
                      <div className="flex items-center justify-end gap-1 opacity-100">
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
              {processedBudgets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-400 flex flex-col items-center gap-3">
                    <div className="bg-slate-50 p-4 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    </div>
                    <span className="font-medium">No se encontraron presupuestos con estos criterios.</span>
                    {(filters.global !== '' || showFilters) ? (
                         <button onClick={() => setFilters({ global: '', number: '', client: '', dateStart: '', dateEnd: '', minAmount: '', maxAmount: '', status: 'all', commercial: '' })} className="text-accent text-sm font-bold hover:underline">Limpiar Filtros</button>
                    ) : (
                        <button onClick={onNewBudget} className="text-accent text-sm font-bold hover:underline">Crear el primero ahora</button>
                    )}
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
