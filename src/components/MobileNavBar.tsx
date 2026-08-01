import { Activity, Home, Settings } from 'lucide-react';
import type { ViewKey } from './Sidebar';

interface MobileNavBarProps {
  view: ViewKey;
  onChangeView: (view: ViewKey) => void;
  onOpenSettings: () => void;
}

export function MobileNavBar({ view, onChangeView, onOpenSettings }: MobileNavBarProps) {
  return (
    <nav className="flex items-center justify-around border-t border-app-border bg-black py-1.5 md:hidden">
      <MobileNavItem
        icon={<Home size={20} />}
        label="Beranda"
        active={view === 'home'}
        onClick={() => onChangeView('home')}
      />
      <MobileNavItem
        icon={<Activity size={20} />}
        label="Kesehatan"
        active={view === 'health'}
        onClick={() => onChangeView('health')}
      />
      <MobileNavItem icon={<Settings size={20} />} label="Pengaturan" active={false} onClick={onOpenSettings} />
    </nav>
  );
}

function MobileNavItem({
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
      className={`flex flex-col items-center gap-0.5 rounded-md px-4 py-1 text-[10px] font-medium transition ${
        active ? 'text-brand' : 'text-app-subtext hover:text-app-text'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
