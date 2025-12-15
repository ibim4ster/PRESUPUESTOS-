
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Expense } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const TrendingDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;

const CATEGORIES = [
    { id: 'office', label: 'Oficina / Alquiler', color: '#6366f1' },
    { id: 'travel', label: 'Viajes / Desplazamientos', color: '#f59e0b' },
    { id: 'software', label: 'Software / Licencias', color: '#10b981' },
    { id: 'marketing', label: 'Marketing / Publi', color: '#ec4899' },
    { id: 'salary', label: 'Nóminas / Personal', color: '#3b82f6' },
    { id: 'other', label: 'Otros Gastos', color: '#64748b' },
];

export const ExpenseManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formData, setFormData] = useState<Partial<Expense>>({
      description: '', amount: 0, category: 'other', recurring: false, date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
      const update = () => setExpenses([...storageService.getExpenses()]);
      update();
      const unsub = storageService.subscribe(update);
      return unsub;
  }, []);

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if(!formData.description || !formData.amount) return;
      
      const newExpense: Expense = {
          id: crypto.randomUUID(),
          description: formData.description,
          amount: parseFloat(formData.amount.toString()),
          category: formData.category as any,
          recurring: !!formData.recurring,
          date: new Date(formData.date || new Date()).toISOString()
      };
      
      storageService.saveExpense(newExpense);
      setFormData({ description: '', amount: 0, category: 'other', recurring: false, date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
      if(confirm('¿Borrar gasto?')) storageService.deleteExpense(id);
  };

  // Stats
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const chartData = CATEGORIES.map(cat => ({
      name: cat.label,
      value: expenses.filter(e => e.category === cat.id).reduce((acc, e) => acc + e.amount, 0),
      color: cat.color
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Control de Gastos</h2>
                <p className="text-slate-500 text-sm">Registro de gastos operativos para cálculo de beneficio neto.</p>
            </div>
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2 font-bold shadow-sm">
                <TrendingDownIcon />
                Total Gastos: {totalExpenses.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FORM */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Registrar Nuevo Gasto</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Concepto</label>
                            <input className="w-full border border-gray-300 bg-white text-slate-900 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none" placeholder="Ej: Factura Luz Enero" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Importe (€)</label>
                                <input type="number" step="0.01" className="w-full border border-gray-300 bg-white text-slate-900 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none" placeholder="0.00" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
                                <input type="date" className="w-full border border-gray-300 bg-white text-slate-900 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Categoría</label>
                            <select className="w-full border border-gray-300 bg-white text-slate-900 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="recurring" className="w-4 h-4 rounded text-slate-900 focus:ring-0" checked={formData.recurring} onChange={e => setFormData({...formData, recurring: e.target.checked})} />
                            <label htmlFor="recurring" className="text-sm text-slate-700">Gasto Recurrente (Mensual)</label>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 flex justify-center gap-2 items-center">
                            <PlusIcon /> Registrar Gasto
                        </button>
                    </form>
                </div>

                {/* CHART */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-64 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm mb-2">Desglose por Categoría</h3>
                    <div className="flex-1 w-full h-full" style={{ minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* LIST */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Historial de Gastos</h3>
                        <span className="text-xs text-slate-500 font-mono">{expenses.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Concepto</th>
                                    <th className="px-6 py-3">Categoría</th>
                                    <th className="px-6 py-3 text-right">Importe</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => {
                                    const cat = CATEGORIES.find(c => c.id === e.category);
                                    return (
                                        <tr key={e.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-slate-500 text-xs font-mono">{new Date(e.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 font-medium text-slate-800">
                                                {e.description}
                                                {e.recurring && <span className="ml-2 text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase font-bold">Recurrente</span>}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200" style={{ borderColor: cat?.color + '40', color: cat?.color }}>
                                                    {cat?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right font-bold text-slate-700">{e.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button onClick={() => handleDelete(e.id)} className="text-slate-400 hover:text-red-500 p-1"><TrashIcon/></button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {expenses.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No hay gastos registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
