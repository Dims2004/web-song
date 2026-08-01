import { useCallback, useState } from 'react';
import { Sidebar, type ViewKey } from './components/Sidebar';
import { MobileNavBar } from './components/MobileNavBar';
import { PlaylistView } from './components/PlaylistView';
import { HealthDashboard } from './components/HealthDashboard';
import { NowPlayingBar } from './components/NowPlayingBar';
import { SettingsModal } from './components/SettingsModal';
import { useMqtt } from './hooks/useMqtt';
import { usePlayer } from './hooks/usePlayer';
import { loadMqttSettings, saveMqttSettings } from './lib/mqttSettings';
import type { MqttSettings, PlayerDownlinkMessage } from './types';

export default function App() {
  const [view, setView] = useState<ViewKey>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mqttSettings, setMqttSettings] = useState<MqttSettings>(() => loadMqttSettings());

  const { status, error, sensor, bpmHistory, connect, disconnect, publishDownlink } = useMqtt(mqttSettings);

  const onStateChange = useCallback(
    (message: PlayerDownlinkMessage) => publishDownlink(message),
    [publishDownlink],
  );

  const player = usePlayer({ onStateChange });

  const handleSaveSettings = (next: MqttSettings) => {
    setMqttSettings(next);
    saveMqttSettings(next);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-app-bg text-app-text">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          view={view}
          onChangeView={setView}
          onOpenSettings={() => setSettingsOpen(true)}
          connectionStatus={status}
          songCount={player.playlist.length}
        />
        <main className="min-w-0 flex-1 overflow-y-auto bg-app-surface">
          {view === 'home' ? (
            <PlaylistView
              playlist={player.playlist}
              currentIndex={player.currentIndex}
              status={player.status}
              onSelectSong={player.selectSong}
              onAttachAudio={player.attachAudio}
              onAddSongs={player.addSongsFromFiles}
              onRemoveSong={player.removeSong}
              onAddYoutube={player.addSongFromYoutube}
            />
          ) : (
            <HealthDashboard sensor={sensor} bpmHistory={bpmHistory} connectionStatus={status} />
          )}
        </main>
      </div>

      <NowPlayingBar
        song={player.currentSong}
        status={player.status}
        position={player.position}
        volume={player.volume}
        onToggle={player.toggle}
        onNext={player.next}
        onPrev={player.prev}
        onSeek={player.seek}
        onVolumeChange={player.setVolume}
      />

      <MobileNavBar view={view} onChangeView={setView} onOpenSettings={() => setSettingsOpen(true)} />

      {settingsOpen && (
        <SettingsModal
          settings={mqttSettings}
          status={status}
          error={error}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveSettings}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      )}
    </div>
  );
}
