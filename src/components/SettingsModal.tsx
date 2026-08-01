import { useState } from 'react';
import { X } from 'lucide-react';
import type { ConnectionStatus, MqttSettings } from '../types';

interface SettingsModalProps {
  settings: MqttSettings;
  status: ConnectionStatus;
  error: string | null;
  onClose: () => void;
  onSave: (settings: MqttSettings) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SettingsModal({ settings, status, error, onClose, onSave, onConnect, onDisconnect }: SettingsModalProps) {
  const [form, setForm] = useState<MqttSettings>(settings);

  const update = (key: keyof MqttSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSaveAndConnect = () => {
    onSave(form);
    onConnect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-app-surface-2 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Pengaturan MQTT</h2>
          <button onClick={onClose} className="text-app-subtext hover:text-app-text">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Broker WebSocket URL" value={form.brokerUrl} onChange={update('brokerUrl')} placeholder="wss://broker.example.com:8884/mqtt" />
          <Field label="Client ID" value={form.clientId} onChange={update('clientId')} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Username (opsional)" value={form.username} onChange={update('username')} />
            <Field label="Password (opsional)" value={form.password} onChange={update('password')} type="password" />
          </div>
          <Field label="Topic Downlink (Web → ESP32)" value={form.downlinkTopic} onChange={update('downlinkTopic')} />
          <Field label="Topic Uplink (ESP32 → Web)" value={form.uplinkTopic} onChange={update('uplinkTopic')} />
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-app-subtext">Status: {status}</span>
          <div className="flex gap-2">
            {status === 'connected' ? (
              <button
                onClick={onDisconnect}
                className="rounded-full border border-app-border px-4 py-2 text-sm font-semibold hover:bg-app-surface-3"
              >
                Putuskan
              </button>
            ) : null}
            <button
              onClick={handleSaveAndConnect}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black hover:bg-brand-dark"
            >
              Simpan &amp; Sambungkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-app-subtext">
      {label}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-md border border-app-border bg-app-surface-3 px-3 py-2 text-sm text-app-text outline-none focus:border-brand"
      />
    </label>
  );
}
