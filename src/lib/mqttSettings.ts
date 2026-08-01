import type { MqttSettings } from '../types';

const STORAGE_KEY = 'websong-mqtt-settings';

export const defaultMqttSettings: MqttSettings = {
  brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',
  clientId: `websong-web-${Math.random().toString(16).slice(2, 10)}`,
  username: '',
  password: '',
  downlinkTopic: 'websong/player/state',
  uplinkTopic: 'websong/sensor/data',
};

export function loadMqttSettings(): MqttSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMqttSettings;
    return { ...defaultMqttSettings, ...JSON.parse(raw) };
  } catch {
    return defaultMqttSettings;
  }
}

export function saveMqttSettings(settings: MqttSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
