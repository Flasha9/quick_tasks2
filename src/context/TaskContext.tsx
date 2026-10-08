import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  Category,
  PriorityLevel,
  RecurrenceType,
  CompletionQuality,
  DEFAULT_CATEGORIES,
} from '../models/task';
import { soundManager } from '../utils/audio';

interface UndoAction {
  type: 'delete_task' | 'clear_completed';
  tasks: Task[];
  message: string;
}

export type ViewMode = 'list' | 'planner' | 'insights';

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedPriority: PriorityLevel | 'all';
  setSelectedPriority: (p: PriorityLevel | 'all') => void;
  statusFilter: 'all' | 'active' | 'completed' | 'today' | 'overdue';
  setStatusFilter: (s: 'all' | 'active' | 'completed' | 'today' | 'overdue') => void;
  qualityFilter: 'all' | CompletionQuality;
  setQualityFilter: (q: 'all' | CompletionQuality) => void;
  sortBy: 'manual' | 'priority' | 'dueDate' | 'title' | 'quality';
  setSortBy: (sort: 'manual' | 'priority' | 'dueDate' | 'title' | 'quality') => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Analytics & Mastery
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  streakCount: number;
  completionHistory: { date: string; count: number }[];
  
  // Mastery & Quality Indicators
  perfectCount: number;
  goodCount: number;
  halfCount: number;
  masteryScore: number;
  masteryGrade: string;
  
  // Focus / Pomodoro
  activeFocusTaskId: string | null;
  setActiveFocusTaskId: (id: string | null) => void;
  incrementPomodoro: (taskId: string) => void;

  // Sound
  isSoundEnabled: boolean;
  toggleSound: () => void;
  
  // Actions
  addTask: (data: {
    title: string;
    description?: string;
    priority?: PriorityLevel;
    categoryId?: string;
    dueDate?: string;
    isPinned?: boolean;
    recurrence?: RecurrenceType;
    estimatedMinutes?: number;
    subtasks?: { id: string; title: string; isCompleted: boolean }[];
  }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  setTaskQuality: (id: string, quality: CompletionQuality) => void;
  togglePinTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  reorderTasks: (newOrderedList: Task[]) => void;
  clearCompleted: () => void;
  addCategory: (name: string, color: string, icon: string) => void;
  deleteCategory: (id: string) => void;
  importTasks: (importedTasks: Task[]) => void;
  
  // Undo & Feedback
  undoAction: UndoAction | null;
  triggerUndo: () => void;
  dismissUndo: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'مراجعة خطة المشروع والتقرير النهائي 📊',
    description: 'التأكد من اكتمال كافة النقاط وإرسال المسودة للمراجعة',
    isCompleted: false,
    priority: 'high',
    categoryId: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    isPinned: true,
    recurrence: 'none',
    estimatedMinutes: 25,
    completedPomodoros: 1,
    subtasks: [
      { id: '1-1', title: 'مراجعة الميزانية المالية', isCompleted: true },
      { id: '1-2', title: 'تدقيق الأرقام والنتائج النهائية', isCompleted: false },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    title: 'شراء مستلزمات البقالة الأسبوعية 🛒',
    description: 'خضار، فواكه، وحليب طازج مع قهوة مختصة',
    isCompleted: false,
    priority: 'medium',
    categoryId: 'shopping',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    isPinned: false,
    recurrence: 'weekly',
    estimatedMinutes: 30,
    completedPomodoros: 0,
    subtasks: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    title: 'ممارسة الرياضة والتمارين الصباحية 🏃‍♂️',
    description: '30 دقيقة جري وتمارين إطالة ولياقة بدنية على أكمل وجه',
    isCompleted: true,
    priority: 'low',
    categoryId: 'personal',
    dueDate: new Date().toISOString().split('T')[0],
    isPinned: false,
    recurrence: 'daily',
    estimatedMinutes: 30,
    completedPomodoros: 1,
    completionQuality: 'perfect', // على أكمل وجه
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    title: 'تنظيم وترتيب ملفات سطح المكتب 📁',
    description: 'فرز الملفات القديمة ونقل المجلدات، إنجاز جزئي وسريع',
    isCompleted: true,
    priority: 'medium',
    categoryId: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    isPinned: false,
    recurrence: 'none',
    estimatedMinutes: 15,
    completedPomodoros: 1,
    completionQuality: 'half', // نص نص
    subtasks: [],
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    completedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '5',
    title: 'قراءة فصل من كتاب العادات الذرية 📖',
    description: 'قراءة الفصل الخامس وتلخيص أهم الأفكار',
    isCompleted: true,
    priority: 'low',
    categoryId: 'study',
    dueDate: new Date().toISOString().split('T')[0],
    isPinned: false,
    recurrence: 'daily',
    estimatedMinutes: 20,
    completedPomodoros: 1,
    completionQuality: 'good', // جيد جداً
    subtasks: [],
    createdAt: new Date(Date.now() - 95000000).toISOString(),
    completedAt: new Date(Date.now() - 28800000).toISOString(),
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('quick_tasks_v3');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('quick_categories_v3');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const savedStreak = localStorage.getItem('quick_streak_count_v3');
      return savedStreak ? parseInt(savedStreak, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    return soundManager.isEnabled();
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'today' | 'overdue'>('all');
  const [qualityFilter, setQualityFilter] = useState<'all' | CompletionQuality>('all');
  const [sortBy, setSortBy] = useState<'manual' | 'priority' | 'dueDate' | 'title' | 'quality'>('manual');
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('quick_tasks_v3', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('quick_categories_v3', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => {
      const next = !prev;
      soundManager.setEnabled(next);
      return next;
    });
  }, []);

  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'],
    });
  }, []);

  const addTask = useCallback((data: {
    title: string;
    description?: string;
    priority?: PriorityLevel;
    categoryId?: string;
    dueDate?: string;
    isPinned?: boolean;
    recurrence?: RecurrenceType;
    estimatedMinutes?: number;
    subtasks?: { id: string; title: string; isCompleted: boolean }[];
  }) => {
    const trimmed = data.title.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: trimmed,
      description: data.description?.trim() || '',
      isCompleted: false,
      priority: data.priority || 'medium',
      categoryId: data.categoryId || (selectedCategory !== 'all' ? selectedCategory : 'personal'),
      dueDate: data.dueDate || '',
      isPinned: data.isPinned ?? false,
      recurrence: data.recurrence || 'none',
      estimatedMinutes: data.estimatedMinutes || 25,
      completedPomodoros: 0,
      subtasks: data.subtasks || [],
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    soundManager.playAddSound();
  }, [selectedCategory]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          return { ...task, ...updates };
        }
        return task;
      })
    );
  }, []);

  const togglePinTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      let isCompletedNow = false;
      const updated = prev.map(task => {
        if (task.id === id) {
          const nextState = !task.isCompleted;
          isCompletedNow = nextState;
          return {
            ...task,
            isCompleted: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
            completionQuality: nextState ? (task.completionQuality || 'perfect') : undefined,
          };
        }
        return task;
      });

      if (isCompletedNow) {
        soundManager.playCompleteSound();
      }

      // Check if all tasks are completed
      const allCompleted = updated.length > 0 && updated.every(t => t.isCompleted);
      if (allCompleted) {
        setTimeout(triggerCelebration, 150);
        setStreakCount(c => {
          const newStreak = c + 1;
          localStorage.setItem('quick_streak_count_v3', newStreak.toString());
          return newStreak;
        });
      }

      return updated;
    });
  }, [triggerCelebration]);

  const setTaskQuality = useCallback((id: string, quality: CompletionQuality) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          return {
            ...task,
            isCompleted: true,
            completionQuality: quality,
            completedAt: task.completedAt || new Date().toISOString(),
          };
        }
        return task;
      })
    );
    soundManager.playAddSound();
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const taskToDelete = prev.find(t => t.id === id);
      if (taskToDelete) {
        setUndoAction({
          type: 'delete_task',
          tasks: [taskToDelete],
          message: `تم حذف "${taskToDelete.title.slice(0, 22)}..."`,
        });
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => {
      const completedTasks = prev.filter(t => t.isCompleted);
      if (completedTasks.length === 0) return prev;

      setUndoAction({
        type: 'clear_completed',
        tasks: completedTasks,
        message: `تم حذف ${completedTasks.length} من المهام المكتملة`,
      });

      return prev.filter(t => !t.isCompleted);
    });
  }, []);

  const triggerUndo = useCallback(() => {
    if (!undoAction) return;
    if (undoAction.type === 'delete_task' || undoAction.type === 'clear_completed') {
      setTasks(prev => [...undoAction.tasks, ...prev]);
    }
    setUndoAction(null);
  }, [undoAction]);

  const dismissUndo = useCallback(() => {
    setUndoAction(null);
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newSubtasks = task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
          );
          return { ...task, subtasks: newSubtasks };
        }
        return task;
      })
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [
              ...task.subtasks,
              { id: Date.now().toString(), title: title.trim(), isCompleted: false },
            ],
          };
        }
        return task;
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.filter(st => st.id !== subtaskId),
          };
        }
        return task;
      })
    );
  }, []);

  const reorderTasks = useCallback((newOrderedList: Task[]) => {
    setTasks(newOrderedList);
  }, []);

  const addCategory = useCallback((name: string, color: string, icon: string) => {
    if (!name.trim()) return;
    const newCat: Category = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      color,
      icon,
    };
    setCategories(prev => [...prev, newCat]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    if (['all', 'work', 'personal', 'shopping', 'study'].includes(id)) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (selectedCategory === id) {
      setSelectedCategory('all');
    }
  }, [selectedCategory]);

  const incrementPomodoro = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            completedPomodoros: (t.completedPomodoros || 0) + 1,
          };
        }
        return t;
      })
    );
    soundManager.playPomodoroSound();
  }, []);

  const importTasks = useCallback((importedTasks: Task[]) => {
    if (!Array.isArray(importedTasks)) return;
    setTasks(importedTasks);
  }, []);

  // Completion history for the last 7 days
  const completionHistory = React.useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = tasks.filter(
        t => t.isCompleted && t.completedAt && t.completedAt.startsWith(dateStr)
      ).length;
      days.push({ date: dateStr, count });
    }
    return days;
  }, [tasks]);

  const pendingCount = tasks.filter(t => !t.isCompleted).length;
  const completedTasks = tasks.filter(t => t.isCompleted);
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Quality & Mastery Metrics
  const perfectCount = completedTasks.filter(t => (t.completionQuality || 'perfect') === 'perfect').length;
  const goodCount = completedTasks.filter(t => t.completionQuality === 'good').length;
  const halfCount = completedTasks.filter(t => t.completionQuality === 'half').length;

  const masteryScore = completedCount > 0
    ? Math.round((perfectCount * 100 + goodCount * 80 + halfCount * 50) / completedCount)
    : 0;

  let masteryGrade = 'غير محدد';
  if (completedCount === 0) {
    masteryGrade = 'في انتظار إنجاز أول مهمة';
  } else if (masteryScore >= 95) {
    masteryGrade = 'امتياز مع مرتبة الشرف 🏆';
  } else if (masteryScore >= 85) {
    masteryGrade = 'امتياز فائق 🌟';
  } else if (masteryScore >= 75) {
    masteryGrade = 'جيد جداً مرتفع ⚡';
  } else if (masteryScore >= 60) {
    masteryGrade = 'جيد جداً 👍';
  } else {
    masteryGrade = 'مقبول / نص نص ⚖️';
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedPriority,
        setSelectedPriority,
        statusFilter,
        setStatusFilter,
        qualityFilter,
        setQualityFilter,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        pendingCount,
        completedCount,
        totalCount,
        progressPercentage,
        streakCount,
        completionHistory,
        perfectCount,
        goodCount,
        halfCount,
        masteryScore,
        masteryGrade,
        activeFocusTaskId,
        setActiveFocusTaskId,
        incrementPomodoro,
        isSoundEnabled,
        toggleSound,
        addTask,
        updateTask,
        toggleTask,
        setTaskQuality,
        togglePinTask,
        deleteTask,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        reorderTasks,
        clearCompleted,
        addCategory,
        deleteCategory,
        importTasks,
        undoAction,
        triggerUndo,
        dismissUndo,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
