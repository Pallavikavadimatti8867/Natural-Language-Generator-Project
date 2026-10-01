import fs from 'fs';
import path from 'path';

export interface User {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  registration_date: string;
  last_login: string;
}

export interface DatasetMeta {
  id: string;
  user_id: string;
  name: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  numerical_columns: string[];
  categorical_columns: string[];
  missing_values: number;
  duplicate_records: number;
  uploaded_at: string;
}

export interface StoredReport {
  report_id: string;
  user_id: string;
  dataset_id: string;
  title: string;
  dataset_meta: DatasetMeta;
  data_quality: any;
  statistics: any;
  correlations: any;
  key_insights: any;
  executive_summary: string;
  ai_recommendations: string[];
  created_at: string;
}

export interface ActiveDataset {
  meta: DatasetMeta;
  data: Record<string, any>[];
  cleaned_data?: Record<string, any>[];
}

class DatabaseStore {
  private users: User[] = [];
  private datasets: DatasetMeta[] = [];
  private reports: StoredReport[] = [];
  private activeDatasets: Map<string, ActiveDataset> = new Map();
  private dbFilePath = path.resolve(process.cwd(), 'data_store.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.users = parsed.users || [];
        this.datasets = parsed.datasets || [];
        this.reports = parsed.reports || [];
      }
    } catch (e) {
      console.error('Error loading data_store.json:', e);
    }
  }

  private saveToDisk() {
    try {
      const data = {
        users: this.users,
        datasets: this.datasets,
        reports: this.reports
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data_store.json:', e);
    }
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(userId: string): User | undefined {
    return this.users.find(u => u.user_id === userId);
  }

  createUser(user: User): User {
    this.users.push(user);
    this.saveToDisk();
    return user;
  }

  updateUserLogin(userId: string) {
    const user = this.getUserById(userId);
    if (user) {
      user.last_login = new Date().toISOString();
      this.saveToDisk();
    }
  }

  // Active Datasets in memory
  setActiveDataset(userId: string, meta: DatasetMeta, data: Record<string, any>[]) {
    this.activeDatasets.set(userId, { meta, data, cleaned_data: data });
    // also persist meta in datasets list if not already present
    const existingIdx = this.datasets.findIndex(d => d.id === meta.id && d.user_id === userId);
    if (existingIdx >= 0) {
      this.datasets[existingIdx] = meta;
    } else {
      this.datasets.push(meta);
    }
    this.saveToDisk();
  }

  getActiveDataset(userId: string): ActiveDataset | undefined {
    return this.activeDatasets.get(userId);
  }

  clearActiveDataset(userId: string) {
    this.activeDatasets.delete(userId);
  }

  updateActiveCleanedData(userId: string, cleanedData: Record<string, any>[], updatedMeta: DatasetMeta) {
    const active = this.activeDatasets.get(userId);
    if (active) {
      active.cleaned_data = cleanedData;
      active.meta = updatedMeta;
      const idx = this.datasets.findIndex(d => d.id === updatedMeta.id && d.user_id === userId);
      if (idx >= 0) {
        this.datasets[idx] = updatedMeta;
      }
      this.saveToDisk();
    }
  }

  // Reports
  createReport(report: StoredReport): StoredReport {
    this.reports.push(report);
    this.saveToDisk();
    return report;
  }

  getUserReports(userId: string): StoredReport[] {
    return this.reports.filter(r => r.user_id === userId);
  }

  getUserDatasets(userId: string): DatasetMeta[] {
    return this.datasets.filter(d => d.user_id === userId);
  }

  deleteHistoryItem(userId: string, id: string): boolean {
    const prevReportsCount = this.reports.length;
    this.reports = this.reports.filter(r => !(r.report_id === id && r.user_id === userId));

    const prevDatasetCount = this.datasets.length;
    this.datasets = this.datasets.filter(d => !(d.id === id && d.user_id === userId));

    const deleted = this.reports.length < prevReportsCount || this.datasets.length < prevDatasetCount;
    if (deleted) {
      this.saveToDisk();
    }
    return deleted;
  }
}

export const dbStore = new DatabaseStore();
