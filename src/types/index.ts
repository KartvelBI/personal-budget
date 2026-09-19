export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'GEL' | 'CAD' | 'AUD' | 'CHF' | 'JPY' | string;

export interface Coagent {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  defaultCurrency: CurrencyCode;
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'Income' | 'Expense';
  color: string;
}

export type ProjectStatus = 'Pending' | 'Transferred' | 'Invoiced';

export interface ProjectEntry {
  id: string;
  date: string; // YYYY-MM-DD
  coagentId: string;
  categoryId: string;
  transferDate: string; // YYYY-MM-DD
  amount: number;
  currency: CurrencyCode;
  note: string;
  status: ProjectStatus;
  invoiceId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  coagentId: string;
  projectId?: string;
  items: InvoiceItem[];
  amount: number;
  currency: CurrencyCode;
  status: InvoiceStatus;
  notes?: string;
  sentAt?: string;
  paidAt?: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  categoryId: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  coagentId?: string;
  projectId?: string;
  reference?: string;
  createdAt: string;
}

export interface AppSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  taxNumber: string;
  bankName: string;
  iban: string;
  swift: string;
  paymentTermsDays: number;
  defaultCurrency: CurrencyCode;
  availableCurrencies: CurrencyCode[];
}

export type ActiveTab = 'coagents' | 'projects' | 'invoice' | 'finances' | 'reporting' | 'options';

export type ThemeMode = 'light' | 'dark';

