import React, { useState } from 'react';
import { useWalletData } from './hooks/useWalletData.js';
import { usePwa } from './hooks/usePwa.js';
import { exportDataAsJson } from './utils/exportImport.js';

import BottomNav from './components/BottomNav.jsx';
import PwaUpdatePrompt from './components/PwaUpdatePrompt.jsx';
import OpeningBalanceModal from './components/OpeningBalanceModal.jsx';
import AddExpenseModal from './components/AddExpenseModal.jsx';

import TodayPage from './pages/TodayPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import IpoPage from './pages/IpoPage.jsx';
import SettingsModal from './pages/SettingsModal.jsx';

import './App.css';

export default function App() {
  const walletData = useWalletData();
  const {
    loading,
    isFirstLaunch,
    settings,
    expenses,
    ipos,
    topups,
    addExpense,
    updateExpense,
    deleteExpense,
    addIpo,
    updateIpo,
    deleteIpo,
    updateSettings,
    completeOpeningBalance,
    refreshData
  } = walletData;

  const { needRefresh, updateServiceWorker, canInstall, promptInstall } = usePwa();

  const [activeTab, setActiveTab] = useState('today');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Quick export handler (used from backup reminder banner or settings)
  const handleQuickExport = async () => {
    try {
      await exportDataAsJson();
      refreshData();
    } catch (err) {
      console.error('Quick export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="mobile-viewport app-loading-screen">
        <div className="loading-spinner-box">
          <div className="loading-wallet-icon">₹</div>
          <span className="loading-text">Opening your pocket wallet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-viewport">
      {/* PWA Service Worker Update Prompt */}
      <PwaUpdatePrompt needRefresh={needRefresh} onUpdate={updateServiceWorker} />

      {/* Main Page Content */}
      <main className="page-content">
        {activeTab === 'today' && (
          <TodayPage
            walletData={walletData}
            onOpenSettings={() => setShowSettings(true)}
            onQuickExport={handleQuickExport}
            onOpenAddExpense={() => setShowAddExpense(true)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsPage
            expenses={expenses}
            ipos={ipos}
            topups={topups}
            settings={settings}
            todayStr={walletData.todayStr}
            onUpdateExpense={async (id, fields) => {
              await updateExpense(id, fields);
              refreshData();
            }}
            onDeleteExpense={async (id) => {
              await deleteExpense(id);
              refreshData();
            }}
          />
        )}

        {activeTab === 'ipo' && (
          <IpoPage
            ipos={ipos}
            onAddIpo={async (item) => {
              await addIpo(item);
              refreshData();
            }}
            onUpdateIpo={async (id, fields) => {
              await updateIpo(id, fields);
              refreshData();
            }}
            onDeleteIpo={async (id) => {
              await deleteIpo(id);
              refreshData();
            }}
            todayStr={walletData.todayStr}
          />
        )}
      </main>

      {/* Bottom Navigation: Today, Reports, IPO */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Add Expense Modal Popup */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onAddExpense={async (item) => {
          await addExpense(item);
          refreshData();
        }}
        todayStr={walletData.todayStr}
      />

      {/* First Launch Modal (Asking for Opening Balance) */}
      <OpeningBalanceModal
        isOpen={isFirstLaunch}
        defaultTarget={settings.target || 10000}
        onComplete={completeOpeningBalance}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        expensesCount={expenses.length}
        iposCount={ipos.length}
        topupsCount={topups.length}
        onDataRestored={refreshData}
        canInstall={canInstall}
        onInstallPwa={promptInstall}
      />
    </div>
  );
}
