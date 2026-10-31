import React from 'react';
import { X, Calendar } from 'lucide-react';
import { formatINR } from '../utils/calc.js';
import { formatFullDisplayDate } from '../utils/date.js';
import CategoryChip from './CategoryChip.jsx';
import './DayDetailSheet.css';

export default function DayDetailSheet({
  isOpen,
  dayData,
  onClose,
  onEditExpense
}) {
  if (!isOpen || !dayData) return null;

  const entries = dayData.entries || [];
  const total = dayData.amount || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet day-detail-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="day-sheet-header">
          <div className="day-sheet-title-group">
            <div className="day-sheet-date-row">
              <Calendar size={16} strokeWidth={2.2} className="day-icon" />
              <span className="day-sheet-date">{formatFullDisplayDate(dayData.date)}</span>
            </div>
            <h3 className="day-sheet-total num">Total: {formatINR(total)}</h3>
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

        <div className="day-entries-list">
          {entries.length === 0 ? (
            <div className="day-empty-state">
              <p>Nothing spent on this day.</p>
            </div>
          ) : (
            entries.map((item) => (
              <div
                key={item.id}
                className="day-entry-item"
                onClick={() => onEditExpense && onEditExpense(item)}
                role="button"
                tabIndex={0}
              >
                <div className="day-entry-left">
                  <CategoryChip category={item.category} size="small" />
                  {item.note && <span className="day-entry-note">{item.note}</span>}
                </div>
                <div className="day-entry-right">
                  <span className="day-entry-amount num">{formatINR(item.amount)}</span>
                  <span className="day-entry-tap-hint">Tap to edit</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
