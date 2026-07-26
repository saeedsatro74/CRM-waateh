import React, { useState, useEffect } from 'react';
import { useCRMStore } from '../lib/store';
import { Search, Users, KanbanSquare, CheckSquare, Package, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTomans } from '../lib/utils';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customerId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  onNavigateTab,
}) => {
  const { allCustomers, allDeals, allTasks, products } = useCRMStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state toggle
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCustomers = query.trim()
    ? allCustomers.filter(
        (c) =>
          c.name.includes(query) ||
          c.companyName.includes(query) ||
          c.phone.includes(query) ||
          c.email.includes(query)
      )
    : allCustomers.slice(0, 3);

  const filteredDeals = query.trim()
    ? allDeals.filter(
        (d) =>
          d.title.includes(query) ||
          d.customerName.includes(query) ||
          d.companyName.includes(query)
      )
    : allDeals.slice(0, 3);

  const filteredTasks = query.trim()
    ? allTasks.filter(
        (t) => t.title.includes(query) || (t.customerName && t.customerName.includes(query))
      )
    : allTasks.slice(0, 2);

  const filteredProducts = query.trim()
    ? products.filter((p) => p.name.includes(query) || p.code.includes(query))
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden dir-rtl"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <Search className="w-5 h-5 text-indigo-600 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی هوشمند در مشتریان، فرصت‌ها، وظایف و خدمات..."
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Customers Section */}
            {filteredCustomers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 px-2 mb-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>مشتریان</span>
                </div>
                <div className="space-y-1">
                  {filteredCustomers.map((cust) => (
                    <button
                      key={cust.id}
                      onClick={() => {
                        onSelectCustomer(cust.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-sky-50 transition-colors text-right group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                          {cust.name} ({cust.companyName})
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {cust.phone} • {cust.email}
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Deals Section */}
            {filteredDeals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 px-2 mb-2">
                  <KanbanSquare className="w-4 h-4 text-purple-600" />
                  <span>فرصت‌های فروش</span>
                </div>
                <div className="space-y-1">
                  {filteredDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => {
                        onNavigateTab('deals');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-purple-50 transition-colors text-right group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                          {deal.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {deal.companyName} • {formatTomans(deal.value)}
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Section */}
            {filteredTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 px-2 mb-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>وظایف</span>
                </div>
                <div className="space-y-1">
                  {filteredTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        onNavigateTab('tasks');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50 transition-colors text-right group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          موعد: {task.dueDate} • {task.customerName || 'بدون مشتری'}
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {filteredProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 px-2 mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>محصولات و خدمات</span>
                </div>
                <div className="space-y-1">
                  {filteredProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        onNavigateTab('products');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-blue-50 transition-colors text-right group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                          {prod.name} ({prod.code})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatTomans(prod.price)} / {prod.unit}
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() &&
              filteredCustomers.length === 0 &&
              filteredDeals.length === 0 &&
              filteredTasks.length === 0 &&
              filteredProducts.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  هیچ موردی با عبارت «{query}» یافت نشد.
                </div>
              )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
            برای خروج دکمه ESC یا آیکون بستن را فشار دهید.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
