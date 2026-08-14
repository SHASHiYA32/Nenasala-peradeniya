'use client'

import Link from 'next/link';
import { ShieldCheck, BookOpen, Users, BarChart3, ArrowRight, Lock, KeyRound } from 'lucide-react';

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-white transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Branding & System Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Restricted Access • Secure Gateway</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                Nanasala Peradeniya <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-amber-500">Campus LMS</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
                Centralized administration portal for managing institutional modules, faculty credentials, student progress analytics, and campus-wide learning resources.
              </p>
            </div>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">User Control</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage roles and permissions securely.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Curriculum</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Oversee courses and study materials.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Analytics</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Monitor campus-wide engagement.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Admin Login Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xl backdrop-blur-xl relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Admin Sign In</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your credentials to access the management dashboard.</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 pl-4">Administrator ID / Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input 
                        type="email" 
                        required 
                        placeholder="admin@nanasalaperadeniya.ac.lk"
                        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-4">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                      <a href="#" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input 
                        type="password" 
                        required 
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <Link 
                    href="/admin" 
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/20 active:scale-[0.99]"
                  >
                    <span>Access Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </form>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Protected by multi-factor authentication & institutional security protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-zinc-800 relative z-10">
        <p>© {new Date().getFullYear()} Nanasala Peradeniya Campus. All rights reserved. • LMS Administrative Portal</p>
      </footer>
    </div>
  );
}