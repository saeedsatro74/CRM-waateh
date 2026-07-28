import React, { useRef, useState } from 'react';
import { Opportunity, CompanySettings } from '../../types';
import { formatTomans, toPersianDigits } from '../../lib/utils';
import { FileText, Download, Award, CheckCircle2, ShieldCheck, Loader2, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Import official company stamp generated image
import companyStampImg from '../../assets/images/company_official_stamp_1785222649053.jpg';

interface FinalStampedPdfGeneratorProps {
  opportunity: Opportunity;
  companySettings?: CompanySettings;
  onPdfGenerated?: (pdfUrl: string) => void;
}

export const FinalStampedPdfGenerator: React.FC<FinalStampedPdfGeneratorProps> = ({
  opportunity,
  companySettings,
  onPdfGenerated,
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const companyName = companySettings?.companyName || 'شرکت مهندسی و تجهیزات صنعتی واته (سهامی خاص)';
  const companyPhone = companySettings?.phone || '۰۲۱-۶۶۵۵۴۴۳۳';
  const companyAddress = companySettings?.address || 'تهران، خیابان آزادی، پلاک ۱۲۴';

  const discount = opportunity.approvalData?.discountPercent || 0;
  const executionDays = opportunity.approvalData?.executionTimeDays || 30;
  const priceValidity = opportunity.approvalData?.priceValidityDays || 7;
  const warranty = opportunity.approvalData?.warrantyTerms || '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب (هرکدام زودتر فرا برسد)';

  let deliveryLoc = 'تحویل درب کارخانه';
  if (opportunity.approvalData?.deliveryLocationType === 'custom' && opportunity.approvalData.deliveryLocationCustom) {
    deliveryLoc = opportunity.approvalData.deliveryLocationCustom;
  }

  // Totals
  const shippingCost = opportunity.approvalData?.shippingCost || 0;
  const rawSubtotal = opportunity.items?.reduce((sum, i) => sum + (i.totalPrice || 0), 0) || opportunity.value;
  const discountAmount = Math.round((rawSubtotal * discount) / 100);
  const taxableAmount = rawSubtotal - discountAmount;
  const taxAmount = Math.round(taxableAmount * 0.1);
  const grandTotal = taxableAmount + taxAmount + shippingCost;

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);

    try {
      const element = pdfRef.current;

      // Wait a tiny bit for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));

      const safeName = (opportunity.companyName || 'WAATEH').replace(/[^\w\u0600-\u06FF]/g, '_');
      const fileName = `پیشنهاد_مالی_ممهور_${safeName}_${opportunity.id.slice(-4)}.pdf`;

      // Trigger reliable Blob download
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 15000);

      if (onPdfGenerated) {
        onPdfGenerated(imgData);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('خطا در ساخت فایل PDF. لطفاً از گزینه‌ی «چاپ و ذخیره مستقیم» استفاده نمایید.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintDocument = () => {
    if (!pdfRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('لطفاً اجازه باز شدن پنجره‌های پاپ‌آپ را در مرورگر بدهید.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
        <head>
          <title>پیش فاکتور و پیشنهاد فنی - ${opportunity.companyName || ''}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; }
              @page { size: A4; margin: 10mm; }
            }
            body { font-family: tahoma, sans-serif; background: white; color: #1e293b; padding: 20px; }
          </style>
        </head>
        <body>
          <div>${pdfRef.current.innerHTML}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4 dir-rtl text-slate-800">
      {/* Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <span>سند نهایی تایید شده با مهر و امضای رسمی شرکت</span>
              <span className="bg-emerald-900/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-600/50">
                دارای مهر رسمی
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              تولید اتوماتیک فایل PDF شامل تخفیف مصوب، شرایط گارانتی و مهر رسمی مدیرعامل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrintDocument}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>چاپ مستقیم / ذخیره PDF مرورگر</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>دانلود فایل PDF ممهور</span>
          </button>
        </div>
      </div>

      {/* Printable / Preview PDF Document */}
      <div className="overflow-x-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-center shadow-inner">
        <div
          ref={pdfRef}
          className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[15mm] shadow-2xl relative font-sans flex flex-col justify-between text-xs"
          style={{ direction: 'rtl' }}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-800 text-white font-black text-xl rounded-xl flex items-center justify-center shadow-md">
                  واته
                </div>
                <div>
                  <h1 className="font-black text-sm text-slate-900">{companyName}</h1>
                  <p className="text-[10px] text-slate-600">طراحی، ساخت و تامین تجهیزات و ماشین‌آلات صنعتی</p>
                </div>
              </div>

              <div className="text-left text-[10px] text-slate-700 space-y-0.5">
                <p>
                  <span className="font-bold">شماره سند:</span> {toPersianDigits(opportunity.number || `WQ-${opportunity.id.slice(-6)}`)}
                </p>
                <p>
                  <span className="font-bold">تاریخ:</span> {toPersianDigits(new Date().toLocaleDateString('fa-IR'))}
                </p>
                <p>
                  <span className="font-bold">پیوست:</span> دارد (مشخصات فنی)
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-2 bg-slate-100 rounded-lg mb-4 border border-slate-200">
              <h2 className="font-black text-sm text-slate-900">پیشنهاد مالی و فنی مصوب فروش</h2>
            </div>

            {/* Customer Info Box */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-bold text-slate-700">خریدار / کارفرما: </span>
                <span className="font-extrabold text-slate-900">{opportunity.companyName || opportunity.customerName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">نماینده / مسئول: </span>
                <span>{opportunity.customerName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">شماره تماس: </span>
                <span>{toPersianDigits(opportunity.phone || '—')}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">عنوان پروژه: </span>
                <span>{opportunity.title}</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2 border border-slate-300 text-center w-10">ردیف</th>
                  <th className="p-2 border border-slate-300 text-right">شرح دستگاه / تجهیزات و مشخصات فنی</th>
                  <th className="p-2 border border-slate-300 text-center w-12">تعداد</th>
                  <th className="p-2 border border-slate-300 text-center w-12">واحد</th>
                  <th className="p-2 border border-slate-300 text-center w-28">قیمت واحد (تومان)</th>
                  <th className="p-2 border border-slate-300 text-center w-32">قیمت کل (تومان)</th>
                </tr>
              </thead>
              <tbody>
                {opportunity.items && opportunity.items.length > 0 ? (
                  opportunity.items.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-slate-300">
                      <td className="p-2 border border-slate-300 text-center font-bold">{toPersianDigits(idx + 1)}</td>
                      <td className="p-2 border border-slate-300 text-right">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.specs && <div className="text-[9px] text-slate-600 mt-0.5">{item.specs}</div>}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold">{toPersianDigits(item.quantity)}</td>
                      <td className="p-2 border border-slate-300 text-center">{item.unit || 'دستگاه'}</td>
                      <td className="p-2 border border-slate-300 text-center font-bold">{toPersianDigits(formatTomans(item.unitPrice))}</td>
                      <td className="p-2 border border-slate-300 text-center font-black text-slate-900">{toPersianDigits(formatTomans(item.totalPrice))}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 border border-slate-300 text-center font-bold">۱</td>
                    <td className="p-2 border border-slate-300 text-right font-bold">{opportunity.title}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">۱</td>
                    <td className="p-2 border border-slate-300 text-center">دستگاه</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{toPersianDigits(formatTomans(opportunity.value))}</td>
                    <td className="p-2 border border-slate-300 text-center font-black text-slate-900">{toPersianDigits(formatTomans(opportunity.value))}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="flex justify-end mb-4">
              <div className="w-72 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>جمع کل اولیه:</span>
                  <span className="font-bold">{toPersianDigits(formatTomans(rawSubtotal))} تومان</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>تخفیف مصوب مدیریت ({toPersianDigits(discount)}٪):</span>
                    <span>- {toPersianDigits(formatTomans(discountAmount))} تومان</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                  <span>{toPersianDigits(formatTomans(taxAmount))} تومان</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-cyan-800 font-bold">
                    <span>هزینه حمل و نقل:</span>
                    <span>{toPersianDigits(formatTomans(shippingCost))} تومان</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-300 text-slate-900 font-black text-xs">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-emerald-800">{toPersianDigits(formatTomans(grandTotal))} تومان</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-[10px] space-y-1.5 mb-6">
              <h3 className="font-extrabold text-slate-900 text-xs border-b pb-1 mb-1">
                شرایط عمومی، گارانتی و نحوه تحویل:
              </h3>
              <p>
                <span className="font-bold text-slate-900">۱. زمان تحویل و ساخت:</span> {toPersianDigits(executionDays)} روز کاری پس از دریافت پیش‌پرداخت.
              </p>
              <p>
                <span className="font-bold text-slate-900">۲. اعتبار قیمت:</span> {toPersianDigits(priceValidity)} روز کاری از تاریخ این سند.
              </p>
              <p>
                <span className="font-bold text-slate-900">۳. شرایط گارانتی و ضمانت:</span> {warranty}
              </p>
              <p>
                <span className="font-bold text-slate-900">۴. محل تحویل:</span> {deliveryLoc}
              </p>
            </div>
          </div>

          {/* Footer & Official Stamp */}
          <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between">
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-900">{companyName}</p>
              <p>نشانی: {toPersianDigits(companyAddress)}</p>
              <p>تلفن پشتیبانی و فروش: {toPersianDigits(companyPhone)}</p>
            </div>

            {/* Embedded Official Stamp & Signature */}
            <div className="flex flex-col items-center justify-end">
              <span className="text-[10px] font-bold text-slate-800 mb-1">
                تایید نهایی و مهر رسمی شرکت:
              </span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <img
                  src={companyStampImg}
                  alt="مهر و امضای رسمی شرکت واته"
                  className="w-28 h-28 object-contain drop-shadow-md rounded-full border border-rose-600/30 p-1 mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
