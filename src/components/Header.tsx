import React, { useState } from 'react';
import { useCRMStore } from '../lib/store';
import { getAvatarSrc, handleImageError } from '../lib/utils';
import { User } from '../types';
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
  User as UserIcon,
  Settings,
  Users,
  LogIn,
  X,
  UserCog,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickSearch: () => void;
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenUserGuide: () => void;
  onOpenWordProposalModal?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSearch,
  onToggleMobileSidebar,
  onOpenNotifications,
  onOpenUserGuide,
  onOpenWordProposalModal,
  onLogout,
}) => {
  const {
    currentUser,
    primaryUser,
    actualUser,
    actualIsAdmin,
    actualIsSalesManager,
    canSwitchToPanel,
    enterUserPanel,
    exitUserPanel,
    users,
    unreadNotificationCount,
    settings,
  } = useCRMStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserSwitchModal, setShowUserSwitchModal] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'مدیر ارشد سیستم',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldCheck,
        };
      case 'sales_manager':
        return {
          label: 'مدیر فروش',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: UserCheck,
        };
      case 'sales':
        return {
          label: 'کارشناس فروش',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: UserCheck,
        };
      case 'service':
        return {
          label: 'پشتیبانی و خدمات',
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
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

  const handleSwitchToUser = (user: User) => {
    enterUserPanel(user);
    setShowUserSwitchModal(false);
    setShowUserMenu(false);
  };

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-800 via-teal-700 to-slate-900 text-white flex items-center justify-center font-bold shadow-md shadow-teal-900/20 border border-teal-500/20">
              <Building2 className="w-5 h-5 text-teal-200" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                {settings.companyName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">سامانه مدیریت ارتباط با مشتریان WAATEH</p>
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
              <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors" />
              <span>جستجوی مشتریان، فرصت‌ها، پیگیری‌ها...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-sans shadow-2xs">
              <span>Ctrl</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Left side: Role Badge, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Role Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold border-slate-200 bg-slate-50 text-slate-800">
            <RoleIcon className="w-3.5 h-3.5 text-teal-700" />
            <span>{currentRoleInfo.label}</span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors"
            title="اعلان‌های سیستم"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Guide Button */}
          <button
            onClick={onOpenUserGuide}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-50 to-teal-100/80 hover:from-teal-100 hover:to-teal-200/80 text-teal-900 rounded-2xl border border-teal-200 transition-all text-xs font-bold shadow-2xs group active:scale-95"
            title="راهنمای جامع کاربری"
          >
            <HelpCircle className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">راهنما</span>
          </button>

          {/* Quick Word Proposal Generator Button */}
          {onOpenWordProposalModal && (
            <button
              onClick={onOpenWordProposalModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl transition-all text-xs font-black shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
              title="ساخت خودکار فایل Word پیشنهاد مالی و فنی"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>ساخت پیشنهاد Word</span>
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={getAvatarSrc(currentUser?.avatar)}
                onError={handleImageError}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-teal-500/20"
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
                  className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-right dir-rtl"
                >
                  <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                    <div className="text-xs font-bold text-slate-800">{currentUser?.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 dir-ltr text-right">{currentUser?.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors font-semibold"
                  >
                    <UserIcon className="w-4 h-4 text-teal-700" />
                    <span>پروفایل کاربری من</span>
                  </button>

                  {(actualIsAdmin || actualIsSalesManager) && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowUserSwitchModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-indigo-700 hover:bg-indigo-50 transition-colors font-bold"
                    >
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>ورود و نظارت بر پنل پرسنل</span>
                    </button>
                  )}

                  {primaryUser && (
                    <button
                      onClick={() => {
                        exitUserPanel();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors font-bold my-1 border border-indigo-200"
                    >
                      <LogOut className="w-4 h-4 text-indigo-600" />
                      <span>خروج و بازگشت به ({primaryUser.name})</span>
                    </button>
                  )}

                  {actualIsAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4 text-slate-600" />
                      <span>تنظیمات سیستم و شرکت</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>خروج از سیستم</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Switch User Modal */}
      <AnimatePresence>
        {showUserSwitchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 dir-rtl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">تغییر کاربر و ورود به پنل پرسنل</h3>
                    <p className="text-[11px] text-slate-500">انتخاب حساب کاربری جهت نظارت بر فعالیت‌ها و کارها</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserSwitchModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {users
                  .filter((u) => canSwitchToPanel(u) || currentUser?.id === u.id)
                  .map((u) => {
                    const roleBadge = getRoleBadge(u.role);
                    const isCurrent = currentUser?.id === u.id;

                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-500/20'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80'
                        }`}
                      >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getAvatarSrc(u.avatar)}
                          onError={handleImageError}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${roleBadge.bg}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{u.department}</div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl shrink-0">
                          پنل فعلی
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSwitchToUser(u)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1 shrink-0"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>ورود</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
