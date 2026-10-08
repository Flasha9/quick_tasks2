import React, { useState, useMemo } from 'react';
import {
  CheckCheck,
  Share2,
  Database,
  Timer,
  TrendingUp,
  Volume2,
  VolumeX,
  Calendar,
  ListTodo,
  Pin,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { TaskSummary } from './TaskSummary';
import { FilterBar } from './FilterBar';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { AddTaskBar } from './AddTaskBar';
import { UndoToast } from './UndoToast';
import { ThemeToggle } from './ThemeToggle';
import { PomodoroTimer } from './PomodoroTimer';
import { WeeklyInsightsModal } from './WeeklyInsightsModal';
import { ShareListModal } from './ShareListModal';
import { ImportExportModal } from './ImportExportModal';
import { WeeklyPlannerView } from './WeeklyPlannerView';

export const HomeScreen: React.FC = () => {
  const {
    tasks,
    searchQuery,
    selectedCategory,
    selectedPriority,
    statusFilter,
    qualityFilter,
    sortBy,
    reorderTasks,
    viewMode,
    setViewMode,
    isSoundEnabled,
    toggleSound,
    setActiveFocusTaskId,
  } = useTaskContext();

  // Modals state
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTasks = [...tasks];
    const draggedItem = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    reorderTasks(newTasks);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleOpenPomodoroForTask = (taskId: string) => {
    setActiveFocusTaskId(taskId);
    setIsPomodoroOpen(true);
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks
      .filter(task => {
        // Search query filter (title and description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && task.categoryId !== selectedCategory) {
          return false;
        }

        // Priority filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        // Quality filter (على أكمل وجه / بشكل جيد / نص نص)
        if (qualityFilter !== 'all') {
          if (!task.isCompleted || (task.completionQuality || 'perfect') !== qualityFilter) {
            return false;
          }
        }

        // Status filter
        if (statusFilter === 'active' && task.isCompleted) return false;
        if (statusFilter === 'completed' && !task.isCompleted) return false;
        if (statusFilter === 'today' && task.dueDate !== todayStr) return false;
        if (statusFilter === 'overdue') {
          if (task.isCompleted || !task.dueDate || task.dueDate >= todayStr) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned tasks always come first unless custom sort applies
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === 'priority') {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortBy === 'quality') {
          const qualityWeight = { perfect: 3, good: 2, half: 1 };
          const qA = a.completionQuality ? qualityWeight[a.completionQuality] : 0;
          const qB = b.completionQuality ? qualityWeight[b.completionQuality] : 0;
          return qB - qA;
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title, 'ar');
        }
        return 0; // manual order
      });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, statusFilter, qualityFilter, sortBy]);

  const pinnedTasks = filteredTasks.filter(t => t.isPinned);
  const regularTasks = filteredTasks.filter(t => !t.isPinned);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <CheckCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                QuickTasks
              </h1>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                إدارة المهام الذكية والإتقان
              </p>
            </div>
          </div>

          {/* View Mode Tabs (List vs Planner) */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>قائمة المهام</span>
            </button>
            <button
              onClick={() => setViewMode('planner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'planner'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>مخطط الأسبوع</span>
            </button>
          </div>

          {/* Reorganized Icon Toolbar: Cleanly Grouped & Labeled */}
          <div className="flex items-center gap-2">
            {/* Group 1: Productivity Tools Capsule */}
            <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
              {/* Pomodoro Focus Timer */}
              <button
                onClick={() => setIsPomodoroOpen(true)}
                className="p-2 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title="مؤقت التركيز (بومودورو ⏱️)"
              >
                <Timer className="w-4 h-4" />
              </button>

              {/* Weekly Insights */}
              <button
                onClick={() => setIsInsightsOpen(true)}
                className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title="لوحة تحليلات الجودة والإنتاجية (📈)"
              >
                <TrendingUp className="w-4 h-4" />
              </button>

              {/* Share & Print */}
              <button
                onClick={() => setIsShareOpen(true)}
                className="p-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title="مشاركة وطباعة القائمة (📤)"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Backup & Restore (JSON / CSV) */}
              <button
                onClick={() => setIsBackupOpen(true)}
                className="p-2 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title="النسخ الاحتياطي ونقل البيانات (💾)"
              >
                <Database className="w-4 h-4" />
              </button>
            </div>

            {/* Group 2: Audio & Atmosphere */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                isSoundEnabled
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
                  : 'text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
              title={isSoundEnabled ? 'كتم التأثيرات الصوتية' : 'تفعيل التأثيرات الصوتية'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Group 3: Daylight / Night Theme Switcher */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Mode Switcher Bar */}
      <div className="sm:hidden px-4 pt-3 flex items-center gap-2 max-w-5xl mx-auto w-full">
        <div className="flex-1 flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            قائمة المهام
          </button>
          <button
            onClick={() => setViewMode('planner')}
            className={`flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all ${
              viewMode === 'planner'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            مخطط الأسبوع
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Progress & Mastery Hub */}
        <TaskSummary
          onOpenPomodoro={() => setIsPomodoroOpen(true)}
          onOpenInsights={() => setIsInsightsOpen(true)}
        />

        {/* View Switch: Planner vs Standard List */}
        {viewMode === 'planner' ? (
          <WeeklyPlannerView />
        ) : (
          <>
            {/* Filter & Search Bar */}
            <FilterBar />

            {/* Pinned Tasks Section (if any exist) */}
            {pinnedTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  <Pin className="w-3.5 h-3.5 fill-indigo-500" />
                  <span>المهام المثبتة في القمة ({pinnedTasks.length})</span>
                </div>
                <div className="space-y-2.5">
                  {pinnedTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      onOpenPomodoro={handleOpenPomodoroForTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Tasks List */}
            <div className="space-y-2.5 pb-12">
              {filteredTasks.length === 0 ? (
                <EmptyState />
              ) : (
                regularTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={pinnedTasks.length + index}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onOpenPomodoro={handleOpenPomodoroForTask}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Quick Add Bar */}
      <AddTaskBar />

      {/* Undo Toast Notifications */}
      <UndoToast />

      {/* Modals */}
      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
      />

      <WeeklyInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />

      <ShareListModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <ImportExportModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
    </div>
  );
};
