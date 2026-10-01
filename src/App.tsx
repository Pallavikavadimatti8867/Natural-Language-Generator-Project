import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { DatasetView } from './components/DatasetView';
import { DataCleaningView } from './components/DataCleaningView';
import { StatisticsView } from './components/StatisticsView';
import { VisualizationView } from './components/VisualizationView';
import { CorrelationView } from './components/CorrelationView';
import { InsightsView } from './components/InsightsView';
import { ReportView } from './components/ReportView';
import { HistoryView } from './components/HistoryView';
import { DocumentationView } from './components/DocumentationView';
import { api } from './services/api';
import {
  DatasetMeta,
  ColumnStats,
  DataQuality,
  CorrelationResult,
  InsightItem,
  GeneratedReport,
  User
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(api.getUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Analytical state
  const [dataset, setDataset] = useState<DatasetMeta | null>(null);
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [stats, setStats] = useState<Record<string, ColumnStats> | null>(null);
  const [quality, setQuality] = useState<DataQuality | null>(null);
  const [correlations, setCorrelations] = useState<CorrelationResult | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [report, setReport] = useState<GeneratedReport | null>(null);

  // History state
  const [historyDatasets, setHistoryDatasets] = useState<DatasetMeta[]>([]);
  const [historyReports, setHistoryReports] = useState<any[]>([]);

  // UI & notification state
  const [loading, setLoading] = useState(false);
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Initialize sample data on load for immediate interactive experience
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const res = await api.loadSample('sales');
      if (res && res.dataset) {
        setDataset(res.dataset);
        setPreview(res.preview);
        await runAnalysisPipeline();
      }
    } catch (e) {
      console.warn('Initial sample load notice:', e);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysisPipeline = async () => {
    try {
      const res = await api.runAnalysis();
      if (res.success) {
        setStats(res.statistics);
        setQuality(res.data_quality);
        setCorrelations(res.correlations);
        setDataset(res.dataset);

        // Also generate natural language insights
        const insRes = await api.generateInsights();
        if (insRes.success) {
          setInsights(insRes.insights);
        }
      }
    } catch (e) {
      console.error('Error running analytical pipeline:', e);
    }
  };

  const handleUploadFile = async (file: File) => {
    setLoading(true);
    setCleanMessage(null);
    try {
      const res = await api.uploadFile(file);
      setDataset(res.dataset);
      setPreview(res.preview);
      await runAnalysisPipeline();
      showToast(`Dataset "${res.dataset.name}" successfully uploaded and analyzed!`, 'success');
      setActiveTab('dataset');
    } catch (e: any) {
      showToast(`Upload failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDataset = async () => {
    setLoading(true);
    try {
      await api.resetDataset();
    } catch (e) {
      console.warn('Reset notice:', e);
    }
    setDataset(null);
    setPreview([]);
    setStats(null);
    setQuality(null);
    setCorrelations(null);
    setInsights([]);
    setReport(null);
    setCleanMessage(null);
    setLoading(false);
    showToast('Dataset has been reset. You can now upload a new CSV or load a sample.', 'info');
  };

  const handleLoadSample = async (id: 'sales' | 'employee') => {
    setLoading(true);
    setCleanMessage(null);
    try {
      const res = await api.loadSample(id);
      setDataset(res.dataset);
      setPreview(res.preview);
      await runAnalysisPipeline();
      showToast(`Sample dataset "${res.dataset.name}" loaded successfully.`, 'success');
    } catch (e: any) {
      showToast(`Failed to load sample: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanAction = async (action: string, params: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res = await api.cleanDataset(action, params);
      setCleanMessage(res.message);
      setDataset(res.dataset);
      setPreview(res.preview);
      await runAnalysisPipeline();
      showToast(res.message, 'success');
    } catch (e: any) {
      setCleanMessage(`Error: ${e.message}`);
      showToast(`Data cleaning error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    setLoading(true);
    try {
      const res = await api.generateInsights();
      if (res.success) {
        setInsights(res.insights);
        showToast('Natural language insights updated!', 'success');
      }
    } catch (e: any) {
      showToast(`Insight generation error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await api.generateReport();
      if (res.success) {
        setReport(res.generated_report);
        loadHistory();
        showToast('Executive analysis report generated successfully!', 'success');
      }
    } catch (e: any) {
      showToast(`Report generation failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.getHistory();
      if (res.success) {
        setHistoryDatasets(res.datasets || []);
        setHistoryReports(res.reports || []);
      }
    } catch (e) {
      console.error('Failed to load user history:', e);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await api.deleteHistory(id);
      loadHistory();
      showToast('Item removed from history.', 'info');
    } catch (e) {
      console.error('Delete history error:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    setCurrentUser(null);
    await handleResetDataset();
    setActiveTab('dashboard');
    showToast('Signed out successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3.5 text-xs flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
            <span className="text-slate-200 font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataset={dataset}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onLoadSample={handleLoadSample}
        onResetDataset={handleResetDataset}
        onUploadFile={handleUploadFile}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            dataset={dataset}
            quality={quality}
            stats={stats}
            onNavigate={setActiveTab}
            onUploadFile={handleUploadFile}
            onLoadSample={handleLoadSample}
            onRunAnalysis={runAnalysisPipeline}
            onResetDataset={handleResetDataset}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetView
            dataset={dataset}
            preview={preview}
            onUploadFile={handleUploadFile}
            onLoadSample={handleLoadSample}
            onResetDataset={handleResetDataset}
          />
        )}

        {activeTab === 'cleaning' && (
          <DataCleaningView
            dataset={dataset}
            preview={preview}
            onCleanAction={handleCleanAction}
            loading={loading}
            cleanMessage={cleanMessage}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            dataset={dataset}
            stats={stats}
            quality={quality}
            onRunAnalysis={runAnalysisPipeline}
            loading={loading}
          />
        )}

        {activeTab === 'visualizations' && (
          <VisualizationView
            dataset={dataset}
            preview={preview}
            correlations={correlations}
          />
        )}

        {activeTab === 'correlation' && (
          <CorrelationView
            dataset={dataset}
            correlations={correlations}
            onNavigateVisualizations={() => setActiveTab('visualizations')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            dataset={dataset}
            insights={insights}
            onGenerateInsights={handleGenerateInsights}
            loading={loading}
          />
        )}

        {activeTab === 'reports' && (
          <ReportView
            report={report}
            dataset={dataset}
            onGenerateReport={handleGenerateReport}
            loading={loading}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            datasets={historyDatasets}
            reports={historyReports}
            onDelete={handleDeleteHistory}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'docs' && <DocumentationView />}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          loadHistory();
          showToast(`Welcome back, ${user.name}!`, 'success');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Natural Language Generator for Data Analysis</span>
            <span>•</span>
            <span>Internship-Level Data Science Project</span>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('docs')}
              className="hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Documentation & Q&A
            </button>
            <span>•</span>
            <button
              onClick={() => handleLoadSample('sales')}
              className="hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Sales Data
            </button>
            <span>•</span>
            <button
              onClick={() => handleLoadSample('employee')}
              className="hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Attrition Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
