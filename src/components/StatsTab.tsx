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
import { soundEngine } from '../utils/audio';

export const StatsTab: React.FC = () => {
  const { logs, items, addPracticeLog, deletePracticeLog, settings } = usePractice();

  // Date Range Filter
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

  // Daily grouped data for chart
  const dailyData = useMemo(() => {
    const daysMap: Record<string, number> = {};

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
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

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

  // Streak calculation
  const currentStreak = useMemo(() => {
    const distinctDates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
    if (distinctDates.length === 0) return 0;

    let streak = 0;
    const checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];

    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

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
      month: 'short',
      day: 'numeric',
    });
  };

  const hours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  const handleSaveManualPractice = () => {
    soundEngine.playMechanicalClick('stomp');
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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#222222]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">
            Practice Statistics
          </h2>
          <p className="text-xs text-[#888888] mt-1 font-sans">
            Review practice history, daily consistency, and exercise distribution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playMechanicalClick('stomp');
            setShowManualModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#242424] text-white border border-[#2a2a2a] text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Log Offline Practice</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Time */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#1c1c1c] text-amber-400 flex items-center justify-center border border-[#2a2a2a] flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] text-[#737373]">
              Practice Time
            </div>
            <div className="text-xl font-mono font-medium text-white tracking-tight mt-0.5">
              {hours > 0 ? `${hours}h ${remMinutes}m` : `${remMinutes}m`}
            </div>
            <div className="text-[11px] text-[#666666]">
              {filteredLogs.length} sessions
            </div>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#1c1c1c] text-orange-400 flex items-center justify-center border border-[#2a2a2a] flex-shrink-0">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-[11px] text-[#737373]">
              Daily Streak
            </div>
            <div className="text-xl font-mono font-medium text-white tracking-tight mt-0.5">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
            <div className="text-[11px] text-[#666666]">
              Consecutive days
            </div>
          </div>
        </div>

        {/* Daily Target */}
        <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#1c1c1c] text-emerald-400 flex items-center justify-center border border-[#2a2a2a] flex-shrink-0">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] text-[#737373]">
              Daily Goal
            </div>
            <div className="text-xl font-mono font-medium text-white tracking-tight mt-0.5">
              {settings.dailyGoalMinutes}m
            </div>
            <div className="text-[11px] text-[#666666]">
              Target daily progress
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter & Bar Chart */}
      <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1f1f1f]">
          <div className="text-xs text-[#d4d4d4]">
            <span>{formatReadableDate(startDateStr)}</span> – <span>{formatReadableDate(endDateStr)}</span>: total{' '}
            <span className="font-mono text-amber-400 font-medium">
              {hours > 0 ? `${hours}h ${remMinutes}m` : `${remMinutes}m`}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-md border border-[#262626] text-xs font-mono">
            {(['7days', '14days', '30days', 'all', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setRangePreset(preset);
                }}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                  rangePreset === preset ? 'bg-[#262626] text-white font-medium' : 'text-[#737373] hover:text-[#d4d4d4]'
                }`}
              >
                {preset === '7days' ? '7d' : preset === '14days' ? '14d' : preset === '30days' ? '30d' : preset === 'all' ? 'All' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers */}
        {rangePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 bg-[#111111] p-2.5 rounded border border-[#222222] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#737373]">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#181818] border border-[#2a2a2a] rounded px-2 py-0.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#737373]">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#181818] border border-[#2a2a2a] rounded px-2 py-0.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* Daily Bar Chart */}
        <div>
          <div className="text-[11px] font-mono text-[#737373] mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Daily Minutes</span>
          </div>

          {dailyData.length > 0 ? (
            <div className="h-44 flex items-end gap-2 md:gap-3 pt-6 pb-2 px-2 overflow-x-auto">
              {dailyData.map((day, idx) => {
                const heightPercent = maxDailyMinutes > 0 ? Math.round((day.minutes / maxDailyMinutes) * 100) : 0;
                const isZero = day.minutes === 0;

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[36px] flex flex-col items-center justify-end h-full select-none"
                  >
                    <div className="text-[10px] font-mono text-[#888888] mb-1">
                      {day.minutes > 0 ? day.minutes : ''}
                    </div>

                    <div className="w-full max-w-[32px] bg-[#1a1a1a] rounded-t relative flex items-end overflow-hidden h-28">
                      <div
                        style={{ height: `${Math.max(isZero ? 4 : heightPercent, 4)}%` }}
                        className={`w-full rounded-t transition-all duration-200 ${
                          isZero ? 'bg-[#222222]' : 'bg-amber-400'
                        }`}
                      />
                    </div>

                    <div className="text-[9px] font-mono text-[#666666] mt-1.5 text-center truncate max-w-[50px]">
                      {day.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-[#666666] text-xs">
              No practice logs in this date range.
            </div>
          )}
        </div>
      </div>

      {/* Exercise Breakdown */}
      <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              setShowDetails(!showDetails);
            }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
          >
            <span>Time by Exercise ({itemBreakdown.length})</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[11px] font-mono text-[#666666]">Sorted by duration</span>
        </div>

        {showDetails && (
          <div className="mt-3.5 space-y-3 animate-in fade-in duration-100">
            {itemBreakdown.map((item, idx) => {
              const itemPercent = totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium flex items-center gap-2">
                      <ChordText text={item.name} />
                      <span className="text-[10px] font-mono text-[#666666]">
                        ({item.count} {item.count === 1 ? 'session' : 'sessions'})
                      </span>
                    </span>
                    <span className="font-mono text-amber-400">
                      {item.minutes}m ({itemPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#1c1c1c] h-1.5 rounded overflow-hidden">
                    <div
                      style={{ width: `${itemPercent}%` }}
                      className="bg-amber-400 h-full rounded transition-all duration-200"
                    />
                  </div>
                </div>
              );
            })}

            {itemBreakdown.length === 0 && (
              <div className="p-4 text-center text-[#666666] text-xs">
                No exercise breakdown for this range.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw Practice History Table */}
      <div className="bg-[#141414] border border-[#222222] rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              setShowRawLogs(!showRawLogs);
            }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
          >
            <span>History Log ({filteredLogs.length})</span>
            {showRawLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[11px] font-mono text-[#666666]">Review past records</span>
        </div>

        {showRawLogs && (
          <div className="mt-3 overflow-x-auto animate-in fade-in duration-100">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#222222] text-[#666666] uppercase text-[10px]">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Exercise</th>
                  <th className="pb-2">Routine</th>
                  <th className="pb-2 text-center">Score</th>
                  <th className="pb-2 text-right">Time</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1a1a1a]">
                    <td className="py-2 text-[#737373]">{log.date}</td>
                    <td className="py-2 font-sans font-medium text-white">
                      <ChordText text={log.itemName} />
                    </td>
                    <td className="py-2 text-[#666666] truncate max-w-[140px]">
                      {log.routineName || 'Manual'}
                    </td>
                    <td className="py-2 text-center">
                      {log.scoreCount !== undefined ? (
                        <span className="text-emerald-400 font-mono">
                          {log.scoreCount} reps
                        </span>
                      ) : (
                        <span className="text-[#404040]">—</span>
                      )}
                    </td>
                    <td className="py-2 text-right text-amber-400 font-medium">
                      {log.minutes}m
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          deletePracticeLog(log.id);
                        }}
                        className="p-1 text-[#666666] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete entry"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-100">
          <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <h3 className="text-sm font-semibold text-white m-0">
                Log Offline Practice
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setShowManualModal(false);
                }}
                className="p-1 text-[#737373] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#888888] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#888888] mb-1">
                  Exercise
                </label>
                <select
                  value={manualItemId}
                  onChange={(e) => setManualItemId(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
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
                  <label className="block text-[11px] text-[#888888] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#888888] mb-1">
                    Score / Reps (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={manualScoreCount}
                    onChange={(e) => setManualScoreCount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#888888] mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Practiced with acoustic guitar..."
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setShowManualModal(false);
                }}
                className="px-3 py-1.5 text-xs text-[#888888] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualPractice}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-white hover:bg-[#e5e5e5] text-black font-medium text-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
