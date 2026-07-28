import React, { useState } from 'react';
import { Opportunity, OpportunityApprovalData, OpportunityFile, OpportunityItem, OpportunityStage, User, UserRole } from '../../types';
import { OpportunityStageHeader, OPPORTUNITY_STAGES, getStageIndex } from './OpportunityStageHeader';
import { OpportunityFileUpload } from './OpportunityFileUpload';
import { OpportunityApprovalModal } from './OpportunityApprovalModal';
import { OpportunityPricingModal } from './OpportunityPricingModal';
import { generatePreInvoiceWordDoc, generateTechnicalProposalWordDoc } from './WordDocGenerator';
import { FinalStampedPdfGenerator } from './FinalStampedPdfGenerator';
import { formatTomans, toPersianDigits } from '../../lib/utils';
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  History,
  Building2,
  User as UserIcon,
  Phone,
  DollarSign,
  Package,
  Award,
  Truck,
  Calendar,
  AlertCircle,
  Download,
  Share2,
  Edit3,
  Calculator,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OpportunityDetailModalProps {
  opportunity: Opportunity;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStage: (opportunityId: string, newStage: OpportunityStage, notes?: string) => void;
  onAddFile: (file: OpportunityFile) => void;
  onDeleteFile: (fileId: string) => void;
  onSaveApproval: (approvalData: OpportunityApprovalData) => void;
  onSavePricing?: (data: { totalValue: number; items: OpportunityItem[]; discountPercent: number }) => void;
  onAddItem: (item: OpportunityItem) => void;
  onRemoveItem: (itemId: string) => void;
  productsCatalog?: any[];
  companySettings?: any;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  currentUser,
  isOpen,
  onClose,
  onUpdateStage,
  onAddFile,
  onDeleteFile,
  onSaveApproval,
  onSavePricing,
  onAddItem,
  onRemoveItem,
  productsCatalog = [],
  companySettings,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'files' | 'approval' | 'documents' | 'history'>('pipeline');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [stageNotes, setStageNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectStageTarget, setRejectStageTarget] = useState<OpportunityStage>('registration');

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('دستگاه');
  const [newItemUnitPrice, setNewItemUnitPrice] = useState('100000000');
  const [newItemSpecs, setNewItemSpecs] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  if (!isOpen) return null;

  const userRole: UserRole = currentUser?.role || 'sales';
  const currentStageIndex = getStageIndex(opportunity.stage);

  // Permission Checks: Only Sales Manager and Admin can approve/advance or send back stages
  const canAdvanceStage = () => {
    return userRole === 'admin' || userRole === 'sales_manager';
  };

  const handleNextStage = () => {
    if (currentStageIndex < OPPORTUNITY_STAGES.length - 1) {
      const nextStage = OPPORTUNITY_STAGES[currentStageIndex + 1].id;
      onUpdateStage(opportunity.id, nextStage, stageNotes || `انتقال به مرحله ${OPPORTUNITY_STAGES[currentStageIndex + 1].label}`);
      setStageNotes('');
    }
  };

  const handleRejectStage = () => {
    onUpdateStage(
      opportunity.id,
      rejectStageTarget,
      `بازگرداندن به مرحله ${OPPORTUNITY_STAGES.find((s) => s.id === rejectStageTarget)?.label}: ${stageNotes}`
    );
    setShowRejectModal(false);
    setStageNotes('');
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const unitPrice = Number(newItemUnitPrice) || 0;
    const qty = Number(newItemQuantity) || 1;

    const newItem: OpportunityItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      quantity: qty,
      unit: newItemUnit,
      unitPrice,
      totalPrice: unitPrice * qty,
      specs: newItemSpecs,
    };

    onAddItem(newItem);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemUnitPrice('100000000');
    setNewItemSpecs('');
    setShowAddItemForm(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 dir-rtl text-slate-100 selection:bg-teal-500 selection:text-white">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl relative overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-slate-950/90 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-teal-950/80 border border-teal-600/50 rounded-2xl text-teal-400 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-teal-900/80 text-teal-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-teal-600/50">
                  فرصت شماره {toPersianDigits(opportunity.number || `WQ-${opportunity.id.slice(-6)}`)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ثبت: {opportunity.createdAt}
                </span>
              </div>
              <h2 className="font-black text-lg sm:text-xl text-white truncate mt-1">
                {opportunity.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 font-bold text-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  {opportunity.companyName || opportunity.customerName}
                </span>
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  {opportunity.customerName}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-purple-400" />
                  {toPersianDigits(opportunity.phone || '—')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-left bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-700 hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-bold">ارزش اولیه برآوردی:</span>
              <span className="font-black text-sm text-emerald-400 dir-ltr text-right block">
                {toPersianDigits(formatTomans(opportunity.value))} <span className="text-[10px] font-normal text-slate-300">تومان</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 8-Stage Pipeline Progress Header */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <OpportunityStageHeader
            currentStage={opportunity.stage}
            userRole={userRole}
            interactive={true}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-900 border-b border-slate-800 shrink-0 overflow-x-auto">
          {[
            { id: 'pipeline', label: 'اطلاعات و جریان کار', icon: Package },
            { id: 'files', label: `فایل‌ها و پیوست‌ها (${opportunity.files?.length || 0})`, icon: FileText },
            { id: 'approval', label: 'مجوز و شرایط مدیرعامل', icon: ShieldCheck },
            { id: 'documents', label: 'پیش‌فاکتور / پیشنهاد فنی / PDF', icon: Award },
            { id: 'history', label: `سوابق و تاییدات (${opportunity.history?.length || 0})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PIPELINE & ITEMS */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Role Action Banner */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-950 border border-teal-600/40 rounded-xl text-teal-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>مرحله فعلی: {OPPORTUNITY_STAGES.find((s) => s.id === opportunity.stage)?.label}</span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                        مسئول: {OPPORTUNITY_STAGES.find((s) => s.id === opportunity.stage)?.roleLabel}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      نقش شما در سیستم: <span className="font-bold text-teal-300">{userRole === 'admin' ? 'مدیرعامل (ارشد)' : userRole === 'sales_manager' ? 'مدیر فروش' : 'کارشناس فروش'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Pricing Button: Displayed strictly when in pricing stage or for authorized managers */}
                  {opportunity.stage === 'pricing' && (
                    <button
                      onClick={() => setShowPricingModal(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ring-2 ring-blue-400/40"
                    >
                      <Calculator className="w-4 h-4 text-blue-200" />
                      <span>قیمت‌گذاری</span>
                    </button>
                  )}

                  {!canAdvanceStage() && (
                    <div className="bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>محدودیت دسترسی: تنها مدیر فروش و ادمین اجازه تایید مراحل را دارند.</span>
                    </div>
                  )}

                  {/* Send Back Button */}
                  {currentStageIndex > 0 && canAdvanceStage() && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-3.5 py-2 rounded-xl border border-rose-700/60 text-rose-300 hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>بازگرداندن به مرحله قبل</span>
                    </button>
                  )}

                  {/* Admin Approval Open Button */}
                  {(userRole === 'admin' || opportunity.stage === 'ceo_review') && (
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>ثبت/ویرایش شرایط مدیرعامل</span>
                    </button>
                  )}

                  {/* Advance Stage Button */}
                  {currentStageIndex < OPPORTUNITY_STAGES.length - 1 && canAdvanceStage() && (
                    <button
                      onClick={handleNextStage}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>ارسال به مرحله بعد ({OPPORTUNITY_STAGES[currentStageIndex + 1]?.label})</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items & Equipment List */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80 shadow-inner space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-400" />
                    <h3 className="font-bold text-sm text-slate-100">
                      اقلام، دستگاه‌ها و قیمت‌های استعلام شده ({opportunity.items?.length || 0})
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowAddItemForm(!showAddItemForm)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن دستگاه / قلم جدید</span>
                  </button>
                </div>

                {/* Add Item Form */}
                <AnimatePresence>
                  {showAddItemForm && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleAddNewItem}
                      className="bg-slate-900 border border-teal-500/40 p-4 rounded-xl space-y-3 overflow-hidden"
                    >
                      <h4 className="font-bold text-xs text-teal-300">افزودن قلم تجهیزات به فرصت:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-slate-400 block mb-1">نام دستگاه / تجهیزات:</label>
                          <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="مثلا: چیلر تراکمی اسکرال ۵۰ تن"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">تعداد:</label>
                          <input
                            type="number"
                            min="1"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">قیمت واحد (تومان):</label>
                          <input
                            type="number"
                            value={newItemUnitPrice}
                            onChange={(e) => setNewItemUnitPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-bold"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">مشخصات فنی و استانداردهای دستگاه:</label>
                        <input
                          type="text"
                          value={newItemSpecs}
                          onChange={(e) => setNewItemSpecs(e.target.value)}
                          placeholder="مثلا: کمپرسور کوپلند، مبرد R410a، کندانسور مسی"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddItemForm(false)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl"
                        >
                          انصراف
                        </button>
                        <button
                          type="submit"
                          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md"
                        >
                          ثبت قلم
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Items Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700">
                        <th className="p-3">نام تجهیزات / دستگاه</th>
                        <th className="p-3 text-center">تعداد</th>
                        <th className="p-3 text-center">قیمت واحد (تومان)</th>
                        <th className="p-3 text-center">قیمت کل (تومان)</th>
                        <th className="p-3 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {opportunity.items && opportunity.items.length > 0 ? (
                        opportunity.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
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
                            <td className="p-3 text-center font-extrabold text-teal-400">
                              {toPersianDigits(formatTomans(item.totalPrice))}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                            اقلام به صورت تفکیکی وارد نشده‌اند. ارزش کلی برآوردی: {toPersianDigits(formatTomans(opportunity.value))} تومان
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILES & ATTACHMENTS */}
          {activeTab === 'files' && (
            <OpportunityFileUpload
              opportunityId={opportunity.id}
              files={opportunity.files || []}
              currentUser={currentUser}
              onAddFile={onAddFile}
              onDeleteFile={onDeleteFile}
            />
          )}

          {/* TAB 3: ADMIN APPROVAL DETAILS */}
          {activeTab === 'approval' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-indigo-900/50 rounded-2xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    <div>
                      <h3 className="font-black text-sm text-slate-100">
                        مجوزها و پارامترهای تایید شده مدیرعامل (مهندس فتح‌پور)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        آخرین بروزرسانی: {opportunity.approvalData?.approvedAt || 'ثبت نشده'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition-all"
                  >
                    ویرایش مجوزها
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">درصد تخفیف مصوب:</span>
                    <span className="font-extrabold text-base text-emerald-400">
                      {toPersianDigits(opportunity.approvalData?.discountPercent ?? 5)}٪
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">زمان اجرا و تحویل:</span>
                    <span className="font-extrabold text-sm text-blue-300">
                      {toPersianDigits(opportunity.approvalData?.executionTimeDays ?? 30)} روز کاری
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">مدت اعتبار قیمت:</span>
                    <span className="font-extrabold text-sm text-purple-300">
                      {toPersianDigits(opportunity.approvalData?.priceValidityDays ?? 7)} روز کاری
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">محل تحویل تجهیزات:</span>
                    <span className="font-extrabold text-sm text-cyan-300">
                      {opportunity.approvalData?.deliveryLocationType === 'custom'
                        ? opportunity.approvalData.deliveryLocationCustom
                        : 'تحویل درب کارخانه'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 block font-medium">شرایط گارانتی و ضمانت‌نامه:</span>
                  <p className="font-bold text-amber-300">
                    {opportunity.approvalData?.warrantyTerms ||
                      '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب (هرکدام زودتر فرا برسد)'}
                  </p>
                </div>

                {opportunity.approvalData?.adminNotes && (
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">دستورات و ملاحظات مدیریتی:</span>
                    <p className="text-slate-200">{opportunity.approvalData.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS GENERATOR (WORD & PDF) */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Word Generator Action Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pre-Invoice Word Card */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-950 border border-blue-600/40 rounded-xl text-blue-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">صدور پیش‌فاکتور (Word)</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">تولید خودکار فایل docx. استاندارد</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    ایجاد فایل Word رسمی شامل جدول تجهیزات، قیمت، مالیات، درصد تخفیف مصوب و شرایط تحویل.
                  </p>

                  <button
                    onClick={() => generatePreInvoiceWordDoc(opportunity, companySettings)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تولید و دانلود فایل Word پیش‌فاکتور</span>
                  </button>
                </div>

                {/* Technical Proposal Word Card */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-950 border border-teal-600/40 rounded-xl text-teal-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">پیشنهاد فنی (Word)</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">تولید docx. مشخصات و گارانتی</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    ایجاد فایل Word پیشنهاد فنی با پارامترهای عملکردی، دامنه کاری و شرایط ضمانت‌نامه ۱۰ ساله.
                  </p>

                  <button
                    onClick={() => generateTechnicalProposalWordDoc(opportunity, companySettings)}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تولید و دانلود فایل Word پیشنهاد فنی</span>
                  </button>
                </div>
              </div>

              {/* PDF & Official Stamp Generator */}
              <FinalStampedPdfGenerator
                opportunity={opportunity}
                companySettings={companySettings}
              />
            </div>
          )}

          {/* TAB 5: AUDIT LOGS & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80 shadow-inner">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60 mb-3">
                  <History className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm text-slate-100">
                    تاریخچه و سوابق تغییرات، تاییدات و گردش کار ({opportunity.history?.length || 0})
                  </h3>
                </div>

                {opportunity.history && opportunity.history.length > 0 ? (
                  <div className="space-y-3">
                    {opportunity.history.map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-900/80 border border-slate-700 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-slate-200">
                            <span className="text-teal-400">{log.performedByName}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                              {log.performedByRole === 'admin'
                                ? 'مدیرعامل'
                                : log.performedByRole === 'sales_manager'
                                ? 'مدیر فروش'
                                : 'کارشناس فروش'}
                            </span>
                          </div>
                          <p className="text-slate-300">{log.notes || 'تغییر وضعیت در سیستم'}</p>
                        </div>

                        <div className="text-left shrink-0 text-[11px] text-slate-400 font-medium">
                          {log.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400">سابقه‌ای ثبت نشده است.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Admin Approval Form Modal */}
      <OpportunityApprovalModal
        opportunity={opportunity}
        currentUser={currentUser}
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onSaveApproval={onSaveApproval}
      />

      {/* Pricing Modal */}
      <OpportunityPricingModal
        opportunity={opportunity}
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSavePricing={(pricingData) => {
          if (onSavePricing) {
            onSavePricing(pricingData);
          }
        }}
      />

      {/* Send Back / Reject Stage Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 dir-rtl text-white"
          >
            <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <h3 className="font-extrabold text-sm text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>بازگرداندن فرصت به مراحل قبل</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">انتخاب مرحله مقصد:</label>
                  <select
                    value={rejectStageTarget}
                    onChange={(e) => setRejectStageTarget(e.target.value as OpportunityStage)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {OPPORTUNITY_STAGES.slice(0, currentStageIndex).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.stepNumber}. {s.label} ({s.roleLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">علت بازگرداندن و توضیحات اصلاحی:</label>
                  <textarea
                    rows={3}
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="علت عدم تایید یا موارد نیازمند اصلاح را بنویسید..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  onClick={handleRejectStage}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  بازگرداندن فرصت
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
