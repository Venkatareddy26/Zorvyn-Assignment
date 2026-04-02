import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function BottomNavBar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { path: '/', label: 'Vault', icon: 'account_balance_wallet' },
    { path: '/insights', label: 'Insights', icon: 'query_stats' },
    { path: '/ledger', label: 'Ledger', icon: 'receipt_long' },
    { path: isAdmin ? '/settings' : '#', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-white shadow-[0px_-4px_20px_rgba(13,28,46,0.04)] border-t border-slate-100/15 flex justify-around items-center px-2 pt-2 pb-6">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-200 ease-out ${
            isActive(item.path)
              ? 'bg-[#eff4ff] text-[#1A237E] rounded-xl'
              : 'text-slate-400 hover:text-[#1A237E] scale-95'
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {item.icon}
          </span>
          <span className="font-[Inter] text-[10px] font-medium uppercase tracking-wider mt-1">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
