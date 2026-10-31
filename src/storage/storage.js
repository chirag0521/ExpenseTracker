/**
 * Storage Abstraction Layer for Pocket Wallet.
 *
 * All persistent data operations go through this single module.
 * Wraps localStorage in try/catch with fallback handling.
 * Designed with Promise-based async API so it can be swapped for a REST/GraphQL API
 * (e.g. Node + Express + MongoDB) without rewriting any UI components!
 */

const STORAGE_KEYS = {
  EXPENSES: 'pw_expenses',
  IPOS: 'pw_ipos',
  TOPUPS: 'pw_topups',
  SETTINGS: 'pw_settings'
};

const DEFAULT_SETTINGS = {
  target: 10000,
  lastExportDate: null,
  dismissedRefillMonths: [],
  isInitialized: false
};

const STORAGE_CHANGE_EVENT = 'pocket_wallet_storage_change';

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  }
}

/**
 * Low-level safe reader
 */
function readJson(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Storage] Failed to read ${key}:`, err);
    return fallbackValue;
  }
}

/**
 * Low-level safe writer
 */
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyChange();
    return true;
  } catch (err) {
    console.error(`[Storage] Failed to write ${key}:`, err);
    return false;
  }
}

export const Storage = {
  /**
   * Listen for changes from anywhere in the app
   */
  subscribe(listener) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(STORAGE_CHANGE_EVENT, listener);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, listener);
  },

  // ----------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------
  async getSettings() {
    const data = readJson(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...data };
  },

  async updateSettings(partial) {
    const current = await this.getSettings();
    const updated = { ...current, ...partial };
    writeJson(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // ----------------------------------------------------
  // EXPENSES: { id, amount, category, note, date }
  // ----------------------------------------------------
  async getExpenses() {
    return readJson(STORAGE_KEYS.EXPENSES, []);
  },

  async addExpense(expense) {
    const list = await this.getExpenses();
    const item = {
      id: expense.id || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      amount: Number(expense.amount) || 0,
      category: expense.category || 'Other',
      note: (expense.note || '').trim(),
      date: expense.date
    };
    list.unshift(item); // Newest first
    writeJson(STORAGE_KEYS.EXPENSES, list);
    return item;
  },

  async updateExpense(id, updatedFields) {
    const list = await this.getExpenses();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updatedFields,
      amount: Number(updatedFields.amount !== undefined ? updatedFields.amount : list[index].amount)
    };
    writeJson(STORAGE_KEYS.EXPENSES, list);
    return list[index];
  },

  async deleteExpense(id) {
    const list = await this.getExpenses();
    const filtered = list.filter((e) => e.id !== id);
    writeJson(STORAGE_KEYS.EXPENSES, filtered);
    return true;
  },

  // ----------------------------------------------------
  // IPOS: { id, company, date, profit }
  // ----------------------------------------------------
  async getIpos() {
    return readJson(STORAGE_KEYS.IPOS, []);
  },

  async addIpo(ipo) {
    const list = await this.getIpos();
    const item = {
      id: ipo.id || `ipo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      company: (ipo.company || '').trim(),
      date: ipo.date,
      profit: Number(ipo.profit) || 0
    };
    list.unshift(item);
    writeJson(STORAGE_KEYS.IPOS, list);
    return item;
  },

  async updateIpo(id, updatedFields) {
    const list = await this.getIpos();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updatedFields,
      profit: Number(updatedFields.profit !== undefined ? updatedFields.profit : list[index].profit)
    };
    writeJson(STORAGE_KEYS.IPOS, list);
    return list[index];
  },

  async deleteIpo(id) {
    const list = await this.getIpos();
    const filtered = list.filter((i) => i.id !== id);
    writeJson(STORAGE_KEYS.IPOS, filtered);
    return true;
  },

  // ----------------------------------------------------
  // TOPUPS: { id, amount, label, date, type: "manual" | "refill" | "opening" }
  // ----------------------------------------------------
  async getTopups() {
    return readJson(STORAGE_KEYS.TOPUPS, []);
  },

  async addTopup(topup) {
    const list = await this.getTopups();
    const item = {
      id: topup.id || `top_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      amount: Number(topup.amount) || 0,
      label: (topup.label || '').trim(),
      date: topup.date,
      type: topup.type || 'manual' // manual | refill | opening
    };
    list.unshift(item);
    writeJson(STORAGE_KEYS.TOPUPS, list);
    return item;
  },

  async updateTopup(id, updatedFields) {
    const list = await this.getTopups();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updatedFields,
      amount: Number(updatedFields.amount !== undefined ? updatedFields.amount : list[index].amount)
    };
    writeJson(STORAGE_KEYS.TOPUPS, list);
    return list[index];
  },

  async deleteTopup(id) {
    const list = await this.getTopups();
    const filtered = list.filter((t) => t.id !== id);
    writeJson(STORAGE_KEYS.TOPUPS, filtered);
    return true;
  },

  // ----------------------------------------------------
  // BULK EXPORT / IMPORT / RESET
  // ----------------------------------------------------
  async getAllData() {
    const [settings, expenses, ipos, topups] = await Promise.all([
      this.getSettings(),
      this.getExpenses(),
      this.getIpos(),
      this.getTopups()
    ]);
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      expenses,
      ipos,
      topups
    };
  },

  async restoreAllData(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid backup file: not an object');
    }
    const { settings, expenses, ipos, topups } = payload;
    if (!Array.isArray(expenses) || !Array.isArray(ipos) || !Array.isArray(topups)) {
      throw new Error('Invalid backup format: missing expenses, ipos, or topups arrays');
    }

    writeJson(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...(settings || {}) });
    writeJson(STORAGE_KEYS.EXPENSES, expenses);
    writeJson(STORAGE_KEYS.IPOS, ipos);
    writeJson(STORAGE_KEYS.TOPUPS, topups);
    return true;
  },

  async clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.IPOS);
      localStorage.removeItem(STORAGE_KEYS.TOPUPS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      notifyChange();
      return true;
    } catch (err) {
      console.error('[Storage] Failed to clear data:', err);
      return false;
    }
  }
};
