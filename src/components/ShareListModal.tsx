import React, { useState } from 'react';
import { Share2, Copy, Check, Printer, MessageCircle, X } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const ShareListModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { tasks, categories } = useTaskContext();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || '';
  };

  // Generate formatted text
  const generateText = () => {
    let text = `📋 قائمة مهام QuickTasks - ${new Date().toLocaleDateString('ar-EG')}\n\n`;

    if (pendingTasks.length > 0) {
      text += `⏳ المهام المعلقة (${pendingTasks.length}):\n`;
      pendingTasks.forEach((t, i) => {
        const cat = getCategoryName(t.categoryId);
        text += `${i + 1}. [ ] ${t.title}${cat ? ` (${cat})` : ''}${t.dueDate ? ` - موعد: ${t.dueDate}` : ''}\n`;
        if (t.subtasks.length > 0) {
          t.subtasks.forEach(st => {
            text += `   - [${st.isCompleted ? 'x' : ' '}] ${st.title}\n`;
          });
        }
      });
      text += '\n';
    }

    if (completedTasks.length > 0) {
      text += `✅ المهام المكتملة (${completedTasks.length}):\n`;
      completedTasks.forEach((t, i) => {
        text += `${i + 1}. [✓] ${t.title}\n`;
      });
    }

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(generateText());
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              مشاركة وطباعة قائمة المهام
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              شارك قائمتك عبر الرسائل أو انسخها أو اطبعها كجدول عمل
            </p>
          </div>
        </div>

        {/* Text Preview Area */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            معاينة النص المنسق:
          </label>
          <textarea
            readOnly
            rows={8}
            value={generateText()}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed resize-none focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
