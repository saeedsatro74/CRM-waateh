import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import {
  Settings,
  Building2,
  ShieldCheck,
  UserCheck,
  Headphones,
  Bell,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDataToDefault } = useCRMStore();

  const [activeTab, setActiveTab] = useState<'company' | 'roles' | 'notifications'>('company');

  // Company Form State
  const [companyName, setCompanyName] = useState(settings.companyName || 'شرکت تهویه واته');
  const [phone, setPhone] = useState(settings.phone || '۰۲۱-۸۸۸۸۰۰۰۰');
  const [address, setAddress] = useState(settings.address || 'تهران، خیابان ولیعصر، بالاتر از ظفر، مجتمع صنعتی واته');
  const [email, setEmail] = useState(settings.email || 'info@waateh.com');
  const [website, setWebsite] = useState(settings.website || 'https://waateh.com');
  const [tagline, setTagline] = useState(settings.tagline || 'تولیدکننده پیشرو تجهیزات سرمایشی و گرمایشی صنعتی');
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // Notification Preferences State
  const [notifyNewLead, setNotifyNewLead] = useState(true);
  const [notifyTaskOverdue, setNotifyTaskOverdue] = useState(true);
  const [notifyNewService, setNotifyNewService] = useState(true);
  const [notifyDealWon, setNotifyDealWon] = useState(true);

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      phone,
      address,
      email,
      website,
      tagline,
    });
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 2500);
  };

  return (
    <div className="space-y-6 dir-rtl animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">تنظیمات مدیریتی CRM WAATEH</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              مدیریت برندینگ شرکت تهویه واته، ساختار نقش‌ها و تنظیمات عمومی اعلان‌ها
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('آیا از بازنشانی داده‌های نمونه سیستم اطمینان دارید؟')) {
              resetDataToDefault();
            }
          }}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 border border-rose-200 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>بازنشانی داده‌های نمونه</span>
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 px-2 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('company')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'company'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>اطلاعات و برندینگ شرکت تهویه واته</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>راهنمای نقش‌ها و سطح دسترسی‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>تنظیمات اعلان‌های هوشمند</span>
        </button>
      </div>

      {/* Tab 1: Company Info */}
      {activeTab === 'company' && (
        <form
          onSubmit={handleSaveCompanySettings}
          className="bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs space-y-4 max-w-2xl"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <Building2 className="w-5 h-5 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">مشخصات سازمانی و ارتباطی شرکت تهویه واته</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نام رسمی مجموعه</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">شعار سازمانی / فعالیت</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">شماره تلفن مرکزی پشتیبانی</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">پست الکترونیکی رسمی</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-teal-600 focus:bg-white dir-ltr text-right"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">وب‌سایت رسمی شرکت</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-teal-600 focus:bg-white dir-ltr text-right"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نشانی دفتر مرکزی / کارخانه</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white font-bold rounded-2xl text-xs shadow-md shadow-teal-900/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات مشخصات شرکت</span>
            </button>

            {savedSettingsMsg && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>تنظیمات با موفقیت ثبت گردید.</span>
              </span>
            )}
          </div>
        </form>
      )}

      {/* Tab 2: Roles & Permissions Breakdown */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">ساختار سطوح دسترسی و مسئولیت‌ها در CRM WAATEH</h2>
            <p className="text-xs text-slate-500">
              این سیستم بر پایه ۴ سطح دسترسی سازمانی طراحی شده است تا کارمندان فقط به اطلاعات مرتبط با بخش خود دسترسی داشته باشند:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Role */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-600" />
                  <h3 className="text-xs font-bold text-rose-900">۱- مدیر ارشد سیستم (Admin)</h3>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>دسترسی کامل به تمامی بخش‌های سیستم</li>
                  <li>مدیریت و تعریف کاربران، تغییر نقش‌ها و فعال/غیرفعال‌سازی</li>
                  <li>مشاهده کلیه گزارش‌های تحلیل فروش و مالی</li>
                  <li>مدیریت تنظیمات عمومی شرکت</li>
                </ul>
              </div>

              {/* Sales Manager Role */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xs font-bold text-indigo-900">۲- مدیر فروش (Sales Manager)</h3>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>دسترسی به تمامی مشتریان، لیدها و معامله‌های سازمان</li>
                  <li>مدیریت وظایف تیم فروش و تخصیص لیدها</li>
                  <li>دسترسی به گزارش‌ها و آمار کل فروش</li>
                  <li>مدیریت لیست محصولات و تجهیزات صنعتی</li>
                </ul>
              </div>

              {/* Sales Representative Role */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xs font-bold text-emerald-900">۳- کارشناس فروش (Sales)</h3>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>دسترسی به مشتریان و لیدهای تخصیص‌یافته به خود</li>
                  <li>ثبت و پیگیری کانبان معامله‌ها و پیش‌فاکتورها</li>
                  <li>ثبت وظایف، تماس‌ها و پیگیری‌های روزانه</li>
                </ul>
              </div>

              {/* Service & Repair Role */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-teal-600" />
                  <h3 className="text-xs font-bold text-teal-900">۴- پشتیبانی و خدمات فنی (Service)</h3>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>دسترسی اختصاصی به ماژول خدمات، سرویس و تعمیرات تجهیزات</li>
                  <li>ثبت و پیگیری درخواست‌های نصب، گارانتی و عیب‌یابی</li>
                  <li>ارتباط با مشتریان دریافت‌کننده خدمات فنی</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs space-y-4 max-w-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <Bell className="w-5 h-5 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">تنظیمات دریافت اعلان‌های سیستم CRM</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-xs font-bold text-slate-800">اعلان ثبت لید یا فرصت جدید فروش</span>
              <input
                type="checkbox"
                checked={notifyNewLead}
                onChange={(e) => setNotifyNewLead(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded-md focus:ring-teal-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-xs font-bold text-slate-800">هشدار سررسید وظایف و پیگیری‌های عقب‌افتاده</span>
              <input
                type="checkbox"
                checked={notifyTaskOverdue}
                onChange={(e) => setNotifyTaskOverdue(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded-md focus:ring-teal-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-xs font-bold text-slate-800">اعلان ثبت درخواست جدید خدمات فنی یا تعمیرات</span>
              <input
                type="checkbox"
                checked={notifyNewService}
                onChange={(e) => setNotifyNewService(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded-md focus:ring-teal-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-xs font-bold text-slate-800">اعلان موفقیت‌آمیز بودن نهایی‌سازی معامله (Deal Won)</span>
              <input
                type="checkbox"
                checked={notifyDealWon}
                onChange={(e) => setNotifyDealWon(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded-md focus:ring-teal-600"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
