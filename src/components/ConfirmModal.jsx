import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="bottom-sheet confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />
        <div className="confirm-icon-wrapper">
          <AlertTriangle size={26} strokeWidth={2.2} className="confirm-icon" />
        </div>
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}

        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn-secondary confirm-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'} confirm-btn-action`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
