import React from 'react';
import { AlertCircle, Home, LayoutDashboard } from 'lucide-react';

interface NotFoundViewProps {
  onNavigateHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigateHome }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-[#d0dbe5] p-8 text-center dir-rtl">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-200">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-extrabold text-slate-900 mb-2">صفحه یا منوی مورد نظر یافت نشد (404)</h2>
      <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6 font-medium">
        آدرس وارد شده یا بخش انتخاب شده در سیستم CRM شرکت واته وجود ندارد یا به آدرس دیگری منتقل شده است.
      </p>

      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 transition-all active:scale-95"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>بازگشت به داشبورد اصلی CRM</span>
      </button>
    </div>
  );
};
