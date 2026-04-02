export type UserRole = 'admin' | 'analyst' | 'viewer';
export type UserStatus = 'active' | 'inactive';
export type RecordType = 'income' | 'expense';
export type RecordStatus = 'verified' | 'pending' | 'cleared';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecord {
  id: number;
  user_id: number;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes: string;
  status: RecordStatus;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  record_count: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  type: RecordType;
}

export interface WeeklyTrend {
  day: string;
  income: number;
  expense: number;
}

export interface RecentActivity {
  id: number;
  category: string;
  amount: number;
  type: RecordType;
  date: string;
  status: RecordStatus;
  notes: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface RecordFormData {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes: string;
  status: RecordStatus;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserStats {
  active: number;
  inactive: number;
  total: number;
  by_role: Record<string, number>;
}
