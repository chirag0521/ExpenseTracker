import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { getTodayKolkata } from '../utils/date.js';
import './ModalStyles.css';

export default function AddMoneyModal({ isOpen, onClose, onAddTopup }) {
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(getTodayKolkata());
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    onAddTopup({
      amount: num,
      label: label.trim() || 'Manual Top-up',
      date: date || getTodayKolkata(),
      type: 'manual'
    });

    setAmount('');
    setLabel('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="modal-header">
          <div className="modal-title-row">
            <PlusCircle size={20} strokeWidth={2.2} className="modal-title-icon" />
            <h3 className="modal-title">Add Money to Wallet</h3>
          </div>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <div className="amount-input-box">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                autoFocus
                className="input-field amount-field"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
            </div>
            {error && <span className="form-error-msg">{error}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Label (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Gift, Cashback, Extra cash"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
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

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Add to Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
