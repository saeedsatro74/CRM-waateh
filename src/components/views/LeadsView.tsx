import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { Lead, DealStage } from '../../types';
import {
  Target,
  Plus,
  ArrowLeftRight,
  DollarSign,
  Phone,
  Mail,
  User,
  Building2,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTomans, toPersianDigits } from '../../lib/utils';

export const LeadsView: React.FC = () => {
  const { accessibleLeads, addLead, convertLeadToDeal, currentUser } = useCRMStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dealValue, setDealValue] = useState('50000000');
  const [stage, setStage] = useState<DealStage>('initial_contact');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  const filteredLeads = accessibleLeads.filter(
    (l) => stageFilter === 'all' || l.stage === stageFilter
  );

  const getStageBadge = (st: DealStage) => {
    switch (st) {
      case 'initial_contact':
        return { label: 'تماس اولیه', color: 'bg-indigo-100 text-indigo-800' };
      case 'negotiation':
        return { label: 'مذاکره', color: 'bg-purple-100 text-purple-800' };
      case 'proposal':
        return { label: 'ارسال پیشنهاد', color: 'bg-sky-100 text-sky-800' };
      case 'contract':
        return { label: 'در آستانه قرارداد', color: 'bg-amber-100 text-amber-800' };
      case 'won':
        return { label: 'موفق شده', color: 'bg-emerald-100 text-emerald-800' };
      case 'lost':
        return { label: 'رد شده', color: 'bg-rose-100 text-rose-800' };
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyName.trim()) return;

    addLead({
      title,
      customerName,
      companyName,
      phone,
      email,
      dealValue: parseInt(dealValue) || 0,
      stage,
      priority,
      assignedToUserId: currentUser?.id || 'user-2',
      notes,
      source: 'ثبت دستی',
    });

    setTitle('');
    setCustomerName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
              مدیریت سرنخ‌های فروش (Sales Leads)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              ثبت مشتریان احتمالی و تبدیل هوشمند به فرصت‌های فروش
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-amber-200 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت سرنخ جدید</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'همه سرنخ‌ها' },
          { id: 'initial_contact', label: 'تماس اولیه' },
          { id: 'negotiation', label: 'مذاکره' },
          { id: 'proposal', label: 'ارسال پیشنهاد' },
          { id: 'contract', label: 'قرارداد' },
          { id: 'won', label: 'موفق' },
          { id: 'lost', label: 'رد شده' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStageFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              stageFilter === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLeads.map((lead) => {
          const stageInfo = getStageBadge(lead.stage);
          return (
            <motion.div
              key={lead.id}
              whileHover={{ y: -2 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-extrabold text-slate-800">{lead.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stageInfo.color}`}>
                    {stageInfo.label}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-600 flex items-center gap-2 mb-3">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {lead.companyName} ({lead.customerName})
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-400 font-medium">ارزش تخمینی:</span>
                    <span className="text-emerald-600">{formatTomans(lead.dealValue)}</span>
                  </div>
                  {lead.notes && (
                    <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200/60 pt-1.5">
                      {lead.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">{lead.createdAt}</span>

                <button
                  onClick={() => convertLeadToDeal(lead)}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>تبدیل به فرصت کانبان</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 dir-rtl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">ثبت سرنخ فروش جدید</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    عنوان سرنخ / پروژه
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثلاً: توسعه نرم‌افزار شرکت پارت..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام شرکت / مجموعه
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="نام شرکت..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام رابط / شخص
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="نام شخص..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شماره تماس
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="۰۲۱..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ارزش تخمینی (تومان)
                    </label>
                    <input
                      type="number"
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    توضیحات و سوابق
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="توضیحات اولیه..."
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
                    className="px-5 py-2 bg-amber-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-200"
                  >
                    ثبت سرنخ
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
