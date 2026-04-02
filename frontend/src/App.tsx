import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LedgerPage from './pages/LedgerPage';
import TransactionFormPage from './pages/TransactionFormPage';
import UsersPage from './pages/UsersPage';
import InsightsPage from './pages/InsightsPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

function AnalystOrAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAnalyst, loading } = useAuth();
  if (loading) return null;
  return isAdmin || isAnalyst ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route
              path="/ledger/new"
              element={
                <AdminRoute>
                  <TransactionFormPage />
                </AdminRoute>
              }
            />
            <Route
              path="/ledger/edit/:id"
              element={
                <AdminRoute>
                  <TransactionFormPage />
                </AdminRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <AnalystOrAdminRoute>
                  <InsightsPage />
                </AnalystOrAdminRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
