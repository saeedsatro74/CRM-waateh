import React, { useState } from 'react';
import { Opportunity, OpportunityApprovalData, OpportunityFile, OpportunityItem, OpportunityStage, User, UserRole } from '../../types';
import { OpportunityStageHeader, OPPORTUNITY_STAGES, getStageIndex } from './OpportunityStageHeader';
import { OpportunityFileUpload } from './OpportunityFileUpload';
import { OpportunityApprovalModal } from './OpportunityApprovalModal';
import { OpportunityPricingModal } from './OpportunityPricingModal';
import { generatePreInvoiceWordDoc, generateTechnicalProposalWordDoc } from './WordDocGenerator';
import { WordProposalBuilderModal } from './WordProposalBuilderModal';
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
  Layers,
  Wrench,
  TrendingUp,
  CheckSquare,
  FileCheck,
  Building,
  Send,
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
  const [activeTab, setActiveTab] = useState<'workspace' | 'items' | 'files' | 'approval' | 'documents' | 'history'>('workspace');
  const [selectedStage, setSelectedStage] = useState<OpportunityStage>(opportunity.stage);
  
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [stageNotes, setStageNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectStageTarget, setRejectStageTarget] = useState<OpportunityStage>('registration');

  // Internal Marketing state
  const [competitorPrice, setCompetitorPrice] = useState('2700000000');
  const [targetMargin, setTargetMargin] = useState('18');
  const [marketingStrategy, setMarketingStrategy] = useState('تمرکز بر خدمات پس از فروش و گارانتی ۱۰ ساله کمپرسور');
  const [marketingApproved, setMarketingApproved] = useState(false);

  // Technical Proposal state
  const [techCapacity, setTechCapacity] = useState('۵۰ تن تبرید (۱۷۵ کیلووات)');
  const [compressorBrand, setCompressorBrand] = useState('کوپلند اسکرال (Copeland Scroll)');
  const [refrigerantType, setRefrigerantType] = useState('R410a دوستدار محیط زیست');
  const [techDescription, setTechDescription] = useState('دستگاه چیلر تراکمی آب خنک / هوا خنک مجهز به مبدل حرارتی پوسته و لوله مسی و تابلو برق تمام اتوماتیک با کنترلر PLC');

  // Catalog picker state
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [showWordProposalModal, setShowWordProposalModal] = useState(false);

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

  // Sync selected stage if opportunity stage changes externally
  if (selectedStage !== opportunity.stage && !selectedStage) {
    setSelectedStage(opportunity.stage);
  }

  const canAdvanceStage = () => {
    return userRole === 'admin' || userRole === 'sales_manager';
  };

  const handleNextStage = () => {
    if (currentStageIndex < OPPORTUNITY_STAGES.length - 1) {
      const nextStage = OPPORTUNITY_STAGES[currentStageIndex + 1].id;
      onUpdateStage(opportunity.id, nextStage, stageNotes || `انتقال به مرحله ${OPPORTUNITY_STAGES[currentStageIndex + 1].label}`);
      setStageNotes('');
      setSelectedStage(nextStage);
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
    setSelectedStage(rejectStageTarget);
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

  const handleAddFromCatalog = () => {
    if (!selectedCatalogId) return;
    const catItem = productsCatalog.find((p) => p.id === selectedCatalogId);
    if (!catItem) return;

    const unitPrice = catItem.price || 150000000;
    const newItem: OpportunityItem = {
      id: `cat-item-${Date.now()}`,
      name: catItem.name,
      quantity: 1,
      unit: 'دستگاه',
      unitPrice,
      totalPrice: unitPrice,
      specs: catItem.specs || catItem.category || 'تجهیزات صنعتی استانداردهای شرکت واته',
    };

    onAddItem(newItem);
    setSelectedCatalogId('');
  };

  // Active Stage Info
  const currentStageInfo = OPPORTUNITY_STAGES.find((s) => s.id === opportunity.stage);
  const selectedStageInfo = OPPORTUNITY_STAGES.find((s) => s.id === selectedStage) || currentStageInfo;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 dir-rtl text-slate-100 selection:bg-teal-500 selection:text-white">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-[98vw] xl:max-w-[1600px] w-full h-[95vh] flex flex-col shadow-2xl relative overflow-hidden"
      >
        {/* Top Navigation & Header Bar */}
        <div className="bg-slate-950/95 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-teal-950 border border-teal-600/50 rounded-2xl text-teal-400 shrink-0 shadow-md">
              <Package className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-teal-900/80 text-teal-300 font-extrabold text-xs px-3 py-1 rounded-full border border-teal-600/50">
                  فرصت شماره {toPersianDigits(opportunity.number || `WQ-${opportunity.id.slice(-6)}`)}
                </span>
                <span className="bg-purple-950 text-purple-300 text-xs px-2.5 py-0.5 rounded-full border border-purple-700/50 font-bold">
                  مرحله فعلی: {currentStageInfo?.stepNumber}. {currentStageInfo?.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ثبت: {toPersianDigits(opportunity.createdAt)}
                </span>
              </div>
              <h2 className="font-black text-lg sm:text-2xl text-white truncate mt-1">
                {opportunity.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-1 flex-wrap">
                <span className="flex items-center gap-1.5 font-bold text-slate-100 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  {opportunity.companyName || opportunity.customerName}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  {opportunity.customerName}
                </span>
                <span className="flex items-center gap-1.5 font-medium dir-ltr">
                  <Phone className="w-4 h-4 text-purple-400" />
                  {toPersianDigits(opportunity.phone || '—')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-left bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-700 hidden sm:block shadow-inner">
              <span className="text-[10px] text-slate-400 block font-bold">ارزش کل برآوردی:</span>
              <span className="font-black text-base text-emerald-400 dir-ltr text-right block">
                {toPersianDigits(formatTomans(opportunity.value))} <span className="text-[11px] font-normal text-slate-300">تومان</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 8-Stage Pipeline Progress Header */}
        <div className="p-3 sm:p-4 bg-slate-950/70 border-b border-slate-800/80 shrink-0">
          <OpportunityStageHeader
            currentStage={opportunity.stage}
            userRole={userRole}
            interactive={true}
            onSelectStage={(stage) => {
              setSelectedStage(stage);
              setActiveTab('workspace');
            }}
          />
        </div>

        {/* Global Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-900/90 border-b border-slate-800 shrink-0 overflow-x-auto">
          {[
            { id: 'workspace', label: `اقدام مرحله: ${selectedStageInfo?.label}`, icon: CheckSquare, badge: null },
            { id: 'items', label: `اقلام و تجهیزات (${opportunity.items?.length || 0})`, icon: Package, badge: opportunity.items?.length },
            { id: 'documents', label: 'پیشنهاد مالی / پیشنهاد فنی / PDF ممهور', icon: Award, badge: 'رسمی' },
            { id: 'history', label: `سوابق و تاییدات (${opportunity.history?.length || 0})`, icon: History, badge: opportunity.history?.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-teal-900' : 'bg-slate-800 text-slate-300'}`}>
                    {toPersianDigits(tab.badge)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Body Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* TAB 1: WORKSPACE & ACTIVE STAGE ACTION */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">

              {/* Stage Navigation Control Header */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-950 border border-purple-600/50 rounded-xl text-purple-400 shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2 flex-wrap">
                      <span>در حال بررسی مرحله: <strong className="text-purple-300 font-black">{selectedStageInfo?.stepNumber}. {selectedStageInfo?.label}</strong></span>
                      <span className="text-[11px] bg-purple-900/80 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-600/40">
                        مسئول: {selectedStageInfo?.roleLabel}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      نقش کاربری شما: <span className="font-bold text-teal-300">{userRole === 'admin' ? 'مدیرعامل (ارشد)' : userRole === 'sales_manager' ? 'مدیر فروش' : 'کارشناس فروش'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {!canAdvanceStage() && (
                    <div className="bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>تایید مراحل نیازمند دسترسی مدیر فروش یا مدیرعامل است.</span>
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

                  {/* Advance Stage Button */}
                  {currentStageIndex < OPPORTUNITY_STAGES.length - 1 && canAdvanceStage() && (
                    <button
                      onClick={handleNextStage}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <span>تایید و ارسال به مرحله {OPPORTUNITY_STAGES[currentStageIndex + 1]?.label}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* STAGE 1: REGISTRATION (ثبت اولیه و پیوست اسناد) */}
              {selectedStage === 'registration' && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-400" />
                      <span>مرحله ۱: ثبت اولیه نیازمندی و پیوست اسناد استعلام</span>
                    </h3>
                    <span className="text-xs bg-amber-950 text-amber-300 px-3 py-1 rounded-full border border-amber-700/50 font-bold">
                      مرحله اول
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                      <span className="text-slate-400 font-bold block">اطلاعات خریدار:</span>
                      <p className="text-slate-200 font-extrabold text-sm">{opportunity.companyName || opportunity.customerName}</p>
                      <p className="text-slate-300">رابط پروژه: {opportunity.customerName}</p>
                      <p className="text-slate-300 dir-ltr text-right">شماره تماس: {toPersianDigits(opportunity.phone || '—')}</p>
                    </div>

                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                      <span className="text-slate-400 font-bold block">شرح نیازمندی اولیه:</span>
                      <p className="text-slate-200 leading-relaxed">{opportunity.notes || 'استعلام قیمت چیلر تراکمی و تجهیزات تهویه مطبوع سالن‌های تولید'}</p>
                      <div className="pt-2">
                        <span className="text-slate-400">ارزش پیشنهادی اولیه: </span>
                        <span className="font-extrabold text-emerald-400 text-sm">{toPersianDigits(formatTomans(opportunity.value))} تومان</span>
                      </div>
                    </div>
                  </div>

                  {/* Embedded File Upload section right inside Stage 1 */}
                  <div className="pt-4 border-t border-slate-700/80 space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-amber-400" />
                      <span>پیوست فایل‌ها و اسناد مهندسی (نقشه‌ها، تصاویر، استعلام‌ها)</span>
                    </h4>
                    <OpportunityFileUpload
                      opportunityId={opportunity.id}
                      files={opportunity.files || []}
                      currentUser={currentUser}
                      onAddFile={onAddFile}
                      onDeleteFile={onDeleteFile}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setSelectedStage('pricing');
                        setActiveTab('workspace');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>ورود به مرحله بعدی: قیمت‌گذاری و شرایط</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: PRICING (قیمت‌گذاری و شرایط فروش - ادغام مرحله ۲ و ۳) */}
              {(selectedStage === 'pricing' || selectedStage === 'ceo_review' || selectedStage === 'internal_marketing') && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-wrap gap-2">
                    <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-400" />
                      <span>مرحله ۲: قیمت‌گذاری، تخفیف، گارانتی و شرایط فروش</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPricingModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>محاسبه قیمت اقلام</span>
                      </button>
                      <button
                        onClick={() => setShowApprovalModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>تنظیم مجوز مدیریت</span>
                      </button>
                    </div>
                  </div>

                  {/* Pricing & Financial Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 block font-bold">جمع ارزش اقلام:</span>
                      <span className="font-extrabold text-sm text-slate-100">
                        {toPersianDigits(formatTomans(opportunity.value))} تومان
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 block font-bold">تخفیف مصوب:</span>
                      <span className="font-extrabold text-sm text-emerald-400">
                        {toPersianDigits(opportunity.approvalData?.discountPercent ?? 5)}٪
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 block font-bold">هزینه حمل و نقل:</span>
                      <span className="font-extrabold text-sm text-cyan-300">
                        {opportunity.approvalData?.shippingCost
                          ? `${toPersianDigits(formatTomans(opportunity.approvalData.shippingCost))} تومان`
                          : 'نامشخص / صفر'}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 block font-bold">زمان ساخت و تحویل:</span>
                      <span className="font-extrabold text-sm text-blue-300">
                        {toPersianDigits(opportunity.approvalData?.executionTimeDays ?? 30)} روز کاری
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 block font-bold">اعتبار قیمت:</span>
                      <span className="font-extrabold text-sm text-purple-300">
                        {toPersianDigits(opportunity.approvalData?.priceValidityDays ?? 7)} روز کاری
                      </span>
                    </div>
                  </div>

                  {/* Warranty and Delivery Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 block font-bold">شرایط گارانتی و ضمانت‌نامه:</span>
                      <p className="font-bold text-amber-300">
                        {opportunity.approvalData?.warrantyTerms || '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب'}
                      </p>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-slate-400 block font-bold">محل تحویل تجهیزات:</span>
                      <p className="font-bold text-cyan-300">
                        {opportunity.approvalData?.deliveryLocationType === 'custom'
                          ? opportunity.approvalData.deliveryLocationCustom
                          : 'تحویل درب کارخانه (EXW)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedStage('technical_proposal');
                        setActiveTab('workspace');
                      }}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>ورود به مرحله بعدی: پیشنهاد فنی</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: TECHNICAL PROPOSAL (پیشنهاد فنی - مرحله ۳) */}
              {selectedStage === 'technical_proposal' && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-wrap gap-2">
                    <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                      <Award className="w-5 h-5 text-teal-400" />
                      <span>مرحله ۳: تنظیم پیشنهاد فنی و مشخصات مهندسی</span>
                    </h3>

                    <button
                      onClick={() => generateTechnicalProposalWordDoc(opportunity, companySettings)}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>دانلود پیشنهاد فنی Word (docx)</span>
                    </button>
                  </div>

                  {/* Technical Specs Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">ظرفیت برودتی / برقی:</label>
                      <input
                        type="text"
                        value={techCapacity}
                        onChange={(e) => setTechCapacity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">برند کمپرسور / تجهیزات:</label>
                      <input
                        type="text"
                        value={compressorBrand}
                        onChange={(e) => setCompressorBrand(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">نوع مبرد / استانداردهای زیست‌محیطی:</label>
                      <input
                        type="text"
                        value={refrigerantType}
                        onChange={(e) => setRefrigerantType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">توضیحات و دامنه کاری فنی:</label>
                    <textarea
                      rows={3}
                      value={techDescription}
                      onChange={(e) => setTechDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => generateTechnicalProposalWordDoc(opportunity, companySettings)}
                      className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تولید سند Word پیشنهاد فنی</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStage('proforma');
                        setActiveTab('workspace');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>ورود به مرحله بعدی: پیشنهاد مالی</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: FINANCIAL PROPOSAL (پیشنهاد مالی - مرحله ۴) */}
              {selectedStage === 'proforma' && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-wrap gap-2">
                    <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <span>مرحله ۴: صدور پیشنهاد مالی رسمی</span>
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowWordProposalModal(true)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>سازنده آنلاین فایل Word (فرم و تمپلیت)</span>
                      </button>

                      <button
                        onClick={() => generatePreInvoiceWordDoc(opportunity, companySettings)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>دانلود سریع Word (docx)</span>
                      </button>
                    </div>
                  </div>

                  {/* Financial Calculation Cards including Shipping */}
                  {(() => {
                    const itemsTotal = opportunity.value || 0;
                    const discountPercent = opportunity.approvalData?.discountPercent || 0;
                    const discountAmount = Math.round((itemsTotal * discountPercent) / 100);
                    const netSubtotal = itemsTotal - discountAmount;
                    const vatAmount = Math.round(netSubtotal * 0.1);
                    const shippingCost = opportunity.approvalData?.shippingCost || 0;
                    const grandTotal = netSubtotal + vatAmount + shippingCost;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
                        <div className="space-y-1">
                          <span className="text-slate-400 block font-bold">جمع اقلام:</span>
                          <span className="font-bold text-sm text-slate-200">
                            {toPersianDigits(formatTomans(itemsTotal))} تومان
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 block font-bold">مبلغ تخفیف ({toPersianDigits(discountPercent)}٪):</span>
                          <span className="font-bold text-sm text-emerald-400">
                            {toPersianDigits(formatTomans(discountAmount))} تومان
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 block font-bold">مالیات بر ارزش افزوده (۱۰٪):</span>
                          <span className="font-bold text-sm text-cyan-300">
                            {toPersianDigits(formatTomans(vatAmount))} تومان
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 block font-bold">هزینه حمل و نقل:</span>
                          <span className="font-bold text-sm text-amber-300">
                            {shippingCost > 0 ? `${toPersianDigits(formatTomans(shippingCost))} تومان` : 'رایگان / توافقی'}
                          </span>
                        </div>

                        <div className="space-y-1 bg-cyan-950/60 p-2.5 rounded-xl border border-cyan-800/80">
                          <span className="text-cyan-300 block font-black text-xs">جمع کل قابل پرداخت:</span>
                          <span className="font-extrabold text-base text-cyan-200 block">
                            {toPersianDigits(formatTomans(grandTotal))} تومان
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Catalog Selector */}
                  {productsCatalog.length > 0 && (
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-3">
                      <h4 className="font-bold text-xs text-cyan-300">انتخاب دستگاه از کاتالوگ محصولات شرکت:</h4>
                      <div className="flex items-center gap-3 flex-wrap">
                        <select
                          value={selectedCatalogId}
                          onChange={(e) => setSelectedCatalogId(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                        >
                          <option value="">-- انتخاب تجهیزات صنعتی از کاتالوگ --</option>
                          {productsCatalog.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name} ({formatTomans(prod.price)} تومان)
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={handleAddFromCatalog}
                          disabled={!selectedCatalogId}
                          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                        >
                          افزودن به لیست اقلام
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => generatePreInvoiceWordDoc(opportunity, companySettings)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>دانلود فایل Word پیشنهاد مالی</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStage('final_approval');
                        setActiveTab('workspace');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>ورود به مرحله بعدی: تایید نهایی و صدور رسمی</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 5: FINAL APPROVAL & SEND (تایید نهایی، مهر و ارسال - مرحله ۵) */}
              {(selectedStage === 'final_approval' || selectedStage === 'sent') && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-wrap gap-2">
                    <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      <span>مرحله ۵: تایید نهایی، درج مهر رسمی شرکت، صدور PDF و ارسال به مشتری</span>
                    </h3>
                    <span className="bg-emerald-950 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full border border-emerald-600/50">
                      دارای مهر و امضای رسمی
                    </span>
                  </div>

                  {/* PDF Printable & Stamped Preview Generator */}
                  <FinalStampedPdfGenerator
                    opportunity={opportunity}
                    companySettings={companySettings}
                  />

                  {/* Final Send Status Box */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 space-y-3 text-xs">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                      <span>فرصت فروش آماده ارسال به خریدار و صدور سند رسمی می‌باشد.</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      سند نهایی شامل پیش‌فاکتور مالی، پیشنهاد فنی، تخفیف مصوب و مهر و امضای رسمی شرکت واته تنظیم گردیده است.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: ITEMS & EQUIPMENT */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-inner space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-400" />
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                      جدول اقلام، دستگاه‌ها و استعلام‌های این فرصت فروش ({opportunity.items?.length || 0})
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowAddItemForm(!showAddItemForm)}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن قلم دستگاه جدید</span>
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
                      className="bg-slate-900 border border-teal-500/50 p-4 rounded-2xl space-y-3 overflow-hidden shadow-lg"
                    >
                      <h4 className="font-bold text-xs text-teal-300">افزودن دستگاه / قلم تجهیزات جدید:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-slate-400 block mb-1 font-bold">نام دستگاه / تجهیزات:</label>
                          <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="مثلا: چیلر تراکمی اسکرال ۵۰ تن"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1 font-bold">تعداد:</label>
                          <input
                            type="number"
                            min="1"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1 font-bold">قیمت واحد (تومان):</label>
                          <input
                            type="number"
                            value={newItemUnitPrice}
                            onChange={(e) => setNewItemUnitPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-bold"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1 font-bold">مشخصات فنی و استانداردها:</label>
                        <input
                          type="text"
                          value={newItemSpecs}
                          onChange={(e) => setNewItemSpecs(e.target.value)}
                          placeholder="مثلا: کمپرسور کوپلند، مبرد R410a، کندانسور مسی"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddItemForm(false)}
                          className="px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl"
                        >
                          انصراف
                        </button>
                        <button
                          type="submit"
                          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md"
                        >
                          ثبت قلم
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Items Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/60">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
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
                              <div className="font-extrabold text-slate-100">{item.name}</div>
                              {item.specs && <div className="text-[10px] text-slate-400 mt-0.5">{item.specs}</div>}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-200">
                              {toPersianDigits(item.quantity)} {item.unit}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-300">
                              {toPersianDigits(formatTomans(item.unitPrice))}
                            </td>
                            <td className="p-3 text-center font-black text-teal-400">
                              {toPersianDigits(formatTomans(item.totalPrice))}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            اقلام تفکیکی ثبت نشده است. ارزش کلی برآوردی: {toPersianDigits(formatTomans(opportunity.value))} تومان
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXECUTIVE APPROVAL DETAILS */}
          {activeTab === 'approval' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-indigo-900/50 rounded-2xl p-5 space-y-4 text-xs shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-slate-100">
                        مجوزها و پارامترهای تایید شده مدیرعامل (مهندس فتح‌پور)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        آخرین بروزرسانی: {opportunity.approvalData?.approvedAt || 'ثبت نشده'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md"
                  >
                    ویرایش مجوزها
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">درصد تخفیف مصوب:</span>
                    <span className="font-extrabold text-lg text-emerald-400">
                      {toPersianDigits(opportunity.approvalData?.discountPercent ?? 5)}٪
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">زمان اجرا و تحویل:</span>
                    <span className="font-extrabold text-sm text-blue-300">
                      {toPersianDigits(opportunity.approvalData?.executionTimeDays ?? 30)} روز کاری
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">مدت اعتبار قیمت:</span>
                    <span className="font-extrabold text-sm text-purple-300">
                      {toPersianDigits(opportunity.approvalData?.priceValidityDays ?? 7)} روز کاری
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">محل تحویل تجهیزات:</span>
                    <span className="font-extrabold text-sm text-cyan-300">
                      {opportunity.approvalData?.deliveryLocationType === 'custom'
                        ? opportunity.approvalData.deliveryLocationCustom
                        : 'تحویل درب کارخانه'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 block font-medium">شرایط گارانتی و ضمانت‌نامه:</span>
                  <p className="font-bold text-amber-300 text-sm">
                    {opportunity.approvalData?.warrantyTerms ||
                      '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب (هرکدام زودتر فرا برسد)'}
                  </p>
                </div>

                {opportunity.approvalData?.adminNotes && (
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <span className="text-slate-400 block font-medium">دستورات و ملاحظات مدیریتی:</span>
                    <p className="text-slate-200 leading-relaxed">{opportunity.approvalData.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS GENERATOR (WORD & PDF) */}
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

          {/* TAB 6: AUDIT LOGS & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-inner">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60 mb-3">
                  <History className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-100">
                    تاریخچه و سوابق تغییرات، تاییدات و گردش کار ({opportunity.history?.length || 0})
                  </h3>
                </div>

                {opportunity.history && opportunity.history.length > 0 ? (
                  <div className="space-y-3">
                    {opportunity.history.map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-900/80 border border-slate-700 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-slate-200">
                            <span className="text-teal-400">{log.performedByName}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700">
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
                  <p className="text-center py-8 text-xs text-slate-400">سابقه‌ای ثبت نشده است.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* CEO Approval Sub-modal */}
        <OpportunityApprovalModal
          opportunity={opportunity}
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onSaveApproval={onSaveApproval}
        />

        {/* Pricing Sub-modal */}
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
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <h3 className="font-extrabold text-base text-rose-300 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-rose-400" />
                  <span>بازگرداندن به مراحل قبلی</span>
                </h3>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">انتخاب مرحله مقصد:</label>
                  <select
                    value={rejectStageTarget}
                    onChange={(e) => setRejectStageTarget(e.target.value as OpportunityStage)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    {OPPORTUNITY_STAGES.slice(0, currentStageIndex).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.stepNumber}. {s.label} ({s.roleLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">دلیل بازگرداندن (توضیحات):</label>
                  <textarea
                    rows={3}
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="علت عدم تایید یا اصلاحات لازم..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleRejectStage}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    تایید بازگرداندن
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Word Proposal Builder Modal */}
        <WordProposalBuilderModal
          isOpen={showWordProposalModal}
          onClose={() => setShowWordProposalModal(false)}
          initialData={{
            doc_number: opportunity.number || `WQ-${opportunity.id.slice(-6)}`,
            customer_name: opportunity.companyName || opportunity.customerName,
            subject: opportunity.title,
            items: (opportunity.items || []).map((it) => ({
              id: it.id,
              item_name: it.name + (it.specs ? ` (${it.specs})` : ''),
              model: 'استاندارد',
              quantity: it.quantity,
              unit_price: it.unitPrice,
            })),
            shipping_cost: opportunity.approvalData?.shippingCost || 0,
            discount_percent: opportunity.approvalData?.discountPercent || 0,
            notes: opportunity.approvalData?.warrantyTerms || '',
          }}
        />

      </motion.div>
    </div>
  );
};
