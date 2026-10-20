import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import {
  MagnifierIcon,
  BellIcon,
  Widget3Icon,
  AddCircleIcon,
  HamburgerMenuIcon,
  SunIcon,
  MoonStarsIcon,
  StarsIcon,
} from '@solar-icons/react/bold-duotone';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, theme, toggleTheme, toggleSidebar, toggleAIAssistant } = useBudget();
  const [searchTerm, setSearchTerm] = useState('');

  const titles: Record<string, { title: string; subtitle: string }> = {
    finances: { title: 'Dashboard', subtitle: 'Welcome back, John Doe! 👋' },
    crm: { title: 'CRM Leads', subtitle: 'Manage sales leads, pipeline stages, and customer conversions' },
    projects: { title: 'Projects', subtitle: 'Manage deliverables, milestones and client invoicing' },
    coagents: { title: 'Customers', subtitle: 'Manage your client directory and partnership relationships' },
    invoice: { title: 'Invoices', subtitle: 'Track issued invoices, payment status, and export documents' },
    reporting: { title: 'P&L & Analytics', subtitle: 'Profit and loss statement, net profit margins, cashflow and distributions' },
    options: { title: 'Settings', subtitle: 'Configure categories, currencies, and invoice templates' },
  };

  const current = titles[activeTab] || { title: 'Dashboard', subtitle: 'Welcome back, John Doe! 👋' };

  return (
    <header className="no-print flex flex-wrap items-center justify-between gap-4 mb-5 pb-2">
      {/* Left: Greeting & Subtitle */}
      <div>
        <h1 className="text-[23px] font-medium text-[#171717] dark:text-white tracking-[-0.02em] leading-tight">
          {current.title}
        </h1>
        <p className="text-[12px] text-[#7D7C78] dark:text-[#8E8D89] mt-0.5">
          {current.subtitle}
        </p>
      </div>

      {/* Right Controls: Search pill with slash, Date/Theme toggles, Bell, AI Copilot, CTA */}
      <div className="flex items-center gap-2.5">
        {/* Search Pill with "/" badge */}
        <div className="relative flex items-center bg-white dark:bg-[#1C2030] border border-[#E6E5E0] dark:border-[#2A3044] rounded-full pl-3.5 pr-2 py-[6px] w-[236px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#2B70C9] transition-colors">
          <MagnifierIcon className="w-[14px] h-[14px] text-[#8E8D89] shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search records or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-[12px] text-[#171717] dark:text-white placeholder-[#8E8D89] focus:outline-none"
          />
          <span className="w-[19px] h-[19px] rounded-full bg-[#F3F2EE] dark:bg-[#252A3D] text-[#7D7C78] dark:text-[#A0A6BF] text-[10.5px] font-medium flex items-center justify-center shrink-0 ml-1">
            /
          </span>
        </div>

        {/* Dark / Light Theme Toggle Pill Button */}
        <button
          onClick={toggleTheme}
          className="w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1C2030] border border-[#E6E5E0] dark:border-[#2A3044] hover:border-[#D4D3CE] flex items-center justify-center text-[#4A4A46] dark:text-[#F59E0B] hover:text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonStarsIcon className="w-4 h-4" />}
        </button>

        {/* AI Assistant Copilot Quick Toggle */}
        <button
          onClick={toggleAIAssistant}
          className="relative w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1C2030] border border-[#E6E5E0] dark:border-[#2A3044] hover:border-[#D4D3CE] flex items-center justify-center text-[#2B70C9] dark:text-[#7378FF] shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer transition-colors group"
          title="Open AI Financial Copilot"
        >
          <StarsIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-[#1D8848] border border-white dark:border-[#141721]"></span>
        </button>

        {/* Notification Bell with red badge */}
        <button
          className="relative w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1C2030] border border-[#E6E5E0] dark:border-[#2A3044] hover:border-[#D4D3CE] flex items-center justify-center text-[#4A4A46] dark:text-[#A0A6BF] hover:text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer transition-colors"
          title="Notifications"
        >
          <BellIcon className="w-4 h-4" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#E5483B] border border-white dark:border-[#141721] absolute top-[6px] right-[7px]"></span>
        </button>

        {/* User Mini Profile Avatar */}
        <div className="flex items-center gap-2 pl-0.5 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="John Doe"
            className="w-8 h-8 rounded-full object-cover border border-[#DFDED9] dark:border-[#2E3345]"
          />
        </div>

        {/* Submit Project CTA Pill Button */}
        {activeTab !== 'projects' && (
          <button
            onClick={() => setActiveTab('projects')}
            className="bg-[#191919] hover:bg-[#2E2E2E] dark:bg-white dark:text-[#191919] dark:hover:bg-[#EAE9E4] text-white rounded-full px-3.5 py-[7px] text-[12px] font-medium flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <AddCircleIcon className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        )}
      </div>
    </header>
  );
};
