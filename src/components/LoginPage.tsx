import React, { useState } from 'react';
import { useCRMStore } from '../lib/store';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Headphones,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, User } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { state, setCurrentUser } = useCRMStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          title: 'مدیر ارشد سیستم (Admin)',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldCheck,
        };
      case 'sales_manager':
        return {
          title: 'مدیر فروش (Sales Manager)',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: UserCheck,
        };
      case 'sales':
        return {
          title: 'کارشناس فروش (Sales)',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: UserCheck,
        };
      case 'service':
        return {
          title: 'پشتیبانی و خدمات (Service)',
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: Headphones,
        };
      default:
        return {
          title: 'کاربر سیستم',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: UserCheck,
        };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('لطفاً پست الکترونیکی و رمز عبور را به طور کامل وارد نمایید.');
      return;
    }

    setIsLoading(true);
    const client = getSupabaseClient();

    try {
      let isAuthSuccess = false;

      // 1. If Supabase client is configured, attempt actual Auth login
      if (client && isSupabaseConfigured) {
        try {
          const { data, error: authErr } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });
          if (!authErr && data?.user) {
            isAuthSuccess = true;
          }
        } catch (authException) {
          console.warn('Auth signIn error:', authException);
        }
      }

      // 2. Fetch or lookup user record
      let dbUserData: any = null;
      if (client && isSupabaseConfigured) {
        try {
          const { data } = await client
            .from('users')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();

          if (data) {
            dbUserData = data;
          }
        } catch (dbException) {
          console.warn('DB user fetch error:', dbException);
        }
      }

      // Local state lookup
      const localMatchedUser = state.users.find(
        (u) => u.email.trim().toLowerCase() === cleanEmail
      );

      const resolvedUser: User | null = dbUserData
        ? {
            id: dbUserData.id,
            name: dbUserData.name || 'کاربر سیستم',
            email: dbUserData.email || cleanEmail,
            role: (dbUserData.role as UserRole) || 'sales',
            department: dbUserData.department || 'واحد مربوطه',
            phone: dbUserData.phone || '',
            avatar:
              dbUserData.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
            isActive: dbUserData.is_active ?? dbUserData.isActive ?? true,
          }
        : localMatchedUser || null;

      // 3. User Existence Check
      if (!resolvedUser) {
        if (client && isSupabaseConfigured) {
          await client.auth.signOut();
        }
        setErrorMessage('پست الکترونیکی یا رمز عبور وارد شده اشتباه است.');
        setIsLoading(false);
        return;
      }

      // 4. Password Check (if not authenticated via Supabase auth, require standard system password '123456')
      if (!isAuthSuccess) {
        if (cleanPassword !== '123456') {
          setErrorMessage('پست الکترونیکی یا رمز عبور وارد شده اشتباه است.');
          setIsLoading(false);
          return;
        }
      }

      // 5. Check Active Status
      if (resolvedUser.isActive === false) {
        if (client && isSupabaseConfigured) {
          await client.auth.signOut();
        }
        setErrorMessage(
          'حساب کاربری شما در سیستم غیرفعال شده است. جهت فعال‌سازی مجدد با مدیر ارشد تماس بگیرید.'
        );
        setIsLoading(false);
        return;
      }

      // 6. Access Granted
      setCurrentUser(resolvedUser);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage('خطایی در فرایند ورود رخ داد. لطفاً اطلاعات ورود را مجدداً بررسی کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden dir-rtl">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 relative z-10"
      >
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-800 to-slate-900 text-white shadow-lg shadow-teal-900/30 mb-3">
            <Building2 className="w-8 h-8 text-teal-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {state.settings.companyName || 'شرکت تهویه واته'}
          </h1>
          <p className="text-xs font-bold text-teal-700 mt-1">
            ورود به سامانه یکپارچه مدیریت ارتباط با مشتریان
          </p>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-3 shadow-xs"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-rose-900 text-xs mb-0.5">خطا در ورود به سیستم</h4>
                <p className="leading-relaxed font-semibold text-rose-800">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              پست الکترونیکی (ایمیل سازمانی)
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition-all dir-ltr text-right"
                placeholder="user@waateh.com"
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>در حال بررسی مشخصات...</span>
              </>
            ) : (
              <>
                <span>ورود به پنل اتوماسیون WAATEH</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            پشتیبانی فنی شرکت تهویه واته • کلیه حقوق محفوظ است
          </p>
        </div>
      </motion.div>
    </div>
  );
};
