import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { Deal, DealStage, Opportunity } from '../../types';
import { OpportunityDetailModal } from '../opportunities/OpportunityDetailModal';
import { NewOpportunityModal } from '../opportunities/NewOpportunityModal';
import { OPPORTUNITY_STAGES } from '../opportunities/OpportunityStageHeader';
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
  Search,
  Filter,
  Edit3,
  TrendingUp,
  BarChart3,
  ListFilter,
  Eye,
  FileText,
  User,
  Package,
  Sliders,
  Sparkles,
  Check,
  Send,
  AlertCircle,
  PieChart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCompactTomans, formatTomans, toPersianDigits } from '../../lib/utils';

export const DealsKanbanView: React.FC = () => {
  const {
    accessibleDeals,
    addDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    accessibleCustomers,
    users,
    currentUser,
    products,
    addProformaInvoice,
    addTask,
    opportunities,
    addOpportunity,
    updateOpportunityStage,
    addOpportunityFile,
    deleteOpportunityFile,
    saveOpportunityApprovalData,
    updateOpportunityPricing,
    addOpportunityItem,
    removeOpportunityItem,
    deleteOpportunity,
    settings,
  } = useCRMStore();

  // View state: workflow (8-stage advanced), kanban, list, or analytics
  const [viewMode, setViewMode] = useState<'workflow' | 'kanban' | 'list' | 'analytics'>('workflow');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [showNewOpportunityModal, setShowNewOpportunityModal] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Form State for Add/Edit Deal
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [value, setValue] = useState('1500000000'); // 1.5 Billion Tomans default HVAC deal
  const [stage, setStage] = useState<DealStage>('initial_contact');
  const [probability, setProbability] = useState<number>(30);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [assignedToUserId, setAssignedToUserId] = useState(currentUser?.id || 'user-2');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Column definitions for Sales Stages
  const columns: {
    id: DealStage;
    label: string;
    color: string;
    border: string;
    headerBg: string;
    badgeBg: string;
    icon: any;
    defaultProb: number;
  }[] = [
    {
      id: 'initial_contact',
      label: 'تماس اولیه و استعلام',
      color: 'text-indigo-700',
      border: 'border-indigo-200',
      headerBg: 'bg-indigo-50/80',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      icon: Clock,
      defaultProb: 20,
    },
    {
      id: 'negotiation',
      label: 'مذاکره و مشاوره فنی',
      color: 'text-purple-700',
      border: 'border-purple-200',
      headerBg: 'bg-purple-50/80',
      badgeBg: 'bg-purple-100 text-purple-800',
      icon: Sliders,
      defaultProb: 40,
    },
    {
      id: 'proposal',
      label: 'ارسال پیشنهاد / پیش‌فاکتور',
      color: 'text-sky-700',
      border: 'border-sky-200',
      headerBg: 'bg-sky-50/80',
      badgeBg: 'bg-sky-100 text-sky-800',
      icon: Send,
      defaultProb: 70,
    },
    {
      id: 'contract',
      label: 'عقد قرارداد و صدور چک',
      color: 'text-amber-700',
      border: 'border-amber-200',
      headerBg: 'bg-amber-50/80',
      badgeBg: 'bg-amber-100 text-amber-800',
      icon: FileText,
      defaultProb: 90,
    },
    {
      id: 'won',
      label: 'موفق شده (برنده نهایی)',
      color: 'text-emerald-700',
      border: 'border-emerald-200',
      headerBg: 'bg-emerald-50/80',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      icon: CheckCircle2,
      defaultProb: 100,
    },
    {
      id: 'lost',
      label: 'از دست رفته (لغو شده)',
      color: 'text-rose-700',
      border: 'border-rose-200',
      headerBg: 'bg-rose-50/80',
      badgeBg: 'bg-rose-100 text-rose-800',
      icon: XCircle,
      defaultProb: 0,
    },
  ];

  // Helper stage advances
  const stageSequence: DealStage[] = [
    'initial_contact',
    'negotiation',
    'proposal',
    'contract',
    'won',
  ];

  const getNextStage = (current: DealStage): DealStage | null => {
    const idx = stageSequence.indexOf(current);
    if (idx >= 0 && idx < stageSequence.length - 1) return stageSequence[idx + 1];
    return null;
  };

  const getPrevStage = (current: DealStage): DealStage | null => {
    const idx = stageSequence.indexOf(current);
    if (idx > 0) return stageSequence[idx - 1];
    return null;
  };

  // Filter deals
  const filteredDeals = accessibleDeals.filter((deal) => {
    if (stageFilter !== 'all' && deal.stage !== stageFilter) return false;
    if (assignedFilter !== 'all' && deal.assignedToUserId !== assignedFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = deal.title.toLowerCase().includes(q);
      const matchCust = (deal.customerName || '').toLowerCase().includes(q);
      const matchComp = (deal.companyName || '').toLowerCase().includes(q);
      const matchNotes = (deal.notes || '').toLowerCase().includes(q);
      return matchTitle || matchCust || matchComp || matchNotes;
    }

    return true;
  });

  // Calculate Key Metrics
  const totalValue = accessibleDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = accessibleDeals.reduce(
    (sum, d) => sum + (d.value * (d.probability || 0)) / 100,
    0
  );
  const wonDeals = accessibleDeals.filter((d) => d.stage === 'won');
  const wonTotalValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const openDealsCount = accessibleDeals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length;
  const winRate =
    accessibleDeals.length > 0
      ? Math.round((wonDeals.length / accessibleDeals.length) * 100)
      : 0;

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingDeal(null);
    setTitle('');
    if (accessibleCustomers.length > 0) {
      setCustomerId(accessibleCustomers[0].id);
      setCustomerName(accessibleCustomers[0].name);
      setCompanyName(accessibleCustomers[0].companyName);
    } else {
      setCustomerId('');
      setCustomerName('');
      setCompanyName('');
    }
    setValue('1500000000');
    setStage('initial_contact');
    setProbability(20);
    setExpectedCloseDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setAssignedToUserId(currentUser?.id || 'user-2');
    setSelectedProducts([]);
    setNotes('');
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setTitle(deal.title);
    setCustomerId(deal.customerId);
    setCustomerName(deal.customerName);
    setCompanyName(deal.companyName);
    setValue(deal.value.toString());
    setStage(deal.stage);
    setProbability(deal.probability);
    setExpectedCloseDate(deal.expectedCloseDate);
    setAssignedToUserId(deal.assignedToUserId);
    setSelectedProducts(deal.products || []);
    setNotes(deal.notes || '');
    setShowAddEditModal(true);
  };

  const handleCustomerChange = (cId: string) => {
    setCustomerId(cId);
    const cust = accessibleCustomers.find((c) => c.id === cId);
    if (cust) {
      setCustomerName(cust.name);
      setCompanyName(cust.companyName);
    }
  };

  const handleStageChangeInForm = (newStage: DealStage) => {
    setStage(newStage);
    const colCfg = columns.find((c) => c.id === newStage);
    if (colCfg) {
      setProbability(colCfg.defaultProb);
    }
  };

  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const numericVal = parseInt(value) || 0;

    if (editingDeal) {
      updateDeal(editingDeal.id, {
        title,
        customerId,
        customerName,
        companyName,
        value: numericVal,
        stage,
        probability,
        expectedCloseDate,
        assignedToUserId,
        products: selectedProducts,
        notes,
      });
    } else {
      addDeal({
        title,
        customerId,
        customerName,
        companyName,
        value: numericVal,
        stage,
        probability,
        expectedCloseDate,
        assignedToUserId,
        products: selectedProducts,
        notes,
      });
    }

    setShowAddEditModal(false);
  };

  // Quick Action: Convert Deal to Proforma Invoice
  const handleConvertToProforma = (deal: Deal) => {
    const subtotal = deal.value;
    const taxRate = 10;
    const taxAmount = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + taxAmount;

    addProformaInvoice({
      invoiceType: 'sale',
      number: `WQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: deal.customerId,
      customerName: deal.customerName,
      companyName: deal.companyName,
      phone: '۰۲۱-۸۸۸۸۸۸۸۸',
      address: 'تهران، شهرک صنعتی',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: `item-${Date.now()}`,
          productId: 'p-1',
          description: `تجهیزات تهویه مطبوع پروژه ${deal.title}`,
          quantity: 1,
          unit: 'دستگاه',
          unitPrice: deal.value,
          discountPercent: 0,
          totalPrice: deal.value,
        },
      ],
      subtotal,
      discountTotal: 0,
      taxRate,
      taxAmount,
      grandTotal,
      status: 'pending',
      termsAndConditions: 'اعتبار پیش‌فاکتور ۱۵ روز کاری می‌باشد. پیش‌پرداخت ۵۰٪ در زمان ثبت سفارش.',
      assignedToUserId: currentUser?.id || 'user-1',
      dealId: deal.id,
    });

    alert(`پیش‌فاکتور مربوط به پروژه «${deal.title}» با موفقیت صادر گردید.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn dir-rtl">
      {/* Top Header & New Opportunity Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <KanbanSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              مدیریت فرایند فروش و فرصت‌های تجاری (Sales Pipeline)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              رهگیری مراحل فروش، پیش‌بینی ارزش وزنی قراردادهای چیلر، هواساز و سیستم‌های تهویه مطبوع
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            onClick={() => setShowNewOpportunityModal(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف فرصت فروش جدید</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">حجم کل فرصت‌های قیف فروش</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatCompactTomans(totalValue)}</p>
            <p className="text-[11px] text-slate-400 mt-1">{toPersianDigits(accessibleDeals.length)} پروژه فعال</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Weighted Pipeline Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">ارزش تخمینی وزنی (احتمال)</p>
            <p className="text-lg font-bold text-indigo-600 mt-1">{formatCompactTomans(weightedValue)}</p>
            <p className="text-[11px] text-indigo-600/80 mt-1">بر مبنای درصد شانس موفقیت</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Won Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">قراردادهای موفق بسته شده</p>
            <p className="text-lg font-bold text-emerald-600 mt-1">{formatCompactTomans(wonTotalValue)}</p>
            <p className="text-[11px] text-emerald-600/80 mt-1">{toPersianDigits(wonDeals.length)} پروژه موفق شده</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">نرخ تبدیل موفقیت فروش</p>
            <p className="text-lg font-bold text-sky-600 mt-1">{toPersianDigits(winRate)}٪</p>
            <p className="text-[11px] text-sky-600/80 mt-1">{toPersianDigits(openDealsCount)} پروژه در حال پیگیری</p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* View Switchers & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
            <button
              onClick={() => setViewMode('workflow')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'workflow'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>چرخه ۸ مرحله‌ای فروش و تاییدات</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
              <span>بورد بصری کانبان</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>نمای جدولی و لیستی</span>
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>تحلیل قیف فروش</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در عنوان پروژه، خریدار، شرکت..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">فیلترهای پیشرفته:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Stage filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">همه مراحل فروش</option>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Assigned filter */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">همه کارشناسان فروش</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.department})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 0: 8-STAGE WORKFLOW (ADVANCED OPPORTUNITIES) */}
      {viewMode === 'workflow' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-300 font-extrabold text-xs px-3 py-1 rounded-full border border-purple-500/30">
                  فرایند پیشرفته شرکت واته
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                  ۸ مرحله تایید و گردش کار
                </span>
              </div>
              <h2 className="font-black text-xl sm:text-2xl tracking-tight">
                چرخه تاییدات و گردش مستندات فرصت‌های فروش
              </h2>
              <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed">
                مدیریت کامل فایل‌های پیوست (عکس، ویدیو، PDF، فایل‌های مهندسی)، تعیین تخفیف و شرایط گارانتی توسط مدیرعامل، بازارگردانی و صدور سند نهایی با مهر رسمی.
              </p>
            </div>

            <button
              onClick={() => setShowNewOpportunityModal(true)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت فرصت فروش جدید</span>
            </button>
          </div>

          {opportunities.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-extrabold text-base text-slate-800">هیچ فرصت فروشی در چرخه ۸ مرحله‌ای ثبت نشده است.</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                برای شروع، اطلاعات فرصت فروش جدید را با فرم واقعی ثبت نمایید.
              </p>
              <button
                onClick={() => setShowNewOpportunityModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                افزودن فرم جدید فرصت فروش
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opp) => {
                const stageInfo = OPPORTUNITY_STAGES.find((s) => s.id === opp.stage);

                return (
                  <motion.div
                    key={opp.id}
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedOpp(opp)}
                    className="bg-white border border-slate-200/80 hover:border-purple-500/60 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                        شماره {toPersianDigits(opp.number || `WQ-${opp.id.slice(-6)}`)}
                      </span>

                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                        {stageInfo?.stepNumber}. {stageInfo?.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                        {opp.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{opp.companyName || opp.customerName}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">ارزش اولیه:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {toPersianDigits(formatTomans(opp.value))} تومان
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1 font-semibold">
                        <FileText className="w-3.5 h-3.5 text-purple-500" />
                        <span>{toPersianDigits(opp.files?.length || 0)} فایل پیوست</span>
                      </span>

                      <span className="text-purple-600 font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>بررسی و اقدام</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 items-start min-h-[600px] dir-rtl">
          {columns.map((col) => {
            const colDeals = filteredDeals.filter((d) => d.stage === col.id);
            const colTotalVal = colDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col gap-3 min-h-[520px]"
              >
                {/* Column Header */}
                <div
                  className={`p-3 rounded-xl border ${col.border} ${col.headerBg} flex items-center justify-between shadow-xs`}
                >
                  <div className="flex items-center gap-2">
                    <col.icon className={`w-4 h-4 ${col.color}`} />
                    <div>
                      <h3 className={`text-xs font-bold ${col.color}`}>{col.label}</h3>
                      <p className="text-[11px] font-extrabold text-slate-800 mt-0.5">
                        {formatCompactTomans(colTotalVal)}
                      </p>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-white text-slate-800 text-xs font-extrabold flex items-center justify-center border border-slate-200 shadow-2xs">
                    {toPersianDigits(colDeals.length)}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[650px] pl-0.5">
                  {colDeals.length === 0 ? (
                    <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs font-medium p-4 text-center">
                      <col.icon className="w-6 h-6 mb-1 opacity-30" />
                      <span>هیچ فرصتی در این مرحله وجود ندارد</span>
                    </div>
                  ) : (
                    colDeals.map((deal) => {
                      const nextSt = getNextStage(deal.stage);
                      const prevSt = getPrevStage(deal.stage);
                      const assignee = users.find((u) => u.id === deal.assignedToUserId);

                      return (
                        <motion.div
                          key={deal.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-all text-right group space-y-2.5"
                        >
                          {/* Title & Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">
                              {deal.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => {
                                  setSelectedDeal(deal);
                                  setShowDetailModal(true);
                                }}
                                className="p-1 text-slate-400 hover:text-purple-600 rounded-md hover:bg-purple-50 cursor-pointer"
                                title="مشاهده جزئیات کامل"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(deal)}
                                className="p-1 text-slate-400 hover:text-sky-600 rounded-md hover:bg-sky-50 cursor-pointer"
                                title="ویرایش فرصت"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('آیا از حذف این فرصت فروش اطمینان دارید؟')) {
                                    deleteDeal(deal.id);
                                  }
                                }}
                                className="p-1 text-slate-300 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Customer Name */}
                          <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">{deal.companyName || deal.customerName}</span>
                          </div>

                          {/* Value & Probability Badge */}
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-extrabold text-emerald-700">
                              {formatTomans(deal.value)}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {toPersianDigits(deal.probability)}٪ احتمال
                            </span>
                          </div>

                          {/* Close Date & Assignee */}
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className="font-mono">{deal.expectedCloseDate}</span>
                            </div>
                            {assignee && (
                              <span className="text-slate-600 font-medium truncate max-w-[100px]">
                                {assignee.name}
                              </span>
                            )}
                          </div>

                          {/* Stage Navigation & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <div className="flex items-center gap-1">
                              {prevSt && (
                                <button
                                  onClick={() => updateDealStage(deal.id, prevSt)}
                                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                  title="مرحله قبل"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {nextSt && (
                                <button
                                  onClick={() => updateDealStage(deal.id, nextSt)}
                                  className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                                  title="مرحله بعد"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Convert to Proforma */}
                            <button
                              onClick={() => handleConvertToProforma(deal)}
                              className="text-[10px] font-bold text-sky-700 hover:bg-sky-50 px-2 py-1 rounded-md transition-all cursor-pointer inline-flex items-center gap-1"
                              title="صدور سریع پیش‌فاکتور"
                            >
                              <FileText className="w-3 h-3" />
                              <span>صدور پیش‌فاکتور</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">عنوان فرصت فروش</th>
                  <th className="p-3.5">مشتری / شرکت</th>
                  <th className="p-3.5">مرحلۀ فروش</th>
                  <th className="p-3.5">ارزش قرارداد (تومان)</th>
                  <th className="p-3.5">شانس موفقیت</th>
                  <th className="p-3.5">تاریخ پیش‌بینی اختتام</th>
                  <th className="p-3.5">کارشناس مسئول</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      هیچ فرصت فروشی پیدا نشد.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const colCfg = columns.find((c) => c.id === deal.stage) || columns[0];
                    const assignee = users.find((u) => u.id === deal.assignedToUserId);

                    return (
                      <tr key={deal.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">
                          <div>{deal.title}</div>
                          {deal.notes && (
                            <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs mt-0.5">
                              {deal.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-teal-700">{deal.companyName}</div>
                          <div className="text-[11px] text-slate-400">{deal.customerName}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${colCfg.badgeBg}`}
                          >
                            <colCfg.icon className="w-3 h-3" />
                            <span>{colCfg.label}</span>
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-emerald-700 font-mono">
                          {formatTomans(deal.value)}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[11px]">
                              {toPersianDigits(deal.probability)}٪
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{deal.expectedCloseDate}</td>
                        <td className="p-3.5">{assignee?.name || '-'}</td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedDeal(deal);
                                setShowDetailModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                              title="مشاهده جزئیات"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(deal)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                              title="ویرایش"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleConvertToProforma(deal)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="صدور پیش‌فاکتور"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('حذف پروژه؟')) deleteDeal(deal.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: SALES FUNNEL ANALYTICS */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Breakdown Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>توزیع ارزش پروژه‌ها در مراحل مختلف فروش</span>
            </h3>

            <div className="space-y-3 pt-2">
              {columns.map((col) => {
                const colDeals = accessibleDeals.filter((d) => d.stage === col.id);
                const colVal = colDeals.reduce((sum, d) => sum + d.value, 0);
                const percent = totalValue > 0 ? Math.round((colVal / totalValue) * 100) : 0;

                return (
                  <div key={col.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{col.label}</span>
                      <span className="font-mono text-slate-500">
                        {formatCompactTomans(colVal)} ({toPersianDigits(percent)}٪)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          col.id === 'won'
                            ? 'bg-emerald-500'
                            : col.id === 'lost'
                            ? 'bg-rose-400'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Opportunities Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>بزرگترین فرصت‌های تجاری و پروژه‌های کلیدی در جریان</span>
            </h3>

            <div className="space-y-3 pt-2">
              {[...accessibleDeals]
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((deal, idx) => (
                  <div
                    key={deal.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                        {toPersianDigits(idx + 1)}
                      </span>
                      <div>
                        <div className="font-bold text-slate-800">{deal.title}</div>
                        <div className="text-[11px] text-teal-700">{deal.companyName}</div>
                      </div>
                    </div>
                    <div className="text-left font-mono font-bold text-emerald-700">
                      {formatTomans(deal.value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DEAL MODAL */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 my-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-purple-700">
                  <KanbanSquare className="w-5 h-5" />
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    {editingDeal ? 'ویرایش اطلاعات فرصت فروش' : 'تعریف و ثبت فرصت فروش جدید'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddEditModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDeal} className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    عنوان پروژه / فرصت فروش *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: پروژه چیلر و هواسازهای کلین‌روم شرکت داروسازی..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Customer Selection */}
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                  <label className="block font-bold text-slate-800">انتخاب خریدار مربوطه *</label>
                  <select
                    value={customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    {accessibleCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} - {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value & Stage Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ارزش برآوردی قرارداد (تومان) *
                    </label>
                    <input
                      type="number"
                      required
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-700"
                    />
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      {formatTomans(parseInt(value) || 0)}
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مرحلۀ فروش اولیه</label>
                    <select
                      value={stage}
                      onChange={(e) => handleStageChangeInForm(e.target.value as DealStage)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Probability Slider & Close Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">درصد شانس موفقیت</label>
                      <span className="font-mono font-bold text-purple-700">
                        {toPersianDigits(probability)}٪
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={probability}
                      onChange={(e) => setProbability(parseInt(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      تاریخ پیش‌بینی اختتام
                    </label>
                    <input
                      type="date"
                      required
                      value={expectedCloseDate}
                      onChange={(e) => setExpectedCloseDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Assigned Sales Specialist */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    کارشناس مسئول پروژه
                  </label>
                  <select
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    توضیحات و الزامات فنی پروژه
                  </label>
                  <textarea
                    rows={3}
                    placeholder="مشخصات ظرفیت برودتی، نوع گاز مبرد، شرایط تحویل و پرداخت..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingDeal ? 'ذخیره تغییرات' : 'ثبت فرصت فروش'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL VIEW MODAL */}
      <AnimatePresence>
        {showDetailModal && selectedDeal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 p-5 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <KanbanSquare className="w-5 h-5" />
                  <h3 className="font-bold text-slate-800 text-sm">شناسنامه پروژه و فرصت تجاری</h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">عنوان پروژه:</span>
                  <h2 className="text-base font-extrabold text-slate-800">{selectedDeal.title}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block mb-0.5">مشتری / شرکت:</span>
                    <span className="font-bold text-teal-700">{selectedDeal.companyName}</span>
                    <span className="text-[11px] text-slate-500 block">({selectedDeal.customerName})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">ارزش تخمینی قرارداد:</span>
                    <span className="font-extrabold text-emerald-700 font-mono text-sm">
                      {formatTomans(selectedDeal.value)}
                    </span>
                  </div>
                </div>

                {/* Progress Pipeline bar */}
                <div>
                  <span className="text-slate-500 font-bold block mb-2">مراحل فرایند فروش:</span>
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                    {stageSequence.map((st, i) => {
                      const curIdx = stageSequence.indexOf(selectedDeal.stage);
                      const isPassed = i <= curIdx;
                      const isCurrent = i === curIdx;

                      return (
                        <div
                          key={st}
                          className={`p-1.5 rounded-lg border font-bold transition-all ${
                            isCurrent
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : isPassed
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {columns.find((c) => c.id === st)?.label.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedDeal.notes && (
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">یادداشت‌ها و توضیحات:</span>
                    <p className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-slate-700 leading-relaxed">
                      {selectedDeal.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleConvertToProforma(selectedDeal);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>صدور پیش‌فاکتور فروش</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          onSavePricing={(pricingData) => {
            updateOpportunityPricing(selectedOpp.id, pricingData);
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

      {/* New Opportunity Form Modal */}
      <NewOpportunityModal
        isOpen={showNewOpportunityModal}
        onClose={() => setShowNewOpportunityModal(false)}
        onSubmit={(data) => {
          addOpportunity({
            title: data.title,
            companyName: data.companyName,
            customerName: data.customerName,
            phone: data.phone,
            value: data.value,
            createdAt: data.jalaliDate,
            notes: data.notes,
            files: data.files,
            items: data.items,
          });
        }}
      />
    </div>
  );
};
