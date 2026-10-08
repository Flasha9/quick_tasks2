import React from 'react';
import { Trophy, TrendingUp, Calendar, CheckCircle2, Flame, X, Sparkles } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const WeeklyInsightsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    streakCount,
    completionHistory,
    completedCount,
    perfectCount,
    goodCount,
    halfCount,
    masteryScore,
    masteryGrade,
  } = useTaskContext();

  if (!isOpen) return null;

  const maxCount = Math.max(...completionHistory.map(h => h.count), 5);

  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return dayNames[d.getDay()];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              إحصائيات الإتقان والإنتاجية
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تحليل دقيق لجودة إنجازك للمهام ونسبة الامتياز
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center text-amber-500 mb-1">
              <Flame className="w-5 h-5" />
            </div>
            <span className="block text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {streakCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              أيام متتالية
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center text-emerald-500 mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="block text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {completedCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              مهمة منجزة
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center text-indigo-500 mb-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="block text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {masteryScore}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              معدل الإتقان
            </span>
          </div>
        </div>

        {/* Quality Distribution Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 via-slate-50 to-emerald-50/50 dark:from-amber-950/20 dark:via-slate-800/40 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              توزيع جودة إنجاز المهام:
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {masteryGrade}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">
                🌟 على أكمل وجه
              </span>
              <span className="text-base font-extrabold text-amber-600 font-mono">
                {perfectCount}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">
                👍 بشكل جيد
              </span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">
                {goodCount}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800/80">
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 block">
                ⚖️ نص نص
              </span>
              <span className="text-base font-extrabold text-sky-600 font-mono">
                {halfCount}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Chart */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              المهام المكتملة في آخر 7 أيام
            </span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2">
            {completionHistory.map((item, idx) => {
              const heightPercent = Math.max((item.count / maxCount) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {item.count}
                  </span>
                  <div className="w-full max-w-[28px] bg-slate-200 dark:bg-slate-700 rounded-t-lg overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 rounded-t-lg transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[36px]">
                    {getDayLabel(item.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Tip */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            {masteryScore >= 85
              ? 'مستوى إتقان رائع جداً! معظم مهامك منجزة على أكمل وجه وبامتياز.'
              : 'كل مهمة تنجزها بإتقان ترفع من معدل إتقانك وتجعلك أكثر فاعلية!'}
          </p>
        </div>
      </div>
    </div>
  );
};
