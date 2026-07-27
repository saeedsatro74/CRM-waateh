import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { getAvatarSrc, handleImageError } from '../../lib/utils';
import { UserRole, User } from '../../types';
import {
  UserCog,
  Plus,
  ShieldCheck,
  UserCheck,
  Headphones,
  Mail,
  Phone,
  Trash2,
  X,
  Building2,
  CheckCircle2,
  XCircle,
  Filter,
  ShieldAlert,
  Search,
  Edit2,
  Lock,
  Camera,
  Briefcase,
  Check,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UsersView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    updateUserRole,
    toggleUserActiveStatus,
    deleteUser,
    currentUser,
    canSwitchToPanel,
    enterUserPanel,
  } = useCRMStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Add User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPosition, setAddPosition] = useState('کارشناس فروش سیستم‌های تهویه');
  const [addDepartment, setAddDepartment] = useState('واحد فروش و بازاریابی');
  const [addRole, setAddRole] = useState<UserRole>('sales');
  const [addAvatar, setAddAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250');
  const [addPassword, setAddPassword] = useState('123456');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('sales');
  const [editAvatar, setEditAvatar] = useState('');

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-rose-200 text-center space-y-4 max-w-xl mx-auto my-12 dir-rtl">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">عدم داشتن سطح دسترسی</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          صفحه مدیریت کاربران و تعیین نقش‌های دسترسی فقط برای مدیر ارشد سیستم (Admin) قابل مشاهده است.
        </p>
      </div>
    );
  }

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isEdit) {
            setEditAvatar(reader.result);
          } else {
            setAddAvatar(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) return;

    await addUser(
      {
        name: addName.trim(),
        email: addEmail.trim().toLowerCase(),
        phone: addPhone.trim() || '۰۹۱۲۰۰۰۰۰۰۰',
        department: addDepartment.trim() || 'واحد فروش و خدمات واته',
        position: addPosition.trim() || 'کارشناس تهویه صنعتی',
        role: addRole,
        avatar: addAvatar,
        isActive: true,
      },
      addPassword
    );

    // Reset Form
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddPosition('کارشناس فروش سیستم‌های تهویه');
    setAddDepartment('واحد فروش و بازاریابی');
    setAddRole('sales');
    setAddPassword('123456');
    setShowAddModal(false);
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditPosition(user.position || '');
    setEditDepartment(user.department || '');
    setEditRole(user.role);
    setEditAvatar(user.avatar || '');
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await updateUser(editingUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      position: editPosition,
      department: editDepartment,
      role: editRole,
      avatar: editAvatar,
    });

    setEditingUser(null);
  };

  const handleConfirmDeleteUser = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'مدیر ارشد سیستم', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldCheck };
      case 'sales_manager':
        return { label: 'مدیر فروش', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: UserCheck };
      case 'sales':
        return { label: 'کارشناس فروش', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserCheck };
      case 'service':
        return { label: 'پشتیبانی و خدمات', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: Headphones };
      default:
        return { label: 'کاربر سیستم', bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: UserCheck };
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 dir-rtl animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">سیستم مدیریت کاربران شرکت تهویه واته</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              مدیریت حساب‌ها، سطح دسترسی‌های ۴گانه و افزودن همکاران جدید
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-teal-900/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف کاربر جدید</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#d0dbe5] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام، ایمیل یا دپارتمان..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'admin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            مدیران ({users.filter((u) => u.role === 'admin').length})
          </button>
          <button
            onClick={() => setRoleFilter('sales_manager')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'sales_manager'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            مدیران فروش ({users.filter((u) => u.role === 'sales_manager').length})
          </button>
          <button
            onClick={() => setRoleFilter('sales')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'sales'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            فروش ({users.filter((u) => u.role === 'sales').length})
          </button>
          <button
            onClick={() => setRoleFilter('service')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'service'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            خدمات ({users.filter((u) => u.role === 'service').length})
          </button>
        </div>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const roleInfo = getRoleLabel(user.role);
          const RoleIcon = roleInfo.icon;
          const isCurrent = currentUser?.id === user.id;

          return (
            <motion.div
              key={user.id}
              whileHover={{ y: -2 }}
              className={`bg-white p-5 rounded-3xl border ${
                isCurrent ? 'border-teal-600 ring-2 ring-teal-500/10 shadow-md' : 'border-[#d0dbe5]'
              } shadow-xs flex flex-col justify-between gap-4 relative overflow-hidden`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarSrc(user.avatar)}
                      onError={handleImageError}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-2xs"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md">
                            شما
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-teal-700 font-semibold mt-0.5">{user.position || user.department}</p>
                    </div>
                  </div>

                  {/* Active / Inactive Status Badge */}
                  <button
                    onClick={() => toggleUserActiveStatus(user.id)}
                    title="تغییر وضعیت فعال / غیرفعال"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                      user.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {user.isActive !== false ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>فعال</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>غیرفعال</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800 truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800">{user.phone || '۰۹۱۲۰۰۰۰۰۰۰'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-800">{user.department}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-xl border ${roleInfo.bg}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span>{roleInfo.label}</span>
                    </span>

                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-800 outline-none focus:border-teal-600"
                    >
                      <option value="admin">مدیر ارشد (Admin)</option>
                      <option value="sales_manager">مدیر فروش (Sales Manager)</option>
                      <option value="sales">کارشناس فروش (Sales)</option>
                      <option value="service">پشتیبانی خدمات (Service)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
                {isCurrent ? (
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[11px] font-bold rounded-xl border border-teal-200">
                    پنل فعال شما
                  </span>
                ) : canSwitchToPanel(user) ? (
                  <button
                    onClick={() => enterUserPanel(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                    title="ورود و مشاهده پنل کاربری این کاربر"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>ورود به پنل کاربر</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(user)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 p-1.5 rounded-xl hover:bg-teal-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>ویرایش</span>
                  </button>

                  {!isCurrent && (
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 dir-rtl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-teal-700" />
                  <h2 className="text-sm font-bold text-slate-900">تعریف همکار جدید در CRM WAATEH</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نام و نام خانوادگی *</label>
                    <input
                      type="text"
                      required
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder="نام کامل همکار..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">پست الکترونیکی (ایمیل ورود) *</label>
                    <input
                      type="email"
                      required
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="user@waateh.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none font-mono focus:border-teal-600 dir-ltr text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره تلفن همراه</label>
                    <input
                      type="text"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="۰۹۱۲..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none font-mono focus:border-teal-600 dir-ltr text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">رمز عبور اولیه *</label>
                    <input
                      type="password"
                      required
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="حداقل ۶ کاراکتر..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">سمت سازمانی</label>
                    <input
                      type="text"
                      value={addPosition}
                      onChange={(e) => setAddPosition(e.target.value)}
                      placeholder="مثلا: کارشناس فروش سیستم‌های چیلر"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">دپارتمان</label>
                    <input
                      type="text"
                      value={addDepartment}
                      onChange={(e) => setAddDepartment(e.target.value)}
                      placeholder="مثلا: واحد فروش و بازاریابی"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">نقش و سطح دسترسی سیستم</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                  >
                    <option value="admin">1- مدیر ارشد سیستم (Admin)</option>
                    <option value="sales_manager">2- مدیر فروش (Sales Manager)</option>
                    <option value="sales">3- کارشناس فروش (Sales)</option>
                    <option value="service">4- پشتیبانی و خدمات فنی (Service)</option>
                  </select>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">تصویر پروفایل</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarSrc(addAvatar)}
                      onError={handleImageError}
                      alt="پیش‌نمایش"
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer transition-colors flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>انتخاب عکس از سیستم</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-900/20 transition-all active:scale-95"
                  >
                    تأیید و ایجاد کاربر
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 dir-rtl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-teal-700" />
                  <h2 className="text-sm font-bold text-slate-900">ویرایش اطلاعات کاربر ({editingUser.name})</h2>
                </div>
                <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">پست الکترونیکی (ایمیل)</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none font-mono focus:border-teal-600 dir-ltr text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره تماس</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none font-mono focus:border-teal-600 dir-ltr text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">سمت شغلی</label>
                    <input
                      type="text"
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">دپارتمان</label>
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نقش کاربر</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                    >
                      <option value="admin">1- مدیر ارشد سیستم (Admin)</option>
                      <option value="sales_manager">2- مدیر فروش (Sales Manager)</option>
                      <option value="sales">3- کارشناس فروش (Sales)</option>
                      <option value="service">4- پشتیبانی خدمات (Service)</option>
                    </select>
                  </div>
                </div>

                {/* Avatar upload */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">تصویر پروفایل</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarSrc(editAvatar)}
                      onError={handleImageError}
                      alt="پیش‌نمایش"
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer transition-colors flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>تغییر عکس</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-900/20 transition-all active:scale-95"
                  >
                    ذخیره تغییرات
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 dir-rtl space-y-4"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-900">حذف کاربر از سیستم</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  آیا از حذف کاربر <span className="font-bold text-slate-800">{userToDelete.name}</span> اطمینان دارید؟ این عمل غیرقابل بازگشت خواهد بود.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={handleConfirmDeleteUser}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-95"
                >
                  حذف قطعی کاربر
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
