import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  GitCompare,
  Layers,
  Gauge,
  Car,
  Clock,
  CloudRain,
  AlertTriangle,
  Navigation,
  Activity,
  ShieldAlert,
  Calculator,
  Network,
  MapPin,
  Table,
  CheckCircle2,
  BookOpen,
  FileText
} from 'lucide-react';
import { TabId } from '../../types/dashboard';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Core' },
  { id: 'congestion', label: 'Congestion Analysis', icon: TrendingUp, group: 'Core' },
  { id: 'city-comparison', label: 'City Comparison', icon: GitCompare, group: 'Core' },
  
  { id: 'traffic-volume-density', label: 'Volume & Density', icon: Layers, group: 'Mobility' },
  { id: 'speed-travel-time', label: 'Speed & Travel Time', icon: Gauge, group: 'Mobility' },
  { id: 'vehicle-analysis', label: 'Vehicle Analysis', icon: Car, group: 'Mobility' },
  { id: 'time-of-day', label: 'Time of Day', icon: Clock, group: 'Mobility' },
  
  { id: 'weather-rainfall', label: 'Weather & Rainfall', icon: CloudRain, group: 'Environment & Road' },
  { id: 'road-condition', label: 'Road Condition', icon: AlertTriangle, group: 'Environment & Road' },
  { id: 'infrastructure', label: 'Infrastructure', icon: Navigation, group: 'Environment & Road' },
  { id: 'traffic-signals', label: 'Traffic Signals', icon: Activity, group: 'Environment & Road' },
  { id: 'road-safety', label: 'Road Safety', icon: ShieldAlert, group: 'Safety & Burden' },
  { id: 'edi-analysis', label: 'EDI Analysis', icon: Calculator, group: 'Safety & Burden' },
  { id: 'correlation', label: 'Correlation Matrix', icon: Network, group: 'Safety & Burden' },
  { id: 'india-map', label: 'India Map', icon: MapPin, group: 'Geo & Data' },
  
  { id: 'data-explorer', label: 'Data Explorer', icon: Table, group: 'Geo & Data' },
  { id: 'data-quality', label: 'Data Quality', icon: CheckCircle2, group: 'Governance' },
  { id: 'sources', label: 'Sources & Provenance', icon: BookOpen, group: 'Governance' },
  { id: 'data-dictionary', label: 'Data Dictionary', icon: FileText, group: 'Governance' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-[61px] bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-[calc(100vh-61px)] shrink-0 overflow-y-auto`}
      >
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Analytical Modules
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            19 Datasets
          </span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Academic provenance footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
          <div className="flex items-center justify-between font-mono">
            <span>Coverage:</span>
            <span className="text-slate-200">2015 – 2025</span>
          </div>
          <div className="flex items-center justify-between mt-1 font-mono">
            <span>Primary Source:</span>
            <span className="text-brand-400">TomTom / MoRTH</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
            Empirical Real-Data Platform
          </div>
        </div>
      </aside>
    </>
  );
};
