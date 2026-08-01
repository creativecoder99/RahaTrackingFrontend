'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Shield, User, ArrowRight, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);
    const result = await login(roleEmail, 'password123');
    if (!result.success) {
      setError(result.error || 'Quick login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base text-text-secondary selection:bg-surface-strong selection:text-surface-base flex flex-col items-center justify-center p-space-6 font-sans relative">
      
      {/* Background Image with Tech Mesh and Radial Glow Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* High-tech vector grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 z-10" />
        
        {/* Glowing mint radial light source */}
        <div className="absolute top-[20%] left-[20%] w-[450px] h-[450px] bg-surface-strong/15 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse z-10" />
        
        <img 
          src="/login_bg_abstract.png" 
          alt="Dashboard Background" 
          className="w-full h-full object-cover opacity-35 md:opacity-45 filter blur-[1px] z-0" 
        />
        {/* Clean fade gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-transparent to-surface-base/50 z-10" />
      </div>
      
      {/* Glassmorphic raised login container card */}
      <div className="w-full max-w-md bg-surface-raised/95 border border-border-default rounded-sm p-space-8 shadow-2xl relative z-10 backdrop-blur-md">
        
        <button
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-text-tertiary hover:text-text-primary transition-all duration-instant flex items-center gap-space-2 mb-space-6 cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring rounded-xs px-space-2 py-space-1 border-none bg-transparent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex flex-col items-center mb-space-8 text-center">
          <div className="p-space-3 bg-surface-strong/10 rounded-xs mb-space-3">
            <img src="/logo.svg" alt="Raha Logo" className="h-10 w-auto" />
          </div>
          <h1 className="font-bold text-3xl tracking-tight text-text-primary">
            Track Portal
          </h1>
          <p className="text-text-tertiary text-sm mt-space-2 font-normal">
            Field Associate Location & Fuel Reimbursement
          </p>
        </div>

        {error && (
          <div className="mb-space-6 p-space-4 rounded-xs bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center justify-center text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-space-5">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-space-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-space-4 flex items-center text-text-inverse">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@raha.com"
                className="w-full bg-white border border-[#d1d5db] text-text-primary hover:border-text-inverse rounded-xs py-space-3 pl-space-8 pr-space-4 text-sm placeholder-text-inverse/60 transition-all outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent font-medium"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-space-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-space-4 flex items-center text-text-inverse">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#d1d5db] text-text-primary hover:border-text-inverse rounded-xs py-space-3 pl-space-8 pr-space-4 text-sm placeholder-text-inverse/60 transition-all outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent font-medium"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-space-3 px-space-4 bg-surface-strong text-text-primary hover:bg-[#25ab81] active:bg-[#1f916d] active:scale-95 disabled:opacity-50 rounded-xs font-bold text-sm shadow-sm transition-all duration-instant flex items-center justify-center gap-space-2 cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-text-primary" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-space-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-default/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface-raised px-space-3 text-text-tertiary font-bold tracking-widest text-[10px]">
              Demo Credentials
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-3 sm:grid-cols-2">
          <button
            onClick={() => handleQuickLogin('associate1@raha.com')}
            disabled={loading}
            className="flex items-center justify-between p-space-3 bg-white hover:bg-text-secondary/5 border border-[#d1d5db] hover:border-text-inverse rounded-xs text-left transition-all duration-instant active:scale-95 cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <div>
              <p className="text-xs font-bold text-text-primary">Sales Associate</p>
              <p className="text-[10px] text-text-tertiary mt-space-1">associate1@raha.com</p>
            </div>
            <User className="h-4 w-4 text-text-tertiary" />
          </button>

          <button
            onClick={() => handleQuickLogin('manager@raha.com')}
            disabled={loading}
            className="flex items-center justify-between p-space-3 bg-white hover:bg-text-secondary/5 border border-[#d1d5db] hover:border-text-inverse rounded-xs text-left transition-all duration-instant active:scale-95 cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <div>
              <p className="text-xs font-bold text-text-primary">Branch Head</p>
              <p className="text-[10px] text-text-tertiary mt-space-1">manager@raha.com</p>
            </div>
            <Shield className="h-4 w-4 text-[#1b8060]" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
