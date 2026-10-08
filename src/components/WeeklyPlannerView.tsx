import React from 'react';
import { Calendar, Check } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { PRIORITY_CONFIG } from '../models/task';

export const WeeklyPlannerView: React.FC = () => {
  const { tasks, toggleTask } = useTaskContext();

  // Current week dates starting from Saturday or Sunday
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = React.useMemo(() => {
    const days = [];
    const currentDayOfWeek = today.getDay(); // 0 is Sun, 6 is Sat
    // Start week from Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const isToday = isoDate === today.toISOString().split('T')[0];

      const dayTasks = tasks.filter(t => t.dueDate === isoDate);

      days.push({
        date: d,
        isoDate,
        dayName: arabicDays[i],
        dayNumber: d.getDate(),
        isToday,
        tasks: dayTasks,
      });
    }
    return days;
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            مخطط الأسبوع (Weekly Planner)
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          جدول مهامك الموزعة حسب الأيام
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map(day => (
          <div
            key={day.isoDate}
            className={`p-3.5 rounded-2xl border transition-all flex flex-col min-h-[160px] ${
              day.isToday
                ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800/80 shadow-xs'
                : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span
                className={`text-xs font-bold ${
                  day.isToday
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {day.dayName}
              </span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                  day.isToday
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {day.dayNumber}
              </span>
            </div>

            {/* Day Tasks */}
            <div className="flex-1 space-y-2">
              {day.tasks.length === 0 ? (
                <div className="h-full flex items-center justify-center py-6 text-center text-[11px] text-slate-400 dark:text-slate-600">
                  لا توجد مهام
                </div>
              ) : (
                day.tasks.map(t => {
                  const pConfig = PRIORITY_CONFIG[t.priority];
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        t.isCompleted
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <div
                          className={`mt-0.5 w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                            t.isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {t.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`font-semibold line-clamp-2 leading-tight ${
                            t.isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${pConfig.bg} ${pConfig.color}`}
                        >
                          {pConfig.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
