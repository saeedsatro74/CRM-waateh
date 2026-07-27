import React from 'react';
import { useCRMStore } from '../../lib/store';
import {
  Users,
  Target,
  KanbanSquare,
  CheckSquare,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PhoneCall,
  UserCog,
  LogIn,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatTomans, formatCompactTomans, toPersianDigits, getAvatarSrc, handleImageError } from '../../lib/utils';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddCustomer: () => void;
  onSelectCustomer: (customerId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenAddCustomer,
  onSelectCustomer,
}) => {
  const {
    accessibleCustomers,
    accessibleDeals,
    accessibleTasks,
    communications,
    currentUser,
    isManager,
    users,
    allDeals,
    allCustomers,
    allTasks,
    canSwitchToPanel,
    enterUserPanel,
  } = useCRMStore();

  // Metrics calculations
  const totalCustomers = accessibleCustomers.length;
  const newCustomersCount = accessibleCustomers.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    return createdDate >= thirtyDaysAgo;
  }).length;

  const wonDeals = accessibleDeals.filter((d) => d.stage === 'won');
  const totalWonRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = accessibleTasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed');

  const awaitingResponseCustomers = accessibleCustomers.filter((c) => c.awaitingResponse);

  // Monthly Sales Data computed from deals
  const monthlySalesData = [
    { month: 'فروردین', sales: 0 },
    { month: 'اردیبهشت', sales: 0 },
    { month: 'خرداد', sales: 0 },
    { month: 'تیر', sales: 0 },
    { month: 'مرداد', sales: 0 },
    { month: 'شهریور', sales: 0 },
  ];

  // Calculate real revenue from won deals
  wonDeals.forEach((deal) => {
    const valInMillions = Math.round(deal.value / 1_000_000);
    monthlySalesData[3].sales += valInMillions; // Default to current month or distribute
  });

  // Recharts Customer Pipeline Stage Distribution
  const stageCounts = {
    'تماس اولیه': accessibleCustomers.filter((c) => c.status === 'lead').length,
    'مذاکره': accessibleCustomers.filter((c) => c.status === 'negotiating').length,
    'مشتری فعال': accessibleCustomers.filter((c) => c.status === 'active').length,
    'مشتری VIP': accessibleCustomers.filter((c) => c.status === 'vip').length,
  };

  const pipelinePieData = [
    { name: 'سرنخ اولیه', value: stageCounts['تماس اولیه'], color: '#6366f1' },
    { name: 'در حال مذاکره', value: stageCounts['مذاکره'], color: '#a855f7' },
    { name: 'مشتری فعال', value: stageCounts['مشتری فعال'], color: '#10b981' },
    { name: 'مشتری VIP', value: stageCounts['مشتری VIP'], color: '#f59e0b' },
  ];

  const totalPieCount = pipelinePieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>خوش آمدید، {currentUser?.name} ({isManager ? 'مدیر ارشد' : 'کارشناس'})</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
              خلاصه وضعیت فروش و ارتباطات شرکت
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1.5 max-w-xl font-medium">
              امروز {toPersianDigits(todayTasks.length)} پیگیری معوقه و{' '}
              {toPersianDigits(awaitingResponseCustomers.length)} مشتری منتظر پاسخ در صف سیستم قرار دارند.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddCustomer}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>افزودن مشتری</span>
            </button>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all"
            >
              مشاهده پیگیری‌ها
            </button>
          </div>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Customers */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">کل مشتریان</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-800">
              {toPersianDigits(totalCustomers)}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>۱۲٪ رشد نسبت به ماه قبل</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: New Customers */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مشتریان جدید</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-800">
              {toPersianDigits(newCustomersCount)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              ثبت شده در ۳۰ روز اخیر
            </div>
          </div>
        </motion.div>

        {/* Card 3: Total Won Sales */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">فروش‌های انجام شده</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-lg font-extrabold text-emerald-600">
              {formatCompactTomans(totalWonRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              {toPersianDigits(wonDeals.length)} قرارداد موفق
            </div>
          </div>
        </motion.div>

        {/* Card 4: Today's Follow-ups */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">پیگیری‌های امروز</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-800">
              {toPersianDigits(todayTasks.length)}
            </div>
            <div className="text-[11px] text-amber-600 font-bold mt-1">
              در انتظار اقدام امروز
            </div>
          </div>
        </motion.div>

        {/* Card 5: Awaiting Response */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">منتظر پاسخ</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-rose-600">
              {toPersianDigits(awaitingResponseCustomers.length)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              نیازمند تماس یا پاسخ
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Revenue Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#d0dbe5] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">نمودار فروش ماهانه (میلیون تومان)</h3>
              <p className="text-[11px] text-slate-400 font-medium">روند حجم فروش ۶ ماه گذشته</p>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 font-bold text-xs rounded-xl border border-teal-200">
              آمار زنده dita
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${toPersianDigits(val)} میلیون تومان`, 'حجم فروش']}
                  contentStyle={{
                    borderRadius: '16px',
                    borderColor: '#e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontFamily: 'Vazirmatn',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Status Pipeline Pie Chart (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">توزیع وضعیت مشتریان</h3>
            <p className="text-[11px] text-slate-400 font-medium">تفکیک مشتریان فعال، VIP و سرنخ‌ها</p>
          </div>

          <div className="h-48 w-full my-2 flex items-center justify-center">
            {totalPieCount === 0 ? (
              <div className="text-center text-xs text-slate-400 font-medium py-8">
                اطلاعاتی برای نمایش وجود ندارد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelinePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pipelinePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${toPersianDigits(value)} مورد`, 'تعداد']}
                    contentStyle={{
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'Vazirmatn',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold border-t border-slate-100 pt-3">
            {pipelinePieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}:</span>
                <span className="text-slate-900 font-mono">{toPersianDigits(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Staff Monitoring & Panel Access for Managers / Admins */}
      {isManager && (
        <div className="bg-white p-6 rounded-3xl border border-[#d0dbe5] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">نظارت بر کارشناسان و پرسنل CRM</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  مشاهده وضعیت عملکرد پرسنل و امکان ورود مستقیم به پنل هر کارشناس برای بررسی کارها و مشتریان
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>مدیریت کامل کاربران ({users.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((staff) => {
              const staffDealsCount = allDeals.filter((d) => d.assignedToUserId === staff.id).length;
              const staffCustomersCount = allCustomers.filter((c) => c.assignedToUserId === staff.id).length;
              const staffPendingTasksCount = allTasks.filter(
                (t) => t.assignedToUserId === staff.id && t.status !== 'completed'
              ).length;
              const isSelf = currentUser?.id === staff.id;

              return (
                <div
                  key={staff.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelf
                      ? 'bg-teal-50/50 border-teal-200'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getAvatarSrc(staff.avatar)}
                        onError={handleImageError}
                        alt={staff.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                          <span>{staff.name}</span>
                          {isSelf && (
                            <span className="text-[9px] bg-teal-600 text-white px-1.5 py-0.2 rounded font-extrabold">
                              شما
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          {staff.department || 'واحد CRM'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-2 px-2 bg-white rounded-xl border border-slate-100 text-center text-[11px] mb-3">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">مشتریان</span>
                      <strong className="text-slate-800 font-mono">{toPersianDigits(staffCustomersCount)}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">فرصت‌ها</span>
                      <strong className="text-slate-800 font-mono">{toPersianDigits(staffDealsCount)}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">پیگیری‌ها</span>
                      <strong className="text-amber-700 font-mono">{toPersianDigits(staffPendingTasksCount)}</strong>
                    </div>
                  </div>

                  {isSelf ? (
                    <div className="w-full py-1.5 text-center text-[11px] font-bold text-teal-700 bg-teal-100/60 rounded-xl">
                      پنل فعال شما
                    </div>
                  ) : canSwitchToPanel(staff) ? (
                    <button
                      onClick={() => enterUserPanel(staff)}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>ورود به پنل کارشناس</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 text-center text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-xl">
                      مدیر / سطح دسترسی بالا
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lower Section: Urgent Tasks & Recent Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-[#d0dbe5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">پیگیری‌های اولویت‌دار امروز</h3>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              مشاهده همه
            </button>
          </div>

          <div className="space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                همه پیگیری‌های امروز انجام شده‌اند! 👍
              </div>
            ) : (
              todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{task.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      مشتری: {task.customerName || 'عام'}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                      task.priority === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.priority === 'high' ? 'فوری' : 'عادی'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Communications */}
        <div className="bg-white p-6 rounded-2xl border border-[#d0dbe5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-800">آخرین ارتباطات ثبت شده</h3>
            </div>
            <button
              onClick={() => onNavigateTab('communications')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              مشاهده همه
            </button>
          </div>

          <div className="space-y-2.5">
            {communications.slice(0, 4).map((comm) => (
              <div
                key={comm.id}
                onClick={() => onSelectCustomer(comm.customerId)}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{comm.summary}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{comm.date}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{comm.customerName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
