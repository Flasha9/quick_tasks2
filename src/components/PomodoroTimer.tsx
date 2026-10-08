import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Sparkles, X } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const PomodoroTimer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { tasks, activeFocusTaskId, setActiveFocusTaskId, incrementPomodoro } = useTaskContext();

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const activeTask = tasks.find(t => t.id === activeFocusTaskId);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'work') {
        if (activeFocusTaskId) {
          incrementPomodoro(activeFocusTaskId);
        }
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, activeFocusTaskId, incrementPomodoro]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = mode === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              مؤقت التركيز (بومودورو)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              جلسات عمل مركّزة تتبعها فترات راحة قصيرة
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => switchMode('work')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'work'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            جلسة تركيز (25 دقيقة)
          </button>
          <button
            type="button"
            onClick={() => switchMode('break')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'break'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            استراحة قصيرة (5 دقائق)
          </button>
        </div>

        {/* Selected Task Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            ربط المؤقت بمهمة:
          </label>
          <select
            value={activeFocusTaskId || ''}
            onChange={e => setActiveFocusTaskId(e.target.value || null)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">بدون مهمة محددة (تركيز عام)</option>
            {tasks
              .filter(t => !t.isCompleted)
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.completedPomodoros ? `(🍅 ${t.completedPomodoros})` : ''}
                </option>
              ))}
          </select>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`transition-all duration-500 ${
                  mode === 'work' ? 'stroke-indigo-600' : 'stroke-emerald-500'
                }`}
                strokeWidth="7"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {formattedTime}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'work' ? 'وقت الإنجاز' : 'وقت الراحة'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Task Name if selected */}
        {activeTask && (
          <div className="flex items-center justify-center gap-2 mb-6 p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs font-medium text-indigo-700 dark:text-indigo-300 text-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{activeTask.title}</span>
            {activeTask.completedPomodoros ? (
              <span className="text-[10px] bg-indigo-200/60 dark:bg-indigo-900 px-1.5 py-0.5 rounded-md">
                🍅 {activeTask.completedPomodoros}
              </span>
            ) : null}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetTimer}
            className="p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>بدء التركيز</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
