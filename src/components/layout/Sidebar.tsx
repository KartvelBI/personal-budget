import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Receipt,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Crown,
  LogOut,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    coagents,
    projects,
    invoices,
    isSidebarExpanded,
    toggleSidebar,
  } = useBudget();

  const pendingProjectsCount = projects.filter((p) => p.status === 'Pending').length;
  const unpaidInvoicesCount = invoices.filter((i) => i.status === 'Sent' || i.status === 'Draft').length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    {
      id: 'finances',
      label: 'Dashboard',
      icon: LayoutDashboard,
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
          <div className="w-9 h-9 rounded-xl bg-[#4E53EE] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#4E53EE]/30">
            {/* 3 Rising bars */}
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-white rounded-xs h-2"></span>
              <span className="w-1 bg-white rounded-xs h-3.5"></span>
              <span className="w-1 bg-white rounded-xs h-4"></span>
            </div>
          </div>
          {isSidebarExpanded && (
            <div className="flex items-baseline font-extrabold text-lg tracking-tight">
              <span className="text-[#1E2238] dark:text-white">Sales</span>
              <span className="text-[#4E53EE]">Pro</span>
            </div>
          )}
        </div>

        {/* Expand / Collapse toggle button */}
        {isSidebarExpanded ? (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-xl text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition absolute -right-3 top-6 bg-white dark:bg-[#161922] border border-[#F0F2F7] dark:border-[#232738] shadow-xs"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
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
              className={`w-full flex items-center rounded-xl text-[13.5px] font-semibold transition-all duration-150 relative group ${
                isSidebarExpanded
                  ? 'justify-between px-3.5 py-2.5'
                  : 'justify-center p-2.5'
              } ${
                isActive
                  ? 'bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] dark:border dark:border-[#4E53EE]/30'
                  : 'text-[#5E6482] dark:text-[#949DB2] hover:text-[#1E2238] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#4E53EE] dark:text-[#7378FF]'
                      : 'text-[#8C93AB] group-hover:text-[#4E53EE] dark:group-hover:text-white'
                  }`}
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
                  {item.badge !== undefined && ` (${item.badge})`}
                </div>
              )}
            </button>
          );
        })}

        <div className="pt-2">
          <button
            onClick={() => setActiveTab('options')}
            title={!isSidebarExpanded ? 'Settings / Preferences' : undefined}
            className={`w-full flex items-center rounded-xl text-[13.5px] font-semibold text-[#8C93AB] hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition relative group ${
              isSidebarExpanded ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0 text-[#8C93AB]" />
            {isSidebarExpanded && <span>Preferences</span>}

            {!isSidebarExpanded && (
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1E2238] dark:bg-white text-white dark:text-[#1E2238] text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md whitespace-nowrap">
                Preferences
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Professional Plan Card */}
      {isSidebarExpanded ? (
        <div className="p-3.5 m-3 rounded-2xl bg-[#F8F9FC] dark:bg-[#1C202E] border border-[#E9ECF2] dark:border-[#2A3044] text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#1E2238] dark:text-white">
            <Crown className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span>Professional Plan</span>
          </div>
          <p className="text-[11px] text-[#8C93AB] mt-0.5">You're on Professional plan</p>

          <div className="mt-2.5 px-2">
            <div className="flex justify-between text-[10px] font-bold text-[#4E53EE] dark:text-[#7378FF] mb-1">
              <span>Quota Usage</span>
              <span className="font-mono">7/10 Users</span>
            </div>
            <div className="w-full bg-[#E5E7EB] dark:bg-[#2A3044] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#4E53EE] dark:bg-[#7378FF] h-1.5 rounded-full w-[70%]"></div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('options')}
            className="mt-3 w-full py-2 bg-[#4E53EE] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl shadow-xs shadow-[#4E53EE]/25 transition"
          >
            Upgrade Plan
          </button>
        </div>
      ) : (
        <div className="p-3 text-center my-2">
          <button
            onClick={() => setActiveTab('options')}
            className="w-10 h-10 mx-auto rounded-xl bg-[#F8F9FC] dark:bg-[#1C202E] border border-[#E9ECF2] dark:border-[#2A3044] flex items-center justify-center text-[#F59E0B] hover:bg-[#EDEEFD] transition"
            title="Professional Plan"
          >
            <Crown className="w-5 h-5 fill-[#F59E0B]" />
          </button>
        </div>
      )}

      {/* User Profile at bottom */}
      <div className={`p-3.5 border-t border-[#F0F2F7] dark:border-[#232738] flex items-center ${
        isSidebarExpanded ? 'justify-between mx-3 mb-3' : 'justify-center my-2'
      }`}>
        <div className="flex items-center gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="John Doe"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#EDEEFD] dark:ring-[#2E3345]"
          />
          {isSidebarExpanded && (
            <div className="leading-tight text-left">
              <span className="block text-xs font-bold text-[#1E2238] dark:text-white">John Doe</span>
              <span className="block text-[10px] font-medium text-[#8C93AB]">Admin</span>
            </div>
          )}
        </div>
        {isSidebarExpanded && <ChevronDown className="w-3.5 h-3.5 text-[#8C93AB]" />}
      </div>
    </aside>
  );
};
