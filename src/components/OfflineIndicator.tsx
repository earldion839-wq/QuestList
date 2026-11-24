import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 border px-3 py-2 text-xs font-medium shadow-lg"
      style={{
        borderRadius: 'var(--mod-radius-sm)',
        backgroundColor: 'var(--mod-surface)',
        borderColor: 'var(--mod-accent)',
        color: 'var(--mod-text)',
      }}
    >
      <WifiOff className="h-3.5 w-3.5" style={{ color: 'var(--mod-accent)' }} aria-hidden="true" />
      <span>Offline Mode — Local changes are saved automatically.</span>
    </div>
  );
};
