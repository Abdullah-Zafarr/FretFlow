import { describe, it, expect } from 'vitest';
import { INITIAL_ROUTINES, INITIAL_ITEMS, INITIAL_LOGS } from '../data/initialData';

describe('Practice Assistant Data Verification', () => {
  it('loads active routine "Rhytm and Timing mastery" with exact 14 items', () => {
    const active = INITIAL_ROUTINES.find((r) => r.active);
    expect(active).toBeDefined();
    expect(active?.name).toBe('Rhytm and Timing mastery');
    expect(active?.entries).toHaveLength(14);
  });

  it('verifies routine total duration sums exactly to 51 minutes', () => {
    const active = INITIAL_ROUTINES.find((r) => r.active);
    const totalMinutes = active?.entries.reduce((sum, entry) => {
      const item = INITIAL_ITEMS.find((i) => i.id === entry.itemId);
      return sum + (entry.minutes || item?.defaultMinutes || 0);
    }, 0);

    expect(totalMinutes).toBe(51);
  });

  it('verifies demo practice logs for Oct 20-26 total 222 minutes (3h 42m)', () => {
    const totalMinutes = INITIAL_LOGS.reduce((sum, log) => sum + log.minutes, 0);
    // 3 hours 42 minutes = 180 + 42 = 222 minutes
    expect(totalMinutes).toBe(222);
  });

  it('contains expected categories across items', () => {
    const categories = new Set(INITIAL_ITEMS.map((item) => item.category));
    expect(categories.has('Technique')).toBe(true);
    expect(categories.has('Chords')).toBe(true);
    expect(categories.has('Rhythm')).toBe(true);
    expect(categories.has('Songs')).toBe(true);
  });
});
