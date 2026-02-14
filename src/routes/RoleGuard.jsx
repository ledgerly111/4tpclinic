import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../lib/tenantScope';

/**
 * RoleGuard - Ensures user has required role or higher
 * Shows access denied or redirects if unauthorized
 */
export function RoleGuard({ children, allowedRoles, requireAll = false }) {
  const { session, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasAccess = requireAll
    ? allowedRoles.every((role) => session.role === role)
    : allowedRoles.some((role) => hasRequiredRole(session, role));

  if (!hasAccess) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = getRedirectPath(session.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

/**
 * AccessDenied - Component to show when user lacks permission
 */
export function AccessDenied() {
  const { session, logout } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">
          You don't have permission to access this page.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={logout}
            className="w-full px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
        {session && (
          <div className="mt-6 p-4 bg-[#1e1e1e] rounded-xl text-left">
            <p className="text-sm text-gray-500">Current Role:</p>
            <p className="text-white font-medium capitalize">{session.role.replace('_', ' ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getRedirectPath(role) {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin';
    case 'staff':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
