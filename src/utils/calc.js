/**
 * Pure calculation functions for Pocket Wallet.
 * Easy to test, zero side-effects.
 */

import {
  getDaysInMonth,
  getPreviousMonth,
  getRemainingDaysInMonth,
  isLastDayOfMonth,
  getMonthName
} from './date.js';

/**
 * Formats a number into Indian Rupee representation with Indian digit grouping.
 * Examples:
 *   10000 -> "₹10,000"
 *   123456 -> "₹1,23,456"
 *   -5700 -> "-₹5,700"
 */
export function formatINR(amount, { showDecimals = false, showSign = false } = {}) {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0
  }).format(absNum);

  if (isNegative) {
    return `-₹${formatted}`;
  }
  if (showSign && num > 0) {
    return `+₹${formatted}`;
  }
  return `₹${formatted}`;
}

/**
 * Computes running wallet balance from all entries.
 * Wallet balance = opening balance + IPO profit + top-ups - expenses.
 * Balance is NEVER stored as a single number.
 */
export function calculateWalletBalance(topups = [], ipos = [], expenses = []) {
  const totalTopups = (topups || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalIpos = (ipos || []).reduce((sum, item) => sum + (Number(item.profit) || 0), 0);
  const totalExpenses = (expenses || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return totalTopups + totalIpos - totalExpenses;
}

/**
 * Computes balance color state:
 * - 'sage': normal (>= 20% of target)
 * - 'butter': warning (< 20% of target and >= 0)
 * - 'rose': negative (< 0)
 */
export function getBalanceColorState(balance, target = 10000) {
  if (balance < 0) return 'rose';
  if (target > 0 && balance < 0.2 * target) return 'butter';
  return 'sage';
}

/**
 * "Safe to spend per day":
 * wallet balance / remaining days of the month including today.
 * Returns null if balance <= 0 so UI can cleanly hide or show a gentle note.
 */
export function calculateSafeToSpendPerDay(balance, todayDateStr) {
  if (balance <= 0) return null;
  const remainingDays = getRemainingDaysInMonth(todayDateStr);
  if (remainingDays <= 0) return Math.floor(balance);
  return Math.floor(balance / remainingDays);
}

/**
 * Computes Month-end Refill status for Home card.
 * Triggers on:
 * 1. The last day of the current month
 * 2. Early days of the next month (up to 7th or until handled/dismissed)
 *
 * Returns:
 * {
 *   shouldShow: boolean,
 *   isAboveTarget: boolean,
 *   refillNeeded: number,
 *   surplusAmount: number,
 *   refillMonth: string (e.g. '2026-10'),
 *   refillMonthName: string (e.g. 'October'),
 *   defaultRefillDate: string (e.g. '2026-11-01'),
 *   currentBalance: number,
 *   target: number
 * }
 */
export function calculateRefillStatus(
  balance,
  target = 10000,
  todayDateStr,
  topups = [],
  dismissedMonths = []
) {
  if (!todayDateStr) {
    return { shouldShow: false };
  }

  const [y, m, d] = todayDateStr.split('-').map(Number);
  const currentMonthStr = `${y}-${String(m).padStart(2, '0')}`;
  const isMonthEnd = isLastDayOfMonth(todayDateStr);
  const isEarlyMonth = d <= 10; // Check beginning of next month

  let targetMonthStr = null;
  let defaultRefillDate = todayDateStr;

  if (isMonthEnd) {
    targetMonthStr = currentMonthStr;
    // Next month's 1st day as default date
    const nextDate = new Date(y, m, 1);
    const ny = nextDate.getFullYear();
    const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
    defaultRefillDate = `${ny}-${nm}-01`;
  } else if (isEarlyMonth) {
    targetMonthStr = getPreviousMonth(currentMonthStr);
    defaultRefillDate = todayDateStr;
  } else {
    return { shouldShow: false };
  }

  // If user already dismissed this month's refill reminder
  if (dismissedMonths && dismissedMonths.includes(targetMonthStr)) {
    return { shouldShow: false };
  }

  // Check if a refill topup for this transition was already created
  // Refill top-ups dated in the new month or end of previous month
  const alreadyRefilled = (topups || []).some(
    (t) => t.type === 'refill' && (t.date.startsWith(targetMonthStr) || t.date.startsWith(currentMonthStr))
  );

  if (alreadyRefilled) {
    return { shouldShow: false };
  }

  const refillMonthName = getMonthName(targetMonthStr);
  const isAboveTarget = balance >= target;
  const refillNeeded = Math.max(0, target - balance);
  const surplusAmount = Math.max(0, balance - target);

  return {
    shouldShow: true,
    isAboveTarget,
    refillNeeded,
    surplusAmount,
    refillMonth: targetMonthStr,
    refillMonthName,
    defaultRefillDate,
    currentBalance: balance,
    target
  };
}

/**
 * Computes Month Summary for Reports Page.
 *
 * @param {Array} allTopups
 * @param {Array} allIpos
 * @param {Array} allExpenses
 * @param {string} monthStr - 'YYYY-MM'
 * @param {number} target - current wallet target
 * @param {string} todayDateStr - today's date in Kolkata
 */
export function calculateMonthSummary(
  allTopups = [],
  allIpos = [],
  allExpenses = [],
  monthStr,
  target = 10000,
  todayDateStr
) {
  const monthStart = `${monthStr}-01`;
  const daysInMonth = getDaysInMonth(monthStr);
  const monthEnd = `${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

  // 1. Opening Balance = all transactions strictly before monthStart
  const openingTopups = allTopups.filter((t) => t.date < monthStart);
  const openingIpos = allIpos.filter((i) => i.date < monthStart);
  const openingExpenses = allExpenses.filter((e) => e.date < monthStart);
  const openingBalance = calculateWalletBalance(openingTopups, openingIpos, openingExpenses);

  // 2. Transactions strictly within monthStr
  const monthExpenses = allExpenses.filter((e) => e.date.startsWith(monthStr));
  const monthIpos = allIpos.filter((i) => i.date.startsWith(monthStr));
  const monthTopups = allTopups.filter((t) => t.date.startsWith(monthStr));

  const totalSpent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalIpoProfit = monthIpos.reduce((sum, i) => sum + (Number(i.profit) || 0), 0);

  const manualAdded = monthTopups
    .filter((t) => t.type === 'manual')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const refillAdded = monthTopups
    .filter((t) => t.type === 'refill')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const openingAdded = monthTopups
    .filter((t) => t.type === 'opening')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalAdded = manualAdded + refillAdded + openingAdded;

  // 3. Closing Balance
  const closingBalance = openingBalance + totalIpoProfit + totalAdded - totalSpent;

  // 4. Out of pocket this month = sum of refills in this month
  const outOfPocket = refillAdded;

  // 5. Comparison with previous month
  const prevMonthStr = getPreviousMonth(monthStr);
  const prevMonthExpenses = allExpenses.filter((e) => e.date.startsWith(prevMonthStr));
  const prevMonthSpent = prevMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  let comparisonSentence = '';
  if (prevMonthExpenses.length === 0) {
    comparisonSentence = 'First month on record — off to a fresh start!';
  } else if (totalSpent < prevMonthSpent) {
    const diff = prevMonthSpent - totalSpent;
    const pct = Math.round((diff / prevMonthSpent) * 100);
    comparisonSentence = `You spent ${formatINR(diff)} (${pct}%) less than last month — nice pacing!`;
  } else if (totalSpent > prevMonthSpent) {
    const diff = totalSpent - prevMonthSpent;
    const pct = Math.round((diff / prevMonthSpent) * 100);
    comparisonSentence = `You spent ${formatINR(diff)} (${pct}%) more than last month.`;
  } else {
    comparisonSentence = 'Spending is exactly on par with last month.';
  }

  // 6. Category breakdown
  const categoryTotals = {};
  monthExpenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(exp.amount) || 0);
  });

  const prevCategoryTotals = {};
  prevMonthExpenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    prevCategoryTotals[cat] = (prevCategoryTotals[cat] || 0) + (Number(exp.amount) || 0);
  });

  const categoryBreakdown = Object.keys(categoryTotals)
    .map((cat) => {
      const amount = categoryTotals[cat];
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      const prevAmount = prevCategoryTotals[cat] || 0;
      const changeAmount = amount - prevAmount;
      return {
        category: cat,
        amount,
        percentage,
        prevAmount,
        changeAmount
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 7. Daily spending bar chart data (1..daysInMonth)
  const dailyData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    const dayExpenses = monthExpenses.filter((e) => e.date === dayStr);
    const dayAmount = dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    dailyData.push({
      day,
      date: dayStr,
      amount: dayAmount,
      count: dayExpenses.length,
      entries: dayExpenses
    });
  }

  // 8. Top 5 biggest expenses
  const topExpenses = [...monthExpenses]
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
    .slice(0, 5);

  // 9. IPOs for the month
  const monthlyIpos = [...monthIpos].sort((a, b) => b.date.localeCompare(a.date));

  // 10. Averages: average spent per day and highest spending day
  // If viewing current month, average is over days passed so far; else all days in month
  let daysPassed = daysInMonth;
  if (todayDateStr && todayDateStr.startsWith(monthStr)) {
    const currentDay = Number(todayDateStr.split('-')[2]);
    daysPassed = Math.max(1, currentDay);
  }

  const averageSpentPerDay = daysPassed > 0 ? Math.round(totalSpent / daysPassed) : 0;

  let highestSpendingDay = null;
  dailyData.forEach((d) => {
    if (d.amount > 0 && (!highestSpendingDay || d.amount > highestSpendingDay.amount)) {
      highestSpendingDay = d;
    }
  });

  return {
    monthStr,
    openingBalance,
    totalSpent,
    totalIpoProfit,
    manualAdded,
    refillAdded,
    openingAdded,
    totalAdded,
    closingBalance,
    outOfPocket,
    comparisonSentence,
    categoryBreakdown,
    dailyData,
    topExpenses,
    monthlyIpos,
    averageSpentPerDay,
    highestSpendingDay,
    totalExpensesCount: monthExpenses.length
  };
}

/**
 * Computes IPO Stats:
 * - This month
 * - This year
 * - All time
 */
export function calculateIpoStats(ipos = [], todayDateStr) {
  const currentMonth = todayDateStr ? todayDateStr.slice(0, 7) : '';
  const currentYear = todayDateStr ? todayDateStr.slice(0, 4) : '';

  let thisMonth = 0;
  let thisYear = 0;
  let allTime = 0;

  (ipos || []).forEach((item) => {
    const profit = Number(item.profit) || 0;
    allTime += profit;
    if (item.date && item.date.startsWith(currentMonth)) {
      thisMonth += profit;
    }
    if (item.date && item.date.startsWith(currentYear)) {
      thisYear += profit;
    }
  });

  return { thisMonth, thisYear, allTime };
}
