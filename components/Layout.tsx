
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SystemType, User, AppTheme } from '../types';
import { authService } from '../services/auth';

const MotionAside = motion.aside as any;
const MotionDiv = motion.div as any;

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
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const FilePlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const FileEditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="m21 16-9 5.19-9-5.19"/><path d="m3.11 8.53 9-5.19 9 5.19"/><line x1="12" y1="22.76" x2="12" y2="12.2"/><line x1="12" y1="12.2" x2="20.89" y2="7.07"/><line x1="3.11" y1="7.07" x2="12" y2="12.2"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

const NavItem = ({ id, label, icon: Icon, active, onClick, collapsed, highlight = false, isDarkMode }: any) => (
  <button
    onClick={() => onClick(id)}
    title={collapsed ? label : ''}
    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${collapsed ? 'justify-center w-full' : 'w-full'} ${
      active 
        ? isDarkMode ? 'bg-white/10 text-white shadow-md border border-white/10' : 'bg-slate-900/10 text-slate-900 font-bold' 
        : highlight 
            ? 'text-red-500 hover:bg-red-500/10'
            : isDarkMode ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900'
    }`}
  >
    <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'scale-105' : ''}`}>
        <Icon />
    </div>
    {!collapsed && <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden">{label}</span>}
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
  const isDarkMode = theme === 'midnight';

  const themeStyles = {
      classic: {
          '--bg-sidebar': 'rgba(255, 255, 255, 0.85)',
          '--bg-main': '#f2f2f7',
          '--bg-card': '#ffffff',
          '--text-main': '#1c1c1e',
          '--text-muted': '#8e8e93',
          '--border-color': 'rgba(0, 0, 0, 0.1)',
          '--accent-color': '#007aff',
          '--logo-bg': '#007aff',
          '--hover-bg': 'rgba(0, 0, 0, 0.03)',
          '--input-bg': '#ffffff',
          '--sidebar-border': 'rgba(0, 0, 0, 0.08)',
          '--table-header-bg': '#f9fafb'
      },
      midnight: {
          '--bg-sidebar': 'rgba(18, 18, 20, 0.9)',
          '--bg-main': '#000000',
          '--bg-card': '#1a1a1c',
          '--text-main': '#f5f5f7',
          '--text-muted': '#a1a1a6',
          '--border-color': 'rgba(255, 255, 255, 0.12)',
          '--accent-color': '#0a84ff',
          '--logo-bg': '#0a84ff',
          '--hover-bg': 'rgba(255, 255, 255, 0.05)',
          '--input-bg': '#2c2c2e',
          '--sidebar-border': 'rgba(255, 255, 255, 0.1)',
          '--table-header-bg': '#121214'
      },
      ocean: {
          '--bg-sidebar': 'rgba(236, 254, 255, 0.85)',
          '--bg-main': '#f0f9ff',
          '--bg-card': '#ffffff',
          '--text-main': '#164e63',
          '--text-muted': '#64748b',
          '--border-color': 'rgba(207, 250, 254, 0.6)',
          '--accent-color': '#0891b2',
          '--logo-bg': '#0891b2',
          '--hover-bg': 'rgba(8, 145, 178, 0.05)',
          '--input-bg': '#ffffff',
          '--sidebar-border': 'rgba(8, 145, 178, 0.15)',
          '--table-header-bg': '#f0f9ff'
      }
  };

  const currentVars = themeStyles[theme as keyof typeof themeStyles] || themeStyles.classic;

  return (
    <div 
        className="flex h-screen overflow-hidden transition-all duration-500 ease-in-out font-sans"
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
            --table-header-bg: ${currentVars['--table-header-bg']};
            --hover-bg: ${currentVars['--hover-bg']};
        }
        body { background-color: var(--bg-main); color: var(--text-main); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif; }
        .theme-card { background-color: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); }
        .theme-text-main { color: var(--text-main); }
        .theme-text-muted { color: var(--text-muted); }
        .theme-border { border-color: var(--border-color); }
        .theme-input { background-color: var(--input-bg); color: var(--text-main); border: 1px solid var(--border-color); }
        .theme-hover:hover { background-color: var(--hover-bg); }
        .theme-bg-main { background-color: var(--bg-main); }
        .theme-bg-card { background-color: var(--bg-card); }
        .theme-bg-table-header { background-color: var(--table-header-bg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 10px; }
        
        /* Smooth transition for all standard tailwind utility color names used widely */
        .bg-white { background-color: var(--bg-card) !important; }
        .bg-gray-50 { background-color: var(--bg-main) !important; }
        .bg-slate-50 { background-color: var(--table-header-bg) !important; }
        .text-slate-900 { color: var(--text-main) !important; }
        .text-slate-800 { color: var(--text-main) !important; }
        .text-slate-700 { color: var(--text-main) !important; }
        .text-slate-600 { color: var(--text-muted) !important; }
        .text-slate-500 { color: var(--text-muted) !important; }
        .border-gray-100, .border-gray-200, .border-slate-100, .border-slate-200 { border-color: var(--border-color) !important; }
        
        /* Correcting specifically for dark inputs in Tailwind */
        input, select, textarea { 
            background-color: var(--input-bg) !important; 
            color: var(--text-main) !important; 
            border-color: var(--border-color) !important;
        }
      `}</style>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-sidebar)] backdrop-blur-xl border-b border-[var(--sidebar-border)] text-[var(--text-main)] z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">G</div>
            <span className="font-extrabold text-sm tracking-tight">Gravity</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
           {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <MotionAside 
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`
          fixed lg:static inset-y-0 left-0 bg-[var(--bg-sidebar)] backdrop-blur-2xl text-[var(--text-main)] flex flex-col flex-shrink-0 z-[45] transition-all duration-300 ease-out border-r border-[var(--sidebar-border)] shadow-sm
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'}
        `}
      >
        <div className={`p-5 flex flex-col ${isCollapsed ? 'items-center px-2' : ''}`}>
          <div className="flex justify-between items-center w-full mb-6">
              {!isCollapsed && (
                  <h1 className="text-lg font-extrabold tracking-tighter flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-slate-950 rounded-lg flex items-center justify-center text-white text-xs shadow-lg">G</div>
                    <span>Gravity</span>
                  </h1>
              )}
              {isCollapsed && (
                  <div className="w-7 h-7 bg-slate-950 rounded-lg flex items-center justify-center text-white text-xs shadow-lg mx-auto">G</div>
              )}
              {!isCollapsed && <span className="text-[10px] bg-slate-400/20 px-1.5 py-0.5 rounded-full text-slate-400 font-bold uppercase">v2.4</span>}
          </div>
          
          <div className={`flex items-center gap-2.5 bg-slate-400/10 p-2 rounded-xl border border-white/5 hover:bg-slate-400/20 transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : ''}`}>
             <div className="w-8 h-8 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 shadow-sm">
                 {user.name.charAt(0).toUpperCase()}
             </div>
             {!isCollapsed && (
                 <div className="overflow-hidden">
                     <div className="text-xs font-bold truncate leading-none mb-0.5">{user.name}</div>
                     <div className="text-[10px] text-[var(--text-muted)] font-medium capitalize">{user.role === 'admin' ? 'Administrador' : 'Comercial'}</div>
                 </div>
             )}
          </div>

          {!isCollapsed && (
              <div className="mt-6 w-full px-1">
                 <label className="text-[9px] uppercase font-black text-[var(--text-muted)] mb-2 block tracking-widest ml-1">Entorno</label>
                 <div className="relative group">
                    <select 
                        value={currentSystem}
                        onChange={(e) => onSystemChange(e.target.value as SystemType)}
                        className="w-full bg-slate-400/10 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-main)] appearance-none cursor-pointer hover:bg-slate-400/20 transition-all focus:ring-2 focus:ring-[var(--accent-color)]/20 outline-none shadow-sm"
                    >
                        <option value="agora">ÁGORA</option>
                        <option value="sage">SAGE 50</option>
                        <option value="sage200">SAGE 200</option>
                        <option value="sagedespachos">SAGE DESPACHOS</option>
                    </select>
                    <div className="absolute right-3 top-2.5 pointer-events-none text-[var(--text-muted)]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                 </div>
              </div>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto mt-2 lg:mt-0 custom-scrollbar">
          {!isCollapsed && <p className="px-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 mt-4 ml-1">Principal</p>}
          <NavItem id="dashboard" label="Dashboard" icon={ChartIcon} active={activeView === 'dashboard'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          <NavItem id="budgets" label="Nuevo Presupuesto" icon={FilePlusIcon} active={activeView === 'budgets' || activeView === 'edit-budget'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          <NavItem id="expenses" label="Gastos" icon={CreditCardIcon} active={activeView === 'expenses'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          <NavItem id="calendar" label="Calendario" icon={CalendarIcon} active={activeView === 'calendar'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          
          {!isCollapsed && <p className="px-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 mt-6 ml-1">Gestión</p>}
          {isCollapsed && <div className="my-3 border-t border-[var(--sidebar-border)] mx-4"></div>}
          
          <NavItem id="clients" label="Clientes" icon={UsersIcon} active={activeView === 'clients'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          <NavItem id="products" label="Catálogo" icon={PackageIcon} active={activeView === 'products'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          <NavItem id="pdf-customizer" label="Diseño PDF" icon={FileEditIcon} active={activeView === 'pdf-customizer'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          <NavItem id="settings" label="Ajustes" icon={SettingsIcon} active={activeView === 'settings'} onClick={handleNavClick} collapsed={isCollapsed} isDarkMode={isDarkMode} />
          
          {authService.isAdmin(user) && (
             <>
             {!isCollapsed && <p className="px-3 text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 mt-6 ml-1">Administración</p>}
             <NavItem id="admin-panel" label="Seguridad" icon={ShieldIcon} active={activeView === 'admin-panel'} onClick={handleNavClick} collapsed={isCollapsed} highlight={true} isDarkMode={isDarkMode} />
             </>
          )}
        </nav>

        <div className="p-3 border-t border-[var(--sidebar-border)] flex flex-col gap-1 mb-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-slate-400/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
             {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>

          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all group">
             <LogOutIcon /> 
             {!isCollapsed && <span className="text-xs font-bold uppercase tracking-tight group-hover:tracking-widest transition-all">Cerrar Sesión</span>}
          </button>
        </div>
      </MotionAside>

      {/* Main Content Container */}
      <MotionDiv 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 overflow-auto relative bg-[var(--bg-main)] pt-14 lg:pt-0"
      >
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          {children}
        </div>
      </MotionDiv>
    </div>
  );
};
