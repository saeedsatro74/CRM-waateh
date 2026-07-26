import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { UserRole } from '../../types';
import { UserCog, Plus, ShieldCheck, UserCheck, Headphones, Mail, Phone, Trash2, X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUserRole, deleteUser, currentUser } = useCRMStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('دپارتمان خدمات فنی واته');
  const [role, setRole] = useState<UserRole>('sales');

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name,
      email,
      phone: phone || '۰۹۱۲۰۰۰۰۰۰۰',
      department,
      role,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
      isActive: true,
    });

    setName('');
    setEmail('');
    setPhone('');
    setShowAddModal(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'مدیر ارشد سیستم', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldCheck };
      case 'sales':
        return { label: 'کارشناس فروش', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserCheck };
      case 'support':
        return { label: 'تکنسین / پشتیبانی فنی', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Headphones };
    }
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#d0dbe5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">مدیریت کاربران و تکنسین‌های شرکت WAATEH</h2>
            <p className="text-xs text-slate-500 font-medium">
              تعیین نقش‌های کاربری، سطح دسترسی مدیران، کارشناسان فروش و تکنسین‌های خدمات فنی
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-teal-900/10 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن کاربر جدید</span>
        </button>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const roleInfo = getRoleLabel(user.role);
          const RoleIcon = roleInfo.icon;
          const isCurrent = currentUser?.id === user.id;

          return (
            <motion.div
              key={user.id}
              whileHover={{ y: -2 }}
              className={`bg-white p-5 rounded-2xl border ${
                isCurrent ? 'border-teal-600 ring-2 ring-teal-500/10' : 'border-[#d0dbe5]'
              } shadow-xs flex flex-col justify-between gap-4`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100"
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
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{user.department}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-800">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-800">{user.phone}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-xl border ${roleInfo.bg}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span>{roleInfo.label}</span>
                    </span>

                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
                    >
                      <option value="admin">مدیر ارشد</option>
                      <option value="sales">کارشناس فروش</option>
                      <option value="support">تکنسین / پشتیبانی</option>
                    </select>
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <div className="border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف کاربر</span>
                  </button>
                </div>
              )}
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
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 dir-rtl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-teal-700" />
                  <h2 className="text-sm font-bold text-slate-900">افزودن کاربر جدید به پرسنل واته</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام کامل..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">پست الکترونیکی (ایمیل)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@waateh.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره تلفن همراه</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">دپارتمان سازمانی</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="مثلا: واحد خدمات فنی و تعمیرات"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">نقش و سطح دسترسی</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  >
                    <option value="admin">مدیر ارشد سیستم</option>
                    <option value="sales">کارشناس فروش</option>
                    <option value="support">تکنسین / پشتیبانی فنی</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10"
                  >
                    ایجاد کاربر
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
