/**
 * Date utilities for Pocket Wallet.
 * All persistent dates are stored as 'YYYY-MM-DD' in Asia/Kolkata timezone.
 */

const TIME_ZONE = 'Asia/Kolkata';

/**
 * Returns today's date in YYYY-MM-DD format according to Asia/Kolkata timezone.
 */
export function getTodayKolkata() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    // Fallback if environment doesn't support timeZone
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Returns current month string 'YYYY-MM'
 */
export function getCurrentMonthKolkata() {
  return getTodayKolkata().slice(0, 7);
}

/**
 * Formats YYYY-MM-DD to friendly short form: "Sat, 31 Oct"
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Formats YYYY-MM-DD to full form: "31 October 2026"
 */
export function formatFullDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formats YYYY-MM to "October 2026"
 */
export function formatMonthYear(monthStr) {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Returns month name only, e.g. "October"
 */
export function getMonthName(monthStr) {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long' });
}

/**
 * Number of days in a given YYYY-MM month
 */
export function getDaysInMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

/**
 * Remaining days of the month including today (1-based count)
 */
export function getRemainingDaysInMonth(dateStr = getTodayKolkata()) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const totalDays = new Date(y, m, 0).getDate();
  const remaining = totalDays - d + 1;
  return Math.max(1, remaining);
}

/**
 * Checks if a given date is the last calendar day of its month
 */
export function isLastDayOfMonth(dateStr = getTodayKolkata()) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const totalDays = new Date(y, m, 0).getDate();
  return d === totalDays;
}

/**
 * Returns previous month 'YYYY-MM'
 */
export function getPreviousMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
  return `${prevYear}-${prevMonth}`;
}

/**
 * Returns next month 'YYYY-MM'
 */
export function getNextMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const nextDate = new Date(y, m, 1);
  const nextYear = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

/**
 * Offsets a YYYY-MM-DD date by delta days (e.g. -1 for yesterday, +1 for tomorrow)
 */
export function shiftDate(dateStr, offsetDays) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a short day name: 'Mon', 'Tue', etc.
 */
export function getDayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', { weekday: 'short' });
}
