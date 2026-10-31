import React, { useState, useMemo, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Plus,
  Target,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { formatINR } from '../utils/calc.js';
import {
  formatDisplayDate,
  shiftDate,
  getCurrentMonthKolkata,
  getRemainingDaysInMonth
} from '../utils/date.js';
import CategoryChip from '../components/CategoryChip.jsx';
import MonthEndRefillCard from '../components/MonthEndRefillCard.jsx';
import BackupReminderBanner from '../components/BackupReminderBanner.jsx';
import AddMoneyModal from '../components/AddMoneyModal.jsx';
import EditTargetModal from '../components/EditTargetModal.jsx';
import EditExpenseModal from '../components/EditExpenseModal.jsx';
import './TodayPage.css';

export default function TodayPage({
  walletData,
  onOpenSettings,
  onQuickExport,
  onOpenAddExpense
}) {
  const {
    balance,
    balanceState,
    safeToSpend,
    refillStatus,
    settings,
    todayStr,
    expenses,
    ipos,
    topups,
    addTopup,
    updateSettings,
    dismissRefillMonth,
    updateExpense,
    deleteExpense
  } = walletData;

  // Selected date for viewing expenses (defaults to today)
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Keep selectedDate clamped so it never exceeds todayStr
  useEffect(() => {
    if (selectedDate && todayStr && selectedDate > todayStr) {
      setSelectedDate(todayStr);
    }
  }, [selectedDate, todayStr]);

  // Modals state
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Current month stats
  const currentMonthStr = useMemo(() => getCurrentMonthKolkata(), []);

  const monthStats = useMemo(() => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
    const spent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const monthIpos = ipos.filter((i) => i.date.startsWith(currentMonthStr));
    const ipoProfit = monthIpos.reduce((sum, i) => sum + (Number(i.profit) || 0), 0);

    const monthTopups = topups.filter((t) => t.date.startsWith(currentMonthStr));
    const added = monthTopups.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return { spent, ipoProfit, added };
  }, [expenses, ipos, topups, currentMonthStr]);

  // Expenses for the currently selected date
  const selectedDateExpenses = useMemo(() => {
    return expenses.filter((e) => e.date === selectedDate);
  }, [expenses, selectedDate]);

  const selectedDateTotal = useMemo(() => {
    return selectedDateExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [selectedDateExpenses]);

  // Progress percentage toward target
  const progressPercent = useMemo(() => {
    if (!settings.target || settings.target <= 0) return 0;
    const pct = (balance / settings.target) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [balance, settings.target]);

  const isViewingToday = !selectedDate || selectedDate >= todayStr;
  const remainingDays = useMemo(() => getRemainingDaysInMonth(todayStr), [todayStr]);

  return (
    <div className="today-page">
      {/* Top Header Bar */}
      <header className="home-header">
        <div className="brand-group">
          <div className="brand-title-row">
            <span className="brand-rupee-logo" aria-hidden="true">₹</span>
            <span className="brand-badge">Pocket Wallet</span>
          </div>
          <span className="brand-date">{formatDisplayDate(todayStr)}</span>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-icon header-settings-btn"
          onClick={onOpenSettings}
          aria-label="Settings"
          title="Settings & Backup"
        >
          <SettingsIcon size={19} strokeWidth={2} />
        </button>
      </header>

      {/* Backup Reminder Banner if needed */}
      <BackupReminderBanner
        lastExportDate={settings.lastExportDate}
        totalRecords={expenses.length + ipos.length + topups.length}
        onExport={onQuickExport}
      />

      {/* Large Calm Typography: Wallet Balance */}
      <section className="wallet-hero paper-card">
        <div className="wallet-hero-top">
          <span className="wallet-label">Wallet Balance</span>
          <button
            type="button"
            className="target-pill-btn"
            onClick={() => setShowEditTarget(true)}
            title="Edit Target Amount"
          >
            <Target size={13} />
            <span>Target: {formatINR(settings.target)}</span>
          </button>
        </div>

        {/* Large Balance Display */}
        <div className={`wallet-amount-display ${balanceState} num`}>
          {formatINR(balance)}
        </div>

        {/* Soft Progress Bar */}
        <div className="wallet-progress-bar-track" aria-hidden="true">
          <div
            className={`wallet-progress-bar-fill ${balanceState}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* This Month's Quick Summary Line */}
        <div className="wallet-month-metrics">
          <div className="metric-item">
            <span className="metric-label">Spent</span>
            <span className="metric-val num">{formatINR(monthStats.spent)}</span>
          </div>
          <span className="metric-divider">·</span>
          <div className="metric-item">
            <span className="metric-label">Added</span>
            <span className="metric-val num">{formatINR(monthStats.added)}</span>
          </div>
          <span className="metric-divider">·</span>
          <div className="metric-item">
            <span className="metric-label">IPO Profit</span>
            <span className={`metric-val num ${monthStats.ipoProfit < 0 ? 'metric-loss' : 'metric-profit'}`}>
              {formatINR(monthStats.ipoProfit, { showSign: true })}
            </span>
          </div>
        </div>

        {/* Action Buttons: Add Expense & Add Money */}
        <div className="wallet-hero-actions">
          <button
            type="button"
            className="btn btn-primary wallet-action-btn"
            onClick={onOpenAddExpense}
          >
            <Plus size={16} strokeWidth={2.4} /> Add Expense
          </button>
          <button
            type="button"
            className="btn btn-secondary wallet-action-btn"
            onClick={() => setShowAddMoney(true)}
          >
            <CreditCard size={16} strokeWidth={2.2} /> Top Up
          </button>
        </div>
      </section>

      {/* Month-End Refill Card (from last day of month or start of next month) */}
      <MonthEndRefillCard
        refillStatus={refillStatus}
        onConfirmRefill={addTopup}
        onDismiss={dismissRefillMonth}
      />

      {/* Safe to Spend Per Day (shown when balance > 0) */}
      {safeToSpend !== null && safeToSpend > 0 ? (
        <div className="safe-spend-strip paper-card">
          <div className="safe-spend-left">
            <Sparkles size={16} className="safe-spend-icon" />
            <div className="safe-spend-text">
              <span className="safe-spend-title">Safe to spend per day</span>
              <span className="safe-spend-sub">
                for remaining {remainingDays} {remainingDays === 1 ? 'day' : 'days'} this month
              </span>
            </div>
          </div>
          <div className="safe-spend-amount num">{formatINR(safeToSpend)}</div>
        </div>
      ) : balance <= 0 ? (
        <div className="safe-spend-strip safe-spend-empty paper-card">
          <div className="safe-spend-text">
            <span className="safe-spend-title">Wallet balance is low or zero</span>
            <span className="safe-spend-sub">Top up your wallet to continue smooth daily spending</span>
          </div>
        </div>
      ) : null}

      {/* Daily Expenses Section with Date Selector */}
      <section className="daily-expenses-section">
        {/* Date Selector Header */}
        <div className="date-nav-bar paper-card">
          <button
            type="button"
            className="date-nav-btn"
            onClick={() => setSelectedDate((prev) => shiftDate(prev, -1))}
            aria-label="Previous Day"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="date-nav-center">
            <div className="date-nav-title">
              <Calendar size={15} />
              <span>{isViewingToday ? 'Today' : formatDisplayDate(selectedDate)}</span>
            </div>
            <span className="date-nav-total num">
              Total: <strong>{formatINR(selectedDateTotal)}</strong>
            </span>
          </div>

          <button
            type="button"
            className="date-nav-btn"
            onClick={() => {
              setSelectedDate((prev) => {
                const nextDate = shiftDate(prev, 1);
                return nextDate > todayStr ? todayStr : nextDate;
              });
            }}
            disabled={isViewingToday}
            aria-label="Next Day"
            title={isViewingToday ? 'Cannot navigate past today' : 'Next Day'}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Expenses List */}
        <div className="expenses-list">
          {selectedDateExpenses.length === 0 ? (
            <div className="expenses-empty-card paper-card">
              <p className="empty-message">
                {isViewingToday ? 'Nothing spent today. Enjoy the calm!' : 'No expenses recorded on this day.'}
              </p>
              {isViewingToday && (
                <button
                  type="button"
                  className="btn btn-primary empty-add-btn"
                  onClick={onOpenAddExpense}
                >
                  <Plus size={16} /> Add what you spent
                </button>
              )}
            </div>
          ) : (
            selectedDateExpenses.map((exp) => (
              <div
                key={exp.id}
                className="expense-card paper-card"
                onClick={() => setEditingExpense(exp)}
                role="button"
                tabIndex={0}
                aria-label={`${exp.category}: ${formatINR(exp.amount)}. Tap to edit.`}
              >
                <div className="expense-card-left">
                  <CategoryChip category={exp.category} size="small" />
                  {exp.note && <span className="expense-note">{exp.note}</span>}
                </div>
                <div className="expense-card-right">
                  <span className="expense-amount num">{formatINR(exp.amount)}</span>
                  <span className="expense-hint">Tap to edit</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onAddTopup={addTopup}
      />

      {/* Edit Target Modal */}
      <EditTargetModal
        isOpen={showEditTarget}
        currentTarget={settings.target}
        onClose={() => setShowEditTarget(false)}
        onSaveTarget={(newTarget) => updateSettings({ target: newTarget })}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={Boolean(editingExpense)}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onUpdateExpense={updateExpense}
        onDeleteExpense={deleteExpense}
      />
    </div>
  );
}
