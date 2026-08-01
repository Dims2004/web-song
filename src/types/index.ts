export type PlaybackStatus = 'playing' | 'paused' | 'stopped';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // seconds
  gradient: [string, string];
  audioUrl?: string; // set when the user attaches a local audio file
  isLocal?: boolean; // true when the song was added from local storage (not the demo playlist)
  youtubeId?: string; // set when the song streams from YouTube instead of local audio
}

/** Downlink payload: Web -> ESP32, published on the downlink topic. */
export interface PlayerDownlinkMessage {
  status: PlaybackStatus;
  title: string;
  artist: string;
  duration: number;
  position: number;
  timestamp: number;
}

export type ActivityType = 'diam' | 'jalan' | 'lari' | 'unknown' | string;

/** Uplink payload: ESP32 -> Web, received on the uplink topic. */
export interface SensorUplinkMessage {
  bpm: number;
  activity: ActivityType;
  timestamp?: number;
}

export interface BpmSample {
  time: number;
  bpm: number;
}

export interface MqttSettings {
  brokerUrl: string;
  clientId: string;
  username: string;
  password: string;
  downlinkTopic: string;
  uplinkTopic: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
