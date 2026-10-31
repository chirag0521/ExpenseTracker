import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Calendar, FileText } from 'lucide-react';
import { CATEGORIES } from '../utils/categories.js';
import { getTodayKolkata } from '../utils/date.js';
import CategoryChip from '../components/CategoryChip.jsx';
import Toast from '../components/Toast.jsx';
import './AddExpensePage.css';

export default function AddExpensePage({ onAddExpense, todayStr }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(todayStr || getTodayKolkata());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const amountInputRef = useRef(null);

  // Auto-focus amount field on mount for fast entry
  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

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

    // Show friendly confirmation toast
    setToastMessage(`Saved ₹${new Intl.NumberFormat('en-IN').format(num)} to ${category}!`);

    // Clear form and re-focus amount for next entry
    setAmount('');
    setNote('');
    setError('');
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
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
    <div className="add-page">
      <header className="add-header">
        <h1 className="add-title">Add Expense</h1>
        <span className="add-sub">Fast & thumb-friendly receipt entry</span>
      </header>

      <form onSubmit={handleSubmit} className="add-form">
        {/* Large Amount Input Card */}
        <div className="amount-hero-card paper-card">
          <label className="amount-hero-label" htmlFor="expense-amount-input">
            How much did you spend?
          </label>
          <div className="amount-hero-box">
            <span className="amount-hero-currency">₹</span>
            <input
              id="expense-amount-input"
              ref={amountInputRef}
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="0"
              className="amount-hero-input num"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
            />
          </div>

          {/* Quick Increment Chips */}
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

          {error && <span className="add-error-msg">{error}</span>}
        </div>

        {/* Category Picker Card */}
        <div className="category-section paper-card">
          <label className="section-label">Category</label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat.id}
                isSelected={category === cat.id}
                onClick={() => setCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Date and Optional Note */}
        <div className="meta-section paper-card">
          <div className="form-group">
            <div className="input-with-icon-header">
              <Calendar size={15} className="meta-icon" />
              <label className="form-label" htmlFor="expense-date">
                Date
              </label>
            </div>
            <input
              id="expense-date"
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="paper-divider" />

          <div className="form-group">
            <div className="input-with-icon-header">
              <FileText size={15} className="meta-icon" />
              <label className="form-label" htmlFor="expense-note">
                Note (optional)
              </label>
            </div>
            <input
              id="expense-note"
              type="text"
              className="input-field"
              placeholder="e.g. Chai with friends, Grocery restock"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={60}
            />
          </div>
        </div>

        {/* Thumb-friendly Save Button */}
        <div className="add-submit-box">
          <button type="submit" className="btn btn-primary add-save-btn">
            <Check size={18} strokeWidth={2.4} /> Save Expense
          </button>
        </div>
      </form>

      {/* Confirmation Toast */}
      <Toast
        message={toastMessage}
        type="success"
        onClose={() => setToastMessage('')}
      />
    </div>
  );
}
