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

  // Daily grouped data for the Level Meter Bar Chart
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#2d251d]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-amber-500 mb-1">
            DELIBERATE PRACTICE METRICS & LOGBOOK
          </div>
          <h2 className="text-2xl font-serif font-black text-[#f7f3ec] tracking-tight m-0">
            Studio Logbook
          </h2>
          <p className="text-xs text-[#9c9080] mt-1 font-mono">
            Audit practice consistency, verify exercise time allocation, and record offline workshop sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playMechanicalClick('stomp');
            setShowManualModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#241e17] hover:bg-[#30271e] text-amber-400 border border-[#42372a] font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-amber-500" />
          <span>Log Offline Practice</span>
        </button>
      </div>

      {/* Analog Studio Telemetry Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Practice Time in Range Meter */}
        <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-lg bg-[#241e17] text-amber-400 flex items-center justify-center border border-[#443728] shadow-inner flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070]">
              TOTAL LOGGED PRACTICE
            </div>
            <div className="text-xl md:text-2xl font-mono font-black text-[#f7f3ec] mt-0.5 tracking-tight">
              {hours > 0 ? `${hours}h ${remMinutes}m` : `${remMinutes} mins`}
            </div>
            <div className="text-[11px] font-mono text-[#8c8070]">
              {filteredLogs.length} verified sessions
            </div>
          </div>
        </div>

        {/* Current Day Streak Indicator */}
        <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-lg bg-[#271c17] text-orange-400 flex items-center justify-center border border-[#522f22] shadow-inner flex-shrink-0">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070]">
              DAILY STREAK
            </div>
            <div className="text-xl md:text-2xl font-mono font-black text-[#f7f3ec] mt-0.5 tracking-tight">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-[11px] font-mono text-[#8c8070]">
              Deliberate consistency
            </div>
          </div>
        </div>

        {/* Daily Target Benchmark */}
        <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-lg bg-[#19241b] text-emerald-400 flex items-center justify-center border border-[#264a2f] shadow-inner flex-shrink-0">
            <Award className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070]">
              DAILY TARGET BENCHMARK
            </div>
            <div className="text-xl md:text-2xl font-mono font-black text-[#f7f3ec] mt-0.5 tracking-tight">
              {settings.dailyGoalMinutes} mins
            </div>
            <div className="text-[11px] font-mono text-[#8c8070]">
              Target daily calibration
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter & Session Summary Console */}
      <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2d251d]">
          {/* Summary Sentence */}
          <div className="text-xs md:text-sm text-[#d6cdbe] font-sans">
            From <span className="font-mono font-bold text-amber-400">{formatReadableDate(startDateStr)}</span> to{' '}
            <span className="font-mono font-bold text-amber-400">{formatReadableDate(endDateStr)}</span> you logged{' '}
            <span className="font-mono font-black text-emerald-400">
              {hours > 0 ? `${hours} hours ${remMinutes} mins` : `${remMinutes} mins`}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-[#141210] p-1 rounded-lg border border-[#2e261e] text-xs font-mono font-bold">
            {(['7days', '14days', '30days', 'all', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setRangePreset(preset);
                }}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  rangePreset === preset ? 'bg-amber-500 text-[#141210]' : 'text-[#8c8070] hover:text-[#f0ebe1]'
                }`}
              >
                {preset === '7days' ? '7D' : preset === '14days' ? '14D' : preset === '30days' ? '30D' : preset === 'all' ? 'ALL' : 'CUSTOM'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers if 'custom' is active */}
        {rangePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 bg-[#141210] p-3 rounded-lg border border-[#2d251d] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#8c8070]">FROM:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#1c1916] border border-[#382f23] rounded px-2.5 py-1 text-[#f5f1ea] focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8c8070]">TO:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#1c1916] border border-[#382f23] rounded px-2.5 py-1 text-[#f5f1ea] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Daily Practice Level Meters */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c8070] flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-amber-500" /> DAILY LEVEL TELEMETRY
            </span>
            <span className="text-[10px] font-mono text-[#7d7262]">Minutes practiced per calendar day</span>
          </div>

          {dailyData.length > 0 ? (
            <div className="h-56 flex items-end gap-2 md:gap-3 pt-8 pb-4 px-2 border-b border-[#2d251d] overflow-x-auto bg-[#141210] rounded-lg border">
              {dailyData.map((day, idx) => {
                const heightPercent = maxDailyMinutes > 0 ? Math.round((day.minutes / maxDailyMinutes) * 100) : 0;
                const isZero = day.minutes === 0;

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[40px] flex flex-col items-center justify-end h-full group select-none"
                  >
                    {/* Value readout */}
                    <div className="text-[10px] font-mono font-bold text-amber-400 mb-1">
                      {day.minutes > 0 ? day.minutes : ''}
                    </div>

                    {/* Analog Level Bar */}
                    <div className="w-full max-w-[42px] bg-[#221c17] rounded-t relative flex items-end overflow-hidden h-36 border border-[#2f251c]">
                      <div
                        style={{ height: `${Math.max(isZero ? 4 : heightPercent, 4)}%` }}
                        className={`w-full rounded-t transition-all duration-300 ${
                          isZero
                            ? 'bg-[#2b221a]'
                            : 'bg-gradient-to-t from-[#b45309] to-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                        }`}
                      />
                    </div>

                    {/* Date label */}
                    <div className="text-[9px] font-mono font-semibold text-[#8c8070] mt-2 text-center truncate max-w-[60px]">
                      {day.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-[#7d7262] text-xs font-mono">
              No practice logs indexed for this date range.
            </div>
          )}
        </div>
      </div>

      {/* Exercise Time Allocation Breakdown */}
      <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#2d251d]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              setShowDetails(!showDetails);
            }}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#d6cdbe] hover:text-amber-400 transition-colors cursor-pointer"
          >
            <span>TIME ALLOCATION BY DRILL ({itemBreakdown.length})</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-[11px] font-mono text-[#8c8070]">Ranked by total practice minutes</span>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3.5 animate-in fade-in duration-100">
            {itemBreakdown.map((item, idx) => {
              const itemPercent = totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#f0ebe1] font-semibold flex items-center gap-2">
                      <ChordText text={item.name} />
                      <span className="text-[10px] font-mono text-[#7d7262]">
                        ({item.count} {item.count === 1 ? 'drill' : 'drills'})
                      </span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {item.minutes} mins ({itemPercent}%)
                    </span>
                  </div>
                  {/* Gauge level track */}
                  <div className="w-full bg-[#120f0d] h-2 rounded overflow-hidden border border-[#2d251d]">
                    <div
                      style={{ width: `${itemPercent}%` }}
                      className="bg-amber-500 h-full rounded transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}

            {itemBreakdown.length === 0 && (
              <div className="p-4 text-center text-[#7d7262] text-xs font-mono">
                No exercise breakdown recorded for the selected window.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw Practice Session Ledger Table */}
      <div className="bg-[#1c1916] border border-[#383025] rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#2d251d]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              setShowRawLogs(!showRawLogs);
            }}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#d6cdbe] hover:text-amber-400 transition-colors cursor-pointer"
          >
            <span>MASTER PRACTICE LEDGER ({filteredLogs.length})</span>
            {showRawLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-[11px] font-mono text-[#8c8070]">Audit and remove individual sessions</span>
        </div>

        {showRawLogs && (
          <div className="mt-4 overflow-x-auto animate-in fade-in duration-100">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2d251d] text-[#8c8070] uppercase tracking-wider text-[10px]">
                  <th className="pb-2">DATE</th>
                  <th className="pb-2">EXERCISE</th>
                  <th className="pb-2">SEQUENCE</th>
                  <th className="pb-2 text-center">REPS / BENCHMARK</th>
                  <th className="pb-2 text-right">TIME</th>
                  <th className="pb-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241e17]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#201c18]">
                    <td className="py-2.5 text-[#8c8070]">{log.date}</td>
                    <td className="py-2.5 font-sans font-semibold text-[#f0ebe1]">
                      <ChordText text={log.itemName} />
                    </td>
                    <td className="py-2.5 text-[#7d7262] truncate max-w-[150px]">
                      {log.routineName || 'Manual Entry'}
                    </td>
                    <td className="py-2.5 text-center">
                      {log.scoreCount !== undefined ? (
                        <span className="px-2 py-0.5 rounded bg-[#18271e] text-emerald-400 font-bold text-[11px] border border-[#234d31]">
                          {log.scoreCount} reps
                        </span>
                      ) : (
                        <span className="text-[#52493d]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-bold text-amber-400">
                      {log.minutes} min
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playMechanicalClick('toggle');
                          deletePracticeLog(log.id);
                        }}
                        className="p-1 text-[#7d7262] hover:text-[#e07b7b] transition-colors cursor-pointer"
                        title="Delete log record"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150">
          <div className="bg-[#1c1916] border-2 border-[#4f4233] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 relative">
            <div className="absolute top-2.5 left-2.5 screw-head" />
            <div className="absolute top-2.5 right-2.5 screw-head" />

            <div className="flex items-center justify-between pb-3 border-b border-[#2d251d]">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#f5f1ea] m-0">
                LOG OFFLINE WORKSHOP SESSION
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setShowManualModal(false);
                }}
                className="p-1 text-[#8c8070] hover:text-[#f5f1ea] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                  SESSION DATE
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs text-[#f5f1ea] font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                  EXERCISE / DRILL
                </label>
                <select
                  value={manualItemId}
                  onChange={(e) => setManualItemId(e.target.value)}
                  className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 text-xs text-[#f5f1ea] font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
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
                  <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    DURATION (MINUTES)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 font-mono text-amber-400 focus:outline-none focus:border-amber-500 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                    CHANGES / REPS (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={manualScoreCount}
                    onChange={(e) => setManualScoreCount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-[#141210] border border-[#382f23] rounded-lg px-3 py-2 font-mono text-emerald-400 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold uppercase tracking-wider text-[#8c8070] mb-1">
                  SESSION NOTES (OPTIONAL)
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Practiced with physical metronome on stand..."
                  className="w-full bg-[#141210] border border-[#382f23] rounded-lg p-2.5 text-xs text-[#f5f1ea] font-sans focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#2d251d]">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMechanicalClick('toggle');
                  setShowManualModal(false);
                }}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#8c8070] hover:text-[#f0ebe1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualPractice}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#141210] font-mono font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Stamp Practice Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
