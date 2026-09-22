import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AIVisualData } from './aiTypes';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface Props {
  visual: AIVisualData;
  isExpanded?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#1E2238] dark:bg-[#0F111A] text-white p-2.5 rounded-xl text-xs shadow-xl border border-white/10">
        <p className="font-bold text-[#8C93AB] text-[11px] mb-1">{data.payload.label || label}</p>
        <p className="font-mono font-extrabold text-sm text-[#7378FF]">
          ${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        {data.payload.meta && (
          <p className="text-[10px] text-[#A0A6C0] mt-1">
            {data.payload.meta.projects} projects • {data.payload.meta.invoices} invoices
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const AIVisualRenderer: React.FC<Props> = ({ visual, isExpanded = false }) => {
  const chartHeight = isExpanded ? 240 : 190;

  return (
    <div className="mt-3.5 pt-3 border-t border-[#F0F2F7] dark:border-[#232738] space-y-3.5">
      {/* Visual Title Header */}
      {(visual.title || visual.subtitle) && (
        <div className="flex items-start justify-between gap-2">
          <div>
            {visual.title && (
              <h4 className="text-xs font-extrabold text-[#1E2238] dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4E53EE] dark:text-[#7378FF] shrink-0" />
                <span>{visual.title}</span>
              </h4>
            )}
            {visual.subtitle && (
              <p className="text-[11px] text-[#8C93AB] dark:text-[#7A839E] mt-0.5">
                {visual.subtitle}
              </p>
            )}
          </div>

          {visual.totalFormatted && (
            <span className="font-mono text-xs font-black text-[#4E53EE] dark:text-[#7378FF] bg-[#EDEEFD] dark:bg-[#4E53EE]/20 px-2.5 py-1 rounded-lg shrink-0">
              {visual.totalFormatted}
            </span>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      {visual.kpiCards && visual.kpiCards.length > 0 && (
        <div className={`grid gap-2 ${visual.kpiCards.length >= 3 ? (isExpanded ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3') : 'grid-cols-2'}`}>
          {visual.kpiCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/80 dark:bg-[#1F2330]/80 border border-[#F0F2F7] dark:border-[#2A3044] rounded-xl p-2.5 shadow-2xs"
            >
              <div className="text-[10px] font-bold text-[#8C93AB] dark:text-[#7A839E] truncate">
                {card.label}
              </div>
              <div className="font-mono text-xs sm:text-sm font-extrabold text-[#1E2238] dark:text-white mt-0.5 truncate flex items-center gap-1">
                <span>{card.value}</span>
                {card.isPositive !== undefined && (
                  card.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#10B981] inline shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[#EF4444] inline shrink-0" />
                  )
                )}
              </div>
              {card.subtext && (
                <div className="text-[9px] text-[#8C93AB] dark:text-[#7A839E] mt-0.5 truncate">
                  {card.subtext}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vertical Bar Chart */}
      {visual.type === 'bar-chart' && visual.data && visual.data.length > 0 && (
        <div className="bg-[#F8F9FC] dark:bg-[#1A1D27] p-2.5 rounded-xl border border-[#F0F2F7] dark:border-[#232738]">
          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visual.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8C93AB', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8C93AB', fontSize: 9, fontFamily: 'monospace' }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  fill="#4E53EE"
                >
                  {visual.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#4E53EE'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Horizontal Bar Chart (for Client Rankings) */}
      {visual.type === 'horizontal-bar' && visual.data && visual.data.length > 0 && (
        <div className="bg-[#F8F9FC] dark:bg-[#1A1D27] p-3 rounded-xl border border-[#F0F2F7] dark:border-[#232738] space-y-2.5">
          {visual.data.map((item, idx) => {
            const maxValue = Math.max(...visual.data!.map((d) => d.value), 1);
            const percentage = Math.min(100, Math.round((item.value / maxValue) * 100));

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1E2238] dark:text-white flex items-center gap-1.5 truncate">
                    <span className="w-4 h-4 rounded-full bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] text-[9px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="font-mono font-extrabold text-[#4E53EE] dark:text-[#7378FF] shrink-0 ml-2">
                    ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] dark:bg-[#2A3044] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(percentage, 6)}%`,
                      backgroundColor: item.color || '#4E53EE',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Donut Chart (for Expense/Category Breakdown) */}
      {visual.type === 'donut-chart' && visual.data && visual.data.length > 0 && (
        <div className="bg-[#F8F9FC] dark:bg-[#1A1D27] p-3 rounded-xl border border-[#F0F2F7] dark:border-[#232738]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div style={{ width: 140, height: 140 }} className="shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={visual.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {visual.data.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color || '#4E53EE'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
              {visual.data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || '#4E53EE' }}
                    />
                    <span className="text-[#5E6482] dark:text-[#949DB2] truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#1E2238] dark:text-white shrink-0 ml-2">
                    ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
