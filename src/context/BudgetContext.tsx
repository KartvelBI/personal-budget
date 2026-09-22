import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppSettings,
  Category,
  Coagent,
  Invoice,
  InvoiceStatus,
  ProjectEntry,
  FinanceTransaction,
  ActiveTab,
  Lead,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COAGENTS,
  INITIAL_INVOICES,
  INITIAL_PROJECTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '../data/seedData';

interface BudgetContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  coagents: Coagent[];
  categories: Category[];
  projects: ProjectEntry[];
  invoices: Invoice[];
  transactions: FinanceTransaction[];
  settings: AppSettings;
  leads: Lead[];

  // CRM Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLead: (id: string, updated: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => Coagent;
  
  // Coagent actions
  addCoagent: (coagent: Omit<Coagent, 'id' | 'createdAt'>) => Coagent;
  updateCoagent: (id: string, coagent: Partial<Coagent>) => void;
  deleteCoagent: (id: string) => void;

  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Project actions
  addProject: (project: Omit<ProjectEntry, 'id' | 'createdAt' | 'status' | 'invoiceId'> & { status?: ProjectEntry['status'] }) => ProjectEntry;
  updateProject: (id: string, project: Partial<ProjectEntry>) => void;
  deleteProject: (id: string) => void;
  sendAutomatedInvoice: (projectId: string) => Invoice;

  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoice: (id: string, updated: Partial<Invoice>) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;

  // Transaction actions
  addTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => FinanceTransaction;
  deleteTransaction: (id: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Theme & Layout controls
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  toggleAIAssistant: () => void;

  // State maintenance
  resetData: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;

  // Quick stats
  totals: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    pendingIncome: number;
    unpaidInvoicesCount: number;
  };
}

const STORAGE_KEYS = {
  COAGENTS: 'pb_coagents_v2',
  CATEGORIES: 'pb_categories_v2',
  PROJECTS: 'pb_projects_v2',
  INVOICES: 'pb_invoices_v2',
  TRANSACTIONS: 'pb_transactions_v2',
  SETTINGS: 'pb_settings_v2',
  LEADS: 'pb_leads_v1',
  THEME: 'pb_theme_v1',
  SIDEBAR: 'pb_sidebar_v1',
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('projects');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Clean legacy mock data keys if present
  useEffect(() => {
    ['pb_coagents_v1', 'pb_categories_v1', 'pb_projects_v1', 'pb_invoices_v1', 'pb_transactions_v1', 'pb_settings_v1'].forEach((k) => {
      localStorage.removeItem(k);
    });
  }, []);

  const [coagents, setCoagents] = useState<Coagent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COAGENTS);
    return saved ? JSON.parse(saved) : INITIAL_COAGENTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [projects, setProjects] = useState<ProjectEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEADS);
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);

  const toggleAIAssistant = () => {
    setIsAIAssistantOpen((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COAGENTS, JSON.stringify(coagents));
  }, [coagents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }, [leads]);

  // CRM Lead Handlers
  const addLead = (data: Omit<Lead, 'id' | 'createdAt'>): Lead => {
    const newLead: Lead = {
      ...data,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = (id: string, updated: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated, updatedAt: new Date().toISOString() } : l))
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const convertLeadToCustomer = (leadId: string): Coagent => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const newCoagent: Coagent = {
      id: `co-${Date.now()}`,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      address: '',
      defaultCurrency: lead.currency || settings.defaultCurrency || 'USD',
      notes: `Converted from CRM Lead (${lead.title || lead.source || 'Direct'}) - Deal Value: $${lead.value}`,
      createdAt: new Date().toISOString(),
    };
    setCoagents((prev) => [newCoagent, ...prev]);

    // Mark lead status as Won
    updateLead(leadId, { status: 'Won' });
    return newCoagent;
  };

  // Coagent Handlers
  const addCoagent = (data: Omit<Coagent, 'id' | 'createdAt'>): Coagent => {
    const newCoagent: Coagent = {
      ...data,
      id: `co-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCoagents((prev) => [newCoagent, ...prev]);
    return newCoagent;
  };

  const updateCoagent = (id: string, updated: Partial<Coagent>) => {
    setCoagents((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCoagent = (id: string) => {
    setCoagents((prev) => prev.filter((c) => c.id !== id));
  };

  // Category Handlers
  const addCategory = (data: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Invoice Handlers
  const addInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const nextNum = invoices.length + 1;
    const invNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    const now = new Date().toISOString();
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const updated: Invoice = {
          ...inv,
          status,
          paidAt: status === 'Paid' ? now : inv.paidAt,
          sentAt: status === 'Sent' && !inv.sentAt ? now : inv.sentAt,
        };

        // If marked as Paid, also record a Finance transaction if not already created
        if (status === 'Paid') {
          const alreadyExists = transactions.some((t) => t.reference === inv.invoiceNumber);
          if (!alreadyExists) {
            const coagent = coagents.find((c) => c.id === inv.coagentId);
            const project = projects.find((p) => p.id === inv.projectId);
            addTransaction({
              date: new Date().toISOString().split('T')[0],
              type: 'Income',
              categoryId: project?.categoryId || categories[0]?.id || 'cat-1',
              amount: inv.amount,
              currency: inv.currency,
              description: `Invoice ${inv.invoiceNumber} paid - ${coagent?.name || coagent?.company || 'Client'}`,
              coagentId: inv.coagentId,
              projectId: inv.projectId,
              reference: inv.invoiceNumber,
            });
          }
        }
        return updated;
      })
    );
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updated } : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    // update any project linked to this invoice
    setProjects((prev) =>
      prev.map((p) => (p.invoiceId === id ? { ...p, status: 'Pending', invoiceId: undefined } : p))
    );
  };

  // Project Handlers
  const addProject = (
    data: Omit<ProjectEntry, 'id' | 'createdAt' | 'status' | 'invoiceId'> & { status?: ProjectEntry['status'] }
  ): ProjectEntry => {
    const newProject: ProjectEntry = {
      ...data,
      id: `proj-${Date.now()}`,
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, updated: Partial<ProjectEntry>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Automated Invoice creation from a project
  const sendAutomatedInvoice = (projectId: string): Invoice => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const coagent = coagents.find((c) => c.id === project.coagentId);
    const issueDate = project.date || new Date().toISOString().split('T')[0];
    
    // Calculate due date (e.g. settings.paymentTermsDays or transferDate)
    const dueDate = project.transferDate || new Date(Date.now() + (settings.paymentTermsDays || 14) * 86400000).toISOString().split('T')[0];

    const nextNum = invoices.length + 1;
    const invNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      issueDate,
      dueDate,
      coagentId: project.coagentId,
      projectId: project.id,
      amount: project.amount,
      currency: project.currency,
      status: 'Sent',
      sentAt: new Date().toISOString(),
      notes: project.note ? `Project: ${project.note}` : 'Payment due upon invoice receipt.',
      items: [
        {
          id: `item-${Date.now()}`,
          description: project.note || `Services rendered for ${coagent?.company || coagent?.name || 'Project'}`,
          quantity: 1,
          unitPrice: project.amount,
          total: project.amount,
        },
      ],
    };

    // Save invoice
    setInvoices((prev) => [newInvoice, ...prev]);

    // Update project status to Invoiced
    updateProject(projectId, {
      status: 'Invoiced',
      invoiceId: newInvoice.id,
    });

    // Auto select invoice for preview
    setSelectedInvoice(newInvoice);

    return newInvoice;
  };

  // Transaction Handlers
  const addTransaction = (data: Omit<FinanceTransaction, 'id' | 'createdAt'>): FinanceTransaction => {
    const newTx: FinanceTransaction = {
      ...data,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetData = () => {
    setCoagents(INITIAL_COAGENTS);
    setCategories(INITIAL_CATEGORIES);
    setProjects(INITIAL_PROJECTS);
    setInvoices(INITIAL_INVOICES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setLeads([]);
    localStorage.clear();
  };

  const exportJSON = () => {
    const data = {
      coagents,
      categories,
      projects,
      invoices,
      transactions,
      settings,
      leads,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.coagents) setCoagents(data.coagents);
      if (data.categories) setCategories(data.categories);
      if (data.projects) setProjects(data.projects);
      if (data.invoices) setInvoices(data.invoices);
      if (data.transactions) setTransactions(data.transactions);
      if (data.settings) setSettings(data.settings);
      if (data.leads) setLeads(data.leads);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  // Totals calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const pendingIncome = projects
    .filter((p) => p.status === 'Pending' || p.status === 'Invoiced')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const unpaidInvoicesCount = invoices.filter((i) => i.status === 'Sent' || i.status === 'Draft').length;

  return (
    <BudgetContext.Provider
      value={{
        activeTab,
        setActiveTab,
        coagents,
        categories,
        projects,
        invoices,
        transactions,
        settings,
        leads,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToCustomer,
        addCoagent,
        updateCoagent,
        deleteCoagent,
        addCategory,
        updateCategory,
        deleteCategory,
        addProject,
        updateProject,
        deleteProject,
        sendAutomatedInvoice,
        addInvoice,
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        selectedInvoice,
        setSelectedInvoice,
        addTransaction,
        deleteTransaction,
        updateSettings,
        theme,
        setTheme,
        toggleTheme,
        isSidebarExpanded,
        setIsSidebarExpanded,
        toggleSidebar,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        toggleAIAssistant,
        resetData,
        exportJSON,
        importJSON,
        totals: {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          pendingIncome,
          unpaidInvoicesCount,
        },
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
