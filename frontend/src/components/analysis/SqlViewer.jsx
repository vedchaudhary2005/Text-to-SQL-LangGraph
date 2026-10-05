import React, { useState } from 'react';
import { Code2, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

export default function SqlViewer({ sqlQuery, sqlQueries = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const queries = [];
  if (sqlQuery && typeof sqlQuery === 'string' && sqlQuery.trim()) {
    queries.push(sqlQuery.trim());
  }
  if (Array.isArray(sqlQueries)) {
    sqlQueries.forEach((q) => {
      if (q && typeof q === 'string' && q.trim() && !queries.includes(q.trim())) {
        queries.push(q.trim());
      }
    });
  }

  if (queries.length === 0) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-surface-200/90 overflow-hidden shadow-sm transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-100/80 hover:bg-surface-100 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1 sm:p-1.5 rounded-md bg-brand-500/10 text-brand-400 flex-shrink-0">
            <Code2 size={15} />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 truncate">
            {queries.length > 1 ? `Generated SQL (${queries.length})` : 'Generated SQL'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs flex-shrink-0 ml-2">
          <span className="hidden xs:inline">{isOpen ? 'Hide SQL' : 'View SQL'}</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-2.5 sm:p-3.5 space-y-3 border-t border-slate-800/80 bg-slate-950/60 font-mono text-[11px] sm:text-xs">
          {queries.map((query, index) => (
            <div key={index} className="relative rounded-lg border border-slate-800/70 bg-slate-950 p-3 pt-8 sm:p-3.5 sm:pt-8 overflow-hidden">
              {queries.length > 1 && (
                <span className="absolute top-2 left-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Query #{index + 1}
                </span>
              )}
              <button
                onClick={() => handleCopy(query, index)}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[10px] sm:text-[11px]"
                type="button"
                title="Copy SQL"
              >
                {copiedIndex === index ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre className="overflow-x-auto text-emerald-300/90 whitespace-pre-wrap break-all sm:break-normal leading-relaxed max-h-64 overflow-y-auto">
                <code>{query}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
