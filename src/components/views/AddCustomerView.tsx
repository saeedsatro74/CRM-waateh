import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { CustomerType, CustomerStatus } from '../../types';
import { UserPlus, Building2, Phone, Mail, MapPin, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AddCustomerViewProps {
  onNavigateCustomers: () => void;
}

export const AddCustomerView: React.FC<AddCustomerViewProps> = ({ onNavigateCustomers }) => {
  const { addCustomer, currentUser } = useCRMStore();

  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('company');
  const [status, setStatus] = useState<CustomerStatus>('lead');
  const [budget, setBudget] = useState('150000000');
  const [source, setSource] = useState('استعلام مستقیم واته');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('تجهیزات صنعتی، B2B');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !name.trim() || !phone.trim()) return;

    const tagsArray = tagsInput
      .split('،')
      .flatMap((t) => t.split(','))
      .map((t) => t.trim())
      .filter(Boolean);

    addCustomer({
      companyName,
      name,
      phone,
      secondaryPhone,
      email,
      address,
      customerType,
      status,
      tags: tagsArray.length ? tagsArray : ['مشتری جدید'],
      assignedToUserId: currentUser?.id || 'user-1',
      lastContactDate: new Date().toISOString().split('T')[0],
      notes,
      budget: parseInt(budget) || 0,
      source,
      awaitingResponse: false,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onNavigateCustomers();
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#d0dbe5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">افزودن مشتری جدید شرکت WAATEH</h2>
            <p className="text-xs text-slate-500 font-medium">
              ثبت اطلاعات شرکت، شخص رابط، شماره‌های تماس و آدرس کارخانه یا دفتر مرکزی
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateCustomers}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به لیست مشتریان</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-sm">اطلاعات مشتری با موفقیت ذخیره شد</div>
            <div className="text-xs text-emerald-600">در حال انتقال به صفحه مشتریان...</div>
          </div>
        </motion.div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#d0dbe5] shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>مشخصات اصلی مجموعه و شخص رابط</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              نام شرکت یا مجموعه صنعتی <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="مثلا: مجتمع صنایع فولاد کاوه"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              نام و نام‌خانوادگی شخص تماس / رابط <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلا: مهندس کامران امینی"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              شماره تلفن ثابت یا همراه اصلی <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="۰۲۱۶۶۵۵..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600 dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">شماره همراه ثانویه یا مستقیم</label>
            <input
              type="text"
              value={secondaryPhone}
              onChange={(e) => setSecondaryPhone(e.target.value)}
              placeholder="۰۹۱۲..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600 dir-ltr text-right"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">پست الکترونیکی (ایمیل)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@company.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600 dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">نوع حقوقی / حقیقی</label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600"
            >
              <option value="company">حقوقی (شرکت / سازمان / کارخانه)</option>
              <option value="person">حقیقی (شخص / کارگاه مستقل)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">آدرس کامل کارخانه، دفتر یا کارگاه</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="استان، شهر، شهرک صنعتی، خیابان..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">وضعیت اولیه مشتری</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600"
            >
              <option value="lead">سرنخ اولیه</option>
              <option value="potential">مشتری احتمالی</option>
              <option value="negotiating">در حال مذاکره پیش‌فاکتور</option>
              <option value="active">مشتری فعال واته</option>
              <option value="vip">مشتری VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">بودجه یا حجم خرید تخمینی (تومان)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">برچسب‌ها (با ویرگول یا کاما جدا کنید)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="فولاد، پتروشیمی، CNC، B2B..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">توضیحات و سوابق اولیه</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="نیازمندی‌ها، تجهیزات فعلی کارخانه، نحوه آشنایی و نکات مهم مذاکره..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onNavigateCustomers}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 transition-all active:scale-95"
          >
            ذخیره و ایجاد پرونده مشتری
          </button>
        </div>
      </form>
    </div>
  );
};
