import React, { useState } from 'react';
import { useCRMStore } from '../lib/store';
import {
  Search,
  Bell,
  LogOut,
  ShieldCheck,
  UserCheck,
  Headphones,
  ChevronDown,
  Building2,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickSearch: () => void;
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSearch,
  onToggleMobileSidebar,
  onOpenNotifications,
  onLogout,
}) => {
  const { currentUser, switchUserRole, unreadNotificationCount, settings } = useCRMStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'مدیر سیستم',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldCheck,
        };
      case 'sales':
        return {
          label: 'کارشناس فروش',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: UserCheck,
        };
      case 'support':
        return {
          label: 'پشتیبانی مشتریان',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Headphones,
        };
      default:
        return {
          label: 'کاربر سیستم',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: UserCheck,
        };
    }
  };

  const currentRoleInfo = getRoleBadge(currentUser?.role);
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#d0dbe5] px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Right side: Mobile Menu button & Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="باز کردن منو"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-slate-800 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-900/20 border border-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                {settings.companyName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">سامانه مدیریت ارتباط با مشتریان</p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <button
            onClick={onOpenQuickSearch}
            className="w-full flex items-center justify-between gap-2 bg-slate-100/80 hover:bg-slate-100 text-slate-500 hover:text-slate-700 px-3.5 py-2 rounded-2xl text-xs sm:text-sm border border-slate-200/70 transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span>جستجوی مشتریان، فرصت‌ها، وظایف...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-sans shadow-2xs">
              <span>Ctrl</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Left side: Role Switcher, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher Dropdown (Demonstration & Testing) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${currentRoleInfo.bg}`}
              title="تغییر نقش سریع"
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{currentRoleInfo.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            <AnimatePresence>
              {showRoleMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 text-right"
                >
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 mb-1">
                    تغییر سطح دسترسی (تست)
                  </div>
                  <button
                    onClick={() => {
                      switchUserRole('admin');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      currentUser?.role === 'admin'
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>مدیر ارشد سیستم</span>
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole('sales');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      currentUser?.role === 'sales'
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>کارشناس فروش</span>
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole('support');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      currentUser?.role === 'support'
                        ? 'bg-amber-50 text-amber-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Headphones className="w-4 h-4 text-amber-600" />
                    <span>پشتیبانی مشتریان</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors"
            title="اعلان‌ها"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser?.department}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-right"
                >
                  <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                    <div className="text-xs font-bold text-slate-800">{currentUser?.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser?.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>تنظیمات حساب و شرکت</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>خروج از حساب کاربری</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
