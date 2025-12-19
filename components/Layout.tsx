
import React, { useState } from 'react';
import { SystemType, User, AppTheme } from '../types';
import { authService } from '../services/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  currentSystem: SystemType;
  onSystemChange: (system: SystemType) => void;
  user: User;
  onLogout: () => void;
}

// Icons components
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const FilePlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const FileEditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="m21 16-9 5.19-9-5.19"/><path d="m3.11 8.53 9-5.19 9 5.19"/><line x1="12" y1="22.76" x2="12" y2="12.2"/><line x1="12" y1="12.2" x2="20.89" y2="7.07"/><line x1="3.11" y1="7.07" x2="12" y2="12.2"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

const NavItem = ({ id, label, icon: Icon, active, onClick, collapsed, highlight = false }: any) => (
  <button
    onClick={() => onClick(id)}
    title={collapsed ? label : ''}
    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${collapsed ? 'justify-center w-full px-2' : 'w-full'} ${
      active 
        ? 'bg-white/15 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-md' 
        : highlight 
            ? 'text-red-400 hover:bg-white/5 hover:text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
        <Icon />
    </div>
    {!collapsed && <span className="font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, currentSystem, onSystemChange, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const theme = user.themePreference || 'classic';

  const themeStyles = {
      classic: {
          '--bg-sidebar': '#000000', // NEGRO PURO
          '--bg-main': '#f8fafc',
          '--bg-card': '#ffffff',
          '--text-main': '#0f172a',
          '--text-muted': '#64748b',
          '--border-color': '#e2e8f0',
          '--accent-color': '#dc2626',
          '--logo-bg': '#dc2626',
          '--hover-bg': '#f1f5f9',
          '--input-bg': '#ffffff',
      },
      midnight: {
          '--bg-sidebar': '#000000', // NEGRO PURO
          '--bg-main': '#0f172a',
          '--bg-card': '#1e293b',
          '--text-main': '#f8fafc',
          '--text-muted': '#94a3b8',
          '--border-color': '#334155',
          '--accent-color': '#7c3aed',
          '--logo-bg': '#7c3aed',
          '--hover-bg': '#334155',
          '--input-bg': '#0f172a',
      },
      ocean: {
          '--bg-sidebar': '#000000', // NEGRO PURO
          '--bg-main': '#ecfeff',
          '--bg-card': '#ffffff',
          '--text-main': '#164e63',
          '--text-muted': '#64748b',
          '--border-color': '#cffafe',
          '--accent-color': '#0891b2',
          '--logo-bg': '#0891b2',
          '--hover-bg': '#e0f2fe',
          '--input-bg': '#ffffff',
      }
  };

  const currentVars = themeStyles[theme as keyof typeof themeStyles] || themeStyles.classic;

  return (
    <div 
        className="flex h-screen overflow-hidden transition-colors duration-500 ease-in-out"
        style={currentVars as React.CSSProperties}
    >
      <style>{`
        :root {
            --bg-sidebar: ${currentVars['--bg-sidebar']};
            --bg-main: ${currentVars['--bg-main']};
            --bg-card: ${currentVars['--bg-card']};
            --text-main: ${currentVars['--text-main']};
            --text-muted: ${currentVars['--text-muted']};
            --border-color: ${currentVars['--border-color']};
            --accent-color: ${currentVars['--accent-color']};
            --input-bg: ${currentVars['--input-bg']};
        }
        body { background-color: var(--bg-main); color: var(--text-main); }
        .theme-card { background-color: var(--bg-card); border-color: var(--border-color); color: var(--text-main); }
        .theme-text-main { color: var(--text-main); }
        .theme-text-muted { color: var(--text-muted); }
        .theme-border { border-color: var(--border-color); }
        .theme-input { background-color: var(--input-bg); color: var(--text-main); border-color: var(--border-color); }
        .theme-hover:hover { background-color: var(--hover-bg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 bg-[var(--bg-sidebar)] text-white flex flex-col flex-shrink-0 z-40 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        border-r border-white/5
      `}>
        <div className={`p-6 flex flex-col ${isCollapsed ? 'items-center px-2' : ''}`}>
          <div className="flex justify-between items-center w-full mb-8">
              {!isCollapsed && (
                  <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                    <div className="w-9 h-9 bg-[var(--logo-bg)] rounded-xl flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(220,38,38,0.3)]">G</div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Gravity</span>
                  </h1>
              )}
              {isCollapsed && (
                  <div className="w-9 h-9 bg-[var(--logo-bg)] rounded-xl flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(220,38,38,0.3)]">G</div>
              )}
          </div>
          
          {/* User Profile Mini */}
          {!isCollapsed && (
              <div className="mb-6 flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 transition-all hover:bg-white/10 group cursor-pointer">
                 <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                     {user.name.charAt(0).toUpperCase()}
                 </div>
                 <div className="overflow-hidden">
                     <div className="text-sm font-bold truncate text-white">{user.name}</div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role === 'admin' ? 'Admin' : 'Sales'}</div>
                 </div>
              </div>
          )}

          {/* System Switcher Premium */}
          {!isCollapsed && (
              <div className="mb-6 w-full">
                 <label className="text-[10px] uppercase font-black text-slate-500 mb-2 block tracking-widest px-1">Active System</label>
                 <div className="relative group">
                    <select 
                        value={currentSystem}
                        onChange={(e) => onSystemChange(e.target.value as SystemType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-black text-slate-300 appearance-none cursor-pointer hover:bg-white/10 transition-all focus:ring-2 focus:ring-white/10 outline-none uppercase tracking-tighter"
                    >
                        <option value="agora" className="bg-[#0f0f0f] text-white">ÁGORA RETAIL</option>
                        <option value="sage" className="bg-[#0f0f0f] text-white">SAGE 50 CLOUD</option>
                        <option value="sage200" className="bg-[#0f0f0f] text-white">SAGE 200 ADV</option>
                        <option value="sagedespachos" className="bg-[#0f0f0f] text-white">SAGE DESPACHOS</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-600">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                 </div>
              </div>
          )}
        </div>
        
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavItem id="dashboard" label="Dashboard" icon={ChartIcon} active={activeView === 'dashboard'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="budgets" label="Nuevo Presupuesto" icon={FilePlusIcon} active={activeView === 'budgets' || activeView === 'edit-budget'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="expenses" label="Gastos" icon={CreditCardIcon} active={activeView === 'expenses'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="calendar" label="Calendario" icon={CalendarIcon} active={activeView === 'calendar'} onClick={handleNavClick} collapsed={isCollapsed} />
          <div className="py-4"><div className="h-px bg-white/5 mx-2"></div></div>
          <NavItem id="clients" label="Clientes" icon={UsersIcon} active={activeView === 'clients'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="products" label="Catálogo" icon={PackageIcon} active={activeView === 'products'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="pdf-customizer" label="Diseño PDF" icon={FileEditIcon} active={activeView === 'pdf-customizer'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="settings" label="Ajustes" icon={SettingsIcon} active={activeView === 'settings'} onClick={handleNavClick} collapsed={isCollapsed} />
          
          {authService.isAdmin(user) && (
             <>
             <div className="py-4"><div className="h-px bg-white/5 mx-2"></div></div>
             <NavItem id="admin-panel" label="Seguridad" icon={ShieldIcon} active={activeView === 'admin-panel'} onClick={handleNavClick} collapsed={isCollapsed} highlight={true} />
             </>
          )}
        </nav>

        <div className="p-4 flex flex-col gap-2 bg-gradient-to-t from-black to-transparent">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden lg:flex items-center justify-center p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"
          >
             {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>

          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20">
             <LogOutIcon /> 
             {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Logout System</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
