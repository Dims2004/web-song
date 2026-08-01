import type { Song } from '../types';

/**
 * Demo playlist. These tracks ship without audio files (keeps the zip small
 * and avoids licensing issues) — playback position is simulated so the MQTT
 * wiring and OLED preview can be tested end-to-end before real audio or the
 * ESP32 hardware exists. Use "Attach audio" on a track to play real audio
 * from your own files instead.
 */
export const demoPlaylist: Song[] = [
  {
    id: 'song-1',
    title: 'Neon Nights',
    artist: 'Synthwave Collective',
    album: 'Midnight Drive',
    duration: 214,
    gradient: ['#1db954', '#0a4a2a'],
  },
  {
    id: 'song-2',
    title: 'Morning Run',
    artist: 'Pulse & Beat',
    album: 'Cardio Sessions',
    duration: 187,
    gradient: ['#e91429', '#4a0a10'],
  },
  {
    id: 'song-3',
    title: 'Quiet Focus',
    artist: 'Deep Work Radio',
    album: 'Study Sessions',
    duration: 260,
    gradient: ['#5038a0', '#1a1440'],
  },
  {
    id: 'song-4',
    title: 'Heartbeat Loop',
    artist: 'IoT Sounds',
    album: 'Sensor Suite',
    duration: 198,
    gradient: ['#e8a33d', '#4a2e0a'],
  },
  {
    id: 'song-5',
    title: 'Cyber Sprint',
    artist: 'Voltage',
    album: 'Overdrive',
    duration: 231,
    gradient: ['#2d9cdb', '#0a2540'],
  },
  {
    id: 'song-6',
    title: 'Slow Wave',
    artist: 'Ambient Lab',
    album: 'Resting State',
    duration: 305,
    gradient: ['#8e44ad', '#2a0a40'],
  },
];
