// Shared TypeScript types for the backend

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type UserStatus = 'active' | 'inactive';
export type RecordType = 'income' | 'expense';
export type RecordStatus = 'verified' | 'pending' | 'cleared';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
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

export interface MonthlyTrend {
  month: string;
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

export interface RecordFilters {
  type?: RecordType;
  category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthPayload {
  user: UserPublic;
  token: string;
}

// Express augmentation
import { Request } from 'express';
export interface AuthRequest extends Request {
  user?: UserPublic;
}
