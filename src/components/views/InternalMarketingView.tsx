import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { Opportunity, OpportunityStage } from '../../types';
import { OPPORTUNITY_STAGES } from '../opportunities/OpportunityStageHeader';
import { OpportunityDetailModal } from '../opportunities/OpportunityDetailModal';
import {
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building2,
  User as UserIcon,
  Phone,
  FileText,
  ShieldCheck,
  ChevronRight,
  Package,
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatTomans, toPersianDigits } from '../../lib/utils';

export const InternalMarketingView: React.FC = () => {
  const {
    opportunities,
    updateOpportunityStage,
    addOpportunityFile,
    deleteOpportunityFile,
    saveOpportunityApprovalData,
    addOpportunityItem,
    removeOpportunityItem,
    currentUser,
    settings,
    products,
  } = useCRMStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Filter for stage 'internal_marketing' primarily, or allow seeing all
  const [stageTab, setStageTab] = useState<'pending' | 'all'>('pending');

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (stageTab === 'pending') {
      return opp.stage === 'internal_marketing';
    }
    return true;
  });

  const pendingCount = opportunities.filter((o) => o.stage === 'internal_marketing').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 dir-rtl font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 font-extrabold text-xs px-3 py-1 rounded-full border border-purple-500/30">
                مدیریت فروش و بازارگردانی
              </span>
              <span className="bg-amber-500/20 text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-500/30">
                خانم عابدیان
              </span>
            </div>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight">
              میز کار بازارگردانی داخلی (Internal Marketing)
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              بررسی و تطبیق درخواست‌های خریداران با پتانسیل ساخت و تامین تجهیزات، کنترل شرایط رقابتی بازار و تایید نهایی جهت صدور پیش‌فاکتور.
            </p>
          </div>

          <div className="bg-slate-950/60 backdrop-blur-md border border-purple-500/30 p-4 rounded-2xl text-center shrink-0 min-w-[150px]">
            <span className="text-xs text-purple-300 font-bold block mb-1">فرصت‌های در انتظار بازارگردانی</span>
            <span className="font-black text-3xl text-amber-400 block">{toPersianDigits(pendingCount)}</span>
            <span className="text-[10px] text-slate-400">نیازمند بررسی مدیر فروش</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStageTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              stageTab === 'pending'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            در انتظار بازارگردانی ({toPersianDigits(pendingCount)})
          </button>
          <button
            onClick={() => setStageTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              stageTab === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            همه فرصت‌های فعال ({toPersianDigits(opportunities.length)})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="جستجوی عنوان فرصت یا شرکت..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Opportunities List Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl p-12 border border-slate-800 text-center">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-300">هیچ فرصتی در این بخش وجود ندارد.</h3>
          <p className="text-xs text-slate-500 mt-1">
            وقتی فرصت‌ها به مرحله «بازارگردانی داخلی» هدایت شوند، در این میز کار قرار خواهند گرفت.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpportunities.map((opp) => {
            const isPending = opp.stage === 'internal_marketing';

            return (
              <motion.div
                key={opp.id}
                whileHover={{ y: -3 }}
                className={`bg-slate-900 border rounded-3xl p-5 space-y-4 shadow-lg relative flex flex-col justify-between transition-all ${
                  isPending
                    ? 'border-purple-500/60 ring-2 ring-purple-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold bg-purple-950 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800/60">
                      شماره {toPersianDigits(opp.number || `WQ-${opp.id.slice(-6)}`)}
                    </span>

                    <span className="text-xs font-bold text-slate-400">
                      {OPPORTUNITY_STAGES.find((s) => s.id === opp.stage)?.label}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white leading-snug">
                    {opp.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-bold text-slate-100">{opp.companyName || opp.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{opp.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{toPersianDigits(opp.phone || '—')}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">ارزش برآوردی:</span>
                    <span className="font-black text-sm text-emerald-400">
                      {toPersianDigits(formatTomans(opp.value))} تومان
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    پیوست‌ها: {toPersianDigits(opp.files?.length || 0)} فایل
                  </span>

                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>بررسی بازارگردانی و اقدام</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          currentUser={currentUser}
          isOpen={Boolean(selectedOpp)}
          onClose={() => setSelectedOpp(null)}
          onUpdateStage={(id, stage, notes) => {
            updateOpportunityStage(id, stage, notes);
            const updated = opportunities.find((o) => o.id === id);
            if (updated) setSelectedOpp(updated);
          }}
          onAddFile={(file) => {
            addOpportunityFile(selectedOpp.id, file);
            const updated = opportunities.find((o) => o.id === selectedOpp.id);
            if (updated) setSelectedOpp(updated);
          }}
          onDeleteFile={(fileId) => {
            deleteOpportunityFile(selectedOpp.id, fileId);
            const updated = opportunities.find((o) => o.id === selectedOpp.id);
            if (updated) setSelectedOpp(updated);
          }}
          onSaveApproval={(approvalData) => {
            saveOpportunityApprovalData(selectedOpp.id, approvalData);
            const updated = opportunities.find((o) => o.id === selectedOpp.id);
            if (updated) setSelectedOpp(updated);
          }}
          onAddItem={(item) => {
            addOpportunityItem(selectedOpp.id, item);
            const updated = opportunities.find((o) => o.id === selectedOpp.id);
            if (updated) setSelectedOpp(updated);
          }}
          onRemoveItem={(itemId) => {
            removeOpportunityItem(selectedOpp.id, itemId);
            const updated = opportunities.find((o) => o.id === selectedOpp.id);
            if (updated) setSelectedOpp(updated);
          }}
          productsCatalog={products}
          companySettings={settings}
        />
      )}
    </div>
  );
};
