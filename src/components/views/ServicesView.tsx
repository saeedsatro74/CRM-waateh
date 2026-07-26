import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { ServiceRequest, ServiceStatus, ServicePriority, ServiceType } from '../../types';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building2,
  DollarSign,
  X,
  ChevronRight,
  Send,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ServicesView: React.FC = () => {
  const { serviceRequests, addServiceRequest, updateServiceRequestStatus, deleteServiceRequest, accessibleCustomers, users } = useCRMStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState(accessibleCustomers[0]?.id || '');
  const [deviceModel, setDeviceModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('breakdown');
  const [priority, setPriority] = useState<ServicePriority>('high');
  const [issueDescription, setIssueDescription] = useState('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(users.find(u => u.role === 'support')?.id || users[0]?.id || '');
  const [estimatedCost, setEstimatedCost] = useState('25000000');

  const filteredRequests = serviceRequests.filter((req) => {
    const matchesSearch =
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.serialNumber && req.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatusFilter === 'all' || req.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel.trim() || !issueDescription.trim()) return;

    const customer = accessibleCustomers.find((c) => c.id === customerId);
    const tech = users.find((u) => u.id === assignedTechnicianId);

    addServiceRequest({
      customerId: customer?.id || 'cust-1',
      customerName: customer?.name || 'مشتری شرکتی',
      companyName: customer?.companyName || 'مجموعه صنعتی',
      deviceModel,
      serialNumber,
      serviceType,
      issueDescription,
      priority,
      status: 'registered',
      assignedTechnicianId: tech?.id,
      assignedTechnicianName: tech?.name || 'کارشناس فنی واته',
      estimatedCost: parseInt(estimatedCost) || 0,
    });

    setDeviceModel('');
    setSerialNumber('');
    setIssueDescription('');
    setShowAddModal(false);
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'registered':
        return { label: 'ثبت شده اولیه', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'diagnosing':
        return { label: 'در حال عیب‌یابی', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'in_repair':
        return { label: 'در حال تعمیر', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'waiting_parts':
        return { label: 'منتظر تامین قطعه', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'completed':
        return { label: 'تعمیر تکمیل شد', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'delivered':
        return { label: 'تحویل مشتری شد', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getPriorityBadge = (priority: ServicePriority) => {
    switch (priority) {
      case 'urgent':
        return { label: 'اورژانسی / توقف خط', bg: 'bg-rose-500 text-white' };
      case 'high':
        return { label: 'اولویت بالا', bg: 'bg-amber-500 text-white' };
      case 'medium':
        return { label: 'اولویت متوسط', bg: 'bg-sky-500 text-white' };
      case 'low':
        return { label: 'اولویت عادی', bg: 'bg-slate-500 text-white' };
    }
  };

  const getServiceTypeTitle = (type: ServiceType) => {
    switch (type) {
      case 'breakdown': return 'اعلام خرابی دستگاه';
      case 'periodic_maintenance': return 'سرویس دوره‌ای نگهداری';
      case 'installation': return 'نصب و راه‌اندازی اولویت‌دار';
      case 'calibration': return 'کالیبراسیون و تنظیم دسرسی';
      case 'warranty': return 'تعمیرات گارانتی شرکتی';
    }
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#d0dbe5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">خدمات فنی، خرابی و پیگیری تعمیرات WAATEH</h2>
              <p className="text-xs text-slate-500 font-medium">
                مدیریت درخواست‌های پشتیبانی، عیب‌یابی دستگاه‌ها و وضعیت تعمیرات تجهیزات صنعتی شرکت واته
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-teal-900/10 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت درخواست خدمات / خرابی دستگاه</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#d0dbe5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">کل درخواست‌ها</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{serviceRequests.length}</div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#d0dbe5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">در حال تعمیر / عیب‌یابی</span>
            <div className="text-xl font-extrabold text-amber-600 mt-1">
              {serviceRequests.filter((s) => s.status === 'in_repair' || s.status === 'diagnosing').length}
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#d0dbe5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">خرابی‌های اضطراری</span>
            <div className="text-xl font-extrabold text-rose-600 mt-1">
              {serviceRequests.filter((s) => s.priority === 'urgent' && s.status !== 'completed').length}
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#d0dbe5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">تکمیل شده</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">
              {serviceRequests.filter((s) => s.status === 'completed' || s.status === 'delivered').length}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی کد درخواست، دستگاه، شماره سریال..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">وضعیت:</span>
          {[
            { id: 'all', label: 'همه' },
            { id: 'registered', label: 'ثبت شده' },
            { id: 'diagnosing', label: 'عیب‌یابی' },
            { id: 'in_repair', label: 'در حال تعمیر' },
            { id: 'waiting_parts', label: 'منتظر قطعه' },
            { id: 'completed', label: 'تکمیل شده' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatusFilter === f.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Request Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req) => {
          const statusBadge = getStatusBadge(req.status);
          const priorityBadge = getPriorityBadge(req.priority);

          return (
            <motion.div
              key={req.id}
              whileHover={{ y: -2 }}
              className="bg-white p-5 rounded-2xl border border-[#d0dbe5] shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-800 font-mono text-[11px] font-extrabold rounded-md border border-teal-200">
                        {req.requestNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${priorityBadge.bg}`}>
                        {priorityBadge.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-2">{req.deviceModel}</h3>
                    {req.serialNumber && (
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">سریال: {req.serialNumber}</p>
                    )}
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800">{req.companyName}</span>
                    <span className="text-slate-400">({req.customerName})</span>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-slate-700">{req.issueDescription}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                    <div>
                      <span className="font-bold text-slate-600">تکنسین مسوول: </span>
                      <span>{req.assignedTechnicianName || 'تعیین نشده'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600">هزینه تخمینی: </span>
                      <span className="font-mono text-slate-800 font-bold">{req.estimatedCost?.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Change Buttons & Actions */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-400">تاریخ ثبت: {req.createdAt}</div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={req.status}
                    onChange={(e) => updateServiceRequestStatus(req.id, e.target.value as ServiceStatus)}
                    className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="registered">ثبت شده</option>
                    <option value="diagnosing">در حال عیب‌یابی</option>
                    <option value="in_repair">در حال تعمیر</option>
                    <option value="waiting_parts">منتظر قطعه</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="delivered">تحویل مشتری</option>
                  </select>

                  <button
                    onClick={() => deleteServiceRequest(req.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="حذف درخواست"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-[#d0dbe5] text-center text-slate-500">
          <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700">هیچ درخواست خدماتی یافت نشد</h3>
          <p className="text-xs text-slate-400 mt-1">با فیلترهای دیگر جستجو کنید یا درخواست جدیدی ثبت کنید.</p>
        </div>
      )}

      {/* Add Service Request Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 dir-rtl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-teal-700" />
                  <h2 className="text-sm font-bold text-slate-900">ثبت درخواست خدمات و خرابی دستگاه WAATEH</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateServiceRequest} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">انتخاب مشتری</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  >
                    {accessibleCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نام دستگاه / تجهیز</label>
                    <input
                      type="text"
                      required
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder="مثلا: فرز CNC مدل VMC-850"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره سریال دستگاه</label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="W-VMC-2024-..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع خدمات</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as ServiceType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="breakdown">خرابی و توقف دستگاه</option>
                      <option value="periodic_maintenance">سرویس دوره‌ای</option>
                      <option value="installation">نصب و راه‌اندازی</option>
                      <option value="calibration">کالیبراسیون و تنظیمات</option>
                      <option value="warranty">تعمیرات گارانتی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اولویت انجام</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as ServicePriority)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="urgent">اورژانسی (توقف خط تولید)</option>
                      <option value="high">اولویت بالا</option>
                      <option value="medium">اولویت متوسط</option>
                      <option value="low">اولویت عادی</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">تکنسین یا کارشناس مسوول</label>
                    <select
                      value={assignedTechnicianId}
                      onChange={(e) => setAssignedTechnicianId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">هزینه تخمینی (تومان)</label>
                    <input
                      type="number"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">شرح کامل مشکل و خرابی</label>
                  <textarea
                    rows={3}
                    required
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="علائم خرابی، ارورهای نمایش داده شده یا قطعات نیازمند تعویض را بنویسید..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10"
                  >
                    ثبت درخواست و صدور کد پیگیری
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
