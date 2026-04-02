import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (preset: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      admin: { email: 'j.vance@ledger.arch', password: 'password123' },
      analyst: { email: 's.chen@ledger.arch', password: 'password123' },
      viewer: { email: 'm.thorne@partner.com', password: 'password123' },
    };
    const cred = credentials[preset];
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
    setLoading(true);
    try {
      await login(cred.email, cred.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#1A237E] font-[Manrope] tracking-tight mb-2">The Ledger</h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.3em] font-[Inter]">
            Financial Oversight Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(13,28,46,0.06)]">
          <div className="mb-8">
            <h2 className="text-xl font-bold font-[Manrope] text-on-surface">Sign In</h2>
            <p className="text-sm text-on-surface-variant mt-1">Access your financial dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container/30 border border-error/20 rounded-xl flex items-center gap-3 animate-scale-in">
              <span className="material-symbols-outlined text-error text-lg">error</span>
              <p className="text-sm text-error font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-[Inter]">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-0 rounded-xl text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="you@ledger.arch"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-[Inter]">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-0 rounded-xl text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-[Manrope] font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-outline-variant/20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 text-center">
              Quick Access — Demo Accounts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => quickLogin('admin')}
                disabled={loading}
                className="flex-1 py-3 px-3 rounded-xl bg-primary-fixed text-on-primary-fixed text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition-all disabled:opacity-50"
              >
                Admin
              </button>
              <button
                onClick={() => quickLogin('analyst')}
                disabled={loading}
                className="flex-1 py-3 px-3 rounded-xl bg-surface-container-high text-on-primary-fixed-variant text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition-all disabled:opacity-50"
              >
                Analyst
              </button>
              <button
                onClick={() => quickLogin('viewer')}
                disabled={loading}
                className="flex-1 py-3 px-3 rounded-xl bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition-all disabled:opacity-50"
              >
                Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
