import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import type { PlaybackStatus, Song } from '../types';
import { SongRow } from './SongRow';

interface PlaylistViewProps {
  playlist: Song[];
  currentIndex: number;
  status: PlaybackStatus;
  onSelectSong: (index: number) => void;
  onAttachAudio: (index: number, file: File) => void;
  onAddSongs: (files: FileList | File[]) => void;
  onRemoveSong: (index: number) => void;
  onAddYoutube: (url: string) => Promise<void>;
}

export function PlaylistView({
  playlist,
  currentIndex,
  status,
  onSelectSong,
  onAttachAudio,
  onAddSongs,
  onRemoveSong,
  onAddYoutube,
}: PlaylistViewProps) {
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytLoading, setYtLoading] = useState(false);

  async function handleAddYoutube() {
    if (!ytUrl.trim()) return;
    setYtLoading(true);
    setYtError(null);
    try {
      await onAddYoutube(ytUrl.trim());
      setYtUrl('');
    } catch (err) {
      setYtError(err instanceof Error ? err.message : 'Gagal menambahkan video');
    } finally {
      setYtLoading(false);
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-end gap-6 rounded-lg bg-gradient-to-b from-app-surface-3 to-app-bg p-6">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-app-surface-3 text-6xl shadow-lg">
          🎧
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-app-subtext">Playlist</p>
          <h1 className="mb-2 text-4xl font-extrabold">Sensor Beats</h1>
          <p className="text-sm text-app-subtext">
            Diputar di web, statusnya dikirim real-time ke layar OLED ESP32 lewat MQTT.
          </p>
        </div>
      </div>

      <div
        onClick={() => addFileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.length) onAddSongs(e.dataTransfer.files);
        }}
        className={`mb-6 flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed p-5 text-sm transition ${
          isDragOver
            ? 'border-brand bg-brand/10 text-brand'
            : 'border-app-border text-app-subtext hover:border-app-subtext hover:text-app-text'
        }`}
      >
        <UploadCloud size={20} />
        <div>
          <p className="font-medium">Tambah lagu dari penyimpanan lokal</p>
          <p className="text-xs opacity-80">Klik atau seret file audio (mp3, wav, m4a, dst.) ke sini</p>
        </div>
        <input
          ref={addFileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAddSongs(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <div className="mb-2 flex items-center gap-2 rounded-lg border border-app-border p-3">
        <input
          type="text"
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          placeholder="Tempel link YouTube (mis. https://youtube.com/watch?v=...)"
          className="min-w-0 flex-1 rounded-md bg-app-surface-2 px-3 py-2 text-sm text-app-text outline-none placeholder:text-app-subtext"
        />
        <button
          onClick={handleAddYoutube}
          disabled={ytLoading}
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {ytLoading ? 'Menambahkan...' : 'Tambah dari YouTube'}
        </button>
      </div>
      {ytError && <p className="mb-4 text-xs text-red-400">{ytError}</p>}

      <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-4 border-b border-app-border px-3 pb-2 text-xs uppercase text-app-subtext">
        <span>#</span>
        <span>Judul</span>
        <span />
        <span>Durasi</span>
        <span />
      </div>

      <div className="mt-1 flex flex-col">
        {playlist.map((song, index) => (
          <SongRow
            key={song.id}
            song={song}
            index={index}
            isActive={index === currentIndex}
            status={status}
            onSelect={() => onSelectSong(index)}
            onAttachAudio={(file) => onAttachAudio(index, file)}
            onRemove={() => onRemoveSong(index)}
          />
        ))}
      </div>
    </div>
  );
}
