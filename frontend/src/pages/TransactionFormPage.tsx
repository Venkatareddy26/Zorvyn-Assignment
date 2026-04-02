import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recordsApi } from '../services/api';
import type { RecordType, RecordStatus } from '../types';

const CATEGORIES = [
  'Treasury', 'Operations', 'Payroll', 'Salary', 'Housing',
  'Lifestyle', 'Investments', 'Consulting', 'Software',
  'Marketing', 'Travel', 'Utilities', 'Other',
];

export default function TransactionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [type, setType] = useState<RecordType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Treasury');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<RecordStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      recordsApi.getById(parseInt(id))
        .then((record) => {
          setType(record.type);
          setAmount(record.amount.toString());
          setCategory(record.category);
          setDate(record.date);
          setNotes(record.notes || '');
          setStatus(record.status);
        })
        .catch((err) => {
          setError('Failed to load record');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError('');
    setError('');

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid amount for this record.');
      return;
    }

    setSaving(true);
    try {
      const data = { amount: numAmount, type, category, date, notes, status };
      if (isEdit && id) {
        await recordsApi.update(parseInt(id), data);
      } else {
        await recordsApi.create(data);
      }
      navigate('/ledger');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="font-[Inter] text-[10px] uppercase tracking-widest font-semibold">Ledger</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-[Inter] text-[10px] uppercase tracking-widest font-semibold">
            {isEdit ? 'Transaction Edit' : 'New Transaction'}
          </span>
        </div>
        <h1 className="font-[Manrope] text-3xl font-bold tracking-tight text-primary">
          {isEdit ? `Edit Transaction #${id}` : 'New Transaction'}
        </h1>
        <p className="text-on-surface-variant mt-1">
          {isEdit ? 'Modify record details for your financial audit trail.' : 'Create a new financial record.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/30 border border-error/20 rounded-xl flex items-center gap-3 animate-scale-in">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 order-2 lg:order-1 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <h3 className="font-[Manrope] font-bold text-primary mb-3">Audit Requirements</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Ensure the amount matches the physical receipt. Categorization affects your monthly 'Insights' report accuracy.
            </p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl border border-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-on-primary-container">history</span>
              </div>
              <span className="font-[Manrope] font-bold text-sm">Record Info</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Status: <span className="font-bold capitalize">{status}</span>
            </p>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Type: <span className="font-bold capitalize">{type}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(13,28,46,0.04)]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Type Toggle */}
              <div className="space-y-3">
                <label className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Transaction Type
                </label>
                <div className="inline-flex p-1 bg-surface-container rounded-xl w-full">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                      type === 'income'
                        ? 'bg-secondary text-white shadow-lg font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">trending_up</span>
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                      type === 'expense'
                        ? 'bg-primary text-white shadow-lg font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">trending_down</span>
                    Expense
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-3">
                <label className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-[Manrope] text-2xl font-bold">$</div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setAmountError(''); }}
                    className={`w-full font-[Manrope] text-4xl font-bold pl-12 pr-6 py-6 rounded-xl focus:ring-0 transition-all text-primary placeholder:text-primary/20 border-2 focus:outline-none ${
                      amountError
                        ? 'bg-error-container/20 border-error focus:border-error'
                        : 'bg-surface-container-high border-transparent focus:border-primary'
                    }`}
                    placeholder="0.00"
                    required
                  />
                  {amountError && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-error gap-1">
                      <span className="material-symbols-outlined text-xl">error</span>
                      <span className="text-xs font-bold font-[Inter]">Required</span>
                    </div>
                  )}
                </div>
                {amountError && (
                  <p className="text-error text-xs font-medium px-1">{amountError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-3">
                  <label className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface-container-high border-0 py-4 px-4 rounded-xl appearance-none text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-3">
                  <label className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Transaction Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-surface-container-high border-0 py-4 px-4 rounded-xl text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <label className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Status
                </label>
                <div className="inline-flex p-1 bg-surface-container rounded-xl">
                  {(['pending', 'verified', 'cleared'] as RecordStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                        status === s
                          ? 'bg-white text-on-surface shadow-sm'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <label className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Transaction Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-container-high border-0 p-4 rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-primary transition-all resize-none focus:outline-none"
                  placeholder="Add specific details about this record..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-[Manrope] font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      {isEdit ? 'Save Record' : 'Create Record'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/ledger')}
                  className="w-full sm:w-auto px-10 py-4 border-2 border-outline-variant text-on-surface font-[Manrope] font-bold rounded-xl hover:bg-surface-container-low active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">close</span>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
