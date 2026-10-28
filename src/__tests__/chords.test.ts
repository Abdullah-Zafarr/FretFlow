import { describe, it, expect } from 'vitest';
import { CHORD_DICTIONARY } from '../data/chordData';

describe('Chord Dictionary & Definitions', () => {
  it('should include all primary open and barre chords', () => {
    const requiredChords = ['C', 'D', 'Em', 'G', 'F', 'Am', 'A', 'E', 'Dm', 'Bm'];
    requiredChords.forEach((chord) => {
      expect(CHORD_DICTIONARY[chord]).toBeDefined();
      expect(CHORD_DICTIONARY[chord].frets).toHaveLength(6);
    });
  });

  it('correctly defines Barre F chord', () => {
    const fChord = CHORD_DICTIONARY['F'];
    expect(fChord).toBeDefined();
    expect(fChord.barre).toBeDefined();
    expect(fChord.barre?.fret).toBe(1);
    expect(fChord.frets).toEqual([1, 3, 3, 2, 1, 1]);
  });

  it('correctly defines Em open chord with 6 ringing strings', () => {
    const em = CHORD_DICTIONARY['Em'];
    expect(em).toBeDefined();
    expect(em.frets).toEqual([0, 2, 2, 0, 0, 0]);
  });
});
