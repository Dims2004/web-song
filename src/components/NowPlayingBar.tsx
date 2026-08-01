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
    return <div className="h-24 border-t border-app-border bg-app-surface" />;
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex h-24 items-center justify-between gap-6 border-t border-app-border bg-app-surface px-4">
      <div className="flex w-64 min-w-0 items-center gap-3">
        <div
          className="h-14 w-14 shrink-0 rounded"
          style={{ background: `linear-gradient(135deg, ${song.gradient[0]}, ${song.gradient[1]})` }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{song.title}</p>
          <p className="truncate text-xs text-app-subtext">{song.artist}</p>
        </div>
      </div>

      <div className="flex max-w-xl flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button onClick={onPrev} className="text-app-subtext hover:text-app-text" aria-label="Sebelumnya">
            <SkipBack size={20} />
          </button>
          <button
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
            aria-label={status === 'playing' ? 'Pause' : 'Play'}
          >
            {status === 'playing' ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-app-subtext hover:text-app-text" aria-label="Berikutnya">
            <SkipForward size={20} />
          </button>
        </div>
        <div className="flex w-full items-center gap-2 text-xs text-app-subtext">
          <span className="w-9 text-right">{formatTime(position)}</span>
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
          <span className="w-9">{formatTime(song.duration)}</span>
        </div>
      </div>

      <div className="flex w-64 items-center justify-end gap-4">
        <OledPreview song={song} status={status} position={position} />
        <div className="hidden items-center gap-2 lg:flex">
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
