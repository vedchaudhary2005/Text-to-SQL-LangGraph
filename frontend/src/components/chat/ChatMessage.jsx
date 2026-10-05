import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles, Layers, Compass } from 'lucide-react';
import SqlViewer from '../analysis/SqlViewer';
import DataTable from '../analysis/DataTable';
import DynamicChart from '../analysis/DynamicChart';
import MetricCard from '../analysis/MetricCard';
import {
  parsePythonQueryResult,
  extractColumnNamesFromSql,
  detectChartableData,
  extractReliableKpis,
} from '../../utils/dataParser';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  // Analysis parsing for assistant responses
  const parsedData = useMemo(() => {
    if (isUser) return null;

    const sqlSingle = message.sql_query || '';
    const sqlMultiple = message.sql_queries || [];
    const primarySql = sqlSingle || (sqlMultiple.length > 0 ? sqlMultiple[0] : '');

    const columns = extractColumnNamesFromSql(primarySql);

    // Parse single result or multiple results
    let primaryRows = null;
    let tables = [];

    if (message.query_result) {
      const parsed = parsePythonQueryResult(message.query_result);
      if (parsed && parsed.rows && parsed.rows.length > 0) {
        primaryRows = parsed.rows;
        tables.push({
          title: 'Query Result Data',
          rows: parsed.rows,
          columns: columns.length > 0 ? columns : parsed.rows[0].map((_, i) => `Column ${i + 1}`),
        });
      }
    }

    if (Array.isArray(message.query_results)) {
      message.query_results.forEach((qr, idx) => {
        const parsed = parsePythonQueryResult(qr);
        if (parsed && parsed.rows && parsed.rows.length > 0) {
          if (!primaryRows) primaryRows = parsed.rows;
          const querySql = sqlMultiple[idx] || '';
          const queryCols = extractColumnNamesFromSql(querySql);
          tables.push({
            title: `Analysis ${idx + 1} Result Data`,
            rows: parsed.rows,
            columns: queryCols.length > 0 ? queryCols : parsed.rows[0].map((_, i) => `Column ${i + 1}`),
          });
        }
      });
    }

    // Reliable KPIs
    const kpis = primaryRows
      ? extractReliableKpis(
          primaryRows,
          tables[0] ? tables[0].columns : columns,
          message.intent
        )
      : [];

    // Reliable Chart Data
    let chartConfig = null;
    if (primaryRows && primaryRows.length >= 2) {
      chartConfig = detectChartableData(
        primaryRows,
        tables[0] ? tables[0].columns : columns
      );
    }

    return {
      columns,
      tables,
      kpis,
      chartConfig,
      hasSql: Boolean(sqlSingle || (sqlMultiple && sqlMultiple.length > 0)),
    };
  }, [message, isUser]);

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2 sm:gap-3 my-3 sm:my-4">
        <div className="max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-brand-600 px-3.5 sm:px-4 py-2.5 sm:py-3 text-white shadow-md break-words">
          <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          <User size={14} className="sm:w-4 sm:h-4" />
        </div>
      </div>
    );
  }

  // Assistant / Analyst message
  return (
    <div className="flex items-start gap-2 sm:gap-3 my-4 sm:my-6 min-w-0 max-w-full">
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mt-1">
        <Sparkles size={14} className="sm:w-4 sm:h-4" />
      </div>

      <div className="flex-1 min-w-0 max-w-[calc(100%-2.25rem)] sm:max-w-full rounded-2xl rounded-tl-sm bg-surface-100/90 border border-slate-800/80 p-3.5 sm:p-5 shadow-sm overflow-hidden">
        {/* Intent & Complexity Metadata Badges */}
        {(message.intent || message.complexity) && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-slate-800/80">
            {message.intent && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60 truncate max-w-full">
                <Compass size={11} className="text-brand-400 flex-shrink-0" />
                <span className="truncate">Intent: {message.intent.replace(/_/g, ' ')}</span>
              </span>
            )}
            {message.complexity && (
              <span
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium border flex-shrink-0 ${
                  message.complexity === 'complex'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                }`}
              >
                <Layers size={11} />
                <span>{message.complexity.toUpperCase()} ANALYSIS</span>
              </span>
            )}
          </div>
        )}

        {/* Reliable KPI Cards */}
        {parsedData && parsedData.kpis && parsedData.kpis.length > 0 && (
          <MetricCard kpis={parsedData.kpis} />
        )}

        {/* Markdown Analysis Content */}
        <div className="markdown-content text-xs sm:text-sm leading-relaxed break-words overflow-x-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content || message.answer || ''}
          </ReactMarkdown>
        </div>

        {/* Dynamic Chart if reliable time-series or multi-category data */}
        {parsedData && parsedData.chartConfig && (
          <DynamicChart chartConfig={parsedData.chartConfig} />
        )}

        {/* Tabular Data from Query Results */}
        {parsedData &&
          parsedData.tables &&
          parsedData.tables.map((tbl, i) => (
            <DataTable
              key={i}
              rows={tbl.rows}
              columnNames={tbl.columns}
              title={tbl.title}
            />
          ))}

        {/* Collapsible SQL Query View */}
        {parsedData && parsedData.hasSql && (
          <SqlViewer
            sqlQuery={message.sql_query}
            sqlQueries={message.sql_queries}
          />
        )}
      </div>
    </div>
  );
}
