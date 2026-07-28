import React, { useState } from 'react';
import { OpportunityFile, OpportunityItem } from '../../types';
import {
  X,
  Plus,
  Building2,
  User as UserIcon,
  Phone,
  DollarSign,
  Calendar,
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  File,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTomans, toPersianDigits } from '../../lib/utils';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    companyName: string;
    customerName: string;
    phone: string;
    value: number;
    jalaliDate: string;
    notes: string;
    files: OpportunityFile[];
    items: OpportunityItem[];
  }) => void;
}

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const todayJalali = new Date().toLocaleDateString('fa-IR');

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [jalaliDate, setJalaliDate] = useState(todayJalali);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<OpportunityFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Quick Item entry inside creation form
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');
  const [itemsList, setItemsList] = useState<OpportunityItem[]>([]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploadedFiles: File[] = Array.from(e.target.files);
    
    uploadedFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: OpportunityFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          opportunityId: '',
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.type || file.name.split('.').pop() || 'unknown',
          dataUrl: event.target?.result as string,
          uploadedAt: new Date().toLocaleDateString('fa-IR'),
          uploadedByUserId: 'user-1',
          uploadedByName: 'کاربر سیستم',
        };
        setFiles((prev) => [newFile, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    const priceNum = Number(itemPrice) || 0;
    const qtyNum = Number(itemQty) || 1;

    const newItem: OpportunityItem = {
      id: `item-${Date.now()}`,
      name: itemName,
      quantity: qtyNum,
      unit: 'دستگاه',
      unitPrice: priceNum,
      totalPrice: priceNum * qtyNum,
    };

    setItemsList((prev) => [...prev, newItem]);
    setItemName('');
    setItemQty(1);
    setItemPrice('');

    // Automatically recalculate total estimated value if valueStr is empty
    const currentSum = [...itemsList, newItem].reduce((sum, i) => sum + i.totalPrice, 0);
    if (!valueStr || Number(valueStr) === 0) {
      setValueStr(currentSum.toString());
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setItemsList((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedValue = Number(valueStr) || 0;

    onSubmit({
      title: title.trim(),
      companyName: companyName.trim() || 'شرکت خریدار',
      customerName: customerName.trim() || 'مشتری جدید',
      phone: phone.trim(),
      value: parsedValue,
      jalaliDate,
      notes,
      files,
      items: itemsList,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 dir-rtl text-slate-100 selection:bg-teal-500 selection:text-white">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-slate-900 p-5 border-b border-purple-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-900/80 border border-purple-500/50 rounded-2xl text-purple-300">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-white">
                تعریف فرصت فروش جدید (چرخه ۸ مرحله‌ای)
              </h2>
              <p className="text-xs text-purple-200/80 mt-0.5">
                ورود اطلاعات کامل خریدار، تاریخ هجری شمسی و بارگذاری اسناد و پیوست‌های فنی
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>مشخصات اصلی فرصت و خریدار</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  عنوان فرصت فروش <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: خرید چیلر ۵۰ تن و هواساز برای کارخانه داروسازی"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  نام شرکت / خریدار <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: شرکت صنایع دارویی البرز"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  نام مسئول / رابط مشتری
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: مهندس رضایی"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  شماره همراه / تماس
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09121112233"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors dir-ltr text-right"
                />
              </div>

              {/* Value in Tomans */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  مبلغ برآوردی اولیه (تومان)
                </label>
                <input
                  type="number"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  placeholder="مثال: 2500000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors font-bold text-emerald-400"
                />
                {valueStr && (
                  <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
                    معادل: {toPersianDigits(formatTomans(Number(valueStr)))} تومان
                  </span>
                )}
              </div>

              {/* Jalali Date Selection */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  تاریخ ثبت (شمسی) <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={jalaliDate}
                    onChange={(e) => setJalaliDate(e.target.value)}
                    placeholder="۱۴۰۳/۰۵/۰۶"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setJalaliDate(todayJalali)}
                    className="bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-700 whitespace-nowrap"
                  >
                    امروز
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              توضیحات و مشخصات اولیه درخواست:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="شرح نیازمندی‌های مشتری، نوع کاربری، محل نصب و شرایط استعلام..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Optional Items Breakdown */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>اقلام و دستگاه‌های استعلامی (اختیاری)</span>
              </span>
              <span className="text-[11px] text-slate-400">تعداد اقلام: {toPersianDigits(itemsList.length)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="نام دستگاه / تجهیز"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <input
                type="number"
                min="1"
                placeholder="تعداد"
                value={itemQty}
                onChange={(e) => setItemQty(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="قیمت واحد"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {itemsList.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {itemsList.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-200">
                      {item.name} ({toPersianDigits(item.quantity)} {item.unit})
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-extrabold">
                        {toPersianDigits(formatTomans(item.totalPrice))} تومان
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Upload Attachment Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              بارگذاری فایل‌های پیوست و مستندات اولیه (pdf, jpg, png, docx, xlsx):
            </label>

            <div
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                isDragging ? 'border-purple-500 bg-purple-950/20' : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  const fakeEvent = { target: { files: e.dataTransfer.files } } as any;
                  handleFileUpload(fakeEvent);
                }
              }}
            >
              <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-bold mb-1">
                فایل‌ها را کشیده و اینجا رها کنید یا کلیک کنید
              </p>
              <p className="text-[11px] text-slate-500 mb-3">
                پشتیبانی از تصویر نقشه، کاتالوگ، نامه درخواست خریدار، PDF و نقشه اتوکد
              </p>

              <label className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 shadow-md">
                <span>انتخاب فایل‌ها</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 block">فایل‌های پیوست شده ({toPersianDigits(files.length)}):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {files.map((file) => (
                    <div key={file.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <File className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="text-slate-200 font-medium truncate">{file.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500">{file.fileSize}</span>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footers */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ثبت فرصت فروش جدید</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
