import React from 'react';
import { LayoutDashboard, Map as MapIcon, Route, AlertTriangle, FileText, Users, Settings, HelpCircle, User, ShieldAlert, Navigation } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAccessibility: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenAccessibility, onOpenAdmin, isAdmin }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Explore Map', icon: MapIcon },
    { id: 'routes', label: 'Accessible Routes', icon: Route },
    { id: 'report', label: 'Report an Issue', icon: AlertTriangle },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'community', label: 'Community', icon: Users },
  ];

  const bottomItems = [
    { id: 'accessibility', label: 'Accessibility Settings', icon: Settings, action: onOpenAccessibility },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'profile', label: 'User Profile', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldAlert, action: onOpenAdmin }] : []),
  ];

  return (
    <aside className="w-64 bg-[#0B1220]/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 shrink-0 hidden md:flex">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            AccessMap <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-[10px] text-cyan-300 font-medium tracking-wider uppercase">Mangaluru, Karnataka</p>
        </div>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/90 to-blue-700/80 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preferences</div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action ? item.action : () => setActiveTab(item.id)}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <Icon className="w-5 h-5 text-slate-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Tagline Badge */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-center">
        <p className="text-xs font-semibold text-blue-300">Mangalore City Network</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Real-time AI obstacle verification</p>
      </div>
    </aside>
  );
};
