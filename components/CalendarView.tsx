
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

  // Modal State
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
      return day === 0 ? 6 : day - 1; // Adjust to Monday start (0 = Mon, 6 = Sun)
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
      const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
      const dayBudgets = budgets.filter(b => {
          const bDate = new Date(b.createdAt);
          const expiryDate = new Date(bDate.setDate(bDate.getDate() + b.validityDays));
          return expiryDate.toISOString().split('T')[0] === dateStr;
      });
      const dayTasks = tasks.filter(t => t.dueDate.split('T')[0] === dateStr);
      return { budgets: dayBudgets, tasks: dayTasks };
  };

  // HANDLERS
  const handleDayClick = (day: number) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      // Correct timezone offset for form input
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - (offset*60*1000));
      
      setSelectedDay(date);
      setEditingTask(null);
      setTaskForm({ title: '', date: adjustedDate.toISOString().split('T')[0], priority: 'normal', completed: false });
      setShowModal(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
      e.stopPropagation();
      setEditingTask(task);
      setTaskForm({ 
          title: task.title, 
          date: task.dueDate.split('T')[0], 
          priority: task.priority, 
          completed: task.completed 
      });
      setShowModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!currentUser || !taskForm.title) return;

      const taskToSave: Task = {
          id: editingTask ? editingTask.id : crypto.randomUUID(),
          title: taskForm.title,
          dueDate: new Date(taskForm.date).toISOString(),
          priority: taskForm.priority,
          completed: taskForm.completed,
          assignedTo: currentUser.id,
          relatedBudgetNumber: editingTask?.relatedBudgetNumber
      };

      storageService.saveTask(taskToSave);
      setShowModal(false);
  };

  const handleDeleteTask = () => {
      if(editingTask) {
          if(confirm('¿Borrar esta tarea?')) {
              storageService.deleteTask(editingTask.id);
              setShowModal(false);
          }
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Calendario
            </h2>
            <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">←</button>
                <span className="font-bold text-lg w-32 text-center capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">→</button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-gray-200">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
                {/* Empty Cells */}
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/30 border-b border-r border-gray-100"></div>
                ))}
                
                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const { budgets, tasks } = getEventsForDay(day);
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                    return (
                        <div 
                            key={day} 
                            onClick={() => handleDayClick(day)}
                            className={`min-h-[120px] p-2 border-b border-r border-gray-100 relative group transition-colors hover:bg-blue-50/50 cursor-pointer ${isToday ? 'bg-blue-50/30' : ''}`}
                        >
                            <span className={`text-sm font-bold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}`}>{day}</span>
                            
                            <div className="space-y-1">
                                {budgets.map(b => (
                                    <div key={b.id} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100 truncate cursor-help hover:bg-red-100" onClick={(e) => e.stopPropagation()} title={`Vence presupuesto ${b.number}`}>
                                        ⏳ Vence {b.number}
                                    </div>
                                ))}
                                {tasks.map(t => (
                                    <div 
                                        key={t.id} 
                                        onClick={(e) => handleTaskClick(e, t)}
                                        className={`text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${t.completed ? 'bg-gray-100 text-gray-400 line-through' : t.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 font-medium' : 'bg-blue-50 text-blue-700 border-blue-100'}`} 
                                        title={t.title}
                                    >
                                        {t.completed ? '✓' : '•'} {t.title}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Hover Add Indicator */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 text-slate-300">
                                <PlusIcon />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* TASK MODAL */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-slate-900">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
                        <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                    </div>
                    
                    <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Título de la tarea</label>
                            <input 
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white text-slate-900"
                                placeholder="Llamar al cliente..."
                                value={taskForm.title}
                                onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                                autoFocus
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Vencimiento</label>
                                <input 
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white text-slate-900"
                                    value={taskForm.date}
                                    onChange={e => setTaskForm({...taskForm, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Prioridad</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white text-slate-900"
                                    value={taskForm.priority}
                                    onChange={e => setTaskForm({...taskForm, priority: e.target.value as any})}
                                >
                                    <option value="low">Baja</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                        </div>

                        {editingTask && (
                            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input 
                                    type="checkbox" 
                                    checked={taskForm.completed}
                                    onChange={e => setTaskForm({...taskForm, completed: e.target.checked})}
                                    className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Marcar como completada</span>
                            </label>
                        )}

                        <div className="flex gap-3 pt-2">
                            {editingTask && (
                                <button type="button" onClick={handleDeleteTask} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100" title="Eliminar">
                                    <TrashIcon />
                                </button>
                            )}
                            <div className="flex-1"></div>
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg text-sm font-bold">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-md">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
