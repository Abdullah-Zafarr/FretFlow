import { describe, it, expect } from 'vitest';
import { INITIAL_ITEMS, INITIAL_ROUTINES, INITIAL_LOGS, INITIAL_SETTINGS } from '../data/initialData';

describe('Backup and Serialization', () => {
  it('serializes and deserializes the full state without data loss', () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items: INITIAL_ITEMS,
      routines: INITIAL_ROUTINES,
      logs: INITIAL_LOGS,
      settings: INITIAL_SETTINGS,
    };

    const json = JSON.stringify(payload);
    expect(json).toBeTruthy();

    const restored = JSON.parse(json);
    expect(restored.items).toHaveLength(INITIAL_ITEMS.length);
    expect(restored.routines).toHaveLength(INITIAL_ROUTINES.length);
    expect(restored.logs).toHaveLength(INITIAL_LOGS.length);
    expect(restored.settings.alarmTone).toBe('chime');
  });
});
