import React, { useState, useMemo } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Search,
  Plus,
  GitBranch,
  FolderGit2,
  Check,
  Copy,
  FileText,
  AlignLeft,
  Share2
} from 'lucide-react';
import { JourneyItem } from '../../types/journey';
import { formatDate, formatRelativeDate, getTodayString } from '../../utils/date';
import { CATEGORY_MAP, MR_STATUS_MAP } from '../../utils/category';
import { vscode } from '../../utils/vscode';

interface TimelineFeedProps {
  items: JourneyItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenNewTask: () => void;
  onEditItem: (item: JourneyItem) => void;
  onToggleComplete: (item: JourneyItem) => void;
  onDeleteItem: (id: string) => void;
}

export const TimelineFeed: React.FC<TimelineFeedProps> = ({
  items,
  selectedDate,
  onSelectDate,
  onOpenNewTask,
  onEditItem,
  onToggleComplete,
  onDeleteItem
}) => {
  const [filterMode, setFilterMode] = useState<'selected_date' | 'all' | 'mrs_only'>('selected_date');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const todayStr = getTodayString();

  const handleCopy = (text: string, label: string, actionKey: string) => {
    vscode.postMessage({
      command: 'COPY_TO_CLIPBOARD',
      payload: { text, label }
    });
    setCopiedKey(actionKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyTitle = (item: JourneyItem) => {
    const text = item.jiraKey ? `[${item.jiraKey}] ${item.title}` : item.title;
    handleCopy(text, `Copied Judul: "${text}"`, `title_${item.id}`);
  };

  const handleCopyNotes = (item: JourneyItem) => {
    const text = item.notes || item.title;
    handleCopy(text, 'Copied Deskripsi / Notes!', `notes_${item.id}`);
  };

  const handleCopyJiraFormat = (item: JourneyItem) => {
    let text = `* ${item.jiraKey ? `*${item.jiraKey}* - ` : ''}${item.title}`;
    if (item.durationMinutes) {
      const hrs = (item.durationMinutes / 60).toFixed(1);
      text += ` _(${hrs}h)_`;
    }
    if (item.branchName) text += `\n  - Branch: {code}${item.branchName}{code}`;
    if (item.mrUrl) text += `\n  - MR: ${item.mrUrl}`;
    if (item.notes) text += `\n  - Deskripsi: ${item.notes}`;

    handleCopy(text, 'Copied Format Jira Comment!', `jira_${item.id}`);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterMode === 'selected_date' && selectedDate) {
        if (item.date !== selectedDate) return false;
      } else if (filterMode === 'mrs_only') {
        if (!item.mrUrl && !item.mrStatus) return false;
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesMR = item.mrUrl?.toLowerCase().includes(q) || item.mrTitle?.toLowerCase().includes(q);
        const matchesBranch = item.branchName?.toLowerCase().includes(q);
        const matchesJira = item.jiraKey?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes && !matchesMR && !matchesBranch && !matchesJira) {
          return false;
        }
      }

      return true;
    });
  }, [items, filterMode, selectedDate, selectedCategory, searchQuery]);

  const handleOpenUrl = (url?: string) => {
    if (!url) return;
    vscode.postMessage({
      command: 'OPEN_EXTERNAL_URL',
      payload: { url }
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Filter Controls */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {filterMode === 'selected_date'
                  ? `Timeline for ${formatRelativeDate(selectedDate)} (${formatDate(selectedDate)})`
                  : filterMode === 'mrs_only'
                  ? 'Merge Requests & PRs Timeline'
                  : 'All Activities Timeline'}
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'entry' : 'entries'} • Gunakan tombol copy untuk memasukkan ke Jira
            </p>
          </div>

          {/* Filter Mode Buttons */}
          <div className="flex items-center bg-zinc-950/60 p-1 rounded-xl border border-zinc-800 self-start md:self-auto">
            <button
              onClick={() => setFilterMode('selected_date')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'selected_date'
                  ? 'bg-zinc-800 text-blue-400 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {selectedDate === todayStr ? 'Today' : 'Selected Date'}
            </button>
            <button
              onClick={() => setFilterMode('mrs_only')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'mrs_only'
                  ? 'bg-zinc-800 text-purple-400 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              MRs Only
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-zinc-800 text-blue-400 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Jira key, branch, task title, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg glass-input text-zinc-200 placeholder-zinc-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 text-zinc-100 border border-zinc-700 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-zinc-100 py-1">
                All Categories
              </option>
              {Object.entries(CATEGORY_MAP).map(([key, meta]) => (
                <option key={key} value={key} className="bg-zinc-900 text-zinc-100 py-1">
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {filteredItems.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-300">No entries found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {filterMode === 'selected_date'
                ? `No tasks or MRs logged for ${formatDate(selectedDate)} yet.`
                : 'Try adjusting your search or category filters.'}
            </p>
          </div>
          <button
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Task / MR</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
          {filteredItems.map(item => {
            const catMeta = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
            const mrMeta = item.mrStatus ? MR_STATUS_MAP[item.mrStatus] : null;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node dot */}
                <div
                  onClick={() => onToggleComplete(item)}
                  className={`absolute -left-6 top-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 z-10 ${
                    item.completed
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm shadow-emerald-500/50'
                      : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 text-transparent'
                  }`}
                  title={item.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>

                {/* Card */}
                <div className="bg-zinc-900/70 hover:bg-zinc-900/95 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all shadow-md group-hover:shadow-xl backdrop-blur-md space-y-3">
                  {/* Top line: Badges & Edit/Delete */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Jira Key Badge */}
                      {item.jiraKey && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-sm">
                          {item.jiraKey}
                        </span>
                      )}

                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                      >
                        {catMeta.label}
                      </span>

                      {/* MR Status Badge */}
                      {item.mrStatus && mrMeta && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${mrMeta.bg} ${mrMeta.color} ${mrMeta.border}`}
                        >
                          <GitPullRequest className="w-3 h-3" />
                          {mrMeta.label}
                        </span>
                      )}

                      {/* Date Badge */}
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {formatDate(item.date)}
                      </span>

                      {/* Duration */}
                      {item.durationMinutes ? (
                        <span className="text-[11px] text-amber-400/90 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          {item.durationMinutes >= 60
                            ? `${(item.durationMinutes / 60).toFixed(1)}h`
                            : `${item.durationMinutes}m`}
                        </span>
                      ) : null}
                    </div>

                    {/* Actions: Edit, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Edit Entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Task Title Row with Quick Copy */}
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className={`text-sm font-semibold tracking-tight transition-colors flex-1 ${
                        item.completed ? 'line-through text-zinc-400' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Dedicated Quick Copy Bar for JIRA */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {/* Copy Judul Button */}
                    <button
                      onClick={() => handleCopyTitle(item)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-blue-300 border border-blue-500/30 hover:border-blue-500/60 transition-all shadow-sm"
                      title="Copy Judul task untuk dimasukkan ke Jira Summary"
                    >
                      {copiedKey === `title_${item.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{copiedKey === `title_${item.id}` ? 'Judul Tersalin!' : 'Copy Judul'}</span>
                    </button>

                    {/* Copy Deskripsi Button */}
                    <button
                      onClick={() => handleCopyNotes(item)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-sm"
                      title="Copy Deskripsi / Notes untuk Jira Description"
                    >
                      {copiedKey === `notes_${item.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlignLeft className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>{copiedKey === `notes_${item.id}` ? 'Deskripsi Tersalin!' : 'Copy Deskripsi'}</span>
                    </button>

                    {/* Copy Full Jira Format Button */}
                    <button
                      onClick={() => handleCopyJiraFormat(item)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800/80 hover:to-purple-800/80 text-purple-200 border border-purple-500/40 transition-all shadow-sm"
                      title="Copy format lengkap Jira (Judul + Branch + MR + Deskripsi)"
                    >
                      {copiedKey === `jira_${item.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-purple-300" />
                      )}
                      <span>{copiedKey === `jira_${item.id}` ? 'Jira Tersalin!' : 'Copy Format Jira'}</span>
                    </button>
                  </div>

                  {/* Notes / Description */}
                  {item.notes && (
                    <div className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 whitespace-pre-wrap font-sans">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Deskripsi / Worklog:
                      </div>
                      {item.notes}
                    </div>
                  )}

                  {/* Git and MR Link Footer */}
                  {(item.mrUrl || item.branchName || item.repoName) && (
                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.branchName && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">
                            <GitBranch className="w-3 h-3 text-indigo-400" />
                            {item.branchName}
                          </span>
                        )}
                        {item.repoName && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">
                            <FolderGit2 className="w-3 h-3 text-zinc-400" />
                            {item.repoName}
                          </span>
                        )}
                      </div>

                      {item.mrUrl && (
                        <button
                          onClick={() => handleOpenUrl(item.mrUrl)}
                          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30 transition-colors font-medium ml-auto"
                        >
                          <GitPullRequest className="w-3.5 h-3.5" />
                          <span>View MR</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
