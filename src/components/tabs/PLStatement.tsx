import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { RecordExpenseModal } from '../common/RecordExpenseModal';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';

type DatePreset = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'all' | 'custom';

export const PLStatement: React.FC = () => {
  const { transactions, categories, settings } = useBudget();
  const currency = settings.defaultCurrency || 'USD';

  // Date Presets logic
  const now = new Date();
  const getPresetDates = (preset: DatePreset): { start: string; end: string } => {
    const todayStr = now.toISOString().split('T')[0];
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-indexed

    switch (preset) {
      case 'this_month': {
        const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
        return { start, end: todayStr };
      }
      case 'last_month': {
        const lastMonthDate = new Date(y, m - 1, 1);
        const ly = lastMonthDate.getFullYear();
        const lm = lastMonthDate.getMonth() + 1;
        const lastDayOfLastMonth = new Date(y, m, 0).getDate();
        const start = `${ly}-${String(lm).padStart(2, '0')}-01`;
        const end = `${ly}-${String(lm).padStart(2, '0')}-${String(lastDayOfLastMonth).padStart(2, '0')}`;
        return { start, end };
      }
      case 'this_quarter': {
        const quarterMonth = Math.floor(m / 3) * 3;
        const start = `${y}-${String(quarterMonth + 1).padStart(2, '0')}-01`;
        return { start, end: todayStr };
      }
      case 'this_year': {
        return { start: `${y}-01-01`, end: todayStr };
      }
      case 'all':
      default:
        return { start: '', end: '' };
    }
  };

  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const initialDates = getPresetDates('this_month');
  const [startDate, setStartDate] = useState<string>(initialDates.start);
  const [endDate, setEndDate] = useState<string>(initialDates.end);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const { start, end } = getPresetDates(preset);
    setStartDate(start);
    setEndDate(end);
  };

  const isDateInRange = (dateStr: string) => {
    if (!dateStr) return false;
    const d = dateStr.slice(0, 10);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  };

  // Filtered transactions for the selected P&L period
  const periodTransactions = transactions.filter((t) => isDateInRange(t.date));

  // Income transactions
  const incomeTransactions = periodTransactions.filter((t) => t.type === 'Income');
  const totalRevenue = incomeTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Expense transactions
  const expenseTransactions = periodTransactions.filter((t) => t.type === 'Expense');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Net Profit & Margin
  const netProfit = totalRevenue - totalExpenses;
  const isProfitable = netProfit >= 0;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Group Income by Category
  const incomeByCategoryMap: Record<string, { categoryId: string; name: string; color: string; count: number; total: number; transactions: typeof transactions }> = {};
  incomeTransactions.forEach((tx) => {
    const cat = categories.find((c) => c.id === tx.categoryId);
    const catId = cat?.id || 'uncategorized-income';
    const catName = cat?.name || 'Direct Revenue';
    const catColor = cat?.color || '#10B981';

    if (!incomeByCategoryMap[catId]) {
      incomeByCategoryMap[catId] = {
        categoryId: catId,
        name: catName,
        color: catColor,
        count: 0,
        total: 0,
        transactions: [],
      };
    }
    incomeByCategoryMap[catId].count += 1;
    incomeByCategoryMap[catId].total += tx.amount;
    incomeByCategoryMap[catId].transactions.push(tx);
  });
  const incomeCategoryList = Object.values(incomeByCategoryMap).sort((a, b) => b.total - a.total);

  // Group Expenses by Category
  const expenseByCategoryMap: Record<string, { categoryId: string; name: string; color: string; count: number; total: number; transactions: typeof transactions }> = {};
  expenseTransactions.forEach((tx) => {
    const cat = categories.find((c) => c.id === tx.categoryId);
    const catId = cat?.id || 'uncategorized-expense';
    const catName = cat?.name || 'General Operating Expense';
    const catColor = cat?.color || '#EF4444';

    if (!expenseByCategoryMap[catId]) {
      expenseByCategoryMap[catId] = {
        categoryId: catId,
        name: catName,
        color: catColor,
        count: 0,
        total: 0,
        transactions: [],
      };
    }
    expenseByCategoryMap[catId].count += 1;
    expenseByCategoryMap[catId].total += tx.amount;
    expenseByCategoryMap[catId].transactions.push(tx);
  });
  const expenseCategoryList = Object.values(expenseByCategoryMap).sort((a, b) => b.total - a.total);

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Export P&L to CSV
  const handleExportPLCSV = () => {
    const lines: string[] = [];
    lines.push(`PROFIT & LOSS STATEMENT (P&L)`);
    lines.push(`Period: ${startDate || 'All Time'} to ${endDate || 'Present'}`);
    lines.push(`Currency: ${currency}`);
    lines.push('');
    lines.push('REVENUE (OPERATING INFLOW),COUNT,AMOUNT (CURRENCY),% SHARE');

    incomeCategoryList.forEach((cat) => {
      const share = totalRevenue > 0 ? ((cat.total / totalRevenue) * 100).toFixed(1) : '0';
      lines.push(`"${cat.name}",${cat.count},${cat.total.toFixed(2)},${share}%`);
    });
    lines.push(`"TOTAL OPERATING REVENUE",${incomeTransactions.length},${totalRevenue.toFixed(2)},100%`);
    lines.push('');

    lines.push('OPERATING EXPENSES (COSTS),COUNT,AMOUNT (CURRENCY),% SHARE');
    expenseCategoryList.forEach((cat) => {
      const share = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0';
      lines.push(`"${cat.name}",${cat.count},${cat.total.toFixed(2)},${share}%`);
    });
    lines.push(`"TOTAL OPERATING EXPENSES",${expenseTransactions.length},${totalExpenses.toFixed(2)},100%`);
    lines.push('');

    lines.push('SUMMARY METRICS,VALUE');
    lines.push(`"NET PROFIT / LOSS",${netProfit.toFixed(2)}`);
    lines.push(`"NET PROFIT MARGIN",${profitMargin}%`);

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PL-Statement-${startDate || 'all'}-${endDate || 'now'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="bg-[#E6F9F0] dark:bg-[#10B981]/20 border border-[#10B981]/30 text-[#1E2238] dark:text-[#E6F9F0] px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header & Actions Bar */}
      <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0F2F7] dark:border-[#232738]">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] flex items-center justify-center shadow-md shadow-[#4E53EE]/10 shrink-0">
              <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-[#1E2238] dark:text-white">
                  Profit & Loss Statement (P&L)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF]">
                  მოგება-ზარალის უწყისი
                </span>
              </div>
              <p className="text-xs text-[#8C93AB] dark:text-[#7A839E] mt-0.5">
                Real-time breakdown of operating revenues, business expenses, and net profit margins
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Record Expense Button */}
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#EF4444]/25 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4.5 h-4.5 stroke-[2.4]" />
              <span>+ Record Expense</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportPLCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#1F2330] hover:bg-[#F0F2F7] dark:hover:bg-[#2A3044] text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white border border-[#F0F2F7] dark:border-[#2A3044] rounded-xl text-xs font-bold transition cursor-pointer"
              title="Export P&L to CSV"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>Export CSV</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#1F2330] hover:bg-[#F0F2F7] dark:hover:bg-[#2A3044] text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white border border-[#F0F2F7] dark:border-[#2A3044] rounded-xl text-xs font-bold transition cursor-pointer"
              title="Print P&L Statement"
            >
              <Printer className="w-4 h-4 stroke-[2.2]" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Period Filter Toolbar */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex flex-wrap bg-[#F8F9FC] dark:bg-[#1F2330] p-1 rounded-xl text-xs font-bold text-[#5E6482] dark:text-[#949DB2] border border-[#F0F2F7] dark:border-[#2A3044]">
            {(
              [
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'this_quarter', label: 'This Quarter' },
                { id: 'this_year', label: 'This Year' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                className={`px-3 py-1.5 rounded-lg transition text-xs font-bold cursor-pointer capitalize ${
                  datePreset === p.id
                    ? 'bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white shadow-xs'
                    : 'hover:text-[#1E2238] dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-[#F8F9FC] dark:bg-[#1F2330] px-3.5 py-1.5 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8C93AB]" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-xs font-mono font-bold text-[#1E2238] dark:text-white outline-none cursor-pointer"
              />
            </div>
            <span className="text-[#8C93AB]">—</span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-xs font-mono font-bold text-[#1E2238] dark:text-white outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Operating Revenue */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C93AB] dark:text-[#7A839E]">Operating Revenue</span>
            <span className="p-1.5 rounded-lg bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.4]" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#1E2238] dark:text-white">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-[#8C93AB] dark:text-[#7A839E] mt-1">
            {incomeTransactions.length} income entries in period
          </p>
        </div>

        {/* Card 2: Operating Expenses */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C93AB] dark:text-[#7A839E]">Operating Expenses</span>
            <span className="p-1.5 rounded-lg bg-[#FDE8E8] dark:bg-[#EF4444]/15 text-[#EF4444]">
              <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#1E2238] dark:text-white">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-[#8C93AB] dark:text-[#7A839E] mt-1">
            {expenseTransactions.length} expense entries recorded
          </p>
        </div>

        {/* Card 3: Net Profit / Loss */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C93AB] dark:text-[#7A839E]">Net Profit / (Loss)</span>
            <span
              className={`p-1.5 rounded-lg ${
                isProfitable
                  ? 'bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]'
                  : 'bg-[#FDE8E8] dark:bg-[#EF4444]/15 text-[#EF4444]'
              }`}
            >
              {isProfitable ? <TrendingUp className="w-4 h-4 stroke-[2.4]" /> : <TrendingDown className="w-4 h-4 stroke-[2.4]" />}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono ${
                isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {netProfit < 0 ? '-' : ''}${Math.abs(netProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] font-semibold mt-1 flex items-center gap-1.5">
            <span className={isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'}>
              {isProfitable ? '● Profitable business period' : '▲ Net operating deficit'}
            </span>
          </p>
        </div>

        {/* Card 4: Profit Margin */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C93AB] dark:text-[#7A839E]">Net Margin</span>
            <span className="p-1.5 rounded-lg bg-[#EDEEFD] dark:bg-[#4E53EE]/15 text-[#4E53EE] dark:text-[#7378FF]">
              %
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono ${
                isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {profitMargin}%
            </span>
          </div>
          <p className="text-[11px] text-[#8C93AB] dark:text-[#7A839E] mt-1">
            Retention rate of total sales revenue
          </p>
        </div>
      </div>

      {/* Visual Cashflow Ratio Bar */}
      {totalRevenue > 0 && (
        <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#1E2238] dark:text-white flex items-center gap-2">
              <span>Operating Cashflow Breakdown</span>
              <span className="text-[10px] text-[#8C93AB] font-normal">
                (Expenses: {((totalExpenses / totalRevenue) * 100).toFixed(1)}% | Profit:{' '}
                {profitMargin}%)
              </span>
            </span>
            <span className="font-mono text-[#8C93AB]">
              Revenue: ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full h-3 bg-[#E5E7EB] dark:bg-[#2A3044] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, Math.max(0, (totalExpenses / totalRevenue) * 100))}%` }}
              className="bg-[#EF4444] h-full transition-all duration-500"
              title={`Expenses: $${totalExpenses.toLocaleString()}`}
            />
            <div
              style={{ width: `${Math.max(0, Math.min(100, (netProfit / totalRevenue) * 100))}%` }}
              className="bg-[#10B981] h-full transition-all duration-500"
              title={`Net Profit: $${netProfit.toLocaleString()}`}
            />
          </div>
          <div className="flex items-center gap-5 text-[11px] font-semibold text-[#8C93AB] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              Expenses: ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              Net Profit: ${Math.max(0, netProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Main Financial Statement Document */}
      <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] shadow-xs overflow-hidden transition-colors">
        {/* Document Header */}
        <div className="p-6 border-b border-[#F0F2F7] dark:border-[#232738] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#1E2238] dark:text-white uppercase tracking-wider">
              Statement of Profit and Loss
            </h3>
            <p className="text-xs text-[#8C93AB] dark:text-[#7A839E] mt-0.5">
              Reporting period: {startDate || 'Earliest'} to {endDate || 'Present'}
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-[#8C93AB] bg-[#F8F9FC] dark:bg-[#1F2330] px-3 py-1.5 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044]">
              Currency: {currency}
            </span>
          </div>
        </div>

        {/* Financial Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FC]/70 dark:bg-[#1F2330]/50 border-b border-[#F0F2F7] dark:border-[#232738] text-[11px] font-bold text-[#8C93AB]">
                <th className="py-3 px-5">Financial Category</th>
                <th className="py-3 px-4 text-center">Entries</th>
                <th className="py-3 px-4 text-right">Share</th>
                <th className="py-3 px-5 text-right">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F8F9FC] dark:divide-[#1F2330]">
              {/* ======================================================== */}
              {/* SECTION 1: REVENUE / INFLOW                              */}
              {/* ======================================================== */}
              <tr className="bg-[#E6F9F0]/30 dark:bg-[#10B981]/5">
                <td colSpan={4} className="py-3 px-5 font-black text-xs text-[#10B981] uppercase tracking-wider">
                  1. Operating Revenues (შემოსავლები)
                </td>
              </tr>

              {incomeCategoryList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-5 text-center text-xs text-[#8C93AB] italic">
                    No operating revenues logged in this time range.
                  </td>
                </tr>
              ) : (
                incomeCategoryList.map((cat) => {
                  const isExpanded = Boolean(expandedCategories[cat.categoryId]);
                  const share = totalRevenue > 0 ? ((cat.total / totalRevenue) * 100).toFixed(1) : '0';

                  return (
                    <React.Fragment key={cat.categoryId}>
                      <tr
                        onClick={() => toggleCategoryExpand(cat.categoryId)}
                        className="hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer select-none"
                      >
                        <td className="py-3 px-5 font-bold text-[#1E2238] dark:text-white flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#8C93AB] shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#8C93AB] shrink-0" />
                          )}
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#8C93AB]">
                          {cat.count}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#8C93AB]">
                          {share}%
                        </td>
                        <td className="py-3 px-5 text-right font-mono font-extrabold text-[#1E2238] dark:text-white">
                          ${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>

                      {/* Expandable Transaction Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <div className="bg-[#F8F9FC]/80 dark:bg-[#1F2330]/60 p-4 border-y border-[#F0F2F7] dark:border-[#2A3044] space-y-2">
                              <div className="text-[11px] font-bold text-[#8C93AB] mb-1">
                                Detailed {cat.name} Income Entries:
                              </div>
                              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                                {cat.transactions.map((tx) => (
                                  <div
                                    key={tx.id}
                                    className="flex items-center justify-between text-xs bg-white dark:bg-[#161922] p-2.5 rounded-xl border border-[#F0F2F7] dark:border-[#232738]"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-[#8C93AB] text-[11px]">{tx.date}</span>
                                      <span className="font-semibold text-[#1E2238] dark:text-white">{tx.description}</span>
                                      {tx.reference && (
                                        <span className="text-[10px] text-[#8C93AB] font-mono">
                                          (Ref: {tx.reference})
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono font-bold text-[#10B981]">
                                      +${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}

              {/* Subtotal Revenue */}
              <tr className="bg-[#E6F9F0]/60 dark:bg-[#10B981]/15 font-black text-xs border-y border-[#10B981]/20">
                <td className="py-3.5 px-5 text-[#10B981] uppercase">Total Operating Revenue</td>
                <td className="py-3.5 px-4 text-center font-mono text-[#10B981]">{incomeTransactions.length}</td>
                <td className="py-3.5 px-4 text-right font-mono text-[#10B981]">100%</td>
                <td className="py-3.5 px-5 text-right font-mono font-black text-sm text-[#10B981]">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* ======================================================== */}
              {/* SECTION 2: OPERATING EXPENSES                            */}
              {/* ======================================================== */}
              <tr className="bg-[#FDE8E8]/30 dark:bg-[#EF4444]/5">
                <td colSpan={4} className="py-3 px-5 font-black text-xs text-[#EF4444] uppercase tracking-wider">
                  2. Operating Expenses (საოპერაციო ხარჯები)
                </td>
              </tr>

              {expenseCategoryList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-5 text-center text-xs text-[#8C93AB] italic">
                    No operating expenses logged in this time range.
                  </td>
                </tr>
              ) : (
                expenseCategoryList.map((cat) => {
                  const isExpanded = Boolean(expandedCategories[cat.categoryId]);
                  const share = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0';

                  return (
                    <React.Fragment key={cat.categoryId}>
                      <tr
                        onClick={() => toggleCategoryExpand(cat.categoryId)}
                        className="hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer select-none"
                      >
                        <td className="py-3 px-5 font-bold text-[#1E2238] dark:text-white flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#8C93AB] shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#8C93AB] shrink-0" />
                          )}
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#8C93AB]">
                          {cat.count}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#8C93AB]">
                          {share}%
                        </td>
                        <td className="py-3 px-5 text-right font-mono font-extrabold text-[#EF4444]">
                          ${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>

                      {/* Expandable Expense Transaction Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <div className="bg-[#F8F9FC]/80 dark:bg-[#1F2330]/60 p-4 border-y border-[#F0F2F7] dark:border-[#2A3044] space-y-2">
                              <div className="text-[11px] font-bold text-[#8C93AB] mb-1">
                                Detailed {cat.name} Expenses:
                              </div>
                              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                                {cat.transactions.map((tx) => (
                                  <div
                                    key={tx.id}
                                    className="flex items-center justify-between text-xs bg-white dark:bg-[#161922] p-2.5 rounded-xl border border-[#F0F2F7] dark:border-[#232738]"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-[#8C93AB] text-[11px]">{tx.date}</span>
                                      <span className="font-semibold text-[#1E2238] dark:text-white">{tx.description}</span>
                                      {tx.reference && (
                                        <span className="text-[10px] text-[#8C93AB] font-mono">
                                          (Ref: {tx.reference})
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono font-bold text-[#EF4444]">
                                      -${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}

              {/* Subtotal Expenses */}
              <tr className="bg-[#FDE8E8]/60 dark:bg-[#EF4444]/15 font-black text-xs border-y border-[#EF4444]/20">
                <td className="py-3.5 px-5 text-[#EF4444] uppercase">Total Operating Expenses</td>
                <td className="py-3.5 px-4 text-center font-mono text-[#EF4444]">{expenseTransactions.length}</td>
                <td className="py-3.5 px-4 text-right font-mono text-[#EF4444]">100%</td>
                <td className="py-3.5 px-5 text-right font-mono font-black text-sm text-[#EF4444]">
                  ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* ======================================================== */}
              {/* SECTION 3: NET PROFIT / LOSS (BOTTOM LINE)               */}
              {/* ======================================================== */}
              <tr className={`border-t-2 border-b-2 font-black text-sm ${
                isProfitable
                  ? 'bg-[#E6F9F0] dark:bg-[#10B981]/20 border-[#10B981]'
                  : 'bg-[#FDE8E8] dark:bg-[#EF4444]/20 border-[#EF4444]'
              }`}>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className={isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                      NET INCOME / PROFIT (წმინდა მოგება)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isProfitable
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#EF4444] text-white'
                      }`}
                    >
                      {isProfitable ? 'PROFITABLE' : 'NET DEFICIT'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-mono text-xs text-[#5E6482] dark:text-[#949DB2]">
                  {periodTransactions.length} total tx
                </td>
                <td className="py-4 px-4 text-right font-mono font-black text-xs text-[#5E6482] dark:text-[#949DB2]">
                  Margin: {profitMargin}%
                </td>
                <td
                  className={`py-4 px-5 text-right font-mono font-black text-base ${
                    isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {netProfit < 0 ? '-' : ''}${Math.abs(netProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      <RecordExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={(msg) => {
          setSuccessToast(msg);
          setTimeout(() => setSuccessToast(null), 4000);
        }}
      />
    </div>
  );
};
