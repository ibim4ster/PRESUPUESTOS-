
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { User, UserRole } from '../types';

// Icons
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState<User | null>(authService.getSession());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Form State
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'commercial' as UserRole
  });
  
  // Modals State
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    const unsub = storageService.subscribe(loadUsers);
    return unsub;
  }, []);

  const loadUsers = () => {
    setUsers(storageService.getUsers());
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  // --- ACTIONS ---

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.password) return alert('Todos los campos son obligatorios');
    
    if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
        return alert('El nombre de usuario ya existe.');
    }

    const hash = await authService.hashPassword(formData.password);
    const newUser: User = {
        id: crypto.randomUUID(),
        username: formData.username,
        name: formData.name,
        role: formData.role,
        passwordHash: hash,
        createdAt: new Date().toISOString()
    };

    storageService.saveUser(newUser);
    setFormData({ username: '', name: '', password: '', role: 'commercial' });
    alert('Usuario creado correctamente');
  };

  const handleUpdateUser = () => {
      if (!editingUser) return;
      // Check username uniqueness if changed
      const existing = users.find(u => u.username.toLowerCase() === editingUser.username.toLowerCase() && u.id !== editingUser.id);
      if (existing) return alert('El nombre de usuario ya está en uso por otra persona.');

      storageService.saveUser(editingUser);
      setEditingUser(null);
      alert('Datos actualizados correctamente.');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) return alert('No puedes borrar tu propio usuario.');
    if (confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
        storageService.deleteUser(userId);
    }
  };

  const handleResetPassword = async () => {
      if (!resetUserId || !newPassword) return;
      const user = users.find(u => u.id === resetUserId);
      if (!user) return;

      const hash = await authService.hashPassword(newPassword);
      const updatedUser = { ...user, passwordHash: hash };
      
      storageService.saveUser(updatedUser);
      setResetUserId(null);
      setNewPassword('');
      alert('Contraseña actualizada correctamente.');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Panel de Administración</h2>
            <p className="text-slate-500 text-sm">Gestión de usuarios, permisos y seguridad.</p>
         </div>
         <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-2 self-start md:self-auto">
             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
             Acceso Restringido
         </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* User List */}
          <div className="xl:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          Usuarios del Sistema
                          <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-slate-500">{users.length}</span>
                      </h3>
                      <div className="relative w-full sm:w-64">
                          <input 
                            type="text" 
                            placeholder="Buscar usuario..." 
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <div className="absolute left-3 top-2.5 text-slate-400">
                              <SearchIcon />
                          </div>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Rol / Permisos</th>
                                <th className="px-6 py-3">Alta</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-white shadow-sm">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
                                                <div className="text-xs text-slate-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-100">
                                                Administrador
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100">
                                                Comercial
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Datos y Permisos"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button 
                                                onClick={() => setResetUserId(user.id)}
                                                className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Cambiar Contraseña"
                                            >
                                                <KeyIcon />
                                            </button>
                                            {user.id !== currentUser?.id && (
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar usuario permanentemente"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>

          {/* Create User Form */}
          <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                      <UserPlusIcon />
                      Crear Nuevo Usuario
                  </h3>
                  <form onSubmit={handleCreateUser} className="space-y-5">
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Nombre Completo</label>
                          <input 
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow"
                            placeholder="Ej: Juan Pérez"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Usuario (Login)</label>
                          <input 
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow"
                            placeholder="Ej: jperez"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            autoComplete="off"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Contraseña Inicial</label>
                          <input 
                            type="password"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow"
                            placeholder="••••••"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            autoComplete="new-password"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Rol / Permisos</label>
                          <select 
                             className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
                             value={formData.role}
                             onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                          >
                              <option value="commercial">Comercial (Ver sus ventas)</option>
                              <option value="admin">Administrador (Acceso Total)</option>
                          </select>
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg mt-4 flex justify-center items-center gap-2"
                      >
                          <UserPlusIcon /> Crear Usuario
                      </button>
                  </form>
              </div>
          </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-900">Editar Usuario</h3>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre</label>
                        <input 
                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editingUser.name}
                            onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Usuario (Login)</label>
                        <input 
                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editingUser.username}
                            onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Permisos (Rol)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all ${editingUser.role === 'commercial' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" className="sr-only" checked={editingUser.role === 'commercial'} onChange={() => setEditingUser({...editingUser, role: 'commercial'})} />
                                <span className="text-sm font-bold text-slate-800">Comercial</span>
                                <span className="text-[10px] text-slate-500 text-center">Acceso básico</span>
                            </label>
                            <label className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all ${editingUser.role === 'admin' ? 'bg-red-50 border-red-200 ring-2 ring-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" className="sr-only" checked={editingUser.role === 'admin'} onChange={() => setEditingUser({...editingUser, role: 'admin'})} />
                                <span className="text-sm font-bold text-slate-800">Admin</span>
                                <span className="text-[10px] text-slate-500 text-center">Control total</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => setEditingUser(null)}
                        className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleUpdateUser}
                        className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUserId && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200 border-t-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                          <KeyIcon />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">Resetear Contraseña</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                      Estás a punto de cambiar la contraseña. Asegúrate de comunicársela al usuario.
                  </p>
                  
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 bg-white text-slate-900 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-orange-500 outline-none font-medium" 
                    placeholder="Escribe la nueva contraseña"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoFocus
                  />
                  
                  <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setResetUserId(null); setNewPassword(''); }}
                        className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-bold"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={handleResetPassword}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md transition-colors"
                      >
                          Actualizar Pass
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
