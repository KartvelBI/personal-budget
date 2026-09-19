import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  Plus,
  Trash2,
  X,
  CreditCard,
  Package,
  UserCheck,
  Headphones,
  Watch,
  Speaker,
  Smartphone,
  Zap,
  Search,
  Calendar,
  Filter,
} from 'lucide-react';

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

const getPresetDates = (preset: DatePreset): { start: string; end: string } => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { start: todayStr, end: todayStr };
    case 'this_week': {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff)).toISOString().split('T')[0];
      return { start: monday, end: todayStr };
    }
    case 'this_month': {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      return { start: `${y}-${m}-01`, end: todayStr };
    }
    case 'this_year': {
      const y = now.getFullYear();
      return { start: `${y}-01-01`, end: todayStr };
    }
    case 'all':
    default:
      return { start: '', end: '' };
  }
};

const PRESET_LABELS: Record<DatePreset, string> = {
  all: 'All Time',
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  this_year: 'This Year',
  custom: 'Custom Range',
};

export const FinancesTab: React.FC = () => {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    categories,
    coagents,
    projects,
    invoices,
    settings,
    setActiveTab,
    theme,
  } = useBudget();

  const [typeFilter, setTypeFilter] = useState<'all' | 'Income' | 'Expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Date Filter State
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

  // Filtered Datasets by Date Range
  const dateFilteredTransactions = transactions.filter((t) => isDateInRange(t.date));
  const dateFilteredProjects = projects.filter((p) => isDateInRange(p.date));
  const dateFilteredInvoices = invoices.filter((inv) => isDateInRange(inv.issueDate));

  // Filtered Metrics
  const periodIncomeTransactions = dateFilteredTransactions.filter((t) => t.type === 'Income');
  const periodTotalRevenue = periodIncomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const periodPendingOrders = dateFilteredProjects.filter((p) => p.status === 'Pending').length;
  const periodFulfilledCount = dateFilteredProjects.filter(
    (p) => p.status === 'Transferred' || p.status === 'Invoiced' || p.status === 'Paid'
  ).length;
  const periodFulfillmentRate =
    dateFilteredProjects.length > 0
      ? ((periodFulfilledCount / dateFilteredProjects.length) * 100).toFixed(1)
      : '0.0';

  const activeCoagentIds = new Set([
    ...dateFilteredProjects.map((p) => p.coagentId),
    ...dateFilteredInvoices.map((i) => i.coagentId),
    ...dateFilteredTransactions.map((t) => t.coagentId).filter(Boolean),
  ]);
  const periodActiveCustomers =
    datePreset === 'all'
      ? coagents.length
      : coagents.filter((c) => activeCoagentIds.has(c.id)).length;

  // Real Sales Overview chart data from actual Income transactions within date range
  const salesByDate: Record<string, number> = {};
  periodIncomeTransactions.forEach((t) => {
    salesByDate[t.date] = (salesByDate[t.date] || 0) + t.amount;
  });

  const chartEntries = Object.entries(salesByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, sales]) => ({ date: date.slice(5), sales }));

  const salesOverviewData = chartEntries.length > 0 ? chartEntries : [{ date: 'Today', sales: 0 }];

  // Recent Orders (sorted newest first)
  const recentOrdersList = [...dateFilteredProjects]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Top Deliverables (sorted by revenue descending)
  const topDeliverables = Object.entries(
    dateFilteredProjects.reduce((acc, p) => {
      const key = p.note || 'Service Milestone';
      acc[key] = (acc[key] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Recent Activity from filtered records
  const recentActivities = [
    ...dateFilteredInvoices.map((inv) => ({
      icon: CreditCard,
      color: 'bg-[#EDEEFD] dark:bg-[#4E53EE]/15 text-[#4E53EE] dark:text-[#7378FF]',
      title: `Invoice ${inv.invoiceNumber} (${inv.status})`,
      desc: `$${inv.amount.toLocaleString()} for client`,
      time: inv.issueDate,
    })),
    ...dateFilteredProjects.map((p) => ({
      icon: ShoppingCart,
      color: 'bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]',
      title: `Project: ${p.note || 'Milestone'}`,
      desc: `$${p.amount.toLocaleString()} - ${p.status}`,
      time: p.date,
    })),
    ...dateFilteredTransactions.map((t) => ({
      icon: t.type === 'Income' ? ArrowUpRight : ArrowDownLeft,
      color: t.type === 'Income' ? 'bg-[#E6F9F0] text-[#10B981]' : 'bg-[#FDE8E8] text-[#EF4444]',
      title: `${t.type}: ${t.description}`,
      desc: `$${t.amount.toLocaleString()} (${t.currency})`,
      time: t.date,
    })),
  ]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 4);

  // New Transaction Form
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Expense' as 'Income' | 'Expense',
    categoryId: categories.find((c) => c.type === 'Expense')?.id || categories[0]?.id || '',
    amount: '',
    currency: settings.defaultCurrency || 'USD',
    description: '',
    coagentId: '',
    reference: '',
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    addTransaction({
      date: formData.date,
      type: formData.type,
      categoryId: formData.categoryId,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      description: formData.description || (formData.type === 'Income' ? 'Direct Income' : 'Direct Expense'),
      coagentId: formData.coagentId || undefined,
      reference: formData.reference || undefined,
    });

    setIsAddModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      categoryId: categories.find((c) => c.type === 'Expense')?.id || categories[0]?.id || '',
      amount: '',
      currency: settings.defaultCurrency || 'USD',
      description: '',
      coagentId: '',
      reference: '',
    });
  };

  const filteredTransactions = dateFilteredTransactions.filter((t) => {
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const cat = categories.find((c) => c.id === t.categoryId);
    const coagent = coagents.find((c) => c.id === t.coagentId);

    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coagent?.company || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* ROW 0: DATE FILTER CONTROLS BAR                          */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#161922] rounded-2xl p-4 sm:p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] flex items-center justify-center shadow-xs shrink-0">
              <Calendar className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Date Filter</h3>
                {datePreset !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E6F9F0] text-[#10B981] dark:bg-[#10B981]/20">
                    Active Filter
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C93AB] dark:text-[#7A839E] font-medium mt-0.5">
                {datePreset === 'all'
                  ? 'Showing all-time records across all dashboard metrics'
                  : `Filtering metrics between ${startDate || 'earliest'} and ${endDate || 'present'}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Presets */}
            <div className="flex flex-wrap bg-[#F8F9FC] dark:bg-[#1F2330] p-1 rounded-xl text-xs font-bold text-[#5E6482] dark:text-[#949DB2] border border-[#F0F2F7] dark:border-[#2A3044]">
              {(
                [
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'this_year', label: 'This Year' },
                  { id: 'custom', label: 'Custom' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg transition text-xs font-bold cursor-pointer ${
                    datePreset === p.id
                      ? 'bg-[#4E53EE] text-white shadow-xs'
                      : 'hover:text-[#1E2238] dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Range Inputs */}
            <div className="flex items-center gap-2 bg-[#F8F9FC] dark:bg-[#1F2330] px-3 py-1.5 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044]">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-[#8C93AB]">From</span>
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
                <span className="text-[10px] font-bold uppercase text-[#8C93AB]">To</span>
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

            {/* Reset Button */}
            {datePreset !== 'all' && (
              <button
                onClick={() => handlePresetChange('all')}
                className="p-2 rounded-xl text-[#8C93AB] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                title="Reset date filter"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 1: 4 STAT KPI CARDS                                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#4E53EE] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#4E53EE]/25">
            <DollarSign className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Total Revenue</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              ${periodTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              {periodIncomeTransactions.length} income records
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#10B981]/25">
            <ShoppingCart className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Total Orders / Projects</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              {dateFilteredProjects.length.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              {periodPendingOrders} pending delivery
            </span>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#F59E0B]/25">
            <Users className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Total Customers</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              {periodActiveCustomers.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              {datePreset === 'all' ? 'Active directory' : `active of ${coagents.length} clients`}
            </span>
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#6366F1]/25">
            <TrendingUp className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Fulfillment Rate</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              {periodFulfillmentRate}%
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              Completed ratio
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: SALES OVERVIEW + RECENT ORDERS                     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Area Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161922] rounded-2xl p-5.5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Sales Overview</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] text-xs font-semibold text-[#5E6482] dark:text-[#949DB2] bg-[#F8F9FC] dark:bg-[#1F2330]">
              <Calendar className="w-3.5 h-3.5 text-[#4E53EE]" />
              <span>{PRESET_LABELS[datePreset] || 'Custom Range'}</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4E53EE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4E53EE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#232738' : '#F0F2F7'} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8C93AB' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#8C93AB' }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#161922' : '#FFFFFF',
                    borderRadius: '12px',
                    border: theme === 'dark' ? '1px solid #2A3044' : 'none',
                    color: theme === 'dark' ? '#FFFFFF' : '#1E2238',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="natural"
                  dataKey="sales"
                  stroke="#4E53EE"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  dot={{ r: 3, fill: '#4E53EE', strokeWidth: 2, stroke: theme === 'dark' ? '#161922' : '#FFFFFF' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161922] rounded-2xl p-5.5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Recent Orders</h2>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-bold text-[#4E53EE] dark:text-[#7378FF] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F0F2F7] dark:border-[#232738] text-[11px] font-bold text-[#8C93AB] dark:text-[#7A839E] pb-2">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FC] dark:divide-[#1F2330]">
                {recentOrdersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-[#8C93AB]">
                      {datePreset !== 'all'
                        ? 'No orders or project deliverables in this date range'
                        : 'No orders or project deliverables recorded yet'}
                    </td>
                  </tr>
                ) : (
                  recentOrdersList.map((p) => {
                    const coagent = coagents.find((c) => c.id === p.coagentId);
                    const statusColor =
                      p.status === 'Transferred'
                        ? 'bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]'
                        : p.status === 'Invoiced'
                        ? 'bg-[#EDEEFD] dark:bg-[#4E53EE]/15 text-[#4E53EE]'
                        : 'bg-[#FEF6E7] dark:bg-[#F59E0B]/15 text-[#F59E0B]';

                    return (
                      <tr key={p.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition">
                        <td className="py-2.5 font-mono font-bold text-[#1E2238] dark:text-white">
                          #ORD-{p.id.slice(-4).toUpperCase()}
                        </td>
                        <td className="py-2.5 font-medium text-[#5E6482] dark:text-[#949DB2]">
                          {coagent?.company || coagent?.name || 'Client'}
                        </td>
                        <td className="py-2.5 text-right font-extrabold font-mono text-[#1E2238] dark:text-white">
                          ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: TOP PRODUCTS + RECENT ACTIVITY                    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-6 bg-white dark:bg-[#161922] rounded-2xl p-5.5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Top Deliverables</h2>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-bold text-[#4E53EE] dark:text-[#7378FF] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5">
            {topDeliverables.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C93AB]">
                {datePreset !== 'all'
                  ? 'No deliverables recorded in this date range'
                  : 'No deliverables recorded yet'}
              </div>
            ) : (
              topDeliverables.map(([name, revenue], idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#F8F9FC] dark:bg-[#1F2330] border border-[#F0F2F7] dark:border-[#2A3044] flex items-center justify-center text-[#5E6482] dark:text-[#949DB2] shadow-2xs">
                      <Package className="w-6.5 h-6.5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <span className="block font-bold text-[#1E2238] dark:text-white text-[13px]">{name}</span>
                      <span className="block text-[11px] text-[#8C93AB] dark:text-[#7A839E] font-mono mt-0.5">Project Scope</span>
                    </div>
                  </div>
                  <div className="font-mono font-extrabold text-[#1E2238] dark:text-white text-sm">
                    ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-6 bg-white dark:bg-[#161922] rounded-2xl p-5.5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Recent Activity</h2>
            <button
              onClick={() => setActiveTab('finances')}
              className="text-xs font-bold text-[#4E53EE] dark:text-[#7378FF] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C93AB]">
                {datePreset !== 'all'
                  ? 'No recent activity in this date range'
                  : 'No recent activity recorded yet'}
              </div>
            ) : (
              recentActivities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3.5 text-xs">
                    <div className={`w-11 h-11 rounded-2xl ${act.color} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <Icon className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1E2238] dark:text-white leading-tight text-xs">{act.title}</p>
                      <p className="text-[11px] text-[#8C93AB] dark:text-[#7A839E] truncate mt-0.5">{act.desc}</p>
                    </div>
                    <span className="text-[10px] text-[#8C93AB] dark:text-[#7A839E] shrink-0 font-mono">{act.time}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 4: COMPLETE FINANCIAL LEDGER                          */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-extrabold text-[#1E2238] dark:text-white">Financial Ledger</h2>
            <p className="text-xs text-[#8C93AB] dark:text-[#7A839E] mt-0.5">
              Live records of all income and expenses across all client projects
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-[#F8F9FC] dark:bg-[#1F2330] p-1 rounded-xl text-xs font-bold text-[#5E6482] dark:text-[#949DB2] border border-[#F0F2F7] dark:border-[#2A3044]">
              {(['all', 'Income', 'Expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg transition capitalize cursor-pointer ${
                    typeFilter === t
                      ? 'bg-white dark:bg-[#252A3D] text-[#1E2238] dark:text-white shadow-xs'
                      : 'hover:text-[#1E2238] dark:hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C93AB] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 text-xs bg-[#F8F9FC] dark:bg-[#1F2330] border border-[#F0F2F7] dark:border-[#2A3044] rounded-xl outline-none focus:border-[#4E53EE] text-[#1E2238] dark:text-white"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4E53EE] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0F2F7] dark:border-[#232738] text-[11px] font-bold text-[#8C93AB] dark:text-[#7A839E] bg-[#F8F9FC]/60 dark:bg-[#1F2330]/60">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F9FC] dark:divide-[#1F2330]">
              {filteredTransactions.map((tx) => {
                const category = categories.find((c) => c.id === tx.categoryId);
                const coagent = coagents.find((c) => c.id === tx.coagentId);

                return (
                  <tr key={tx.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition">
                    <td className="py-3 px-3 font-semibold text-[#1E2238] dark:text-white whitespace-nowrap font-mono">{tx.date}</td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {tx.type === 'Income' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10.5px] bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]">
                          <ArrowDownLeft className="w-3 h-3" />
                          Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10.5px] bg-[#FDE8E8] dark:bg-[#EF4444]/15 text-[#EF4444]">
                          <ArrowUpRight className="w-3 h-3" />
                          Expense
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {category ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px]"
                          style={{
                            backgroundColor: `${category.color}15`,
                            color: category.color,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }}></span>
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-[#8C93AB]">Uncategorized</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-medium text-[#1E2238] dark:text-white max-w-sm truncate" title={tx.description}>
                      {tx.description}
                    </td>

                    <td className="py-3 px-3 text-[#5E6482] dark:text-[#949DB2] whitespace-nowrap">
                      {tx.reference && <span className="font-mono text-[11px] bg-[#F0F2F7] dark:bg-[#232738] px-1.5 py-0.5 rounded mr-1.5">{tx.reference}</span>}
                      {coagent && <span>{coagent.company || coagent.name}</span>}
                      {!tx.reference && !coagent && <span className="text-slate-400">—</span>}
                    </td>

                    <td className={`py-3 px-3 text-right font-extrabold font-mono whitespace-nowrap ${
                      tx.type === 'Income' ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}>
                      {tx.type === 'Income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('Delete this transaction?')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8C93AB]">
                    <CreditCard className="w-10 h-10 mx-auto text-[#8C93AB]/40 mb-2 stroke-[2]" />
                    <p className="font-bold text-[#1E2238] dark:text-white">No Financial Transactions</p>
                    <p className="mt-1">Click "Add Entry" above to record income or expenses.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161922] rounded-2xl shadow-2xl overflow-hidden my-8 border border-[#F0F2F7] dark:border-[#232738]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F7] dark:border-[#232738] bg-[#F8F9FC] dark:bg-[#1F2330]">
              <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Record Financial Transaction</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const firstExp = categories.find((c) => c.type === 'Expense')?.id || categories[0]?.id || '';
                    setFormData({ ...formData, type: 'Expense', categoryId: firstExp });
                  }}
                  className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    formData.type === 'Expense'
                      ? 'bg-[#EF4444] text-white shadow-xs'
                      : 'bg-[#F8F9FC] dark:bg-[#1F2330] text-[#5E6482] dark:text-[#949DB2] hover:bg-[#F0F2F7]'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstInc = categories.find((c) => c.type === 'Income')?.id || categories[0]?.id || '';
                    setFormData({ ...formData, type: 'Income', categoryId: firstInc });
                  }}
                  className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    formData.type === 'Income'
                      ? 'bg-[#10B981] text-white shadow-xs'
                      : 'bg-[#F8F9FC] dark:bg-[#1F2330] text-[#5E6482] dark:text-[#949DB2] hover:bg-[#F0F2F7]'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Income (+)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                  >
                    {categories
                      .filter((c) => c.type === formData.type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1">Amount *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1">Currency *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE] font-mono"
                  >
                    {settings.availableCurrencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS hosting, Client consultation fee"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0F2F7] dark:border-[#232738]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1F2330] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#4E53EE] hover:bg-[#4338CA] rounded-xl shadow-xs transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
