import React, { useState } from 'react';
import {
  Check,
  Trash2,
  Calendar,
  Tag,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Edit3,
  GripVertical,
  AlertCircle,
  Pin,
  Repeat,
  Timer,
  ThumbsUp,
  Scale,
} from 'lucide-react';
import { Task, PRIORITY_CONFIG, RECURRENCE_CONFIG } from '../models/task';
import { useTaskContext } from '../context/TaskContext';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskItemProps {
  task: Task;
  index: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onOpenPomodoro?: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onOpenPomodoro,
}) => {
  const { toggleTask, setTaskQuality, togglePinTask, deleteTask, categories, toggleSubtask } = useTaskContext();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  const category = categories.find(c => c.id === task.categoryId);
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const recurrenceInfo = task.recurrence && task.recurrence !== 'none' ? RECURRENCE_CONFIG[task.recurrence] : null;

  // Format Due Date with relative calculations
  const getDueDateLabel = () => {
    if (!task.dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = task.dueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `متأخرة (${Math.abs(diffDays)} يوم)`,
        isOverdue: true,
        className: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
      };
    }
    if (diffDays === 0) {
      return {
        text: 'اليوم',
        isOverdue: false,
        className: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      };
    }
    if (diffDays === 1) {
      return {
        text: 'غداً',
        isOverdue: false,
        className: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
      };
    }

    return {
      text: task.dueDate,
      isOverdue: false,
      className: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
    };
  };

  const dueDateBadge = getDueDateLabel();
  const subtasksCount = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter(s => s.isCompleted).length;
  const currentQuality = task.completionQuality || 'perfect';

  return (
    <>
      <div
        draggable
        onDragStart={e => onDragStart && onDragStart(e, index)}
        onDragOver={e => onDragOver && onDragOver(e, index)}
        onDragEnd={onDragEnd}
        className={`group relative flex flex-col p-3.5 sm:p-4 rounded-3xl border transition-all duration-200 ${
          task.isCompleted
            ? 'border-slate-200/90 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-900/60 shadow-2xs'
            : task.isPinned
            ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
            : 'border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs hover:shadow-md'
        }`}
      >
        {/* Priority stripe indicator */}
        <div
          className={`absolute right-0 top-3.5 bottom-3.5 w-1.5 rounded-l-full ${
            task.priority === 'high'
              ? 'bg-rose-500'
              : task.priority === 'medium'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />

        {/* Main Task Header Row */}
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="hidden sm:flex items-center text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 cursor-grab active:cursor-grabbing pt-1">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Checkbox */}
          <button
            onClick={() => toggleTask(task.id)}
            aria-label={task.isCompleted ? 'تحديد المهمة كغير مكتملة' : 'تحديد المهمة كمكتملة'}
            className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
              task.isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs ring-2 ring-emerald-500/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
            }`}
          >
            {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Title & Notes Area */}
          <div className="flex-1 min-w-0 pr-1 cursor-pointer" onClick={() => setIsDetailModalOpen(true)}>
            <div className="flex items-center gap-2 flex-wrap">
              {task.isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                  <Pin className="w-3 h-3 fill-indigo-500" />
                  <span>مثبتة</span>
                </span>
              )}

              <h4
                className={`text-sm font-bold transition-all break-words ${
                  task.isCompleted
                    ? 'line-through text-slate-400 dark:text-slate-500 font-medium'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {task.title}
              </h4>
            </div>

            {task.description && (
              <p
                className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                  task.isCompleted
                    ? 'text-slate-400 dark:text-slate-500 line-through'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Badges Row */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
              {/* Category Badge */}
              {category && category.id !== 'all' && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                  style={{
                    backgroundColor: `${category.color}15`,
                    borderColor: `${category.color}35`,
                    color: category.color,
                  }}
                >
                  <Tag className="w-3 h-3" />
                  <span>{category.name}</span>
                </span>
              )}

              {/* Priority Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border}`}
              >
                {priorityInfo.badge}
              </span>

              {/* Due Date Badge */}
              {dueDateBadge && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${dueDateBadge.className}`}
                >
                  {dueDateBadge.isOverdue ? (
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                  ) : (
                    <Calendar className="w-3 h-3 text-indigo-500" />
                  )}
                  <span>{dueDateBadge.text}</span>
                </span>
              )}

              {/* Recurrence Badge */}
              {recurrenceInfo && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <Repeat className="w-3 h-3" />
                  <span>{recurrenceInfo.label}</span>
                </span>
              )}

              {/* Pomodoro Completed Count */}
              {task.completedPomodoros && task.completedPomodoros > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span>🍅</span>
                  <span>{task.completedPomodoros} جلسة</span>
                </span>
              ) : null}

              {/* Subtasks pill */}
              {subtasksCount > 0 && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setIsSubtasksExpanded(!isSubtasksExpanded);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3 h-3 text-emerald-500" />
                  <span>
                    {completedSubtasks}/{subtasksCount} خطوات
                  </span>
                  {isSubtasksExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Clean & Modern Reorganized Action Dock */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            {/* Quick Pomodoro Launcher */}
            <button
              onClick={() => onOpenPomodoro && onOpenPomodoro(task.id)}
              className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              title="بدء جلسة بومودورو لهذه المهمة"
            >
              <Timer className="w-4 h-4" />
            </button>

            {/* Toggle Pin */}
            <button
              onClick={() => togglePinTask(task.id)}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                task.isPinned
                  ? 'text-indigo-600 bg-white dark:bg-slate-700 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title={task.isPinned ? 'إلغاء التثبيت من الأعلى' : 'تثبيت في الأعلى'}
            >
              <Pin className={`w-4 h-4 ${task.isPinned ? 'fill-indigo-500' : ''}`} />
            </button>

            {/* Edit details */}
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              title="تعديل وتفاصيل المهمة"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              title="حذف المهمة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Completion Quality Mastery Bar (Visible when task is completed) */}
        {task.isCompleted && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
              <span>تقييم إتقان المهمة:</span>
            </div>

            {/* The 3 Quality Choices (على أكمل وجه / بشكل جيد / نص نص) */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              {/* Perfect (على أكمل وجه / امتياز) */}
              <button
                type="button"
                onClick={() => setTaskQuality(task.id, 'perfect')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  currentQuality === 'perfect'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
                title="أكملتها على أكمل وجه (امتياز 100%)"
              >
                <span>🌟</span>
                <span>على أكمل وجه</span>
              </button>

              {/* Good (بشكل جيد) */}
              <button
                type="button"
                onClick={() => setTaskQuality(task.id, 'good')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  currentQuality === 'good'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
                title="أكملتها بشكل جيد جداً (80%)"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>بشكل جيد</span>
              </button>

              {/* Half (نص نص) */}
              <button
                type="button"
                onClick={() => setTaskQuality(task.id, 'half')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  currentQuality === 'half'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                }`}
                title="إنجاز مقبول أو جزئي (نص نص 50%)"
              >
                <Scale className="w-3 h-3" />
                <span>نص نص</span>
              </button>
            </div>
          </div>
        )}

        {/* Expandable Subtasks Checklist */}
        {isSubtasksExpanded && subtasksCount > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 mr-8 space-y-1.5 animate-in fade-in duration-150">
            {task.subtasks.map(st => (
              <div
                key={st.id}
                onClick={() => toggleSubtask(task.id, st.id)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                    st.isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {st.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span
                  className={`font-medium ${
                    st.isCompleted
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskDetailModal
        task={task}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
};
