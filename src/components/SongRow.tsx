import { useRef } from 'react';
import { Music, Pause, Play, Trash2, Upload } from 'lucide-react';
import type { PlaybackStatus, Song } from '../types';
import { formatTime } from '../lib/format';

interface SongRowProps {
  song: Song;
  index: number;
  isActive: boolean;
  status: PlaybackStatus;
  onSelect: () => void;
  onAttachAudio: (file: File) => void;
  onRemove: () => void;
}

export function SongRow({ song, index, isActive, status, onSelect, onAttachAudio, onRemove }: SongRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={onSelect}
      className={`group grid cursor-pointer grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-4 rounded-md px-3 py-2 text-sm transition ${
        isActive ? 'bg-app-surface-3' : 'hover:bg-app-surface-2'
      }`}
    >
      <div className="flex w-8 justify-center text-app-subtext">
        {isActive && status === 'playing' ? (
          <Pause size={16} className="text-brand" />
        ) : isActive ? (
          <Play size={16} className="text-brand" />
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play size={16} className="hidden group-hover:block" />
          </>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded"
          style={{ background: `linear-gradient(135deg, ${song.gradient[0]}, ${song.gradient[1]})` }}
        >
          <Music size={16} className="text-white/80" />
        </div>
        <div className="min-w-0">
          <p className={`truncate font-medium ${isActive ? 'text-brand' : 'text-app-text'}`}>{song.title}</p>
          <p className="truncate text-xs text-app-subtext">{song.artist}</p>
        </div>
      </div>

      {!song.youtubeId && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            title="Pasang file audio lokal untuk lagu ini"
            className="hidden items-center gap-1 rounded-full border border-app-border px-2 py-1 text-xs text-app-subtext hover:text-app-text group-hover:flex"
          >
            <Upload size={12} />
            {song.audioUrl ? 'Ganti audio' : 'Pasang audio'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAttachAudio(file);
            }}
          />
        </>
      )}

      <span className="text-xs text-app-subtext">{formatTime(song.duration)}</span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Hapus lagu ini dari playlist"
        className="flex items-center justify-center rounded-full p-1.5 text-app-subtext hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
