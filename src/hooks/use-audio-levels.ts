import { useEffect, useState } from 'react';

import { BAR_COUNT, pushSample } from '@/lib/waveform';

const flat = (): number[] => Array.from({ length: BAR_COUNT }, () => 0);

// Drives the waveform while a session is `active`. Until the native cpal
// analyser is wired through to the frontend this synthesises a speech-like
// amplitude per animation frame; swap the body of `tick` for real RMS data
// once the audio bridge lands — the consumer contract stays the same.
export const useAudioLevels = (active: boolean): number[] => {
  const [levels, setLevels] = useState<number[]>(flat);

  useEffect(() => {
    if (!active) {
      setLevels(flat());
      return;
    }

    let raf = 0;
    let phase = 0;
    const tick = () => {
      phase += 0.18;
      const amp = 0.4 + Math.sin(phase) * 0.3 + Math.random() * 0.3;
      setLevels((prev) => pushSample(prev, amp));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return levels;
};
