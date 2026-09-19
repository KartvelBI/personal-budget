import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import {
  Search,
  Bell,
  LayoutGrid,
  Plus,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, theme, toggleTheme, toggleSidebar } = useBudget();
  const [searchTerm, setSearchTerm] = useState('');

  const titles: Record<string, { title: string; subtitle: string }> = {
    finances: { title: 'Dashboard', subtitle: 'Welcome back, John Doe! 👋' },
    projects: { title: 'Projects', subtitle: 'Manage deliverables, milestones and client invoicing' },
    coagents: { title: 'Customers', subtitle: 'Manage your client directory and partnership relationships' },
    invoice: { title: 'Invoices', subtitle: 'Track issued invoices, payment status, and export documents' },
    reporting: { title: 'Analytics', subtitle: 'Detailed revenue growth, cashflow trends, and performance' },
    options: { title: 'Settings', subtitle: 'Configure categories, currencies, and invoice templates' },
  };

  const current = titles[activeTab] || { title: 'Dashboard', subtitle: 'Welcome back, John Doe! 👋' };

  return (
    <header className="no-print bg-white dark:bg-[#161922] px-6 sm:px-8 py-3.5 border-b border-[#F0F2F7] dark:border-[#232738] flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors duration-200">
      {/* Left: Hamburger menu toggle + Heading */}
      <div className="flex items-center gap-3.5">
        {/* Hamburger Menu button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] bg-[#F8F9FC] dark:bg-[#1F2330] text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white hover:bg-slate-100 transition shadow-2xs"
          title="Toggle Left Menu"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#1E2238] dark:text-white tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#8C93AB] dark:text-[#7A839E] font-medium hidden xs:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Search, Theme Toggle, Apps, Bell, User Profile, CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Search Input */}
        <div className="relative w-44 sm:w-60 hidden md:block">
          <Search className="w-4 h-4 text-[#8C93AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-3.5 py-2 text-xs bg-[#F8F9FC] dark:bg-[#1F2330] border border-[#F0F2F7] dark:border-[#2A3044] rounded-xl text-[#1E2238] dark:text-white placeholder-[#8C93AB] outline-none focus:ring-2 focus:ring-[#4E53EE]/20 focus:border-[#4E53EE] transition"
          />
        </div>

        {/* Dark / White Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] bg-[#F8F9FC] dark:bg-[#1F2330] flex items-center justify-center text-[#5E6482] dark:text-[#F59E0B] hover:text-[#1E2238] dark:hover:text-white transition shadow-2xs"
          title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Apps Grid Icon */}
        <button
          className="w-9 h-9 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] bg-[#F8F9FC] dark:bg-[#1F2330] flex items-center justify-center text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white transition shadow-2xs hidden sm:flex"
          title="Apps"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          className="relative w-9 h-9 rounded-xl border border-[#F0F2F7] dark:border-[#2A3044] bg-[#F8F9FC] dark:bg-[#1F2330] flex items-center justify-center text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white transition shadow-2xs"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#161922]"></span>
        </button>

        {/* User Mini Profile */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="John Doe"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#F0F2F7] dark:ring-[#2E3345]"
          />
          <span className="text-xs font-bold text-[#1E2238] dark:text-white hidden lg:block">John Doe</span>
        </div>

        {/* Submit Project CTA */}
        {activeTab !== 'projects' && (
          <button
            onClick={() => setActiveTab('projects')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4E53EE] hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs shadow-[#4E53EE]/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>
    </header>
  );
};
