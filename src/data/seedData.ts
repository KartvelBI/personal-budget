import { AppSettings, Category, Coagent, Invoice, ProjectEntry, FinanceTransaction } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  businessName: 'My Business',
  businessEmail: 'contact@mybusiness.com',
  businessPhone: '',
  businessAddress: '',
  taxNumber: '',
  bankName: '',
  iban: '',
  swift: '',
  paymentTermsDays: 14,
  defaultCurrency: 'USD',
  availableCurrencies: ['USD', 'EUR', 'GBP', 'GEL', 'CAD', 'CHF'],
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Software Development', type: 'Income', color: '#4E53EE' },
  { id: 'cat-2', name: 'UI/UX Design', type: 'Income', color: '#10B981' },
  { id: 'cat-3', name: 'Consulting & Advisory', type: 'Income', color: '#F59E0B' },
  { id: 'cat-4', name: 'Cloud & Hosting', type: 'Expense', color: '#6366F1' },
  { id: 'cat-5', name: 'Software Subscriptions', type: 'Expense', color: '#EC4899' },
  { id: 'cat-6', name: 'Office & Equipment', type: 'Expense', color: '#3B82F6' },
  { id: 'cat-7', name: 'Marketing & Ads', type: 'Expense', color: '#EF4444' },
];

export const INITIAL_COAGENTS: Coagent[] = [];

export const INITIAL_PROJECTS: ProjectEntry[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_TRANSACTIONS: FinanceTransaction[] = [];
