import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import './ModalStyles.css';

export default function EditTargetModal({ isOpen, currentTarget = 10000, onClose, onSaveTarget }) {
  const [target, setTarget] = useState(String(currentTarget));
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(target);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a target greater than 0');
      return;
    }

    onSaveTarget(num);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="modal-header">
          <div className="modal-title-row">
            <Target size={20} strokeWidth={2.2} className="modal-title-icon" />
            <h3 className="modal-title">Monthly Target Amount</h3>
          </div>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <p className="modal-desc">
          This is your monthly wallet target. At the end of each month, you'll be prompted to refill back to this amount.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Target Amount (₹)</label>
            <div className="amount-input-box">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                inputMode="numeric"
                autoFocus
                className="input-field amount-field"
                placeholder="10000"
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  setError('');
                }}
              />
            </div>
            {error && <span className="form-error-msg">{error}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Save Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
