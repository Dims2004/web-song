import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { demoPlaylist } from '../data/demoPlaylist';
import type { PlaybackStatus, PlayerDownlinkMessage, Song } from '../types';
import { extractYoutubeId, fetchYoutubeMeta } from '../lib/youtube';
import {
  saveAudioBlob,
  getAudioBlob,
  deleteAudioBlob,
  savePlaylistMeta,
  loadPlaylistMeta,
} from '../lib/songStorage';

interface UsePlayerOptions {
  onStateChange: (message: PlayerDownlinkMessage) => void;
}

// Palet gradient acak untuk cover lagu yang ditambahkan dari storage lokal
// (lagu lokal tidak punya album art, jadi kita kasih warna acak yang menarik).
const LOCAL_SONG_GRADIENTS: [string, string][] = [
  ['#1db954', '#0a4a2a'],
  ['#e91429', '#4a0a10'],
  ['#5038a0', '#1a1440'],
  ['#e8a33d', '#4a2e0a'],
  ['#2d9cdb', '#0a2540'],
  ['#8e44ad', '#2a0a40'],
  ['#16a085', '#0a3d33'],
  ['#d35400', '#4a1f0a'],
];

function cleanTitleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  return withoutExt.replace(/[_-]+/g, ' ').trim() || 'Lagu Tanpa Judul';
}

export function usePlayer({ onStateChange }: UsePlayerOptions) {
  // Playlist awal selalu demoPlaylist dulu (render pertama, sinkron).
  // Playlist tersimpan (kalau ada) baru dimuat di useEffect di bawah —
  // supaya tidak nulis ulang localStorage dengan demoPlaylist sebelum
  // sempat baca data yang tersimpan.
  const [playlist, setPlaylist] = useState<Song[]>(demoPlaylist);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<PlaybackStatus>('paused');
  const [position, setPosition] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const isHydratedRef = useRef(false); // true setelah playlist tersimpan selesai dimuat

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  audioRef.current.volume = volume;
  const simulateIntervalRef = useRef<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any>(null);
  const ytApiReadyRef = useRef(false);
  const ytProgressIntervalRef = useRef<number | null>(null);

  // Refs supaya event handler YouTube (dibuat sekali) selalu baca state terbaru
  const playlistRef = useRef(playlist);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const currentSong = playlist[currentIndex];

  const emit = useCallback(
    (nextStatus: PlaybackStatus, nextPosition: number, song: Song) => {
      onStateChange({
        status: nextStatus,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        position: Math.floor(nextPosition),
        timestamp: Date.now(),
      });
    },
    [onStateChange],
  );

  const stopSimulation = () => {
    if (simulateIntervalRef.current) {
      window.clearInterval(simulateIntervalRef.current);
      simulateIntervalRef.current = null;
    }
  };

  function stopYoutubeProgressReporting() {
    if (ytProgressIntervalRef.current) {
      window.clearInterval(ytProgressIntervalRef.current);
      ytProgressIntervalRef.current = null;
    }
  }

  function startYoutubeProgressReporting(song: Song) {
    stopYoutubeProgressReporting();
    ytProgressIntervalRef.current = window.setInterval(() => {
      const player = ytPlayerRef.current;
      if (!player) return;
      const pos = player.getCurrentTime();
      setPosition(pos);
      const dur = Math.round(player.getDuration());
      if (dur > 0 && dur !== song.duration) {
        setPlaylist((prev) => prev.map((s) => (s.id === song.id ? { ...s, duration: dur } : s)));
        song = { ...song, duration: dur };
      }
      emit('playing', pos, song);
    }, 1000);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleYoutubeStateChange(event: any) {
    const YT = window.YT;
    const player = ytPlayerRef.current;
    if (!player) return;
    const song = playlistRef.current[currentIndexRef.current];
    if (!song || !song.youtubeId) return;

    if (event.data === YT.PlayerState.PLAYING) {
      setStatus('playing');
      startYoutubeProgressReporting(song);
    } else if (event.data === YT.PlayerState.PAUSED) {
      setStatus('paused');
      stopYoutubeProgressReporting();
      emit('paused', player.getCurrentTime(), song);
    } else if (event.data === YT.PlayerState.ENDED) {
      stopYoutubeProgressReporting();
      goToIndex(currentIndexRef.current + 1, true);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function loadYoutubeIframeApi(): Promise<any> {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
    });
  }

  const goToIndex = useCallback(
    (index: number, autoplay: boolean) => {
      const boundedIndex = (index + playlist.length) % playlist.length;
      const song = playlist[boundedIndex];

      audioRef.current.pause();
      stopSimulation();
      stopYoutubeProgressReporting();

      setCurrentIndex(boundedIndex);
      setPosition(0);
      setStatus(autoplay ? 'playing' : 'paused');

      if (song.youtubeId) {
        audioRef.current.src = '';
        const player = ytPlayerRef.current;
        if (player && ytApiReadyRef.current) {
          if (autoplay) player.loadVideoById(song.youtubeId);
          else player.cueVideoById(song.youtubeId);
        }
        emit(autoplay ? 'playing' : 'paused', 0, song);
        return;
      }

      audioRef.current.src = song.audioUrl ?? '';
      emit(autoplay ? 'playing' : 'paused', 0, song);
if (autoplay) {
  if (song.audioUrl) {
    audioRef.current.play().catch((err) => {
      console.error('Gagal memutar audio lokal:', err);
    });
  } else {
    startSimulation(song);
  }
}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playlist, emit],
  );

  function startSimulation(song: Song) {
    stopSimulation();
    simulateIntervalRef.current = window.setInterval(() => {
      setPosition((prev) => {
        const next = prev + 1;
        if (next >= song.duration) {
          goToIndex(currentIndex + 1, true);
          return 0;
        }
        emit('playing', next, song);
        return next;
      });
    }, 1000);
  }

  // ----------------------------------------------------------------------
  // Muat playlist tersimpan (localStorage + IndexedDB) sekali saat mount.
  // ----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const savedMeta = loadPlaylistMeta();
      if (!savedMeta || savedMeta.length === 0) {
        isHydratedRef.current = true;
        return; // tidak ada data tersimpan -> tetap pakai demoPlaylist
      }

      // Rangkai ulang lagu dari metadata tersimpan. Untuk lagu yang punya
      // audio tersimpan (hasStoredAudio), ambil file aslinya dari
      // IndexedDB dan buat audioUrl baru (blob: URL yang berlaku di sesi
      // ini).
      const restored: Song[] = await Promise.all(
        savedMeta.map(async (meta) => {
          const song: Song = {
            id: meta.id,
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            duration: meta.duration,
            gradient: meta.gradient,
            isLocal: meta.isLocal,
            youtubeId: meta.youtubeId,
          };
          if (meta.hasStoredAudio) {
            try {
              const blob = await getAudioBlob(meta.id);
              if (blob) song.audioUrl = URL.createObjectURL(blob);
            } catch {
              // gagal ambil file audio tersimpan -> lagu tetap ada, tanpa audio
            }
          }
          return song;
        }),
      );

      if (!cancelled && restored.length > 0) {
        setPlaylist(restored);
      }
      isHydratedRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------
  // Simpan metadata playlist setiap kali berubah (tambah/hapus/urutan).
  // Baru aktif setelah proses hydrate awal selesai, supaya tidak menimpa
  // data tersimpan dengan demoPlaylist sebelum sempat dibaca.
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!isHydratedRef.current) return;
    savePlaylistMeta(playlist);
  }, [playlist]);

  // Inisialisasi player YouTube tersembunyi sekali saat komponen pertama mount.
  // Elemen host dibuat manual lewat DOM API (BUKAN lewat JSX React) dan
  // ditempel langsung ke <body>, supaya YouTube IFrame API bebas mengganti
  // <div> ini jadi <iframe> tanpa bentrok dengan reconciliation React di
  // bagian lain aplikasi (mis. saat modal Pengaturan MQTT dibuka/ditutup).
  useEffect(() => {
    let cancelled = false;

    const hostEl = document.createElement('div');
    hostEl.id = 'yt-player-host';
    hostEl.style.position = 'fixed';
    hostEl.style.bottom = '0';
    hostEl.style.right = '0';
    hostEl.style.width = '1px';
    hostEl.style.height = '1px';
    hostEl.style.opacity = '0';
    hostEl.style.pointerEvents = 'none';
    document.body.appendChild(hostEl);

    loadYoutubeIframeApi().then((YT) => {
      if (cancelled) return;
      ytPlayerRef.current = new YT.Player(hostEl, {
        height: '1',
        width: '1',
        playerVars: { playsinline: 1 },
        events: {
          onReady: () => {
            ytApiReadyRef.current = true;
          },
          onStateChange: handleYoutubeStateChange,
        },
      });
    });

    return () => {
      cancelled = true;
      ytPlayerRef.current?.destroy?.();
      hostEl.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(() => {
    if (!currentSong) return;
    setStatus('playing');
if (currentSong.youtubeId) {
  ytPlayerRef.current?.playVideo();
} else if (currentSong.audioUrl) {
  audioRef.current.play().catch((err) => {
    console.error('Gagal memutar audio lokal:', err);
  });
} else {
  startSimulation(currentSong);
}
    emit('playing', position, currentSong);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong, position, emit]);

  const pause = useCallback(() => {
    if (!currentSong) return;
    setStatus('paused');
    if (currentSong.youtubeId) {
      ytPlayerRef.current?.pauseVideo();
    } else {
      audioRef.current.pause();
      stopSimulation();
    }
    emit('paused', position, currentSong);
  }, [currentSong, position, emit]);

  const toggle = useCallback(() => {
    if (status === 'playing') pause();
    else play();
  }, [status, play, pause]);

  const next = useCallback(() => goToIndex(currentIndex + 1, status === 'playing'), [goToIndex, currentIndex, status]);
  const prev = useCallback(() => goToIndex(currentIndex - 1, status === 'playing'), [goToIndex, currentIndex, status]);

  const selectSong = useCallback((index: number) => goToIndex(index, true), [goToIndex]);

  const seek = useCallback(
    (nextPosition: number) => {
      if (!currentSong) return;
      const clamped = Math.min(Math.max(nextPosition, 0), currentSong.duration);
      setPosition(clamped);
      if (currentSong.youtubeId) {
        ytPlayerRef.current?.seekTo(clamped, true);
      } else if (currentSong.audioUrl) {
        audioRef.current.currentTime = clamped;
      }
      emit(status, clamped, currentSong);
    },
    [currentSong, status, emit],
  );

  const attachAudio = useCallback(
    (index: number, file: File) => {
      const url = URL.createObjectURL(file);
      setPlaylist((prev) => {
        const song = prev[index];
        if (song) void saveAudioBlob(song.id, file);
        return prev.map((s, i) => (i === index ? { ...s, audioUrl: url } : s));
      });
    },
    [],
  );

const AUDIO_EXTENSIONS = /\.(mp3|wav|m4a|aac|ogg|flac|opus|wma)$/i;

const addSongsFromFiles = useCallback((files: FileList | File[]) => {
  const allFiles = Array.from(files);
  const fileArray = allFiles.filter(
    (f) => f.type.startsWith('audio/') || (f.type === '' && AUDIO_EXTENSIONS.test(f.name)),
  );

  if (fileArray.length < allFiles.length) {
    console.warn(
      'Beberapa file dilewati karena tidak terdeteksi sebagai audio:',
      allFiles.filter((f) => !fileArray.includes(f)).map((f) => f.name),
    );
  }
  if (fileArray.length === 0) return;

    const newSongs: Song[] = fileArray.map((file, i) => {
      const url = URL.createObjectURL(file);
      return {
        id: `local-${Date.now()}-${i}-${Math.random().toString(16).slice(2, 8)}`,
        title: cleanTitleFromFilename(file.name),
        artist: 'Lagu Lokal',
        duration: 0, // diisi otomatis setelah metadata audio terbaca
        gradient: LOCAL_SONG_GRADIENTS[Math.floor(Math.random() * LOCAL_SONG_GRADIENTS.length)],
        audioUrl: url,
        isLocal: true,
      };
    });

    setPlaylist((prev) => [...prev, ...newSongs]);

    // Simpan file audio aslinya ke IndexedDB supaya tetap ada setelah refresh.
    fileArray.forEach((file, i) => {
      void saveAudioBlob(newSongs[i].id, file);
    });

    // Baca durasi asli tiap file secara asinkron lalu update entri lagunya.
    newSongs.forEach((song) => {
      const probe = new Audio(song.audioUrl);
      const onLoaded = () => {
        const dur = Number.isFinite(probe.duration) ? Math.round(probe.duration) : 0;
        setPlaylist((prev) => prev.map((s) => (s.id === song.id ? { ...s, duration: dur } : s)));
      };
      probe.addEventListener('loadedmetadata', onLoaded, { once: true });
    });
  }, []);

  const addSongFromYoutube = useCallback(async (url: string) => {
    const videoId = extractYoutubeId(url);
    if (!videoId) throw new Error('Link YouTube tidak valid');

    const meta = await fetchYoutubeMeta(url);
    const newSong: Song = {
      id: `yt-${videoId}-${Date.now()}`,
      title: meta?.title ?? `Video YouTube (${videoId})`,
      artist: meta?.author ?? 'YouTube',
      duration: 0, // terisi otomatis begitu video mulai diputar
      gradient: LOCAL_SONG_GRADIENTS[Math.floor(Math.random() * LOCAL_SONG_GRADIENTS.length)],
      youtubeId: videoId,
      isLocal: true,
    };
    setPlaylist((prev) => [...prev, newSong]);
  }, []);

  const removeSong = useCallback(
    (index: number) => {
      setPlaylist((prev) => {
        const target = prev[index];
        if (!target) return prev;
        if (target.audioUrl && target.isLocal) URL.revokeObjectURL(target.audioUrl);
        void deleteAudioBlob(target.id);
        const next = prev.filter((_, i) => i !== index);
        return next;
      });

      if (index === currentIndex) {
        audioRef.current.pause();
        stopSimulation();
        stopYoutubeProgressReporting();
        setStatus('paused');
        setPosition(0);
      } else if (index < currentIndex) {
        setCurrentIndex((i) => Math.max(0, i - 1));
      }
    },
    [currentIndex],
  );

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(Math.max(value, 0), 1);
    audioRef.current.volume = clamped;
    ytPlayerRef.current?.setVolume?.(Math.round(clamped * 100));
    setVolumeState(clamped);
  }, []);

  // Real <audio> element wiring (used once a track has an attached file).
  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setPosition(audio.currentTime);
    const onEnded = () => goToIndex(currentIndex + 1, true);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, goToIndex]);

  useEffect(() => stopSimulation, []);
  useEffect(() => stopYoutubeProgressReporting, []);

  return useMemo(
    () => ({
      playlist,
      currentIndex,
      currentSong,
      status,
      position,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      selectSong,
      attachAudio,
      addSongsFromFiles,
      addSongFromYoutube,
      removeSong,
      volume,
      setVolume,
    }),
    [
      playlist,
      currentIndex,
      currentSong,
      status,
      position,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      selectSong,
      attachAudio,
      addSongsFromFiles,
      addSongFromYoutube,
      removeSong,
      volume,
      setVolume,
    ],
  );
}
