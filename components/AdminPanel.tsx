
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { User, UserRole, LogEntry } from '../types';

// Icons
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentUser] = useState<User | null>(authService.getSession());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ username: '', name: '', password: '', role: 'commercial' as UserRole });
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => { loadData(); return storageService.subscribe(loadData); }, []);
  const loadData = () => { setUsers(storageService.getUsers()); setLogs(storageService.getLogs()); };
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.password) return alert('Datos obligatorios');
    if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) return alert('Usuario ya existe.');
    const hash = await authService.hashPassword(formData.password);
    const newUser: User = { id: crypto.randomUUID(), username: formData.username, name: formData.name, role: formData.role, passwordHash: hash, createdAt: new Date().toISOString(), lastPasswordChange: new Date().toISOString() };
    storageService.saveUser(newUser);
    storageService.addLog({ userId: currentUser?.id, userName: currentUser?.name, action: 'USER_CREATED', details: `User ${newUser.username}` });
    setFormData({ username: '', name: '', password: '', role: 'commercial' });
    alert('Usuario creado');
  };

  const handleUpdateUser = () => {
      if (!editingUser) return;
      storageService.saveUser(editingUser);
      storageService.addLog({ userId: currentUser?.id, userName: currentUser?.name, action: 'USER_UPDATED', details: editingUser.username });
      setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) return alert('No puedes borrarte a ti mismo.');
    if (confirm('¿Eliminar usuario?')) {
        storageService.deleteUser(userId);
        storageService.addLog({ userId: currentUser?.id, userName: currentUser?.name, action: 'USER_DELETED', details: userId });
    }
  };

  const handleResetPassword = async () => {
      if (!resetUserId || !newPassword) return;
      const user = users.find(u => u.id === resetUserId);
      if (!user) return;
      const hash = await authService.hashPassword(newPassword);
      storageService.saveUser({ ...user, passwordHash: hash, lastPasswordChange: new Date().toISOString() });
      storageService.addLog({ userId: currentUser?.id, userName: currentUser?.name, action: 'PASS_RESET', details: user.username });
      setResetUserId(null); setNewPassword('');
      alert('Password actualizado.');
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-12 theme-text-main">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div><h2 className="text-2xl font-bold">Panel de Control</h2><p className="theme-text-muted text-sm">Administración central de seguridad y acceso.</p></div>
         <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-2 self-start md:self-auto border border-red-500/20"><span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Root Access Only</span>
      </div>

      <div className="flex theme-bg-main rounded-xl p-1 border theme-border w-fit">
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'theme-bg-card shadow-sm theme-text-main' : 'theme-text-muted hover:theme-text-main'}`}><UsersIcon /> Usuarios</button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'logs' ? 'theme-bg-card shadow-sm theme-text-main' : 'theme-text-muted hover:theme-text-main'}`}><ActivityIcon /> Auditoría</button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-4">
                <div className="theme-card rounded-2xl shadow-sm border theme-border overflow-hidden">
                    <div className="px-6 py-4 border-b theme-border theme-bg-table-header flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="font-bold flex items-center gap-2">Equipo Registrado <span className="theme-bg-main px-2 py-0.5 rounded text-[10px] theme-text-muted">{users.length}</span></h3>
                        <div className="relative w-full sm:w-64"><input type="text" placeholder="Buscar..." className="w-full pl-9 pr-3 py-2 theme-input border theme-border rounded-xl text-xs outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><div className="absolute left-3 top-2.5 theme-text-muted"><SearchIcon /></div></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] theme-text-muted uppercase theme-bg-table-header font-black border-b theme-border">
                                <tr><th className="px-6 py-4">Empleado</th><th className="px-6 py-4">Permisos</th><th className="px-6 py-4 text-right">Acciones</th></tr>
                            </thead>
                            <tbody className="divide-y theme-border">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:theme-bg-main transition-colors">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full theme-bg-main border theme-border flex items-center justify-center theme-text-muted font-black text-xs">{getInitials(u.name)}</div><div><div className="font-bold theme-text-main">{u.name}</div><div className="text-[10px] theme-text-muted">@{u.username}</div></div></div></td>
                                        <td className="px-6 py-4">{u.role === 'admin' ? (<span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-red-500/20">Admin</span>) : (<span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-blue-500/20">Comercial</span>)}</td>
                                        <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setEditingUser(u)} className="p-2 theme-text-muted hover:theme-text-main"><EditIcon /></button><button onClick={() => setResetUserId(u.id)} className="p-2 theme-text-muted hover:text-orange-500"><KeyIcon /></button>{u.id !== currentUser?.id && (<button onClick={() => handleDeleteUser(u.id)} className="p-2 theme-text-muted hover:text-red-500"><TrashIcon /></button>)}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border h-fit"><h3 className="font-bold mb-6 flex items-center gap-2 pb-4 border-b theme-border"><UserPlusIcon /> Nuevo Perfil</h3><form onSubmit={handleCreateUser} className="space-y-4"><div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1.5 ml-1">Nombre Real</label><input className="w-full theme-input border theme-border rounded-xl p-2.5 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div><div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1.5 ml-1">Login ID</label><input className="w-full theme-input border theme-border rounded-xl p-2.5 text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div><div><label className="block text-[10px] font-black uppercase theme-text-muted mb-1.5 ml-1">Password</label><input type="password" className="w-full theme-input border theme-border rounded-xl p-2.5 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div><button type="submit" className="w-full bg-slate-900 text-white font-black py-3 rounded-xl shadow-lg mt-4 text-sm">REGISTRAR USUARIO</button></form></div>
        </div>
      ) : (
          <div className="theme-card rounded-2xl shadow-sm border theme-border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="theme-bg-table-header theme-text-muted uppercase border-b theme-border font-black"><tr><th className="px-6 py-3">Timestamp</th><th className="px-6 py-3">Actor</th><th className="px-6 py-3">Evento</th><th className="px-6 py-3">Detalle</th></tr></thead><tbody className="divide-y theme-border">{logs.map(l => (<tr key={l.id} className="hover:theme-bg-main"><td className="px-6 py-3 theme-text-muted font-mono">{new Date(l.timestamp).toLocaleString()}</td><td className="px-6 py-3 font-bold">{l.userName}</td><td className="px-6 py-3"><span className="font-black opacity-70">{l.action}</span></td><td className="px-6 py-3 theme-text-muted truncate max-w-xs">{l.details}</td></tr>))}</tbody></table></div></div>
      )}
    </div>
  );
};
