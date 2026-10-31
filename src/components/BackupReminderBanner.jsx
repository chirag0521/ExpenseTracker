import React from 'react';
import { ShieldAlert, Download, X } from 'lucide-react';
import { getTodayKolkata } from '../utils/date.js';
import './BackupReminderBanner.css';

export default function BackupReminderBanner({
  lastExportDate,
  totalRecords = 0,
  onExport,
  onDismiss
}) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || totalRecords === 0) return null;

  const today = getTodayKolkata();

  let shouldShow = false;
  let message = '';

  if (!lastExportDate) {
    if (totalRecords >= 5) {
      shouldShow = true;
      message = "You have entries that haven't been backed up yet. Download a copy?";
    }
  } else {
    const [y1, m1, d1] = lastExportDate.split('-').map(Number);
    const [y2, m2, d2] = today.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffDays = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      shouldShow = true;
      message = `Last backup was ${diffDays} days ago. Keep your data safe with a quick export.`;
    }
  }

  if (!shouldShow) return null;

  return (
    <div className="backup-banner paper-card">
      <div className="backup-banner-left">
        <ShieldAlert size={18} strokeWidth={2.2} className="backup-icon" />
        <span className="backup-text">{message}</span>
      </div>
      <div className="backup-banner-right">
        <button
          type="button"
          className="btn btn-secondary btn-sm backup-action-btn"
          onClick={onExport}
        >
          <Download size={14} /> Backup
        </button>
        <button
          type="button"
          className="backup-close-btn"
          onClick={() => {
            setDismissed(true);
            if (onDismiss) onDismiss();
          }}
          aria-label="Dismiss backup reminder"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
