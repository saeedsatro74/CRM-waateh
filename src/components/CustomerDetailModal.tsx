import React, { useState } from 'react';
import { Customer, CustomerStatus, CommunicationType, TaskPriority } from '../types';
import { useCRMStore } from '../lib/store';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  MessageSquare,
  Users,
  Paperclip,
  Edit3,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTomans, formatRelativePersianDate } from '../lib/utils';

interface CustomerDetailModalProps {
  customerId: string | null;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customerId,
  onClose,
}) => {
  const {
    allCustomers,
    updateCustomer,
    deleteCustomer,
    communications,
    addCommunication,
    allTasks,
    addTask,
    customerFiles,
    addCustomerFile,
    deleteCustomerFile,
    state,
    currentUser,
  } = useCRMStore();

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'timeline' | 'tasks' | 'files'>('info');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);

  // New Communication Form State
  const [showAddComm, setShowAddComm] = useState(false);
  const [commType, setCommType] = useState<CommunicationType>('call');
  const [commSummary, setCommSummary] = useState('');
  const [commDetails, setCommDetails] = useState('');
  const [commDuration, setCommDuration] = useState('15');

  // New Task Form State
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');

  // New Tag State
  const [newTagInput, setNewTagInput] = useState('');

  if (!customerId) return null;

  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer) return null;

  const custCommunications = communications.filter((c) => c.customerId === customer.id);
  const custTasks = allTasks.filter((t) => t.customerId === customer.id);
  const custFiles = customerFiles.filter((f) => f.customerId === customer.id);

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'vip':
        return { label: 'مشتری VIP', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'active':
        return { label: 'مشتری فعال', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'negotiating':
        return { label: 'در حال مذاکره', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'potential':
        return { label: 'مشتری احتمالی', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'lead':
        return { label: 'سرنخ اولیه', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'inactive':
        return { label: 'غیرفعال', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'lost':
        return { label: 'از دست رفته', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const statusInfo = getStatusBadge(customer.status);

  const handleStatusChange = (newStatus: CustomerStatus) => {
    updateCustomer(customer.id, { status: newStatus });
  };

  const handleAddCommSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSummary.trim()) return;

    addCommunication({
      customerId: customer.id,
      customerName: `${customer.name} (${customer.companyName})`,
      type: commType,
      summary: commSummary,
      details: commDetails,
      date: new Date().toLocaleString('fa-IR'),
      recordedByUserId: currentUser?.id || 'user-1',
      durationMinutes: parseInt(commDuration) || 0,
    });

    setCommSummary('');
    setCommDetails('');
    setShowAddComm(false);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      description: `پیگیری مربوط به ${customer.name}`,
      customerId: customer.id,
      customerName: `${customer.name} (${customer.companyName})`,
      assignedToUserId: currentUser?.id || 'user-1',
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'pending',
      type: 'followup',
    });

    setTaskTitle('');
    setShowAddTask(false);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    addCustomerFile({
      customerId: customer.id,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} مگابایت`,
      fileType: file.name.split('.').pop() || 'pdf',
      uploadedBy: currentUser?.name || 'کاربر',
    });
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!customer.tags.includes(newTagInput.trim())) {
      updateCustomer(customer.id, { tags: [...customer.tags, newTagInput.trim()] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateCustomer(customer.id, { tags: customer.tags.filter((t) => t !== tagToRemove) });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Drawer Body */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 dir-rtl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-indigo-50/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-indigo-200">
                {customer.companyName.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
                    {customer.companyName}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                  <span>نام رابط: {customer.name}</span>
                  <span>•</span>
                  <span>نوع: {customer.customerType === 'company' ? 'شرکت' : 'شخص حقیقی'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-2xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Quick Selector Bar */}
          <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <span className="text-slate-500 text-[11px] font-bold shrink-0">تغییر وضعیت:</span>
            {(['lead', 'potential', 'negotiating', 'active', 'vip', 'inactive', 'lost'] as CustomerStatus[]).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] transition-all whitespace-nowrap ${
                    customer.status === st
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getStatusBadge(st).label}
                </button>
              )
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 px-5 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('info')}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeSubTab === 'info'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>اطلاعات عمومی و یادداشت</span>
            </button>
            <button
              onClick={() => setActiveSubTab('timeline')}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeSubTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>ارتباطات ({custCommunications.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeSubTab === 'tasks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>وظایف ({custTasks.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('files')}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeSubTab === 'files'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Paperclip className="w-4 h-4" />
              <span>فایل‌ها ({custFiles.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeSubTab === 'info' && (
              <div className="space-y-6">
                {/* Contact Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold">شماره تماس اصلی</div>
                      <div className="text-xs font-bold text-slate-800 font-mono dir-ltr text-right">
                        {customer.phone}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold">پست الکترونیکی</div>
                      <div className="text-xs font-bold text-slate-800 font-mono">
                        {customer.email || 'ثبت نشده'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold">بودجه تخمینی</div>
                      <div className="text-xs font-bold text-emerald-700">
                        {formatTomans(customer.budget)}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold">آخرین تماس</div>
                      <div className="text-xs font-bold text-slate-800">
                        {formatRelativePersianDate(customer.lastContactDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-bold">نشانی شرکت / مشتری</div>
                    <div className="text-xs font-semibold text-slate-800 leading-relaxed mt-0.5">
                      {customer.address || 'آدرسی ثبت نشده است.'}
                    </div>
                  </div>
                </div>

                {/* Tags Manager */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    <span>برچسب‌ها و دسته‌بندی‌ها</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {customer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-100"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="برچسب جدید..."
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                    >
                      افزودن برچسب
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>توضیحات و سوابق مشتری</span>
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={customer.notes}
                    onChange={(e) => updateCustomer(customer.id, { notes: e.target.value })}
                    placeholder="توضیحات اختصاصی مشتری..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 leading-relaxed outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {activeSubTab === 'timeline' && (
              <div className="space-y-4">
                {/* Add Communication Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700">تاریخچه تماس‌ها و جلسات</h3>
                  <button
                    onClick={() => setShowAddComm(!showAddComm)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ثبت ارتباط جدید</span>
                  </button>
                </div>

                {/* Add Communication Form Drawer */}
                {showAddComm && (
                  <form
                    onSubmit={handleAddCommSubmit}
                    className="p-4 bg-slate-50 rounded-2xl border border-indigo-100 space-y-3 animate-fadeIn"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          نوع ارتباط
                        </label>
                        <select
                          value={commType}
                          onChange={(e) => setCommType(e.target.value as CommunicationType)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none"
                        >
                          <option value="call">تماس تلفنی</option>
                          <option value="meeting">جلسه حضوری / آنلاین</option>
                          <option value="whatsapp">پیام واتس‌اپ / ایتا</option>
                          <option value="email">پست الکترونیکی</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          مدت زمان (دقیقه)
                        </label>
                        <input
                          type="number"
                          value={commDuration}
                          onChange={(e) => setCommDuration(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        خلاصه گفتگوی اصلی
                      </label>
                      <input
                        type="text"
                        required
                        value={commSummary}
                        onChange={(e) => setCommSummary(e.target.value)}
                        placeholder="مثلاً: مذاکره درباره تخفیف پیش‌فاکتور..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        جزئیات و توافقات
                      </label>
                      <textarea
                        rows={2}
                        value={commDetails}
                        onChange={(e) => setCommDetails(e.target.value)}
                        placeholder="توضیحات بیشتر..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddComm(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        ثبت نهایی
                      </button>
                    </div>
                  </form>
                )}

                {/* Timeline List */}
                <div className="space-y-3 relative before:absolute before:right-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {custCommunications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      هنوز هیچ ارتباطی برای این مشتری ثبت نشده است.
                    </div>
                  ) : (
                    custCommunications.map((comm) => (
                      <div key={comm.id} className="relative pr-9">
                        <div className="absolute right-2 top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              {comm.summary}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {comm.date}
                            </span>
                          </div>
                          {comm.details && (
                            <p className="text-xs text-slate-600 mt-1">{comm.details}</p>
                          )}
                          <div className="mt-2 text-[10px] text-slate-400 font-medium flex items-center gap-3">
                            <span>نوع: {comm.type}</span>
                            {comm.durationMinutes ? (
                              <span>مدت: {comm.durationMinutes} دقیقه</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700">وظایف و پیگیری‌ها</h3>
                  <button
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تعریف وظیفه جدید</span>
                  </button>
                </div>

                {showAddTask && (
                  <form
                    onSubmit={handleAddTaskSubmit}
                    className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        عنوان وظیفه
                      </label>
                      <input
                        type="text"
                        required
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="عنوان پیگیری..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          تاریخ سررسید
                        </label>
                        <input
                          type="date"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          اولویت
                        </label>
                        <select
                          value={taskPriority}
                          onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none"
                        >
                          <option value="low">کم</option>
                          <option value="medium">متوسط</option>
                          <option value="high">بالا (فوری)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddTask(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                      >
                        ایجاد وظیفه
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {custTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      هیچ وظیفه‌ای ثبت نشده است.
                    </div>
                  ) : (
                    custTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{t.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            موعد: {t.dueDate} • اولویت: {t.priority === 'high' ? 'فوری' : 'عادی'}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status === 'completed' ? 'انجام شد' : 'در انتظار'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'files' && (
              <div className="space-y-4">
                {/* File Upload Box */}
                <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileUploadSim}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">
                    برای آپلود فایل (پیش‌فاکتور، قرارداد، مدارک) اینجا کلیک کنید
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    پشتیبانی از فرمت‌های PDF, DOCX, JPG, PNG
                  </div>
                </div>

                <div className="space-y-2">
                  {custFiles.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      هیچ فایلی برای این مشتری آپلود نشده است.
                    </div>
                  ) : (
                    custFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{file.fileName}</div>
                            <div className="text-[10px] text-slate-400">
                              {file.fileSize} • ثبت توسط: {file.uploadedBy} ({file.uploadedAt})
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteCustomerFile(file.id, customer.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delete Customer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm(`آیا از حذف مشتری «${customer.companyName}» اطمینان دارید؟`)) {
                  deleteCustomer(customer.id);
                  onClose();
                }
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف این مشتری</span>
            </button>

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              بستن پنجره
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
