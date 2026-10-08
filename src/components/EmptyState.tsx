import React from 'react';
import { Inbox, SearchX, CheckCircle, Sparkles } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const EmptyState: React.FC = () => {
  const { tasks, searchQuery, selectedCategory, selectedPriority, statusFilter } = useTaskContext();

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all' ||
    statusFilter !== 'all';

  if (tasks.length > 0 && isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center my-10 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-500 mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
          لا توجد نتائج مطابقة للبحث أو الفلتر
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
          جرب تغيير عبارة البحث أو إزالة الفلاتر المحددة لعرض المزيد من المهام.
        </p>
      </div>
    );
  }

  if (tasks.length > 0 && statusFilter === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center my-10 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
          لم تكتمل أي مهام بعد
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          حدد خانة الاختيار بجانب أي مهمة لإضافتها للمهام المكتملة.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center my-12 animate-in fade-in">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950/60 dark:via-purple-950/50 dark:to-pink-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5 shadow-xs border border-indigo-100 dark:border-indigo-900/40">
        <Inbox className="w-10 h-10" />
      </div>
      <div className="flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-gray-100">
        <span>قائمة مهامك فارغة</span>
        <Sparkles className="w-4 h-4 text-amber-500" />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm leading-relaxed">
        ابدأ بإضافة أول مهمة من الشريط بالأسفل لتنظيم يومك وزيادة إنتاجيتك!
      </p>
    </div>
  );
};
