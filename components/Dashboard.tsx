
import React, { useEffect, useState, useMemo } from 'react';
import { storageService } from '../services/storage';
import { Budget, SystemType, Task, User, LogEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { authService } from '../services/auth';

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
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>;
const LayoutListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/></svg>;
const LayoutKanbanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>;

// Helper for Initials
const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const calculateTotal = (budget: Budget) => {
    return budget.lineItems
      .filter(i => i.type !== 'section')
      .reduce((s, i) => {
          const discount = i.discount || 0;
          const priceAfterDiscount = i.price * (1 - discount / 100);
          return s + (i.units * priceAfterDiscount);
      }, 0);
};

export const Dashboard: React.FC<DashboardProps> = ({ onEditBudget, onNewBudget, currentSystem }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ totalMonth: 0, pending: 0, accepted: 0, recurring: 0, goal: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  
  // Analytics State
  const [topProducts, setTopProducts] = useState<{name: string, count: number, revenue: number}[]>([]);
  const [topClients, setTopClients] = useState<{name: string, revenue: number, count: number}[]>([]);

  // Right panel tab state
  const [rightPanelTab, setRightPanelTab] = useState<'tasks' | 'activity'>('tasks');

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState({
      global: '', number: '', client: '', dateStart: '', dateEnd: '', minAmount: '', maxAmount: '', status: 'all', commercial: ''
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const isSage = currentSystem === 'sage';
  const buttonColor = isSage ? 'bg-black hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700';
  const chartColor = isSage ? '#00d061' : '#dc2626';
  const currentUser = authService.getSession();

  useEffect(() => {
    loadData();
    return storageService.subscribe(loadData);
  }, [currentSystem, currentUser?.id]); 

  const loadData = () => {
    const allBudgets = storageService.getBudgets().filter(b => (b.system || 'agora') === currentSystem);
    const products = storageService.getProducts();
    setBudgets([...allBudgets]); 
    setLogs(storageService.getLogs().slice(0, 10)); 
    
    const latestUser = authService.getSession();
    if (latestUser) {
        const myTasks = storageService.getTasks().filter(t => !t.completed && t.assignedTo === latestUser.id);
        setTasks(myTasks);
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const monthlyTotal = allBudgets
      .filter(b => new Date(b.createdAt).getMonth() === currentMonth)
      .reduce((acc, b) => acc + calculateTotal(b), 0);

    const recurringTotal = allBudgets
      .filter(b => b.status === 'accepted')
      .reduce((acc, b) => {
          const recLines = b.lineItems.filter(l => l.isRecurring);
          const recAmount = recLines.reduce((s, i) => s + (i.price * i.units), 0);
          return acc + recAmount;
      }, 0);

    setStats({
      totalMonth: monthlyTotal,
      pending: allBudgets.filter(b => b.status === 'pending').length,
      accepted: allBudgets.filter(b => b.status === 'accepted').length,
      recurring: recurringTotal,
      goal: latestUser?.monthlyGoal || 0
    });

    // Chart Data
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = d.toLocaleString('es-ES', { month: 'short' });
        const total = allBudgets.filter(b => {
            const bDate = new Date(b.createdAt);
            return bDate.getMonth() === d.getMonth() && bDate.getFullYear() === d.getFullYear();
        }).reduce((acc, b) => acc + calculateTotal(b), 0);
        months.push({ name: monthKey, total: total });
    }
    setChartData(months);

    const catMap: Record<string, number> = {};
    const acceptedBudgets = allBudgets.filter(b => b.status === 'accepted');
    
    acceptedBudgets.forEach(b => {
        b.lineItems.forEach(item => {
            if(item.type === 'product' && item.productId) {
                const prod = products.find(p => p.id === item.productId);
                const category = prod?.category || 'Otros';
                const amount = item.units * item.price * (1 - (item.discount||0)/100);
                catMap[category] = (catMap[category] || 0) + amount;
            }
        });
    });
    
    const catData = Object.entries(catMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);
    
    setCategoryData(catData);

    // Advanced Analytics
    const prodMap: Record<string, {name: string, count: number, revenue: number}> = {};
    acceptedBudgets.forEach(b => {
        b.lineItems.forEach(item => {
            if(item.type === 'product') {
                const key = item.reference || item.description;
                if(!prodMap[key]) prodMap[key] = { name: key, count: 0, revenue: 0 };
                prodMap[key].count += item.units;
                prodMap[key].revenue += (item.units * item.price * (1 - (item.discount||0)/100));
            }
        });
    });
    const sortedProds = Object.values(prodMap).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
    setTopProducts(sortedProds);

    const clientMap: Record<string, {name: string, revenue: number, count: number}> = {};
    acceptedBudgets.forEach(b => {
        const key = b.clientId;
        if(!clientMap[key]) clientMap[key] = { name: b.clientData.commercialName, revenue: 0, count: 0 };
        clientMap[key].revenue += calculateTotal(b);
        clientMap[key].count += 1;
    });
    const sortedClients = Object.values(clientMap).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
    setTopClients(sortedClients);
  }

  const monthlyGoal = currentUser?.monthlyGoal || 0;
  const progressPercent = monthlyGoal > 0 ? Math.min(100, (stats.totalMonth / monthlyGoal) * 100) : 0;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newTaskTitle.trim() || !currentUser) return;
      const t: Task = { id: crypto.randomUUID(), title: newTaskTitle, dueDate: new Date().toISOString(), completed: false, priority: 'normal', assignedTo: currentUser.id };
      storageService.saveTask(t);
      setNewTaskTitle('');
  };

  const toggleTask = (task: Task) => {
      storageService.saveTask({ ...task, completed: !task.completed });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('¿Está seguro de eliminar este presupuesto definitivamente?')) {
      storageService.deleteBudget(id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    const newBudget: Budget = {
      ...budget, id: crypto.randomUUID(), number: storageService.getNextBudgetNumber(currentSystem),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'draft', clientSignature: undefined, system: currentSystem,
      events: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), authorName: 'Sistema', text: `Duplicado de ${budget.number}`, type: 'creation' }]
    };
    storageService.saveBudget(newBudget);
  };

  const handleEditClick = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    onEditBudget(budget);
  };

  const handleExportCSV = () => {
      const headers = ["Numero", "Fecha", "Cliente", "Total", "Estado", "Sistema", "Comercial"];
      const rows = processedBudgets.map(b => [b.number, new Date(b.createdAt).toLocaleDateString(), `"${b.clientData.commercialName}"`, calculateTotal(b).toFixed(2), b.status, b.system, b.creatorName || ''].join(","));
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `presupuestos_${currentSystem}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
      setSortConfig({ key, direction });
  };

  const clearFilters = () => {
      setFilters({ global: '', number: '', client: '', dateStart: '', dateEnd: '', minAmount: '', maxAmount: '', status: 'all', commercial: '' });
  };

  const processedBudgets = useMemo(() => {
      let result = [...budgets];
      result = result.filter(b => {
          if (filters.global) {
             const searchStr = filters.global.toLowerCase();
             const matchesGlobal = b.number.toLowerCase().includes(searchStr) || b.clientData.commercialName.toLowerCase().includes(searchStr) || (b.creatorName || '').toLowerCase().includes(searchStr) || calculateTotal(b).toString().includes(searchStr);
             if(!matchesGlobal) return false;
          }
          if (filters.number && !b.number.toLowerCase().includes(filters.number.toLowerCase())) return false;
          if (filters.client && !b.clientData.commercialName.toLowerCase().includes(filters.client.toLowerCase())) return false;
          if (filters.status !== 'all' && b.status !== filters.status) return false;
          if (filters.commercial && !(b.creatorName || '').toLowerCase().includes(filters.commercial.toLowerCase())) return false;
          if (filters.dateStart) { const d = new Date(b.createdAt); const start = new Date(filters.dateStart); start.setHours(0,0,0,0); if (d < start) return false; }
          if (filters.dateEnd) { const d = new Date(b.createdAt); const end = new Date(filters.dateEnd); end.setHours(23,59,59,999); if (d > end) return false; }
          const total = calculateTotal(b);
          if (filters.minAmount && total < parseFloat(filters.minAmount)) return false;
          if (filters.maxAmount && total > parseFloat(filters.maxAmount)) return false;
          return true;
      });
      if (sortConfig) {
          result.sort((a, b) => {
              let valA: any = a[sortConfig.key as keyof Budget] || '';
              let valB: any = b[sortConfig.key as keyof Budget] || '';
              if (sortConfig.key === 'amount') { valA = calculateTotal(a); valB = calculateTotal(b); }
              if (sortConfig.key === 'client') { valA = a.clientData.commercialName; valB = b.clientData.commercialName; }
              if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      } else { result.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
      return result;
  }, [budgets, filters, sortConfig, viewMode]);

  const SortableHeader = ({ label, sortKey, width }: { label: string, sortKey: string, width?: string }) => (
      <th className={`px-6 py-4 cursor-pointer hover:bg-slate-400/10 ${width}`} onClick={() => handleSort(sortKey)}>
          <div className="flex items-center gap-2">{label} <span className="theme-text-muted"><SortIcon /></span></div>
      </th>
  );

  const KanbanColumn = ({ status, title, colorClass, items }: { status: string, title: string, colorClass: string, items: Budget[] }) => (
      <div className="flex flex-col h-full bg-slate-400/5 rounded-xl border theme-border min-w-[300px] w-full md:w-1/4">
          <div className={`p-3 border-b theme-border rounded-t-xl ${colorClass} bg-opacity-10`}>
              <div className="flex justify-between items-center mb-1"><h4 className="font-bold text-sm uppercase">{title}</h4><span className="text-xs font-bold theme-bg-card px-2 py-0.5 rounded shadow-sm">{items.length}</span></div>
              <div className="text-xs font-mono font-bold opacity-70">{items.reduce((acc, b) => acc + calculateTotal(b), 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar">
              {items.map(b => (
                  <div key={b.id} onClick={(e) => handleEditClick(e, b)} className="theme-card p-4 rounded-lg shadow-sm border theme-border hover:shadow-md cursor-pointer group relative">
                      <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-mono theme-bg-main px-1.5 py-0.5 rounded theme-text-main">{b.number}</span><span className="text-[10px] theme-text-muted">{new Date(b.createdAt).toLocaleDateString()}</span></div>
                      <div className="font-bold theme-text-main text-sm mb-1 truncate">{b.clientData.commercialName}</div>
                      <div className="flex justify-between items-center pt-2 border-t theme-border">
                          <span className="font-bold theme-text-main font-mono text-sm">{calculateTotal(b).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                          {b.creatorName && (
                              <div className="flex items-center gap-1" title={b.creatorName}>
                                  <div className="w-5 h-5 rounded-full theme-bg-main flex items-center justify-center text-[8px] font-bold theme-text-muted">
                                      {getInitials(b.creatorName)}
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="space-y-8 pb-20 theme-text-main">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Buenos días, {currentUser?.name}</h2>
           <p className="theme-text-muted">Resumen de actividad en <strong className="uppercase">{currentSystem}</strong>.</p>
        </div>
        <button onClick={onNewBudget} className={`w-full md:w-auto ${buttonColor} text-white px-6 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 font-bold text-sm transform hover:-translate-y-1`}>
          <div className="bg-white/20 p-1 rounded-full"><PlusIcon /></div> CREAR PRESUPUESTO
        </button>
      </header>

      {/* GAMIFICATION & STATS */}
      {monthlyGoal > 0 && (
          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
              <div className="flex items-center gap-4 z-10">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><TrophyIcon /></div>
                  <div>
                      <h3 className="font-bold text-lg">Objetivo Mensual</h3>
                      <p className="text-white/60 text-xs">Mantén el ritmo para alcanzar tu meta.</p>
                  </div>
              </div>
              <div className="flex-1 w-full z-10">
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide"><span>Progreso Actual</span><span>{progressPercent.toFixed(0)}%</span></div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-green-400 transition-all duration-1000 ease-out rounded-full" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-white/50 font-mono"><span>{stats.totalMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span><span>Meta: {monthlyGoal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></div>
              </div>
          </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="theme-card p-6 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${isSage ? 'bg-[#00d061]' : 'bg-blue-600'}`}></div>
                  <div className="theme-text-muted text-sm font-medium mb-1">Volumen Mes</div>
                  <div className="text-3xl font-bold">{stats.totalMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                </div>
                <div className="theme-card p-6 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                  <div className="theme-text-muted text-sm font-medium mb-1">ARR (Recurrente)</div>
                  <div className="text-3xl font-bold text-purple-600">{stats.recurring.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                  <span className="text-xs theme-text-muted">Anual Estimado</span>
                </div>
                <div className="theme-card p-6 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                  <div className="theme-text-muted text-sm font-medium mb-1">Pendientes</div>
                  <div className="text-3xl font-bold">{stats.pending} <span className="text-lg theme-text-muted font-normal">docs</span></div>
                </div>
              </div>

              <div className="theme-card p-5 rounded-2xl shadow-sm flex flex-col h-[350px]">
                <h3 className="text-sm font-bold theme-text-muted uppercase mb-4">Evolución de Ventas</h3>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                            <XAxis dataKey="name" tick={{fontSize: 12, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                            <Tooltip cursor={{fill: 'var(--hover-bg)'}} contentStyle={{borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="total" fill={chartColor} radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border">
                      <h3 className="text-sm font-bold theme-text-main uppercase mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>Top Productos
                      </h3>
                      <div className="space-y-3">
                          {topProducts.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm border-b theme-border pb-2 last:border-0">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <span className="font-mono text-xs theme-text-muted font-bold w-4">{idx + 1}</span>
                                      <div className="truncate font-medium theme-text-main" title={p.name}>{p.name}</div>
                                  </div>
                                  <div className="text-right pl-2">
                                      <div className="font-bold">{p.revenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</div>
                                      <div className="text-[10px] theme-text-muted">{p.count} uds</div>
                                  </div>
                              </div>
                          ))}
                          {topProducts.length === 0 && <div className="text-xs theme-text-muted italic">Sin datos suficientes</div>}
                      </div>
                  </div>
                  <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border">
                      <h3 className="text-sm font-bold theme-text-main uppercase mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>Mejores Clientes
                      </h3>
                      <div className="space-y-3">
                          {topClients.map((c, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm border-b theme-border pb-2 last:border-0">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <span className="font-mono text-xs theme-text-muted font-bold w-4">{idx + 1}</span>
                                      <div className="truncate font-medium theme-text-main" title={c.name}>{c.name}</div>
                                  </div>
                                  <div className="text-right pl-2">
                                      <div className="font-bold">{c.revenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</div>
                                      <div className="text-[10px] theme-text-muted">{c.count} pedidos</div>
                                  </div>
                              </div>
                          ))}
                          {topClients.length === 0 && <div className="text-xs theme-text-muted italic">Sin datos suficientes</div>}
                      </div>
                  </div>
              </div>
          </div>

          <div className="xl:col-span-1 h-full space-y-6">
              <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border h-[300px] flex flex-col">
                  <h3 className="text-sm font-bold theme-text-main uppercase mb-2">Ventas por Categoría</h3>
                  <div className="flex-1 min-h-0">
                      {categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                      {categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                  </Pie>
                                  <Tooltip contentStyle={{borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)'}} formatter={(val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} />
                                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                              </PieChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center theme-text-muted text-xs italic">Sin datos de ventas aceptadas.</div>
                      )}
                  </div>
              </div>

              <div className="theme-card rounded-2xl shadow-sm border theme-border flex flex-col overflow-hidden h-[454px] xl:h-auto xl:flex-1 sticky top-4">
                  <div className="flex border-b theme-border theme-bg-table-header p-1 gap-1">
                      <button onClick={() => setRightPanelTab('tasks')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${rightPanelTab === 'tasks' ? 'theme-bg-card theme-text-main shadow-sm' : 'theme-text-muted hover:theme-text-main'}`}>Mis Tareas ({tasks.length})</button>
                      <button onClick={() => setRightPanelTab('activity')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${rightPanelTab === 'activity' ? 'theme-bg-card theme-text-main shadow-sm' : 'theme-text-muted hover:theme-text-main'}`}>Actividad</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[200px]">
                      {rightPanelTab === 'tasks' ? (
                          <div className="space-y-2">
                              {tasks.map(task => (
                                  <div key={task.id} className="flex items-start gap-3 p-3 theme-bg-card border theme-border rounded-xl hover:shadow-md transition-shadow group">
                                      <button onClick={() => toggleTask(task)} className="mt-1 w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center hover:border-green-500 hover:bg-green-500/10 text-transparent hover:text-green-600 transition-all flex-shrink-0"><CheckIcon /></button>
                                      <div className="flex-1">
                                          <p className={`text-sm theme-text-main font-medium ${task.completed ? 'line-through opacity-40' : ''}`}>{task.title}</p>
                                          {task.relatedBudgetNumber && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded mt-1 inline-block">{task.relatedBudgetNumber}</span>}
                                          <div className="text-[10px] theme-text-muted mt-1">{new Date(task.dueDate).toLocaleDateString()}</div>
                                      </div>
                                  </div>
                              ))}
                              {tasks.length === 0 && <div className="text-center py-12 theme-text-muted italic text-sm">¡Todo al día!</div>}
                          </div>
                      ) : (
                          <div className="space-y-0">
                              {logs.map((log, i) => (
                                  <div key={log.id} className={`p-3 text-xs border-b theme-border flex gap-3 ${i % 2 === 0 ? 'theme-bg-card' : 'theme-bg-main'}`}>
                                      <div className="w-8 h-8 rounded-full theme-bg-main border theme-border flex items-center justify-center theme-text-muted font-bold flex-shrink-0">{getInitials(log.userName)}</div>
                                      <div className="flex-1">
                                          <div className="font-bold theme-text-main">{log.action.replace(/_/g, ' ')}</div>
                                          <div className="theme-text-muted truncate w-40" title={log.details}>{log.details}</div>
                                          <div className="text-[10px] theme-text-muted mt-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  {rightPanelTab === 'tasks' && (
                      <div className="p-3 border-t theme-border theme-bg-table-header">
                          <form onSubmit={handleAddTask} className="flex gap-2">
                              <input className="flex-1 theme-input border theme-border rounded-lg px-3 py-2 text-sm outline-none" placeholder="Nueva tarea..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                              <button type="submit" className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700"><PlusIcon /></button>
                          </form>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* PIPELINE SECTION */}
      <div className="theme-card rounded-2xl shadow-sm border theme-border overflow-hidden">
        <div className="px-6 py-4 border-b theme-border theme-bg-table-header flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
              <h3 className="font-bold text-lg theme-text-main flex items-center gap-2">Pipeline <span className="theme-bg-main theme-text-muted text-xs px-2 py-0.5 rounded-full">{processedBudgets.length}</span></h3>
              <div className="flex theme-bg-main p-0.5 rounded-lg border theme-border">
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'theme-bg-card shadow-sm theme-text-main' : 'theme-text-muted'}`}><LayoutListIcon /></button>
                  <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'theme-bg-card shadow-sm theme-text-main' : 'theme-text-muted'}`}><LayoutKanbanIcon /></button>
              </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap md:flex-nowrap">
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border flex items-center gap-2 text-sm font-bold transition-all ${showFilters ? 'bg-slate-800 text-white' : 'theme-bg-card theme-text-main hover:theme-bg-main'}`}><FilterIcon/> <span className="hidden sm:inline">Filtros</span></button>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border border-green-500/30 theme-bg-card text-green-500 hover:bg-green-500/10"><DownloadIcon /> CSV</button>
              <div className="relative"><input className="pl-9 pr-3 py-2 theme-input border theme-border rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent-color)]" placeholder="Búsqueda rápida..." value={filters.global} onChange={e => setFilters({...filters, global: e.target.value})} /><div className="absolute left-3 top-2.5 theme-text-muted"><SearchIcon /></div></div>
          </div>
        </div>

        {showFilters && (
            <div className="theme-bg-main border-b theme-border p-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Nº Presupuesto</label><input className="w-full theme-input border rounded p-2 text-sm" value={filters.number} onChange={e => setFilters({...filters, number: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Cliente</label><input className="w-full theme-input border rounded p-2 text-sm" value={filters.client} onChange={e => setFilters({...filters, client: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Estado</label><select className="w-full theme-input border rounded p-2 text-sm cursor-pointer" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}><option value="all">Todos los Estados</option><option value="draft">Borrador</option><option value="pending">Pendiente</option><option value="accepted">Aceptado</option><option value="rejected">Rechazado</option></select></div>
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Comercial</label><input className="w-full theme-input border rounded p-2 text-sm" value={filters.commercial} onChange={e => setFilters({...filters, commercial: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Desde Fecha</label><input type="date" className="w-full theme-input border rounded p-2 text-sm" value={filters.dateStart} onChange={e => setFilters({...filters, dateStart: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Hasta Fecha</label><input type="date" className="w-full theme-input border rounded p-2 text-sm" value={filters.dateEnd} onChange={e => setFilters({...filters, dateEnd: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Importe Mín (€)</label><input type="number" className="w-full theme-input border rounded p-2 text-sm" value={filters.minAmount} onChange={e => setFilters({...filters, minAmount: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold theme-text-muted mb-1">Importe Máx (€)</label><input type="number" className="w-full theme-input border rounded p-2 text-sm" value={filters.maxAmount} onChange={e => setFilters({...filters, maxAmount: e.target.value})} /></div>
                </div>
                <div className="flex justify-end border-t theme-border pt-3"><button onClick={clearFilters} className="theme-text-muted text-xs font-bold hover:theme-text-main flex items-center gap-1 hover:theme-bg-card px-3 py-2 rounded"><RefreshIcon /> Limpiar Filtros</button></div>
            </div>
        )}

        {viewMode === 'list' ? (
            <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="theme-bg-table-header theme-text-muted uppercase text-xs font-semibold tracking-wider">
                <tr><SortableHeader label="Nº Doc" sortKey="number" /><SortableHeader label="Cliente" sortKey="client" /><SortableHeader label="Fecha" sortKey="date" /><SortableHeader label="Importe" sortKey="amount" /><SortableHeader label="Estado" sortKey="status" /><SortableHeader label="Comercial" sortKey="commercial" /><th className="px-6 py-4 text-right">Acciones</th></tr>
                </thead>
                <tbody className="divide-y theme-border">
                {processedBudgets.map(b => (
                    <tr key={b.id} className="hover:theme-bg-main cursor-pointer" onClick={(e) => handleEditClick(e, b)}>
                        <td className="px-6 py-4"><span className="font-mono font-medium theme-text-muted theme-bg-main px-2 py-1 rounded text-xs">{b.number}</span></td>
                        <td className="px-6 py-4 font-bold theme-text-main">{b.clientData.commercialName}</td>
                        <td className="px-6 py-4 theme-text-muted text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold font-mono theme-text-main">{calculateTotal(b).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                        <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${b.status === 'accepted' ? 'bg-green-500/10 text-green-500' : b.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : b.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 theme-text-muted'}`}>{b.status}</span></td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full theme-bg-main flex items-center justify-center text-[10px] font-bold theme-text-muted">{getInitials(b.creatorName || 'S')}</div>
                                <span className="text-xs theme-text-muted">{b.creatorName || 'Sistema'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={(e) => handleDuplicate(e, b)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded"><CopyIcon /></button><button onClick={(e) => handleDelete(e, b.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded"><TrashIcon /></button></div></td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        ) : (
            <div className="flex gap-4 p-6 overflow-x-auto min-h-[600px] theme-bg-main bg-opacity-50">
                <KanbanColumn status="draft" title="Borradores" colorClass="theme-text-muted theme-bg-card" items={processedBudgets.filter(b => b.status === 'draft')} />
                <KanbanColumn status="pending" title="Pendientes" colorClass="text-orange-500 bg-orange-500" items={processedBudgets.filter(b => b.status === 'pending')} />
                <KanbanColumn status="accepted" title="Ganados" colorClass="text-green-500 bg-green-500" items={processedBudgets.filter(b => b.status === 'accepted')} />
                <KanbanColumn status="rejected" title="Perdidos" colorClass="text-red-500 bg-red-500" items={processedBudgets.filter(b => b.status === 'rejected')} />
            </div>
        )}
      </div>
    </div>
  );
};
