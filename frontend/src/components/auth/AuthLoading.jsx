import React from 'react';
import { Loader2, Layers } from 'lucide-react';

export default function AuthLoading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-slate-100">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30 animate-pulse">
          <Layers size={24} />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <Loader2 size={16} className="animate-spin text-brand-400" />
          <span>Initializing secure session...</span>
        </div>
      </div>
    </div>
  );
}
