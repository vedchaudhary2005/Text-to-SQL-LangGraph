import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-2 sm:p-2.5 shadow-xl text-[11px] sm:text-xs font-mono backdrop-blur-sm max-w-xs">
        <p className="font-semibold text-slate-200 mb-1 font-sans truncate">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.name}:</span>
            <span className="font-bold text-white ml-auto">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DynamicChart({ chartConfig }) {
  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return null;

  const { data, series, labelKey, preferredType = 'bar' } = chartConfig;
  const [chartType, setChartType] = useState(preferredType);

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-surface-200/90 p-3 sm:p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-slate-800">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider truncate">
          Data Visualization
        </span>
        <div className="flex items-center gap-1 bg-surface-100 p-0.5 rounded-lg border border-slate-800 flex-shrink-0">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1 sm:p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              chartType === 'bar' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Bar Chart"
            type="button"
          >
            <BarChart3 size={13} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1 sm:p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              chartType === 'line' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Line Chart"
            type="button"
          >
            <LineChartIcon size={13} />
          </button>
        </div>
      </div>

      <div className="h-56 sm:h-64 md:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey={labelKey}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              {series.map((s, idx) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: COLORS[idx % COLORS.length] }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey={labelKey}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              {series.map((s, idx) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={COLORS[idx % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
