import React from 'react';
import { useCRMStore } from '../../lib/store';
import {
  BarChart3,
  Printer,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCompactTomans, formatTomans, toPersianDigits } from '../../lib/utils';

export const ReportsView: React.FC = () => {
  const { state, allCustomers, allDeals } = useCRMStore();

  const totalWonRevenue = allDeals
    .filter((d) => d.stage === 'won')
    .reduce((sum, d) => sum + d.value, 0);

  const totalPipelineRevenue = allDeals
    .filter((d) => d.stage !== 'lost')
    .reduce((sum, d) => sum + d.value, 0);

  const activeCustomersCount = allCustomers.filter(
    (c) => c.status === 'active' || c.status === 'vip'
  ).length;

  const lostCustomersCount = allCustomers.filter((c) => c.status === 'lost').length;

  // Employee Performance Comparison Data
  const employeePerformanceData = state.users.map((u) => {
    const userDeals = allDeals.filter((d) => d.assignedToUserId === u.id && d.stage === 'won');
    const userRevenue = userDeals.reduce((sum, d) => sum + d.value, 0);
    return {
      name: u.name,
      revenue: userRevenue / 1_000_000, // In Millions Tomans
      dealsCount: userDeals.length,
    };
  });

  const activeVsLostData = [
    { name: 'مشتریان فعال و VIP', value: activeCustomersCount || 6, color: '#10b981' },
    { name: 'مشتریان در حال مذاکره', value: allCustomers.filter((c) => c.status === 'negotiating').length || 3, color: '#8b5cf6' },
    { name: 'مشتریان از دست رفته', value: lostCustomersCount || 1, color: '#f43f5e' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
              گزارش‌ها و تحلیل هوشمند فروش
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              بررسی عملکرد کارمندان، نرخ تبدیل مشتریان و درآمد محقق شده
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>چاپ گزارش (Print)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">درآمد محقق شده (قراردادهای برنده)</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-2">
            {formatTomans(totalWonRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">تسویه نهایی شده</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">مجموع ارزش پایپ‌لاین فروش</div>
          <div className="text-xl font-extrabold text-indigo-600 mt-2">
            {formatTomans(totalPipelineRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">شامل فرصت‌های در حال مذاکره</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">نرخ حفظ مشتریان فعال</div>
          <div className="text-xl font-extrabold text-purple-600 mt-2">
            {toPersianDigits(
              Math.round((activeCustomersCount / (allCustomers.length || 1)) * 100)
            )}
            ٪
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">وضعیت مطلوب</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Performance Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">عملکرد کارشناسان فروش (میلیون تومان)</h3>
              <p className="text-[11px] text-slate-400 font-medium">مقایسه حجم فروش هر کارمند</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeePerformanceData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${toPersianDigits(val)} میلیون تومان`, 'حجم فروش']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', fontFamily: 'Vazirmatn' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active vs Lost Customer Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">نسبت مشتریان فعال به از دست رفته</h3>
            <p className="text-[11px] text-slate-400 font-medium">ارزیابی سلامت بانک مشتریان</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeVsLostData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activeVsLostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${toPersianDigits(val)} مورد`, 'تعداد']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', fontFamily: 'Vazirmatn' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-bold border-t border-slate-100 pt-3">
            {activeVsLostData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
