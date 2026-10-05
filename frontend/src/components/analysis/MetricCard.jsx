import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function MetricCard({ kpis = [] }) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl border border-slate-800/80 bg-surface-100/90 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{kpi.title}</span>
            <div className="p-1 rounded-md bg-brand-500/10 text-brand-400">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white mt-1">
            {kpi.formatted}
          </div>
        </div>
      ))}
    </div>
  );
}
