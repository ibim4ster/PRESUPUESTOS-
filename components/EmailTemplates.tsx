
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { EmailTemplate } from '../types';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

export const EmailTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [editing, setEditing] = useState<Partial<EmailTemplate>>({});

    useEffect(() => {
        setTemplates(storageService.getTemplates());
        const unsub = storageService.subscribe(() => setTemplates(storageService.getTemplates()));
        return unsub;
    }, []);

    const handleSave = () => {
        if (!editing.name || !editing.subject || !editing.body) return alert('Todos los campos son obligatorios');
        const newItem: EmailTemplate = {
            id: editing.id || crypto.randomUUID(),
            name: editing.name,
            subject: editing.subject,
            body: editing.body
        };
        storageService.saveTemplate(newItem);
        setEditing({});
    };

    const handleDelete = (id: string) => {
        if(confirm('¿Eliminar plantilla?')) storageService.deleteTemplate(id);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center justify-between">
                <span>Gestor de Plantillas de Email</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {templates.map(tpl => (
                        <div key={tpl.id} className="p-3 border border-gray-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => setEditing(tpl)}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm text-slate-700">{tpl.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(tpl.id); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon/></button>
                            </div>
                            <div className="text-xs text-slate-500 truncate">{tpl.subject}</div>
                        </div>
                    ))}
                    <button onClick={() => setEditing({})} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-slate-400 text-sm font-bold hover:border-slate-400 hover:text-slate-600 flex items-center justify-center gap-2">
                        <PlusIcon /> Nueva Plantilla
                    </button>
                </div>

                {/* Editor */}
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">{editing.id ? 'Editando Plantilla' : 'Nueva Plantilla'}</h4>
                    <div className="space-y-3">
                        <div>
                            <input 
                                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white text-slate-900 focus:ring-2 focus:ring-slate-800 outline-none" 
                                placeholder="Nombre interno (ej: Envío Cliente)" 
                                value={editing.name || ''} 
                                onChange={e => setEditing({...editing, name: e.target.value})} 
                            />
                        </div>
                        <div>
                            <input 
                                className="w-full text-sm border border-gray-300 rounded-lg p-2 font-medium bg-white text-slate-900 focus:ring-2 focus:ring-slate-800 outline-none" 
                                placeholder="Asunto del Email" 
                                value={editing.subject || ''} 
                                onChange={e => setEditing({...editing, subject: e.target.value})} 
                            />
                        </div>
                        <div>
                            <textarea 
                                className="w-full text-sm border border-gray-300 rounded-lg p-2 h-40 resize-none font-mono text-xs bg-white text-slate-900 focus:ring-2 focus:ring-slate-800 outline-none" 
                                placeholder="Cuerpo del mensaje. Usa {{cliente}}, {{numero}}..." 
                                value={editing.body || ''} 
                                onChange={e => setEditing({...editing, body: e.target.value})} 
                            />
                        </div>
                        <div className="text-[10px] text-slate-400">Variables: {'{{cliente}}'}, {'{{numero}}'}, {'{{total}}'}</div>
                        <button onClick={handleSave} className="w-full bg-slate-800 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-900"><SaveIcon /> Guardar Plantilla</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
