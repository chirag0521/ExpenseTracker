import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal.jsx';
import './ModalStyles.css';

export default function EditIpoModal({
  isOpen,
  ipo,
  onClose,
  onUpdateIpo,
  onDeleteIpo
}) {
  const [company, setCompany] = useState('');
  const [date, setDate] = useState('');
  const [profit, setProfit] = useState('');
  const [isNegative, setIsNegative] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (ipo) {
      setCompany(ipo.company || '');
      setDate(ipo.date || '');
      const p = Number(ipo.profit) || 0;
      setIsNegative(p < 0);
      setProfit(String(Math.abs(p)));
      setError('');
    }
  }, [ipo]);

  if (!isOpen || !ipo) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim()) {
      setError('Please enter company name');
      return;
    }
    const val = parseFloat(profit);
    if (isNaN(val)) {
      setError('Please enter a valid profit amount');
      return;
    }

    const finalProfit = isNegative ? -Math.abs(val) : Math.abs(val);

    onUpdateIpo(ipo.id, {
      company: company.trim(),
      date,
      profit: finalProfit
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    onDeleteIpo(ipo.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="bottom-sheet modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-drag-handle" />

          <div className="modal-header">
            <h3 className="modal-title">Edit IPO Entry</h3>
            <button type="button" className="btn btn-secondary btn-icon" onClick={onClose}>
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="input-field"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setError('');
                }}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="profit-label-row">
                <label className="form-label">Profit / Loss (₹)</label>
                <div className="sign-toggle-group">
                  <button
                    type="button"
                    className={`btn-sign ${!isNegative ? 'active-profit' : ''}`}
                    onClick={() => setIsNegative(false)}
                  >
                    + Profit
                  </button>
                  <button
                    type="button"
                    className={`btn-sign ${isNegative ? 'active-loss' : ''}`}
                    onClick={() => setIsNegative(true)}
                  >
                    − Loss
                  </button>
                </div>
              </div>

              <div className="amount-input-box">
                <span className={`currency-prefix ${isNegative ? 'loss-text' : 'profit-text'}`}>
                  {isNegative ? '-₹' : '+₹'}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  autoFocus
                  className="input-field amount-field"
                  placeholder="0"
                  value={profit}
                  onChange={(e) => {
                    setProfit(e.target.value);
                    setError('');
                  }}
                />
              </div>
              {error && <span className="form-error-msg">{error}</span>}
            </div>

            <div className="edit-modal-actions">
              <button
                type="button"
                className="btn btn-danger btn-icon"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete IPO"
                aria-label="Delete IPO"
              >
                <Trash2 size={18} />
              </button>
              <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete IPO Entry?"
        message="This will remove this IPO profit/loss and update your wallet balance."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
