import React, { useState } from 'react';
import { Opportunity, OpportunityItem } from '../../types';
import {
  X,
  Plus,
  DollarSign,
  Trash2,
  CheckCircle2,
  Package,
  Calculator,
  Percent,
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatTomans, toPersianDigits } from '../../lib/utils';

interface OpportunityPricingModalProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  onSavePricing: (data: {
    totalValue: number;
    items: OpportunityItem[];
    discountPercent: number;
  }) => void;
}

export const OpportunityPricingModal: React.FC<OpportunityPricingModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onSavePricing,
}) => {
  const [items, setItems] = useState<OpportunityItem[]>(opportunity.items || []);
  const [discountPercent, setDiscountPercent] = useState<number>(
    opportunity.approvalData?.discountPercent ?? 5
  );
  const [manualValue, setManualValue] = useState<string>(
    opportunity.value ? opportunity.value.toString() : '0'
  );

  // New Item State inside Pricing Modal
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('دستگاه');
  const [unitPrice, setUnitPrice] = useState('100000000');
  const [specs, setSpecs] = useState('');

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;

    const priceNum = Number(unitPrice) || 0;
    const qtyNum = Number(quantity) || 1;

    const newItem: OpportunityItem = {
      id: `item-${Date.now()}`,
      name: itemName,
      quantity: qtyNum,
      unit,
      unitPrice: priceNum,
      totalPrice: priceNum * qtyNum,
      specs,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    // Recalculate manualValue as sum of all items if items exist
    const sumTotal = updatedItems.reduce((acc, i) => acc + i.totalPrice, 0);
    setManualValue(sumTotal.toString());

    setItemName('');
    setQuantity(1);
    setUnitPrice('100000000');
    setSpecs('');
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.filter((i) => i.id !== itemId);
    setItems(updatedItems);
    const sumTotal = updatedItems.reduce((acc, i) => acc + i.totalPrice, 0);
    setManualValue(sumTotal.toString());
  };

  const calculatedItemsTotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
  const finalBaseValue = items.length > 0 ? calculatedItemsTotal : Number(manualValue) || 0;

  const discountAmount = Math.round((finalBaseValue * discountPercent) / 100);
  const valueAfterDiscount = finalBaseValue - discountAmount;
  const vatAmount = Math.round(valueAfterDiscount * 0.10); // 10% VAT
  const grandTotal = valueAfterDiscount + vatAmount;

  const handleSave = () => {
    onSavePricing({
      totalValue: finalBaseValue,
      items,
      discountPercent,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 dir-rtl text-slate-100 selection:bg-teal-500 selection:text-white">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-950 to-slate-900 p-5 border-b border-blue-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-900/80 border border-blue-500/50 rounded-2xl text-blue-300">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-white">
                پنل قیمت‌گذاری و محاسبه فاکتور تجهیزات
              </h2>
              <p className="text-xs text-blue-200/80 mt-0.5">
                تعیین قیمت اقلام، تخفیف مصوب و محاسبه مالیات ارزش افزوده برای {opportunity.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Discount and Base Price Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                مبلغ پایه برآوردی (تومان):
              </label>
              <input
                type="number"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                disabled={items.length > 0}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-extrabold focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
              {items.length > 0 && (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  مبلغ به صورت خودکار از مجموع اقلام زیر محاسبه شد.
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                درصد تخفیف مصوب مدیریت (٪):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs font-bold text-slate-400">درصد</span>
              </div>
            </div>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-blue-300 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>افزودن دستگاه / قلم جدید به ساختار قیمت‌گذاری:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="نام دستگاه / تجهیز (مثلاً چیلر اسکرال)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  type="number"
                  min="1"
                  placeholder="تعداد"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="قیمت واحد (تومان)"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="مشخصات فنی و استانداردهای قطعات"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all shadow-md"
              >
                افزودن به جدول قیمت
              </button>
            </div>
          </form>

          {/* Items Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300">جدول اقلام و هزینه‌ها:</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                    <th className="p-3">شرح تجهیزات</th>
                    <th className="p-3 text-center">تعداد</th>
                    <th className="p-3 text-center">قیمت واحد (تومان)</th>
                    <th className="p-3 text-center">قیمت کل (تومان)</th>
                    <th className="p-3 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-100">{item.name}</div>
                          {item.specs && <div className="text-[10px] text-slate-400 mt-0.5">{item.specs}</div>}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-200">
                          {toPersianDigits(item.quantity)} {item.unit}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-300">
                          {toPersianDigits(formatTomans(item.unitPrice))}
                        </td>
                        <td className="p-3 text-center font-extrabold text-blue-400">
                          {toPersianDigits(formatTomans(item.totalPrice))}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        هیچ تفکیک قلمی ثبت نشده است. محاسبه بر اساس مبلغ کلی برآوردی انجام می‌شود.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Breakdown Calculation Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>جمع کل پایه (بدون تخفیف):</span>
              <span className="font-bold text-slate-100">{toPersianDigits(formatTomans(finalBaseValue))} تومان</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>تخفیف مصوب ({toPersianDigits(discountPercent)}٪):</span>
              <span className="font-bold text-rose-400">- {toPersianDigits(formatTomans(discountAmount))} تومان</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>مالیات و عوارض ارزش افزوده (۱۰٪):</span>
              <span className="font-bold text-amber-400">+ {toPersianDigits(formatTomans(vatAmount))} تومان</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black text-emerald-400">
              <span>مبلغ نهایی قابل پرداخت:</span>
              <span className="text-base">{toPersianDigits(formatTomans(grandTotal))} تومان</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-6 py-2 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ذخیره و ثبت قیمت‌گذاری</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
