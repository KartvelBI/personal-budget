import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ActiveTab } from '../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { MoneyReceive02Icon } from '@hugeicons/core-free-icons';
import {
  LayoutDashboard,
  Target,
  FolderKanban,
  Users,
  Receipt,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    coagents,
    projects,
    invoices,
    leads,
    settings,
    isSidebarExpanded,
    toggleSidebar,
  } = useBudget();

  const activeLeadsCount = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const pendingProjectsCount = projects.filter((p) => p.status === 'Pending').length;
  const unpaidInvoicesCount = invoices.filter((i) => i.status === 'Sent' || i.status === 'Draft').length;

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: number }[] = [
    {
      id: 'finances',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'crm',
      label: 'CRM Leads',
      icon: Target,
      badge: activeLeadsCount > 0 ? activeLeadsCount : undefined,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      badge: pendingProjectsCount > 0 ? pendingProjectsCount : undefined,
    },
    {
      id: 'coagents',
      label: 'Customers',
      icon: Users,
      badge: coagents.length,
    },
    {
      id: 'invoice',
      label: 'Invoices',
      icon: Receipt,
      badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
    },
    {
      id: 'reporting',
      label: 'Analytics',
      icon: BarChart2,
    },
    {
      id: 'options',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`no-print bg-white dark:bg-[#161922] text-[#5E6482] dark:text-[#949DB2] flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-[#F0F2F7] dark:border-[#232738] z-30 transition-all duration-300 ease-in-out ${
        isSidebarExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className={`py-5 flex items-center border-b border-[#F0F2F7] dark:border-[#232738] ${
        isSidebarExpanded ? 'px-6 justify-between' : 'px-0 justify-center'
      }`}>
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('finances')}
          title="SalesPro Dashboard"
        >
          <div className="w-11 h-11 rounded-xl bg-[#4E53EE] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#4E53EE]/30">
            <HugeiconsIcon icon={MoneyReceive02Icon} size={24} className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          {isSidebarExpanded && (
            <div className="flex items-baseline font-extrabold text-xl tracking-tight">
              <span className="text-[#1E2238] dark:text-white">Sales</span>
              <span className="text-[#4E53EE]">Pro</span>
            </div>
          )}
        </div>

        {/* Expand / Collapse toggle button */}
        {isSidebarExpanded ? (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition absolute -right-3 top-6 bg-white dark:bg-[#161922] border border-[#F0F2F7] dark:border-[#232738] shadow-xs cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4.5 h-4.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {isSidebarExpanded && (
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8C93AB]">
            Menu
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={!isSidebarExpanded ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-[14px] font-semibold transition-all duration-150 relative group cursor-pointer ${
                isSidebarExpanded
                  ? 'justify-between px-3.5 py-3'
                  : 'justify-center p-3'
              } ${
                isActive
                  ? 'bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] dark:border dark:border-[#4E53EE]/30'
                  : 'text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  className={`w-6.5 h-6.5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#4E53EE] dark:text-[#7378FF]'
                      : 'text-[#8C93AB] group-hover:text-[#4E53EE] dark:group-hover:text-white'
                  }`}
                  strokeWidth={2.2}
                />
                {isSidebarExpanded && <span>{item.label}</span>}
              </div>

              {isSidebarExpanded && item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#4E53EE] text-white'
                      : 'bg-[#F0F2F7] dark:bg-[#232738] text-[#5E6482] dark:text-[#949DB2]'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip in collapsed mode */}
              {!isSidebarExpanded && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1E2238] dark:bg-white text-white dark:text-[#1E2238] text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile at bottom */}
      <div className={`p-3.5 border-t border-[#F0F2F7] dark:border-[#232738] flex items-center ${
        isSidebarExpanded ? 'justify-between mx-3 mb-3' : 'justify-center my-2'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#4E53EE] text-white flex items-center justify-center font-black text-xs ring-2 ring-[#EDEEFD] dark:ring-[#2E3345]">
            {(settings.businessName || 'A').charAt(0).toUpperCase()}
          </div>
          {isSidebarExpanded && (
            <div className="leading-tight text-left min-w-0 max-w-[120px]">
              <span className="block text-xs font-bold text-[#1E2238] dark:text-white truncate">
                {settings.businessName || 'Workspace'}
              </span>
              <span className="block text-[10px] font-medium text-[#8C93AB]">Administrator</span>
            </div>
          )}
        </div>
        {isSidebarExpanded && <ChevronDown className="w-3.5 h-3.5 text-[#8C93AB]" />}
      </div>
    </aside>
  );
};
