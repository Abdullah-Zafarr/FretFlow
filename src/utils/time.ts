/**
 * Time utility functions for formatting and flexible human input parsing.
 */

/**
 * Format seconds into MM:SS or HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse any user-entered time string into total seconds.
 * 
 * Supports:
 * - "03:00", "3:00", "12:45" (MM:SS)
 * - "1:15:00", "01:30:00" (HH:MM:SS)
 * - ":45", "0:45" (seconds)
 * - "5m", "5 min", "5 mins", "10 minutes"
 * - "45s", "45 sec", "45 seconds"
 * - "2m 30s", "2m30s", "1 min 45 sec"
 * - "1h 15m", "1 hr 30 mins"
 * - "3.5", "3,5" (decimal minutes -> 210s)
 * - Plain number <= 60: treated as minutes (e.g. "5" -> 300s, "10" -> 600s, "1" -> 60s)
 * - Plain number > 60: treated as seconds (e.g. "90" -> 90s, "120" -> 120s)
 * 
 * Returns number of seconds or null if unparseable.
 */
export function parseTimeToSeconds(input: string): number | null {
  if (!input) return null;
  const raw = input.trim().toLowerCase();
  if (!raw) return null;

  // 1. Format: HH:MM:SS or H:MM:SS
  const hmsMatch = raw.match(/^(\d+):([0-5]?\d):([0-5]?\d)$/);
  if (hmsMatch) {
    const hours = parseInt(hmsMatch[1], 10);
    const mins = parseInt(hmsMatch[2], 10);
    const secs = parseInt(hmsMatch[3], 10);
    return hours * 3600 + mins * 60 + secs;
  }

  // 2. Format: MM:SS or M:SS
  const msMatch = raw.match(/^(\d+):([0-5]?\d)$/);
  if (msMatch) {
    const mins = parseInt(msMatch[1], 10);
    const secs = parseInt(msMatch[2], 10);
    return mins * 60 + secs;
  }

  // 3. Format: :SS (e.g. ":45", ":30")
  const secColonMatch = raw.match(/^:([0-5]?\d)$/);
  if (secColonMatch) {
    return parseInt(secColonMatch[1], 10);
  }

  // 4. Units format: e.g. "1h 20m 30s", "5m", "45s", "2m30s"
  const hourMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
  const minMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/);
  const secMatch = raw.match(/(\d+)\s*(?:s|sec|secs|second|seconds)/);

  if (hourMatch || minMatch || secMatch) {
    let total = 0;
    if (hourMatch) {
      total += Math.round(parseFloat(hourMatch[1]) * 3600);
    }
    if (minMatch) {
      total += Math.round(parseFloat(minMatch[1]) * 60);
    }
    if (secMatch) {
      total += parseInt(secMatch[1], 10);
    }
    return total;
  }

  // 5. Decimal minutes: e.g. "3.5" or "3,5"
  const normalizedDecimal = raw.replace(',', '.');
  if (/^\d+\.\d+$/.test(normalizedDecimal)) {
    const val = parseFloat(normalizedDecimal);
    if (!isNaN(val) && val >= 0) {
      return Math.round(val * 60);
    }
  }

  // 6. Plain integer number
  if (/^\d+$/.test(raw)) {
    const num = parseInt(raw, 10);
    if (num <= 0) return 0;
    // Numbers <= 60 represent minutes in practice drills (e.g. 5 -> 5 mins)
    // Numbers > 60 represent seconds (e.g. 90 -> 90s = 1m30s)
    if (num <= 60) {
      return num * 60;
    } else {
      return num;
    }
  }

  return null;
}
