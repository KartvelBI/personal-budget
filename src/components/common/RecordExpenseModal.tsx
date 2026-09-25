import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import {
  X,
  ArrowUpRight,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Building2,
  Hash,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const RecordExpenseModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { categories, coagents, settings, addTransaction } = useBudget();

  const expenseCategories = categories.filter((c) => c.type === 'Expense');
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || categories[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(settings.defaultCurrency || 'USD');
  const [description, setDescription] = useState('');
  const [coagentId, setCoagentId] = useState('');
  const [reference, setReference] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter an expense description or vendor name.');
      return;
    }

    addTransaction({
      date,
      type: 'Expense',
      categoryId: categoryId || expenseCategories[0]?.id || 'cat-4',
      amount: parseFloat(amount),
      currency,
      description: description.trim(),
      coagentId: coagentId || undefined,
      reference: reference.trim() || undefined,
    });

    const categoryObj = categories.find((c) => c.id === categoryId);
    const successMessage = `Expense of ${currency} ${Number(amount).toLocaleString()} (${description.trim()}) recorded successfully!`;

    if (onSuccess) {
      onSuccess(successMessage);
    }

    // Reset & close
    setAmount('');
    setDescription('');
    setReference('');
    setCoagentId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#161922] w-full max-w-lg rounded-2xl border border-[#F0F2F7] dark:border-[#232738] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#F0F2F7] dark:border-[#232738] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FDE8E8] dark:bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center shadow-xs shrink-0">
              <ArrowUpRight className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white flex items-center gap-2">
                <span>Record Expense</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FDE8E8] dark:bg-[#EF4444]/20 text-[#EF4444]">
                  ხარჯის გატარება
                </span>
              </h2>
              <p className="text-[11px] text-[#8C93AB] dark:text-[#7A839E] mt-0.5">
                Log operational costs, vendor invoices, or office expenses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Row 1: Date & Expense Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#EF4444] stroke-[2]" />
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#EF4444]/15 focus:border-[#EF4444] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#EF4444] stroke-[2]" />
                Expense Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#EF4444]/15 focus:border-[#EF4444] font-semibold text-[#1E2238] dark:text-white"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                    {cat.name}
                  </option>
                ))}
                {/* Fallback to other categories if no expense categories */}
                {expenseCategories.length === 0 &&
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                      {cat.name} ({cat.type})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Row 2: Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-7">
              <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#EF4444] stroke-[2]" />
                Amount *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#EF4444]/15 focus:border-[#EF4444] font-mono text-base font-extrabold"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5">Currency *</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#EF4444]/15 focus:border-[#EF4444] font-mono font-bold text-[#1E2238] dark:text-white"
              >
                {settings.availableCurrencies.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Description / Vendor */}
          <div>
            <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#EF4444] stroke-[2]" />
              Description / Vendor *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Cloud Server, Office Rent, Google Workspace, Freelance Dev"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#EF4444]/15 focus:border-[#EF4444]"
            />
          </div>

          {/* Row 4: Optional Reference & Coagent Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-[#8C93AB] stroke-[2]" />
                Reference / Receipt # (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. REC-8921, Bank ref #99"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#EF4444]/15 focus:border-[#EF4444]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8C93AB] stroke-[2]" />
                Client / Project Link (Optional)
              </label>
              <select
                value={coagentId}
                onChange={(e) => setCoagentId(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#EF4444]/15 focus:border-[#EF4444] text-[#1E2238] dark:text-white"
              >
                <option value="">General Overhead (No Client)</option>
                {coagents.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#F0F2F7] dark:border-[#232738] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1F2330] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl shadow-sm shadow-[#EF4444]/30 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
