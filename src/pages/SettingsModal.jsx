import React, { useState, useRef } from 'react';
import {
  X,
  Target,
  Download,
  FileSpreadsheet,
  Upload,
  Trash2,
  HardDrive,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { formatINR } from '../utils/calc.js';
import {
  exportDataAsJson,
  exportDataAsCsv,
  parseAndValidateBackup
} from '../utils/exportImport.js';
import { Storage } from '../storage/storage.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';
import './SettingsModal.css';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  expensesCount = 0,
  iposCount = 0,
  topupsCount = 0,
  onDataRestored,
  canInstall = false,
  onInstallPwa
}) {
  const [targetInput, setTargetInput] = useState(String(settings.target || 10000));
  const [toastMessage, setToastMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Import State
  const fileInputRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // Clear State (Double confirmation)
  const [showClearFirstConfirm, setShowClearFirstConfirm] = useState(false);
  const [showClearSecondConfirm, setShowClearSecondConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveTarget = (e) => {
    e.preventDefault();
    const num = parseFloat(targetInput);
    if (!isNaN(num) && num > 0) {
      onUpdateSettings({ target: num });
      setToastMessage(`Target updated to ${formatINR(num)}`);
    }
  };

  const handleExportJson = async () => {
    try {
      setIsExporting(true);
      await exportDataAsJson();
      setToastMessage('JSON backup downloaded successfully!');
    } catch (err) {
      console.error(err);
      setToastMessage('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await exportDataAsCsv();
      setToastMessage('CSV export downloaded successfully!');
    } catch (err) {
      console.error(err);
      setToastMessage('CSV Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseAndValidateBackup(file);
      setPendingImport(result);
      setShowImportConfirm(true);
    } catch (err) {
      setToastMessage('Invalid backup file: ' + err.message);
    } finally {
      // Reset input value so re-selecting same file triggers change
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmRestore = async () => {
    if (!pendingImport) return;
    try {
      await Storage.restoreAllData(pendingImport.data);
      setShowImportConfirm(false);
      setPendingImport(null);
      setToastMessage('Data restored successfully!');
      if (onDataRestored) onDataRestored();
    } catch (err) {
      setToastMessage('Restore failed: ' + err.message);
    }
  };

  const handleConfirmClearFirst = () => {
    setShowClearFirstConfirm(false);
    setShowClearSecondConfirm(true);
  };

  const handleConfirmClearFinal = async () => {
    await Storage.clearAllData();
    setShowClearSecondConfirm(false);
    setToastMessage('All data cleared. Pocket Wallet is fresh.');
    if (onDataRestored) onDataRestored();
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="bottom-sheet settings-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-drag-handle" />

          <div className="settings-header">
            <h2 className="settings-title">Settings & Data</h2>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={onClose}
              aria-label="Close Settings"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="settings-content">
            {/* Target Amount Setting */}
            <section className="settings-section paper-card">
              <div className="setting-title-row">
                <Target size={16} className="setting-icon" />
                <h3 className="setting-section-title">Monthly Target Amount</h3>
              </div>
              <p className="setting-desc">
                Default refill target: currently {formatINR(settings.target || 10000)}.
              </p>

              <form onSubmit={handleSaveTarget} className="target-setting-form">
                <div className="amount-input-box target-setting-box">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="input-field amount-field target-input"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary target-save-btn">
                  Update
                </button>
              </form>
            </section>

            {/* Backup & Export Section */}
            <section className="settings-section paper-card">
              <div className="setting-title-row">
                <ShieldCheck size={16} className="setting-icon" />
                <h3 className="setting-section-title">Backup & Export</h3>
              </div>
              <p className="setting-desc">
                Keep your records safe. You can export as a JSON file or CSV spreadsheet anytime.
              </p>

              <div className="export-btn-group">
                <button
                  type="button"
                  className="btn btn-secondary export-btn"
                  onClick={handleExportJson}
                  disabled={isExporting}
                >
                  <Download size={16} /> Export JSON Backup
                </button>

                <button
                  type="button"
                  className="btn btn-secondary export-btn"
                  onClick={handleExportCsv}
                  disabled={isExporting}
                >
                  <FileSpreadsheet size={16} /> Export CSV Spreadsheet
                </button>
              </div>

              {settings.lastExportDate && (
                <span className="last-export-text">
                  Last backup: {settings.lastExportDate}
                </span>
              )}
            </section>

            {/* Restore from JSON backup */}
            <section className="settings-section paper-card">
              <div className="setting-title-row">
                <Upload size={16} className="setting-icon" />
                <h3 className="setting-section-title">Restore from Backup</h3>
              </div>
              <p className="setting-desc">
                Select a previously saved Pocket Wallet JSON backup to restore your data.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              <button
                type="button"
                className="btn btn-secondary upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} /> Select Backup File (.json)
              </button>
            </section>

            {/* PWA Home Screen Install if supported */}
            {canInstall && (
              <section className="settings-section paper-card">
                <div className="setting-title-row">
                  <Smartphone size={16} className="setting-icon" />
                  <h3 className="setting-section-title">Install to Home Screen</h3>
                </div>
                <p className="setting-desc">
                  Install Pocket Wallet as a standalone mobile app for instant offline access.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onInstallPwa}
                >
                  Add to Phone Home Screen
                </button>
              </section>
            )}

            {/* Local Storage Stats */}
            <section className="settings-section paper-card storage-stats-card">
              <div className="setting-title-row">
                <HardDrive size={16} className="setting-icon" />
                <h3 className="setting-section-title">Local Data Records</h3>
              </div>
              <div className="storage-counts">
                <span className="count-pill">{expensesCount} expenses</span>
                <span className="count-pill">{iposCount} IPO entries</span>
                <span className="count-pill">{topupsCount} top-ups</span>
              </div>
              <span className="offline-note">
                ✓ Stored 100% in local device storage. Works completely offline.
              </span>
            </section>

            {/* Danger Zone: Clear Data */}
            <section className="settings-section paper-card danger-zone-card">
              <div className="setting-title-row">
                <Trash2 size={16} className="danger-icon" />
                <h3 className="setting-section-title danger-text">Clear All Data</h3>
              </div>
              <p className="setting-desc">
                Permanently deletes all expenses, IPO results, and top-ups from this device.
              </p>
              <button
                type="button"
                className="btn btn-danger clear-data-btn"
                onClick={() => setShowClearFirstConfirm(true)}
              >
                Clear All Data
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Confirmation for Backup Restore */}
      <ConfirmModal
        isOpen={showImportConfirm}
        title="Restore Data from Backup?"
        message={
          pendingImport
            ? `Found ${pendingImport.summary.expensesCount} expenses, ${pendingImport.summary.iposCount} IPOs, and ${pendingImport.summary.topupsCount} top-ups. Restoring will overwrite current local records.`
            : ''
        }
        confirmText="Confirm & Restore"
        isDanger={true}
        onConfirm={handleConfirmRestore}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImport(null);
        }}
      />

      {/* Double Confirmation 1 for Clear Data */}
      <ConfirmModal
        isOpen={showClearFirstConfirm}
        title="Delete all data?"
        message="This will wipe all your tracked expenses, IPO history, and wallet top-ups. This cannot be undone."
        confirmText="Proceed to Erase"
        isDanger={true}
        onConfirm={handleConfirmClearFirst}
        onCancel={() => setShowClearFirstConfirm(false)}
      />

      {/* Double Confirmation 2 for Clear Data */}
      <ConfirmModal
        isOpen={showClearSecondConfirm}
        title="Final Confirmation"
        message="Are you absolutely sure you want to permanently delete everything and reset Pocket Wallet to factory default?"
        confirmText="Yes, Permanently Delete All"
        isDanger={true}
        onConfirm={handleConfirmClearFinal}
        onCancel={() => setShowClearSecondConfirm(false)}
      />

      <Toast
        message={toastMessage}
        type="success"
        onClose={() => setToastMessage('')}
      />
    </>
  );
}
