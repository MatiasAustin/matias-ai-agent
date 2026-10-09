import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles, Building2, User } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#111111] flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-neutral-200">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-medium text-sm tracking-tighter">
            M
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-[#111111]">Matias</span>
            <span className="text-xs text-[#6F6F6B] ml-1 font-normal">Operating System</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6F6F6B] font-mono bg-white px-3 py-1.5 rounded-full border border-[#E5E5E1]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Multi-Tenant Auth v2.1
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-[#6F6F6B] block mb-2">Secure Workspace Sign In</span>
            <h1 className="text-3xl font-medium tracking-tight text-[#111111] leading-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[#6F6F6B] mt-2">
              Sign in with your enterprise credentials to access your autonomous studio workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed flex items-start gap-2.5">
              <span className="font-semibold text-red-800">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6F6F6B] uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  required
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#111111] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-[#6F6F6B] cursor-not-allowed opacity-60">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#111111] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-[#111111] hover:bg-neutral-800 text-white font-medium text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm group"
            >
              <span>{submitting ? 'Verifying session...' : 'Authenticate'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Test Seed Credentials helper */}
          <div className="mt-8 pt-6 border-t border-[#E5E5E1]/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F6F6B] block mb-3">
              Fast-Fill Demo Accounts
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@example.com', 'Admin123!')}
                className="w-full text-left p-2.5 rounded-lg border border-[#E5E5E1] bg-[#F5F5F3]/50 hover:bg-[#F5F5F3] transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                  <span className="font-medium text-[#111111]">Platform Super Admin</span>
                </div>
                <span className="font-mono text-[10px] text-[#6F6F6B]">admin@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('owner@example.com', 'Owner123!')}
                className="w-full text-left p-2.5 rounded-lg border border-[#E5E5E1] bg-[#F5F5F3]/50 hover:bg-[#F5F5F3] transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-neutral-700" />
                  <span className="font-medium text-[#111111]">Studio Owner (Matias)</span>
                </div>
                <span className="font-mono text-[10px] text-[#6F6F6B]">owner@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('member@example.com', 'Member123!')}
                className="w-full text-left p-2.5 rounded-lg border border-[#E5E5E1] bg-[#F5F5F3]/50 hover:bg-[#F5F5F3] transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-neutral-700" />
                  <span className="font-medium text-[#111111]">Studio Member</span>
                </div>
                <span className="font-mono text-[10px] text-[#6F6F6B]">member@example.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#6F6F6B] gap-4">
        <div>
          &copy; {new Date().getFullYear()} Matias AI Studio OS. Tenant Scoped Encryption &amp; Strict Session Boundary.
        </div>
        <div className="flex items-center gap-6">
          <span>Server-side Scrypt Hash</span>
          <span>Zero Plaintext Storage</span>
          <span>Role-Based Scopes</span>
        </div>
      </div>
    </div>
  );
};
