import React, { useState } from 'react';
import { useCRMStore } from '../lib/store';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Headphones,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { state, setCurrentUser } = useCRMStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@company.ir');
  const [password, setPassword] = useState('123456');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const user = state.users.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = state.users.find((u) => u.email === email) || state.users[0];
    setCurrentUser(matchedUser);
    onLoginSuccess();
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const user = state.users.find((u) => u.role === role) || state.users[0];
    setCurrentUser(user);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden dir-rtl">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 relative z-10"
      >
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {state.settings.companyName}
          </h1>
          <p className="text-xs font-semibold text-indigo-600 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>سامانه CRM و مدیریت فروش شرکتی</span>
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-600 mb-2">
            تعیین نقش کاربر:
          </label>
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mb-0.5" />
              <span>مدیر</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('sales')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'sales'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 mb-0.5" />
              <span>فروش</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('support')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'support'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Headphones className="w-4 h-4 mb-0.5" />
              <span>پشتیبانی</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              پست الکترونیکی (ایمیل)
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition-all"
                placeholder="ایمیل شما..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رمز عبور
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <span>ورود به پنل مدیریت</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </form>

        {/* Quick Demo Shortcuts */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 text-center mb-3">
            ورود سریع بدون رمز برای تست:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold text-center transition-colors"
            >
              مدیر ارشد
            </button>
            <button
              onClick={() => handleQuickDemoLogin('sales')}
              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold text-center transition-colors"
            >
              کارشناس فروش
            </button>
            <button
              onClick={() => handleQuickDemoLogin('support')}
              className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold text-center transition-colors"
            >
              پشتیبانی
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
