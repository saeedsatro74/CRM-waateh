import React, { useState, useEffect } from 'react';
import { useCRMStore } from '../../lib/store';
import { ProformaInvoice, ProformaItem, ProformaStatus, ProformaType } from '../../types';
import { WordProposalBuilderModal } from '../opportunities/WordProposalBuilderModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  FileCheck,
  AlertCircle,
  X,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Check,
  RefreshCw,
  Award,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface ProformaInvoicesViewProps {
  defaultType?: ProformaType;
}

export const ProformaInvoicesView: React.FC<ProformaInvoicesViewProps> = ({ defaultType = 'sale' }) => {
  const {
    proformaInvoices,
    accessibleCustomers: customers,
    products,
    currentUser,
    users,
    settings,
    addProformaInvoice,
    updateProformaInvoice,
    updateProformaStatus,
    deleteProformaInvoice,
  } = useCRMStore();

  const [activeType, setActiveType] = useState<ProformaType>(defaultType);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<ProformaInvoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isWordProposalModalOpen, setIsWordProposalModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ProformaInvoice | null>(null);

  useEffect(() => {
    setActiveType(defaultType);
  }, [defaultType]);

  // Form State
  const [formData, setFormData] = useState<{
    invoiceType: ProformaType;
    number: string;
    customerId: string;
    customerName: string;
    companyName: string;
    phone: string;
    address: string;
    issueDate: string;
    validUntil: string;
    items: Omit<ProformaItem, 'id'>[];
    termsAndConditions: string;
    status: ProformaStatus;
  }>({
    invoiceType: 'sale',
    number: '',
    customerId: '',
    customerName: '',
    companyName: '',
    phone: '',
    address: '',
    issueDate: new Date().toLocaleDateString('fa-IR'),
    validUntil: new Date(Date.now() + 14 * 86400000).toLocaleDateString('fa-IR'),
    items: [
      {
        description: '',
        quantity: 1,
        unit: 'دستگاه',
        unitPrice: 0,
        discountPercent: 0,
        totalPrice: 0,
      },
    ],
    termsAndConditions: '',
    status: 'draft',
  });

  const formatToman = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const statusBadges: Record<ProformaStatus, { label: string; bg: string; text: string; icon: any }> = {
    draft: { label: 'پیش‌نویس', bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
    pending: { label: 'در انتظار تایید', bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertCircle },
    sent: { label: 'ارسال شده', bg: 'bg-sky-100', text: 'text-sky-800', icon: Send },
    approved: { label: 'تایید نهایی', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2 },
    converted: { label: 'تبدیل شده به فاکتور/قرارداد', bg: 'bg-purple-100', text: 'text-purple-800', icon: FileCheck },
    rejected: { label: 'باطله / لغو شده', bg: 'bg-rose-100', text: 'text-rose-800', icon: X },
  };

  const typeInvoices = proformaInvoices.filter((inv) => (inv.invoiceType || 'sale') === activeType);

  const filteredInvoices = typeInvoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals for stats bar
  const totalValue = typeInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const approvedCount = typeInvoices.filter((i) => i.status === 'approved' || i.status === 'converted').length;
  const pendingCount = typeInvoices.filter((i) => i.status === 'pending' || i.status === 'draft').length;
  const sentCount = typeInvoices.filter((i) => i.status === 'sent').length;

  const isPurchase = activeType === 'purchase';

  const handleOpenNewModal = () => {
    const prefix = isPurchase ? 'PQ' : 'WQ';
    const countOfType = proformaInvoices.filter((i) => (i.invoiceType || 'sale') === activeType).length;
    const nextNum = `${prefix}-1403-${(isPurchase ? 2000 : 1000) + countOfType + 1}`;

    setEditingInvoice(null);
    setFormData({
      invoiceType: activeType,
      number: nextNum,
      customerId: '',
      customerName: '',
      companyName: '',
      phone: '',
      address: '',
      issueDate: new Date().toLocaleDateString('fa-IR'),
      validUntil: new Date(Date.now() + 14 * 86400000).toLocaleDateString('fa-IR'),
      items: [
        {
          description: '',
          quantity: 1,
          unit: isPurchase ? 'عدد' : 'دستگاه',
          unitPrice: 0,
          discountPercent: 0,
          totalPrice: 0,
        },
      ],
      termsAndConditions: isPurchase
        ? 'تسویه حساب طبق توافق با تامین‌کننده (۳۰٪ نقد و ۷۰٪ چک صیادی ۶۰ روزه). تحویل درب کارخانه فروشنده.'
        : 'پیش‌پرداخت ۵۰٪ هنگام عقد قرارداد، ۴۰٪ پس از ساخت و تحویل، ۱۰٪ پس از نصب و تحویل موقت. گارانتی ۲۴ ماهه کمپرسور و ۱۲ ماه سایر قطعات.',
      status: 'draft',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (inv: ProformaInvoice) => {
    setEditingInvoice(inv);
    setFormData({
      invoiceType: inv.invoiceType || 'sale',
      number: inv.number,
      customerId: inv.customerId,
      customerName: inv.customerName,
      companyName: inv.companyName,
      phone: inv.phone,
      address: inv.address,
      issueDate: inv.issueDate,
      validUntil: inv.validUntil,
      items: inv.items.map((it) => ({
        productId: it.productId,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent || 0,
        totalPrice: it.totalPrice,
      })),
      termsAndConditions: inv.termsAndConditions,
      status: inv.status,
    });
    setIsFormModalOpen(true);
  };

  const handleCustomerSelect = (cust: any) => {
    if (!cust) return;
    setFormData((prev) => ({
      ...prev,
      customerId: cust.id,
      customerName: cust.name,
      companyName: cust.companyName,
      phone: cust.phone,
      address: cust.address,
    }));
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const newItems = [...formData.items];
    const item = newItems[index];
    item.productId = prod.id;
    item.description = prod.name + (prod.description ? ` (${prod.description})` : '');
    item.unitPrice = prod.price;
    item.unit = prod.unit || 'دستگاه';
    const rawTotal = item.quantity * item.unitPrice;
    item.totalPrice = rawTotal - rawTotal * ((item.discountPercent || 0) / 100);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const rawTotal = qty * price;
    item.totalPrice = Math.max(0, rawTotal - rawTotal * (disc / 100));

    newItems[index] = item;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          unit: isPurchase ? 'عدد' : 'دستگاه',
          unitPrice: 0,
          discountPercent: 0,
          totalPrice: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Form total calculation
  const subtotal = formData.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const discountTotal = formData.items.reduce(
    (s, it) => s + it.quantity * it.unitPrice * ((it.discountPercent || 0) / 100),
    0
  );
  const subtotalAfterDiscount = subtotal - discountTotal;
  const taxAmount = Math.round(subtotalAfterDiscount * 0.1); // 10% VAT
  const grandTotal = subtotalAfterDiscount + taxAmount;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName && !formData.customerName) {
      alert(isPurchase ? 'لطفاً نام تامین‌کننده یا نام شرکت فروشنده را وارد کنید.' : 'لطفاً نام خریدار یا نام شرکت را وارد کنید.');
      return;
    }

    const itemsWithId: ProformaItem[] = formData.items.map((it, idx) => ({
      ...it,
      id: `item-${idx}-${Date.now()}`,
    }));

    if (editingInvoice) {
      updateProformaInvoice(editingInvoice.id, {
        invoiceType: formData.invoiceType,
        number: formData.number,
        customerId: formData.customerId,
        customerName: formData.customerName,
        companyName: formData.companyName,
        phone: formData.phone,
        address: formData.address,
        issueDate: formData.issueDate,
        validUntil: formData.validUntil,
        items: itemsWithId,
        subtotal,
        discountTotal,
        taxRate: 10,
        taxAmount,
        grandTotal,
        status: formData.status,
        termsAndConditions: formData.termsAndConditions,
      });
    } else {
      addProformaInvoice({
        invoiceType: formData.invoiceType,
        number: formData.number || `${isPurchase ? 'PQ' : 'WQ'}-1403-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: formData.customerId || (isPurchase ? 'supplier-direct' : 'cust-direct'),
        customerName: formData.customerName || (isPurchase ? 'تامین‌کننده محترم' : 'خریدار محترم'),
        companyName: formData.companyName || (isPurchase ? 'فروشنده مستقیم' : 'مشتری مستقیم'),
        phone: formData.phone,
        address: formData.address,
        issueDate: formData.issueDate,
        validUntil: formData.validUntil,
        items: itemsWithId,
        subtotal,
        discountTotal,
        taxRate: 10,
        taxAmount,
        grandTotal,
        status: formData.status,
        termsAndConditions: formData.termsAndConditions,
        assignedToUserId: currentUser?.id || 'user-1',
      });
    }

    setIsFormModalOpen(false);
  };

  const handleOpenPrint = (inv: ProformaInvoice) => {
    setSelectedInvoice(inv);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Type Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isPurchase ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'}`}>
            {isPurchase ? <ShoppingBag className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isPurchase ? 'پیش‌فاکتورهای خرید (تامین‌کنندگان و قطعات)' : 'پیش‌فاکتورهای فروش (تهویه واته)'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPurchase
                ? 'مدیریت و ثبت پیش‌فاکتورهای دریافتی از تامین‌کنندگان مواد اولیه، کویل، مس، کمپرسور و قطعات'
                : 'مدیریت، صدور و نسخه چاپی رسمی پیش‌فاکتور کالا و خدمات سیستم‌های تهویه مطبوع به مشتریان'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start lg:self-auto">
          <button
            onClick={() => setActiveType('sale')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeType === 'sale'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>پیش‌فاکتور فروش</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-normal">
              {proformaInvoices.filter((i) => (i.invoiceType || 'sale') === 'sale').length}
            </span>
          </button>

          <button
            onClick={() => setActiveType('purchase')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeType === 'purchase'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>پیش‌فاکتور خرید</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-normal">
              {proformaInvoices.filter((i) => i.invoiceType === 'purchase').length}
            </span>
          </button>

          <button
            onClick={() => setIsWordProposalModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 px-3.5 py-2 rounded-lg shadow-xs transition-all text-xs cursor-pointer mr-1"
          >
            <Edit3 className="w-4 h-4" />
            <span>تولید فایل Word پیشنهاد</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className={`inline-flex items-center justify-center gap-1.5 font-bold text-white px-4 py-2 rounded-lg shadow-xs transition-all text-xs cursor-pointer mr-1 ${
              isPurchase ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isPurchase ? 'ثبت پیش‌فاکتور خرید' : 'صدور پیش‌فاکتور فروش'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {isPurchase ? 'مجموع ارزش کل خریدها' : 'مجموع ارزش پیش‌فاکتورهای فروش'}
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatToman(totalValue)} <span className="text-xs font-normal text-slate-500">تومان</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{typeInvoices.length} فقره ثبت شده</p>
          </div>
          <div className={`p-3 rounded-xl ${isPurchase ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
            {isPurchase ? <ShoppingBag className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">تایید شده / نهایی</p>
            <p className="text-lg font-bold text-emerald-600 mt-1">{approvedCount} فقره</p>
            <p className="text-[11px] text-emerald-600/80 mt-1">
              {isPurchase ? 'آماده پرداخت و تحویل کالا' : 'آماده اجرا و عقد قرارداد'}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {isPurchase ? 'دریافت شده / در حال بررسی' : 'ارسال شده به مشتری'}
            </p>
            <p className="text-lg font-bold text-sky-600 mt-1">{sentCount} فقره</p>
            <p className="text-[11px] text-sky-600/80 mt-1">
              {isPurchase ? 'بررسی استعلام قیمت تامین‌کننده' : 'در انتظار بازخورد خریدار'}
            </p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">پیش‌نویس / در انتظار تایید</p>
            <p className="text-lg font-bold text-amber-600 mt-1">{pendingCount} فقره</p>
            <p className="text-[11px] text-amber-600/80 mt-1">نیازمند بررسی کارشناس بازرگانی</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              isPurchase
                ? 'جستجو بر اساس شماره، نام تامین‌کننده، شرکت فروشنده...'
                : 'جستجو بر اساس شماره، نام شرکت، خریدار...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          {[
            { id: 'all', label: 'همه' },
            { id: 'draft', label: 'پیش‌نویس' },
            { id: 'pending', label: 'در انتظار' },
            { id: 'sent', label: 'ارسال/دریافت شده' },
            { id: 'approved', label: 'تایید شده' },
            { id: 'converted', label: 'تبدیل به فاکتور' },
            { id: 'rejected', label: 'باطله' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                statusFilter === st.id
                  ? isPurchase
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">شماره پیش‌فاکتور</th>
                <th className="p-3.5">{isPurchase ? 'تامین‌کننده / شرکت فروشنده' : 'خریدار / شرکت'}</th>
                <th className="p-3.5">تاریخ صدور / اعتبار</th>
                <th className="p-3.5">مبلغ کل (تومان)</th>
                <th className="p-3.5">کارشناس مسئول</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    {isPurchase
                      ? 'پیش‌فاکتور خریدی با این مشخصات یافت نشد.'
                      : 'پیش‌فاکتور فروشی با این مشخصات یافت نشد.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const badge = statusBadges[inv.status] || statusBadges.draft;
                  const BadgeIcon = badge.icon;
                  const assignedUser = users.find((u) => u.id === inv.assignedToUserId);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-teal-700">{inv.number}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{inv.companyName || inv.customerName}</div>
                        {inv.companyName && inv.customerName && (
                          <div className="text-[11px] text-slate-400">رابط: {inv.customerName}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div>{inv.issueDate}</div>
                        <div className="text-[11px] text-slate-400">تا: {inv.validUntil}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{formatToman(inv.grandTotal)}</td>
                      <td className="p-3.5 text-slate-600">{assignedUser ? assignedUser.name : 'کارشناس واته'}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${badge.bg} ${badge.text}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPrint(inv)}
                            title="مشاهده و چاپ رسمی پیش‌فاکتور"
                            className="p-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(inv)}
                            title="ویرایش پیش‌فاکتور"
                            className="p-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <select
                            value={inv.status}
                            onChange={(e) => updateProformaStatus(inv.id, e.target.value as ProformaStatus)}
                            className="text-[11px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                          >
                            <option value="draft">پیش‌نویس</option>
                            <option value="pending">در انتظار</option>
                            <option value="sent">{isPurchase ? 'دریافت شده' : 'ارسال به مشتری'}</option>
                            <option value="approved">تایید نهایی</option>
                            <option value="converted">تبدیل به فاکتور</option>
                            <option value="rejected">باطل</option>
                          </select>

                          <button
                            onClick={() => {
                              if (confirm('آیا از حذف این پیش‌فاکتور اطمینان دارید؟')) {
                                deleteProformaInvoice(inv.id);
                              }
                            }}
                            title="حذف پیش‌فاکتور"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Modal: Form to Create / Edit Pre-Invoice */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 my-auto overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {formData.invoiceType === 'purchase' ? (
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                ) : (
                  <FileText className="w-5 h-5 text-teal-600" />
                )}
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  {editingInvoice
                    ? formData.invoiceType === 'purchase'
                      ? 'ویرایش پیش‌فاکتور خرید'
                      : 'ویرایش پیش‌فاکتور فروش'
                    : formData.invoiceType === 'purchase'
                    ? 'ثبت پیش‌فاکتور خرید جدید (تامین‌کنندگان)'
                    : 'صدور پیش‌فاکتور فروش جدید (تهویه واته)'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Top Row: Type Selection & Invoicing Details */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border ${
                  formData.invoiceType === 'purchase'
                    ? 'bg-amber-50/40 border-amber-100'
                    : 'bg-teal-50/40 border-teal-100'
                }`}
              >
                <div className="sm:col-span-3 flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-700">نوع پیش‌فاکتور:</span>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="sale"
                        checked={formData.invoiceType === 'sale'}
                        onChange={() => setFormData({ ...formData, invoiceType: 'sale' })}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>پیش‌فاکتور فروش (به مشتری)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="purchase"
                        checked={formData.invoiceType === 'purchase'}
                        onChange={() => setFormData({ ...formData, invoiceType: 'purchase' })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>پیش‌فاکتور خرید (از تامین‌کننده)</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {formData.invoiceType === 'purchase'
                      ? 'انتخاب تامین‌کننده / فروشنده از سیستم:'
                      : 'انتخاب مشتری از سیستم (اختیاری):'}
                  </label>
                  <select
                    onChange={(e) => {
                      const cust = customers.find((c) => c.id === e.target.value);
                      handleCustomerSelect(cust);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">
                      {formData.invoiceType === 'purchase'
                        ? '-- انتخاب از تامین‌کنندگان --'
                        : '-- انتخاب از مشتریان ثبت‌شده --'}
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} - {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">شماره پیش‌فاکتور *</label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {formData.invoiceType === 'purchase'
                      ? 'نام شرکت / تامین‌کننده فروشنده *'
                      : 'نام شرکت / خریدار *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formData.invoiceType === 'purchase'
                        ? 'مثال: شرکت صنایع مس و کویل‌سازی ایران'
                        : 'مثال: شرکت داروسازی البرز'
                    }
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نام نماینده / رابط</label>
                  <input
                    type="text"
                    placeholder="مثال: مهندس حسینی"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تلفن تماس</label>
                  <input
                    type="text"
                    placeholder="۰۲۱۲۲۱۱۰۰۰۰"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تاریخ صدور</label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">مهلت اعتبار پیش‌فاکتور</label>
                  <input
                    type="text"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نشانی و آدرس دقیق</label>
                  <input
                    type="text"
                    placeholder="آدرس دقیق کارخانه یا دفتر..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Items Table Form */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                    {formData.invoiceType === 'purchase'
                      ? 'اقلام پیش‌فاکتور خرید (قطعات، مواد اولیه و تجهیزات)'
                      : 'اقلام پیش‌فاکتور فروش (دستگاه‌ها و خدمات تهویه)'}
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن قلم جدید</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] text-slate-500 mb-1">
                          انتخاب کالا یا شرح دستی #{idx + 1}
                        </label>
                        <select
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs mb-1 focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="">-- انتخاب از کاتالوگ کالاها --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatToman(p.price)} تومان)
                            </option>
                          ))}
                        </select>
                        <textarea
                          rows={2}
                          required
                          placeholder="شرح کامل کالا، مشخصات فنی و مدل..."
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-500 mb-1">تعداد/مقدار</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[11px] text-slate-500 mb-1">واحد</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-500 mb-1">قیمت واحد (تومان)</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[11px] text-slate-500 mb-1">تخفیف %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || 0}
                          onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between gap-1">
                        <div>
                          <span className="block text-[10px] text-slate-400">جمع کل قلم:</span>
                          <span className="text-xs font-bold text-teal-700">{formatToman(item.totalPrice)}</span>
                        </div>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary Breakdown */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs text-slate-300">
                  <div>
                    جمع کل بدون تخفیف: <span className="font-bold text-white">{formatToman(subtotal)}</span> تومان
                  </div>
                  <div>
                    تخفیف اعطا شده/دریافتی: <span className="font-bold text-rose-300">{formatToman(discountTotal)}</span> تومان
                  </div>
                  <div>
                    مالیات و عوارض ارزش افزوده (۱۰٪):{' '}
                    <span className="font-bold text-amber-300">{formatToman(taxAmount)}</span> تومان
                  </div>
                </div>

                <div className="text-left bg-teal-800/80 px-4 py-2.5 rounded-xl border border-teal-600/50">
                  <div className="text-[11px] text-teal-200">مبلغ قابل پرداخت:</div>
                  <div className="text-xl font-black text-white">{formatToman(grandTotal)} تومان</div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  شرایط تحویل، نحوه پرداخت و تسویه حساب
                </label>
                <textarea
                  rows={3}
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    formData.invoiceType === 'purchase'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {formData.invoiceType === 'purchase'
                      ? 'ذخیره و ثبت پیش‌فاکتور خرید'
                      : 'ذخیره و ثبت پیش‌فاکتور فروش'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable / Official Proforma Invoice View Modal */}
      {isPrintModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 my-auto overflow-hidden flex flex-col max-h-[95vh]">
            {/* Modal Actions Bar (Non-printable) */}
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-xs sm:text-sm">
                  پیش‌نمایش رسمی پیش‌فاکتور {(selectedInvoice.invoiceType || 'sale') === 'purchase' ? 'خرید' : 'فروش'} -{' '}
                  {selectedInvoice.number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ / خروجی PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Frame */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-900 font-sans print:p-0 print:overflow-visible">
              {/* Header Box */}
              <div className="border-b-2 border-teal-700 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                  <div className="w-14 h-14 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                    W
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-teal-800">شرکت تولیدی مهندسی تهویه واته</h2>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      طراحی و ساخت انواع چیلر، هواساز، فن کوئل و تجهیزات تهویه صنعتی
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">شناسه ملی: ۱۰۱۰۲۳۹۴۸۲۷ | شماره ثبت: ۴۹۲۰۳۱</p>
                  </div>
                </div>

                <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 min-w-48">
                  <div className="font-bold text-teal-800 text-center pb-1 border-b border-slate-200 mb-1">
                    {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                      ? 'پیش‌فاکتور خرید (از تامین‌کننده)'
                      : 'پیش‌فاکتور فروش (به خریدار)'}
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">شماره:</span>
                    <span className="font-mono font-bold">{selectedInvoice.number}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">تاریخ صدور:</span>
                    <span className="font-bold">{selectedInvoice.issueDate}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">تاریخ اعتبار:</span>
                    <span className="font-bold text-rose-700">{selectedInvoice.validUntil}</span>
                  </div>
                </div>
              </div>

              {/* Customer and Vendor Specifications Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Vendor / Buyer Waateh Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-teal-800 border-b border-slate-200 pb-1 mb-1">
                    {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                      ? 'مشخصات خریدار (تهویه واته):'
                      : 'مشخصات فروشنده:'}
                  </div>
                  <div>
                    <strong>
                      {(selectedInvoice.invoiceType || 'sale') === 'purchase' ? 'خریدار:' : 'فروشنده:'}
                    </strong>{' '}
                    شرکت تهویه واته (سهامی خاص)
                  </div>
                  <div>
                    <strong>تلفن پشتیبانی و دفتر:</strong> ۰۲۱۲۲۱۴۴۰۰۰ - ۰۲۱۶۶۵۵۴۴۳۳
                  </div>
                  <div>
                    <strong>نشانی:</strong> تهران، خیابان آزادی، پلاک ۱۲۴، ساختمان واته
                  </div>
                  <div>
                    <strong>کد اقتصادی:</strong> ۴۱۱۴۹۳۸۲۷۱۶
                  </div>
                </div>

                {/* Customer / Supplier Box */}
                <div className="bg-teal-50/40 p-3.5 rounded-xl border border-teal-100 space-y-1.5">
                  <div className="font-bold text-teal-900 border-b border-teal-200 pb-1 mb-1">
                    {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                      ? 'مشخصات تامین‌کننده / فروشنده:'
                      : 'مشخصات خریدار:'}
                  </div>
                  <div>
                    <strong>
                      {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                        ? 'نام تامین‌کننده / شرکت:'
                        : 'نام خریدار / شرکت:'}
                    </strong>{' '}
                    {selectedInvoice.companyName || selectedInvoice.customerName}
                  </div>
                  <div>
                    <strong>نماینده / رابط:</strong> {selectedInvoice.customerName || '---'}
                  </div>
                  <div>
                    <strong>تلفن تماس:</strong> {selectedInvoice.phone || '---'}
                  </div>
                  <div>
                    <strong>نشانی:</strong> {selectedInvoice.address || 'تهران'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-teal-800 text-white font-bold border-b border-teal-900">
                    <tr>
                      <th className="p-2.5 text-center w-10">ردیف</th>
                      <th className="p-2.5">
                        {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                          ? 'شرح کالا، قطعات یا مواد اولیه خریدار شده'
                          : 'شرح کالا یا خدمات تهویه مطبوع'}
                      </th>
                      <th className="p-2.5 text-center w-16">تعداد</th>
                      <th className="p-2.5 text-center w-16">واحد</th>
                      <th className="p-2.5 text-left">قیمت واحد (تومان)</th>
                      <th className="p-2.5 text-center w-16">تخفیف %</th>
                      <th className="p-2.5 text-left">مبلغ کل (تومان)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={it.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                        <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-medium">{it.description}</td>
                        <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-center text-slate-600">{it.unit}</td>
                        <td className="p-2.5 text-left font-mono">{formatToman(it.unitPrice)}</td>
                        <td className="p-2.5 text-center font-mono">{it.discountPercent || 0}٪</td>
                        <td className="p-2.5 text-left font-bold font-mono text-teal-900">
                          {formatToman(it.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Box */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 text-xs">
                <div className="w-full sm:w-1/2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>توضیحات و شرایط تسویه:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line">
                    {selectedInvoice.termsAndConditions}
                  </p>
                </div>

                <div className="w-full sm:w-1/2 bg-slate-100/80 p-3.5 rounded-xl border border-slate-200 space-y-2 text-slate-800 font-semibold">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-600">جمع کل بدون تخفیف:</span>
                    <span>{formatToman(selectedInvoice.subtotal)} تومان</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5 text-rose-700">
                    <span>مجموع تخفیف‌ها:</span>
                    <span>{formatToman(selectedInvoice.discountTotal)} تومان</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5 text-amber-800">
                    <span>مالیات و عوارض ارزش افزوده (۱۰٪):</span>
                    <span>{formatToman(selectedInvoice.taxAmount)} تومان</span>
                  </div>
                  <div className="flex justify-between pt-1 text-teal-900 text-sm font-black bg-teal-50 p-2 rounded-lg border border-teal-200">
                    <span>مبلغ قابل پرداخت:</span>
                    <span>{formatToman(selectedInvoice.grandTotal)} تومان</span>
                  </div>
                </div>
              </div>

              {/* Official Signatures Box */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-600">
                <div className="space-y-12">
                  <div className="font-bold text-slate-800">
                    {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                      ? 'مهر و امضای تامین‌کننده / فروشنده'
                      : 'مهر و امضای فروشنده (تهویه واته)'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                      ? selectedInvoice.companyName || 'تامین‌کننده'
                      : 'واحد مالی و فروش شرکت تهویه واته'}
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="font-bold text-slate-800">
                    {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                      ? 'مهر و امضای خریدار (تهویه واته)'
                      : 'مهر و امضای خریدار'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {(selectedInvoice.invoiceType || 'sale') === 'purchase'
                      ? 'تایید واحد بازرگانی و خرید شرکت تهویه واته'
                      : 'تایید نهایی مشخصات و شرایط تحویل'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Word Proposal Builder Modal */}
      <WordProposalBuilderModal
        isOpen={isWordProposalModalOpen}
        onClose={() => setIsWordProposalModalOpen(false)}
      />
    </div>
  );
};
