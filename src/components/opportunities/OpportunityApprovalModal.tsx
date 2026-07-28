import React, { useState } from 'react';
import { Opportunity, OpportunityApprovalData, User } from '../../types';
import { ShieldCheck, Percent, Clock, Calendar, Truck, Award, Check, X, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toPersianDigits } from '../../lib/utils';

interface OpportunityApprovalModalProps {
  opportunity: Opportunity;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveApproval: (approvalData: OpportunityApprovalData) => void;
  onApproveAndAdvance?: () => void;
}

export const OpportunityApprovalModal: React.FC<OpportunityApprovalModalProps> = ({
  opportunity,
  currentUser,
  isOpen,
  onClose,
  onSaveApproval,
  onApproveAndAdvance,
}) => {
  const existing = opportunity.approvalData || {};

  const [discountPercent, setDiscountPercent] = useState<number>(existing.discountPercent ?? 5);
  const [executionTimeDays, setExecutionTimeDays] = useState<number>(existing.executionTimeDays ?? 30);
  const [priceValidityDays, setPriceValidityDays] = useState<number>(existing.priceValidityDays ?? 7);
  const [warrantyTerms, setWarrantyTerms] = useState<string>(
    existing.warrantyTerms || '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب (هرکدام زودتر فرا برسد)'
  );
  const [deliveryLocationType, setDeliveryLocationType] = useState<'factory' | 'custom'>(
    existing.deliveryLocationType || 'factory'
  );
  const [deliveryLocationCustom, setDeliveryLocationCustom] = useState<string>(
    existing.deliveryLocationCustom || ''
  );
  const [adminNotes, setAdminNotes] = useState<string>(existing.adminNotes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: OpportunityApprovalData = {
      discountPercent: Number(discountPercent) || 0,
      executionTimeDays: Number(executionTimeDays) || 30,
      priceValidityDays: Number(priceValidityDays) || 7,
      warrantyTerms,
      deliveryLocationType,
      deliveryLocationCustom: deliveryLocationType === 'custom' ? deliveryLocationCustom : 'تحویل درب کارخانه',
      adminNotes,
      approvedByAdminUserId: currentUser?.id,
      approvedByAdminName: currentUser?.name || 'مدیرعامل (مهندس فتح‌پور)',
      approvedAt: new Date().toLocaleDateString('fa-IR'),
      isStamped: existing.isStamped || false,
    };

    onSaveApproval(updatedData);
    if (onApproveAndAdvance) {
      onApproveAndAdvance();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 dir-rtl text-white">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/50 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">
                پنل بررسی و صدور مجوز مدیرعامل (مهندس فتح‌پور)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تعیین درصد تخفیف، زمان اجرا، اعتبار قیمت و شرایط گارانتی برای «{opportunity.title}»
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto py-4 pr-1 pl-2 flex-1">
          {/* Discount Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>درصد تخفیف مصوب:</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-bold"
                  required
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            {/* Execution Time */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>زمان اجرا (روز کاری):</span>
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={executionTimeDays}
                onChange={(e) => setExecutionTimeDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-bold"
                required
              />
            </div>

            {/* Price Validity */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>اعتبار قیمت (روز):</span>
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={priceValidityDays}
                onChange={(e) => setPriceValidityDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-bold"
                required
              />
            </div>
          </div>

          {/* Warranty Terms */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>شرایط گارانتی و ضمانت‌نامه:</span>
            </label>
            <div className="space-y-2">
              {[
                '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب (هرکدام زودتر فرا برسد)',
                '۲۴ ماه پس از تحویل / ۱۸ ماه پس از نصب',
                '۱۲ ماه گارانتی طلایی تعویض قطعات اصلی',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWarrantyTerms(preset)}
                  className={`w-full text-right text-xs p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    warrantyTerms === preset
                      ? 'bg-amber-950/40 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{preset}</span>
                  {warrantyTerms === preset && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              ))}

              <textarea
                value={warrantyTerms}
                onChange={(e) => setWarrantyTerms(e.target.value)}
                rows={2}
                placeholder="متن دلخواه شرایط گارانتی..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 mt-2"
              />
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>محل تحویل تجهیزات:</span>
            </label>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setDeliveryLocationType('factory')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  deliveryLocationType === 'factory'
                    ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                تحویل درب کارخانه
              </button>

              <button
                type="button"
                onClick={() => setDeliveryLocationType('custom')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  deliveryLocationType === 'custom'
                    ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                محل کارفرما / آدرس سفارشی
              </button>
            </div>

            {deliveryLocationType === 'custom' && (
              <input
                type="text"
                placeholder="آدرس دقیق محل تحویل را وارد کنید..."
                value={deliveryLocationCustom}
                onChange={(e) => setDeliveryLocationCustom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            )}
          </div>

          {/* Admin Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>توضیحات و دستورات مدیریت:</span>
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="دستورات یا نکات خاص مالی و اجرایی برای واحد فروش..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-indigo-900/50 flex items-center gap-2 text-xs text-indigo-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>
              با ثبت این فرم، مجوزهای قیمت‌گذاری و شرایط گارانتی برای این فرصت صادر گردیده و قابل اعمال در پیش‌فاکتور خواهد بود.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ثبت مجوز و تایید مدیرعامل</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
