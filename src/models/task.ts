export type PriorityLevel = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type CompletionQuality = 'perfect' | 'good' | 'half'; // على أكمل وجه (امتياز) | جيد | نص نص

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind hex or class color
  icon: string;  // icon identifier
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: PriorityLevel;
  categoryId: string;
  dueDate?: string; // ISO date string YYYY-MM-DD
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
  isPinned?: boolean;
  recurrence?: RecurrenceType;
  estimatedMinutes?: number;
  completedPomodoros?: number;
  completionQuality?: CompletionQuality; // جودة الإنجاز: على أكمل وجه، جيد، أو نص نص
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'جميع المهام', color: '#6366f1', icon: 'Layers' },
  { id: 'work', name: 'العمل', color: '#2563eb', icon: 'Briefcase' },
  { id: 'personal', name: 'شخصي', color: '#db2777', icon: 'Home' },
  { id: 'shopping', name: 'تسوق', color: '#d97706', icon: 'ShoppingCart' },
  { id: 'study', name: 'دراسة', color: '#059669', icon: 'GraduationCap' },
];

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; bg: string; border: string; badge: string }
> = {
  high: {
    label: 'عالية',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-900',
    badge: '🔴 عاجل',
  },
  medium: {
    label: 'متوسطة',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900',
    badge: '🟡 متوسط',
  },
  low: {
    label: 'منخفضة',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-900',
    badge: '🟢 عادي',
  },
};

export const RECURRENCE_CONFIG: Record<RecurrenceType, { label: string; icon: string }> = {
  none: { label: 'بدون تكرار', icon: 'Minus' },
  daily: { label: 'يتكرر يومياً', icon: 'Repeat' },
  weekly: { label: 'يتكرر أسبوعياً', icon: 'CalendarDays' },
  monthly: { label: 'يتكرر شهرياً', icon: 'CalendarRange' },
};

export const QUALITY_CONFIG: Record<
  CompletionQuality,
  {
    label: string;
    description: string;
    gradeText: string;
    percentage: number;
    badge: string;
    color: string;
    bg: string;
    border: string;
    pillBg: string;
  }
> = {
  perfect: {
    label: 'على أكمل وجه',
    description: 'إنجاز ممتاز ومتقن بدون أي تقصير',
    gradeText: 'امتياز (100%)',
    percentage: 100,
    badge: '🌟 امتياز',
    color: 'text-amber-800 dark:text-amber-300',
    bg: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
    pillBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  },
  good: {
    label: 'بشكل جيد',
    description: 'إنجاز جيد جداً وفعال مع تفاصيل مقبولة',
    gradeText: 'جيد جداً (80%)',
    percentage: 80,
    badge: '👍 جيد جداً',
    color: 'text-emerald-800 dark:text-emerald-300',
    bg: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800',
    pillBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  },
  half: {
    label: 'نص نص',
    description: 'إنجاز جزئي أو مستعجل يحتاج لمراجعة لاحقة',
    gradeText: 'مقبول / نص نص (50%)',
    percentage: 50,
    badge: '⚖️ نص نص',
    color: 'text-sky-800 dark:text-sky-300',
    bg: 'bg-sky-500',
    border: 'border-sky-200 dark:border-sky-800',
    pillBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300',
  },
};
