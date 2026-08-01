import type { Song } from '../types';

// ============================================================================
// IndexedDB — menyimpan file audio asli (Blob) dari lagu lokal, supaya lagu
// lokal tetap bisa diputar setelah halaman di-refresh. localStorage tidak
// dipakai untuk ini karena batasnya cuma ~5MB dan tidak cocok untuk file
// audio.
// ============================================================================
const DB_NAME = 'websong-db';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAudioBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result ? (req.result.blob as Blob) : null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudioBlob(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ============================================================================
// localStorage — menyimpan metadata playlist (judul, artis, durasi, urutan,
// lagu mana yang dihapus, dsb). audioUrl SENGAJA tidak disimpan di sini
// karena berupa blob: URL sementara yang mati tiap refresh — diganti lagi
// secara otomatis dari IndexedDB (untuk lagu lokal) saat playlist dimuat.
// ============================================================================
const PLAYLIST_KEY = 'websong-playlist-meta';

export type PersistedSong = Omit<Song, 'audioUrl'> & { hasStoredAudio?: boolean };

export function savePlaylistMeta(songs: Song[]) {
  const persisted: PersistedSong[] = songs.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album,
    duration: s.duration,
    gradient: s.gradient,
    isLocal: s.isLocal,
    youtubeId: s.youtubeId,
    hasStoredAudio: Boolean(s.audioUrl),
  }));
  try {
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(persisted));
  } catch {
    // localStorage penuh/tidak tersedia — abaikan, playlist tetap jalan di sesi ini
  }
}

export function loadPlaylistMeta(): PersistedSong[] | null {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSong[];
  } catch {
    return null;
  }
}
