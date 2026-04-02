import axios from 'axios';
import type {
  ApiResponse, AuthPayload, User, FinancialRecord, DashboardSummary,
  CategoryTotal, WeeklyTrend, RecentActivity, PaginatedResponse,
  LoginCredentials, RecordFormData, UserFormData, UserStats
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// JWT token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ledger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ledger_token');
      localStorage.removeItem('ledger_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthPayload> => {
    const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/login', credentials);
    return data.data!;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data!;
  },
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return data.data!;
  },
  getTrends: async (period: 'weekly' | 'monthly' = 'weekly'): Promise<WeeklyTrend[]> => {
    const { data } = await api.get<ApiResponse<WeeklyTrend[]>>('/dashboard/trends', { params: { period } });
    return data.data!;
  },
  getCategories: async (): Promise<CategoryTotal[]> => {
    const { data } = await api.get<ApiResponse<CategoryTotal[]>>('/dashboard/categories');
    return data.data!;
  },
  getRecent: async (limit: number = 5): Promise<RecentActivity[]> => {
    const { data } = await api.get<ApiResponse<RecentActivity[]>>('/dashboard/recent', { params: { limit } });
    return data.data!;
  },
};

// Records API
export const recordsApi = {
  getAll: async (filters?: Record<string, string | number>): Promise<PaginatedResponse<FinancialRecord>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<FinancialRecord>>>('/records', { params: filters });
    return data.data!;
  },
  getById: async (id: number): Promise<FinancialRecord> => {
    const { data } = await api.get<ApiResponse<FinancialRecord>>(`/records/${id}`);
    return data.data!;
  },
  create: async (record: RecordFormData): Promise<FinancialRecord> => {
    const { data } = await api.post<ApiResponse<FinancialRecord>>('/records', record);
    return data.data!;
  },
  update: async (id: number, record: Partial<RecordFormData>): Promise<FinancialRecord> => {
    const { data } = await api.put<ApiResponse<FinancialRecord>>(`/records/${id}`, record);
    return data.data!;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/records/${id}`);
  },
  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get<ApiResponse<string[]>>('/records/categories');
    return data.data!;
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<{ users: User[]; stats: UserStats }> => {
    const { data } = await api.get<ApiResponse<{ users: User[]; stats: UserStats }>>('/users');
    return data.data!;
  },
  getById: async (id: number): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data!;
  },
  create: async (user: UserFormData): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>('/users', user);
    return data.data!;
  },
  update: async (id: number, updates: Partial<{ name: string; role: string; status: string }>): Promise<User> => {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, updates);
    return data.data!;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default api;
