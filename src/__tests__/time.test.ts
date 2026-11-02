import { describe, it, expect } from 'vitest';
import { formatTime, parseTimeToSeconds } from '../utils/time';

describe('formatTime', () => {
  it('formats MM:SS correctly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(45)).toBe('00:45');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(180)).toBe('03:00');
    expect(formatTime(300)).toBe('05:00');
    expect(formatTime(330)).toBe('05:30');
  });

  it('formats HH:MM:SS when over 1 hour', () => {
    expect(formatTime(3600)).toBe('01:00:00');
    expect(formatTime(3665)).toBe('01:01:05');
  });
});

describe('parseTimeToSeconds', () => {
  it('parses MM:SS and M:SS strings', () => {
    expect(parseTimeToSeconds('03:00')).toBe(180);
    expect(parseTimeToSeconds('3:00')).toBe(180);
    expect(parseTimeToSeconds('05:30')).toBe(330);
    expect(parseTimeToSeconds('0:45')).toBe(45);
    expect(parseTimeToSeconds('00:00')).toBe(0);
  });

  it('parses :SS strings', () => {
    expect(parseTimeToSeconds(':45')).toBe(45);
    expect(parseTimeToSeconds(':30')).toBe(30);
    expect(parseTimeToSeconds(':05')).toBe(5);
  });

  it('parses HH:MM:SS strings', () => {
    expect(parseTimeToSeconds('1:00:00')).toBe(3600);
    expect(parseTimeToSeconds('01:15:30')).toBe(4530);
  });

  it('parses units strings (m, s, h)', () => {
    expect(parseTimeToSeconds('5m')).toBe(300);
    expect(parseTimeToSeconds('5 min')).toBe(300);
    expect(parseTimeToSeconds('5 mins')).toBe(300);
    expect(parseTimeToSeconds('10 minutes')).toBe(600);
    expect(parseTimeToSeconds('45s')).toBe(45);
    expect(parseTimeToSeconds('45 sec')).toBe(45);
    expect(parseTimeToSeconds('2m 30s')).toBe(150);
    expect(parseTimeToSeconds('2m30s')).toBe(150);
    expect(parseTimeToSeconds('1h 15m')).toBe(4500);
  });

  it('parses decimal minutes', () => {
    expect(parseTimeToSeconds('3.5')).toBe(210);
    expect(parseTimeToSeconds('3,5')).toBe(210);
    expect(parseTimeToSeconds('0.5')).toBe(30);
  });

  it('parses plain numbers intuitively', () => {
    expect(parseTimeToSeconds('5')).toBe(300); // 5 minutes
    expect(parseTimeToSeconds('10')).toBe(600); // 10 minutes
    expect(parseTimeToSeconds('1')).toBe(60); // 1 minute
    expect(parseTimeToSeconds('15')).toBe(900); // 15 minutes
    expect(parseTimeToSeconds('90')).toBe(90); // 90 seconds
    expect(parseTimeToSeconds('120')).toBe(120); // 120 seconds
    expect(parseTimeToSeconds('0')).toBe(0);
  });

  it('handles invalid input gracefully', () => {
    expect(parseTimeToSeconds('')).toBeNull();
    expect(parseTimeToSeconds('   ')).toBeNull();
    expect(parseTimeToSeconds('abc')).toBeNull();
    expect(parseTimeToSeconds('invalid:time')).toBeNull();
  });
});
