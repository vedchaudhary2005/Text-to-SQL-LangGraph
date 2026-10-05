import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { Layers, Database, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('sign-in'); // 'sign-in' or 'sign-up'

  const clerkAppearance = {
    baseTheme: dark,
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: '#111827',
      colorInputBackground: '#161F30',
      colorInputText: '#f1f5f9',
      colorText: '#f1f5f9',
      colorTextSecondary: '#94a3b8',
      borderRadius: '0.75rem',
    },
    elements: {
      card: 'border border-slate-800 shadow-2xl bg-surface-200',
      headerTitle: 'text-white font-bold',
      headerSubtitle: 'text-slate-400 text-xs',
      socialButtonsBlockButton: 'border-slate-700 bg-surface-100 hover:bg-slate-800 text-white',
      formButtonPrimary: 'bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-md',
      footerActionLink: 'text-brand-400 hover:text-brand-300',
    },
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-background text-slate-100 overflow-y-auto">
      {/* Brand & Overview Section */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-surface-300 via-surface-200 to-background border-b lg:border-b-0 lg:border-r border-slate-800">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <Layers size={22} />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">AI Data Analyst</span>
              <p className="text-[11px] text-brand-400 font-mono">LangGraph SQL Engine</p>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
              Autonomous AI Data Analyst for Enterprise SQL Databases.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
              Transform natural-language questions into safe MySQL queries, execute complex multi-step root cause analysis, and explore real-time visual insights with LangGraph.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-surface-100/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 flex-shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Text-to-SQL Engine</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Accurate schema-aware SQL generation powered by Groq LLM.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-surface-100/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Multi-Step Root Cause</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Deconstructs complex "why" questions across multiple SQL tasks.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-surface-100/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
                  <Database size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Dynamic Visualizations</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Auto-generated charts and tables strictly from verified backend results.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-surface-100/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">SQL AST Validation</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Strict read-only SELECT guardrails and auto-debugging loops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Enterprise AI Analytics Workspace</span>
          <span>Secured by Clerk</span>
        </div>
      </div>

      {/* Clerk Auth Card Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-200 border border-slate-800 mb-6 w-full max-w-xs shadow-sm">
            <button
              onClick={() => setAuthMode('sign-in')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                authMode === 'sign-in'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('sign-up')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                authMode === 'sign-up'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Clerk Component */}
          <div className="w-full flex justify-center">
            {authMode === 'sign-in' ? (
              <SignIn appearance={clerkAppearance} routing="hash" />
            ) : (
              <SignUp appearance={clerkAppearance} routing="hash" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
