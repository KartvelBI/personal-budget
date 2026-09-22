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
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-[#F8F9FC] dark:bg-[#0F111A] text-[#1E2238] dark:text-[#F1F3F9] font-sans antialiased transition-colors duration-200 flex`}>
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200">
        <Header />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'finances' && <FinancesTab />}
          {activeTab === 'crm' && <CRMTab />}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'coagents' && <CoagentsTab />}
          {activeTab === 'invoice' && <InvoiceTab />}
          {activeTab === 'reporting' && <ReportingTab />}
          {activeTab === 'options' && <OptionsTab />}
        </main>
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
