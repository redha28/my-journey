import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  GitPullRequest,
  CheckCircle2,
  Clock,
  Copy,
  AlignLeft,
  Check,
  Trash2,
  Edit3
} from 'lucide-react';
import { JourneyItem } from '../../types/journey';
import { getMonthMatrix, getTodayString, formatDate } from '../../utils/date';
import { CATEGORY_MAP } from '../../utils/category';
import { vscode } from '../../utils/vscode';

interface CalendarViewProps {
  items: JourneyItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenNewTaskForDate: (date: string) => void;
  onEditItem: (item: JourneyItem) => void;
  onDeleteItem: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  selectedDate,
  onSelectDate,
  onOpenNewTaskForDate,
  onEditItem,
  onDeleteItem
}) => {
  const todayStr = getTodayString();
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    vscode.postMessage({
      command: 'COPY_TO_CLIPBOARD',
      payload: { text, label }
    });
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem(id);
  };

  // Group items by Date
  const itemsByDate = React.useMemo(() => {
    const map: Record<string, JourneyItem[]> = {};
    items.forEach(item => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [items]);

  const monthMatrix = React.useMemo(() => {
    return getMonthMatrix(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    onSelectDate(todayStr);
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const selectedDateItems = itemsByDate[selectedDate] || [];

  return (
    <div className="space-y-6">
      {/* Calendar Header & Month Picker */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{monthName}</h2>
              <p className="text-xs text-zinc-400">Pilih tanggal untuk melihat atau menambah aktivitas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTodayClick}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700"
            >
              Today
            </button>
            <div className="flex items-center bg-zinc-950/60 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 py-2 border-b border-zinc-800/80 mb-2">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-rose-400/80">Sat</div>
          <div className="text-rose-400/80">Sun</div>
        </div>

        {/* Month Grid */}
        <div className="space-y-2">
          {monthMatrix.map((week, wIndex) => (
            <div key={wIndex} className="grid grid-cols-7 gap-2">
              {week.map(day => {
                const dayItems = itemsByDate[day.date] || [];
                const hasMR = dayItems.some(i => i.mrUrl || i.mrStatus);
                const isSelected = day.date === selectedDate;
                const isToday = day.date === todayStr;

                const dayDateObj = new Date(day.date);
                const isWeekend = dayDateObj.getDay() === 0 || dayDateObj.getDay() === 6;

                return (
                  <div
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    className={`min-h-[86px] sm:min-h-[96px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none group relative ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : isWeekend && day.isCurrentMonth
                        ? 'bg-rose-950/15 border-rose-900/30 hover:bg-rose-950/25 hover:border-rose-800/50'
                        : day.isCurrentMonth
                        ? 'bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700'
                        : 'bg-zinc-950/20 border-zinc-900/60 opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* Top Row: Day Number & Today indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-blue-600 text-white font-bold'
                            : isSelected
                            ? 'text-blue-300 font-bold'
                            : isWeekend && day.isCurrentMonth
                            ? 'text-rose-400 font-bold'
                            : isWeekend && !day.isCurrentMonth
                            ? 'text-rose-400/40'
                            : day.isCurrentMonth
                            ? 'text-zinc-200'
                            : 'text-zinc-500'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {/* Badges */}
                      <div className="flex items-center gap-1">
                        {hasMR && (
                          <span title="Contains Merge Request" className="p-0.5 rounded bg-purple-500/20 text-purple-400">
                            <GitPullRequest className="w-3 h-3" />
                          </span>
                        )}
                        {dayItems.length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {dayItems.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Activity Dots / Preview */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dayItems.slice(0, 2).map((item, i) => {
                        const meta = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
                        return (
                          <div
                            key={i}
                            className="text-[10px] truncate px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 flex items-center gap-1 border border-zinc-700/50"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: meta.dotColor }}
                            />
                            <span className="truncate">{item.title}</span>
                          </div>
                        );
                      })}
                      {dayItems.length > 2 && (
                        <div className="text-[9px] text-zinc-500 font-medium pl-1">
                          +{dayItems.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Activity List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Activities on {formatDate(selectedDate)}</h3>
              {selectedDate === todayStr && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {selectedDateItems.length} {selectedDateItems.length === 1 ? 'task' : 'tasks'} recorded • Gunakan tombol copy untuk Jira
            </p>
          </div>

          <button
            onClick={() => onOpenNewTaskForDate(selectedDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task for this Date</span>
          </button>
        </div>

        {selectedDateItems.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-zinc-800">
            <Clock className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400 font-medium">No journey entries recorded for {formatDate(selectedDate)}</p>
            <p className="text-xs text-zinc-500 mt-1">Click the button above to log what you worked on or any MR created.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedDateItems.map(item => {
              const meta = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
              return (
                <div
                  key={item.id}
                  onClick={() => onEditItem(item)}
                  className="p-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group space-y-2.5 relative"
                >
                  {/* Top Bar: Badges & Action Icons (Edit / Delete) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {item.jiraKey && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-sm">
                          {item.jiraKey}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.completed && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mr-1">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onEditItem(item);
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Edit Task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={e => handleDelete(item.id, e)}
                        className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>

                  {/* Copy buttons for quick Jira entry */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <button
                      onClick={e => handleCopy(item.jiraKey ? `[${item.jiraKey}] ${item.title}` : item.title, 'Copied Judul!', `cal_title_${item.id}`, e)}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-800 hover:bg-zinc-700 text-blue-300 border border-blue-500/30 transition-colors"
                      title="Copy Judul"
                    >
                      {copiedKey === `cal_title_${item.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-blue-400" />}
                      <span>{copiedKey === `cal_title_${item.id}` ? 'Tersalin!' : 'Copy Judul'}</span>
                    </button>

                    <button
                      onClick={e => handleCopy(item.notes || item.title, 'Copied Deskripsi!', `cal_notes_${item.id}`, e)}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30 transition-colors"
                      title="Copy Deskripsi / Notes"
                    >
                      {copiedKey === `cal_notes_${item.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <AlignLeft className="w-3 h-3 text-emerald-400" />}
                      <span>{copiedKey === `cal_notes_${item.id}` ? 'Tersalin!' : 'Copy Deskripsi'}</span>
                    </button>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-zinc-400 line-clamp-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                      {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
