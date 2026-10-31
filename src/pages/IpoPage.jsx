import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  AlertCircle
} from 'lucide-react';
import { formatINR, calculateIpoStats } from '../utils/calc.js';
import { getTodayKolkata, formatDisplayDate } from '../utils/date.js';
import EditIpoModal from '../components/EditIpoModal.jsx';
import Toast from '../components/Toast.jsx';
import './IpoPage.css';

export default function IpoPage({
  ipos = [],
  onAddIpo,
  onUpdateIpo,
  onDeleteIpo,
  todayStr
}) {
  const [company, setCompany] = useState('');
  const [date, setDate] = useState(todayStr || getTodayKolkata());
  const [profit, setProfit] = useState('');
  const [isLoss, setIsLoss] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [editingIpo, setEditingIpo] = useState(null);

  // Compute IPO stats: This month, This year, All time
  const stats = useMemo(() => {
    return calculateIpoStats(ipos, todayStr || getTodayKolkata());
  }, [ipos, todayStr]);

  // Form submission (only 3 fields: company, date, profit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim()) {
      setError('Please enter company name');
      return;
    }
    const val = parseFloat(profit);
    if (isNaN(val)) {
      setError('Please enter a profit/loss amount');
      return;
    }

    const finalProfit = isLoss ? -Math.abs(val) : Math.abs(val);

    onAddIpo({
      company: company.trim(),
      date: date || getTodayKolkata(),
      profit: finalProfit
    });

    setToastMessage(`Added IPO entry for ${company.trim()}!`);
    setCompany('');
    setProfit('');
    setIsLoss(false);
    setError('');
  };

  return (
    <div className="ipo-page">
      <header className="ipo-header">
        <h1 className="ipo-title">IPO Tracker</h1>
        <span className="ipo-sub">Gains and losses added to your wallet</span>
      </header>

      {/* Stat Cards: This Month, This Year, All Time */}
      <section className="ipo-stats-grid">
        <div className="ipo-stat-card paper-card">
          <span className="ipo-stat-label">This Month</span>
          <span
            className={`ipo-stat-val num ${
              stats.thisMonth < 0 ? 'stat-loss' : stats.thisMonth > 0 ? 'stat-profit' : ''
            }`}
          >
            {formatINR(stats.thisMonth, { showSign: true })}
          </span>
        </div>

        <div className="ipo-stat-card paper-card">
          <span className="ipo-stat-label">This Year</span>
          <span
            className={`ipo-stat-val num ${
              stats.thisYear < 0 ? 'stat-loss' : stats.thisYear > 0 ? 'stat-profit' : ''
            }`}
          >
            {formatINR(stats.thisYear, { showSign: true })}
          </span>
        </div>

        <div className="ipo-stat-card paper-card">
          <span className="ipo-stat-label">All Time</span>
          <span
            className={`ipo-stat-val num ${
              stats.allTime < 0 ? 'stat-loss' : stats.allTime > 0 ? 'stat-profit' : ''
            }`}
          >
            {formatINR(stats.allTime, { showSign: true })}
          </span>
        </div>
      </section>

      {/* IPO Entry Form: Company name, Date, Profit amount only */}
      <section className="ipo-form-section paper-card">
        <h2 className="section-title">New IPO Entry</h2>

        <form onSubmit={handleSubmit} className="ipo-form">
          <div className="form-group">
            <label className="form-label" htmlFor="ipo-company">
              Company Name
            </label>
            <input
              id="ipo-company"
              type="text"
              className="input-field"
              placeholder="e.g. Swiggy, Hyundai Motor, NTPC Green"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setError('');
              }}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ipo-date">
              Listing / Allotment Date
            </label>
            <input
              id="ipo-date"
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div className="profit-label-row">
              <label className="form-label" htmlFor="ipo-profit">
                Profit or Loss (₹)
              </label>
              <div className="sign-toggle-group">
                <button
                  type="button"
                  className={`btn-sign ${!isLoss ? 'active-profit' : ''}`}
                  onClick={() => setIsLoss(false)}
                >
                  + Profit
                </button>
                <button
                  type="button"
                  className={`btn-sign ${isLoss ? 'active-loss' : ''}`}
                  onClick={() => setIsLoss(true)}
                >
                  − Loss
                </button>
              </div>
            </div>

            <div className="amount-input-box">
              <span className={`currency-prefix ${isLoss ? 'loss-text' : 'profit-text'}`}>
                {isLoss ? '-₹' : '+₹'}
              </span>
              <input
                id="ipo-profit"
                type="number"
                inputMode="decimal"
                step="any"
                className="input-field amount-field num"
                placeholder="0"
                value={profit}
                onChange={(e) => {
                  setProfit(e.target.value);
                  setError('');
                }}
              />
            </div>
            {error && <span className="ipo-error-msg">{error}</span>}
          </div>

          <button type="submit" className="btn btn-primary ipo-submit-btn">
            <Plus size={16} strokeWidth={2.4} /> Record IPO Result
          </button>
        </form>
      </section>

      {/* List of Entries (Newest First) with Edit/Delete */}
      <section className="ipo-list-section">
        <h2 className="section-title">All IPO Entries ({ipos.length})</h2>

        <div className="ipo-entries-container">
          {ipos.length === 0 ? (
            <div className="ipo-empty-card paper-card">
              <p className="empty-message">No IPO entries recorded yet.</p>
              <span className="empty-sub">Add your listing gains or losses above</span>
            </div>
          ) : (
            ipos.map((item) => {
              const isItemLoss = Number(item.profit) < 0;
              return (
                <div
                  key={item.id}
                  className="ipo-entry-card paper-card"
                  onClick={() => setEditingIpo(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.company}: ${formatINR(item.profit)}. Tap to edit.`}
                >
                  <div className="ipo-entry-left">
                    <span className="ipo-company-name">{item.company}</span>
                    <span className="ipo-entry-date">{formatDisplayDate(item.date)}</span>
                  </div>

                  <div className="ipo-entry-right">
                    <span
                      className={`ipo-entry-profit num ${
                        isItemLoss ? 'profit-loss' : 'profit-gain'
                      }`}
                    >
                      {formatINR(item.profit, { showSign: true })}
                    </span>
                    <span className="ipo-tap-hint">Tap to edit</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Edit IPO Modal */}
      <EditIpoModal
        isOpen={Boolean(editingIpo)}
        ipo={editingIpo}
        onClose={() => setEditingIpo(null)}
        onUpdateIpo={onUpdateIpo}
        onDeleteIpo={onDeleteIpo}
      />

      <Toast
        message={toastMessage}
        type="success"
        onClose={() => setToastMessage('')}
      />
    </div>
  );
}
