import {
  FinanceTransaction,
  ProjectEntry,
  Invoice,
  Coagent,
  Category,
  Lead,
  AppSettings,
} from '../../types';
import { AIMessage, AIVisualData } from './aiTypes';

export interface AIQueryContext {
  transactions: FinanceTransaction[];
  projects: ProjectEntry[];
  invoices: Invoice[];
  coagents: Coagent[];
  categories: Category[];
  leads: Lead[];
  settings: AppSettings;
}

const formatCurrency = (amount: number, currency = 'USD'): string => {
  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    GEL: '₾',
    CAD: 'CA$',
    CHF: 'CHF ',
  };
  const sym = symbolMap[currency] || `${currency} `;
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Parses user question and computes answer with embedded visual data.
 */
export function processAIQuery(query: string, context: AIQueryContext): AIMessage {
  const normalized = query.toLowerCase().trim();
  const currency = context.settings.defaultCurrency || 'USD';
  const now = new Date();

  // Helper date utilities
  const parseDate = (dStr: string) => new Date(dStr + 'T00:00:00');

  // 1. QUERY: "WHAT WAS MY INCOME LAST WEEK?" / "LAST WEEK INCOME"
  if (
    normalized.includes('income last week') ||
    normalized.includes('last week income') ||
    normalized.includes('revenue last week') ||
    normalized.includes('last week revenue') ||
    normalized.includes('earn last week') ||
    normalized.includes('earned last week') ||
    (normalized.includes('income') && normalized.includes('last week'))
  ) {
    // Calculate last week date bounds (Monday to Sunday of previous week)
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // This week's Monday
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - distanceToMonday);
    thisMonday.setHours(0, 0, 0, 0);

    // Last week's Monday
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    // Last week's Sunday
    const lastSunday = new Date(thisMonday);
    lastSunday.setDate(thisMonday.getDate() - 1);
    lastSunday.setHours(23, 59, 59, 999);

    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
    const startStr = formatDateStr(lastMonday);
    const endStr = formatDateStr(lastSunday);

    // Filter income transactions in that range
    const incomeTransactions = context.transactions.filter((t) => {
      if (t.type !== 'Income') return false;
      const tDate = t.date;
      return tDate >= startStr && tDate <= endStr;
    });

    // Also check paid projects in that range
    const paidProjects = context.projects.filter((p) => {
      const pDate = p.date;
      return pDate >= startStr && pDate <= endStr;
    });

    // Daily breakdown for Mon - Sun
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyIncome = [0, 0, 0, 0, 0, 0, 0];

    incomeTransactions.forEach((t) => {
      const d = parseDate(t.date);
      let dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      dailyIncome[dayIdx] += t.amount;
    });

    paidProjects.forEach((p) => {
      const d = parseDate(p.date);
      let dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      dailyIncome[dayIdx] += p.amount;
    });

    const totalIncome = dailyIncome.reduce((acc, val) => acc + val, 0);
    const avgDaily = totalIncome / 7;

    const chartData = dayNames.map((name, i) => {
      const curDate = new Date(lastMonday);
      curDate.setDate(lastMonday.getDate() + i);
      const dateLabel = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        name,
        value: dailyIncome[i],
        label: `${name} (${dateLabel})`,
        color: '#4E53EE',
      };
    });

    const visual: AIVisualData = {
      type: 'bar-chart',
      title: 'Daily Income (Last Week)',
      subtitle: `${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      data: chartData,
      totalFormatted: formatCurrency(totalIncome, currency),
      kpiCards: [
        {
          label: 'Total Income',
          value: formatCurrency(totalIncome, currency),
          isPositive: totalIncome > 0,
          subtext: `${incomeTransactions.length + paidProjects.length} entries registered`,
        },
        {
          label: 'Daily Average',
          value: formatCurrency(avgDaily, currency),
          subtext: 'Over 7 calendar days',
        },
        {
          label: 'Highest Day',
          value: formatCurrency(Math.max(...dailyIncome), currency),
          subtext: dayNames[dailyIncome.indexOf(Math.max(...dailyIncome))] || 'N/A',
        },
      ],
    };

    const text = totalIncome > 0
      ? `Your total recorded income for last week (**${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}**) was **${formatCurrency(totalIncome, currency)}** across ${incomeTransactions.length + paidProjects.length} income entries.`
      : `You had **${formatCurrency(0, currency)}** in recorded income for last week (**${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}**). You can log incoming payments in the Finances tab or record projects in the Projects tab.`;

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      visual,
      suggestions: [
        'Who is my biggest client?',
        'What was my income this month?',
        'Show expense breakdown',
        'Summarize pending invoices',
      ],
    };
  }

  // 2. QUERY: "WHO IS BIGGEST CLIENT?" / "TOP CLIENTS"
  if (
    normalized.includes('biggest client') ||
    normalized.includes('best client') ||
    normalized.includes('top client') ||
    normalized.includes('highest paying') ||
    normalized.includes('largest client') ||
    normalized.includes('biggest customer') ||
    normalized.includes('top customer')
  ) {
    if (context.coagents.length === 0) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'You do not have any registered customers/coagents yet. Once you add customers and log projects or invoices, I will analyze your top accounts by revenue.',
        suggestions: ['What was my income last week?', 'Show CRM leads', 'Give me a financial summary'],
      };
    }

    // Aggregate client revenue from projects + invoices
    const clientStats = context.coagents.map((c) => {
      const clientProjects = context.projects.filter((p) => p.coagentId === c.id);
      const projectRevenue = clientProjects.reduce((acc, p) => acc + p.amount, 0);

      const clientInvoices = context.invoices.filter((inv) => inv.coagentId === c.id);
      const invoiceTotal = clientInvoices.reduce((acc, inv) => acc + inv.amount, 0);

      const totalRevenue = Math.max(projectRevenue, invoiceTotal) || (projectRevenue + invoiceTotal) / 2 || projectRevenue;

      return {
        id: c.id,
        name: c.company ? `${c.company} (${c.name})` : c.name,
        company: c.company || c.name,
        revenue: projectRevenue > 0 ? projectRevenue : invoiceTotal,
        projectsCount: clientProjects.length,
        invoicesCount: clientInvoices.length,
      };
    });

    // Sort descending by revenue
    clientStats.sort((a, b) => b.revenue - a.revenue);

    const biggest = clientStats[0];
    const topClients = clientStats.slice(0, 5);

    const chartData = topClients.map((c, index) => ({
      name: c.company.length > 14 ? c.company.slice(0, 14) + '…' : c.company,
      value: c.revenue,
      label: c.name,
      color: index === 0 ? '#4E53EE' : index === 1 ? '#7378FF' : '#949DB2',
      meta: {
        projects: c.projectsCount,
        invoices: c.invoicesCount,
      },
    }));

    const visual: AIVisualData = {
      type: 'horizontal-bar',
      title: 'Top Clients by Revenue',
      subtitle: `Ranked by total project deliverables and billings (${context.coagents.length} clients total)`,
      data: chartData,
      totalFormatted: formatCurrency(biggest.revenue, currency),
      kpiCards: [
        {
          label: 'Rank #1 Client',
          value: biggest.company,
          subtext: `${formatCurrency(biggest.revenue, currency)} billed`,
          isPositive: true,
        },
        {
          label: 'Active Deliverables',
          value: `${biggest.projectsCount} Projects`,
          subtext: `${biggest.invoicesCount} Invoices generated`,
        },
        {
          label: 'Total Client Directory',
          value: `${context.coagents.length} Accounts`,
          subtext: 'Active CRM & Coagent partners',
        },
      ],
    };

    const text = biggest.revenue > 0
      ? `Your biggest client is **${biggest.name}** with a total revenue of **${formatCurrency(biggest.revenue, currency)}** across ${biggest.projectsCount} project deliverables and ${biggest.invoicesCount} invoices.`
      : `Your top customer is currently **${biggest.name}**. No billable project revenue has been finalized for them yet.`;

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      visual,
      suggestions: [
        'What was my income last week?',
        'Summarize pending invoices',
        'Show CRM leads pipeline',
        'Give me a financial summary',
      ],
    };
  }

  // 3. QUERY: "WHAT WAS MY INCOME THIS MONTH?" / "MONTHLY REVENUE"
  if (
    normalized.includes('income this month') ||
    normalized.includes('this month income') ||
    normalized.includes('revenue this month') ||
    normalized.includes('this month revenue')
  ) {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const startStr = monthStart.toISOString().split('T')[0];
    const endStr = monthEnd.toISOString().split('T')[0];

    const monthIncomeTx = context.transactions.filter(
      (t) => t.type === 'Income' && t.date >= startStr && t.date <= endStr
    );
    const monthProjects = context.projects.filter(
      (p) => p.date >= startStr && p.date <= endStr
    );

    const totalIncome =
      monthIncomeTx.reduce((acc, t) => acc + t.amount, 0) +
      monthProjects.reduce((acc, p) => acc + p.amount, 0);

    const monthName = now.toLocaleString('en-US', { month: 'long' });

    const visual: AIVisualData = {
      type: 'bar-chart',
      title: `${monthName} ${currentYear} Revenue`,
      subtitle: `Recorded from 1st to ${now.getDate()}th of ${monthName}`,
      data: [
        { name: 'Transactions', value: monthIncomeTx.reduce((acc, t) => acc + t.amount, 0), color: '#4E53EE' },
        { name: 'Projects', value: monthProjects.reduce((acc, p) => acc + p.amount, 0), color: '#10B981' },
      ],
      totalFormatted: formatCurrency(totalIncome, currency),
      kpiCards: [
        {
          label: `Total ${monthName} Income`,
          value: formatCurrency(totalIncome, currency),
          isPositive: totalIncome > 0,
        },
        {
          label: 'Income Transactions',
          value: `${monthIncomeTx.length} records`,
        },
        {
          label: 'Active Projects',
          value: `${monthProjects.length} milestones`,
        },
      ],
    };

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Your recorded income for **${monthName} ${currentYear}** stands at **${formatCurrency(totalIncome, currency)}**.`,
      visual,
      suggestions: [
        'What was my income last week?',
        'Who is my biggest client?',
        'Show expense breakdown',
      ],
    };
  }

  // 4. QUERY: "EXPENSES" / "EXPENSE BREAKDOWN" / "WHERE IS MY MONEY GOING?"
  if (
    normalized.includes('expense') ||
    normalized.includes('spending') ||
    normalized.includes('spent') ||
    normalized.includes('cost')
  ) {
    const expenseTx = context.transactions.filter((t) => t.type === 'Expense');
    const totalExpenses = expenseTx.reduce((acc, t) => acc + t.amount, 0);

    // Group by category
    const catMap: Record<string, number> = {};
    expenseTx.forEach((t) => {
      const catName = context.categories.find((c) => c.id === t.categoryId)?.name || 'General Expense';
      catMap[catName] = (catMap[catName] || 0) + t.amount;
    });

    const chartData = Object.entries(catMap)
      .map(([name, value], i) => {
        const colors = ['#EF4444', '#F59E0B', '#6366F1', '#EC4899', '#3B82F6', '#10B981'];
        return {
          name,
          value,
          color: colors[i % colors.length],
        };
      })
      .sort((a, b) => b.value - a.value);

    const visual: AIVisualData = {
      type: 'donut-chart',
      title: 'Expense Distribution by Category',
      subtitle: `Total recorded expenses: ${formatCurrency(totalExpenses, currency)}`,
      data: chartData,
      totalFormatted: formatCurrency(totalExpenses, currency),
      kpiCards: [
        {
          label: 'Total Expenses',
          value: formatCurrency(totalExpenses, currency),
          subtext: `${expenseTx.length} expense transactions`,
        },
        {
          label: 'Top Category',
          value: chartData[0]?.name || 'None',
          subtext: chartData[0] ? formatCurrency(chartData[0].value, currency) : '$0.00',
        },
      ],
    };

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: totalExpenses > 0
        ? `Your total recorded expenses are **${formatCurrency(totalExpenses, currency)}** across **${Object.keys(catMap).length} categories**.`
        : `You have **${formatCurrency(0, currency)}** recorded in expenses. You can add expense entries in the Finances tab.`,
      visual,
      suggestions: [
        'What was my income last week?',
        'Who is my biggest client?',
        'Give me a financial summary',
      ],
    };
  }

  // 5. QUERY: "PENDING INVOICES" / "UNPAID" / "RECEIVABLES"
  if (
    normalized.includes('unpaid') ||
    normalized.includes('pending invoice') ||
    normalized.includes('receivable') ||
    normalized.includes('due invoice') ||
    normalized.includes('invoice status') ||
    normalized.includes('invoices')
  ) {
    const pendingInvoices = context.invoices.filter(
      (inv) => inv.status === 'Sent' || inv.status === 'Draft'
    );
    const paidInvoices = context.invoices.filter((inv) => inv.status === 'Paid');

    const totalPending = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalPaid = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);

    const chartData = [
      { name: 'Sent / Draft', value: totalPending, color: '#F59E0B' },
      { name: 'Paid in Full', value: totalPaid, color: '#10B981' },
    ];

    const visual: AIVisualData = {
      type: 'bar-chart',
      title: 'Invoice Status & Receivables',
      subtitle: `${pendingInvoices.length} outstanding invoices awaiting payment`,
      data: chartData,
      totalFormatted: formatCurrency(totalPending, currency),
      kpiCards: [
        {
          label: 'Pending Receivables',
          value: formatCurrency(totalPending, currency),
          subtext: `${pendingInvoices.length} unpaid invoices`,
          isPositive: false,
        },
        {
          label: 'Collected Payments',
          value: formatCurrency(totalPaid, currency),
          subtext: `${paidInvoices.length} settled invoices`,
          isPositive: true,
        },
      ],
    };

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `You have **${pendingInvoices.length} pending invoices** totaling **${formatCurrency(totalPending, currency)}** waiting for client settlement.`,
      visual,
      suggestions: [
        'Who is my biggest client?',
        'What was my income last week?',
        'Show CRM leads pipeline',
      ],
    };
  }

  // 6. QUERY: "CRM LEADS" / "PIPELINE" / "LEAD STATUS"
  if (
    normalized.includes('lead') ||
    normalized.includes('crm') ||
    normalized.includes('pipeline') ||
    normalized.includes('conversion')
  ) {
    const totalLeads = context.leads.length;
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'] as const;
    const stageCounts: Record<string, number> = {};
    let totalPipelineValue = 0;

    stages.forEach((s) => (stageCounts[s] = 0));
    context.leads.forEach((l) => {
      stageCounts[l.status] = (stageCounts[l.status] || 0) + 1;
      if (l.status !== 'Lost') {
        totalPipelineValue += l.value;
      }
    });

    const wonCount = stageCounts['Won'] || 0;
    const conversionRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : '0.0';

    const chartData = stages.map((s) => ({
      name: s,
      value: stageCounts[s],
      color: s === 'Won' ? '#10B981' : s === 'Lost' ? '#EF4444' : '#4E53EE',
    }));

    const visual: AIVisualData = {
      type: 'bar-chart',
      title: 'CRM Sales Funnel',
      subtitle: `Total Pipeline Value: ${formatCurrency(totalPipelineValue, currency)}`,
      data: chartData,
      kpiCards: [
        {
          label: 'Total Leads',
          value: `${totalLeads}`,
          subtext: `${formatCurrency(totalPipelineValue, currency)} in pipeline`,
        },
        {
          label: 'Won Deals',
          value: `${wonCount}`,
          subtext: `${conversionRate}% conversion rate`,
          isPositive: true,
        },
      ],
    };

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Your CRM pipeline has **${totalLeads} leads** with an estimated active pipeline value of **${formatCurrency(totalPipelineValue, currency)}** and a **${conversionRate}% win rate**.`,
      visual,
      suggestions: [
        'Who is my biggest client?',
        'What was my income last week?',
        'Give me a financial summary',
      ],
    };
  }

  // 6.5 QUERY: "P&L" / "PROFIT AND LOSS" / "მოგება ზარალი" / "NET PROFIT"
  if (
    normalized.includes('p&l') ||
    normalized.includes('p and l') ||
    normalized.includes('pnl') ||
    normalized.includes('profit and loss') ||
    normalized.includes('მოგება') ||
    normalized.includes('ზარალი') ||
    normalized.includes('net profit') ||
    normalized.includes('profit margin')
  ) {
    const totalIncome = context.transactions
      .filter((t) => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = context.transactions
      .filter((t) => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const isProfitable = netProfit >= 0;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

    const visual: AIVisualData = {
      type: 'bar-chart',
      title: 'P&L Statement (მოგება-ზარალი)',
      subtitle: `Net Profit: ${formatCurrency(netProfit, currency)} (Margin: ${profitMargin}%)`,
      data: [
        { name: 'Operating Revenue', value: totalIncome, color: '#10B981' },
        { name: 'Operating Expenses', value: totalExpense, color: '#EF4444' },
        { name: 'Net Income', value: Math.max(0, netProfit), color: isProfitable ? '#4E53EE' : '#EF4444' },
      ],
      totalFormatted: formatCurrency(netProfit, currency),
      kpiCards: [
        {
          label: 'Total Revenue',
          value: formatCurrency(totalIncome, currency),
          isPositive: true,
          subtext: 'Operating inflows',
        },
        {
          label: 'Operating Expenses',
          value: formatCurrency(totalExpense, currency),
          subtext: 'Operating outflows',
        },
        {
          label: 'Net Profit / Margin',
          value: `${formatCurrency(netProfit, currency)}`,
          isPositive: isProfitable,
          subtext: `${profitMargin}% margin`,
        },
      ],
    };

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: isProfitable
        ? `Here is your **P&L Statement (Profit & Loss / მოგება-ზარალი)**:\n\n• **Operating Revenue:** ${formatCurrency(totalIncome, currency)}\n• **Operating Expenses:** ${formatCurrency(totalExpense, currency)}\n• **Net Profit:** **${formatCurrency(netProfit, currency)}** (${profitMargin}% margin).\n\nYour business is operating at a net profit! You can view the full category statement on the **P&L & Analytics** page.`
        : `Here is your **P&L Statement (Profit & Loss / მოგება-ზარალი)**:\n\n• **Operating Revenue:** ${formatCurrency(totalIncome, currency)}\n• **Operating Expenses:** ${formatCurrency(totalExpense, currency)}\n• **Net Loss:** **-${formatCurrency(Math.abs(netProfit), currency)}** (${profitMargin}% margin).\n\nExpenses currently exceed revenue in recorded transactions.`,
      visual,
      suggestions: [
        'Show expense breakdown',
        'Who is my biggest client?',
        'What was my income last week?',
        'Summarize pending invoices',
      ],
    };
  }

  // 7. QUERY: "FINANCIAL SUMMARY" / "OVERVIEW" / "HOW AM I DOING?"
  if (
    normalized.includes('summary') ||
    normalized.includes('overview') ||
    normalized.includes('health') ||
    normalized.includes('how am i doing') ||
    normalized.includes('report')
  ) {
    const totalIncome = context.transactions
      .filter((t) => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0) +
      context.projects.reduce((acc, p) => acc + p.amount, 0);

    const totalExpense = context.transactions
      .filter((t) => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

    const visual: AIVisualData = {
      type: 'bar-chart',
      title: 'Financial Health Snapshot',
      subtitle: `Net Margin: ${profitMargin}%`,
      data: [
        { name: 'Total Revenue', value: totalIncome, color: '#10B981' },
        { name: 'Total Expenses', value: totalExpense, color: '#EF4444' },
        { name: 'Net Profit', value: Math.max(0, netProfit), color: '#4E53EE' },
      ],
      totalFormatted: formatCurrency(netProfit, currency),
      kpiCards: [
        {
          label: 'Total Revenue',
          value: formatCurrency(totalIncome, currency),
          isPositive: true,
        },
        {
          label: 'Net Profit',
          value: formatCurrency(netProfit, currency),
          isPositive: netProfit >= 0,
        },
        {
          label: 'Active Clients',
          value: `${context.coagents.length}`,
          subtext: `${context.projects.length} project milestones`,
        },
      ],
    };

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Here is your current financial summary: Your total revenue is **${formatCurrency(totalIncome, currency)}**, expenses are **${formatCurrency(totalExpense, currency)}**, resulting in a net profit of **${formatCurrency(netProfit, currency)}** (${profitMargin}% margin).`,
      visual,
      suggestions: [
        'What was my income last week?',
        'Who is my biggest client?',
        'Show expense breakdown',
        'Summarize pending invoices',
      ],
    };
  }

  // DEFAULT / FALLBACK RESPONSE
  const totalProjects = context.projects.length;
  const totalClients = context.coagents.length;

  return {
    id: Date.now().toString(),
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `I'm your **Financial AI Assistant**! I can analyze your live accounts, calculate exact figures, and generate interactive charts for you.\n\nTry asking me any of these questions:`,
    visual: {
      type: 'kpi-cards',
      title: 'Current Workspace Metrics',
      kpiCards: [
        { label: 'Active Clients', value: `${totalClients} accounts` },
        { label: 'Logged Projects', value: `${totalProjects} milestones` },
        { label: 'Invoices', value: `${context.invoices.length} issued` },
        { label: 'CRM Leads', value: `${context.leads.length} in pipeline` },
      ],
    },
    suggestions: [
      'What was my income last week?',
      'Who is my biggest client?',
      'What was my income this month?',
      'Show expense breakdown',
      'Summarize pending invoices',
    ],
  };
}
