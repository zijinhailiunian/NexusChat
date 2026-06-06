import { useState } from 'react';
import { Header } from './components/Header/Header';
import { APIKeyBanner } from './components/Header/APIKeyBanner';
import { MainStream } from './components/MainStream/MainStream';
import { DrawerStack } from './components/SideDrawer/DrawerStack';
import { SelectionTooltip } from './components/MainStream/SelectionTooltip';
import { GraphView } from './components/GraphView/GraphView';
import { useTextSelection } from './hooks/useTextSelection';
import { useChatStore } from './store/chatStore';
import { SettingsModal } from './components/Header/SettingsModal';

export default function App() {
  const { selection, clear } = useTextSelection();
  const [showGraph, setShowGraph] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isStreaming = useChatStore((s) => s.isStreaming);

  return (
    <div className="app">
      <Header onOpenGraph={() => setShowGraph(true)} />
      <APIKeyBanner onConfigure={() => setShowSettings(true)} />
      <div className="app-body">
        <MainStream />
        <DrawerStack />
      </div>

      {selection && !isStreaming && (
        <SelectionTooltip selection={selection} onClose={clear} />
      )}
      {showGraph && <GraphView onClose={() => setShowGraph(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
