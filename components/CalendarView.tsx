
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Budget, Task } from '../types';
import { authService } from '../services/auth';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const currentUser = authService.getSession();

  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', date: '', priority: 'normal' as 'low'|'normal'|'high', completed: false });

  useEffect(() => {
      const load = () => {
          setBudgets(storageService.getBudgets());
          setTasks(storageService.getTasks().filter(t => t.assignedTo === currentUser?.id));
      };
      load();
      const unsub = storageService.subscribe(load);
      return unsub;
  }, [currentUser]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
      const day = new Date(year, month, 1).getDay();
      return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayBudgets = budgets.filter(b => {
          const bDate = new Date(b.createdAt);
          const expiryDate = new Date(bDate.setDate(bDate.getDate() + b.validityDays));
          return expiryDate.toISOString().split('T')[0] === dateStr;
      });
      const dayTasks = tasks.filter(t => t.dueDate.split('T')[0] === dateStr);
      return { budgets: dayBudgets, tasks: dayTasks };
  };

  const handleDayClick = (day: number) => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const cleanDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      setEditingTask(null);
      setTaskForm({ title: '', date: cleanDateStr, priority: 'normal', completed: false });
      setShowModal(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
      e.stopPropagation();
      setEditingTask(task);
      setTaskForm({ title: task.title, date: task.dueDate.split('T')[0], priority: task.priority, completed: task.completed });
      setShowModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!currentUser || !taskForm.title) return;
      const safeDate = new Date(taskForm.date);
      safeDate.setHours(12, 0, 0, 0);
      const taskToSave: Task = { id: editingTask ? editingTask.id : crypto.randomUUID(), title: taskForm.title, dueDate: safeDate.toISOString(), priority: taskForm.priority, completed: taskForm.completed, assignedTo: currentUser.id, relatedBudgetNumber: editingTask?.relatedBudgetNumber };
      storageService.saveTask(taskToSave);
      setShowModal(false);
  };

  return (
    <div className="space-y-6 theme-text-main">
        <div className="flex justify-between items-center theme-card p-4 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Calendario
            </h2>
            <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 hover:theme-bg-main rounded-full">←</button>
                <span className="font-bold text-lg w-40 text-center capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <button onClick={nextMonth} className="p-2 hover:theme-bg-main rounded-full">→</button>
            </div>
        </div>

        <div className="theme-card rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 theme-bg-table-header border-b theme-border">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="py-3 text-center text-xs font-bold theme-text-muted uppercase">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
                {Array.from({ length: startDay }).map((_, i) => (<div key={`empty-${i}`} className="min-h-[120px] theme-bg-main opacity-20 border-b border-r theme-border"></div>))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const { budgets, tasks } = getEventsForDay(day);
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                    return (
                        <div key={day} onClick={() => handleDayClick(day)} className={`min-h-[120px] p-2 border-b border-r theme-border relative group transition-colors hover:theme-bg-main cursor-pointer ${isToday ? 'theme-bg-main' : ''}`}>
                            <span className={`text-sm font-bold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--accent-color)] text-white shadow-md' : 'theme-text-main'}`}>{day}</span>
                            <div className="space-y-1">
                                {budgets.map(b => (
                                    <div key={b.id} className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 truncate" onClick={(e) => e.stopPropagation()}>⏳ Vence {b.number}</div>
                                ))}
                                {tasks.map(t => (
                                    <div key={t.id} onClick={(e) => handleTaskClick(e, t)} className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${t.completed ? 'opacity-40 line-through' : t.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>{t.completed ? '✓' : '•'} {t.title}</div>
                                ))}
                            </div>
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 theme-text-muted"><PlusIcon /></div>
                        </div>
                    );
                })}
            </div>
        </div>

        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="theme-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b theme-border theme-bg-table-header flex justify-between items-center">
                        <h3 className="font-bold text-lg">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
                        <button onClick={() => setShowModal(false)} className="theme-text-muted hover:theme-text-main p-1"><XIcon /></button>
                    </div>
                    <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                        <div><label className="block text-xs font-bold theme-text-muted mb-1">Título</label><input className="w-full theme-input rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-color)]" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} autoFocus /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold theme-text-muted mb-1">Fecha</label><input type="date" className="w-full theme-input rounded-lg p-2 text-sm" value={taskForm.date} onChange={e => setTaskForm({...taskForm, date: e.target.value})} /></div>
                            <div><label className="block text-xs font-bold theme-text-muted mb-1">Prioridad</label><select className="w-full theme-input rounded-lg p-2 text-sm" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value as any})}><option value="low">Baja</option><option value="normal">Normal</option><option value="high">Alta</option></select></div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            {editingTask && (<button type="button" onClick={() => { if(confirm('¿Borrar?')) { storageService.deleteTask(editingTask.id); setShowModal(false); } }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><TrashIcon /></button>)}
                            <div className="flex-1"></div>
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 theme-text-muted font-bold text-sm">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
