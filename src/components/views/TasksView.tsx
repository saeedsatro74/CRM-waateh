import React, { useState } from 'react';
import { useCRMStore } from '../../lib/store';
import { Task, TaskPriority, TaskType } from '../../types';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPersianDigits } from '../../lib/utils';

export const TasksView: React.FC = () => {
  const { accessibleTasks, addTask, toggleTaskStatus, deleteTask, state, currentUser } =
    useCRMStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState(currentUser?.id || 'user-2');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [taskType, setTaskType] = useState<TaskType>('call');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = accessibleTasks.filter((t) => {
    if (activeFilter === 'today') return t.dueDate === todayStr;
    if (activeFilter === 'pending') return t.status !== 'completed';
    if (activeFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCust = state.customers.find((c) => c.id === customerId);

    addTask({
      title,
      description,
      customerId: selectedCust?.id,
      customerName: selectedCust ? `${selectedCust.name} (${selectedCust.companyName})` : undefined,
      assignedToUserId,
      dueDate,
      priority,
      status: 'pending',
      type: taskType,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
              وظایف، پیگیری‌ها و یادآوری‌ها
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              مدیریت برنامه کاری روزانه، تماس‌های پیگیری و تخصیص به کارمندان
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>وظیفه جدید</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'all', label: 'همه وظایف' },
          { id: 'today', label: 'پیگیری‌های امروز' },
          { id: 'pending', label: 'در انتظار انجام' },
          { id: 'completed', label: 'انجام شده' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80">
            <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-600" />
            <p className="text-xs font-semibold">هیچ وظیفه‌ای در این دسته‌بندی یافت نشد.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const assignee = state.users.find((u) => u.id === task.assignedToUserId);

            return (
              <motion.div
                key={task.id}
                layout
                className={`p-4 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-50/80 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <h3
                      className={`text-xs sm:text-sm font-extrabold ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 mt-2.5 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.dueDate}</span>
                      </span>
                      {task.customerName && (
                        <span className="text-indigo-600 font-bold">
                          مشتری: {task.customerName}
                        </span>
                      )}
                      {assignee && (
                        <span className="text-slate-600">مسئول: {assignee.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      task.priority === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.priority === 'high' ? 'فوری' : 'عادی'}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 dir-rtl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">تعریف وظیفه و پیگیری جدید</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    عنوان وظیفه
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="عنوان پیگیری..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    انتخاب مشتری (اختیاری)
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                  >
                    <option value="">بدون انتخاب مشتری مشخص</option>
                    {state.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      مسئول انجام
                    </label>
                    <select
                      value={assignedToUserId}
                      onChange={(e) => setAssignedToUserId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      {state.users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      تاریخ سررسید
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    توضیحات تکمیلی
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="توضیحات پیگیری..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-200"
                  >
                    ثبت وظیفه
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
