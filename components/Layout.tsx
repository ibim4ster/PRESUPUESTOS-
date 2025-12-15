
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
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${collapsed ? 'justify-center w-full px-2' : 'w-full'} ${
      active 
        ? 'bg-white/10 text-white shadow-sm' 
        : highlight 
            ? 'text-red-300 hover:bg-white/5 hover:text-white'
            : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon />
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, currentSystem, onSystemChange, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  // --- ROBUST THEMING ENGINE ---
  const theme = user.themePreference || 'classic';

  const themeStyles = {
      classic: {
          '--bg-sidebar': '#0f172a', // Slate 900
          '--bg-main': '#f8fafc', // Slate 50
          '--bg-card': '#ffffff', // White
          '--text-main': '#0f172a', // Slate 900
          '--text-muted': '#64748b', // Slate 500
          '--border-color': '#e2e8f0', // Slate 200
          '--accent-color': '#dc2626', // Red 600
          '--logo-bg': '#dc2626',
          '--hover-bg': '#f1f5f9',
          '--input-bg': '#ffffff',
      },
      midnight: {
          '--bg-sidebar': '#000000', // Black
          '--bg-main': '#0f172a', // Slate 950
          '--bg-card': '#1e293b', // Slate 800
          '--text-main': '#f8fafc', // Slate 50
          '--text-muted': '#94a3b8', // Slate 400
          '--border-color': '#334155', // Slate 700
          '--accent-color': '#7c3aed', // Violet 600
          '--logo-bg': '#7c3aed',
          '--hover-bg': '#334155', // Slate 700
          '--input-bg': '#0f172a',
      },
      ocean: {
          '--bg-sidebar': '#164e63', // Cyan 900
          '--bg-main': '#ecfeff', // Cyan 50
          '--bg-card': '#ffffff', // White
          '--text-main': '#164e63', // Cyan 900
          '--text-muted': '#64748b', // Slate 500
          '--border-color': '#cffafe', // Cyan 100
          '--accent-color': '#0891b2', // Cyan 600
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
      `}</style>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-sidebar)] text-white z-30 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--logo-bg)] rounded-lg flex items-center justify-center text-white text-lg font-bold">G</div>
            <span className="font-bold text-lg">Gravity</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
           {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 bg-[var(--bg-sidebar)] text-white flex flex-col flex-shrink-0 shadow-2xl z-40 transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        <div className={`p-6 border-b border-white/10 flex flex-col ${isCollapsed ? 'items-center px-2' : ''}`}>
          <div className="flex justify-between items-start w-full">
              {!isCollapsed && (
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 animate-in fade-in duration-300">
                    <div className="w-8 h-8 bg-[var(--logo-bg)] rounded-lg flex items-center justify-center text-white text-lg shadow-lg">G</div>
                    <span>Gravity</span>
                  </h1>
              )}
              {isCollapsed && (
                  <div className="w-8 h-8 bg-[var(--logo-bg)] rounded-lg flex items-center justify-center text-white text-lg shadow-lg mx-auto">G</div>
              )}
              {!isCollapsed && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono">v2.4</span>}
          </div>
          
          <div className={`mt-4 flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : ''}`}>
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                 {user.name.charAt(0).toUpperCase()}
             </div>
             {!isCollapsed && (
                 <div className="overflow-hidden">
                     <div className="text-xs font-bold truncate">{user.name}</div>
                     <div className="text-[10px] text-white/50 capitalize">{user.role === 'admin' ? 'Administrador' : 'Comercial'}</div>
                 </div>
             )}
          </div>

          {/* System Switcher */}
          {!isCollapsed && (
              <div className="mt-4 w-full animate-in fade-in duration-300">
                 <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Sistema Activo</label>
                 <div className="relative">
                    <select 
                        value={currentSystem}
                        onChange={(e) => onSystemChange(e.target.value as SystemType)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-sm font-bold text-white appearance-none cursor-pointer hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white/30 outline-none"
                    >
                        <option value="agora" className="text-slate-900 font-bold">ÁGORA</option>
                        <option value="sage" className="text-slate-900 font-bold">SAGE 50</option>
                        <option value="sage200" className="text-slate-900 font-bold">SAGE 200</option>
                        <option value="sagedespachos" className="text-slate-900 font-bold">SAGE DESPACHOS</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-white/70">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                 </div>
              </div>
          )}
        </div>
        
        <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto mt-16 lg:mt-0 custom-scrollbar">
          <NavItem id="dashboard" label="Dashboard" icon={ChartIcon} active={activeView === 'dashboard'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="budgets" label="Nuevo Presupuesto" icon={FilePlusIcon} active={activeView === 'budgets' || activeView === 'edit-budget'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="expenses" label="Gastos" icon={CreditCardIcon} active={activeView === 'expenses'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="calendar" label="Calendario" icon={CalendarIcon} active={activeView === 'calendar'} onClick={handleNavClick} collapsed={isCollapsed} />
          <div className="my-2 border-t border-white/10"></div>
          <NavItem id="clients" label="Clientes" icon={UsersIcon} active={activeView === 'clients'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="products" label="Catálogo" icon={PackageIcon} active={activeView === 'products'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="pdf-customizer" label="Personalizar PDF" icon={FileEditIcon} active={activeView === 'pdf-customizer'} onClick={handleNavClick} collapsed={isCollapsed} />
          <NavItem id="settings" label="Configuración" icon={SettingsIcon} active={activeView === 'settings'} onClick={handleNavClick} collapsed={isCollapsed} />
          
          {authService.isAdmin(user) && (
             <>
             {!isCollapsed && <div className="pt-4 pb-2 border-t border-white/10 mt-4"><p className="px-4 text-[10px] font-bold text-white/40 uppercase">Administración</p></div>}
             {isCollapsed && <div className="my-2 border-t border-white/10"></div>}
             <NavItem id="admin-panel" label="Gestión Usuarios" icon={ShieldIcon} active={activeView === 'admin-panel'} onClick={handleNavClick} collapsed={isCollapsed} highlight={true} />
             </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title={isCollapsed ? "Expandir Menú" : "Colapsar Menú"}
          >
             {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>

          <button onClick={onLogout} className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors ${isCollapsed ? '' : ''}`}>
             <LogOutIcon /> 
             {!isCollapsed && <span className="text-xs font-bold uppercase">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative bg-[var(--bg-main)] pt-16 lg:pt-0 transition-colors duration-500">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
