// Pure helpers for the recording waveform. Kept side-effect free so the
// rolling-buffer + envelope maths can be unit-tested without a DOM render.

export const BAR_COUNT = 48;

// Stable, positional keys for the bars. Each slot is a fixed position in the
// scrolling buffer, so the slot id — not the index — is the stable identity.
export const BAR_IDS = Array.from({ length: BAR_COUNT }, (_, i) => `bar-${i}`);

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

// Roll the buffer one step to the left and append the newest sample (0..1),
// keeping the buffer capped at `max` so the waveform scrolls right-to-left.
export const pushSample = (levels: number[], sample: number, max = BAR_COUNT): number[] => {
  const next = [...levels, clamp01(sample)];
  return next.length > max ? next.slice(next.length - max) : next;
};

// Center-weighted window so the middle bars read taller than the edges,
// matching the spindle shape of the reference widget. Returns 0.35..1.
export const envelope = (index: number, count: number): number => {
  if (count <= 1) return 1;
  const t = index / (count - 1); // 0..1 across the row
  return 0.35 + 0.65 * Math.sin(Math.PI * t);
};
