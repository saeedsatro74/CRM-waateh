import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { Deal, DealStage } from '../../types';
import {
  KanbanSquare,
  Plus,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCompactTomans, formatTomans, toPersianDigits } from '../../lib/utils';

export const DealsKanbanView: React.FC = () => {
  const { accessibleDeals, addDeal, updateDealStage, deleteDeal, allCustomers, currentUser } =
    useCRMStore();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [value, setValue] = useState('100000000');
  const [stage, setStage] = useState<DealStage>('initial_contact');
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const columns: { id: DealStage; label: string; color: string; border: string; headerBg: string }[] =
    [
      {
        id: 'initial_contact',
        label: 'تماس اولیه',
        color: 'text-indigo-700',
        border: 'border-indigo-200',
        headerBg: 'bg-indigo-50/80',
      },
      {
        id: 'negotiation',
        label: 'مذاکره',
        color: 'text-purple-700',
        border: 'border-purple-200',
        headerBg: 'bg-purple-50/80',
      },
      {
        id: 'proposal',
        label: 'ارسال پیشنهاد',
        color: 'text-sky-700',
        border: 'border-sky-200',
        headerBg: 'bg-sky-50/80',
      },
      {
        id: 'contract',
        label: 'امضای قرارداد',
        color: 'text-amber-700',
        border: 'border-amber-200',
        headerBg: 'bg-amber-50/80',
      },
      {
        id: 'won',
        label: 'موفق شده (برنده)',
        color: 'text-emerald-700',
        border: 'border-emerald-200',
        headerBg: 'bg-emerald-50/80',
      },
      {
        id: 'lost',
        label: 'از دست رفته',
        color: 'text-rose-700',
        border: 'border-rose-200',
        headerBg: 'bg-rose-50/80',
      },
    ];

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cust = allCustomers.find((c) => c.id === customerId) || allCustomers[0];

    addDeal({
      title,
      customerId: cust.id,
      customerName: cust.name,
      companyName: cust.companyName,
      value: parseInt(value) || 0,
      stage,
      probability: stage === 'won' ? 100 : 50,
      expectedCloseDate,
      assignedToUserId: currentUser?.id || 'user-2',
      notes,
    });

    setTitle('');
    setNotes('');
    setShowAddModal(false);
  };

  const getNextStage = (current: DealStage): DealStage | null => {
    const order: DealStage[] = [
      'initial_contact',
      'negotiation',
      'proposal',
      'contract',
      'won',
    ];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  const getPrevStage = (current: DealStage): DealStage | null => {
    const order: DealStage[] = [
      'initial_contact',
      'negotiation',
      'proposal',
      'contract',
      'won',
    ];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <KanbanSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
              فرصت‌های فروش و کانبان (Sales Kanban)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              مدیریت بصری مراحل فروش، درصد شانس موفقیت و مبلغ قراردادها
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (allCustomers.length > 0) setCustomerId(allCustomers[0].id);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-purple-200 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>فرصت جدید</span>
        </button>
      </div>

      {/* Kanban Columns Overflow Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start min-h-[600px] dir-rtl">
        {columns.map((col) => {
          const colDeals = accessibleDeals.filter((d) => d.stage === col.id);
          const colTotalValue = colDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={col.id}
              className="w-80 shrink-0 bg-slate-100/70 rounded-3xl p-3 border border-slate-200/70 flex flex-col gap-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div
                className={`p-3.5 rounded-2xl border ${col.border} ${col.headerBg} flex items-center justify-between`}
              >
                <div>
                  <h3 className={`text-xs font-bold ${col.color}`}>{col.label}</h3>
                  <div className="text-[11px] font-extrabold text-slate-800 mt-0.5">
                    {formatCompactTomans(colTotalValue)}
                  </div>
                </div>
                <span className="w-6 h-6 rounded-full bg-white text-slate-800 text-xs font-extrabold flex items-center justify-center border border-slate-200 shadow-2xs">
                  {toPersianDigits(colDeals.length)}
                </span>
              </div>

              {/* Deal Cards Container */}
              <div className="flex-1 space-y-3">
                {colDeals.map((deal) => {
                  const nextSt = getNextStage(deal.stage);
                  const prevSt = getPrevStage(deal.stage);

                  return (
                    <motion.div
                      key={deal.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all text-right group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-xs font-extrabold text-slate-800 leading-snug">
                          {deal.title}
                        </h4>
                        <button
                          onClick={() => deleteDeal(deal.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-3">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{deal.companyName}</span>
                      </div>

                      {/* Value & Probability */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-3">
                        <span className="font-extrabold text-emerald-700">
                          {formatTomans(deal.value)}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {toPersianDigits(deal.probability)}٪ احتمال
                        </span>
                      </div>

                      {/* Stage Advance / Retreat Quick Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1">
                          {prevSt && (
                            <button
                              onClick={() => updateDealStage(deal.id, prevSt)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="مرحله قبل"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {nextSt && (
                            <button
                              onClick={() => updateDealStage(deal.id, nextSt)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="مرحله بعد"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {deal.stage !== 'lost' && deal.stage !== 'won' && (
                          <button
                            onClick={() => updateDealStage(deal.id, 'lost')}
                            className="text-[10px] text-rose-500 font-bold hover:underline"
                          >
                            علامت به عنوان رد شده
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {colDeals.length === 0 && (
                  <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                    هیچ فرصتی در این مرحله نیست
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 dir-rtl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">ایجاد فرصت فروش جدید</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    عنوان فرصت فروش
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثلاً: توسعه زیرساخت و CRM..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    انتخاب مشتری مربوطه
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                  >
                    {allCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      مبلغ قرارداد (تومان)
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      مرحله اولیه
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as DealStage)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="initial_contact">تماس اولیه</option>
                      <option value="negotiation">مذاکره</option>
                      <option value="proposal">ارسال پیشنهاد</option>
                      <option value="contract">امضای قرارداد</option>
                      <option value="won">موفق شده</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-200"
                  >
                    ایجاد فرصت
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
