import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Eye, EyeOff, Lock, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getRoleRedirectPath, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setIsLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      // Redirect based on role, or to originally requested page if accessible
      const redirectPath = from || getRoleRedirectPath(result.user.role);
      navigate(redirectPath, { replace: true });
    } else {
      setLocalError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (localError) setLocalError('');
    if (error) clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1e1e1e] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Clinic Pro</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff7a6b] transition-colors"
                  placeholder="Enter username or email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff7a6b] transition-colors"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(localError || error) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{localError || error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-[#ff7a6b] text-white py-3 rounded-xl font-medium transition-colors",
                isLoading 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-[#ff6b5b]"
              )}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Test Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center mb-3">Initial Super Admin Account</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-[#0f0f0f] rounded-lg p-2">
                <span className="text-gray-400">Super Admin:</span>
                <div className="text-right">
                  <span className="text-gray-300">aadhila003@gmail.com / aadhil8089385071</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Protected by multi-tenant authentication
        </p>
      </div>
    </div>
  );
}
