import { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ProductsManagement from '@/components/dashboard/ProductsManagement';
import OrdersManagement from '@/components/dashboard/OrdersManagement';
import CustomersManagement from '@/components/dashboard/CustomersManagement';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import SettingsSection from '@/components/dashboard/SettingsSection';
import UpsellsSection from '@/components/dashboard/UpsellsSection';
import TagsSection from '@/components/dashboard/TagsSection';
import AutomationsSection from '@/components/dashboard/AutomationsSection';
import EmailCampaigns from '@/pages/admin/EmailCampaigns';
import EmailOutbox from '@/components/admin/EmailOutbox';
import OrderBumpsEnhanced from '@/pages/admin/OrderBumpsEnhanced';
import MealPlanSync from '@/pages/admin/MealPlanSync';
import DiscountCodes from '@/pages/admin/DiscountCodes';
import { useMediaQuery } from 'react-responsive';
import UserCenter from '@/pages/admin/UserCenter';
import ReputationManagement from '@/components/admin/reputation/ReputationManagement';
import WhatsAppIntegration from '@/components/admin/whatsapp/WhatsAppIntegration';
import { X } from 'lucide-react';

export type DashboardSection =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'upsells'
  | 'order-bumps'
  | 'tags'
  | 'automations'
  | 'reputation'
  | 'whatsapp'
  | 'analytics'
  | 'email-campaigns'
  | 'email-outbox'
  | 'meal-plan-sync'
  | 'discounts'
  | 'settings'
  | 'user-center';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardContent 
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      isMobile={isMobile}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  );
};

const DashboardContent = ({ 
  activeSection, 
  setActiveSection, 
  isCollapsed, 
  setIsCollapsed, 
  isMobile, 
  sidebarOpen, 
  setSidebarOpen
}: {
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {


  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Sidebar for desktop, overlay for mobile */}
      {!isMobile ? (
        <DashboardSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      ) : (
        <>
          <button
            className="fixed top-4 left-4 z-30 bounce-back-consult-button rounded-full shadow-lg p-3 border border-white/20 hover:bg-white/10 transition-all duration-300"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 flex animate-fade-in">
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={() => setSidebarOpen(false)} 
              />
              <div className="relative z-50 w-64 h-full bounce-back-consult-card border-r border-white/20 shadow-2xl">
                <DashboardSidebar
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  isCollapsed={false}
                  setIsCollapsed={() => {}}
                />
                <button
                  className="absolute top-4 right-4 bounce-back-consult-button rounded-full p-2 hover:bg-white/10 transition-all duration-300"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed && !isMobile ? 'ml-16' : !isMobile ? 'ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <div className="flex-shrink-0">
          <DashboardHeader
            activeSection={activeSection}
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            setActiveSection={setActiveSection}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 bounce-back-consult-surface">
          <div className="max-w-7xl mx-auto">
            {/* Always render content to avoid blank screens if auth is unavailable */}
            <>
              {activeSection === 'overview' && <DashboardOverview />}
              {activeSection === 'products' && <ProductsManagement />}
              {activeSection === 'orders' && <OrdersManagement />}
              {activeSection === 'customers' && <CustomersManagement />}
              {activeSection === 'upsells' && <UpsellsSection />}
              {activeSection === 'order-bumps' && <OrderBumpsEnhanced />}
              {activeSection === 'tags' && <TagsSection />}
              {activeSection === 'automations' && <AutomationsSection />}
              {activeSection === 'reputation' && <ReputationManagement />}
              {activeSection === 'whatsapp' && <WhatsAppIntegration />}
              {activeSection === 'analytics' && <AnalyticsSection />}
              {activeSection === 'email-campaigns' && <EmailCampaigns />}
              {activeSection === 'email-outbox' && <EmailOutbox />}
              {activeSection === 'meal-plan-sync' && <MealPlanSync />}
              {activeSection === 'discounts' && <DiscountCodes />}
              {activeSection === 'settings' && <SettingsSection />}
              {activeSection === 'user-center' && <UserCenter />}
            </>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
