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
  Edit2,
  X,
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
    updateInvoiceStatus,
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

  // Submit Project Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const openSubmitModal = () => {
    if (!coagentId && coagents.length > 0) {
      setCoagentId(coagents[0].id);
      if (coagents[0].defaultCurrency) {
        setCurrency(coagents[0].defaultCurrency);
      }
    }
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setIsSubmitModalOpen(true);
  };

  // Edit Project Modal state
  const [editingProject, setEditingProject] = useState<ProjectEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: '',
    coagentId: '',
    categoryId: '',
    transferDate: '',
    amount: '',
    currency: 'USD',
    note: '',
    status: 'Pending' as ProjectStatus,
  });

  const openEditModal = (p: ProjectEntry) => {
    setEditingProject(p);
    setEditFormData({
      date: p.date,
      coagentId: p.coagentId,
      categoryId: p.categoryId,
      transferDate: p.transferDate,
      amount: String(p.amount),
      currency: p.currency,
      note: p.note,
      status: p.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editFormData.amount || Number(editFormData.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    updateProject(editingProject.id, {
      date: editFormData.date,
      coagentId: editFormData.coagentId,
      categoryId: editFormData.categoryId,
      transferDate: editFormData.transferDate,
      amount: parseFloat(editFormData.amount),
      currency: editFormData.currency,
      note: editFormData.note,
      status: editFormData.status,
    });

    if (editFormData.status === 'Paid' && editingProject.invoiceId) {
      updateInvoiceStatus(editingProject.invoiceId, 'Paid');
    }

    setIsEditModalOpen(false);
    setSuccessToast('Project updated successfully!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleMarkAsPaidInModal = () => {
    if (!editingProject) return;

    updateProject(editingProject.id, {
      date: editFormData.date,
      coagentId: editFormData.coagentId,
      categoryId: editFormData.categoryId,
      transferDate: editFormData.transferDate,
      amount: parseFloat(editFormData.amount || String(editingProject.amount)),
      currency: editFormData.currency,
      note: editFormData.note,
      status: 'Paid',
    });

    if (editingProject.invoiceId) {
      updateInvoiceStatus(editingProject.invoiceId, 'Paid');
    }

    setIsEditModalOpen(false);
    setSuccessToast('Project marked as Paid! Invoice status updated.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

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

    // Reset fields & close modal
    setAmount('');
    setNote('');
    setIsSubmitModalOpen(false);
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

      {/* FULL-PAGE PROJECTS LEDGER */}
      <section className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs space-y-5 transition-colors">
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0F2F7] dark:border-[#232738]">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] flex items-center justify-center shadow-md shadow-[#4E53EE]/10 shrink-0">
              <FolderKanban className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-[#1E2238] dark:text-white">Projects Ledger</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] font-mono">
                  {filteredProjects.length}
                </span>
              </div>
              <p className="text-xs text-[#8C93AB] dark:text-[#7A839E] mt-0.5">
                Full-page ledger of milestone deliverables, project billing, and automated invoices
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('coagents')}
              className="text-xs font-bold text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1F2330] hover:bg-[#F0F2F7] dark:hover:bg-[#2A3044] px-3.5 py-2.5 rounded-xl transition cursor-pointer"
            >
              + Customers
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className="text-xs font-bold text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1F2330] hover:bg-[#F0F2F7] dark:hover:bg-[#2A3044] px-3.5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Categories
            </button>
            <button
              onClick={openSubmitModal}
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-[#4E53EE] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#4E53EE]/25 transition cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.4]" />
              Submit Project
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Filter */}
          <div className="flex flex-wrap bg-[#F8F9FC] dark:bg-[#1F2330] p-1 rounded-xl text-xs font-bold text-[#5E6482] dark:text-[#949DB2] border border-[#F0F2F7] dark:border-[#2A3044]">
            {(['all', 'Pending', 'Invoiced', 'Transferred', 'Paid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition capitalize ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white shadow-xs'
                    : 'hover:text-[#1E2238] dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4.5 h-4.5 text-[#8C93AB] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by client, note, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-[#F8F9FC] dark:bg-[#1F2330] border border-[#F0F2F7] dark:border-[#2A3044] rounded-xl outline-none focus:border-[#4E53EE] text-[#1E2238] dark:text-white"
            />
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
                    <td className="py-3 px-3 font-semibold text-[#1E2238] dark:text-white whitespace-nowrap font-mono">{p.date}</td>

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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 hover:bg-[#4E53EE] text-[#4E53EE] dark:text-[#7378FF] hover:text-white font-bold text-xs transition cursor-pointer"
                        >
                          <FileText className="w-4.5 h-4.5 stroke-[2]" />
                          View Invoice
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendInvoiceForExisting(p.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4E53EE] hover:bg-[#4338CA] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                        >
                          <Send className="w-4 h-4 text-white stroke-[2]" />
                          Send Invoice
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-[#4E53EE] rounded-xl transition hover:bg-[#EDEEFD] dark:hover:bg-[#4E53EE]/20 cursor-pointer"
                          title="Edit project"
                        >
                          <Edit2 className="w-5 h-5 stroke-[2]" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this project record?')) {
                              deleteProject(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl transition hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-5 h-5 stroke-[2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#8C93AB]">
                    <FolderKanban className="w-10 h-10 mx-auto text-[#8C93AB]/40 mb-2 stroke-[2]" />
                    <p className="font-bold text-[#1E2238] dark:text-white">No Projects Recorded</p>
                    <p className="mt-1">Fill out the form above to log your first project milestone.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161922] rounded-2xl shadow-2xl overflow-hidden my-8 border border-[#F0F2F7] dark:border-[#232738]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F7] dark:border-[#232738] bg-[#F8F9FC] dark:bg-[#1F2330]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] flex items-center justify-center shadow-xs">
                  <Edit2 className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">
                    Edit Project Milestone
                  </h2>
                  <p className="text-[11px] text-[#8C93AB]">Update project parameters or mark milestone as paid</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
                    Coagents (Customer) *
                  </label>
                  <select
                    required
                    value={editFormData.coagentId}
                    onChange={(e) => setEditFormData({ ...editFormData, coagentId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-semibold text-[#1E2238] dark:text-white"
                  >
                    {coagents.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                        {c.company ? `${c.company} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
                    Category *
                  </label>
                  <select
                    required
                    value={editFormData.categoryId}
                    onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-semibold text-[#1E2238] dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                        {cat.name} ({cat.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
                    Transfer Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.transferDate}
                    onChange={(e) => setEditFormData({ ...editFormData, transferDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] font-mono text-sm font-extrabold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5">Currency</label>
                  <select
                    value={editFormData.currency}
                    onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:border-[#4E53EE] font-mono font-bold text-[#1E2238] dark:text-white"
                  >
                    {settings.availableCurrencies.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] rounded-xl outline-none focus:border-[#4E53EE] font-bold text-[#1E2238] dark:text-white"
                  >
                    <option value="Pending" className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">Pending</option>
                    <option value="Invoiced" className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">Invoiced</option>
                    <option value="Transferred" className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">Transferred</option>
                    <option value="Paid" className="bg-white dark:bg-[#161922] text-[#1E2238] dark:text-white">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5">Note / Deliverable Description</label>
                <input
                  type="text"
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE]"
                />
              </div>

              {/* ACTION BUTTONS WITH MARK AS PAID INSIDE */}
              <div className="pt-3 border-t border-[#F0F2F7] dark:border-[#232738] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleMarkAsPaidInModal}
                  className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
                  Mark as Paid
                </button>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 font-bold text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1F2330] rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-[#4E53EE] hover:bg-[#4338CA] rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT PROJECT POP-UP MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161922] w-full max-w-2xl rounded-2xl border border-[#F0F2F7] dark:border-[#232738] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#F0F2F7] dark:border-[#232738] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] flex items-center justify-center shadow-md shadow-[#4E53EE]/10 shrink-0">
                  <FolderKanban className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Submit Project Work</h2>
                  <p className="text-xs text-[#8C93AB] dark:text-[#7A839E]">
                    Record milestones and generate automated client invoices
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {coagents.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#8C93AB]">
                  <AlertCircle className="w-10 h-10 mx-auto text-[#F59E0B] mb-2 stroke-[2]" />
                  <p className="font-bold text-[#1E2238] dark:text-white">No Customers / Coagents Available</p>
                  <p className="mt-1">Add a customer first before logging projects.</p>
                  <button
                    onClick={() => {
                      setIsSubmitModalOpen(false);
                      setActiveTab('coagents');
                    }}
                    className="mt-3 px-4 py-2 bg-[#4E53EE] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#4E53EE]/25 cursor-pointer"
                  >
                    Add Customer
                  </button>
                </div>
              ) : (
                <form
                  id="submit-project-modal-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProject(false);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field 1: Date */}
                    <div>
                      <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
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

                    {/* Field 2: Coagents (Customers) */}
                    <div>
                      <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
                        Coagents (Customer) *
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field 3: Category */}
                    <div>
                      <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
                        Category *
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

                    {/* Field 4: Transfer Date */}
                    <div>
                      <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
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
                    <div className="sm:col-span-6">
                      <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#4E53EE] stroke-[2]" />
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
                    <div className="sm:col-span-6">
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
                  </div>

                  {/* Field 7: Note */}
                  <div>
                    <label className="block font-bold text-[#1E2238] dark:text-white mb-1.5">Note / Deliverable Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Design system milestone, Cloud migration"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A3044] bg-white dark:bg-[#1F2330] text-[#1E2238] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE]"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            {coagents.length > 0 && (
              <div className="p-4 sm:p-6 bg-[#F8F9FC]/80 dark:bg-[#1F2330]/50 border-t border-[#F0F2F7] dark:border-[#232738] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 font-bold text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/40 rounded-xl transition cursor-pointer text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveProject(false)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#2A3044] rounded-xl hover:bg-[#F8F9FC] dark:hover:bg-[#2A3044] transition cursor-pointer text-xs"
                >
                  <Plus className="w-4.5 h-4.5 text-[#8C93AB] stroke-[2.2]" />
                  Submit Project
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveProject(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-white bg-[#4E53EE] hover:bg-[#4338CA] rounded-xl shadow-sm shadow-[#4E53EE]/30 transition group cursor-pointer text-xs"
                >
                  <Send className="w-4 h-4 text-white stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                  Submit & Send Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
