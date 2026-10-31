import React from 'react';
import { RefreshCw } from 'lucide-react';
import './PwaUpdatePrompt.css';

export default function PwaUpdatePrompt({ needRefresh, onUpdate }) {
  if (!needRefresh) return null;

  return (
    <div className="pwa-update-bar" onClick={onUpdate} role="alert">
      <div className="pwa-update-inner">
        <RefreshCw size={15} strokeWidth={2.4} className="pwa-spin-icon" />
        <span className="pwa-update-text">Update available, tap to refresh</span>
      </div>
    </div>
  );
}
