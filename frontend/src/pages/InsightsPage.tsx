import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '../services/api';
import type { DashboardSummary, CategoryTotal } from '../types';

const COLORS = ['#1a237e', '#1b6b51', '#4c56af', '#237157', '#343d96', '#8bd6b6', '#bdc2ff', '#66001a'];

export default function InsightsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryTotal[]>([]);
  const [monthly, setMonthly] = useState<Array<{ month?: string; day?: string; income: number; expense: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, c, m] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getCategories(),
          dashboardApi.getTrends('monthly'),
        ]);
        setSummary(s);
        setCategories(c);
        setMonthly(m);
      } catch (err) {
        console.error('Insights fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-10">
        <h1 className="text-4xl font-[Manrope] font-extrabold text-primary tracking-tight">Insights</h1>
        <p className="text-on-surface-variant mt-1">Financial analytics and trend analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(13,28,46,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Income</p>
          <p className="text-2xl font-[Manrope] font-bold text-secondary">{formatCurrency(summary?.total_income || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(13,28,46,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Expenses</p>
          <p className="text-2xl font-[Manrope] font-bold text-error">{formatCurrency(summary?.total_expenses || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(13,28,46,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Net Balance</p>
          <p className="text-2xl font-[Manrope] font-bold text-primary">{formatCurrency(summary?.net_balance || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(13,28,46,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Records</p>
          <p className="text-2xl font-[Manrope] font-bold text-on-surface">{summary?.record_count || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-8">
          <h3 className="font-[Manrope] text-xl font-bold text-on-surface mb-6">Monthly Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6eeff" />
                <XAxis dataKey={monthly[0]?.month ? "month" : "day"} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a237e', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                />
                <Bar dataKey="income" fill="#1b6b51" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ba1a1a" radius={[6, 6, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie */}
        <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-8">
          <h3 className="font-[Manrope] text-xl font-bold text-on-surface mb-6">Expense Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseCategories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {expenseCategories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a237e', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {expenseCategories.map((cat, i) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-on-surface">{cat.category}</span>
                </div>
                <span className="font-bold text-on-surface">{formatCurrency(cat.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income Sources */}
      {incomeCategories.length > 0 && (
        <div className="mt-8 bg-surface-container-low rounded-xl p-8">
          <h3 className="font-[Manrope] text-xl font-bold text-on-surface mb-6">Income Sources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {incomeCategories.map((cat) => (
              <div key={cat.category} className="bg-white p-5 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{cat.category}</p>
                <p className="text-xl font-[Manrope] font-bold text-secondary">{formatCurrency(cat.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
