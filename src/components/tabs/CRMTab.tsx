import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Lead, LeadStatus } from '../../types';
import {
  Target,
  Plus,
  Search,
  LayoutGrid,
  List,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
  Tag,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  FolderPlus,
} from 'lucide-react';

const STAGES: { id: LeadStatus; label: string; color: string; bgLight: string; bgDark: string; borderLight: string; borderDark: string }[] = [
  {
    id: 'New',
    label: 'New Leads',
    color: '#3B82F6',
    bgLight: 'bg-[#EFF6FF]',
    bgDark: 'dark:bg-[#3B82F6]/10',
    borderLight: 'border-[#BFDBFE]',
    borderDark: 'dark:border-[#3B82F6]/30',
  },
  {
    id: 'Contacted',
    label: 'Contacted',
    color: '#4E53EE',
    bgLight: 'bg-[#EDEEFD]',
    bgDark: 'dark:bg-[#4E53EE]/10',
    borderLight: 'border-[#C7D2FE]',
    borderDark: 'dark:border-[#4E53EE]/30',
  },
  {
    id: 'Qualified',
    label: 'Qualified',
    color: '#F59E0B',
    bgLight: 'bg-[#FEF6E7]',
    bgDark: 'dark:bg-[#F59E0B]/10',
    borderLight: 'border-[#FDE68A]',
    borderDark: 'dark:border-[#F59E0B]/30',
  },
  {
    id: 'Proposal',
    label: 'Proposal',
    color: '#8B5CF6',
    bgLight: 'bg-[#F5F3FF]',
    bgDark: 'dark:bg-[#8B5CF6]/10',
    borderLight: 'border-[#DDD6FE]',
    borderDark: 'dark:border-[#8B5CF6]/30',
  },
  {
    id: 'Won',
    label: 'Won Deals',
    color: '#10B981',
    bgLight: 'bg-[#E6F9F0]',
    bgDark: 'dark:bg-[#10B981]/10',
    borderLight: 'border-[#A7F3D0]',
    borderDark: 'dark:border-[#10B981]/30',
  },
  {
    id: 'Lost',
    label: 'Lost',
    color: '#EF4444',
    bgLight: 'bg-[#FDE8E8]',
    bgDark: 'dark:bg-[#EF4444]/10',
    borderLight: 'border-[#FECACA]',
    borderDark: 'dark:border-[#EF4444]/30',
  },
];

const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Partner', 'Inbound Call', 'Event / Conference', 'Other'];

export const CRMTab: React.FC = () => {
  const {
    leads,
    addLead,
    updateLead,
    deleteLead,
    convertLeadToCustomer,
    settings,
    setActiveTab,
  } = useBudget();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const defaultCloseDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  // Add Form State
  const [addFormData, setAddFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    title: '',
    value: '',
    currency: settings.defaultCurrency || 'USD',
    status: 'New' as LeadStatus,
    source: 'Website',
    expectedCloseDate: defaultCloseDate,
    notes: '',
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    title: '',
    value: '',
    currency: 'USD',
    status: 'New' as LeadStatus,
    source: 'Website',
    expectedCloseDate: '',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const totalLeadsCount = leads.length;
  const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');
  const activePipelineValue = activeLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const wonTotalValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const closedCount = leads.filter((l) => l.status === 'Won' || l.status === 'Lost').length;
  const winRate = closedCount > 0 ? ((wonLeads.length / closedCount) * 100).toFixed(1) : '0.0';

  // Filtering
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'all' || lead.status === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Handlers
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim() || !addFormData.company.trim()) {
      alert('Please enter both contact person name and company name.');
      return;
    }

    addLead({
      name: addFormData.name.trim(),
      company: addFormData.company.trim(),
      email: addFormData.email.trim(),
      phone: addFormData.phone.trim(),
      title: addFormData.title.trim() || undefined,
      value: parseFloat(addFormData.value) || 0,
      currency: addFormData.currency,
      status: addFormData.status,
      source: addFormData.source,
      expectedCloseDate: addFormData.expectedCloseDate || undefined,
      notes: addFormData.notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setAddFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      title: '',
      value: '',
      currency: settings.defaultCurrency || 'USD',
      status: 'New',
      source: 'Website',
      expectedCloseDate: defaultCloseDate,
      notes: '',
    });
    showToast('New lead added to pipeline successfully!');
  };

  const openEditLeadModal = (lead: Lead) => {
    setEditingLead(lead);
    setEditFormData({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      title: lead.title || '',
      value: String(lead.value || 0),
      currency: lead.currency,
      status: lead.status,
      source: lead.source || 'Website',
      expectedCloseDate: lead.expectedCloseDate || '',
      notes: lead.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    updateLead(editingLead.id, {
      name: editFormData.name.trim(),
      company: editFormData.company.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      title: editFormData.title.trim() || undefined,
      value: parseFloat(editFormData.value) || 0,
      currency: editFormData.currency,
      status: editFormData.status,
      source: editFormData.source,
      expectedCloseDate: editFormData.expectedCloseDate || undefined,
      notes: editFormData.notes.trim() || undefined,
    });

    setIsEditModalOpen(false);
    showToast('Lead updated successfully!');
  };

  const handleConvertToCustomer = (lead: Lead) => {
    try {
      const coagent = convertLeadToCustomer(lead.id);
      showToast(`Lead "${lead.name}" converted to Customer "${coagent.company || coagent.name}"!`);
    } catch (err) {
      alert('Failed to convert lead to customer.');
    }
  };

  const handleStageChange = (leadId: string, newStatus: LeadStatus) => {
    updateLead(leadId, { status: newStatus });
    showToast(`Lead moved to ${newStatus}`);
  };

  const getStageBadge = (status: LeadStatus) => {
    const stage = STAGES.find((s) => s.id === status);
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
        style={{
          backgroundColor: `${stage?.color || '#3B82F6'}15`,
          color: stage?.color || '#3B82F6',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: stage?.color || '#3B82F6' }}
        ></span>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-[#E6F9F0] dark:bg-[#10B981]/20 border border-[#10B981]/30 text-[#1E2238] dark:text-[#E6F9F0] px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 stroke-[2.2]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ROW 1: 4 CRM KPI STAT CARDS                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#4E53EE] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#4E53EE]/25">
            <Target className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Total Leads</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              {totalLeadsCount.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#4E53EE] dark:text-[#818CF8] mt-0.5 font-mono">
              {activeLeads.length} active opportunities
            </span>
          </div>
        </div>

        {/* Card 2: Pipeline Value */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#F59E0B]/25">
            <DollarSign className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Active Pipeline Value</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              ${activePipelineValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#F59E0B] mt-0.5 font-mono">
              In open stages
            </span>
          </div>
        </div>

        {/* Card 3: Closed Won Deals */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#10B981]/25">
            <CheckCircle2 className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Won Deals Value</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              ${wonTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#10B981] mt-0.5 font-mono">
              {wonLeads.length} deals closed won
            </span>
          </div>
        </div>

        {/* Card 4: Win Rate */}
        <div className="bg-white dark:bg-[#161922] rounded-2xl p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs flex items-center gap-4.5 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#8B5CF6]/25">
            <TrendingUp className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#8C93AB] dark:text-[#7A839E]">Conversion Win Rate</span>
            <div className="text-2xl font-extrabold text-[#1E2238] dark:text-white tracking-tight font-mono mt-0.5">
              {winRate}%
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#8B5CF6] mt-0.5 font-mono">
              {closedCount} deals resolved
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: CONTROLS & PIPELINE TOOLBAR                       */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#161922] rounded-2xl p-4 sm:p-5 border border-[#F0F2F7] dark:border-[#232738] shadow-xs transition-colors flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-[#8C93AB] absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
          <input
            type="text"
            placeholder="Search leads by contact, company, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] outline-none focus:ring-2 focus:ring-[#4E53EE]/15 focus:border-[#4E53EE] placeholder-[#8C93AB]"
          />
        </div>

        {/* Right: Stage Filter, View Mode Switcher, and Add Lead button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Stage Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F8F9FC] dark:bg-[#1F2330] px-3 py-2 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] text-xs">
            <Layers className="w-4.5 h-4.5 text-[#8C93AB] stroke-[2]" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent font-bold text-[#1E2238] dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Stages ({leads.length})</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({leads.filter((l) => l.status === s.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Kanban vs Table */}
          <div className="flex bg-[#F8F9FC] dark:bg-[#1F2330] p-1 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#252A3D] text-[#4E53EE] dark:text-white shadow-xs'
                  : 'text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#252A3D] text-[#4E53EE] dark:text-white shadow-xs'
                  : 'text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Add Lead CTA Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#4E53EE] hover:bg-[#4338CA] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs shadow-[#4E53EE]/25 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.4]" />
            Add Lead
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: KANBAN PIPELINE VIEW OR TABLE VIEW                */}
      {/* ======================================================== */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            const stageTotalValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

            return (
              <div
                key={stage.id}
                className="bg-[#F8F9FC]/70 dark:bg-[#131620] rounded-2xl p-3.5 border border-[#F0F2F7] dark:border-[#232738] flex flex-col min-h-[520px] transition-colors"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F7] dark:border-[#232738] mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    ></span>
                    <h3 className="font-extrabold text-xs text-[#1E2238] dark:text-white">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold font-mono bg-white dark:bg-[#1E2238] text-[#5E6482] dark:text-[#A0A6BF] border border-[#F0F2F7] dark:border-[#232738]">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Column Total Monetary Value */}
                <div className="text-[11px] font-mono font-bold text-[#8C93AB] mb-3 px-1">
                  ${stageTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>

                {/* Leads Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white dark:bg-[#161922] rounded-xl p-3.5 border border-[#F0F2F7] dark:border-[#232738] shadow-2xs hover:shadow-md transition-all duration-150 space-y-3 group"
                    >
                      {/* Top row: Company & Title */}
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-xs text-[#1E2238] dark:text-white leading-snug">
                            {lead.company}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-[#F8F9FC] dark:bg-[#1F2330] text-[#5E6482] dark:text-[#A0A6BF] shrink-0">
                            {lead.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C93AB] font-medium truncate mt-0.5">
                          {lead.title || lead.name}
                        </p>
                      </div>

                      {/* Deal Value */}
                      <div className="text-base font-extrabold text-[#1E2238] dark:text-white font-mono">
                        ${lead.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className="text-[10px] text-[#8C93AB] ml-1 font-sans">{lead.currency}</span>
                      </div>

                      {/* Contact Details */}
                      <div className="text-[11px] text-[#8C93AB] space-y-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{lead.name}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.expectedCloseDate && (
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#8C93AB]">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-[#4E53EE]" />
                            <span>Close: {lead.expectedCloseDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Move Stage Select */}
                      <div className="pt-2 border-t border-[#F0F2F7] dark:border-[#232738] flex items-center justify-between gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStatus)}
                          className="text-[10.5px] font-bold bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-lg px-2 py-1 text-[#1E2238] dark:text-white outline-none cursor-pointer"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        {/* Action buttons: Convert to customer, Edit, Delete */}
                        <div className="flex items-center gap-1">
                          {lead.status !== 'Won' ? (
                            <button
                              onClick={() => handleConvertToCustomer(lead)}
                              className="p-1.5 text-slate-400 hover:text-[#10B981] hover:bg-[#E6F9F0] dark:hover:bg-[#10B981]/20 rounded-lg transition cursor-pointer"
                              title="Win & Convert to Customer"
                            >
                              <UserCheck className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConvertToCustomer(lead)}
                              className="p-1.5 text-[#10B981] hover:bg-[#E6F9F0] dark:hover:bg-[#10B981]/20 rounded-lg transition cursor-pointer"
                              title="Add to Customers Directory"
                            >
                              <UserCheck className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          )}

                          {/* Edit button immediately next to bin button */}
                          <button
                            onClick={() => openEditLeadModal(lead)}
                            className="p-1.5 text-slate-400 hover:text-[#4E53EE] hover:bg-[#EDEEFD] dark:hover:bg-[#4E53EE]/20 rounded-lg transition cursor-pointer"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-4 h-4 stroke-[2]" />
                          </button>

                          {/* Bin (Delete) button */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete lead from "${lead.company}"?`)) {
                                deleteLead(lead.id);
                                showToast('Lead deleted');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-xs text-[#8C93AB]/60 italic">
                      No leads in {stage.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#161922] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#F0F2F7] dark:border-[#232738] text-[11px] font-bold text-[#8C93AB] bg-[#F8F9FC]/60 dark:bg-[#1C2030]/60">
                  <th className="py-3 px-3">Company & Contact</th>
                  <th className="py-3 px-3">Deal Scope</th>
                  <th className="py-3 px-3">Lead Source</th>
                  <th className="py-3 px-3">Expected Close</th>
                  <th className="py-3 px-3 text-right">Deal Value</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FC] dark:divide-[#232738]">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1C2030]/50 transition group">
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] flex items-center justify-center font-bold text-xs">
                          {lead.company.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#1E2238] dark:text-white text-xs">{lead.company}</p>
                          <p className="text-[11px] text-[#8C93AB]">{lead.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-[#5E6482] dark:text-[#A0A6BF] font-medium whitespace-nowrap">
                      {lead.title || 'Client Project'}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#F8F9FC] dark:bg-[#1F2330] text-[#5E6482] dark:text-[#A0A6BF] border border-[#F0F2F7] dark:border-[#2A3044]">
                        <Tag className="w-3 h-3 text-[#8C93AB]" />
                        {lead.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-[#8C93AB] font-mono whitespace-nowrap">
                      {lead.expectedCloseDate || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-extrabold text-[#1E2238] dark:text-white font-mono text-sm whitespace-nowrap">
                      ${lead.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {getStageBadge(lead.status)}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleConvertToCustomer(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E6F9F0] dark:bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981] hover:text-white font-bold text-xs transition cursor-pointer"
                          title="Convert to Customer"
                        >
                          <UserCheck className="w-4 h-4 stroke-[2.2]" />
                          Convert
                        </button>

                        {/* Edit Button next to Bin Button */}
                        <button
                          onClick={() => openEditLeadModal(lead)}
                          className="p-1.5 text-slate-400 hover:text-[#4E53EE] rounded-lg transition hover:bg-[#EDEEFD] dark:hover:bg-[#4E53EE]/10 cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-4.5 h-4.5 stroke-[2]" />
                        </button>

                        {/* Bin (Delete) Button */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete lead from "${lead.company}"?`)) {
                              deleteLead(lead.id);
                              showToast('Lead deleted');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4.5 h-4.5 stroke-[2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-[#8C93AB]">
                      <Target className="w-10 h-10 mx-auto text-[#8C93AB]/40 mb-2 stroke-[2]" />
                      <p className="font-bold text-[#1E2238] dark:text-white">No Leads Found</p>
                      <p className="mt-1">Add a new prospect to begin tracking sales opportunities.</p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-3 px-4 py-2 bg-[#4E53EE] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#4E53EE]/25 cursor-pointer"
                      >
                        + Add First Lead
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD LEAD MODAL                                           */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161926] rounded-3xl border border-[#F0F2F7] dark:border-[#232738] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[#F0F2F7] dark:border-[#232738]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] flex items-center justify-center">
                  <Target className="w-5 h-5 stroke-[2.4]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E2238] dark:text-white">
                    Add New Lead
                  </h3>
                  <p className="text-xs text-[#8C93AB]">
                    Record a potential sales prospect and estimated deal value
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-xl hover:bg-[#F8F9FC] dark:hover:bg-[#1C2030] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TechCorp Solutions"
                    value={addFormData.company}
                    onChange={(e) => setAddFormData({ ...addFormData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="alex@techcorp.com"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Estimated Deal Value
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#8C93AB] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={addFormData.value}
                      onChange={(e) => setAddFormData({ ...addFormData, value: e.target.value })}
                      className="w-full pl-8.5 pr-3.5 py-2.5 font-mono font-bold bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Currency
                  </label>
                  <select
                    value={addFormData.currency}
                    onChange={(e) => setAddFormData({ ...addFormData, currency: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GEL">GEL (₾)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Initial Stage
                  </label>
                  <select
                    value={addFormData.status}
                    onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Lead Source
                  </label>
                  <select
                    value={addFormData.source}
                    onChange={(e) => setAddFormData({ ...addFormData, source: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  >
                    {SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={addFormData.expectedCloseDate}
                    onChange={(e) => setAddFormData({ ...addFormData, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2.5 font-mono bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                  Deal Scope / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign & Brand Architecture"
                  value={addFormData.title}
                  onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                  Internal Notes & Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Client requirements, decision makers, budget notes..."
                  value={addFormData.notes}
                  onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                />
              </div>

              <div className="pt-4 border-t border-[#F0F2F7] dark:border-[#232738] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#5E6482] dark:text-[#8C93AB] hover:bg-[#F8F9FC] dark:hover:bg-[#1C2030] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4E53EE] hover:bg-[#3D42DF] text-white font-bold shadow-md shadow-[#4E53EE]/25 transition cursor-pointer active:scale-95"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT LEAD MODAL                                          */}
      {/* ======================================================== */}
      {isEditModalOpen && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161926] rounded-3xl border border-[#F0F2F7] dark:border-[#232738] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[#F0F2F7] dark:border-[#232738]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] flex items-center justify-center">
                  <Edit2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E2238] dark:text-white flex items-center gap-2">
                    Edit Lead
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE]">
                      {editingLead.company}
                    </span>
                  </h3>
                  <p className="text-xs text-[#8C93AB]">
                    Update prospect information, deal value, or pipeline stage
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

            <form onSubmit={handleUpdateLead} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Deal Value
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#8C93AB] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.value}
                      onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })}
                      className="w-full pl-8.5 pr-3.5 py-2.5 font-mono font-bold bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
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
                    className="w-full px-3 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GEL">GEL (₾)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Pipeline Stage
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Lead Source
                  </label>
                  <select
                    value={editFormData.source}
                    onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  >
                    {SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.expectedCloseDate}
                    onChange={(e) => setEditFormData({ ...editFormData, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2.5 font-mono bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                  Deal Scope / Headline
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FC] dark:bg-[#10121C] border border-[#F0F2F7] dark:border-[#232738] rounded-xl text-[#1E2238] dark:text-[#EAECEF] focus:outline-none focus:border-[#4E53EE]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#F0F2F7] dark:border-[#232738] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleConvertToCustomer(editingLead);
                    setIsEditModalOpen(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-md shadow-[#10B981]/25 transition cursor-pointer active:scale-95"
                >
                  <UserCheck className="w-4.5 h-4.5 stroke-[2.2]" />
                  Win & Convert to Customer
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-[#5E6482] dark:text-[#8C93AB] hover:bg-[#F8F9FC] dark:hover:bg-[#1C2030] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#4E53EE] hover:bg-[#3D42DF] text-white font-bold shadow-md shadow-[#4E53EE]/25 transition cursor-pointer active:scale-95"
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
