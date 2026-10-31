import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../utils/categories.js';
import CategoryChip from './CategoryChip.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import './ModalStyles.css';
import './EditExpenseModal.css';

export default function EditExpenseModal({
  isOpen,
  expense,
  onClose,
  onUpdateExpense,
  onDeleteExpense
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount || ''));
      setCategory(expense.category || 'Food');
      setDate(expense.date || '');
      setNote(expense.note || '');
      setError('');
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    onUpdateExpense(expense.id, {
      amount: num,
      category,
      date,
      note: note.trim()
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    onDeleteExpense(expense.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="bottom-sheet modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-drag-handle" />

          <div className="modal-header">
            <h3 className="modal-title">Edit Expense</h3>
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
              <label className="form-label">Category</label>
              <div className="edit-category-chips">
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
              <label className="form-label">Note (optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="What was this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={60}
              />
            </div>

            <div className="edit-modal-actions">
              <button
                type="button"
                className="btn btn-danger btn-icon"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Expense"
                aria-label="Delete Expense"
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
        title="Delete Expense?"
        message="This will remove this expense and update your running wallet balance."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
