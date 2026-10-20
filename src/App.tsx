import React from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CoagentsTab } from './components/tabs/CoagentsTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';
import { InvoiceTab } from './components/tabs/InvoiceTab';
import { FinancesTab } from './components/tabs/FinancesTab';
import { CRMTab } from './components/tabs/CRMTab';
import { ReportingTab } from './components/tabs/ReportingTab';
import { OptionsTab } from './components/tabs/OptionsTab';
import { InvoiceModal } from './components/common/InvoiceModal';
import { AIAssistantModal } from './components/ai/AIAssistantModal';

const MainLayout: React.FC = () => {
  const { activeTab, theme } = useBudget();

  return (
    <div className={`${theme === 'dark' ? 'dark bg-[#0F111A]' : 'bg-[#D5D7DC]'} min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-6 text-[#171717] dark:text-[#F1F3F9] font-sans antialiased transition-colors duration-200`}>
      {/* Central Floating App Container matching TestCRM / Fixora */}
      <div className="w-full max-w-[1400px] min-h-[860px] bg-[#F5F4F0] dark:bg-[#141721] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#ECEBE6] dark:border-[#232738] flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-200 overflow-y-auto">
          <Header />

          <main className="flex-1 p-5 lg:p-6 w-full">
            {activeTab === 'finances' && <FinancesTab />}
            {activeTab === 'crm' && <CRMTab />}
            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'coagents' && <CoagentsTab />}
            {activeTab === 'invoice' && <InvoiceTab />}
            {activeTab === 'reporting' && <ReportingTab />}
            {activeTab === 'options' && <OptionsTab />}
          </main>
        </div>
      </div>

      {/* Global Invoice Preview / Print Modal */}
      <InvoiceModal />

      {/* Expandable AI Financial Assistant */}
      <AIAssistantModal />
    </div>
  );
};

export default function App() {
  return (
    <BudgetProvider>
      <MainLayout />
    </BudgetProvider>
  );
}
