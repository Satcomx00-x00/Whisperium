import { describe, expect, it } from 'vitest';

import { BAR_COUNT, BAR_IDS, envelope, pushSample } from '@/lib/waveform';

describe('pushSample', () => {
  it('appends the newest sample at the end when below capacity', () => {
    expect(pushSample([0.1, 0.2], 0.3, 4)).toEqual([0.1, 0.2, 0.3]);
  });

  it('drops the oldest sample when at capacity', () => {
    expect(pushSample([0.1, 0.2, 0.3], 0.4, 3)).toEqual([0.2, 0.3, 0.4]);
  });

  it('clamps samples into the 0..1 range', () => {
    expect(pushSample([], 1.7, 2)).toEqual([1]);
    expect(pushSample([], -0.5, 2)).toEqual([0]);
  });

  it('keeps the buffer length capped at BAR_COUNT by default', () => {
    let buffer = Array.from({ length: BAR_COUNT }, () => 0);
    buffer = pushSample(buffer, 0.5);
    expect(buffer).toHaveLength(BAR_COUNT);
  });
});

describe('envelope', () => {
  it('peaks at the center and tapers toward the edges', () => {
    const mid = envelope(Math.floor((BAR_COUNT - 1) / 2), BAR_COUNT);
    expect(mid).toBeGreaterThan(envelope(0, BAR_COUNT));
    expect(mid).toBeGreaterThan(envelope(BAR_COUNT - 1, BAR_COUNT));
  });

  it('returns 1 for a single-bar row', () => {
    expect(envelope(0, 1)).toBe(1);
  });
});

describe('BAR_IDS', () => {
  it('provides one stable id per bar', () => {
    expect(BAR_IDS).toHaveLength(BAR_COUNT);
    expect(new Set(BAR_IDS).size).toBe(BAR_COUNT);
  });
});
