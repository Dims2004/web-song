import type { PlaybackStatus, Song } from '../types';
import { formatTime } from '../lib/format';

interface OledPreviewProps {
  song: Song | undefined;
  status: PlaybackStatus;
  position: number;
}

/**
 * Simulates the ESP32's 0.96" SSD1306 OLED so the MQTT payload can be
 * validated visually before the firmware/hardware exists.
 */
export function OledPreview({ song, status, position }: OledPreviewProps) {
  if (!song) return null;
  const progress = song.duration > 0 ? Math.min(position / song.duration, 1) : 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-[10px] uppercase tracking-wide text-app-subtext">Preview Layar OLED ESP32</p>
      <div className="h-[92px] w-[184px] overflow-hidden rounded-md border-4 border-neutral-800 bg-black p-2 font-mono text-cyan-300 shadow-inner">
        <div className="flex h-full items-center gap-2">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/60 ${
              status === 'playing' ? 'animate-spin-slow' : ''
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-cyan-300" />
            <div className="absolute inset-1 rounded-full border border-cyan-300/30" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <div className="overflow-hidden whitespace-nowrap text-[11px] leading-tight">
              <span className={status === 'playing' ? 'inline-block animate-marquee pr-8' : 'inline-block truncate'}>
                {song.title.length > 14 ? `${song.title}   •   ${song.title}` : song.title}
              </span>
            </div>
            <p className="truncate text-[9px] leading-tight text-cyan-300/70">{song.artist}</p>
            <div className="h-1 w-full rounded-full bg-cyan-300/20">
              <div className="h-1 rounded-full bg-cyan-300" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="text-[9px] leading-tight text-cyan-300/70">
              {formatTime(position)} / {formatTime(song.duration)} · {status === 'playing' ? 'PLAY' : 'PAUSE'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
