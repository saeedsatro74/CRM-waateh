import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Wrench,
  CheckSquare,
  Package,
  MessageSquare,
  BarChart3,
  UserCog,
  Settings,
  User,
  ShieldCheck,
  UserCheck,
  Headphones,
  Search,
  BookOpen,
  Sparkles,
  Info,
  Building2,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'overview' | 'sections' | 'workflow' | 'roles'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const sectionsList = [
    {
      id: 'dashboard',
      title: 'داشبورد مدیریتی و عملیاتی (Dashboard)',
      icon: LayoutDashboard,
      color: 'text-teal-700 bg-teal-50',
      description: 'مرکز کنترل لحظه‌ای عملکرد فروش، مشتریان و سرویس‌های فنی.',
      details: [
        'خلاصه کارت‌های آماری: تعداد مشتریان فعال، ارزش کل پروژه‌های در حال مذاکره، درخواست‌های خدمات معوق و پیگیری‌های امروز.',
        'نمودار فروش ماهانه: روند مالی فروش تجهیزات و پروژه‌های تهویه بر حسب میلیون تومان.',
        'نمودار تفکیک مشتریان: مشاهده سهم مشتریان فعال، VIP و در حال مذاکره.',
        'لیست دسترسی سریع: دسترسی فوری به تماس‌های امروز و وظایف فورس‌ماژور.',
      ],
    },
    {
      id: 'customers',
      title: 'مدیریت پرونده مشتریان (Customers)',
      icon: Users,
      color: 'text-blue-700 bg-blue-50',
      description: 'بانک اطلاعاتی جامع شرکت‌ها، پروژه‌ها و خریداران حقیقی و حقوقی.',
      details: [
        'ثبت اطلاعات کامل: شامل نام شرکت، مدیر یا رابط اصلی، شماره‌های تماس، آدرس پروژه، زمینه فعالیت و یادداشت‌های اختصاصی.',
        'تعیین کارشناس مسئول: امکان ارجاع پرونده به کارشناسان فروش جهت پیگیری انحصاری.',
        'دسته‌بندی پرکاربرد: تفکیک مشتریان به گروه‌های سرنخ اولیه، در حال مذاکره، مشتری فعال و مشتری ویژه (VIP).',
        'جستجو و خروجی: جستجوی سریع بر اساس نام شرکت، شماره تماس یا نام مسئول پرونده.',
      ],
    },
    {
      id: 'deals',
      title: 'فرصت‌های فروش و مراحل قرارداد (Sales Deals)',
      icon: Briefcase,
      color: 'text-indigo-700 bg-indigo-50',
      description: 'مدیریت گام‌به‌گام پروژه‌های فروش چیلر، هواساز و تجهیزات صنعتی.',
      details: [
        'پیشبرد مراحل فروش: هدایت پروژه از تماس اولیه -> نیازسنجی فنی -> ارسال پیش‌فاکتور -> مذاکره نهایی -> عقد قرارداد (موفق/ناموفق).',
        'برآورد ارزش مالی: ثبت مبلغ تخمینی هر قرارداد و تعیین درصد احتمال موفقیت معامله.',
        'تغییر مرحله آسان: تغییر وضعیت فرصت فروش تنها با یک کلیک.',
        'اتصال مستقیم به پرونده مشتری: تمام فرصت‌های یک شرکت در پرونده همان مشتری همگام می‌شوند.',
      ],
    },
    {
      id: 'leads',
      title: 'سرنخ‌های اولیه و استعلام‌ها (Leads)',
      icon: UserPlus,
      color: 'text-violet-700 bg-violet-50',
      description: 'مدیریت استعلام‌های جدید ورودی از سایت، نمایشگاه، تماس یا تبلیغات.',
      details: [
        'ثبت ورودی‌های جدید: ثبت سریع مشخصات اولیه متقاضیانی که هنوز به مشتری قطعی تبدیل نشده‌اند.',
        'تحلیل منبع ورود: شناسایی مسیر جذب مشتری (مستقیم، وب‌سایت، معرفی، نمایشگاه).',
        'تبدیل سریع به مشتری: تبدیل سرنخ به پرونده مشتری رسمی و ایجاد فرصت فروش تنها با کلیک روی دکمه «تبدیل به مشتری».',
      ],
    },
    {
      id: 'services',
      title: 'خدمات فنی، نصب و گارانتی (Technical Services)',
      icon: Wrench,
      color: 'text-amber-700 bg-amber-50',
      description: 'مدیریت درخواست‌های تعمیرات، سرویس دوره‌ای، راه‌اندازی و گارانتی تجهیزات.',
      details: [
        'ثبت شناسنامه درخواست: ثبت مدل دقیق دستگاه (چیلر، هواساز، فن‌کوئل، پکیج)، شماره سریال و شرح دقیق ایراد اعلامی.',
        'ارجاع به تکنسین: تخصیص درخواست به کارشناس فنی یا تکنسین اعزامی.',
        'مراحل رسیدگی: پیگیری وضعیت از «ثبت شده» -> «در حال عیب‌یابی» -> «تامین قطعه» -> «تکمیل و تحویل».',
      ],
    },
    {
      id: 'tasks',
      title: 'برنامه‌ریزی و وظایف روزانه (Tasks & Reminders)',
      icon: CheckSquare,
      color: 'text-emerald-700 bg-emerald-50',
      description: 'تقویم کاری و لیست اقدامات پرسنل جهت جلوگیری از فراموشی پیگیری‌ها.',
      details: [
        'ثبت انواع اقدام: تماس تلفنی، جلسه حضوری، ارسال کاتالوگ/پیش‌فاکتور، پیگیری مالی یا بازدید فنی از پروژه.',
        'تعیین مهلت و اولویت: تنظیم تاریخ انجام (Due Date) و سطح اولویت (ضروری، متوسط، عادی).',
        'اتصال به پرونده مشتری: لینک کردن کار به مشتری مشخص جهت مشاهده کامل سابقه اقدام.',
      ],
    },
    {
      id: 'products',
      title: 'کاتالوگ دستگاه‌ها و تجهیزات (Products & Catalog)',
      icon: Package,
      color: 'text-purple-700 bg-purple-50',
      description: 'لیست مرجع محصولات، مشخصات فنی اولیه و قیمت‌های پایه شرکت تهویه واته.',
      details: [
        'دسته‌بندی تجهیزات: ثبت چیلرهای تراکمی، هواسازهای هایژنیک، فن‌کوئل، پکیج‌های برودتی و سرویس‌های مهندسی.',
        'ثبت کد و قیمت پایه: مشاهده کد اختصاصی دستگاه، قیمت واحد و واحد سنجش (دستگاه، پروژه، سرویس).',
      ],
    },
    {
      id: 'communications',
      title: 'سابقه تعاملات و مکالمات (Communications)',
      icon: MessageSquare,
      color: 'text-cyan-700 bg-cyan-50',
      description: 'بایگانی کامل جلسات، تماس‌ها و پیام‌های ردوبدل شده با مشتریان.',
      details: [
        'ثبت خلاصه مذاکره: درج خلاصه نکات کلیدی گفتگوی تلفنی یا جلسه حضوری با مشتری.',
        'مرور پیشینه قبل از تماس: بررسی سریع تاریخچه مکالمات قبلی همکاران با مشتری قبل از برقراری تماس جدید.',
      ],
    },
    {
      id: 'reports',
      title: 'گزارش‌های مدیریتی (Reports & Analytics)',
      icon: BarChart3,
      color: 'text-rose-700 bg-rose-50',
      description: 'تحلیل آماری و نمودارهای مقایسه‌ای جهت تصمیم‌گیری‌های مدیریتی.',
      details: [
        'آمار تفکیکی فروش: بررسی میزان موفقیت تیم فروش در انعقاد قراردادها.',
        'گزارش عملکرد خدمات: تعداد سرویس‌های انجام شده و رضایت مشتریان.',
        'قابلیت چاپ و خروجی: دریافت نسخه چاپی از گزارش‌های دوره برای جلسات هیئت مدیره.',
      ],
    },
    {
      id: 'users',
      title: 'مدیریت کاربران و پرسنل (Users Management)',
      icon: UserCog,
      color: 'text-slate-700 bg-slate-100',
      description: 'مدیریت حساب پرسنل شرکت و تعیین سطح دسترسی (مخصوص مدیران).',
      details: [
        'ثبت پرسنل جدید: افزودن نام، سمت شغلی، ایمیل، شماره تماس و تصویر آواتار برای همکاران.',
        'تعیین سمت و نقش: تخصیص نقش مدیر ارشد، مدیر فروش، کارشناس فروش یا تکنسین خدمات.',
      ],
    },
    {
      id: 'settings',
      title: 'تنظیمات شرکت (Settings)',
      icon: Settings,
      color: 'text-teal-800 bg-teal-100/60',
      description: 'پیکربندی اطلاعات حقوقی و سازمانی شرکت تهویه واته.',
      details: [
        'اطلاعات سازمانی: ویرایش نام رسمی شرکت، اطلاعات تماس، آدرس کارخانه/دفتر و شماره ثبت.',
        'تنظیمات مالی: تعیین نرخ مالیات بر ارزش افزوده و واحد پولی فاکتورها (تومان).',
      ],
    },
  ];

  const filteredSections = sectionsList.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.details.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs dir-rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-teal-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold">راهنمای جامع کاربری CRM تهویه واته</h2>
                <span className="px-2 py-0.5 bg-teal-500/30 text-teal-200 text-[10px] font-bold rounded-lg border border-teal-400/30">
                  دفترچه راهنما
                </span>
              </div>
              <p className="text-xs text-teal-100/80 font-medium mt-0.5">
                راهنمای کامل نحوه کار با بخش‌های مختلف، چرخه فروش و خدمات فنی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-2xl transition-colors z-10"
            title="بستن راهنما"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Subtle background glow */}
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Search & Category Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('overview')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'overview'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>معرفی و هدف</span>
            </button>

            <button
              onClick={() => setActiveCategory('workflow')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'workflow'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>فرآیند کاری (Workflow)</span>
            </button>

            <button
              onClick={() => setActiveCategory('sections')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'sections'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>راهنمای منوها ({sectionsList.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory('roles')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'roles'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>نقش‌ها و دسترسی‌ها</span>
            </button>
          </div>

          {activeCategory === 'sections' && (
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در منوها..."
                className="w-full bg-white border border-slate-200 rounded-2xl pr-9 pl-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeCategory === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-teal-50/70 border border-teal-200/90 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm sm:text-base">
                  <Sparkles className="w-5 h-5 text-teal-700" />
                  <span>هدف نرم‌افزار مدیریت ارتباط با مشتریان شرکت تهویه واته</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  این نرم‌افزار برای ساماندهی، یکپارچه‌سازی و سرعت‌بخشی به امور <strong>فروش تجهیزات تهویه مطبوع، ثبت استعلام‌ها، پیگیری پرونده مشتریان و ارتقای کیفیت خدمات فنی و گارانتی</strong> شرکت طراحی شده است.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3.5 rounded-2xl border border-teal-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">ارتباط منظم با مشتریان</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">ثبت کامل تاریخچه تماس‌ها، مذاکرات و درخواست‌های مشتری جهت جلوگیری از فراموشی.</div>
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-teal-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">مدیریت شفاف پروژه‌های فروش</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">مشاهده شفاف مرحله به مرحله قراردادها، مبالغ پیش‌فاکتورها و شانس موفقیت معامله.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal-700" />
                  <span>کلیدهای میانبر و نکات کاربردی</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">جستجوی هوشمند پرونده‌ها</div>
                      <div className="text-[11px] text-slate-500">جستجوی سریع در نام شرکت، شماره تماس و پروژه‌ها</div>
                    </div>
                    <kbd className="bg-slate-100 border border-slate-300 px-2 py-1 rounded-xl text-xs font-mono font-bold text-slate-700">
                      Ctrl + K
                    </kbd>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">مشاهده اعلان‌های سیستم</div>
                      <div className="text-[11px] text-slate-500">آیکون زنگوله در بالای صفحه برای پیگیری‌های فوری</div>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold text-[11px] rounded-xl">
                      اعلان‌ها
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW */}
          {activeCategory === 'workflow' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4">
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">چرخه کاری استاندارد در شرکت (فرآیند از ورود مشتری تا خدمات)</h3>
                <p className="text-xs text-slate-600">برای کارایی حداکثری سیستم، فرآیندهای شرکت طبق ۴ مرحله زیر دنبال می‌شوند:</p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-violet-100 text-violet-800 font-extrabold rounded-2xl text-xs shrink-0">
                      مرحله ۱
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>ورود سرنخ و ثبت پرونده مشتری (Leads & Customers)</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        هرگاه تماس یا پیام جدیدی از متقاضی خرید تجهیزات دریافت شد، ابتدا در بخش <strong>«سرنخ‌های اولیه»</strong> ثبت می‌شود. پس از اولین مشاوره تلفنی و اطمینان از جدی بودن تقاضا، با کلیک روی <strong>«تبدیل به مشتری»</strong>، پرونده رسمی شرکت ساخته شده و به کارشناس مربوطه ارجاع می‌گردد.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-800 font-extrabold rounded-2xl text-xs shrink-0">
                      مرحله ۲
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ایجاد فرصت فروش و پیشبرد مراحل قرارداد (Sales Deals)
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        برای پروژه خرید متقاضی، یک <strong>فرصت فروش</strong> ایجاد کنید. مبلغ تخمینی چیلرها یا هواسازها را وارد کنید. پروژه را گام‌به‌گام از مرحله <strong>«نیازسنجی فنی»</strong>، <strong>«ارسال پیش‌فاکتور»</strong> و <strong>«مذاکره نهایی»</strong> عبور دهید تا به مرحله عقد قرارداد برسد.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-2xl text-xs shrink-0">
                      مرحله ۳
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ثبت پیگیری‌ها و وظایف روزانه (Tasks & Reminders)
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        تمام تماس‌های وعده‌داده‌شده، ارسال استعلام قیمت، جلسات حضوری و پیگیری‌های مالی را در بخش <strong>«وظایف و پیگیری‌ها»</strong> ثبت کنید تا سیستم تاریخ انجام کار را یادآوری کند.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-800 font-extrabold rounded-2xl text-xs shrink-0">
                      مرحله ۴
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ارائه خدمات فنی، نصب و گارانتی (Technical Services)
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        پس از فروش دستگاه، در صورت درخواست نصب، سرویس یا تعمیرات، یک پرونده در بخش <strong>«خدمات و پشتیبانی»</strong> ایجاد کرده، شماره سریال دستگاه را ثبت و به تکنسین مربوطه ارجاع دهید.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS BREAKDOWN */}
          {activeCategory === 'sections' && (
            <div className="space-y-4 animate-fadeIn">
              {filteredSections.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium">
                  هیچ بخشی با کلمه مورد نظر یافت نشد.
                </div>
              ) : (
                filteredSections.map((sec) => {
                  const IconComp = sec.icon;
                  return (
                    <div
                      key={sec.id}
                      className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 hover:border-teal-300 transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${sec.color}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{sec.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{sec.description}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-700">امکانات اصلی و نحوه کار:</div>
                        <ul className="space-y-1">
                          {sec.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: ROLES & PERMISSIONS */}
          {activeCategory === 'roles' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  سطح دسترسی منوها متناسب با سمت هر یک از پرسنل تنظیم شده است تا هر فرد بر مسئولیت‌های تخصصی خود تمرکز داشته باشد.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Admin */}
                <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
                    <ShieldCheck className="w-5 h-5 text-rose-600" />
                    <span>مدیر ارشد (Admin)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">دسترسی کامل مدیریت به تمامی بخش‌ها و گزارش‌ها:</p>
                  <ul className="text-[11px] space-y-1 text-slate-700 font-medium">
                    <li>• مشاهده تمام پروژه‌ها، مشتریان و عملکرد فروشگاه و پرسنل</li>
                    <li>• تعریف حساب کاربری پرسنل جدید و تعیین نقش‌ها</li>
                    <li>• دسترسی به تنظیمات اصلی و اطلاعات حقوقی شرکت</li>
                    <li>• امکان سوئیچ نظارتی به پنل هر یک از پرسنل</li>
                  </ul>
                </div>

                {/* Sales Manager */}
                <div className="bg-indigo-50/50 border border-indigo-200 rounded-3xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-sm">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <span>مدیر فروش (Sales Manager)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">راهبری و نظارت بر کل تیم فروش و بازاریابی:</p>
                  <ul className="text-[11px] space-y-1 text-slate-700 font-medium">
                    <li>• مشاهده تمامی پرونده‌های مشتریان و فرصت‌های فروش تیم</li>
                    <li>• ارجاع پرونده‌ها و سرنخ‌های جدید به کارشناسان فروش</li>
                    <li>• بررسی گزارش‌های دوره فروش و نرخ پیشرفت قراردادها</li>
                  </ul>
                </div>

                {/* Sales */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>کارشناس فروش (Sales Expert)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">مدیریت مستقیم پرونده‌های ارجاعی و پیگیری‌ها:</p>
                  <ul className="text-[11px] space-y-1 text-slate-700 font-medium">
                    <li>• مشاهده پرونده‌های مشتریان و فرصت‌های تخصیص داده شده به خود</li>
                    <li>• ثبت تماس‌ها، جلسات، پیگیری‌ها و خلاصه مذاکرات</li>
                    <li>• بروزرسانی وضعیت فرصت‌های فروش و پیش‌فاکتورها</li>
                  </ul>
                </div>

                {/* Service */}
                <div className="bg-teal-50/50 border border-teal-200 rounded-3xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-teal-800 font-extrabold text-sm">
                    <Headphones className="w-5 h-5 text-teal-600" />
                    <span>تکنسین و پشتیبانی فنی (Technical Service)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">رسیدگی به سفارشات نصب، سرویس و گارانتی:</p>
                  <ul className="text-[11px] space-y-1 text-slate-700 font-medium">
                    <li>• مشاهده سفارشات سرویس و عیب‌یابی دستگاه‌های ارجاع‌شده</li>
                    <li>• ثبت توضیحات کارشناسی فنی، قطعات تعویضی و اتمام کار</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            پشتیبانی فنی شرکت تهویه واته | تلفن: ۰۲۱۲۲۱۴۴۰۰۰
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-2xl transition-all shadow-xs mr-auto"
          >
            متوجه شدم، بستن راهنما
          </button>
        </div>
      </motion.div>
    </div>
  );
};

