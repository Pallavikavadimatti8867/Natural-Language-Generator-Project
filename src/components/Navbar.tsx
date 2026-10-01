import React, { useState, useRef } from 'react';
import {
  BrainCircuit,
  FileSpreadsheet,
  Sparkles,
  BarChart3,
  GitCompare,
  FileText,
  History,
  Eraser,
  BookOpen,
  LayoutDashboard,
  User,
  LogOut,
  FolderOpen,
  Upload,
  RotateCcw
} from 'lucide-react';
import { DatasetMeta, User as UserType } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dataset: DatasetMeta | null;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onLoadSample: (id: 'sales' | 'employee') => void;
  onResetDataset: () => void;
  onUploadFile: (file: File) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  dataset,
  currentUser,
  onOpenAuth,
  onLogout,
  onLoadSample,
  onResetDataset,
  onUploadFile
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [sampleDropdown, setSampleDropdown] = useState(false);
  const navFileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dataset', label: 'Dataset', icon: FileSpreadsheet },
    { id: 'cleaning', label: 'Data Cleaning', icon: Eraser },
    { id: 'statistics', label: 'EDA & Stats', icon: BarChart3 },
    { id: 'visualizations', label: 'Visualizations', icon: BarChart3 },
    { id: 'correlation', label: 'Correlation', icon: GitCompare },
    { id: 'insights', label: 'AI Insights', icon: Sparkles, badge: 'NLG' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'docs', label: 'Docs & Q&A', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                    NLG Data Science
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono hidden sm:block">Natural Language Generator</p>
              </div>
            </button>

            {/* Active Dataset Indicator & Quick Reset */}
            {dataset && (
              <div className="hidden lg:flex items-center gap-2 pl-4 ml-4 border-l border-slate-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium truncate max-w-[130px]" title={dataset.name}>
                  {dataset.name}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  ({dataset.total_rows}r, {dataset.total_columns}c)
                </span>
                {/* Reset Dataset Button in Header */}
                <button
                  onClick={onResetDataset}
                  className="ml-1 p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1 text-[11px]"
                  title="Reset / Clear current dataset"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden xl:inline">Reset</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Tools: Upload CSV & Load Sample */}
          <div className="flex items-center gap-2">
            {/* Quick Upload CSV button */}
            <button
              onClick={() => navFileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Upload new CSV or Excel file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload CSV</span>
            </button>
            <input
              ref={navFileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadFile(e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />

            {/* Quick Sample Selector */}
            <div className="relative">
              <button
                onClick={() => setSampleDropdown(!sampleDropdown)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Samples</span>
              </button>
              {sampleDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Internship Datasets
                  </div>
                  <button
                    onClick={() => {
                      onLoadSample('sales');
                      setSampleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-200 flex flex-col cursor-pointer"
                  >
                    <span className="font-medium text-indigo-300">Sales & Revenue.csv</span>
                    <span className="text-[11px] text-slate-400">30 records, products, margins, profit</span>
                  </button>
                  <button
                    onClick={() => {
                      onLoadSample('employee');
                      setSampleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-200 flex flex-col cursor-pointer"
                  >
                    <span className="font-medium text-emerald-300">Employee Attrition.csv</span>
                    <span className="text-[11px] text-slate-400">Includes missing values & duplicates</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Account / Profile & Sign Out */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-medium text-slate-200 truncate max-w-[100px]">{currentUser.name}</p>
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50">
                      <div className="pb-3 border-b border-slate-800">
                        <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                        <p className="text-xs text-slate-400 font-mono truncate">{currentUser.email}</p>
                        <p className="text-[10px] text-indigo-400 mt-1 font-mono truncate">ID: {currentUser.user_id}</p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            setActiveTab('history');
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-slate-400" /> My Saved Analyses
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onResetDataset();
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10 rounded-lg flex items-center gap-2 cursor-pointer mt-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset Current Dataset
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 mt-1 cursor-pointer font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-400" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Prominent Sign Out Button */}
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Scrollable Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
