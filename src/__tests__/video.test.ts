import { describe, it, expect } from 'vitest';
import { getEmbedUrl } from '../components/VideoAssistant';

describe('getEmbedUrl', () => {
  it('extracts standard youtube watch URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(getEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1');
  });

  it('extracts youtu.be short URL', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(getEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1');
  });

  it('extracts youtube embed URL', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(getEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1');
  });

  it('extracts youtube watch URL with additional query parameters', () => {
    const url = 'https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ';
    expect(getEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1');
  });

  it('returns generic http URL as fallback for non-youtube video links', () => {
    const url = 'https://example.com/guitar-lesson.mp4';
    expect(getEmbedUrl(url)).toBe(url);
  });

  it('returns null for empty, undefined, or invalid URLs', () => {
    expect(getEmbedUrl('')).toBeNull();
    expect(getEmbedUrl(undefined)).toBeNull();
    expect(getEmbedUrl('not-a-url')).toBeNull();
  });
});
