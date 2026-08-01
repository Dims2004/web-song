import { Activity, Home, ListMusic, Settings } from 'lucide-react';
import type { ConnectionStatus } from '../types';
import { ConnectionBadge } from './ConnectionBadge';

export type ViewKey = 'home' | 'health';

interface SidebarProps {
  view: ViewKey;
  onChangeView: (view: ViewKey) => void;
  onOpenSettings: () => void;
  connectionStatus: ConnectionStatus;
  songCount: number;
}

export function Sidebar({ view, onChangeView, onOpenSettings, connectionStatus, songCount }: SidebarProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col justify-between bg-black p-4">
      <div>
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-black font-bold">
            W
          </div>
          <span className="text-lg font-bold tracking-tight">WebSong IoT</span>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem
            icon={<Home size={20} />}
            label="Beranda"
            active={view === 'home'}
            onClick={() => onChangeView('home')}
          />
          <NavItem
            icon={<Activity size={20} />}
            label="Kesehatan"
            active={view === 'health'}
            onClick={() => onChangeView('health')}
          />
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <ConnectionBadge status={connectionStatus} />
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-app-subtext transition hover:bg-app-surface-3 hover:text-app-text"
        >
          <Settings size={18} />
          Pengaturan MQTT
        </button>
        <div className="flex items-center gap-2 px-3 text-xs text-app-subtext">
          <ListMusic size={14} />
          {songCount} lagu di playlist
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-app-surface-3 text-app-text' : 'text-app-subtext hover:text-app-text'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
