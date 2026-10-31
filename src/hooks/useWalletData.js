import { useState, useEffect, useCallback, useMemo } from 'react';
import { Storage } from '../storage/storage.js';
import {
  calculateWalletBalance,
  getBalanceColorState,
  calculateSafeToSpendPerDay,
  calculateRefillStatus
} from '../utils/calc.js';
import { getTodayKolkata } from '../utils/date.js';

export function useWalletData() {
  const [expenses, setExpenses] = useState([]);
  const [ipos, setIpos] = useState([]);
  const [topups, setTopups] = useState([]);
  const [settings, setSettings] = useState({
    target: 10000,
    lastExportDate: null,
    dismissedRefillMonths: [],
    isInitialized: false
  });
  const [loading, setLoading] = useState(true);

  // Load all data from storage
  const loadData = useCallback(async () => {
    try {
      const [s, e, i, t] = await Promise.all([
        Storage.getSettings(),
        Storage.getExpenses(),
        Storage.getIpos(),
        Storage.getTopups()
      ]);
      setSettings(s);
      setExpenses(e);
      setIpos(i);
      setTopups(t);
    } catch (err) {
      console.error('[useWalletData] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Subscribe to any storage updates
    const unsubscribe = Storage.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const todayStr = useMemo(() => getTodayKolkata(), []);

  // Balance is always computed from the entries, never stored as a single number!
  const balance = useMemo(() => {
    return calculateWalletBalance(topups, ipos, expenses);
  }, [topups, ipos, expenses]);

  const balanceState = useMemo(() => {
    return getBalanceColorState(balance, settings.target);
  }, [balance, settings.target]);

  const safeToSpend = useMemo(() => {
    return calculateSafeToSpendPerDay(balance, todayStr);
  }, [balance, todayStr]);

  const refillStatus = useMemo(() => {
    return calculateRefillStatus(
      balance,
      settings.target,
      todayStr,
      topups,
      settings.dismissedRefillMonths
    );
  }, [balance, settings.target, todayStr, topups, settings.dismissedRefillMonths]);

  // First launch check: if not initialized and no opening topup exists
  const isFirstLaunch = useMemo(() => {
    if (loading) return false;
    const hasOpeningTopup = topups.some((t) => t.type === 'opening');
    return !settings.isInitialized && !hasOpeningTopup;
  }, [loading, settings.isInitialized, topups]);

  // Action methods
  const addExpense = useCallback(async (item) => {
    const created = await Storage.addExpense(item);
    return created;
  }, []);

  const updateExpense = useCallback(async (id, fields) => {
    const updated = await Storage.updateExpense(id, fields);
    return updated;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    const res = await Storage.deleteExpense(id);
    return res;
  }, []);

  const addIpo = useCallback(async (item) => {
    const created = await Storage.addIpo(item);
    return created;
  }, []);

  const updateIpo = useCallback(async (id, fields) => {
    const updated = await Storage.updateIpo(id, fields);
    return updated;
  }, []);

  const deleteIpo = useCallback(async (id) => {
    const res = await Storage.deleteIpo(id);
    return res;
  }, []);

  const addTopup = useCallback(async (item) => {
    const created = await Storage.addTopup(item);
    return created;
  }, []);

  const updateTopup = useCallback(async (id, fields) => {
    const updated = await Storage.updateTopup(id, fields);
    return updated;
  }, []);

  const deleteTopup = useCallback(async (id) => {
    const res = await Storage.deleteTopup(id);
    return res;
  }, []);

  const updateSettings = useCallback(async (partial) => {
    const updated = await Storage.updateSettings(partial);
    setSettings(updated);
    return updated;
  }, []);

  const dismissRefillMonth = useCallback(
    async (monthStr) => {
      const currentList = settings.dismissedRefillMonths || [];
      if (!currentList.includes(monthStr)) {
        await updateSettings({
          dismissedRefillMonths: [...currentList, monthStr]
        });
      }
    },
    [settings.dismissedRefillMonths, updateSettings]
  );

  const completeOpeningBalance = useCallback(
    async (amount) => {
      const num = Number(amount) || 0;
      await Storage.addTopup({
        amount: num,
        label: 'Opening balance',
        date: todayStr,
        type: 'opening'
      });
      await Storage.updateSettings({
        isInitialized: true
      });
    },
    [todayStr]
  );

  return {
    loading,
    expenses,
    ipos,
    topups,
    settings,
    balance,
    balanceState,
    safeToSpend,
    refillStatus,
    isFirstLaunch,
    todayStr,
    addExpense,
    updateExpense,
    deleteExpense,
    addIpo,
    updateIpo,
    deleteIpo,
    addTopup,
    updateTopup,
    deleteTopup,
    updateSettings,
    dismissRefillMonth,
    completeOpeningBalance,
    refreshData: loadData
  };
}
