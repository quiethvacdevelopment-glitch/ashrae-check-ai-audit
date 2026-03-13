import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AccessExpiredOverlay() {
  const { user, profile, isTrialActive } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ls-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wasOnTrial = !profile?.access_expires_at;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred dashboard behind */}
      <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/60" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Your Access Period Has Ended
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {wasOnTrial
              ? 'Your 10-day free trial has concluded.'
              : 'Your 30-day period has expired.'}{' '}
            Renew your access to continue auditing your projects.
          </p>

          {/* Pricing box */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-black text-slate-900">$20</span>
              <span className="text-slate-500 text-sm">/ 30 days</span>
            </div>
            <ul className="space-y-2 text-sm">
              {[
                'Full access to all AI auditing tools',
                'Unlimited compliance reports',
                'No auto-renewal — pay only when needed',
                'Secure one-time payment',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-600">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="text-red-500 text-xs mb-4">{error}</p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 text-sm"
          >
            {loading ? 'Redirecting to Checkout...' : '🔓 Unlock 30-Day Access — $20'}
          </button>

          <p className="text-xs text-slate-400 mt-4">
            Questions?{' '}
            <a href="mailto:quiethvacdevelopment@gmail.com" className="text-blue-500 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
