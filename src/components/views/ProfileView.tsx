import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { getAvatarSrc, handleImageError } from '../../lib/utils';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  UserCheck,
  Headphones,
  KeyRound,
  Check,
  Save,
  Briefcase,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../../types';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUser } = useCRMStore();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [position, setPosition] = useState(currentUser?.position || 'کارشناس تهویه صنعتی');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications state
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!currentUser) return null;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'مدیر ارشد سیستم (Admin)', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldCheck };
      case 'sales_manager':
        return { label: 'مدیر فروش (Sales Manager)', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: UserCheck };
      case 'sales':
        return { label: 'کارشناس فروش (Sales)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserCheck };
      case 'service':
        return { label: 'پشتیبانی و خدمات (Service)', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: Headphones };
      default:
        return { label: 'کاربر سیستم', bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: UserCheck };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);
  const RoleIcon = roleInfo.icon;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);

    await updateUser(currentUser.id, {
      name,
      phone,
      department,
      position,
      avatar,
    });

    setProfileSuccessMsg('اطلاعات پروفایل کاربری با موفقیت به‌روزرسانی شد.');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (newPassword.length < 6) {
      setPasswordErrorMsg('رمز عبور جدید باید حداقل ۶ کاراکتر داشته باشد.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('تکرار رمز عبور جدید با رمز واردشده مطابقت ندارد.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const client = getSupabaseClient();
      if (client && isSupabaseConfigured) {
        const { error } = await client.auth.updateUser({ password: newPassword });
        if (error) {
          setPasswordErrorMsg(`خطا در تغییر رمز عبور: ${error.message}`);
          setIsUpdatingPassword(false);
          return;
        }
      }

      setPasswordSuccessMsg('رمز عبور شما با موفقیت تغییر یافت.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordErrorMsg('خطایی در تغییر رمز عبور رخ داد.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl animate-fadeIn pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">پروفایل کاربری شرکت تهویه واته</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              مدیریت و ویرایش مشخصات فردی، عکس پروفایل و رمز عبور حساب کاربری
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border ${roleInfo.bg}`}>
            <RoleIcon className="w-4 h-4" />
            <span>{roleInfo.label}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card Overview & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs text-center space-y-4 relative overflow-hidden">
            <div className="relative inline-block mx-auto">
              <img
                src={getAvatarSrc(avatar || currentUser.avatar)}
                onError={handleImageError}
                alt={currentUser.name}
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-slate-100 shadow-md mx-auto"
              />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-900">{currentUser.name}</h2>
              <p className="text-xs text-teal-700 font-semibold mt-0.5 flex items-center justify-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{position || 'سمت سازمانی'}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-right">
              <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-500">پست الکترونیکی:</span>
                <span className="font-mono font-medium text-slate-800 dir-ltr">{currentUser.email}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-500">شماره همراه:</span>
                <span className="font-mono font-medium text-slate-800 dir-ltr">{currentUser.phone || 'ثبت نشده'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-500">دپارتمان:</span>
                <span className="font-medium text-slate-800">{currentUser.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Change Password Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Info Form */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <UserIcon className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">ویرایش اطلاعات شخصی و شغلی</h3>
            </div>

            <AnimatePresence>
              {profileSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نام و نام خانوادگی</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">پست الکترونیکی (ایمیل)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl pr-9 pl-3 py-2.5 text-xs font-mono dir-ltr text-right cursor-not-allowed"
                    title="تغییر ایمیل توسط مدیر امکان‌پذیر است"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شماره تماس مستقیم</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان سمت شغلی</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="مثلا: کارشناس فروش سیستم‌های چیلر"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">دپارتمان سازمانی</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
              </div>


            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white font-bold rounded-2xl text-xs shadow-md shadow-teal-900/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات پروفایل</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <KeyRound className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">تغییر رمز عبور حساب کاربری</h3>
            </div>

            <AnimatePresence>
              {passwordErrorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{passwordErrorMsg}</span>
                </motion.div>
              )}

              {passwordSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{passwordSuccessMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رمز عبور جدید</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تکرار رمز عبور جدید</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز عبور..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl text-xs transition-all shadow-xs flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isUpdatingPassword ? 'در حال به روز رسانی...' : 'تغییر رمز عبور'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
