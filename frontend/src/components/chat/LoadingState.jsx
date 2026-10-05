import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoadingState() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-start gap-3 my-6 animate-pulse">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mt-1">
        <Sparkles size={16} />
      </div>

      <div className="flex-1 rounded-2xl rounded-tl-sm bg-surface-100/90 border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-brand-400" />
          <div>
            <p className="text-sm font-medium text-slate-200">
              Analyzing your data...
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              LangGraph processing query ({seconds}s elapsed)
            </p>
          </div>
        </div>

        {/* Subtle skeleton bar lines */}
        <div className="mt-4 space-y-2.5">
          <div className="h-3 bg-slate-800/80 rounded w-5/6" />
          <div className="h-3 bg-slate-800/60 rounded w-4/6" />
          <div className="h-3 bg-slate-800/40 rounded w-3/6" />
        </div>
      </div>
    </div>
  );
}
