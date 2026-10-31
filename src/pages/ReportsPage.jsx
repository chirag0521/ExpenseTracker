import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Award
} from 'lucide-react';
import {
  formatINR,
  calculateMonthSummary
} from '../utils/calc.js';
import {
  getCurrentMonthKolkata,
  formatMonthYear,
  getPreviousMonth,
  getNextMonth,
  formatDisplayDate
} from '../utils/date.js';
import { getCategoryConfig } from '../utils/categories.js';
import DonutChart from '../components/DonutChart.jsx';
import SpendingBarChart from '../components/SpendingBarChart.jsx';
import DayDetailSheet from '../components/DayDetailSheet.jsx';
import EditExpenseModal from '../components/EditExpenseModal.jsx';
import './ReportsPage.css';

export default function ReportsPage({
  expenses = [],
  ipos = [],
  topups = [],
  settings,
  todayStr,
  onUpdateExpense,
  onDeleteExpense
}) {
  const currentMonthStr = useMemo(() => getCurrentMonthKolkata(), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [inspectingDay, setInspectingDay] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Calculate comprehensive monthly summary
  const summary = useMemo(() => {
    return calculateMonthSummary(
      topups,
      ipos,
      expenses,
      selectedMonth,
      settings.target,
      todayStr
    );
  }, [topups, ipos, expenses, selectedMonth, settings.target, todayStr]);

  const isCurrentMonth = selectedMonth === currentMonthStr;
  const canGoNext = selectedMonth < currentMonthStr;

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => getPreviousMonth(prev));
    setSelectedCategory(null);
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setSelectedMonth((prev) => getNextMonth(prev));
      setSelectedCategory(null);
    }
  };

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1 className="reports-title">Monthly Reports</h1>
        <span className="reports-sub">Calm overview of your money flow</span>
      </header>

      {/* Month Switcher (cannot navigate past current month) */}
      <section className="month-switcher-bar paper-card">
        <button
          type="button"
          className="month-nav-btn"
          onClick={handlePrevMonth}
          aria-label="Previous Month"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="month-display">
          <Calendar size={16} className="month-icon" />
          <span className="month-text">{formatMonthYear(selectedMonth)}</span>
        </div>

        <button
          type="button"
          className={`month-nav-btn ${!canGoNext ? 'disabled' : ''}`}
          onClick={handleNextMonth}
          disabled={!canGoNext}
          aria-label="Next Month"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Friendly Sentence Comparing Spending with Previous Month */}
      <div className="comparison-banner paper-card">
        <Sparkles size={18} className="comparison-sparkle" />
        <p className="comparison-sentence">{summary.comparisonSentence}</p>
      </div>

      {/* Monthly Financial Summary Table */}
      <section className="summary-section paper-card">
        <h2 className="section-title">Month Summary</h2>

        <div className="summary-ledger">
          <div className="ledger-row">
            <span className="ledger-label">Opening balance</span>
            <span className="ledger-val num">{formatINR(summary.openingBalance)}</span>
          </div>

          <div className="ledger-row">
            <span className="ledger-label">IPO profit</span>
            <span
              className={`ledger-val num ${
                summary.totalIpoProfit < 0
                  ? 'val-loss'
                  : summary.totalIpoProfit > 0
                  ? 'val-profit'
                  : ''
              }`}
            >
              {formatINR(summary.totalIpoProfit, { showSign: true })}
            </span>
          </div>

          <div className="ledger-row">
            <span className="ledger-label">
              Added money
              {summary.refillAdded > 0 && (
                <span className="ledger-breakdown">
                  {' '}
                  (Manual: {formatINR(summary.manualAdded)} · Refill: {formatINR(summary.refillAdded)})
                </span>
              )}
            </span>
            <span className="ledger-val num val-profit">{formatINR(summary.totalAdded)}</span>
          </div>

          <div className="ledger-row">
            <span className="ledger-label">Spent</span>
            <span className="ledger-val num val-loss">−{formatINR(summary.totalSpent)}</span>
          </div>

          <div className="paper-divider" />

          <div className="ledger-row ledger-row-total">
            <span className="ledger-label">Closing balance</span>
            <span className="ledger-val ledger-closing-val num">
              {formatINR(summary.closingBalance)}
            </span>
          </div>

          {/* Out of pocket this month (sum of refills) */}
          <div className="out-of-pocket-card">
            <div className="out-of-pocket-info">
              <span className="out-label">Out of pocket this month</span>
              <span className="out-sub">Sum of all monthly refills added</span>
            </div>
            <span className="out-val num">{formatINR(summary.outOfPocket)}</span>
          </div>
        </div>
      </section>

      {/* Daily Spending Bar Chart */}
      <section className="daily-chart-section paper-card">
        <h2 className="section-title">Daily Spending</h2>
        <SpendingBarChart
          dailyData={summary.dailyData}
          onSelectDay={(dayItem) => setInspectingDay(dayItem)}
          selectedDay={inspectingDay}
          todayStr={todayStr}
        />
      </section>

      {/* Category Breakdown (Donut + List sorted by amount) */}
      <section className="category-breakdown-section paper-card">
        <h2 className="section-title">Category Breakdown</h2>

        <DonutChart
          breakdown={summary.categoryBreakdown}
          totalSpent={summary.totalSpent}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {summary.categoryBreakdown.length > 0 && (
          <div className="category-breakdown-list">
            {summary.categoryBreakdown.map((item) => {
              const config = getCategoryConfig(item.category);
              const isSelected = selectedCategory === item.category;

              return (
                <div
                  key={item.category}
                  className={`category-item-row ${isSelected ? 'row-selected' : ''}`}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : item.category)
                  }
                >
                  <div className="category-item-left">
                    <span
                      className="category-color-dot"
                      style={{ backgroundColor: config.chartColor }}
                    />
                    <div className="category-name-group">
                      <span className="category-item-name">{item.category}</span>
                      <span className="category-item-pct">
                        {Math.round(item.percentage)}% of spend
                      </span>
                    </div>
                  </div>

                  <div className="category-item-right">
                    <span className="category-item-amount num">
                      {formatINR(item.amount)}
                    </span>
                    {item.changeAmount !== 0 && (
                      <span
                        className={`category-change-badge num ${
                          item.changeAmount > 0 ? 'badge-more' : 'badge-less'
                        }`}
                      >
                        {item.changeAmount > 0 ? '+' : ''}
                        {formatINR(item.changeAmount)} vs last mo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Averages Section */}
      <section className="averages-grid">
        <div className="average-card paper-card">
          <span className="avg-label">Daily Average</span>
          <span className="avg-val num">{formatINR(summary.averageSpentPerDay)} / day</span>
          <span className="avg-sub">
            {isCurrentMonth ? 'across days passed' : 'across the entire month'}
          </span>
        </div>

        <div className="average-card paper-card">
          <span className="avg-label">Peak Spending Day</span>
          {summary.highestSpendingDay ? (
            <>
              <span className="avg-val num">
                {formatINR(summary.highestSpendingDay.amount)}
              </span>
              <span className="avg-sub">
                {formatDisplayDate(summary.highestSpendingDay.date)}
              </span>
            </>
          ) : (
            <span className="avg-sub">No expenses</span>
          )}
        </div>
      </section>

      {/* Top 5 Biggest Expenses */}
      {summary.topExpenses.length > 0 && (
        <section className="top-expenses-section paper-card">
          <h2 className="section-title">Top Expenses</h2>
          <div className="top-expenses-list">
            {summary.topExpenses.map((exp, idx) => (
              <div
                key={exp.id}
                className="top-expense-item"
                onClick={() => setEditingExpense(exp)}
              >
                <div className="top-expense-left">
                  <span className="top-rank-badge">#{idx + 1}</span>
                  <div className="top-expense-details">
                    <span className="top-expense-cat">{exp.category}</span>
                    <span className="top-expense-date">
                      {formatDisplayDate(exp.date)} {exp.note ? `· ${exp.note}` : ''}
                    </span>
                  </div>
                </div>
                <span className="top-expense-amount num">{formatINR(exp.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly IPOs List */}
      {summary.monthlyIpos.length > 0 && (
        <section className="monthly-ipos-section paper-card">
          <div className="section-title-row">
            <h2 className="section-title">Month's IPO Activity</h2>
            <span
              className={`ipo-total-badge num ${
                summary.totalIpoProfit < 0 ? 'loss' : 'profit'
              }`}
            >
              Total: {formatINR(summary.totalIpoProfit, { showSign: true })}
            </span>
          </div>

          <div className="monthly-ipos-list">
            {summary.monthlyIpos.map((ipo) => (
              <div key={ipo.id} className="monthly-ipo-item">
                <div className="ipo-item-left">
                  <span className="ipo-company">{ipo.company}</span>
                  <span className="ipo-date">{formatDisplayDate(ipo.date)}</span>
                </div>
                <span
                  className={`ipo-amount num ${
                    Number(ipo.profit) < 0 ? 'loss' : 'profit'
                  }`}
                >
                  {formatINR(ipo.profit, { showSign: true })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day Detail Bottom Sheet (when bar or day is tapped) */}
      <DayDetailSheet
        isOpen={Boolean(inspectingDay)}
        dayData={inspectingDay}
        onClose={() => setInspectingDay(null)}
        onEditExpense={(exp) => {
          setEditingExpense(exp);
          setInspectingDay(null);
        }}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={Boolean(editingExpense)}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onUpdateExpense={onUpdateExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
}
