import { useCallback, useEffect, useRef, useState } from 'react';
import mqtt, { type MqttClient } from 'mqtt';
import type {
  BpmSample,
  ConnectionStatus,
  MqttSettings,
  PlayerDownlinkMessage,
  SensorUplinkMessage,
} from '../types';

const MAX_BPM_HISTORY = 60;

export function useMqtt(settings: MqttSettings) {
  const clientRef = useRef<MqttClient | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [sensor, setSensor] = useState<SensorUplinkMessage | null>(null);
  const [bpmHistory, setBpmHistory] = useState<BpmSample[]>([]);

  const disconnect = useCallback(() => {
    clientRef.current?.end(true);
    clientRef.current = null;
    setStatus('disconnected');
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }
    setError(null);
    setStatus('connecting');

    const client = mqtt.connect(settings.brokerUrl, {
      clientId: settings.clientId,
      username: settings.username || undefined,
      password: settings.password || undefined,
      reconnectPeriod: 4000,
      connectTimeout: 8000,
      clean: true,
    });

    client.on('connect', () => {
      setStatus('connected');
      client.subscribe(settings.uplinkTopic, (err) => {
        if (err) setError(`Gagal subscribe: ${err.message}`);
      });
    });

    client.on('reconnect', () => setStatus('connecting'));

    client.on('close', () => {
      setStatus((prev) => (prev === 'error' ? prev : 'disconnected'));
    });

    client.on('error', (err) => {
      setError(err.message);
      setStatus('error');
    });

    client.on('message', (topic, payload) => {
      if (topic !== settings.uplinkTopic) return;
      try {
        const data = JSON.parse(payload.toString()) as SensorUplinkMessage;
        setSensor(data);
        setBpmHistory((prev) => {
          const next = [...prev, { time: Date.now(), bpm: data.bpm }];
          return next.slice(-MAX_BPM_HISTORY);
        });
      } catch {
        setError('Payload uplink bukan JSON yang valid');
      }
    });

    clientRef.current = client;
  }, [settings]);

  const publishDownlink = useCallback(
    (message: PlayerDownlinkMessage) => {
      const client = clientRef.current;
      if (!client || status !== 'connected') return;
      client.publish(settings.downlinkTopic, JSON.stringify(message), { qos: 0 });
    },
    [settings.downlinkTopic, status],
  );

  useEffect(() => () => {
    clientRef.current?.end(true);
  }, []);

  return { status, error, sensor, bpmHistory, connect, disconnect, publishDownlink };
}
