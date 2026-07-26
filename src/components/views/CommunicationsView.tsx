import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { CommunicationType } from '../../types';
import {
  PhoneCall,
  Plus,
  Users,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  User,
  X,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPersianDigits } from '../../lib/utils';

export const CommunicationsView: React.FC = () => {
  const { communications, addCommunication, state, currentUser } = useCRMStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState<CommunicationType>('call');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [outcome, setOutcome] = useState('');

  const filteredComms = communications.filter(
    (c) => filterType === 'all' || c.type === filterType
  );

  const handleCreateComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const cust = state.customers.find((c) => c.id === customerId) || state.customers[0];

    addCommunication({
      customerId: cust.id,
      customerName: `${cust.name} (${cust.companyName})`,
      type,
      summary,
      details,
      date: new Date().toLocaleString('fa-IR'),
      recordedByUserId: currentUser?.id || 'user-1',
      durationMinutes: parseInt(durationMinutes) || 0,
      outcome,
    });

    setSummary('');
    setDetails('');
    setOutcome('');
    setShowAddModal(false);
  };

  const getCommIcon = (t: CommunicationType) => {
    switch (t) {
      case 'call':
        return { icon: PhoneCall, bg: 'bg-rose-100 text-rose-700' };
      case 'meeting':
        return { icon: Users, bg: 'bg-purple-100 text-purple-700' };
      case 'whatsapp':
        return { icon: MessageSquare, bg: 'bg-emerald-100 text-emerald-700' };
      case 'email':
        return { icon: Mail, bg: 'bg-sky-100 text-sky-700' };
      default:
        return { icon: PhoneCall, bg: 'bg-indigo-100 text-indigo-700' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
              تاریخچه تماس‌ها، جلسات و ارتباطات
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              ثبت خط زمان (Timeline) تعاملات مشتریان، مذاکرات تلفنی و نتیجه جلسات
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (state.customers.length > 0) setCustomerId(state.customers[0].id);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-rose-200 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت ارتباط جدید</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'all', label: 'همه ارتباطات' },
          { id: 'call', label: 'تماس تلفنی' },
          { id: 'meeting', label: 'جلسه حضوری/آنلاین' },
          { id: 'whatsapp', label: 'واتس‌اپ و پیام' },
          { id: 'email', label: 'ایمیل' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="relative before:absolute before:right-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 space-y-4">
        {filteredComms.map((comm) => {
          const typeInfo = getCommIcon(comm.type);
          const Icon = typeInfo.icon;
          const recorder = state.users.find((u) => u.id === comm.recordedByUserId);

          return (
            <motion.div
              key={comm.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative pr-14"
            >
              {/* Timeline Node Badge */}
              <div
                className={`absolute right-2 top-3 w-9 h-9 rounded-2xl flex items-center justify-center ${typeInfo.bg} shadow-xs border-2 border-white ring-2 ring-slate-100 z-10`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                    {comm.summary}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                    {comm.date}
                  </span>
                </div>

                <div className="text-xs font-semibold text-indigo-600 mb-2">
                  مشتری: {comm.customerName}
                </div>

                {comm.details && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3">
                    {comm.details}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    {recorder && <span>ثبت‌کننده: {recorder.name}</span>}
                    {comm.durationMinutes ? (
                      <span>مدت گفت‌وگو: {toPersianDigits(comm.durationMinutes)} دقیقه</span>
                    ) : null}
                  </div>

                  {comm.outcome && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      نتیجه: {comm.outcome}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Communication Modal */}
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
                <h2 className="text-sm font-bold text-slate-800">ثبت تعامل و تماس جدید</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateComm} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    انتخاب مشتری
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                  >
                    {state.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نوع ارتباط
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as CommunicationType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="call">تماس تلفنی</option>
                      <option value="meeting">جلسه حضوری / آنلاین</option>
                      <option value="whatsapp">پیامک / واتس‌اپ</option>
                      <option value="email">پست الکترونیکی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      مدت گفت‌وگو (دقیقه)
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    موضوع و خلاصه گفتگو
                  </label>
                  <input
                    type="text"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="موضوع اصلی گفتگو..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    مشروح توافقات و توضیحات
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="توضیحات تکمیلی..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    نتیجه گفت‌وگو
                  </label>
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="مثلاً: موافقت با ارسال پروپوزال..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                  />
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
                    className="px-5 py-2 bg-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200"
                  >
                    ثبت گفت‌وگو
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
