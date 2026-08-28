import React, { useState, useEffect } from 'react';
import { X, Sparkles, GitBranch, GitPullRequest, Clock, Tag, Calendar, FileText, Bookmark } from 'lucide-react';
import { JourneyItem, JourneyCategory, MRStatus, GitInfo } from '../../types/journey';
import { CATEGORY_MAP, MR_STATUS_MAP } from '../../utils/category';
import { getTodayString } from '../../utils/date';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<JourneyItem, 'id' | 'createdAt' | 'updatedAt'> | JourneyItem) => void;
  editingItem: JourneyItem | null;
  defaultDate: string;
  gitInfo?: GitInfo;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  defaultDate,
  gitInfo
}) => {
  const [date, setDate] = useState<string>(defaultDate || getTodayString());
  const [jiraKey, setJiraKey] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<JourneyCategory>('feature');
  const [mrUrl, setMrUrl] = useState<string>('');
  const [mrStatus, setMrStatus] = useState<MRStatus>('in_review');
  const [branchName, setBranchName] = useState<string>('');
  const [repoName, setRepoName] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(60);
  const [notes, setNotes] = useState<string>('');
  const [completed, setCompleted] = useState<boolean>(true);

  // Sync state with editingItem or default values
  useEffect(() => {
    if (editingItem) {
      setDate(editingItem.date || getTodayString());
      setJiraKey(editingItem.jiraKey || '');
      setTitle(editingItem.title || '');
      setCategory(editingItem.category || 'feature');
      setMrUrl(editingItem.mrUrl || '');
      setMrStatus(editingItem.mrStatus || 'in_review');
      setBranchName(editingItem.branchName || '');
      setRepoName(editingItem.repoName || '');
      setDurationMinutes(editingItem.durationMinutes !== undefined ? editingItem.durationMinutes : 60);
      setNotes(editingItem.notes || '');
      setCompleted(editingItem.completed ?? true);
    } else {
      setDate(defaultDate || getTodayString());
      setTitle('');
      setCategory('feature');
      setMrUrl('');
      setMrStatus('in_review');
      setBranchName(gitInfo?.branch || '');
      setRepoName(gitInfo?.repoName || '');
      setDurationMinutes(60);
      setNotes('');
      setCompleted(true);

      // Auto extract Jira key from branch
      if (gitInfo?.branch) {
        const match = gitInfo.branch.match(/([A-Z]{2,10}-\d+)/i);
        if (match) {
          setJiraKey(match[1].toUpperCase());
        }
      }
    }
  }, [editingItem, defaultDate, gitInfo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      date: date || getTodayString(),
      jiraKey: jiraKey.trim() ? jiraKey.trim().toUpperCase() : undefined,
      title: title.trim(),
      category,
      mrUrl: mrUrl.trim() || undefined,
      mrStatus: mrUrl.trim() ? mrStatus : undefined,
      branchName: branchName.trim() || undefined,
      repoName: repoName.trim() || undefined,
      durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
      notes: notes.trim() || undefined,
      completed
    };

    if (editingItem) {
      onSave({
        ...editingItem,
        ...payload
      });
    } else {
      onSave(payload);
    }
    onClose();
  };

  const handleUseCurrentGitBranch = () => {
    if (gitInfo?.branch) {
      setBranchName(gitInfo.branch);
      const match = gitInfo.branch.match(/([A-Z]{2,10}-\d+)/i);
      if (match) {
        setJiraKey(match[1].toUpperCase());
      }
    }
    if (gitInfo?.repoName) {
      setRepoName(gitInfo.repoName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Task / Jira Log' : 'Tambah Task / Jira Log Baru'}
              </h3>
              <p className="text-xs text-zinc-400">Pekerjaan akan tersimpan & mudah di-copy ke Jira</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Jira Key & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="flex items-center gap-1 text-xs font-bold text-blue-400 mb-1.5 uppercase tracking-wider">
                <Bookmark className="w-3.5 h-3.5" />
                Jira Key
              </label>
              <input
                type="text"
                placeholder="MAP-102"
                value={jiraKey}
                onChange={e => setJiraKey(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-blue-300 font-mono placeholder-zinc-600 focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Judul Task / Jira Summary *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Implement account linking handler and validation"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Date & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                Kategori
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as JourneyCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer outline-none"
              >
                {Object.entries(CATEGORY_MAP).map(([key, meta]) => (
                  <option key={key} value={key} className="bg-zinc-900 text-zinc-100 py-1.5">
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Merge Request Information */}
          <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <GitPullRequest className="w-3.5 h-3.5" />
                Merge Request / PR (Opsional)
              </span>
            </div>

            <div>
              <input
                type="url"
                placeholder="https://gitlab.com/pertamina/map-customer-api/-/merge_requests/45"
                value={mrUrl}
                onChange={e => setMrUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input text-purple-200 placeholder-zinc-600 focus:ring-2 focus:ring-purple-500 font-mono text-[11px]"
              />
            </div>

            {mrUrl && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Status MR</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['draft', 'in_review', 'merged', 'closed'] as MRStatus[]).map(status => {
                    const meta = MR_STATUS_MAP[status];
                    const isSelected = mrStatus === status;
                    return (
                      <button
                        type="button"
                        key={status}
                        onClick={() => setMrStatus(status)}
                        className={`px-2 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? `${meta.bg} ${meta.color} ${meta.border} shadow-sm`
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Git Branch & Estimated Effort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  Branch Git
                </label>
                {gitInfo?.branch && (
                  <button
                    type="button"
                    onClick={handleUseCurrentGitBranch}
                    className="text-[10px] text-indigo-400 hover:underline font-medium"
                  >
                    Auto-detect
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="feature/MAP-102-account-linking"
                value={branchName}
                onChange={e => setBranchName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-200 placeholder-zinc-600 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Durasi (Menit)
              </label>
              <input
                type="number"
                min="0"
                step="15"
                placeholder="60"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-200 placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Deskripsi Pekerjaan / Notes (Untuk Jira Description)
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan detail apa saja yang diubah, fitur yang ditambahkan, atau testing yang dilakukan..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-200 placeholder-zinc-600 resize-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Completed Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="task-completed-check"
              checked={completed}
              onChange={e => setCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900 cursor-pointer"
            />
            <label htmlFor="task-completed-check" className="text-xs font-medium text-zinc-300 cursor-pointer">
              Tandai selesai untuk hari ini
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-blue-600/20"
            >
              {editingItem ? 'Simpan Perubahan' : 'Simpan Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
