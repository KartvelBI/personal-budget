import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Coagent } from '../../types';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  FileText,
  FolderKanban,
  X,
} from 'lucide-react';

const AVATAR_BG_COLORS = [
  'bg-[#EDEEFD] text-[#4E53EE]',
  'bg-[#E6F9F0] text-[#10B981]',
  'bg-[#FEF6E7] text-[#F59E0B]',
  'bg-[#FDE8E8] text-[#EF4444]',
];

export const CoagentsTab: React.FC = () => {
  const { coagents, addCoagent, updateCoagent, deleteCoagent, projects, invoices, settings } = useBudget();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoagent, setEditingCoagent] = useState<Coagent | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    defaultCurrency: settings.defaultCurrency || 'USD',
    notes: '',
  });

  const openAddModal = () => {
    setEditingCoagent(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      defaultCurrency: settings.defaultCurrency || 'USD',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (co: Coagent) => {
    setEditingCoagent(co);
    setFormData({
      name: co.name,
      company: co.company,
      email: co.email,
      phone: co.phone,
      address: co.address,
      taxId: co.taxId || '',
      defaultCurrency: co.defaultCurrency,
      notes: co.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name && !formData.company) return;

    if (editingCoagent) {
      updateCoagent(editingCoagent.id, formData);
    } else {
      addCoagent(formData);
    }
    setIsModalOpen(false);
  };

  const filteredCoagents = coagents.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-[#8C93AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-white dark:bg-[#161926] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] shadow-xs placeholder-[#8C93AB]"
          />
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2.5 bg-[#4E53EE] hover:bg-[#4338CA] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs shadow-[#4E53EE]/25 transition cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
          Add Customer
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoagents.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-[#8C93AB] bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-8">
            <Users className="w-12 h-12 mx-auto text-[#8C93AB]/40 mb-3 stroke-[2]" />
            <h3 className="font-extrabold text-[#1E2238] dark:text-white text-sm">No Customers Found</h3>
            <p className="mt-1">Add your first client or organization to get started.</p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 bg-[#4E53EE] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs shadow-[#4E53EE]/25 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.2]" />
              Add Customer
            </button>
          </div>
        )}
        {filteredCoagents.map((coagent, idx) => {
          const coagentProjects = projects.filter((p) => p.coagentId === coagent.id);
          const coagentInvoices = invoices.filter((i) => i.coagentId === coagent.id);
          const totalInvoiced = coagentInvoices.reduce((sum, i) => sum + i.amount, 0);
          const avatarColor = AVATAR_BG_COLORS[idx % AVATAR_BG_COLORS.length];

          return (
            <div
              key={coagent.id}
              className="bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-5.5 shadow-xs hover:shadow-md transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center font-black text-xl shadow-sm shrink-0`}>
                      {(coagent.company || coagent.name).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#1E2238] dark:text-white text-sm leading-snug">
                        {coagent.company || coagent.name}
                      </h3>
                      {coagent.name && coagent.name !== coagent.company && (
                        <p className="text-xs text-[#8C93AB] font-medium">{coagent.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(coagent)}
                      className="p-2 text-[#8C93AB] hover:text-[#4E53EE] hover:bg-[#EDEEFD] dark:hover:bg-[#4E53EE]/20 rounded-xl transition"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-5 h-5 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete customer "${coagent.name || coagent.company}"?`)) {
                          deleteCoagent(coagent.id);
                        }
                      }}
                      className="p-2 text-[#8C93AB] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>
                </div>

                <div className="mt-4.5 space-y-2 text-xs text-[#5E6482] dark:text-[#A0A6BF]">
                  {coagent.email && (
                    <div className="flex items-center gap-2.5 truncate">
                      <Mail className="w-4.5 h-4.5 text-[#8C93AB] shrink-0 stroke-[2]" />
                      <a href={`mailto:${coagent.email}`} className="truncate hover:text-[#4E53EE] dark:hover:text-[#818CF8] font-medium transition">
                        {coagent.email}
                      </a>
                    </div>
                  )}
                  {coagent.phone && (
                    <div className="flex items-center gap-2.5 truncate">
                      <Phone className="w-4.5 h-4.5 text-[#8C93AB] shrink-0 stroke-[2]" />
                      <span className="font-medium text-[#1E2238] dark:text-[#EAECEF]">{coagent.phone}</span>
                    </div>
                  )}
                  {coagent.address && (
                    <div className="flex items-center gap-2.5 truncate">
                      <MapPin className="w-4.5 h-4.5 text-[#8C93AB] shrink-0 stroke-[2]" />
                      <span className="truncate">{coagent.address}</span>
                    </div>
                  )}
                </div>

                {coagent.notes && (
                  <p className="mt-3.5 text-[11px] text-[#8C93AB] italic line-clamp-2 bg-[#F8F9FC] dark:bg-[#1C2030] p-2.5 rounded-xl border border-[#F0F2F7] dark:border-[#232738]">
                    "{coagent.notes}"
                  </p>
                )}
              </div>

              {/* Bottom stats */}
              <div className="mt-5 pt-3.5 border-t border-[#F0F2F7] dark:border-[#232738] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8C93AB] block tracking-wide">Total Invoiced</span>
                  <span className="font-extrabold text-[#1E2238] dark:text-white font-mono text-sm">
                    ${totalInvoiced.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F9FC] dark:bg-[#1C2030] text-[#1E2238] dark:text-[#EAECEF] text-xs font-bold border border-[#F0F2F7] dark:border-[#232738]">
                    <FolderKanban className="w-4 h-4 text-[#8C93AB] stroke-[2]" />
                    {coagentProjects.length}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] text-xs font-bold">
                    <FileText className="w-4 h-4 text-[#4E53EE] dark:text-[#818CF8] stroke-[2]" />
                    {coagentInvoices.length}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161926] rounded-2xl shadow-2xl overflow-hidden my-8 border border-[#F0F2F7] dark:border-[#232738]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F7] dark:border-[#232738] bg-[#F8F9FC] dark:bg-[#1C2030]">
              <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">
                {editingCoagent ? 'Edit Customer / Coagent' : 'Add New Customer / Coagent'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Labs"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A2F45] bg-white dark:bg-[#10121C] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A2F45] bg-white dark:bg-[#10121C] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sarah@apexdigital.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A2F45] bg-white dark:bg-[#10121C] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A2F45] bg-white dark:bg-[#10121C] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Tax / VAT ID</label>
                  <input
                    type="text"
                    placeholder="US-8841920"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A2F45] bg-white dark:bg-[#10121C] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Default Currency</label>
                  <select
                    value={formData.defaultCurrency}
                    onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A2F45] bg-white dark:bg-[#10121C] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE] font-mono"
                  >
                    {settings.availableCurrencies.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#161926] text-[#1E2238] dark:text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Billing Address</label>
                <input
                  type="text"
                  placeholder="742 Evergreen Terrace, Palo Alto, CA"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] dark:border-[#2A2F45] bg-white dark:bg-[#10121C] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0F2F7] dark:border-[#232738]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white bg-[#F8F9FC] dark:bg-[#1C2030] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#4E53EE] hover:bg-[#4338CA] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
