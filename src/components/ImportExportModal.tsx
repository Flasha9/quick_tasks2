import React, { useRef, useState } from 'react';
import { Download, Upload, FileText, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const ImportExportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { tasks, importTasks } = useTaskContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `quick_tasks_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    setSuccessMsg('تم تصدير ملف النسخة الاحتياطية (JSON) بنجاح');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['المعرف', 'العنوان', 'الوصف', 'الحالة', 'الأولوية', 'التصنيف', 'تاريخ الاستحقاق', 'تاريخ الإنشاء'];
    const rows = tasks.map(t => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.isCompleted ? '"مكتملة"' : '"معلقة"',
      `"${t.priority}"`,
      `"${t.categoryId}"`,
      `"${t.dueDate || ''}"`,
      `"${t.createdAt}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dl = document.createElement('a');
    dl.setAttribute('href', url);
    dl.setAttribute('download', `quick_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    setSuccessMsg('تم تصدير ملف Excel / CSV بنجاح');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Import JSON File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
          importTasks(parsed);
          setSuccessMsg(`تم استيراد ${parsed.length} مهمة بنجاح!`);
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 1500);
        } else {
          setErrorMsg('الملف غير صالح أو لا يحتوي على بنية مهام صحيحة');
          setTimeout(() => setErrorMsg(''), 4000);
        }
      } catch (err) {
        setErrorMsg('حدث خطأ أثناء قراءة ملف JSON');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              النسخ الاحتياطي ونقل البيانات
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              حفظ واسترجاع مهامك عبر ملفات JSON و Excel
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            تصدير البيانات (Backup)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>نسخة JSON كاملة</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>جدول Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            استيراد نسخة سابقة (Restore)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>اختر ملف JSON لاستعادة المهام</span>
          </button>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            سيتم استبدال القائمة الحالية بالمهام الموجودة في الملف
          </p>
        </div>
      </div>
    </div>
  );
};
