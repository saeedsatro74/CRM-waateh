import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { UserRole } from '../../types';
import {
  Settings,
  User,
  Shield,
  Building2,
  Database,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Mail,
  Phone,
  Code,
  Sparkles,
  Server,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../../lib/supabase';
import { motion } from 'motion/react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    state,
    addUser,
    updateUserRole,
    resetDataToDefault,
    currentUser,
    isManager,
  } = useCRMStore();

  const [activeTab, setActiveTab] = useState<'users' | 'company' | 'database'>('users');

  // Copy SQL State
  const [copiedSql, setCopiedSql] = useState(false);

  // New User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('sales');
  const [newUserDept, setNewUserDept] = useState('دپارتمان فروش');

  // Company Form State
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [email, setEmail] = useState(settings.email);
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      phone: newUserPhone || '۰۹۱۲۰۰۰۰۰۰۰',
      department: newUserDept,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      isActive: true,
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUser(false);
  };

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      phone,
      address,
      email,
    });
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
              تنظیمات سیستم، کاربران و اتصالات
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              مدیریت سطح دسترسی، مشخصات شرکت و اسکریپت دیتابیس Supabase
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('آیا از بازنشانی کلیه داده‌ها به حالت اولیه پیش‌فرض اطمینان دارید؟')) {
              resetDataToDefault();
            }
          }}
          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5 border border-rose-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>بازنشانی داده‌های نمونه</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>مدیریت کاربران و نقش‌ها ({state.users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'company'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>تنظیمات عمومی شرکت</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'database'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>اتصال دیتابیس Supabase</span>
        </button>
      </div>

      {/* Users & RBAC Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">لیست کارمندان و سطح دسترسی (RBAC)</h2>
            {isManager && (
              <button
                onClick={() => setShowAddUser(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن کاربر جدید</span>
              </button>
            )}
          </div>

          {/* Add User Modal */}
          {showAddUser && (
            <form
              onSubmit={handleAddUserSubmit}
              className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-200 space-y-3"
            >
              <h3 className="text-xs font-bold text-indigo-900 mb-2">ثبت مشخصات کاربر جدید</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="نام و نام خانوادگی..."
                  className="bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                />
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ایمیل کاربر..."
                  className="bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                >
                  <option value="sales">کارشناس فروش</option>
                  <option value="support">پشتیبانی مشتریان</option>
                  <option value="admin">مدیر ارشد سیستم</option>
                </select>

                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  placeholder="دپارتمان..."
                  className="bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  ذخیره کاربر
                </button>
              </div>
            </form>
          )}

          {/* User Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="p-4">تصویر و نام کاربر</th>
                    <th className="p-4">پست الکترونیکی</th>
                    <th className="p-4">دپارتمان</th>
                    <th className="p-4">نقش و سطح دسترسی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {state.users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <span className="font-bold text-slate-800">{u.name}</span>
                      </td>
                      <td className="p-4 font-mono dir-ltr text-right">{u.email}</td>
                      <td className="p-4">{u.department}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          disabled={!isManager}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                          className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
                        >
                          <option value="admin">مدیر (دسترسی کامل)</option>
                          <option value="sales">فروش (مشتریان مرتبط)</option>
                          <option value="support">پشتیبانی</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <form
          onSubmit={handleSaveCompanySettings}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 max-w-xl"
        >
          <h2 className="text-sm font-bold text-slate-800">برندینگ و اطلاعات شرکت</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نام رسمی شرکت</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">شماره تلفن پشتیبانی</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نشانی دفتر مرکزی</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-indigo-200"
            >
              ذخیره تغییرات
            </button>
            {savedSettingsMsg && (
              <span className="text-xs font-bold text-emerald-600">تغییرات با موفقیت ذخیره شد!</span>
            )}
          </div>
        </form>
      )}

      {/* Database Supabase Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div className={`p-5 rounded-3xl border ${isSupabaseConfigured ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <Server className={`w-6 h-6 shrink-0 mt-0.5 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800">
                    {isSupabaseConfigured ? 'کلیدهای Supabase شناسایی شدند' : 'کلیدهای اتصال Supabase ست نشده‌اند'}
                  </h2>
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${isSupabaseConfigured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'}`}>
                    {isSupabaseConfigured ? 'اتصال برقرار است' : 'حالت آفلاین (ذخیره در مرورگر)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isSupabaseConfigured
                    ? 'سامانه به URL و ANON_KEY دیتابیس Supabase متصل است. در صورت عدم ثبت داده‌ها، باید حتماً کد SQL زیر را در بخش SQL Editor در داشبورد Supabase اجرا کنید.'
                    : 'در حال حاضر کلیدهای VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY مقداردهی نشده‌اند. برای اتصال به دیتابیس آنلاین واقعی، باید این دو کلید را در فایل .env یا تنظیمات برنامه وارد نمایید.'}
                </p>

                {state.supabaseError && (
                  <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-rose-800 text-xs font-medium dir-rtl">
                    <strong>پیام خطای دیتابیس:</strong> {state.supabaseError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step by Step Setup Guide */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>مراحل راه اندازی و اتصال دیتابیس آنلاین (۳ گام ساده)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">۱</div>
                <h4 className="font-bold text-slate-800">ثبت کلیدهای پروژه</h4>
                <p className="text-slate-500 leading-relaxed">
                  وارد پروژه خود در <code className="bg-slate-200 px-1 py-0.5 rounded dir-ltr inline-block">supabase.com</code> شوید و از بخش <strong>Project Settings &gt; API</strong> مقادیر <code className="bg-slate-200 px-1 rounded dir-ltr inline-block">URL</code> و <code className="bg-slate-200 px-1 rounded dir-ltr inline-block">anon key</code> را در <code className="bg-slate-200 px-1 rounded dir-ltr inline-block">.env</code> ست کنید.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">۲</div>
                <h4 className="font-bold text-slate-800">کپی کد SQL</h4>
                <p className="text-slate-500 leading-relaxed">
                  روی دکمه سبز رنگ <strong>«کپی اسکریپت SQL دیتابیس»</strong> در پایین کلیک کنید تا دستورات ساخت جداول مشتریان، خدمات و فروش کپی شوند.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">۳</div>
                <h4 className="font-bold text-slate-800">اجرا در SQL Editor</h4>
                <p className="text-slate-500 leading-relaxed">
                  در داشبورد Supabase به منوی <strong>SQL Editor</strong> بروید، یک <strong>New Query</strong> ایجاد کنید، کد کپی شده را پِست (Paste) کرده و <strong>Run</strong> کنید.
                </p>
              </div>
            </div>
          </div>

          {/* SQL Code Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">کد آماده SQL برای ساخت جداول دیتابیس</h3>
                <p className="text-xs text-slate-500">کد زیر ساختار جداول customers, services, deals, leads, products, users را ایجاد می‌کند.</p>
              </div>

              <button
                onClick={handleCopySQL}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'کد کپی شد!' : 'کپی اسکریپت SQL دیتابیس'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] dir-ltr overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
