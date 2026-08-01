import { Footprints, Heart, PersonStanding, Radio, Zap } from 'lucide-react';
import type { ActivityType, BpmSample, ConnectionStatus, SensorUplinkMessage } from '../types';
import { formatRelativeTime } from '../lib/format';
import { BpmChart } from './BpmChart';

interface HealthDashboardProps {
  sensor: SensorUplinkMessage | null;
  bpmHistory: BpmSample[];
  connectionStatus: ConnectionStatus;
}

const ACTIVITY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  diam: { label: 'Diam', icon: <PersonStanding size={28} /> },
  jalan: { label: 'Berjalan', icon: <Footprints size={28} /> },
  lari: { label: 'Berlari', icon: <Zap size={28} /> },
};

function activityMeta(activity: ActivityType) {
  return ACTIVITY_META[activity] ?? { label: activity || 'Tidak diketahui', icon: <PersonStanding size={28} /> };
}

export function HealthDashboard({ sensor, bpmHistory, connectionStatus }: HealthDashboardProps) {
  const meta = activityMeta(sensor?.activity ?? '');
  const lastUpdate = bpmHistory.length ? bpmHistory[bpmHistory.length - 1].time : null;

  return (
    <div className="px-6 py-6">
      <h1 className="mb-1 text-3xl font-extrabold">Dashboard Kesehatan</h1>
      <p className="mb-6 text-sm text-app-subtext">
        Data sensor diterima real-time dari ESP32 (Pulse Sensor &amp; MPU6050) melalui topic uplink MQTT.
      </p>

      {connectionStatus !== 'connected' && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-yellow-600/40 bg-yellow-600/10 px-4 py-3 text-sm text-yellow-400">
          <Radio size={16} />
          MQTT belum terhubung. Buka Pengaturan MQTT untuk menyambungkan ke broker.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-app-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-app-subtext">
            <Heart size={18} className="text-red-500" />
            <span className="text-xs uppercase tracking-wide">Detak Jantung</span>
          </div>
          <p className="text-5xl font-extrabold">
            {sensor?.bpm ?? '--'}
            <span className="ml-1 text-base font-medium text-app-subtext">BPM</span>
          </p>
          <p className="mt-2 text-xs text-app-subtext">Update {formatRelativeTime(lastUpdate)}</p>
        </div>

        <div className="rounded-xl bg-app-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-app-subtext">
            <Footprints size={18} />
            <span className="text-xs uppercase tracking-wide">Status Aktivitas</span>
          </div>
          <div className="flex items-center gap-3 text-brand">
            {meta.icon}
            <p className="text-3xl font-extrabold text-app-text">{meta.label}</p>
          </div>
          <p className="mt-2 text-xs text-app-subtext">Dideteksi dari sensor MPU6050 (gerak &amp; orientasi)</p>
        </div>

        <div className="rounded-xl bg-app-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-app-subtext">
            <Radio size={18} />
            <span className="text-xs uppercase tracking-wide">Koneksi MQTT</span>
          </div>
          <p className="text-lg font-semibold capitalize">{connectionStatus}</p>
          <p className="mt-2 text-xs text-app-subtext">{bpmHistory.length} sampel BPM diterima sesi ini</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-app-surface p-5">
        <p className="mb-2 text-xs uppercase tracking-wide text-app-subtext">Riwayat BPM</p>
        <BpmChart data={bpmHistory} />
      </div>
    </div>
  );
}
