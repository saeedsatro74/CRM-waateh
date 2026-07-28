import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../types';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  PhoneCall,
  Mail,
  Users,
  Trash2,
  Edit3,
  Search,
  Filter,
  Check,
  FileText,
  Phone,
  MessageSquare,
  Building2,
  Send,
  Wrench,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  ListFilter,
  CalendarDays,
  DollarSign,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TasksView: React.FC = () => {
  const {
    accessibleTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    accessibleCustomers,
    users,
    currentUser,
    addCommunication,
  } = useCRMStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'schedule'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'overdue' | 'pending' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [taskForOutcome, setTaskForOutcome] = useState<Task | null>(null);
  const [outcomeText, setOutcomeText] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState(currentUser?.id || 'user-2');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('10:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [taskType, setTaskType] = useState<TaskType>('call');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [reminderMinutes, setReminderMinutes] = useState<number>(30);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for Persian numbers
  const formatNum = (num: number) => new Intl.NumberFormat('fa-IR').format(num);

  // Type Badges & Icons Configuration
  const typeConfig: Record<TaskType, { label: string; icon: any; bg: string; text: string }> = {
    call: { label: 'تماس تلفنی', icon: PhoneCall, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    meeting: { label: 'جلسه حضوری', icon: Users, bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
    quote: { label: 'پیگیری پیش‌فاکتور', icon: FileText, bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
    financial: { label: 'پیگیری مالی و چک', icon: DollarSign, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    service: { label: 'بازدید/خدمات فنی', icon: Wrench, bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
    email: { label: 'ایمیل / پیامک', icon: Mail, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    followup: { label: 'پیگیری عمومی', icon: Send, bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
    other: { label: 'سایر امور', icon: CheckSquare, bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
  };

  const priorityBadges: Record<TaskPriority, { label: string; bg: string; text: string }> = {
    urgent: { label: 'فوری و اضطراری', bg: 'bg-rose-100 border border-rose-200', text: 'text-rose-800' },
    high: { label: 'اولویت بالا', bg: 'bg-amber-100 border border-amber-200', text: 'text-amber-800' },
    medium: { label: 'اولویت متوسط', bg: 'bg-sky-100 border border-sky-200', text: 'text-sky-800' },
    low: { label: 'عادی / کم', bg: 'bg-slate-100 border border-slate-200', text: 'text-slate-700' },
  };

  const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; icon: any }> = {
    pending: { label: 'در انتظار انجام', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
    in_progress: { label: 'در حال انجام', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', icon: PlayCircle },
    completed: { label: 'تکمیل شده', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
    cancelled: { label: 'لغو شده / باطل', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-500', icon: XCircle },
  };

  // Filter Tasks
  const filteredTasks = accessibleTasks.filter((t) => {
    const isOverdue = t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate < todayStr;

    if (activeTab === 'today' && t.dueDate !== todayStr) return false;
    if (activeTab === 'overdue' && !isOverdue) return false;
    if (activeTab === 'pending' && (t.status === 'completed' || t.status === 'cancelled')) return false;
    if (activeTab === 'completed' && t.status !== 'completed') return false;

    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assignedFilter !== 'all' && t.assignedToUserId !== assignedFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCust = (t.customerName || '').toLowerCase().includes(q);
      const matchComp = (t.companyName || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchOutcome = (t.outcome || '').toLowerCase().includes(q);
      return matchTitle || matchCust || matchComp || matchDesc || matchOutcome;
    }

    return true;
  });

  // Analytics Stats
  const totalCount = accessibleTasks.length;
  const todayCount = accessibleTasks.filter((t) => t.dueDate === todayStr).length;
  const overdueCount = accessibleTasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate < todayStr
  ).length;
  const completedCount = accessibleTasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Handlers for Add/Edit
  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCustomerId('');
    setCustomerName('');
    setCompanyName('');
    setPhone('');
    setAssignedToUserId(currentUser?.id || 'user-2');
    setDueDate(todayStr);
    setDueTime('10:00');
    setPriority('medium');
    setTaskType('call');
    setStatus('pending');
    setReminderMinutes(30);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCustomerId(task.customerId || '');
    setCustomerName(task.customerName || '');
    setCompanyName(task.companyName || '');
    setPhone(task.phone || '');
    setAssignedToUserId(task.assignedToUserId);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime || '10:00');
    setPriority(task.priority);
    setTaskType(task.type);
    setStatus(task.status);
    setReminderMinutes(task.reminderMinutesBefore || 30);
    setIsFormModalOpen(true);
  };

  const handleCustomerSelect = (cust: any) => {
    if (!cust) return;
    setCustomerId(cust.id);
    setCustomerName(cust.name);
    setCompanyName(cust.companyName);
    setPhone(cust.phone);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        customerId,
        customerName,
        companyName,
        phone,
        assignedToUserId,
        dueDate,
        dueTime,
        priority,
        type: taskType,
        status,
        reminderMinutesBefore: reminderMinutes,
      });
    } else {
      addTask({
        title,
        description,
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        companyName: companyName || undefined,
        phone: phone || undefined,
        assignedToUserId,
        dueDate,
        dueTime,
        priority,
        type: taskType,
        status,
        reminderMinutesBefore: reminderMinutes,
      });
    }

    setIsFormModalOpen(false);
  };

  // Quick Outcome Modal
  const handleOpenOutcome = (task: Task) => {
    setTaskForOutcome(task);
    setOutcomeText(task.outcome || '');
    setIsOutcomeModalOpen(true);
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForOutcome) return;

    updateTask(taskForOutcome.id, {
      status: 'completed',
      outcome: outcomeText,
    });

    // Also auto-log as a communication history record if customer is present
    if (taskForOutcome.customerId || customerId) {
      addCommunication({
        customerId: taskForOutcome.customerId || customerId,
        customerName: taskForOutcome.customerName || customerName || 'مشتری واته',
        type: taskForOutcome.type === 'meeting' ? 'meeting' : 'call',
        summary: `تکمیل پیگیری: ${taskForOutcome.title}`,
        details: outcomeText,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        recordedByUserId: currentUser?.id || 'user-1',
        outcome: outcomeText,
      });
    }

    setIsOutcomeModalOpen(false);
    setTaskForOutcome(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn dir-rtl">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              مدیریت وظایف، پیگیری‌ها و یادآوری‌های روزانه
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              برنامه‌ریزی دقیق تماس‌های پیگیری خریداران، جلسات، پیگیری پیش‌فاکتورها، چک و خدمات فنی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت پیگیری / وظیفه جدید</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">کل وظایف و پیگیری‌ها</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatNum(totalCount)} فقره</p>
            <p className="text-[11px] text-slate-400 mt-1">تخصیص یافته در سامانه</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">پیگیری‌های برنامه‌ریزی شده امروز</p>
            <p className="text-lg font-bold text-emerald-600 mt-1">{formatNum(todayCount)} فقره</p>
            <p className="text-[11px] text-emerald-600/80 mt-1">سررسید امروز</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">پیگیری‌های معوقه و دارای تاخیر</p>
            <p className="text-lg font-bold text-rose-600 mt-1">{formatNum(overdueCount)} فقره</p>
            <p className="text-[11px] text-rose-600/80 mt-1">نیازمند اقدام فوری</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">نرخ و تعداد تکمیل شده</p>
            <p className="text-lg font-bold text-indigo-600 mt-1">
              {formatNum(completedCount)} <span className="text-xs font-normal text-slate-500">({completionRate}٪)</span>
            </p>
            <p className="text-[11px] text-indigo-600/80 mt-1">با ثبت گزارش بازخورد</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main View Mode & Filter Switchers Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Top Controls: View Switcher & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* View Modes */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>نمای لیستی</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>بورد کانبان</span>
            </button>

            <button
              onClick={() => setViewMode('schedule')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'schedule'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>برنامه روزانه</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در عنوان، نام مشتری، شرکت، توضیحات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Bottom Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Time & Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'همه پیگیری‌ها' },
              { id: 'today', label: 'پیگیری‌های امروز' },
              { id: 'overdue', label: 'معوقه و تاخیردار' },
              { id: 'pending', label: 'در انتظار انجام' },
              { id: 'completed', label: 'تکمیل شده' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">همه انواع پیگیری</option>
              <option value="call">📞 تماس تلفنی</option>
              <option value="meeting">🤝 جلسه حضوری</option>
              <option value="quote">📄 پیگیری پیش‌فاکتور</option>
              <option value="financial">💳 پیگیری مالی و چک</option>
              <option value="service">🛠️ خدمات و بازدید فنی</option>
              <option value="email">✉️ ایمیل و پیامک</option>
              <option value="followup">📩 پیگیری عمومی</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="urgent">🔴 فوری و اضطراری</option>
              <option value="high">🟧 اولویت بالا</option>
              <option value="medium">🟦 اولویت متوسط</option>
              <option value="low">⬜ عادی</option>
            </select>

            {/* Assigned Staff Filter */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">همه کارشناسان مسئول</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.department})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 shadow-xs">
              <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-600">هیچ وظیفه یا پیگیری با این مشخصات یافت نشد.</p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن اولین پیگیری</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'completed';
              const isOverdue = !isDone && task.status !== 'cancelled' && task.dueDate < todayStr;
              const assignee = users.find((u) => u.id === task.assignedToUserId);
              const typeCfg = typeConfig[task.type] || typeConfig.other;
              const prioCfg = priorityBadges[task.priority] || priorityBadges.medium;
              const TypeIcon = typeCfg.icon;

              return (
                <motion.div
                  key={task.id}
                  layout
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-slate-50/90 border-slate-200 opacity-80'
                      : isOverdue
                      ? 'bg-rose-50/30 border-rose-200 shadow-xs hover:border-rose-300'
                      : 'bg-white border-slate-200 shadow-xs hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      title={isDone ? 'تغییر به در انتظار' : 'علامت زدن به عنوان انجام شده'}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 hover:border-emerald-600 bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${typeCfg.bg} ${typeCfg.text}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          <span>{typeCfg.label}</span>
                        </span>

                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${prioCfg.bg} ${prioCfg.text}`}>
                          {prioCfg.label}
                        </span>

                        {/* Overdue Alert Badge */}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>معوقه ({task.dueDate})</span>
                          </span>
                        )}

                        <h3 className={`text-xs sm:text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </h3>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-600 leading-relaxed pr-0.5">{task.description}</p>
                      )}

                      {/* Customer & Assignee Meta Row */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-medium">{task.dueDate}</span>
                          {task.dueTime && <span className="font-mono text-slate-400">({task.dueTime})</span>}
                        </div>

                        {(task.companyName || task.customerName) && (
                          <div className="flex items-center gap-1 text-teal-700 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>{task.companyName || task.customerName}</span>
                            {task.customerName && task.companyName && (
                              <span className="text-slate-400 font-normal">({task.customerName})</span>
                            )}
                          </div>
                        )}

                        {assignee && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>مسئول: {assignee.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Recorded Outcome / Notes */}
                      {task.outcome && (
                        <div className="mt-2 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                          <span className="font-bold block mb-0.5">گزارش و نتیجه ثبت شده:</span>
                          <p>{task.outcome}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Log Outcome Button */}
                    <button
                      onClick={() => handleOpenOutcome(task)}
                      title="ثبت گزارش و نتیجه پیگیری"
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{task.outcome ? 'ویرایش نتیجه' : 'ثبت نتیجه'}</span>
                    </button>

                    {/* Direct Call if Phone available */}
                    {task.phone && (
                      <a
                        href={`tel:${task.phone}`}
                        title={`تماس تلفنی با ${task.phone}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {/* Edit Task */}
                    <button
                      onClick={() => handleOpenEdit(task)}
                      title="ویرایش کامل وظیفه"
                      className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Task */}
                    <button
                      onClick={() => {
                        if (confirm('آیا از حذف این وظیفه اطمینان دارید؟')) {
                          deleteTask(task.id);
                        }
                      }}
                      title="حذف وظیفه"
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(
            [
              { status: 'pending', title: '⏳ در انتظار انجام', bg: 'bg-amber-50/50 border-amber-200' },
              { status: 'in_progress', title: '⚡ در حال انجام', bg: 'bg-sky-50/50 border-sky-200' },
              { status: 'completed', title: '✅ تکمیل شده', bg: 'bg-emerald-50/50 border-emerald-200' },
              { status: 'cancelled', title: '❌ لغو شده', bg: 'bg-slate-50 border-slate-200' },
            ] as const
          ).map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div key={col.status} className={`p-4 rounded-2xl border ${col.bg} flex flex-col min-h-[450px]`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                  <h3 className="font-bold text-xs text-slate-800">{col.title}</h3>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold text-slate-600">
                    {formatNum(colTasks.length)}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">هیچ وظیفه‌ای وجود ندارد</div>
                  ) : (
                    colTasks.map((t) => {
                      const typeCfg = typeConfig[t.type] || typeConfig.other;
                      const prioCfg = priorityBadges[t.priority] || priorityBadges.medium;

                      return (
                        <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${prioCfg.bg} ${prioCfg.text}`}>
                              {prioCfg.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{t.dueDate}</span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{t.title}</h4>
                          {t.companyName && <p className="text-[11px] text-teal-700 font-semibold">{t.companyName}</p>}

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <select
                              value={t.status}
                              onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded-md p-1 font-medium cursor-pointer"
                            >
                              <option value="pending">در انتظار</option>
                              <option value="in_progress">در حال انجام</option>
                              <option value="completed">تکمیل شده</option>
                              <option value="cancelled">لغو شده</option>
                            </select>

                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: SCHEDULE / TODAY'S AGENDA */}
      {viewMode === 'schedule' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">برنامه زمان‌بندی کاری و پیگیری‌های امروز ({todayStr})</h3>
              <p className="text-xs text-slate-500 mt-0.5">ترتیب امور بر اساس ساعت انجام و اولویت سررسید</p>
            </div>
            <div className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
              {formatNum(accessibleTasks.filter((t) => t.dueDate === todayStr).length)} پیگیری امروز
            </div>
          </div>

          <div className="space-y-4">
            {accessibleTasks.filter((t) => t.dueDate === todayStr).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                هیچ پیگیری برای امروز برنامه‌ریزی نشده است.
              </div>
            ) : (
              accessibleTasks
                .filter((t) => t.dueDate === todayStr)
                .map((task) => {
                  const isDone = task.status === 'completed';
                  const typeCfg = typeConfig[task.type] || typeConfig.other;
                  const TypeIcon = typeCfg.icon;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                        isDone ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center font-mono font-bold text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          {task.dueTime || '۱۰:۰۰'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeCfg.bg} ${typeCfg.text}`}>
                              {typeCfg.label}
                            </span>
                            <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </h4>
                          </div>
                          {task.companyName && (
                            <p className="text-xs text-slate-500 mt-1">مشتری: {task.companyName}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenOutcome(task)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          ثبت گزارش
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 my-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckSquare className="w-5 h-5" />
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    {editingTask ? 'ویرایش کامل پیگیری / وظیفه' : 'تعریف و ثبت وظیفه یا پیگیری جدید'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عنوان وظیفه / پیگیری *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: پیگیری استعلام قیمت چیلر تراکمی ۶۰ تن..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Type & Priority Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نوع پیگیری</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white cursor-pointer"
                    >
                      <option value="call">📞 تماس تلفنی</option>
                      <option value="meeting">🤝 جلسه حضوری</option>
                      <option value="quote">📄 پیگیری پیش‌فاکتور</option>
                      <option value="financial">💳 پیگیری مالی و چک</option>
                      <option value="service">🛠️ خدمات و بازدید فنی</option>
                      <option value="email">✉️ ایمیل و پیامک</option>
                      <option value="followup">📩 پیگیری عمومی</option>
                      <option value="other">سایر امور</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اولویت</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white cursor-pointer"
                    >
                      <option value="urgent">🔴 فوری و اضطراری</option>
                      <option value="high">🟧 اولویت بالا</option>
                      <option value="medium">🟦 اولویت متوسط</option>
                      <option value="low">⬜ عادی / کم</option>
                    </select>
                  </div>
                </div>

                {/* Customer Selector */}
                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      انتخاب خریدار / تامین‌کننده ارتباطی (اختیاری):
                    </label>
                    <select
                      value={customerId}
                      onChange={(e) => {
                        const cust = accessibleCustomers.find((c) => c.id === e.target.value);
                        handleCustomerSelect(cust);
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs cursor-pointer"
                    >
                      <option value="">-- بدون انتخاب از لیست یا ثبت دستی --</option>
                      {accessibleCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} - {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">نام شرکت / خریدار</label>
                      <input
                        type="text"
                        placeholder="مثال: شرکت داروسازی البرز"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">شماره تماس مستقیم</label>
                      <input
                        type="text"
                        placeholder="۰۹۱۲..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignee & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">کارشناس مسئول</label>
                    <select
                      value={assignedToUserId}
                      onChange={(e) => setAssignedToUserId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white cursor-pointer"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاریخ سررسید</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ساعت انجام</label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">دستورالعمل و توضیحات تکمیلی</label>
                  <textarea
                    rows={3}
                    placeholder="توضیحات مفصل، سوالات کلیدی، تخفیف‌های احتمالی یا نکات فنی..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingTask ? 'ذخیره تغییرات' : 'ثبت پیگیری'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OUTCOME / FOLLOW-UP RESULT MODAL */}
      <AnimatePresence>
        {isOutcomeModalOpen && taskForOutcome && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-bold text-slate-800 text-sm">ثبت گزارش و نتیجه پیگیری</h3>
                </div>
                <button onClick={() => setIsOutcomeModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block mb-0.5">عنوان پیگیری:</span>
                <span className="font-bold text-slate-800">{taskForOutcome.title}</span>
                {taskForOutcome.companyName && (
                  <span className="text-teal-700 block mt-1 font-semibold">مشتری: {taskForOutcome.companyName}</span>
                )}
              </div>

              <form onSubmit={handleSaveOutcome} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    نتیجه گفتگو / خلاصه اقدام انجام شده *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="مثال: با مدیر خریدار صحبت شد. پیشنهاد پیش‌فاکتور جدید با ۵٪ تخفیف ارائه گردید و قرار شد روز شنبه جهت تایید نهایی تماس گرفته شود..."
                    value={outcomeText}
                    onChange={(e) => setOutcomeText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px]">
                  💡 ثبت گزارش همزمان وضعیت وظیفه را به <span className="font-bold">«تکمیل شده»</span> تغییر داده و سابقه تماس را در پرونده مشتری درج می‌کند.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOutcomeModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    ثبت و تکمیل وظیفه
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
