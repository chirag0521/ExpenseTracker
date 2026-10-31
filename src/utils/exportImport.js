/**
 * Data backup and restore utilities (JSON & CSV export/import)
 */

import { Storage } from '../storage/storage.js';
import { getTodayKolkata } from './date.js';

/**
 * Downloads a file to the browser
 */
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports all data as JSON file and updates lastExportDate
 */
export async function exportDataAsJson() {
  const data = await Storage.getAllData();
  const today = getTodayKolkata();
  await Storage.updateSettings({ lastExportDate: today });

  const jsonString = JSON.stringify(data, null, 2);
  const fileName = `pocket-wallet-backup-${today}.json`;
  downloadFile(jsonString, fileName, 'application/json');
  return data;
}

/**
 * Exports all expenses, ipos, and topups as a clean unified CSV
 */
export async function exportDataAsCsv() {
  const { expenses, ipos, topups } = await Storage.getAllData();
  const today = getTodayKolkata();
  await Storage.updateSettings({ lastExportDate: today });

  const rows = [];
  // Header
  rows.push(['Record Type', 'ID', 'Date', 'Amount / Profit (INR)', 'Category / Company / Type', 'Note / Label']);

  // Expenses
  expenses.forEach((e) => {
    rows.push([
      'Expense',
      e.id,
      e.date,
      e.amount,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${(e.note || '').replace(/"/g, '""')}"`
    ]);
  });

  // Top-ups
  topups.forEach((t) => {
    rows.push([
      'Top-up',
      t.id,
      t.date,
      t.amount,
      t.type,
      `"${(t.label || '').replace(/"/g, '""')}"`
    ]);
  });

  // IPOs
  ipos.forEach((i) => {
    rows.push([
      'IPO',
      i.id,
      i.date,
      i.profit,
      `"${(i.company || '').replace(/"/g, '""')}"`,
      ''
    ]);
  });

  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const fileName = `pocket-wallet-data-${today}.csv`;
  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  return true;
}

/**
 * Parses and validates an uploaded JSON backup file
 */
export function parseAndValidateBackup(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected'));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text || typeof text !== 'string') {
          return reject(new Error('Empty file'));
        }
        const data = JSON.parse(text);

        if (!data || typeof data !== 'object') {
          return reject(new Error('Invalid backup format: root must be an object'));
        }

        const expensesCount = Array.isArray(data.expenses) ? data.expenses.length : 0;
        const iposCount = Array.isArray(data.ipos) ? data.ipos.length : 0;
        const topupsCount = Array.isArray(data.topups) ? data.topups.length : 0;
        const target = data.settings?.target || 10000;

        resolve({
          isValid: true,
          data,
          summary: {
            expensesCount,
            iposCount,
            topupsCount,
            target,
            exportedAt: data.exportedAt || 'Unknown'
          }
        });
      } catch (err) {
        reject(new Error('Failed to parse JSON file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}
