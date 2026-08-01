import { Pause, Play, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react';
import type { PlaybackStatus, Song } from '../types';
import { formatTime } from '../lib/format';
import { OledPreview } from './OledPreview';

interface NowPlayingBarProps {
  song: Song | undefined;
  status: PlaybackStatus;
  position: number;
  volume: number;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (position: number) => void;
  onVolumeChange: (volume: number) => void;
}

export function NowPlayingBar({
  song,
  status,
  position,
  volume,
  onToggle,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
}: NowPlayingBarProps) {
  if (!song) {
    return <div className="h-20 border-t border-app-border bg-app-surface md:h-24" />;
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex h-20 items-center justify-between gap-3 border-t border-app-border bg-app-surface px-3 md:h-24 md:gap-6 md:px-4">
      <div className="flex w-28 min-w-0 items-center gap-2 md:w-64 md:gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded md:h-14 md:w-14"
          style={{ background: `linear-gradient(135deg, ${song.gradient[0]}, ${song.gradient[1]})` }}
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium md:text-sm">{song.title}</p>
          <p className="hidden truncate text-xs text-app-subtext md:block">{song.artist}</p>
        </div>
      </div>

      <div className="flex max-w-xl flex-1 flex-col items-center gap-1 md:gap-2">
        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={onPrev} className="hidden text-app-subtext hover:text-app-text sm:block" aria-label="Sebelumnya">
            <SkipBack size={20} />
          </button>
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 md:h-9 md:w-9"
            aria-label={status === 'playing' ? 'Pause' : 'Play'}
          >
            {status === 'playing' ? <Pause size={16} className="md:hidden" /> : <Play size={16} className="ml-0.5 md:hidden" />}
            {status === 'playing' ? <Pause size={18} className="hidden md:block" /> : <Play size={18} className="ml-0.5 hidden md:block" />}
          </button>
          <button onClick={onNext} className="hidden text-app-subtext hover:text-app-text sm:block" aria-label="Berikutnya">
            <SkipForward size={20} />
          </button>
        </div>
        <div className="flex w-full items-center gap-2 text-xs text-app-subtext">
          <span className="hidden w-9 text-right sm:block">{formatTime(position)}</span>
          <input
            type="range"
            min={0}
            max={song.duration}
            step={1}
            value={position}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full accent-brand"
            style={{
              background: `linear-gradient(to right, #fff ${(position / song.duration) * 100}%, #4d4d4d 0)`,
              height: 4,
              borderRadius: 999,
            }}
          />
          <span className="hidden w-9 sm:block">{formatTime(song.duration)}</span>
        </div>
      </div>

      <div className="hidden w-64 items-center justify-end gap-4 lg:flex">
        <OledPreview song={song} status={status} position={position} />
        <div className="flex items-center gap-2">
          <VolumeIcon size={18} className="text-app-subtext" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24 accent-brand"
            style={{
              background: `linear-gradient(to right, #fff ${volume * 100}%, #4d4d4d 0)`,
              height: 4,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </div>
  );
}
