import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { authAPI } from '../api/client';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'admin' && redirect === '/') {
          navigate('/admin');
        } else {
          navigate(redirect);
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCustomer = () => {
    setEmail('customer@foodiehub.com');
    setPassword('customer123');
    setError('');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@foodiehub.com');
    setPassword('admin123');
    setError('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      await authAPI.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-stone-200/80 shadow-card space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🍔</span>
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              Foodie<span className="text-brand-600">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-stone-900">Welcome Back</h1>
          <p className="text-xs text-stone-600">
            Sign in to track orders, manage addresses, and save favorites
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200/90 text-xs space-y-2">
          <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wider">
            Quick Fill Demo Accounts:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFillDemoCustomer}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-stone-200 hover:border-brand-500 font-bold text-[11px] text-stone-700 flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-stone-200 hover:border-amber-600 font-bold text-[11px] text-stone-700 flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? <span>Signing In...</span> : <span>Sign In to FoodieHub</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-600">
          Don't have an account yet?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-brand-600 hover:underline"
          >
            Sign up for free
          </Link>
        </p>

      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">Reset Password</h3>
            {forgotSent ? (
              <div className="space-y-3">
                <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  Password reset link dispatched to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setShowForgot(false);
                    setForgotSent(false);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-stone-600">
                  Enter your email address and we'll send you recovery instructions.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
