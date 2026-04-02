import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';

export default function TopAppBar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Vault', icon: 'account_balance_wallet' },
    { path: '/insights', label: 'Insights', icon: 'query_stats' },
    { path: '/ledger', label: 'Ledger', icon: 'receipt_long' },
    ...(isAdmin ? [{ path: '/settings', label: 'Settings', icon: 'settings' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-[#f8f9ff] flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-4">
        {user?.avatar_url && (
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-surface-container-high">
            <img
              alt={user.name}
              className="w-full h-full object-cover"
              src={user.avatar_url}
            />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xl font-bold text-[#1A237E] font-[Manrope] tracking-tight">The Ledger</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] font-[Inter]">Financial Oversight</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-[#1A237E] bg-[#eff4ff] font-bold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Role Badge */}
          {user && (
            <div className="hidden sm:flex bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-[11px] font-bold font-[Inter] tracking-wide items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          )}

          <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button
            onClick={logout}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
