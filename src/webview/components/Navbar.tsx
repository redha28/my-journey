import React from 'react';
import { Calendar as CalendarIcon, BarChart3, Clock, Plus, FileText, User } from 'lucide-react';
import { KITSUNE_BASE64 } from '../assets/kitsune_b64';

export type ActiveTab = 'timeline' | 'calendar' | 'analytics' | 'profile';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTask: () => void;
  onOpenExport: () => void;
  totalItemsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTask,
  onOpenExport
}) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/80 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/10 overflow-hidden">
            <img src={KITSUNE_BASE64} alt="Kitsune" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">My Journey</h1>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v0.1
              </span>
            </div>
            <p className="text-xs text-zinc-400">Worklog, MR & Jira Assistant</p>
          </div>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Kalender
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Weekly Bar Chart
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenExport}
              title="Export ke Jira & Standup"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Jira & Standup</span>
            </button>

            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-blue-600/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Tambah Task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
