import React, { useState } from 'react';
import { Table, ChevronDown, ChevronRight } from 'lucide-react';

export default function DataTable({ rows, columnNames = [], title = 'Query Result Data' }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!rows || !Array.isArray(rows) || rows.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-slate-800 bg-surface-200/90 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-surface-100/70 hover:bg-surface-100 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-slate-800 text-slate-300 flex-shrink-0">
            <Table size={13} />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">
            {title} ({rows.length} {rows.length === 1 ? 'row' : 'rows'})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs flex-shrink-0 ml-2">
          <span className="hidden xs:inline">{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="overflow-x-auto border-t border-slate-800/80 max-h-72 sm:max-h-80 overflow-y-auto">
          <table className="w-full text-left text-[11px] sm:text-xs font-mono border-collapse min-w-full">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                <th className="py-2 px-2 sm:px-3 w-8 sm:w-10 text-center text-slate-600 font-sans">#</th>
                {columnNames.map((col, idx) => (
                  <th key={idx} className="py-2 px-2 sm:px-3 font-semibold text-slate-300 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-center text-slate-600 font-sans">{rIdx + 1}</td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-1.5 sm:py-2 px-2 sm:px-3 text-slate-200 whitespace-nowrap">
                      {cell === null ? (
                        <span className="text-slate-600 italic">NULL</span>
                      ) : typeof cell === 'number' ? (
                        <span className="text-emerald-400">{cell.toLocaleString()}</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
