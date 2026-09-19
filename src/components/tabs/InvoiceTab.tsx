import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Invoice, InvoiceStatus } from '../../types';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Building2,
  CheckCircle,
  AlertCircle,
  Edit2,
  X,
  Calendar,
  DollarSign,
} from 'lucide-react';

export const InvoiceTab: React.FC = () => {
  const {
    invoices,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    setSelectedInvoice,
    coagents,
    updateProject,
  } = useBudget();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit Invoice Modal state
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    issueDate: '',
    dueDate: '',
    amount: '',
    currency: 'USD',
    status: 'Draft' as InvoiceStatus,
    notes: '',
  });

  const openEditInvoiceModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditFormData({
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      amount: String(inv.amount),
      currency: inv.currency,
      status: inv.status,
      notes: inv.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    if (!editFormData.amount || Number(editFormData.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newAmount = parseFloat(editFormData.amount);
    updateInvoice(editingInvoice.id, {
      issueDate: editFormData.issueDate,
      dueDate: editFormData.dueDate,
      amount: newAmount,
      currency: editFormData.currency,
      status: editFormData.status,
      notes: editFormData.notes,
      paidAt: editFormData.status === 'Paid' ? (editingInvoice.paidAt || new Date().toISOString()) : editingInvoice.paidAt,
    });

    if (editFormData.status === 'Paid') {
      updateInvoiceStatus(editingInvoice.id, 'Paid');
      if (editingInvoice.projectId) {
        updateProject(editingInvoice.projectId, { status: 'Paid', amount: newAmount });
      }
    }

    setIsEditModalOpen(false);
  };

  const handleMarkAsPaidInModal = () => {
    if (!editingInvoice) return;
    const newAmount = parseFloat(editFormData.amount || String(editingInvoice.amount));

    updateInvoice(editingInvoice.id, {
      issueDate: editFormData.issueDate,
      dueDate: editFormData.dueDate,
      amount: newAmount,
      currency: editFormData.currency,
      status: 'Paid',
      notes: editFormData.notes,
      paidAt: editingInvoice.paidAt || new Date().toISOString(),
    });

    updateInvoiceStatus(editingInvoice.id, 'Paid');

    if (editingInvoice.projectId) {
      updateProject(editingInvoice.projectId, { status: 'Paid', amount: newAmount });
    }

    setIsEditModalOpen(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const coagent = coagents.find((c) => c.id === inv.coagentId);
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coagent?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coagent?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === 'Sent' || i.status === 'Draft').reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E6F9F0] text-[#10B981]">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EDEEFD] text-[#4E53EE]">
            <Clock className="w-3 h-3" />
            Sent
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FEF6E7] text-[#F59E0B]">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F8F9FC] text-[#5E6482]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#161926] rounded-2xl p-6 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C93AB]">Total Invoiced</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1E2238] dark:text-white mt-1 font-mono">
              ${totalInvoiced.toLocaleString()}
            </div>
            <p className="text-xs text-[#8C93AB] mt-1">{invoices.length} invoices generated</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] flex items-center justify-center shadow-md shadow-[#4E53EE]/20">
            <FileText className="w-8 h-8" strokeWidth={2.4} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#161926] rounded-2xl p-6 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">Collected (Paid)</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981] mt-1 font-mono">
              ${totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-[#8C93AB] mt-1">
              {invoices.filter((i) => i.status === 'Paid').length} paid invoices
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#E6F9F0] dark:bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shadow-md shadow-[#10B981]/20">
            <CheckCircle className="w-8 h-8" strokeWidth={2.4} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#161926] rounded-2xl p-6 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B]">Pending Collection</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F59E0B] mt-1 font-mono">
              ${totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-[#8C93AB] mt-1">
              {invoices.filter((i) => i.status === 'Sent' || i.status === 'Draft').length} pending payment
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#FEF6E7] dark:bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center shadow-md shadow-[#F59E0B]/20">
            <AlertCircle className="w-8 h-8" strokeWidth={2.4} />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <section className="bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Issued Invoices</h2>
            <p className="text-xs text-[#8C93AB] mt-0.5">
              Client invoices linked to project work milestones
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-[#F8F9FC] dark:bg-[#1C2030] p-1 rounded-xl text-xs font-bold text-[#5E6482] dark:text-[#A0A6BF] border border-[#F0F2F7] dark:border-[#232738]">
              {(['all', 'Sent', 'Paid', 'Draft'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition capitalize cursor-pointer ${
                    statusFilter === st ? 'bg-white dark:bg-[#252A3D] text-[#1E2238] dark:text-white shadow-xs' : 'hover:text-[#1E2238] dark:hover:text-white'
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
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 text-xs bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] text-[#1E2238] dark:text-[#EAECEF] rounded-xl outline-none focus:border-[#4E53EE]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0F2F7] dark:border-[#232738] text-[11px] font-bold text-[#8C93AB] bg-[#F8F9FC]/60 dark:bg-[#1C2030]/60">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Issue Date</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F9FC] dark:divide-[#232738]">
              {filteredInvoices.map((inv) => {
                const coagent = coagents.find((c) => c.id === inv.coagentId);

                return (
                  <tr key={inv.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1C2030]/50 transition group">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#4E53EE] dark:text-[#818CF8] whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-3 text-[#1E2238] dark:text-[#EAECEF] font-semibold whitespace-nowrap">{inv.issueDate}</td>

                    <td className="py-3.5 px-3 text-[#8C93AB] whitespace-nowrap font-mono">{inv.dueDate}</td>

                    <td className="py-3.5 px-3 font-bold text-[#1E2238] dark:text-[#EAECEF] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#8C93AB]" strokeWidth={2} />
                        <span>{coagent?.company || coagent?.name || 'Client'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-extrabold text-[#1E2238] dark:text-white font-mono whitespace-nowrap text-sm">
                      ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 hover:bg-[#4E53EE] text-[#4E53EE] dark:text-[#818CF8] hover:text-white font-bold text-xs transition cursor-pointer"
                          title="Preview & Print"
                        >
                          <Eye className="w-4.5 h-4.5" strokeWidth={2.2} />
                          View
                        </button>

                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F9F0] dark:bg-[#10B981]/20 hover:bg-[#10B981] text-[#10B981] hover:text-white font-bold text-xs transition cursor-pointer"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-4.5 h-4.5" strokeWidth={2.2} />
                            Paid
                          </button>
                        )}

                        <button
                          onClick={() => openEditInvoiceModal(inv)}
                          className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-[#4E53EE] rounded-lg transition hover:bg-[#EDEEFD] dark:hover:bg-[#4E53EE]/10 cursor-pointer"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4.5 h-4.5 stroke-[2]" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                              deleteInvoice(inv.id);
                            }
                          }}
                          className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 rounded-lg transition hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4.5 h-4.5 stroke-[2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8C93AB]">
                    <FileText className="w-10 h-10 mx-auto text-[#8C93AB]/40 mb-2 stroke-[2]" />
                    <p className="font-bold text-[#1E2238] dark:text-white">No Invoices Found</p>
                    <p className="mt-1">Submit a project milestone to generate an automated client invoice.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Invoice Modal */}
      {isEditModalOpen && editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161926] rounded-3xl border border-[#F0F2F7] dark:border-[#232738] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#F0F2F7] dark:border-[#232738]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] flex items-center justify-center">
                  <Edit2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E2238] dark:text-white flex items-center gap-2">
                    Edit Invoice
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8]">
                      {editingInvoice.invoiceNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-[#8C93AB]">
                    Modify invoice details, status, or quickly mark as paid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-xl hover:bg-[#F8F9FC] dark:hover:bg-[#1C2030] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateInvoice} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.issueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#8C93AB] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="w-full pl-8.5 pr-3 py-2 text-xs font-mono font-bold bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Currency
                  </label>
                  <select
                    value={editFormData.currency}
                    onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GEL">GEL (₾)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                  Invoice Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as InvoiceStatus })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                  Invoice Notes & Terms
                </label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Terms, bank instructions or memo..."
                  className="w-full px-3 py-2 text-xs bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#F0F2F7] dark:border-[#232738] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleMarkAsPaidInModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-md shadow-[#10B981]/25 transition cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
                  Mark as Paid
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5E6482] dark:text-[#8C93AB] hover:bg-[#F8F9FC] dark:hover:bg-[#1C2030] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#4E53EE] hover:bg-[#3D42DF] text-white font-bold text-xs shadow-md shadow-[#4E53EE]/25 transition cursor-pointer active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
