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
} from 'lucide-react';

const SALES_OVERVIEW_DATA = [
  { date: 'Jun 01', sales: 6000 },
  { date: 'Jun 05', sales: 11000 },
  { date: 'Jun 10', sales: 8500 },
  { date: 'Jun 15', sales: 15500 },
  { date: 'Jun 20', sales: 12000 },
  { date: 'Jun 25', sales: 19500 },
  { date: 'Jun 30', sales: 14000 },
];

export const FinancesTab: React.FC = () => {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    categories,
    coagents,
    totals,
    projects,
    settings,
    setActiveTab,
    theme,
  } = useBudget();

  const [typeFilter, setTypeFilter] = useState<'all' | 'Income' | 'Expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const filteredTransactions = transactions.filter((t) => {
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
      {/* ROW 1: 4 STAT KPI CARDS                                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-full bg-[#4E53EE] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#4E53EE]/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Total Revenue</span>
            <div className="text-xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              ${totals.totalIncome > 0 ? totals.totalIncome.toLocaleString() : '18,750'}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              ↑ 10.3% <span className="text-[#8C93AB] dark:text-[#7A839E] font-normal font-sans">vs last month</span>
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#10B981]/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Total Orders</span>
            <div className="text-xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              {projects.length > 0 ? projects.length : '1,245'}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              ↑ 8.2% <span className="text-[#8C93AB] dark:text-[#7A839E] font-normal font-sans">vs last month</span>
            </span>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-full bg-[#F59E0B] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#F59E0B]/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Total Customers</span>
            <div className="text-xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              {coagents.length > 0 ? coagents.length : '2,458'}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              ↑ 11.7% <span className="text-[#8C93AB] dark:text-[#7A839E] font-normal font-sans">vs last month</span>
            </span>
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#6366F1]/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Conversion Rate</span>
            <div className="text-xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              3.24%
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              ↑ 5.6% <span className="text-[#8C93AB] dark:text-[#7A839E] font-normal font-sans">vs last month</span>
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
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] text-xs font-semibold text-[#5E6482] dark:text-[#949DB2] hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition">
              <span>This Month</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_OVERVIEW_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              className="text-xs font-bold text-[#4E53EE] dark:text-[#7378FF] hover:underline"
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
                {[
                  { id: '#ORD-001', cust: 'John Smith', amt: '$240.00', status: 'Completed', color: 'bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]' },
                  { id: '#ORD-002', cust: 'Sarah Lee', amt: '$180.00', status: 'Pending', color: 'bg-[#FEF6E7] dark:bg-[#F59E0B]/15 text-[#F59E0B]' },
                  { id: '#ORD-003', cust: 'Michael Brown', amt: '$150.00', status: 'Completed', color: 'bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]' },
                  { id: '#ORD-004', cust: 'Emily Davis', amt: '$210.00', status: 'Cancelled', color: 'bg-[#FDE8E8] dark:bg-[#EF4444]/15 text-[#EF4444]' },
                  { id: '#ORD-005', cust: 'David Wilson', amt: '$110.00', status: 'Completed', color: 'bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]' },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition">
                    <td className="py-2.5 font-mono font-bold text-[#1E2238] dark:text-white">{row.id}</td>
                    <td className="py-2.5 font-medium text-[#5E6482] dark:text-[#949DB2]">{row.cust}</td>
                    <td className="py-2.5 text-right font-extrabold font-mono text-[#1E2238] dark:text-white">{row.amt}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Top Products</h2>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-bold text-[#4E53EE] dark:text-[#7378FF] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5">
            {[
              { icon: Headphones, name: 'Wireless Headphone', sold: '320 Sold', revenue: '$32,000' },
              { icon: Watch, name: 'Smart Watch', sold: '210 Sold', revenue: '$21,000' },
              { icon: Speaker, name: 'Bluetooth Speaker', sold: '185 Sold', revenue: '$12,500' },
              { icon: Smartphone, name: 'Phone Case', sold: '150 Sold', revenue: '$7,500' },
              { icon: Zap, name: 'Charger Adapter', sold: '120 Sold', revenue: '$5,000' },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F9FC] dark:bg-[#1F2330] border border-[#F0F2F7] dark:border-[#2A3044] flex items-center justify-center text-[#5E6482] dark:text-[#949DB2]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#1E2238] dark:text-white">{p.name}</span>
                      <span className="block text-[11px] text-[#8C93AB] dark:text-[#7A839E] font-mono">{p.sold}</span>
                    </div>
                  </div>
                  <div className="font-mono font-extrabold text-[#1E2238] dark:text-white">{p.revenue}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-6 bg-white dark:bg-[#161922] rounded-2xl p-5.5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Recent Activity</h2>
            <button
              onClick={() => setActiveTab('finances')}
              className="text-xs font-bold text-[#4E53EE] dark:text-[#7378FF] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: ShoppingCart,
                color: 'bg-[#EDEEFD] dark:bg-[#4E53EE]/15 text-[#4E53EE] dark:text-[#7378FF]',
                title: 'New order received',
                desc: 'Order #ORD-001 by John Smith',
                time: '2 mins ago',
              },
              {
                icon: UserCheck,
                color: 'bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981]',
                title: 'New customer registered',
                desc: 'Sarah Lee created an account',
                time: '1 hour ago',
              },
              {
                icon: CreditCard,
                color: 'bg-[#FEF6E7] dark:bg-[#F59E0B]/15 text-[#F59E0B]',
                title: 'Payment confirmed',
                desc: '$240.00 received via Stripe',
                time: '3 hours ago',
              },
              {
                icon: Package,
                color: 'bg-[#FDE8E8] dark:bg-[#EF4444]/15 text-[#EF4444]',
                title: 'Product updated',
                desc: 'Smart Watch inventory adjusted',
                time: '5 hours ago',
              },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className={`w-8 h-8 rounded-xl ${act.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1E2238] dark:text-white leading-tight">{act.title}</p>
                    <p className="text-[11px] text-[#8C93AB] dark:text-[#7A839E] truncate">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-[#8C93AB] dark:text-[#7A839E] shrink-0 font-mono">{act.time}</span>
                </div>
              );
            })}
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
