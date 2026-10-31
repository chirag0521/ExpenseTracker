import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Calendar, FileText } from 'lucide-react';
import { CATEGORIES } from '../utils/categories.js';
import { getTodayKolkata } from '../utils/date.js';
import CategoryChip from './CategoryChip.jsx';
import './ModalStyles.css';
import './AddExpenseModal.css';

export default function AddExpenseModal({
  isOpen,
  onClose,
  onAddExpense,
  todayStr
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(todayStr || getTodayKolkata());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const amountInputRef = useRef(null);

  // Reset form and focus amount input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCategory('Food');
      setDate(todayStr || getTodayKolkata());
      setNote('');
      setError('');
      setTimeout(() => {
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0');
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
      return;
    }

    onAddExpense({
      amount: num,
      category,
      date: date || getTodayKolkata(),
      note: note.trim()
    });

    onClose();
  };

  const handleQuickAddAmount = (addValue) => {
    const current = parseFloat(amount) || 0;
    const nextVal = current + addValue;
    setAmount(String(nextVal));
    setError('');
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bottom-sheet modal-content add-expense-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-expense-title"
      >
        <div className="sheet-drag-handle" />

        <div className="modal-header">
          <div>
            <h3 id="add-expense-title" className="modal-title">
              Add Expense
            </h3>
            <span className="modal-subtitle">Quick & simple expense entry</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form add-expense-form">
          {/* Amount Input with Quick Chips */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-expense-amount">
              Amount Spent
            </label>
            <div
              className="amount-input-box modal-amount-hero"
              onClick={() => amountInputRef.current?.focus()}
            >
              <span className="currency-prefix">₹</span>
              <input
                id="modal-expense-amount"
                ref={amountInputRef}
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="0"
                className="amount-field num"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
            </div>

            {/* Quick Increment Buttons */}
            <div className="quick-amount-row">
              <button
                type="button"
                className="quick-amount-btn"
                onClick={() => handleQuickAddAmount(50)}
              >
                +₹50
              </button>
              <button
                type="button"
                className="quick-amount-btn"
                onClick={() => handleQuickAddAmount(100)}
              >
                +₹100
              </button>
              <button
                type="button"
                className="quick-amount-btn"
                onClick={() => handleQuickAddAmount(500)}
              >
                +₹500
              </button>
            </div>

            {error && <span className="form-error-msg">{error}</span>}
          </div>

          {/* Category Picker */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="add-category-grid">
              {CATEGORIES.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  category={cat.id}
                  isSelected={category === cat.id}
                  onClick={() => setCategory(cat.id)}
                  size="small"
                />
              ))}
            </div>
          </div>

          {/* Date and Note Row */}
          <div className="add-meta-grid">
            <div className="form-group flex-1">
              <div className="input-with-icon-header">
                <Calendar size={14} className="meta-icon" />
                <label className="form-label" htmlFor="modal-expense-date">
                  Date
                </label>
              </div>
              <input
                id="modal-expense-date"
                type="date"
                className="input-field"
                value={date}
                max={todayStr || getTodayKolkata()}
                onChange={(e) => {
                  const val = e.target.value;
                  const maxVal = todayStr || getTodayKolkata();
                  setDate(val > maxVal ? maxVal : val);
                }}
              />
            </div>

            <div className="form-group flex-1">
              <div className="input-with-icon-header">
                <FileText size={14} className="meta-icon" />
                <label className="form-label" htmlFor="modal-expense-note">
                  Note (optional)
                </label>
              </div>
              <input
                id="modal-expense-note"
                type="text"
                className="input-field"
                placeholder="e.g. Chai, Groceries"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={60}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              <Check size={18} strokeWidth={2.4} /> Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
