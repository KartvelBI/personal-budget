import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ProjectEntry, ProjectStatus } from '../../types';
import {
  FolderKanban,
  Calendar,
  Building2,
  Tag,
  DollarSign,
  FileText,
  Send,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const ProjectsTab: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    sendAutomatedInvoice,
    coagents,
    categories,
    settings,
    setActiveTab,
    invoices,
    setSelectedInvoice,
  } = useBudget();

  // Form state
  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [coagentId, setCoagentId] = useState(coagents[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [transferDate, setTransferDate] = useState(defaultDueDate);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState(settings.defaultCurrency || 'USD');
  const [note, setNote] = useState('');

  // Table search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Success toast message
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleCoagentChange = (newCoagentId: string) => {
    setCoagentId(newCoagentId);
    const selected = coagents.find((c) => c.id === newCoagentId);
    if (selected?.defaultCurrency) {
      setCurrency(selected.defaultCurrency);
    }
  };

  const handleSaveProject = (andSendInvoice: boolean) => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!coagentId) {
      alert('Please select a customer/coagent.');
      return;
    }

    const newProject = addProject({
      date,
      coagentId,
      categoryId: categoryId || categories[0]?.id || '',
      transferDate,
      amount: parseFloat(amount),
      currency,
      note,
      status: 'Pending',
    });

    if (andSendInvoice) {
      const generatedInvoice = sendAutomatedInvoice(newProject.id);
      setSuccessToast(`Project recorded & automated invoice ${generatedInvoice.invoiceNumber} created!`);
    } else {
      setSuccessToast('Project entry submitted successfully!');
    }

    // Reset fields
    setAmount('');
    setNote('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSendInvoiceForExisting = (projectId: string) => {
    const inv = sendAutomatedInvoice(projectId);
    setSuccessToast(`Automated invoice ${inv.invoiceNumber} generated!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleViewInvoice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setSelectedInvoice(inv);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const coagent = coagents.find((c) => c.id === p.coagentId);
    const category = categories.find((c) => c.id === p.categoryId);
    const matchesSearch =
      (p.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coagent?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coagent?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="bg-[#E6F9F0] dark:bg-[#10B981]/20 border border-[#10B981]/30 text-[#1E2238] dark:text-[#E6F9F0] px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. PROJECT SUBMIT FORM */}
      <section className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#F0F2F7] dark:border-[#232738] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Submit Project Work</h2>
              <p className="text-xs text-[#8C93AB] dark:text-[#7A839E]">
                Record milestones and generate automated client invoices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('coagents')}
              className="text-xs font-bold text-[#4E53EE] dark:text-[#7378FF] hover:bg-[#EDEEFD] dark:hover:bg-[#4E53EE]/20 px-3 py-1.5 rounded-xl transition"
            >
              + Customers
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className="text-xs font-bold text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1F2330] hover:bg-[#F0F2F7] dark:hover:bg-[#2A3044] px-3 py-1.5 rounded-xl transition"
            >
              Categories
            </button>
          </div>
        </div>

        {coagents.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8C93AB]">
            <AlertCircle className="w-8 h-8 mx-auto text-[#F59E0B] mb-2" />
            <p className="font-bold text-[#1E2238] dark:text-white">No Customers / Coagents Available</p>
            <p className="mt-1">Add a customer first before logging projects.</p>
            <button
              onClick={() => setActiveTab('coagents')}
              className="mt-3 px-4 py-2 bg-[#4E53EE] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#4E53EE]/25"
            >
              Add Customer
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveProject(false);
            }}
            className="mt-5 space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Field 1: Date */}
              <div>
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#4E53EE]" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-medium"
                />
              </div>

              {/* Field 2: Coagents (brought from coagents table) */}
              <div>
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#4E53EE]" />
                  Coagents (Customers) *
                </label>
                <select
                  required
                  value={coagentId}
                  onChange={(e) => handleCoagentChange(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-semibold text-[#1E2238] dark:text-white"
                >
                  {coagents.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                      {c.company ? `${c.company} (${c.name})` : c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Category (dropdown, set up in options page) */}
              <div>
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#4E53EE]" />
                  Category (from Settings) *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-semibold text-[#1E2238] dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                      {cat.name} ({cat.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: Transfer date */}
              <div>
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4E53EE]" />
                  Transfer Date *
                </label>
                <input
                  type="date"
                  required
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Field 5: Amount */}
              <div className="sm:col-span-4">
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#4E53EE]" />
                  Amount *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-mono text-sm font-extrabold"
                />
              </div>

              {/* Field 6: Currency */}
              <div className="sm:col-span-3">
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5">Currency *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-mono font-bold text-[#1E2238] dark:text-white"
                >
                  {settings.availableCurrencies.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 7: Note */}
              <div className="sm:col-span-5">
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5">Note / Deliverable Description</label>
                <input
                  type="text"
                  placeholder="e.g. Design system milestone, Cloud migration"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE]"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-3 border-t border-[#F0F2F7] dark:border-[#232738] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 font-bold text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1F2330] hover:bg-[#F0F2F7] dark:hover:bg-[#2A3044] rounded-xl transition"
              >
                <Plus className="w-4 h-4 text-[#8C93AB]" />
                Submit Project
              </button>

              <button
                type="button"
                onClick={() => handleSaveProject(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-white bg-[#4E53EE] hover:bg-[#4338CA] rounded-xl shadow-sm shadow-[#4E53EE]/30 transition group"
              >
                <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                Submit & Send Automated Invoice
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2. SUBMITTED PROJECTS LEDGER */}
      <section className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Projects Ledger</h3>
            <p className="text-xs text-[#8C93AB] dark:text-[#7A839E] mt-0.5">
              {filteredProjects.length} records registered
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex bg-[#F8F9FC] dark:bg-[#1F2330] p-1 rounded-xl text-xs font-bold text-[#5E6482] dark:text-[#949DB2] border border-[#F0F2F7] dark:border-[#2A3044]">
              {(['all', 'Pending', 'Invoiced', 'Transferred'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition capitalize ${
                    statusFilter === st
                      ? 'bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white shadow-xs'
                      : 'hover:text-[#1E2238] dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C93AB] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 text-xs bg-[#F8F9FC] dark:bg-[#1F2330] border border-[#F0F2F7] dark:border-[#2A3044] rounded-xl outline-none focus:border-[#4E53EE] text-[#1E2238] dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0F2F7] dark:border-[#232738] text-[11px] font-bold text-[#8C93AB] dark:text-[#7A839E] bg-[#F8F9FC]/60 dark:bg-[#1F2330]/40">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Coagent</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Transfer Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Note</th>
                <th className="py-3 px-3 text-right">Automated Invoice</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F9FC] dark:divide-[#1F2330]">
              {filteredProjects.map((p) => {
                const coagent = coagents.find((c) => c.id === p.coagentId);
                const category = categories.find((c) => c.id === p.categoryId);
                const hasInvoice = Boolean(p.invoiceId);

                return (
                  <tr key={p.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition group">
                    <td className="py-3 px-3 font-semibold text-[#1E2238] dark:text-white whitespace-nowrap">{p.date}</td>

                    <td className="py-3 px-3 font-bold text-[#1E2238] dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#4E53EE]"></span>
                        <span>{coagent?.company || coagent?.name || 'Unknown'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {category ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[11px]"
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

                    <td className="py-3 px-3 text-[#5E6482] dark:text-[#949DB2] whitespace-nowrap font-mono">{p.transferDate}</td>

                    <td className="py-3 px-3 text-right font-extrabold text-[#1E2238] dark:text-white font-mono whitespace-nowrap">
                      ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={p.status}
                        onChange={(e) => updateProject(p.id, { status: e.target.value as ProjectStatus })}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border outline-none cursor-pointer ${
                          p.status === 'Invoiced'
                            ? 'bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] border-[#4E53EE]/20'
                            : p.status === 'Transferred'
                            ? 'bg-[#E6F9F0] dark:bg-[#10B981]/20 text-[#10B981] border-[#10B981]/20'
                            : 'bg-[#FEF6E7] dark:bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/20'
                        }`}
                      >
                        <option value="Pending" className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">Pending</option>
                        <option value="Invoiced" className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">Invoiced</option>
                        <option value="Transferred" className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">Transferred</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-[#5E6482] dark:text-[#949DB2] max-w-xs truncate" title={p.note}>
                      {p.note || '—'}
                    </td>

                    {/* AUTOMATED INVOICE BUTTON */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {hasInvoice ? (
                        <button
                          onClick={() => p.invoiceId && handleViewInvoice(p.invoiceId)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 hover:bg-[#4E53EE] text-[#4E53EE] dark:text-[#7378FF] hover:text-white font-bold text-[11px] transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Invoice
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendInvoiceForExisting(p.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#4E53EE] hover:bg-[#4338CA] text-white font-bold text-[11px] shadow-xs transition"
                        >
                          <Send className="w-3 h-3 text-white" />
                          Send Invoice
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('Delete this project record?')) {
                            deleteProject(p.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        title="Delete project"
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
      </section>
    </div>
  );
};
