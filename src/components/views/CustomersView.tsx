import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { Customer, CustomerStatus, CustomerType } from '../../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Phone,
  Mail,
  Building2,
  Tag,
  Eye,
  Trash2,
  LayoutGrid,
  List,
  MoreVertical,
  CheckSquare,
  DollarSign,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV, formatTomans, formatRelativePersianDate, toPersianDigits } from '../../lib/utils';

interface CustomersViewProps {
  onSelectCustomer: (customerId: string) => void;
  onOpenAddCustomerModal: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onSelectCustomer,
  onOpenAddCustomerModal,
}) => {
  const { accessibleCustomers, addCustomer, deleteCustomer, state } = useCRMStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter logic
  const filteredCustomers = accessibleCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesType = selectedType === 'all' || c.customerType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportCSV = () => {
    const headers = ['نام رابط', 'نام شرکت', 'شماره تماس', 'ایمیل', 'نوع', 'وضعیت', 'بودجه', 'تاریخ آخرین تماس', 'توضیحات'];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.companyName,
      c.phone,
      c.email,
      c.customerType === 'company' ? 'حقوقی (شرکت)' : 'حقیقی',
      c.status,
      c.budget,
      c.lastContactDate,
      c.notes,
    ]);
    exportToCSV('لیست_مشتریان_CRM', headers, rows);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'vip':
        return { label: 'مشتری VIP', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'active':
        return { label: 'فعال', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'negotiating':
        return { label: 'مذاکره', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'potential':
        return { label: 'احتمالی', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'lead':
        return { label: 'سرنخ اولیه', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'inactive':
        return { label: 'غیرفعال', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'lost':
        return { label: 'از دست رفته', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* View Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
              مدیریت و بانک اطلاعاتی مشتریان
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              نمایش {toPersianDigits(filteredCustomers.length)} از {toPersianDigits(accessibleCustomers.length)} مشتری ثبت شده
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5"
            title="خروجی اکسل CSV"
          >
            <Download className="w-4 h-4" />
            <span>خروجی اکسل</span>
          </button>

          <button
            onClick={onOpenAddCustomerModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مشتری جدید</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، شرکت، تلفن یا ایمیل..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-4 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filters & View Switches */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="vip">مشتریان VIP</option>
              <option value="active">مشتریان فعال</option>
              <option value="negotiating">در حال مذاکره</option>
              <option value="potential">احتمالی</option>
              <option value="lead">سرنخ اولیه</option>
              <option value="inactive">غیرفعال</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">همه انواع</option>
              <option value="company">حقوقی (شرکت)</option>
              <option value="person">حقیقی (شخص)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                }`}
                title="نمایش شبکه‌ای"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                }`}
                title="نمایش جدولی"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid or Table View Rendering */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const statusInfo = getStatusBadge(cust.status);
            return (
              <motion.div
                key={cust.id}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-base border border-indigo-100">
                        {cust.companyName.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800">
                          {cust.companyName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{cust.name}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-medium text-slate-600 py-2 border-y border-slate-100 my-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono dir-ltr">{cust.phone}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{cust.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold text-emerald-700">
                        بودجه: {formatTomans(cust.budget)}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cust.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    آخرین تماس: {formatRelativePersianDate(cust.lastContactDate)}
                  </span>

                  <button
                    onClick={() => onSelectCustomer(cust.id)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>مشاهده پرونده</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="p-4">نام شرکت / شخص</th>
                  <th className="p-4">رابط اصلی</th>
                  <th className="p-4">تلفن تماس</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">بودجه تخمینی</th>
                  <th className="p-4">آخرین تماس</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredCustomers.map((cust) => {
                  const statusInfo = getStatusBadge(cust.status);
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{cust.companyName}</td>
                      <td className="p-4">{cust.name}</td>
                      <td className="p-4 font-mono dir-ltr text-right">{cust.phone}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-700">
                        {formatTomans(cust.budget)}
                      </td>
                      <td className="p-4">{formatRelativePersianDate(cust.lastContactDate)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onSelectCustomer(cust.id)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>پرونده</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
