import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Sparkles, FileText, Calendar, Bookmark, Share2 } from 'lucide-react';
import { JourneyItem } from '../../types/journey';
import { formatDate, getTodayString, toDateString } from '../../utils/date';
import { vscode } from '../../utils/vscode';
import { CATEGORY_MAP } from '../../utils/category';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: JourneyItem[];
  selectedDate: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedDate
}) => {
  const [template, setTemplate] = useState<'jira' | 'standup' | 'weekly'>('jira');
  const [copied, setCopied] = useState<boolean>(false);

  const todayStr = getTodayString();

  const generatedText = useMemo(() => {
    const todayItems = items.filter(i => i.date === (selectedDate || todayStr));

    if (template === 'jira') {
      let text = `h3. Worklog on ${formatDate(selectedDate || todayStr)}\n\n`;
      if (todayItems.length === 0) {
        text += `* No tasks recorded for this date.\n`;
      } else {
        todayItems.forEach(i => {
          const jiraPrefix = i.jiraKey ? `*${i.jiraKey}* - ` : '';
          const time = i.durationMinutes ? ` _(${(i.durationMinutes / 60).toFixed(1)}h)_` : '';
          text += `* ${jiraPrefix}${i.title}${time}\n`;
          if (i.branchName) text += `** Branch: {code}${i.branchName}{code}\n`;
          if (i.mrUrl) text += `** MR: ${i.mrUrl}\n`;
          if (i.notes) text += `** Deskripsi / Notes:\n${i.notes}\n`;
          text += `\n`;
        });
      }
      return text;
    }

    if (template === 'standup') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = toDateString(yesterday);

      const yesterdayItems = items.filter(i => i.date === yesterdayStr);

      let md = `### 🚀 Daily Standup (${formatDate(selectedDate || todayStr)})\n\n`;

      md += `**Yesterday:**\n`;
      if (yesterdayItems.length === 0) {
        md += `- Ongoing sprint deliverables\n`;
      } else {
        yesterdayItems.forEach(i => {
          const jira = i.jiraKey ? `[${i.jiraKey}] ` : '';
          const mrInfo = i.mrUrl ? ` ([MR](${i.mrUrl}))` : '';
          const status = i.completed ? '✅' : '⏳';
          md += `- ${status} ${jira}${i.title}${mrInfo}\n`;
        });
      }

      md += `\n**Today:**\n`;
      if (todayItems.length === 0) {
        md += `- Work on backlog tasks & sprint items\n`;
      } else {
        todayItems.forEach(i => {
          const jira = i.jiraKey ? `[${i.jiraKey}] ` : '';
          const mrInfo = i.mrUrl ? ` ([MR](${i.mrUrl}))` : '';
          const status = i.completed ? '✅' : '⏳';
          md += `- ${status} ${jira}${i.title}${mrInfo}\n`;
        });
      }

      md += `\n**Blockers:**\n- None\n`;
      return md;
    }

    if (template === 'weekly') {
      let md = `### 📊 Weekly Worklog Summary\n\n`;

      const byCategory: Record<string, JourneyItem[]> = {};
      items.forEach(i => {
        if (!byCategory[i.category]) byCategory[i.category] = [];
        byCategory[i.category].push(i);
      });

      Object.entries(byCategory).forEach(([cat, catItems]) => {
        const meta = CATEGORY_MAP[cat as any] || CATEGORY_MAP.other;
        md += `#### ${meta.label} (${catItems.length})\n`;
        catItems.forEach(i => {
          const jira = i.jiraKey ? `[${i.jiraKey}] ` : '';
          const mrInfo = i.mrUrl ? ` ([MR](${i.mrUrl}))` : '';
          const dateStr = `\`${i.date}\``;
          md += `- ${dateStr} ${jira}${i.title}${mrInfo}\n`;
          if (i.notes) md += `  - *${i.notes}*\n`;
        });
        md += `\n`;
      });

      return md;
    }

    return '';
  }, [template, items, selectedDate, todayStr]);

  if (!isOpen) return null;

  const handleCopy = () => {
    vscode.postMessage({
      command: 'COPY_TO_CLIPBOARD',
      payload: { text: generatedText, label: 'Copied report to clipboard!' }
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export ke Jira & Standup</h3>
              <p className="text-xs text-zinc-400">Salin format yang siap dimasukkan ke Jira</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Template Selectors */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTemplate('jira')}
              className={`p-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                template === 'jira'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              📋 Format Jira
            </button>
            <button
              onClick={() => setTemplate('standup')}
              className={`p-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                template === 'standup'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              Daily Standup
            </button>
            <button
              onClick={() => setTemplate('weekly')}
              className={`p-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                template === 'weekly'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              Weekly Summary
            </button>
          </div>

          {/* Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Teks Siap Salin (Jira / Markdown)
              </label>
              <span className="text-[10px] text-zinc-500">Tinggal paste di Jira Comment / Worklog</span>
            </div>
            <textarea
              readOnly
              rows={11}
              value={generatedText}
              className="w-full p-3 text-xs rounded-xl glass-input font-mono text-zinc-200 select-all focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800 flex-wrap">
            <button
              type="button"
              onClick={() => {
                vscode.postMessage({
                  command: 'EXPORT_EXCEL',
                  payload: { items }
                });
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>📊 Export ke Excel (.xlsx)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-blue-600/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin ke Clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
