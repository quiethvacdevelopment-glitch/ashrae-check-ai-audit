import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, MessageCircle } from 'lucide-react';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError('Invalid email or password. Please try again.');
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        // Automatically sign in the user after successful sign up
        // (Supabase will auto log them in if email confirmation is disabled)
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">ashraeCheck AI</h1>
          </div>
          <p className="text-slate-400 text-sm">AI-Powered ASHRAE Compliance Auditing</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Trial badge */}
          {mode === 'signup' && (
            <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-center">
              <p className="text-blue-300 text-sm font-semibold">🎉 Start with a 10-Day Free Trial</p>
              <p className="text-blue-400/70 text-xs mt-1">No credit card required</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="engineer@company.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                <p className="text-green-300 text-xs">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 mt-2"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Start Free Trial'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-slate-500 mt-4">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Start your free trial
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
        <div className="mt-8 flex flex-col items-center gap-2 text-xs text-slate-500">
          <span className="uppercase tracking-wider text-[10px] font-bold text-slate-600">Feedback & Support</span>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <a href="mailto:quiethvacdevelopment@gmail.com" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              quiethvacdevelopment@gmail.com
            </a>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a href="https://wa.me/37455482667" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp: +37455482667
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
