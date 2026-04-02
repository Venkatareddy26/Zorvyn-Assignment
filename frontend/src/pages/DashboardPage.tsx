import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { DashboardSummary, WeeklyTrend, RecentActivity, CategoryTotal } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  'Treasury': 'account_balance',
  'Operations': 'shopping_cart',
  'Payroll': 'payments',
  'Salary': 'payments',
  'Housing': 'home',
  'Lifestyle': 'shopping_basket',
  'Investments': 'trending_up',
  'Consulting': 'work',
  'Software': 'code',
  'Marketing': 'campaign',
  'Travel': 'flight',
  'Utilities': 'bolt',
};

const STATUS_LABELS: Record<string, string> = {
  'verified': 'Verified',
  'pending': 'Pending',
  'cleared': 'Cleared',
};

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<WeeklyTrend[]>([]);
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  const [categories, setCategories] = useState<CategoryTotal[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, r, c] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getTrends(period),
          dashboardApi.getRecent(5),
          dashboardApi.getCategories(),
        ]);
        setSummary(s);
        setTrends(t);
        setRecent(r);
        setCategories(c);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

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
    <div className="animate-fade-in">
      {/* Hero Section: Net Balance */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-slate-500 font-[Inter] text-xs font-bold uppercase tracking-widest mb-1">
              Portfolio Valuation
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 font-[Manrope] text-2xl font-light">$</span>
              <h1 className="text-5xl md:text-7xl font-bold text-on-background font-[Manrope] tracking-tighter">
                {summary ? Math.floor(summary.net_balance).toLocaleString() + '.00' : '0.00'}
              </h1>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-white p-4 rounded-xl shadow-[0px_20px_40px_rgba(13,28,46,0.04)]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Income</p>
              <div className="flex items-center gap-2">
                <span className="text-secondary font-bold font-[Manrope] text-xl">
                  +{formatCurrency(summary?.total_income || 0)}
                </span>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-lg font-bold">
                  +12%
                </span>
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-white p-4 rounded-xl shadow-[0px_20px_40px_rgba(13,28,46,0.04)]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Expense</p>
              <div className="flex items-center gap-2">
                <span className="text-error font-bold font-[Manrope] text-xl">
                  -{formatCurrency(summary?.total_expenses || 0)}
                </span>
                <span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded-lg font-bold">
                  -4%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chart Section */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-[Manrope] text-xl font-bold text-on-surface">
                {period === 'weekly' ? 'Weekly Liquidity Trend' : 'Monthly Trend'}
              </h3>
              <p className="text-sm text-slate-500">Aggregated net flow across all enterprise vaults</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  period === 'weekly'
                    ? 'bg-white text-on-surface shadow-sm'
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  period === 'monthly'
                    ? 'bg-white text-on-surface shadow-sm'
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6eeff" />
                <XAxis
                  dataKey={period === 'weekly' ? 'day' : 'month'}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8', fontFamily: 'Inter' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a237e',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                />
                <Bar dataKey="income" fill="#1b6b51" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#000666" radius={[6, 6, 0, 0]} opacity={0.15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Audit Trail */}
          <div className="flex justify-between items-center px-2">
            <h3 className="font-[Manrope] text-lg font-bold text-on-surface">Audit Trail</h3>
            <Link to="/ledger" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recent.map((item) => (
              <div
                key={item.id}
                className="group bg-white p-5 rounded-xl shadow-[0px_4px_20px_rgba(13,28,46,0.02)] hover:shadow-[0px_10px_30px_rgba(13,28,46,0.06)] transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {CATEGORY_ICONS[item.category] || 'receipt_long'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface">{item.category}</p>
                  <p className="text-[11px] text-slate-400 font-[Inter] uppercase tracking-wider truncate">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold font-[Manrope] ${item.type === 'income' ? 'text-secondary' : 'text-error'}`}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-[Inter]">{STATUS_LABELS[item.status]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {isAdmin && (
            <div className="bg-primary p-6 rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-white font-[Manrope] text-lg font-bold mb-1">Administrative Actions</h4>
                <p className="text-white/60 text-xs mb-4">Quick access to governance controls</p>
                <div className="flex gap-2">
                  <Link
                    to="/ledger/new"
                    className="bg-white text-primary px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    New Ledger
                  </Link>
                  <button className="bg-primary-container text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-primary-container/80 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">file_export</span>
                    Export
                  </button>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
          )}

          {/* Category Breakdown */}
          {(incomeCategories.length > 0 || expenseCategories.length > 0) && (
            <div className="bg-surface-container-low p-6 rounded-xl">
              <h4 className="font-[Manrope] font-bold text-on-surface mb-4">Category Breakdown</h4>
              <div className="space-y-3">
                {[...incomeCategories, ...expenseCategories].slice(0, 6).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-outline">
                        {CATEGORY_ICONS[cat.category] || 'category'}
                      </span>
                      <span className="text-xs font-medium text-on-surface">{cat.category}</span>
                    </div>
                    <span className={`text-xs font-bold ${cat.type === 'income' ? 'text-secondary' : 'text-on-surface'}`}>
                      {cat.type === 'income' ? '+' : '-'}{formatCurrency(cat.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
