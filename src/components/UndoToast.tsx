import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const UndoToast: React.FC = () => {
  const { undoAction, triggerUndo, dismissUndo } = useTaskContext();

  useEffect(() => {
    if (!undoAction) return;

    const timer = setTimeout(() => {
      dismissUndo();
    }, 6000);

    return () => clearTimeout(timer);
  }, [undoAction, dismissUndo]);

  if (!undoAction) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl shadow-2xl border border-gray-800 dark:border-gray-200">
        <span className="text-xs sm:text-sm font-medium">{undoAction.message}</span>
        <button
          onClick={triggerUndo}
          className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تراجع</span>
        </button>
        <button
          onClick={dismissUndo}
          className="text-gray-400 hover:text-gray-200 dark:hover:text-gray-700 p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
