import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Billing } from './pages/Billing';
import { Inventory } from './pages/Inventory';
import { Services } from './pages/Services';
import { Staff } from './pages/Staff';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';

// Auth & Admin Pages
import { Login } from './pages/auth/Login';
import { SuperAdminPanel } from './pages/superadmin/SuperAdminPanel';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleGuard, AccessDenied } from './routes/RoleGuard';

// Context Providers
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { useAuth } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Role-based redirect component
function RoleBasedRedirect() {
  const { session, getRoleRedirectPath } = useAuth();
  const target = session ? getRoleRedirectPath(session.role) : '/login';
  return <Navigate to={target} replace />;
}

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <StoreProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes with Layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Default redirect based on role */}
                <Route index element={<RoleBasedRedirect />} />
                
                {/* Dashboard - Accessible by all roles */}
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Regular pages - Accessible by admin and staff */}
                <Route path="patients" element={
                  <RoleGuard allowedRoles={['admin', 'staff']}>
                    <Patients />
                  </RoleGuard>
                } />
                <Route path="appointments" element={
                  <RoleGuard allowedRoles={['admin', 'staff']}>
                    <Appointments />
                  </RoleGuard>
                } />
                <Route path="billing" element={
                  <RoleGuard allowedRoles={['admin', 'staff']}>
                    <Billing />
                  </RoleGuard>
                } />
                <Route path="inventory" element={
                  <RoleGuard allowedRoles={['admin', 'staff']}>
                    <Inventory />
                  </RoleGuard>
                } />
                <Route path="services" element={
                  <RoleGuard allowedRoles={['admin', 'staff']}>
                    <Services />
                  </RoleGuard>
                } />
                <Route path="reports" element={
                  <RoleGuard allowedRoles={['admin', 'staff']}>
                    <Reports />
                  </RoleGuard>
                } />
                <Route path="staff" element={
                  <RoleGuard allowedRoles={['admin']}>
                    <Staff />
                  </RoleGuard>
                } />
                
                {/* Settings - All roles can access but with different capabilities */}
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
              </Route>

              {/* Super Admin Routes - Separate layout or within layout */}
              <Route path="/super-admin" element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['super_admin']}>
                    <Layout />
                  </RoleGuard>
                </ProtectedRoute>
              }>
                <Route index element={<SuperAdminPanel />} />
              </Route>

              {/* Access Denied Page */}
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
