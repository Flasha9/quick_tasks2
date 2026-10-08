import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Briefcase,
  Home,
  ShoppingCart,
  GraduationCap,
  Layers,
  Tag,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { PriorityLevel } from '../models/task';
import { AddCategoryModal } from './AddCategoryModal';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  ShoppingCart: <ShoppingCart className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Tag: <Tag className="w-4 h-4" />,
};

export const FilterBar: React.FC = () => {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    tasks,
  } = useTaskContext();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Calculate badges for categories
  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return tasks.length;
    return tasks.filter(t => t.categoryId === catId).length;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(
    t => !t.isCompleted && t.dueDate && t.dueDate < todayStr
  ).length;

  return (
    <div className="space-y-3">
      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث سريع في المهام والملاحظات..."
            className="w-full pr-10 pl-9 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value as PriorityLevel | 'all')}
              aria-label="تصفية حسب الأولوية"
              className="appearance-none bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-3 py-2.5 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="all">كل الأولويات</option>
              <option value="high">🔴 عاجل</option>
              <option value="medium">🟡 متوسط</option>
              <option value="low">🟢 عادي</option>
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              aria-label="ترتيب المهام"
              className="appearance-none bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-3 py-2.5 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="manual">الترتيب الافتراضي</option>
              <option value="quality">حسب درجة الإتقان 🌟</option>
              <option value="priority">حسب الأولوية</option>
              <option value="dueDate">حسب تاريخ الاستحقاق</option>
              <option value="title">أبجدياً (أ-ي)</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          const icon = CATEGORY_ICONS[cat.icon] || <Tag className="w-4 h-4" />;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60'
              }`}
            >
              <span style={{ color: isSelected ? '#ffffff' : cat.color }}>
                {icon}
              </span>
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Add new category button */}
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-dashed border-indigo-300 dark:border-indigo-800 font-bold transition-colors whitespace-nowrap cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>تصنيف جديد</span>
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          الكل ({tasks.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          النشطة ({tasks.filter(t => !t.isCompleted).length})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          المكتملة ({tasks.filter(t => t.isCompleted).length})
        </button>
        <button
          onClick={() => setStatusFilter('today')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'today'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>مهام اليوم ({tasks.filter(t => t.dueDate === todayStr).length})</span>
        </button>
        {overdueCount > 0 && (
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>متأخرة ({overdueCount})</span>
          </button>
        )}
      </div>

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};
