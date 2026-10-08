import React, { useState, useRef } from 'react';
import {
  Plus,
  Calendar,
  Tag,
  Flag,
  ChevronDown,
  ChevronUp,
  X,
  Pin,
  Repeat,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { PriorityLevel, RecurrenceType } from '../models/task';

export const AddTaskBar: React.FC = () => {
  const { addTask, categories, selectedCategory } = useTaskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [categoryId, setCategoryId] = useState<string>(
    selectedCategory !== 'all' ? selectedCategory : 'personal'
  );
  const [dueDate, setDueDate] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    addTask({
      title: trimmed,
      description: description.trim(),
      priority,
      categoryId: categoryId || 'personal',
      dueDate,
      isPinned,
      recurrence,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setIsPinned(false);
    setRecurrence('none');
    setIsExpanded(false);
    inputRef.current?.focus();
  };

  // Quick Date Helpers
  const setQuickDate = (type: 'today' | 'tomorrow') => {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 p-4 shadow-xl rounded-t-3xl transition-all">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
        {/* Main Input Row */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="أضف مهمة جديدة... (اضغط Enter للإضافة المباشرة)"
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
          />

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              isExpanded
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="خيارات إضافية (أولوية، تاريخ، تكرار، تثبيت، ملاحظات)"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">إضافة مهمة</span>
          </button>
        </div>

        {/* Expanded Options Tray */}
        {isExpanded && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-3.5 animate-in slide-in-from-bottom-2 duration-200">
            {/* Description Notes Input */}
            <div>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="ملاحظات أو تفاصيل اختيارية للمهمة..."
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Priority Selection */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-rose-500" />
                  <span>الأولوية:</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                      priority === 'high'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    🔴 عاجل
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('medium')}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                      priority === 'medium'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    🟡 متوسط
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                      priority === 'low'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    🟢 عادي
                  </button>
                </div>
              </div>

              {/* Category Selector */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>التصنيف:</span>
                </span>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories
                    .filter(c => c.id !== 'all')
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Due Date Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>الموعد:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  اليوم
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  غداً
                </button>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Pin and Recurrence options */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    isPinned
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{isPinned ? 'مثبتة 📌' : 'تثبيت'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-purple-500" />
                  <select
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="none">بدون تكرار</option>
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
