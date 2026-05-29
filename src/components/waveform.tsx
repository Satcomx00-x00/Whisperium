import { BAR_IDS, envelope } from '@/lib/waveform';

type WaveformProps = {
  levels: number[];
  className?: string;
};

const MAX_BAR_PX = 34;
const MIN_BAR_PX = 2;

export function Waveform({ levels, className }: WaveformProps) {
  return (
    <div
      className={`flex h-10 items-center justify-center gap-[2px] ${className ?? ''}`.trim()}
      aria-hidden="true"
    >
      {BAR_IDS.map((id, i) => {
        const level = levels[i] ?? 0;
        const height = Math.max(MIN_BAR_PX, level * envelope(i, BAR_IDS.length) * MAX_BAR_PX);
        return (
          <span
            key={id}
            className="w-[2px] rounded-full bg-white/70 transition-[height] duration-75"
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
}
