import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Clock,
  Plus,
  Trash2,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Save,
} from 'lucide-react';
import { usePractice } from '../context/usePractice';
import { ChordText } from './ChordText';

export const StatsTab: React.FC = () => {
  const { logs, items, addPracticeLog, deletePracticeLog, settings } = usePractice();

  // Date Range Filter
  // Default to a 7-day span
  const [rangePreset, setRangePreset] = useState<'7days' | '14days' | '30days' | 'all' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // UI view toggles
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showRawLogs, setShowRawLogs] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Manual practice modal state
  const [manualDate, setManualDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [manualItemId, setManualItemId] = useState<string>(items[0]?.id || '');
  const [manualMinutes, setManualMinutes] = useState<number>(15);
  const [manualScoreCount, setManualScoreCount] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Active items for dropdown
  const activeItems = items.filter((i) => !i.archived);

  // Calculate effective date filter boundaries
  const { startDateStr, endDateStr } = useMemo(() => {
    const today = new Date();
    if (rangePreset === '7days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return {
        startDateStr: start.toISOString().split('T')[0],
        endDateStr: today.toISOString().split('T')[0],
      };
    }
    if (rangePreset === '14days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 13);
      return {
        startDateStr: start.toISOString().split('T')[0],
        endDateStr: today.toISOString().split('T')[0],
      };
    }
    if (rangePreset === '30days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return {
        startDateStr: start.toISOString().split('T')[0],
        endDateStr: today.toISOString().split('T')[0],
      };
    }
    if (rangePreset === 'all') {
      return {
        startDateStr: '2020-01-01',
        endDateStr: '2099-12-31',
      };
    }
    return {
      startDateStr: customStartDate,
      endDateStr: customEndDate,
    };
  }, [rangePreset, customStartDate, customEndDate]);

  // Filter logs within range
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      return log.date >= startDateStr && log.date <= endDateStr;
    });
  }, [logs, startDateStr, endDateStr]);

  // Total minutes in range
  const totalMinutes = useMemo(() => {
    return filteredLogs.reduce((acc, l) => acc + l.minutes, 0);
  }, [filteredLogs]);

  // Daily grouped data for the Bar Chart
  const dailyData = useMemo(() => {
    const daysMap: Record<string, number> = {};

    // If preset is 7days or 14days, create zero-filled slots for every day in span
    if (rangePreset === '7days' || rangePreset === '14days') {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        daysMap[key] = 0;
      }
    }

    filteredLogs.forEach((log) => {
      daysMap[log.date] = (daysMap[log.date] || 0) + log.minutes;
    });

    const entries = Object.keys(daysMap)
      .sort()
      .map((dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

        return {
          date: dateStr,
          label: `${dayName} ${monthDay}`,
          minutes: daysMap[dateStr],
        };
      });

    return entries;
  }, [filteredLogs, rangePreset, startDateStr, endDateStr]);

  // Max minutes in daily data for chart height scaling
  const maxDailyMinutes = useMemo(() => {
    const max = Math.max(...dailyData.map((d) => d.minutes), 0);
    return Math.max(max, 30);
  }, [dailyData]);

  // Breakdown per exercise item
  const itemBreakdown = useMemo(() => {
    const map: Record<string, { name: string; minutes: number; count: number }> = {};
    filteredLogs.forEach((log) => {
      if (!map[log.itemId]) {
        map[log.itemId] = { name: log.itemName, minutes: 0, count: 0 };
      }
      map[log.itemId].minutes += log.minutes;
      map[log.itemId].count += 1;
    });
    return Object.values(map).sort((a, b) => b.minutes - a.minutes);
  }, [filteredLogs]);

  // Streak calculation (consecutive days with at least 1 log)
  const currentStreak = useMemo(() => {
    const distinctDates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
    if (distinctDates.length === 0) return 0;

    let streak = 0;
    const checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];

    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    // Did practice today or yesterday to maintain active streak
    let currentTarget: string | null = distinctDates.includes(todayStr) ? todayStr : distinctDates.includes(yesterdayStr) ? yesterdayStr : null;

    if (!currentTarget) return 0;

    for (const dStr of distinctDates) {
      if (dStr === currentTarget) {
        streak++;
        const prevDay: Date = new Date(dStr);
        prevDay.setDate(prevDay.getDate() - 1);
        currentTarget = prevDay.toISOString().split('T')[0];
      }
    }
    return streak;
  }, [logs]);

  // Format date readable
  const formatReadableDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 10) return dateStr;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const hours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  const handleSaveManualPractice = () => {
    const item = items.find((i) => i.id === manualItemId);
    if (!item) return;

    const parsedScore = manualScoreCount ? parseInt(manualScoreCount, 10) : undefined;

    addPracticeLog({
      itemId: item.id,
      itemName: item.name,
      minutes: manualMinutes,
      date: manualDate,
      notes: manualNotes,
      scoreCount: isNaN(parsedScore as number) ? undefined : parsedScore,
      routineName: 'Manual Entry',
    });

    setShowManualModal(false);
    setManualNotes('');
    setManualScoreCount('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Practice Statistics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your deliberate practice consistency, exercise breakdown, and streak.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Offline Practice</span>
        </button>
      </div>

      {/* Highlights & Streaks Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Practice Time in Range */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Practice Time
            </div>
            <div className="text-xl md:text-2xl font-black text-white mt-0.5">
              {hours > 0 ? `${hours}h ${remMinutes}m` : `${remMinutes} mins`}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {filteredLogs.length} logged sessions
            </div>
          </div>
        </div>

        {/* Current Day Streak */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Daily Streak
            </div>
            <div className="text-xl md:text-2xl font-black text-white mt-0.5">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Consistency is key
            </div>
          </div>
        </div>

        {/* Daily Goal Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Daily Target
            </div>
            <div className="text-xl md:text-2xl font-black text-white mt-0.5">
              {settings.dailyGoalMinutes} mins
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Recommended for steady progress
            </div>
          </div>
        </div>
      </div>

      {/* 5.1 Summary Sentence & Date Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          {/* Summary sentence exactly like JustinGuitar */}
          <div className="text-sm md:text-base text-slate-200 font-medium">
            From <span className="font-bold text-amber-400">{formatReadableDate(startDateStr)}</span> to{' '}
            <span className="font-bold text-amber-400">{formatReadableDate(endDateStr)}</span> you practiced{' '}
            <span className="font-bold text-emerald-400 font-mono">
              ⏱ {hours > 0 ? `${hours} hours ${remMinutes} mins` : `${remMinutes} mins`}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRangePreset('7days')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                rangePreset === '7days' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setRangePreset('14days')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                rangePreset === '14days' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setRangePreset('30days')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                rangePreset === '30days' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setRangePreset('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                rangePreset === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setRangePreset('custom')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                rangePreset === 'custom' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom Date Pickers if 'custom' is active */}
        {rangePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* 5.2 Daily Practice Bar Chart */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-500" /> Daily Minutes
            </span>
            <span className="text-[11px] text-slate-500">Minutes practiced per day</span>
          </div>

          {dailyData.length > 0 ? (
            <div className="h-56 flex items-end gap-2 md:gap-4 pt-8 pb-4 px-2 border-b border-slate-800 overflow-x-auto">
              {dailyData.map((day, idx) => {
                const heightPercent = maxDailyMinutes > 0 ? Math.round((day.minutes / maxDailyMinutes) * 100) : 0;
                const isZero = day.minutes === 0;

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[38px] flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    {/* Value label on top of bar */}
                    <div className="text-[11px] font-mono font-bold text-amber-400 mb-1 transition-transform group-hover:scale-110">
                      {day.minutes > 0 ? day.minutes : ''}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] bg-slate-800/60 rounded-t-lg relative flex items-end overflow-hidden h-36">
                      <div
                        style={{ height: `${Math.max(isZero ? 4 : heightPercent, 4)}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isZero
                            ? 'bg-slate-800/40'
                            : 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        }`}
                      />
                    </div>

                    {/* Date label at bottom */}
                    <div className="text-[9px] md:text-[10px] text-slate-500 font-medium mt-2 text-center truncate max-w-[60px] group-hover:text-slate-300">
                      {day.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No practice recorded in this date range.
            </div>
          )}
        </div>
      </div>

      {/* 5.3 Show Details Breakdown per Exercise Item */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 transition-colors"
          >
            <span>Exercise Breakdown ({itemBreakdown.length})</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-xs text-slate-500">Sorted by time practiced</span>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3 animate-in fade-in duration-200">
            {itemBreakdown.map((item, idx) => {
              const itemPercent = totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200 flex items-center gap-2">
                      <ChordText text={item.name} />
                      <span className="text-[10px] font-normal text-slate-500">
                        ({item.count} {item.count === 1 ? 'session' : 'sessions'})
                      </span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {item.minutes} mins ({itemPercent}%)
                    </span>
                  </div>
                  {/* Progress fill */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${itemPercent}%` }}
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}

            {itemBreakdown.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-xs">
                No exercise breakdown available for selected range.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5.4 Raw Recorded Logs Table & Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setShowRawLogs(!showRawLogs)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-amber-400 transition-colors"
          >
            <span>Raw Practice History Log ({filteredLogs.length})</span>
            {showRawLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-xs text-slate-500">Review or delete past entries</span>
        </div>

        {showRawLogs && (
          <div className="mt-4 overflow-x-auto animate-in fade-in duration-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Exercise</th>
                  <th className="pb-2">Routine</th>
                  <th className="pb-2 text-center">Score / Reps</th>
                  <th className="pb-2 text-right">Duration</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-mono text-slate-400">{log.date}</td>
                    <td className="py-2.5 font-semibold text-slate-200">
                      <ChordText text={log.itemName} />
                    </td>
                    <td className="py-2.5 text-slate-500 truncate max-w-[150px]">
                      {log.routineName || 'Manual Entry'}
                    </td>
                    <td className="py-2.5 text-center">
                      {log.scoreCount !== undefined ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/20">
                          {log.scoreCount} reps
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-amber-400">
                      {log.minutes} min
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => deletePracticeLog(log.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Practice Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Log Practice Session</h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Exercise
                </label>
                <select
                  value={manualItemId}
                  onChange={(e) => setManualItemId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {activeItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.defaultMinutes}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-amber-400 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Score / Reps (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={manualScoreCount}
                    onChange={(e) => setManualScoreCount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-emerald-400 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Practiced with metronome at 90 BPM..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualPractice}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Practice Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
