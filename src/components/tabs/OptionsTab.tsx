import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import {
  Tag,
  Plus,
  Trash2,
  Building,
  CreditCard,
  Download,
  Upload,
  RotateCcw,
  Check,
  DollarSign,
  Layers,
} from 'lucide-react';

const PRESET_COLORS = [
  '#4E53EE', // Indigo
  '#10B981', // Mint
  '#F59E0B', // Amber
  '#6366F1', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#1E2238', // Navy
];

export const OptionsTab: React.FC = () => {
  const {
    categories,
    addCategory,
    deleteCategory,
    settings,
    updateSettings,
    resetData,
    exportJSON,
    importJSON,
  } = useBudget();

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'Income' | 'Expense'>('Income');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  const [profileForm, setProfileForm] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newCurrencyCode, setNewCurrencyCode] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
    });
    setNewCatName('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(profileForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCurrencyCode.trim().toUpperCase();
    if (!code || settings.availableCurrencies.includes(code)) return;
    updateSettings({
      availableCurrencies: [...settings.availableCurrencies, code],
    });
    setNewCurrencyCode('');
  };

  const handleRemoveCurrency = (code: string) => {
    if (settings.availableCurrencies.length <= 1) return;
    updateSettings({
      availableCurrencies: settings.availableCurrencies.filter((c) => c !== code),
      defaultCurrency: settings.defaultCurrency === code ? settings.availableCurrencies[0] : settings.defaultCurrency,
    });
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salespro-budget-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Category Management */}
      <section className="bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs">
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F0F2F7] dark:border-[#232738]">
          <div className="w-14 h-14 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] flex items-center justify-center shadow-md shadow-[#4E53EE]/10 shrink-0">
            <Tag className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Category Settings</h2>
            <p className="text-xs text-[#8C93AB]">
              Manage categories for project deliverables and financial logs
            </p>
          </div>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="mt-4 p-4.5 bg-[#F8F9FC] dark:bg-[#1C2030] rounded-xl border border-[#F0F2F7] dark:border-[#232738]">
          <div className="text-xs font-bold text-[#1E2238] dark:text-white mb-2.5">Add New Category</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-[#8C93AB] mb-1">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Mobile App Dev, Cloud Audit"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-[#8C93AB] mb-1">Type</label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as 'Income' | 'Expense')}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] rounded-xl outline-none focus:border-[#4E53EE] font-bold text-[#1E2238] dark:text-white"
              >
                <option value="Income" className="bg-white dark:bg-[#161926] text-[#1E2238] dark:text-white">Income (+)</option>
                <option value="Expense" className="bg-white dark:bg-[#161926] text-[#1E2238] dark:text-white">Expense (-)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#8C93AB] mb-1">Color</label>
              <div className="flex items-center gap-1.5 h-8">
                {PRESET_COLORS.slice(0, 5).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewCatColor(col)}
                    style={{ backgroundColor: col }}
                    className={`w-4.5 h-4.5 rounded-full transition-transform cursor-pointer ${
                      newCatColor === col ? 'scale-125 ring-2 ring-[#4E53EE] ring-offset-1' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4E53EE] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.2]" />
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Existing categories list */}
        <div className="mt-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C93AB] mb-2">Available Categories ({categories.length})</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-[#1C2030] border border-[#F0F2F7] dark:border-[#232738] rounded-xl shadow-xs hover:border-slate-200 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div>
                    <span className="text-xs font-bold text-[#1E2238] dark:text-white block">{cat.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        cat.type === 'Income' ? 'bg-[#E6F9F0] dark:bg-[#10B981]/20 text-[#10B981]' : 'bg-[#FDE8E8] dark:bg-rose-950/30 text-[#EF4444]'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete category "${cat.name}"?`)) {
                      deleteCategory(cat.id);
                    }
                  }}
                  className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 rounded-lg transition hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-4.5 h-4.5 stroke-[2]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Currencies */}
      <section className="bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs">
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F0F2F7] dark:border-[#232738]">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F9F0] dark:bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shadow-md shadow-[#10B981]/10 shrink-0">
            <DollarSign className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Currencies Configuration</h2>
            <p className="text-xs text-[#8C93AB]">
              Manage currencies for project work and invoice generation
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Default System Currency</label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => updateSettings({ defaultCurrency: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] rounded-xl outline-none focus:border-[#4E53EE] font-bold text-[#1E2238] dark:text-white font-mono"
            >
              {settings.availableCurrencies.map((code) => (
                <option key={code} value={code} className="bg-white dark:bg-[#161926] text-[#1E2238] dark:text-white">
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Add Custom Currency</label>
            <form onSubmit={handleAddCurrency} className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. AUD, CHF"
                value={newCurrencyCode}
                onChange={(e) => setNewCurrencyCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] rounded-xl outline-none focus:border-[#4E53EE] font-mono font-bold text-[#1E2238] dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E2238] dark:bg-[#4E53EE] hover:bg-slate-800 dark:hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          {settings.availableCurrencies.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F9FC] dark:bg-[#1C2030] border border-[#F0F2F7] dark:border-[#232738] text-xs font-mono font-bold text-[#1E2238] dark:text-white"
            >
              {code}
              {settings.availableCurrencies.length > 1 && code !== settings.defaultCurrency && (
                <button
                  type="button"
                  onClick={() => handleRemoveCurrency(code)}
                  className="hover:text-rose-600 transition ml-1 cursor-pointer"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* 3. Invoice Issuer & Bank Details */}
      <section className="bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs">
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F0F2F7] dark:border-[#232738]">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF6E7] dark:bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center shadow-md shadow-[#F59E0B]/10 shrink-0">
            <Building className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Issuer & Bank Details</h2>
            <p className="text-xs text-[#8C93AB]">
              Details displayed on automated invoices sent to clients
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Business Name</label>
              <input
                type="text"
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Business Email</label>
              <input
                type="email"
                value={profileForm.businessEmail}
                onChange={(e) => setProfileForm({ ...profileForm, businessEmail: e.target.value })}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Phone</label>
              <input
                type="text"
                value={profileForm.businessPhone}
                onChange={(e) => setProfileForm({ ...profileForm, businessPhone: e.target.value })}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Tax / VAT ID</label>
              <input
                type="text"
                value={profileForm.taxNumber}
                onChange={(e) => setProfileForm({ ...profileForm, taxNumber: e.target.value })}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Payment Terms (Days)</label>
              <input
                type="number"
                value={profileForm.paymentTermsDays}
                onChange={(e) => setProfileForm({ ...profileForm, paymentTermsDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1E2238] dark:text-[#EAECEF] mb-1">Business Address</label>
            <input
              type="text"
              value={profileForm.businessAddress}
              onChange={(e) => setProfileForm({ ...profileForm, businessAddress: e.target.value })}
              className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
            />
          </div>

          <div className="pt-2 border-t border-[#F0F2F7] dark:border-[#232738]">
            <div className="text-xs font-bold text-[#1E2238] dark:text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5 text-[#4E53EE] dark:text-[#818CF8] stroke-[2]" />
              Bank Transfer Instructions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#8C93AB] mb-1">Bank Name</label>
                <input
                  type="text"
                  value={profileForm.bankName}
                  onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#8C93AB] mb-1">IBAN / Account</label>
                <input
                  type="text"
                  value={profileForm.iban}
                  onChange={(e) => setProfileForm({ ...profileForm, iban: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#8C93AB] mb-1">SWIFT / BIC</label>
                <input
                  type="text"
                  value={profileForm.swift}
                  onChange={(e) => setProfileForm({ ...profileForm, swift: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#10121C] border border-[#E5E7EB] dark:border-[#2A2F45] text-[#1E2238] dark:text-white rounded-xl outline-none focus:border-[#4E53EE] font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                <Check className="w-4.5 h-4.5 stroke-[2.2]" />
                Settings saved!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#4E53EE] hover:bg-[#4338CA] text-white rounded-xl font-bold shadow-xs shadow-[#4E53EE]/25 transition cursor-pointer"
            >
              Save Invoice Settings
            </button>
          </div>
        </form>
      </section>

      {/* 4. Backup & Reset */}
      <section className="bg-white dark:bg-[#161926] rounded-2xl border border-[#F0F2F7] dark:border-[#232738] p-6 shadow-xs">
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F0F2F7] dark:border-[#232738]">
          <div className="w-14 h-14 rounded-2xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] flex items-center justify-center shadow-md shadow-[#4E53EE]/10 shrink-0">
            <Layers className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#1E2238] dark:text-white">Data Backup & Reset</h2>
            <p className="text-xs text-[#8C93AB]">
              Export JSON backup, restore data, or load initial demo records
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2.5 p-4 rounded-xl border border-[#F0F2F7] dark:border-[#232738] bg-[#F8F9FC] dark:bg-[#1C2030] hover:bg-slate-100 dark:hover:bg-[#252A3D] text-[#1E2238] dark:text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Download className="w-5 h-5 text-[#4E53EE] dark:text-[#818CF8] stroke-[2.2]" />
            Export JSON
          </button>

          <label className="flex items-center justify-center gap-2.5 p-4 rounded-xl border border-[#F0F2F7] dark:border-[#232738] bg-[#F8F9FC] dark:bg-[#1C2030] hover:bg-slate-100 dark:hover:bg-[#252A3D] text-[#1E2238] dark:text-white text-xs font-bold transition cursor-pointer shadow-xs">
            <Upload className="w-5 h-5 text-[#10B981] stroke-[2.2]" />
            <span>Restore JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset to initial sample records?')) {
                resetData();
              }
            }}
            className="flex items-center justify-center gap-2.5 p-4 rounded-xl border border-[#FDE8E8] dark:border-rose-900/40 bg-[#FDF2F2] dark:bg-rose-950/20 hover:bg-[#FDE8E8] dark:hover:bg-rose-950/40 text-[#EF4444] text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-5 h-5 text-[#EF4444] stroke-[2.2]" />
            Reset to Sample Data
          </button>
        </div>
      </section>
    </div>
  );
};
