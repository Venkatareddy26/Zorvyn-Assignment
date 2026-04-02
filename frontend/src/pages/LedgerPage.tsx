import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recordsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { FinancialRecord, RecordType } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  'Treasury': 'account_balance', 'Operations': 'shopping_cart', 'Payroll': 'payments',
  'Salary': 'payments', 'Housing': 'home', 'Lifestyle': 'shopping_basket',
  'Investments': 'trending_up', 'Consulting': 'work', 'Software': 'code',
  'Marketing': 'campaign', 'Travel': 'flight', 'Utilities': 'bolt',
};

const CATEGORY_COLORS: Record<string, string> = {
  income: 'bg-secondary-container text-on-secondary-container',
  expense_housing: 'bg-primary-fixed text-on-primary-fixed',
  expense_lifestyle: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  expense_default: 'bg-surface-container-high text-on-surface-variant',
};

function getCategoryColor(type: RecordType, category: string) {
  if (type === 'income') return CATEGORY_COLORS.income;
  if (category === 'Housing') return CATEGORY_COLORS.expense_housing;
  if (category === 'Lifestyle' || category === 'Travel') return CATEGORY_COLORS.expense_lifestyle;
  return CATEGORY_COLORS.expense_default;
}

export default function LedgerPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string | number> = { page, limit: 10 };
      if (typeFilter) filters.type = typeFilter;
      if (categoryFilter) filters.category = categoryFilter;
      if (search) filters.search = search;

      const result = await recordsApi.getAll(filters);
      setRecords(result.data);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, categoryFilter, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    recordsApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await recordsApi.delete(id);
      setDeleteId(null);
      fetchRecords();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  return (
    <div className="animate-fade-in mb-24">
      {/* Search & Filter */}
      <section className="space-y-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full pl-12 pr-4 py-4 bg-white rounded-full border-none focus:ring-2 focus:ring-primary shadow-[0px_4px_20px_rgba(13,28,46,0.03)] text-sm font-medium placeholder:text-outline-variant focus:outline-none"
              placeholder="Search transactions, notes, or categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">{total} records</span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setTypeFilter(typeFilter === 'income' ? '' : 'income'); setPage(1); }}
            className={`px-5 py-2 rounded-full font-[Manrope] font-bold text-xs tracking-wider flex items-center gap-2 transition-colors ${
              typeFilter === 'income'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            Income
            {typeFilter === 'income' && <span className="material-symbols-outlined text-xs">check</span>}
          </button>
          <button
            onClick={() => { setTypeFilter(typeFilter === 'expense' ? '' : 'expense'); setPage(1); }}
            className={`px-5 py-2 rounded-full font-[Manrope] font-bold text-xs tracking-wider flex items-center gap-2 transition-colors ${
              typeFilter === 'expense'
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            Expense
            {typeFilter === 'expense' && <span className="material-symbols-outlined text-xs">check</span>}
          </button>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="appearance-none px-5 py-2 pr-8 rounded-full bg-surface-container-high text-on-surface-variant font-[Manrope] font-bold text-xs tracking-wider border-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </section>

      {/* Transaction Table */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-surface-container text-outline text-[11px] font-bold uppercase tracking-[0.15em] font-[Inter]">
          <div className="col-span-4">Category & Details</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Notes</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">receipt_long</span>
            <p className="text-sm text-slate-400 font-medium">No records found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/50">
            {records.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-6 hover:bg-surface-container transition-colors items-center"
              >
                <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(record.type, record.category)}`}>
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {CATEGORY_ICONS[record.category] || 'receipt_long'}
                    </span>
                  </div>
                  <div>
                    <p className="font-[Manrope] font-bold text-on-surface">{record.category}</p>
                    <p className="text-[10px] font-[Inter] font-medium uppercase tracking-wider text-outline">
                      {record.type === 'income' ? 'Income' : 'Expense'}
                    </p>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 text-sm text-on-surface-variant">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </div>
                <div className="col-span-1 md:col-span-3 text-sm text-on-surface-variant truncate">
                  {record.notes || '—'}
                </div>
                <div className="col-span-1 md:col-span-2 text-right">
                  <p className={`font-[Inter] font-bold text-lg tabular-nums ${
                    record.type === 'income' ? 'text-secondary' : 'text-on-surface'
                  }`}>
                    {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-1 flex justify-end gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => navigate(`/ledger/edit/${record.id}`)}
                        className="p-2 hover:bg-white rounded-lg text-outline-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteId(record.id)}
                        className="p-2 hover:bg-white rounded-lg text-outline-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white text-on-surface font-bold text-sm disabled:opacity-30 hover:bg-surface-container-high transition-colors shadow-sm"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-white text-on-surface font-bold text-sm disabled:opacity-30 hover:bg-surface-container-high transition-colors shadow-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* FAB */}
      {isAdmin && (
        <Link
          to="/ledger/new"
          className="fixed right-8 bottom-28 md:bottom-12 w-16 h-16 rounded-full bg-primary text-white shadow-[0px_20px_40px_rgba(13,28,46,0.2)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[60]"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </Link>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] px-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl p-8 max-w-sm w-full animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-error">delete</span>
              </div>
              <h3 className="font-[Manrope] font-bold text-lg">Delete Record</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">
              Are you sure you want to delete this record? This action uses soft-delete and can be reversed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-2.5 rounded-xl border-2 border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-6 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
