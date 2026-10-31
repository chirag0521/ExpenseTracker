import React, { useState } from 'react';
import { WalletCards } from 'lucide-react';
import './ModalStyles.css';

export default function OpeningBalanceModal({
  isOpen,
  defaultTarget = 10000,
  onComplete
}) {
  const [amount, setAmount] = useState(String(defaultTarget));
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) {
      setError('Please enter a valid starting balance');
      return;
    }

    onComplete(num);
  };

  return (
    <div className="modal-overlay">
      <div className="bottom-sheet opening-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="opening-icon-wrapper">
          <WalletCards size={32} strokeWidth={2.2} className="opening-icon" />
        </div>

        <h2 className="opening-title">Welcome to Pocket Wallet</h2>
        <p className="opening-desc">
          This is a monthly wallet tracker — not an income ledger. You start with an opening balance, and leftover money carries over automatically.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">What is your starting wallet balance?</label>
            <div className="amount-input-box">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                className="input-field amount-field"
                placeholder={String(defaultTarget)}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
            </div>
            <span className="form-helper-text">
              Defaults to your target of ₹{new Intl.NumberFormat('en-IN').format(defaultTarget)}. You can change this anytime.
            </span>
            {error && <span className="form-error-msg">{error}</span>}
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary btn-full-width">
              Start Pocket Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
