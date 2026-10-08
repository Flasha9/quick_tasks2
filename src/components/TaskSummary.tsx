import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import {
  Flame,
  Award,
  Sparkles,
  Clock,
  Trash2,
  Timer,
  TrendingUp,
  Scale,
  ThumbsUp,
} from 'lucide-react';
import { QUALITY_CONFIG } from '../models/task';

export const TaskSummary: React.FC<{
  onOpenPomodoro?: () => void;
  onOpenInsights?: () => void;
}> = ({ onOpenPomodoro, onOpenInsights }) => {
  const {
    pendingCount,
    completedCount,
    totalCount,
    progressPercentage,
    streakCount,
    perfectCount,
    goodCount,
    halfCount,
    masteryScore,
    masteryGrade,
    qualityFilter,
    setQualityFilter,
    clearCompleted,
  } = useTaskContext();

  // Calculate percentages of each quality segment relative to total tasks
  const perfectPct = totalCount > 0 ? (perfectCount / totalCount) * 100 : 0;
  const goodPct = totalCount > 0 ? (goodCount / totalCount) * 100 : 0;
  const halfPct = totalCount > 0 ? (halfCount / totalCount) * 100 : 0;

  return (
    <div className="w-full space-y-4">
      {/* Main Glass Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 transition-all">
        {/* Top Header: Streak, Mastery Grade & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          {/* Streak & Mastery Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 shadow-2xs">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                  سلسلة الإنتاجية: {streakCount} أيام
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  🔥 متواصل
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>تقدير الجودة:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {masteryGrade}
                </span>
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2">
            {onOpenPomodoro && (
              <button
                onClick={onOpenPomodoro}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="مؤقت التركيز (بومودورو)"
              >
                <Timer className="w-4 h-4" />
                <span>مؤقت بومودورو</span>
              </button>
            )}

            {onOpenInsights && (
              <button
                onClick={onOpenInsights}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="التحليلات الأسبوعية"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">التحليلات</span>
              </button>
            )}

            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors cursor-pointer"
                title="تنظيف كل المهام المكتملة"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">تنظيف المكتملة</span>
              </button>
            )}
          </div>
        </div>

        {/* The New Clear & Segmented Progress Bar */}
        <div className="space-y-2">
          {/* Header of Progress Bar */}
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-slate-800 dark:text-slate-200">
                نسبة إنجاز المهام الكلية:
              </span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {progressPercentage}%
              </span>
              <span className="text-slate-400 font-normal">
                ({completedCount} من أصل {totalCount} مهام)
              </span>
            </div>

            {/* Overall Mastery Index */}
            {completedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 border border-amber-200/80 dark:border-amber-800 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>معدل الإتقان:</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold font-mono">
                  {masteryScore}%
                </span>
              </div>
            )}
          </div>

          {/* The Multi-Segment Visual Progress Bar */}
          <div className="relative w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700/80 flex shadow-inner">
            {/* Perfect Segment (Gold/Amber) */}
            {perfectPct > 0 && (
              <div
                style={{ width: `${perfectPct}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-l-xl transition-all duration-500 relative group cursor-pointer"
                title={`على أكمل وجه (امتياز): ${perfectCount} مهمة (${Math.round(perfectPct)}%)`}
              />
            )}

            {/* Good Segment (Emerald Green) */}
            {goodPct > 0 && (
              <div
                style={{ width: `${goodPct}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 relative group cursor-pointer"
                title={`بشكل جيد: ${goodCount} مهمة (${Math.round(goodPct)}%)`}
              />
            )}

            {/* Half Segment (Sky Blue) */}
            {halfPct > 0 && (
              <div
                style={{ width: `${halfPct}%` }}
                className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-r-xl transition-all duration-500 relative group cursor-pointer"
                title={`نص نص / مقبول: ${halfCount} مهمة (${Math.round(halfPct)}%)`}
              />
            )}
          </div>
        </div>

        {/* Detailed Breakdown & Interactive Quality Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* 1. Perfect (على أكمل وجه) */}
          <button
            type="button"
            onClick={() => setQualityFilter(qualityFilter === 'perfect' ? 'all' : 'perfect')}
            className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
              qualityFilter === 'perfect'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/50'
                : 'bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold flex items-center gap-1">
                <span>🌟</span>
                <span>على أكمل وجه</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${qualityFilter === 'perfect' ? 'bg-white/20' : 'bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'}`}>
                امتياز
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black font-mono">
                {perfectCount}
              </span>
              <span className="text-[10px] opacity-80">مهام</span>
            </div>
          </button>

          {/* 2. Good (بشكل جيد) */}
          <button
            type="button"
            onClick={() => setQualityFilter(qualityFilter === 'good' ? 'all' : 'good')}
            className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
              qualityFilter === 'good'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/50'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>بشكل جيد</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${qualityFilter === 'good' ? 'bg-white/20' : 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'}`}>
                جيد جداً
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black font-mono">
                {goodCount}
              </span>
              <span className="text-[10px] opacity-80">مهام</span>
            </div>
          </button>

          {/* 3. Half (نص نص) */}
          <button
            type="button"
            onClick={() => setQualityFilter(qualityFilter === 'half' ? 'all' : 'half')}
            className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
              qualityFilter === 'half'
                ? 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-400/50'
                : 'bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 border-sky-200 dark:border-sky-800/80 text-sky-900 dark:text-sky-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold flex items-center gap-1">
                <Scale className="w-3 h-3" />
                <span>نص نص</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${qualityFilter === 'half' ? 'bg-white/20' : 'bg-sky-200/60 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300'}`}>
                مقبول
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black font-mono">
                {halfCount}
              </span>
              <span className="text-[10px] opacity-80">مهام</span>
            </div>
          </button>

          {/* 4. Pending Tasks */}
          <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-right">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>قيد الانتظار</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                متبقي
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                {pendingCount}
              </span>
              <span className="text-[10px] text-slate-500">مهام</span>
            </div>
          </div>
        </div>

        {/* Quality Filter Active Notification */}
        {qualityFilter !== 'all' && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <span>
              عرض فقط: مهام {QUALITY_CONFIG[qualityFilter].label} ({QUALITY_CONFIG[qualityFilter].badge})
            </span>
            <button
              onClick={() => setQualityFilter('all')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              إلغاء التصفية (عرض الكل)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
