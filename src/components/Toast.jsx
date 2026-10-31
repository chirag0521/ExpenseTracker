import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-container ${type}`} role="status" aria-live="polite">
      <div className="toast-icon">
        {type === 'error' ? (
          <AlertCircle size={18} strokeWidth={2.2} />
        ) : (
          <CheckCircle2 size={18} strokeWidth={2.2} />
        )}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
}
