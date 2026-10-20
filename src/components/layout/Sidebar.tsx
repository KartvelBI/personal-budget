import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ActiveTab } from '../../types';
import {
  Widget4Icon,
  TargetIcon,
  Folder2Icon,
  UsersGroupRoundedIcon,
  BillListIcon,
  ChartSquareIcon,
  SettingsIcon,
  AltArrowLeftIcon,
  AltArrowRightIcon,
  AltArrowDownIcon,
  CardReceiveIcon,
} from '@solar-icons/react/bold-duotone';

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

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'finances',
      label: 'Dashboard',
      icon: Widget4Icon,
    },
    {
      id: 'crm',
      label: 'CRM Leads',
      icon: TargetIcon,
      badge: activeLeadsCount > 0 ? activeLeadsCount : undefined,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder2Icon,
      badge: pendingProjectsCount > 0 ? pendingProjectsCount : undefined,
    },
    {
      id: 'coagents',
      label: 'Customers',
      icon: UsersGroupRoundedIcon,
      badge: coagents.length,
    },
    {
      id: 'invoice',
      label: 'Invoices',
      icon: BillListIcon,
      badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
    },
    {
      id: 'reporting',
      label: 'P&L & Analytics',
      icon: ChartSquareIcon,
    },
    {
      id: 'options',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <aside
      className={`no-print bg-[#F5F4F0] dark:bg-[#141721] text-[#474744] dark:text-[#949DB2] flex flex-col justify-between py-4 px-3 border-r border-[#E6E5E0] dark:border-[#232738] shrink-0 transition-all duration-200 select-none ${
        isSidebarExpanded ? 'w-[218px]' : 'w-[68px]'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1.5 mb-5">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('finances')}
            title="SalesPro Dashboard"
          >
            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#191919] dark:bg-[#2A2E3D] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-white font-bold text-[15px] tracking-tight leading-none flex items-baseline">
                S<span className="w-[4px] h-[4px] rounded-full bg-[#E86A33] ml-[1px] inline-block"></span>
              </span>
            </div>
            {isSidebarExpanded && (
              <div className="leading-tight">
                <div className="text-[13.5px] font-semibold text-[#171717] dark:text-white tracking-[-0.01em]">
                  SalesPro
                </div>
                <div className="text-[11px] text-[#7D7C78] dark:text-[#8E8D89] truncate max-w-[125px]">
                  {settings.businessName || 'Workspace'}
                </div>
              </div>
            )}
          </div>

          {/* Expand / Collapse toggle button */}
          {isSidebarExpanded ? (
            <button
              onClick={toggleSidebar}
              className="text-[#7D7C78] hover:text-[#171717] dark:hover:text-white p-1 rounded-md hover:bg-[#EAE9E4]/70 dark:hover:bg-[#1F2330] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <AltArrowLeftIcon className="w-[15px] h-[15px]" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="text-[#7D7C78] hover:text-[#171717] dark:hover:text-white p-1 rounded-md hover:bg-[#EAE9E4]/70 dark:hover:bg-[#1F2330] transition-colors cursor-pointer mx-auto mt-2"
              title="Expand sidebar"
            >
              <AltArrowRightIcon className="w-[15px] h-[15px]" />
            </button>
          )}
        </div>

        {/* Section: Operations */}
        <div className="mb-4">
          {isSidebarExpanded && (
            <div className="px-3 mb-1.5 text-[11px] font-normal text-[#8E8D89] uppercase tracking-wider">
              Operations
            </div>
          )}

          <nav className="space-y-0.5">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isSidebarExpanded ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-[7px] rounded-full text-[12.5px] transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#191919] dark:bg-[#252A3D] text-white font-medium shadow-xs'
                      : 'text-[#474744] dark:text-[#A0A6BF] hover:bg-[#EAE9E4]/70 dark:hover:bg-[#1F2330] font-normal'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-[15px] h-[15px] shrink-0" />
                    {isSidebarExpanded && <span>{item.label}</span>}
                  </span>

                  {isSidebarExpanded && item.badge !== undefined && (
                    <span
                      className={`text-[10.5px] font-medium font-mono px-2 py-[1px] rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#EAE9E4] dark:bg-[#232738] text-[#4A4A46] dark:text-[#A0A6BF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: Analytics & Settings */}
        <div>
          {isSidebarExpanded && (
            <div className="px-3 mb-1.5 text-[11px] font-normal text-[#8E8D89] uppercase tracking-wider">
              Analytics & Config
            </div>
          )}

          <nav className="space-y-0.5">
            {navItems.slice(5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isSidebarExpanded ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-[7px] rounded-full text-[12.5px] transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#191919] dark:bg-[#252A3D] text-white font-medium shadow-xs'
                      : 'text-[#474744] dark:text-[#A0A6BF] hover:bg-[#EAE9E4]/70 dark:hover:bg-[#1F2330] font-normal'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-[15px] h-[15px] shrink-0" />
                    {isSidebarExpanded && <span>{item.label}</span>}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile at bottom */}
      <div className="pt-3 border-t border-[#E6E5E0] dark:border-[#232738] flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[28px] h-[28px] rounded-full bg-[#191919] dark:bg-[#2A2E3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {(settings.businessName || 'A').charAt(0).toUpperCase()}
          </div>
          {isSidebarExpanded && (
            <div className="leading-tight text-left min-w-0">
              <span className="block text-[12px] font-medium text-[#171717] dark:text-white truncate">
                {settings.businessName || 'Workspace'}
              </span>
              <span className="block text-[10.5px] text-[#7D7C78] dark:text-[#8E8D89]">Administrator</span>
            </div>
          )}
        </div>
        {isSidebarExpanded && <AltArrowDownIcon className="w-3.5 h-3.5 text-[#7D7C78]" />}
      </div>
    </aside>
  );
};
