import React, { useState } from 'react';
import {
  X,
  Calendar,
  Tag,
  Flag,
  CheckSquare,
  Plus,
  Trash2,
  Save,
  Check,
  Pin,
  Repeat,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Task, PriorityLevel, RecurrenceType, CompletionQuality } from '../models/task';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, categories, toggleSubtask, addSubtask, deleteSubtask } = useTaskContext();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<PriorityLevel>(task.priority);
  const [categoryId, setCategoryId] = useState(task.categoryId);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [isPinned, setIsPinned] = useState(task.isPinned ?? false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(task.recurrence || 'none');
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes || 25);
  const [completionQuality, setCompletionQuality] = useState<CompletionQuality>(task.completionQuality || 'perfect');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId,
      dueDate,
      isPinned,
      recurrence,
      estimatedMinutes: Number(estimatedMinutes) || 25,
      completionQuality,
    });
    onClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              تفاصيل المهمة
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              عنوان المهمة
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              ملاحظات وتفاصيل إضافية
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب ملاحظات، روابط، أو خطوات تفصيلية..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Mastery & Quality Level Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>مستوى إتقان المهمة (جودة الإنجاز)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCompletionQuality('perfect')}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  completionQuality === 'perfect'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>🌟</div>
                <div className="text-[11px] mt-0.5">على أكمل وجه</div>
                <div className="text-[9px] opacity-80">امتياز 100%</div>
              </button>

              <button
                type="button"
                onClick={() => setCompletionQuality('good')}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  completionQuality === 'good'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>👍</div>
                <div className="text-[11px] mt-0.5">بشكل جيد</div>
                <div className="text-[9px] opacity-80">جيد جداً 80%</div>
              </button>

              <button
                type="button"
                onClick={() => setCompletionQuality('half')}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  completionQuality === 'half'
                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>⚖️</div>
                <div className="text-[11px] mt-0.5">نص نص</div>
                <div className="text-[9px] opacity-80">مقبول 50%</div>
              </button>
            </div>
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>مستوى الأولوية</span>
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">🔴 أولوية عالية (عاجل)</option>
                <option value="medium">🟡 أولوية متوسطة</option>
                <option value="low">🟢 أولوية منخفضة (عادي)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>التصنيف</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          </div>

          {/* Date & Recurrence Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>تاريخ الاستحقاق</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Recurrence */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                <Repeat className="w-3.5 h-3.5 text-purple-500" />
                <span>تكرار المهمة</span>
              </label>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">بدون تكرار</option>
                <option value="daily">يتكرر يومياً</option>
                <option value="weekly">يتكرر أسبوعياً</option>
                <option value="monthly">يتكرر شهرياً</option>
              </select>
            </div>
          </div>

          {/* Pin & Estimated Minutes Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isPinned
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isPinned ? 'مثبتة في الأعلى 📌' : 'تثبيت في الأعلى'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">الوقت التقديري:</span>
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold"
              />
              <span className="text-slate-500">دقيقة</span>
            </div>
          </div>

          {/* Subtasks / Checklist Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span>قائمة المهام الفرعية (Checklist)</span>
              </label>
              {task.subtasks.length > 0 && (
                <span className="text-xs text-slate-500 font-semibold font-mono">
                  {task.subtasks.filter(s => s.isCompleted).length} / {task.subtasks.length}
                </span>
              )}
            </div>

            {/* Subtask items */}
            <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto">
              {task.subtasks.map(st => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="flex items-center gap-2 flex-1 text-right text-xs cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                        st.isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {st.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`font-semibold ${
                        st.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, st.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                placeholder="إضافة خطوة فرعية..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Footer Save button */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
