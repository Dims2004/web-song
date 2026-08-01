import type { ConnectionStatus } from '../types';

const LABELS: Record<ConnectionStatus, string> = {
  connected: 'Terhubung',
  connecting: 'Menghubungkan…',
  disconnected: 'Terputus',
  error: 'Error',
};

const DOT_CLASSES: Record<ConnectionStatus, string> = {
  connected: 'bg-brand',
  connecting: 'bg-yellow-400 animate-pulse',
  disconnected: 'bg-app-subtext',
  error: 'bg-red-500',
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-app-surface-3 px-3 py-1.5 text-xs text-app-subtext">
      <span className={`h-2 w-2 rounded-full ${DOT_CLASSES[status]}`} />
      <span>MQTT: {LABELS[status]}</span>
    </div>
  );
}
