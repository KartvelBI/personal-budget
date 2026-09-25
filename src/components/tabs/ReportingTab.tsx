import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { PLStatement } from './PLStatement';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart2,
  Download,
  PieChart as PieIcon,
  Users,
  FileSpreadsheet,
} from 'lucide-react';

const SALESPRO_COLORS = ['#4E53EE', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#3B82F6', '#1E2238'];

export const ReportingTab: React.FC = () => {
  const { transactions, categories, totals, projects, theme } = useBudget();
  const [activeView, setActiveView] = useState<'pl' | 'charts'>('pl');
  const isDark = theme === 'dark';

  // 1. Group Monthly Data for BarChart
  const monthlyDataMap: Record<string, { month: string; income: number; expenses: number }> = {};

  transactions.forEach((tx) => {
    const monthKey = tx.date.substring(0, 7);
    if (!monthlyDataMap[monthKey]) {
      const [year, month] = monthKey.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
      monthlyDataMap[monthKey] = { month: monthLabel, income: 0, expenses: 0 };
    }

    if (tx.type === 'Income') {
      monthlyDataMap[monthKey].income += tx.amount;
    } else {
      monthlyDataMap[monthKey].expenses += tx.amount;
    }
  });

  const monthlyChartData = Object.keys(monthlyDataMap)
    .sort()
    .map((k) => monthlyDataMap[k]);

  const displayMonthlyData =
    monthlyChartData.length > 0
      ? monthlyChartData
      : [
          { month: 'Current', income: totals.totalIncome, expenses: totals.totalExpenses },
        ];

  // 2. Group Expenses by Category for PieChart
  const expensesByCategoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'Expense')
    .forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId);
      const catName = cat?.name || 'Other Expenses';
      expensesByCategoryMap[catName] = (expensesByCategoryMap[catName] || 0) + tx.amount;
    });

  const categoryPieData = Object.entries(expensesByCategoryMap).map(([name, value], idx) => ({
    name,
    value,
    color: categories.find((c) => c.name === name)?.color || SALESPRO_COLORS[idx % SALESPRO_COLORS.length],
  }));

  // 3. Top Deliverables
  const projectVolumeMap: Record<string, number> = {};
  projects.forEach((p) => {
    const name = p.note || 'Services';
    projectVolumeMap[name] = (projectVolumeMap[name] || 0) + p.amount;
  });

  const projectChartData = Object.entries(projectVolumeMap).map(([name, volume]) => ({
    name,
    volume,
  }));

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Reference'];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      return [
        t.date,
        t.type,
        `"${cat?.name || 'Uncategorized'}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount,
        t.currency,
        `"${t.reference || ''}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top View Switcher: Profit & Loss (P&L) vs Visual Analytics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-[#F0F2F7] dark:border-[#232738]">
        <div className="flex bg-[#F8F9FC] dark:bg-[#161922] p-1.5 rounded-2xl border border-[#F0F2F7] dark:border-[#232738] w-fit shadow-2xs">
          <button
            onClick={() => setActiveView('pl')}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'pl'
                ? 'bg-[#4E53EE] text-white shadow-xs'
                : 'text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Profit & Loss (P&L)</span>
          </button>

          <button
            onClick={() => setActiveView('charts')}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'charts'
                ? 'bg-[#4E53EE] text-white shadow-xs'
                : 'text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Charts & Trends</span>
          </button>
        </div>

        {activeView === 'charts' && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2.5 px-4.5 py-2 bg-[#1E2238] dark:bg-[#4E53EE] hover:bg-slate-800 dark:hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#A5B4FC] stroke-[2.2]" />
            Export CSV
          </button>
        )}
      </div>

      {activeView === 'pl' ? (
        <PLStatement />
      ) : (
        <div className="space-y-6">

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#E6F9F0] dark:bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shadow-md shadow-[#10B981]/10 shrink-0">
                <BarChart2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#1E2238] dark:text-white">Income vs Expenses</h3>
                <p className="text-xs text-[#8C93AB]">Monthly cashflow trend</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                Income
              </span>
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                Expenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#232738' : '#F0F2F7'} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8C93AB' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#8C93AB' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: isDark ? '#1C2030' : '#FFFFFF',
                    borderColor: isDark ? '#232738' : '#F0F2F7',
                    color: isDark ? '#EAECEF' : '#1E2238',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Donut */}
        <div className="lg:col-span-4 bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] flex items-center justify-center shadow-md shadow-[#4E53EE]/10 shrink-0">
                <PieIcon className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#1E2238] dark:text-white">Category Breakdown</h3>
                <p className="text-xs text-[#8C93AB]">Expense distribution</p>
              </div>
            </div>

            {categoryPieData.length > 0 ? (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Spent']}
                      contentStyle={{
                        backgroundColor: isDark ? '#1C2030' : '#FFFFFF',
                        borderColor: isDark ? '#232738' : '#F0F2F7',
                        color: isDark ? '#EAECEF' : '#1E2238',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-xs text-[#8C93AB]">
                No expense entries to display
              </div>
            )}
          </div>

          {/* Category legend */}
          <div className="mt-4 pt-3 border-t border-[#F0F2F7] dark:border-[#232738] space-y-2 max-h-36 overflow-y-auto">
            {categoryPieData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[#5E6482] dark:text-[#A0A6BF] font-medium truncate max-w-[130px]">{cat.name}</span>
                </div>
                <span className="font-extrabold font-mono text-[#1E2238] dark:text-white">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deliverables Breakdown */}
      <div className="bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF6E7] dark:bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center shadow-md shadow-[#F59E0B]/10 shrink-0">
            <Users className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1E2238] dark:text-white">Deliverable Volume</h3>
            <p className="text-xs text-[#8C93AB]">By project scope</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projectChartData.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-[#8C93AB]">
              No project deliverables recorded to analyze yet
            </div>
          ) : (
            projectChartData.map((c) => (
              <div key={c.name} className="p-4 rounded-xl border border-[#F0F2F7] dark:border-[#232738] bg-[#F8F9FC] dark:bg-[#1C2030]">
                <span className="text-[11px] font-bold text-[#8C93AB] uppercase tracking-wider block truncate">
                  {c.name}
                </span>
                <div className="text-xl font-extrabold font-mono text-[#1E2238] dark:text-white mt-1">
                  ${c.volume.toLocaleString()}
                </div>
                <div className="mt-2 w-full bg-slate-200/80 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#4E53EE] h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((c.volume / (totals.totalIncome || 10000)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )}
</div>
);
};
