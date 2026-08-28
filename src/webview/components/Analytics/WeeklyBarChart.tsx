import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  GitPullRequest,
  CheckCircle2,
  Clock,
  PieChart as PieIcon,
  Flame
} from 'lucide-react';
import { JourneyItem } from '../../types/journey';
import { getWeekDays, getTodayString, formatDate } from '../../utils/date';
import { CATEGORY_MAP } from '../../utils/category';

interface WeeklyBarChartProps {
  items: JourneyItem[];
  onSelectDate: (date: string) => void;
  onNavigateToTimeline: () => void;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  items,
  onSelectDate,
  onNavigateToTimeline
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const centerDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(centerDate), [centerDate]);

  const startDateStr = weekDays[0].date;
  const endDateStr = weekDays[6].date;

  // Compute chart data for the current 7-day week
  const { chartData, totalTasks, totalMRs, totalMinutes, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    let tTasks = 0;
    let tMRs = 0;
    let tMin = 0;

    const data = weekDays.map(day => {
      const dayItems = items.filter(item => item.date === day.date);
      const completedTasks = dayItems.filter(item => item.completed).length;
      const pendingTasks = dayItems.filter(item => !item.completed).length;
      const mrCount = dayItems.filter(item => item.mrUrl || item.mrStatus).length;
      const mergedMRs = dayItems.filter(item => item.mrStatus === 'merged').length;

      dayItems.forEach(i => {
        counts[i.category] = (counts[i.category] || 0) + 1;
        tTasks += 1;
        if (i.mrUrl || i.mrStatus) tMRs += 1;
        if (i.durationMinutes) tMin += i.durationMinutes;
      });

      return {
        date: day.date,
        day: day.dayName,
        dayNumber: day.dayNumber,
        label: `${day.dayName} (${day.dayNumber})`,
        Tasks: dayItems.length,
        Completed: completedTasks,
        MRs: mrCount,
        MergedMRs: mergedMRs,
        isToday: day.isToday
      };
    });

    return {
      chartData: data,
      totalTasks: tTasks,
      totalMRs: tMRs,
      totalMinutes: tMin,
      categoryCounts: counts
    };
  }, [weekDays, items]);

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryCounts);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return {
      category: entries[0][0],
      count: entries[0][1]
    };
  }, [categoryCounts]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-bold text-zinc-100 border-b border-zinc-800 pb-1 flex items-center justify-between gap-4">
            <span>{formatDate(data.date)}</span>
            {data.isToday && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold">Today</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 text-zinc-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Total Tasks:
            </span>
            <span className="font-bold">{data.Tasks}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-zinc-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed:
            </span>
            <span className="font-bold text-emerald-400">{data.Completed}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-zinc-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Merge Requests:
            </span>
            <span className="font-bold text-purple-400">{data.MRs}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Week Navigator Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Weekly Performance & MRs</h2>
              <p className="text-xs text-zinc-400">
                {formatDate(startDateStr)} — {formatDate(endDateStr)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 transition-colors"
            >
              Current Week
            </button>
            <div className="flex items-center bg-zinc-800/70 border border-zinc-700/70 rounded-lg p-0.5">
              <button
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Total Tasks</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white">{totalTasks}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">logged this week</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Merge Requests</span>
              <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-300">{totalMRs}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">branches / MRs worked</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Time Logged</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300">
              {(totalMinutes / 60).toFixed(1)} <span className="text-xs font-normal text-zinc-400">hrs</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">estimated effort</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Top Focus</span>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-sm font-bold text-rose-300 truncate">
              {topCategory ? CATEGORY_MAP[topCategory.category as any]?.label || topCategory.category : 'N/A'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {topCategory ? `${topCategory.count} items` : 'no activity'}
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Daily Distribution (Tasks vs MRs)
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                <span className="text-zinc-300 text-[11px]">Tasks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500 shadow-sm shadow-purple-500/50"></span>
                <span className="text-zinc-300 text-[11px]">Merge Requests</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    const d = data.activePayload[0].payload.date;
                    onSelectDate(d);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                <Bar
                  dataKey="Tasks"
                  name="Tasks"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="MRs"
                  name="Merge Requests"
                  fill="#a855f7"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-center text-zinc-500 mt-2">
            Tip: Click on any day bar to view detailed activities for that day.
          </p>
        </div>
      </div>

      {/* Category Breakdown Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
          <PieIcon className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-white">Category Breakdown this Week</h3>
        </div>

        {totalTasks === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">
            No activities recorded during this week yet.
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([catKey, count]) => {
                const meta = CATEGORY_MAP[catKey as any] || CATEGORY_MAP.other;
                const percentage = Math.round((count / totalTasks) * 100);
                return (
                  <div key={catKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: meta.dotColor }}
                        />
                        <span className="text-zinc-200 font-medium">{meta.label}</span>
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        <span className="font-semibold text-zinc-200">{count}</span> ({percentage}%)
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: meta.dotColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
