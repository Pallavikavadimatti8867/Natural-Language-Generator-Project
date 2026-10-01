import { User, DatasetMeta, ColumnStats, DataQuality, CorrelationResult, InsightItem, GeneratedReport } from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem('nlg_token');
    const savedUser = localStorage.getItem('nlg_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (e) {
        this.user = null;
      }
    }
  }

  setSession(token: string, user: User) {
    this.token = token;
    this.user = user;
    localStorage.setItem('nlg_token', token);
    localStorage.setItem('nlg_user', JSON.stringify(user));
  }

  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('nlg_token');
    localStorage.removeItem('nlg_user');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Default to guest user identifier if no token
    headers['x-user-id'] = this.user ? this.user.user_id : 'guest-analyst';

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // Auth
  async register(name: string, email: string, password: string, confirm_password: string) {
    const data = await this.request<{ success: boolean; token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirm_password })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearSession();
    }
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  }

  // Upload & Datasets
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    headers['x-user-id'] = this.user ? this.user.user_id : 'guest-analyst';

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'File upload failed');
    return data as { success: boolean; dataset: DatasetMeta; preview: Record<string, any>[] };
  }

  async loadSample(sampleId: 'sales' | 'employee') {
    return this.request<{ success: boolean; dataset: DatasetMeta; preview: Record<string, any>[] }>('/load-sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId })
    });
  }

  async getDataset() {
    return this.request<{ success: boolean; dataset: DatasetMeta; preview: Record<string, any>[]; totalRows: number }>('/dataset');
  }

  async resetDataset() {
    return this.request<{ success: boolean; message: string }>('/dataset/reset', {
      method: 'POST'
    });
  }

  // Analysis & Statistics
  async runAnalysis() {
    return this.request<{
      success: boolean;
      dataset: DatasetMeta;
      statistics: Record<string, ColumnStats>;
      data_quality: DataQuality;
      correlations: CorrelationResult;
    }>('/analyze', { method: 'POST' });
  }

  async cleanDataset(action: string, params: Record<string, any> = {}) {
    return this.request<{
      success: boolean;
      message: string;
      dataset: DatasetMeta;
      preview: Record<string, any>[];
    }>('/clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, params })
    });
  }

  // NLG
  async generateInsights() {
    return this.request<{
      success: boolean;
      insights: InsightItem[];
      total_insights: number;
      dataset_name: string;
      generated_at: string;
    }>('/generate-insights', { method: 'POST' });
  }

  async generateReport() {
    return this.request<{
      success: boolean;
      report: any;
      generated_report: GeneratedReport;
    }>('/generate-report', { method: 'POST' });
  }

  // History
  async getHistory() {
    return this.request<{
      success: boolean;
      datasets: DatasetMeta[];
      reports: any[];
    }>('/history');
  }

  async deleteHistory(id: string) {
    return this.request<{ success: boolean; message: string }>(`/history/${id}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiClient();
