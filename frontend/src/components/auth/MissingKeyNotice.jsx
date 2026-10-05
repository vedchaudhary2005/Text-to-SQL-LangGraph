import React from 'react';
import { KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';

export default function MissingKeyNotice() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4 text-slate-100">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-surface-200 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">Clerk Configuration Required</h1>
            <p className="text-xs text-slate-400">Authentication is enabled but publishable key is missing</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-surface-100 p-4 rounded-xl border border-slate-800">
          <p>
            To activate authentication, add your Clerk Publishable Key to your frontend environment:
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-brand-300 border border-slate-800 overflow-x-auto">
            VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
          </div>
          <p className="text-slate-400 text-[11px]">
            You can find this key in your{' '}
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline inline-flex items-center gap-0.5"
            >
              Clerk Dashboard <ArrowRight size={10} />
            </a>{' '}
            under <strong>API Keys</strong>.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-colors"
            type="button"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}
