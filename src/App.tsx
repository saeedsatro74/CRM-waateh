import React, { useState } from 'react';
import { useCRMStore } from './lib/store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { QuickSearchModal } from './components/QuickSearchModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { UserGuideModal } from './components/UserGuideModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { CustomersView } from './components/views/CustomersView';
import { AddCustomerView } from './components/views/AddCustomerView';
import { DealsKanbanView } from './components/views/DealsKanbanView';
import { LeadsView } from './components/views/LeadsView';
import { ServicesView } from './components/views/ServicesView';
import { ProductsView } from './components/views/ProductsView';
import { TasksView } from './components/views/TasksView';
import { CommunicationsView } from './components/views/CommunicationsView';
import { ReportsView } from './components/views/ReportsView';
import { UsersView } from './components/views/UsersView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileView } from './components/views/ProfileView';
import { NotFoundView } from './components/views/NotFoundView';

import { CustomerStatus, CustomerType } from './types';
import { X, UserPlus, Eye, ShieldCheck, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { currentUser, primaryUser, exitUserPanel, addCustomer, logout } = useCRMStore();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // New Customer Modal Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('company');
  const [status, setStatus] = useState<CustomerStatus>('lead');
  const [budget, setBudget] = useState('150000000');
  const [source, setSource] = useState('استعلام مستقیم واته');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('مشتری جدید، تجهیزات صنعتی');

  if (!currentUser) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) return;

    const tagsArray = tagsInput
      .split('،')
      .flatMap((t) => t.split(','))
      .map((t) => t.trim())
      .filter(Boolean);

    addCustomer({
      name,
      companyName,
      phone,
      secondaryPhone,
      email,
      address,
      customerType,
      status,
      tags: tagsArray.length ? tagsArray : ['مشتری جدید'],
      assignedToUserId: currentUser.id,
      lastContactDate: new Date().toISOString().split('T')[0],
      notes,
      budget: parseInt(budget) || 0,
      source,
      awaitingResponse: false,
    });

    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setShowAddCustomerModal(false);
  };

  const userRole = currentUser?.role || 'sales';

  const isTabAllowed = (tab: string, role: string) => {
    if (tab === 'profile') return true;
    switch (role) {
      case 'admin':
        return true;
      case 'sales_manager':
        return ['dashboard', 'customers', 'customers_new', 'sales', 'deals', 'leads', 'products', 'tasks', 'reports', 'profile'].includes(tab);
      case 'sales':
        return ['customers', 'customers_new', 'sales', 'deals', 'leads', 'tasks', 'profile'].includes(tab);
      case 'service':
        return ['customers', 'services', 'tasks', 'profile'].includes(tab);
      default:
        return ['customers', 'profile'].includes(tab);
    }
  };

  const getDefaultTabForRole = (role: string) => {
    switch (role) {
      case 'admin':
      case 'sales_manager':
        return 'dashboard';
      case 'service':
        return 'services';
      case 'sales':
      default:
        return 'customers';
    }
  };

  const currentActiveTab = isTabAllowed(activeTab, userRole)
    ? activeTab
    : getDefaultTabForRole(userRole);

  const renderActiveView = () => {
    switch (currentActiveTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigateTab={setActiveTab}
            onOpenAddCustomer={() => setActiveTab('customers_new')}
            onSelectCustomer={setSelectedCustomerId}
          />
        );
      case 'customers':
        return (
          <CustomersView
            onSelectCustomer={setSelectedCustomerId}
            onOpenAddCustomerModal={() => setActiveTab('customers_new')}
          />
        );
      case 'customers_new':
        return <AddCustomerView onNavigateCustomers={() => setActiveTab('customers')} />;
      case 'sales':
      case 'deals':
        return <DealsKanbanView />;
      case 'leads':
        return <LeadsView />;
      case 'services':
        return <ServicesView />;
      case 'products':
        return <ProductsView />;
      case 'tasks':
        return <TasksView />;
      case 'communications':
        return <CommunicationsView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <NotFoundView onNavigateHome={() => setActiveTab(getDefaultTabForRole(userRole))} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 font-sans flex flex-col dir-rtl selection:bg-teal-700 selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeTab={currentActiveTab}
        setActiveTab={setActiveTab}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onLogout={logout}
      />

      {/* Active Panel Supervision Banner */}
      {primaryUser && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold shadow-md border-b border-indigo-500/30 z-40">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-300 shrink-0 animate-pulse" />
            <span>
              شما با حساب اصلی <strong className="text-teal-300">{primaryUser.name} ({primaryUser.role === 'admin' ? 'مدیر ارشد' : 'مدیر فروش'})</strong> در حال بررسی و نظارت بر پنل پرسنل <strong className="text-amber-300">{currentUser?.name} ({currentUser?.department || currentUser?.role})</strong> هستید.
            </span>
          </div>
          <button
            onClick={() => {
              exitUserPanel();
              setActiveTab('dashboard');
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-[11px] shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج از پنل و بازگشت به حساب اصلی شما ({primaryUser.name})</span>
          </button>
        </div>
      )}



      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={currentActiveTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          onOpenAddCustomer={() => setActiveTab('customers_new')}
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
        />

        {/* View Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentActiveTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectCustomer={(id) => {
          setSelectedCustomerId(id);
          setIsQuickSearchOpen(false);
        }}
        onNavigateTab={setActiveTab}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onNavigateTab={setActiveTab}
      />

      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />

      <CustomerDetailModal
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />

      {/* Global Quick Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 dir-rtl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-700" />
                  <h2 className="text-sm font-bold text-slate-900">افزودن سریع مشتری جدید شرکت واته</h2>
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام شرکت یا مجموعه
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="نام شرکت..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام شخص رابط
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="نام رابط..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شماره تماس اصلی
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="۰۲۱..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      پست الکترونیکی (ایمیل)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@company.ir"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نوع مشتری
                    </label>
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="company">حقوقی (شرکت / سازمان)</option>
                      <option value="person">حقیقی (شخص)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      وضعیت اولیه
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="lead">سرنخ اولیه</option>
                      <option value="potential">مشتری احتمالی</option>
                      <option value="negotiating">در حال مذاکره</option>
                      <option value="active">مشتری فعال</option>
                      <option value="vip">مشتری VIP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    بودجه تخمینی (تومان)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    آدرس کامل
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="شهر، خیابان..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    توضیحات اولیه
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="توضیحات..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10"
                  >
                    ذخیره مشتری
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
