import type { ChordDefinition } from '../types/practice';

export const CHORD_DICTIONARY: Record<string, ChordDefinition> = {
  'C': {
    name: 'C Major',
    frets: ['x', 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    baseFret: 1,
  },
  'D': {
    name: 'D Major',
    frets: ['x', 'x', 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    baseFret: 1,
  },
  'Em': {
    name: 'E Minor',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    baseFret: 1,
  },
  'G': {
    name: 'G Major',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    baseFret: 1,
  },
  'F': {
    name: 'F Major (Barre)',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 1, fromString: 0, toString: 5 },
    baseFret: 1,
  },
  'Am': {
    name: 'A Minor',
    frets: ['x', 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    baseFret: 1,
  },
  'A': {
    name: 'A Major',
    frets: ['x', 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    baseFret: 1,
  },
  'E': {
    name: 'E Major',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    baseFret: 1,
  },
  'Dm': {
    name: 'D Minor',
    frets: ['x', 'x', 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    baseFret: 1,
  },
  'Bm': {
    name: 'B Minor (Barre)',
    frets: ['x', 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 2, fromString: 1, toString: 5 },
    baseFret: 2,
  },
};
