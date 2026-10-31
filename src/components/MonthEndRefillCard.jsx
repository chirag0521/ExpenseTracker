import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, X } from 'lucide-react';
import { formatINR } from '../utils/calc.js';
import './MonthEndRefillCard.css';

export default function MonthEndRefillCard({
  refillStatus,
  onConfirmRefill,
  onDismiss
}) {
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [refillDate, setRefillDate] = useState('');

  if (!refillStatus || !refillStatus.shouldShow) return null;

  const {
    isAboveTarget,
    refillNeeded,
    surplusAmount,
    refillMonth,
    refillMonthName,
    defaultRefillDate,
    currentBalance,
    target
  } = refillStatus;

  const handleOpenRefillSheet = () => {
    setCustomAmount(String(refillNeeded));
    setRefillDate(defaultRefillDate);
    setShowConfirmSheet(true);
  };

  const handleExecuteRefill = (e) => {
    e.preventDefault();
    const num = parseFloat(customAmount);
    if (isNaN(num) || num <= 0) return;

    onConfirmRefill({
      amount: num,
      date: refillDate || defaultRefillDate,
      label: `${refillMonthName} Refill`,
      type: 'refill'
    });
    setShowConfirmSheet(false);
  };

  return (
    <>
      <div className="refill-card paper-card">
        <div className="refill-icon-pill">
          <Sparkles size={16} strokeWidth={2.2} />
          <span>Month-end check-in</span>
        </div>

        {isAboveTarget ? (
          <div className="refill-surplus-body">
            <p className="refill-text">
              <strong>{refillMonthName}</strong> remaining: {formatINR(currentBalance)}. You are{' '}
              <span className="surplus-badge num">{formatINR(surplusAmount)}</span> above your target, nothing to add!
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm refill-dismiss-btn"
              onClick={() => onDismiss(refillMonth)}
            >
              <Check size={16} /> Dismiss
            </button>
          </div>
        ) : (
          <div className="refill-action-body">
            <p className="refill-text">
              <strong>{refillMonthName}</strong> remaining: <span className="tabular">{formatINR(currentBalance)}</span>.
              <br />
              Add <strong className="tabular">{formatINR(refillNeeded)}</strong> to bring it back to{' '}
              <span className="tabular">{formatINR(target)}</span>.
            </p>

            <div className="refill-btn-row">
              <button
                type="button"
                className="btn btn-primary refill-add-btn"
                onClick={handleOpenRefillSheet}
              >
                Add {formatINR(refillNeeded)} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => onDismiss(refillMonth)}
                title="Dismiss reminder"
                aria-label="Dismiss reminder"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Bottom Sheet (Editable Amount) */}
      {showConfirmSheet && (
        <div className="modal-overlay" onClick={() => setShowConfirmSheet(false)}>
          <div className="bottom-sheet modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-drag-handle" />

            <div className="modal-header">
              <h3 className="modal-title">Confirm Month-end Refill</h3>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setShowConfirmSheet(false)}
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <p className="modal-desc">
              Refilling for <strong>{refillMonthName}</strong>. You can adjust the amount before confirming.
            </p>

            <form onSubmit={handleExecuteRefill} className="modal-form">
              <div className="form-group">
                <label className="form-label">Refill Amount (₹)</label>
                <div className="amount-input-box">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    className="input-field amount-field"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date (1st of new month)</label>
                <input
                  type="date"
                  className="input-field"
                  value={refillDate}
                  onChange={(e) => setRefillDate(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmSheet(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
