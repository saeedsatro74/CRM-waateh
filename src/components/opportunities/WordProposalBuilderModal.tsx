import React, { useState } from 'react';
import {
  FileText,
  X,
  Plus,
  Trash2,
  Download,
  Calculator,
  Building2,
  Calendar,
  Layers,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck,
  Cpu,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { formatTomans, toPersianDigits, numberToPersianWords } from '../../lib/utils';
import { generatePreInvoiceWordDoc, generateTechnicalProposalWordDoc } from './WordDocGenerator';

export interface ProposalItemRow {
  id: string;
  item_name: string;
  model: string;
  quantity: number;
  unit_price: number;
}

interface WordProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    doc_number?: string;
    customer_name?: string;
    subject?: string;
    items?: ProposalItemRow[];
    shipping_cost?: number;
    discount_percent?: number;
    notes?: string;
  };
}

export const DEVICE_TEMPLATES = [
  {
    id: 'chiller_scroll',
    name: 'چیلر اسکرال هواخنک (۱۲۰ تن)',
    model: 'WACC-120-4SC',
    description: 'چیلر اسکرال هواخنک ۱۲۰ تن نامی (۶۰ تن واقعی) - ۴ دستگاه کمپرسور اسکرال اورجینال COPELAND ZR380 - دو مدار مجزا - اواپراتور Shell & Tube - شیر آلات DANFOSS & CASTEL - تابلو برق HYUNDAI & PLC SABECO - رنگ الکترواستاتیک ۱۰۰ میکرون با عایق ۱۳ میلی‌متری',
    unit_price: 85000000000,
  },
  {
    id: 'chiller_screw',
    name: 'چیلر اسکرو آب‌خنک (۲۰۰ تن)',
    model: 'WCS-200-2SC',
    description: 'چیلر اسکرو آب‌خنک ۲۰۰ تن نامی - ۲ دستگاه کمپرسور اسکرو BITZER با کنترل ظرفیت استپ‌لس - کندانسور و اواپراتور Shell & Tube - کنترلر هوشمند PLC با صفحه لمسی - شیر انبساط الکترونیکی DANFOSS',
    unit_price: 135000000000,
  },
  {
    id: 'air_handler',
    name: 'هواساز هایژنیک / صنعتی (۱۰,۰۰۰ CFM)',
    model: 'WAH-10000-HYG',
    description: 'هواساز هایژنیک ۱۰ هزار CFM با بدنه دوجداره آلومینیومی پنتاپست Thermal Break - کویل سرمایشی و گرمایشی مسی با فین آلومینیومی مانع خوردگی - فن پلاگ سانتریفیوژ بکوارد EC - فیلتراسیون ۳ مرحله‌ای G4/F7/HEPA',
    unit_price: 32000000000,
  },
  {
    id: 'fan_coil',
    name: 'فن‌کویل سقفی توکار (۸۰۰ CFM)',
    model: 'WFC-800-D',
    description: 'فن‌کویل سقفی توکار ۸۰۰ CFM با موتور ۳ سرعته بی‌صدا - کویل ۳ ردیفه مسی - سینی درین گالوانیزه با عایق پلی‌اتیلن - فیلتر آلومینیومی قابل شستشو',
    unit_price: 185000000,
  },
  {
    id: 'package_unit',
    name: 'پکیج یونیت پشت‌بامی (۳۰ تن)',
    model: 'WRTU-300-4SC',
    description: 'پکیج یونیت پشت بامی ۳۰ تن برودتی - دارای کندانسور هواخنک و هواساز داخلی یکپارچه - ۴ دستگاه کمپرسور COPELAND - بدنه ورق گالوانیزه سنگین با پوشش رنگ پودری الکترواستاتیک',
    unit_price: 24000000000,
  },
];

export const WordProposalBuilderModal: React.FC<WordProposalBuilderModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [docType, setDocType] = useState<'financial' | 'technical'>('financial');
  const [docNumber, setDocNumber] = useState(
    initialData?.doc_number || `WQ-۱۴۰۵/${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [date, setDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [customerName, setCustomerName] = useState(initialData?.customer_name || 'شرکت تولیدی شیوا');
  const [subject, setSubject] = useState(initialData?.subject || 'پیشنهاد مالی چیلر ۱۲۰ تن');
  const [description, setDescription] = useState(
    'با سلام و احترام\nبه استحضار می‌رساند پیرو درخواست شما، پیشنهاد قیمت به شرح ذیل اعلام می‌گردد:'
  );
  const [currency, setCurrency] = useState<'ریال' | 'تومان'>('ریال');
  const [shippingCost, setShippingCost] = useState<number>(initialData?.shipping_cost || 0);
  const [discountPercent, setDiscountPercent] = useState<number>(initialData?.discount_percent || 0);
  const [vatPercent, setVatPercent] = useState<number>(10);

  const [notes, setNotes] = useState<string>(
    initialData?.notes ||
      '❖ زمان تحویل: ۶۰ روز کاری پس از تسویه پیش پرداخت و تأییدیه فنی توسط کارفرما.\n❖ اعتبار پیش فاکتور ۲۴ ساعت از تاریخ پیشنهاد می‌باشد.\n❖ نحوه پرداخت: ۵۰٪ پیش پرداخت، ۴۰٪ همزمان با تحویل کالا درب کارخانه، ۱۰٪ پس از ارسال.\n❖ گارانتی: ۱۸ ماه از زمان تحویل و ۱۲ ماه از زمان نصب و راه‌اندازی توسط کارشناس فنی شرکت.\n❖ شماره شبا رسمی: IR370550010385006566381001 نزد بانک اقتصاد نوین به نام شرکت نهرآب سمام'
  );

  const [items, setItems] = useState<ProposalItemRow[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [
          {
            id: '1',
            item_name:
              'چیلر اسکرال هواخنک ۱۲۰ تن نامی (۶۰ تن واقعی) - تولید شرکت نهرآب سمام (واته) - ۴ دستگاه کمپرسور اسکرال اورجینال COPELAND ZR380 - دو مدار طراحی - اواپراتور Shell & Tube - شیرآلات DANFOSS & CASTEL - تجهیزات تابلو برق HYUNDAI و PLC SABECO - بدنه گالوانیزه با رنگ الکترواستاتیک',
            model: 'WACC-120-4SC',
            quantity: 1,
            unit_price: 85000000000,
          },
        ]
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('chiller_scroll');

  if (!isOpen) return null;

  // Add Item Row
  const handleAddItem = () => {
    const newItem: ProposalItemRow = {
      id: Date.now().toString(),
      item_name: '',
      model: '',
      quantity: 1,
      unit_price: 0,
    };
    setItems([...items, newItem]);
  };

  // Remove Item Row
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  // Update Item Row
  const handleUpdateItem = (id: string, field: keyof ProposalItemRow, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Load Device Template
  const handleApplyTemplate = (templateId: string) => {
    const tmpl = DEVICE_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    setSelectedTemplateId(templateId);
    setSubject(`پیشنهاد ${docType === 'financial' ? 'مالی' : 'فنی'} ${tmpl.name}`);

    const templateItem: ProposalItemRow = {
      id: Date.now().toString(),
      item_name: tmpl.description,
      model: tmpl.model,
      quantity: 1,
      unit_price: tmpl.unit_price,
    };

    setItems([templateItem]);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const netSubtotal = subtotal - discountAmount;
  const vatAmount = Math.round((netSubtotal * vatPercent) / 100);
  const grandTotal = netSubtotal + vatAmount + Number(shippingCost || 0);

  // Convert grand total to Persian Words
  const grandTotalWords = numberToPersianWords(grandTotal, currency);

  // Generate Word File via Server API
  const handleDownloadWordViaApi = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        doc_type: docType,
        doc_number: docNumber,
        date: date,
        customer_name: customerName,
        company_name: 'شرکت نهرآب سمام (واته)',
        subject: subject,
        description: description,
        currency: currency,
        items: items,
        shipping_cost: Number(shippingCost) || 0,
        discount_percent: Number(discountPercent) || 0,
        vat_percent: Number(vatPercent) || 10,
        notes: notes,
      };

      const response = await fetch('/api/generate-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('خطا در ارتباط با سرور ساخت فایل وورد');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docType === 'technical' 
        ? `پیشنهاد_فنی_${customerName.replace(/\s+/g, '_')}_${docNumber.replace(/[\/\s]/g, '_')}.docx`
        : `پیشنهاد_مالی_${customerName.replace(/\s+/g, '_')}_${docNumber.replace(/[\/\s]/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('API Error, falling back to client generation:', err);
      // Fallback to client-side docx generation
      if (docType === 'financial') {
        await generatePreInvoiceWordDoc({
          id: docNumber,
          number: docNumber,
          title: subject,
          customerName: customerName,
          companyName: customerName,
          value: subtotal,
          items: items.map((it) => ({
            id: it.id,
            name: `${it.item_name} (مدل: ${it.model})`,
            quantity: it.quantity,
            unitPrice: it.unit_price,
            totalPrice: it.quantity * it.unit_price,
          })),
          approvalData: {
            discountPercent: discountPercent,
            shippingCost: shippingCost,
            warrantyTerms: notes,
          },
        } as any);
      } else {
        await generateTechnicalProposalWordDoc({
          id: docNumber,
          title: subject,
          customerName: customerName,
          companyName: customerName,
          items: items.map((it) => ({
            id: it.id,
            name: `${it.item_name} (مدل: ${it.model})`,
            quantity: it.quantity,
            unitPrice: it.unit_price,
            totalPrice: it.quantity * it.unit_price,
          })),
          approvalData: {
            warrantyTerms: notes,
          },
        } as any);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto dir-rtl font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-100 text-base sm:text-lg flex items-center gap-2">
                <span>سیستم خودکار ساخت فایل Word پیشنهاد مالی و فنی</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full font-bold">
                  فرمت رسمی نهرآب سمام
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                تنظیم فرم، افزودن داینامیک اقلام، محاسبات خودکار، عدد به حروف و دانلود سورس docx
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200 text-xs">
          {/* Document Type Selector Tabs */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setDocType('financial');
                setSubject('پیشنهاد مالی سیستم تهویه مطبوع');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'financial'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>پیشنهاد مالی (قیمت و اقلام)</span>
            </button>

            <button
              onClick={() => {
                setDocType('technical');
                setSubject('پیشنهاد فنی و مشخصات مهندسی دستگاه');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'technical'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>پیشنهاد فنی (مشخصات و کاتالوگ)</span>
            </button>
          </div>

          {/* Device Template Quick Loader */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-extrabold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>انتخاب تمپلیت پیش‌فرض دستگاه (بارگذاری سریع تجهیزات):</span>
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {DEVICE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Header Info (Inputs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">شماره سند (doc_number):</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">تاریخ (date):</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">نام خریدار / کارفرما (customer_name):</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">موضوع (subject):</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">متن معارفه / توضیحات (description):</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Dynamic Table Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-amber-400" />
                <span>جدول اقلام و تجهیزات پیشنهادی (جدول داینامیک):</span>
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-[11px]">
                  <span className="text-slate-400 font-bold">واحد پول:</span>
                  <button
                    onClick={() => setCurrency('ریال')}
                    className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                      currency === 'ریال' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    ریال
                  </button>
                  <button
                    onClick={() => setCurrency('تومان')}
                    className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                      currency === 'تومان' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    تومان
                  </button>
                </div>

                <button
                  onClick={handleAddItem}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>افزودن ردیف جدید</span>
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3 text-center w-12">ردیف</th>
                    <th className="p-3">شرح کالا (item_name)</th>
                    <th className="p-3 w-32">مدل (model)</th>
                    <th className="p-3 w-20 text-center">تعداد</th>
                    <th className="p-3 w-40 text-center">قیمت واحد ({currency})</th>
                    <th className="p-3 w-40 text-center">قیمت کل ({currency})</th>
                    <th className="p-3 w-12 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {items.map((item, idx) => {
                    const rowTotal = item.quantity * item.unit_price;
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/50 transition-all">
                        <td className="p-3 text-center font-bold text-slate-400">
                          {toPersianDigits(idx + 1)}
                        </td>
                        <td className="p-3">
                          <textarea
                            rows={2}
                            value={item.item_name}
                            onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value)}
                            placeholder="شرح کامل دستگاه یا قطعه..."
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.model}
                            onChange={(e) => handleUpdateItem(item.id, 'model', e.target.value)}
                            placeholder="مدل..."
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2 text-white text-center font-extrabold text-xs focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            step="100000"
                            value={item.unit_price || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'unit_price', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2 text-white text-center font-extrabold text-xs focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3 text-center font-black text-amber-300">
                          {toPersianDigits(rowTotal.toLocaleString('fa-IR'))}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length <= 1}
                            className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/50 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Bar */}
          {docType === 'financial' && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">هزینه حمل و نقل ({currency}):</label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={shippingCost || ''}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-extrabold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">درصد تخفیف (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-extrabold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">مالیات بر ارزش افزوده (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-extrabold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <span className="text-slate-400 block font-bold text-[11px]">جمع کل نهایی (عددی):</span>
                  <span className="font-extrabold text-base text-amber-400 pt-0.5">
                    {toPersianDigits(grandTotal.toLocaleString('fa-IR'))} {currency}
                  </span>
                </div>
              </div>

              {/* Number to Persian Words Display Box */}
              <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl space-y-1">
                <span className="text-amber-300/80 font-bold text-[11px] block">
                  مبلغ به حروف (تبدیل خودکار به فارسی):
                </span>
                <p className="font-black text-sm text-amber-200 leading-relaxed">
                  {grandTotalWords}
                </p>
              </div>
            </div>
          )}

          {/* Notes & Terms */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">
              ملاحظات، شرایط پرداخت، گارانتی و اطلاعات بانک (notes):
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer / Download Action Buttons */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-400 font-bold">
            فرمت خروجی: فایل سورس استاندارد Word (.docx) مایکروسافت آفیس
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all cursor-pointer"
            >
              انصراف
            </button>

            <button
              onClick={handleDownloadWordViaApi}
              disabled={isGenerating}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                دانلود {docType === 'financial' ? 'پیشنهاد مالی' : 'پیشنهاد فنی'} Word (.docx)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
