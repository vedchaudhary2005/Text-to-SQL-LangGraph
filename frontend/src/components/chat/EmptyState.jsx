import React from 'react';
import { Database, Sparkles, ArrowUpRight, ShieldAlert } from 'lucide-react';

const SUGGESTIONS = [
  {
    title: 'Total Sales in 2026',
    query: '2026 mein total sales kitni hui?',
    subtitle: 'Aggregate revenue and order volume',
  },
  {
    title: 'Monthly Sales Trend',
    query: 'Show monthly sales for 2026',
    subtitle: 'Month-over-month breakdown',
  },
  {
    title: 'Sales Decline Investigation',
    query: 'March ke baad sales kyu gir gayi?',
    subtitle: 'Multi-step root cause analysis',
  },
  {
    title: 'Top Performing Products',
    query: 'Which products generated the highest revenue?',
    subtitle: 'Product ranking by total revenue',
  },
];

export default function EmptyState({ onSelectSuggestion, isDbConnected, onOpenConnectModal }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] max-w-3xl mx-auto px-2 sm:px-4 text-center my-auto py-6 sm:py-12">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-brand-600/20 to-brand-400/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 sm:mb-6 shadow-inner flex-shrink-0">
        <Sparkles size={24} className="sm:w-7 sm:h-7" />
      </div>

      <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        Ask your data anything.
      </h1>

      <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-6 sm:mb-8 leading-relaxed px-2">
        Connect your MySQL database and use natural language to explore sales, revenue, profit, trends, and business performance.
      </p>

      {!isDbConnected && (
        <div className="w-full max-w-md mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-200">Database not connected</p>
              <p className="text-[11px] text-amber-300/80">Connect your MySQL database to run queries</p>
            </div>
          </div>
          <button
            onClick={onOpenConnectModal}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            type="button"
          >
            <Database size={13} />
            <span>Connect</span>
          </button>
        </div>
      )}

      <div className="w-full">
        <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
          Suggested business questions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(item.query)}
              className="group p-3 sm:p-4 rounded-xl border border-slate-800 bg-surface-100/60 hover:bg-surface-100 hover:border-slate-700 transition-all text-left flex flex-col justify-between"
              type="button"
            >
              <div className="flex items-start justify-between w-full mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-brand-400 transition-colors">
                  {item.title}
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0 ml-1"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono line-clamp-1 mb-1.5">
                "{item.query}"
              </p>
              <span className="text-[10px] text-slate-500">{item.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
