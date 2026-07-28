import React from 'react';
import { useCRMStore } from '../lib/store';
import { Bell, CheckCheck, Trash2, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectOpportunity?: (oppId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectOpportunity,
}) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useCRMStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 dir-rtl">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl border-r border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">اعلان‌ها و پیام‌ها</h2>
                  <p className="text-[11px] text-slate-500 font-medium">اطلاعیه‌ها و یادآوری‌های سیستم CRM</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="پاک‌سازی همه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="text-xs font-semibold">هیچ اعلانی یافت نشد.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      if (notif.opportunityId && onSelectOpportunity) {
                        onNavigateTab('deals');
                        onSelectOpportunity(notif.opportunityId);
                        onClose();
                      } else if (notif.linkTab) {
                        onNavigateTab(notif.linkTab);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      notif.isRead
                        ? 'bg-slate-50/80 border-slate-100 text-slate-600'
                        : 'bg-indigo-50/50 border-indigo-100 text-slate-800 font-medium shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        )}
                        <h4 className="text-xs font-bold">{notif.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{notif.message}</p>

                    {notif.linkTab && (
                      <div className="mt-2.5 flex items-center gap-1 text-[11px] text-indigo-600 font-bold hover:underline">
                        <span>مشاهده بخش مربوطه</span>
                        <ArrowLeft className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
