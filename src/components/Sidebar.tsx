import React from 'react';
import { useCRMStore } from '../lib/store';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Target,
  Wrench,
  Package,
  CheckSquare,
  UserCog,
  Settings,
  X,
  PlusCircle,
  Building2,
  PhoneCall,
  BarChart3,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenAddCustomer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  onOpenAddCustomer,
}) => {
  const { accessibleTasks, accessibleCustomers, serviceRequests, currentUser } = useCRMStore();

  const pendingTaskCount = accessibleTasks.filter((t) => t.status !== 'completed').length;
  const activeServicesCount = serviceRequests.filter((s) => s.status !== 'completed' && s.status !== 'delivered').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'داشبورد مدیریتی',
      icon: LayoutDashboard,
      color: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100',
      activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
      roles: ['admin', 'sales', 'support'],
    },
    {
      id: 'customers',
      label: 'مدیریت مشتریان',
      icon: Users,
      color: 'text-sky-600 bg-sky-50 group-hover:bg-sky-100',
      activeBg: 'bg-sky-600 text-white shadow-md shadow-sky-200',
      badge: accessibleCustomers.length > 0 ? accessibleCustomers.length : null,
      badgeBg: 'bg-slate-200 text-slate-700',
      roles: ['admin', 'sales', 'support'],
    },
    {
      id: 'customers_new',
      label: 'افزودن مشتری جدید',
      icon: UserPlus,
      color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100',
      activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-200',
      roles: ['admin', 'sales', 'support'],
    },
    {
      id: 'sales',
      label: 'فرصت‌ها و فروش',
      icon: Target,
      color: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
      activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-200',
      roles: ['admin', 'sales'],
    },
    {
      id: 'services',
      label: 'خدمات و تعمیرات واته',
      icon: Wrench,
      color: 'text-teal-600 bg-teal-50 group-hover:bg-teal-100',
      activeBg: 'bg-teal-600 text-white shadow-md shadow-teal-200',
      badge: activeServicesCount > 0 ? activeServicesCount : null,
      badgeBg: 'bg-amber-500 text-white animate-pulse',
      roles: ['admin', 'sales', 'support'],
    },
    {
      id: 'products',
      label: 'دستگاه‌ها و تجهیزات',
      icon: Package,
      color: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
      activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-200',
      roles: ['admin', 'sales', 'support'],
    },
    {
      id: 'tasks',
      label: 'وظایف و پیگیری‌ها',
      icon: CheckSquare,
      color: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100',
      activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-200',
      badge: pendingTaskCount > 0 ? pendingTaskCount : null,
      badgeBg: 'bg-rose-500 text-white',
      roles: ['admin', 'sales', 'support'],
    },
    {
      id: 'users',
      label: 'کاربران و پرسنل',
      icon: UserCog,
      color: 'text-rose-600 bg-rose-50 group-hover:bg-rose-100',
      activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-200',
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'تنظیمات و دیتابیس',
      icon: Settings,
      color: 'text-slate-600 bg-slate-100 group-hover:bg-slate-200',
      activeBg: 'bg-slate-800 text-white shadow-md shadow-slate-300',
      roles: ['admin', 'sales', 'support'],
    },
  ];

  const userRole = currentUser?.role || 'sales';
  const visibleItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 lg:z-20 w-72 bg-white border-l border-[#d0dbe5] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } lg:static lg:h-[calc(100vh-61px)] shadow-xs`}
      >
        {/* Mobile Sidebar Close Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-700" />
            <span className="font-bold text-sm text-slate-800">منوی WAATEH CRM</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 pb-2">
          <button
            onClick={() => {
              setActiveTab('customers_new');
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-teal-900/20 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت مشتری جدید</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all group ${
                  isActive
                    ? item.activeBg
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isActive ? 'bg-white/20 text-white' : item.color
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-slate-900' : item.badgeBg
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Role Status Box */}
        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-800">سامانه صنعتی شرکت واته</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              آماده اتصال به دیتابیس Supabase
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
