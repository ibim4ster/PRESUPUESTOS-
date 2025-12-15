
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { Budget, Client } from '../types';

interface CommandPaletteProps {
  onNavigate: (view: string) => void;
  onEditBudget: (budget: Budget) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BudgetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate, onEditBudget, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([
        { type: 'action', label: 'Ir al Dashboard', action: () => onNavigate('dashboard'), icon: LinkIcon },
        { type: 'action', label: 'Crear Nuevo Presupuesto', action: () => onNavigate('budgets'), icon: BudgetIcon },
        { type: 'action', label: 'Ver Calendario', action: () => onNavigate('calendar'), icon: LinkIcon },
        { type: 'action', label: 'Gestor de Gastos', action: () => onNavigate('expenses'), icon: LinkIcon },
        { type: 'action', label: 'Base de Datos Clientes', action: () => onNavigate('clients'), icon: UserIcon },
      ]);
      return;
    }

    const budgets = storageService.getBudgets();
    const clients = storageService.getClients();
    const qLower = query.toLowerCase();

    const matchedBudgets = budgets
        .filter(b => b.number.toLowerCase().includes(qLower) || b.clientData.commercialName.toLowerCase().includes(qLower))
        .slice(0, 3)
        .map(b => ({
            type: 'budget',
            label: `${b.number} - ${b.clientData.commercialName}`,
            subLabel: b.status,
            data: b,
            icon: BudgetIcon
        }));

    const matchedClients = clients
        .filter(c => c.commercialName.toLowerCase().includes(qLower) || c.legalName.toLowerCase().includes(qLower))
        .slice(0, 3)
        .map(c => ({
            type: 'client',
            label: c.commercialName,
            subLabel: c.cif,
            data: c,
            icon: UserIcon
        }));

    setResults([...matchedBudgets, ...matchedClients]);
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: any) => {
    if (item.type === 'action') {
      item.action();
    } else if (item.type === 'budget') {
      onEditBudget(item.data);
    } else if (item.type === 'client') {
      onNavigate('clients');
      // In a real app we'd pass the client ID to auto-open, but simplifying for now
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <div className="text-slate-400 mr-3"><SearchIcon /></div>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-lg"
            placeholder="Escribe para buscar o navegar..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">ESC</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">No se encontraron resultados.</div>
          )}
          
          {results.map((item, index) => (
            <div
              key={index}
              className={`px-4 py-3 flex items-center cursor-pointer transition-colors ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={`p-2 rounded-lg mr-3 ${index === selectedIndex ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <item.icon />
              </div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${index === selectedIndex ? 'text-blue-900' : 'text-slate-700'}`}>{item.label}</div>
                {item.subLabel && <div className="text-xs text-slate-400">{item.subLabel}</div>}
              </div>
              {index === selectedIndex && (
                <div className="text-blue-400"><ArrowRightIcon /></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="px-4 py-2 bg-slate-50 border-t border-gray-100 text-[10px] text-slate-400 flex justify-between">
            <span><strong>↑↓</strong> para navegar</span>
            <span><strong>Enter</strong> para seleccionar</span>
        </div>
      </div>
    </div>
  );
};
