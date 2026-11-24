import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Laptop,
  Upload,
  X,
} from 'lucide-react';
import { ModConfig, TaskItem, TodoList, WorkspaceBackup } from '../types';
import {
  createBackupPayload,
  exportListsAsCsv,
  exportListsAsMarkdown,
  parseWorkspaceBackup,
} from '../utils/tasks';

interface InstallExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstallApp: () => Promise<boolean>;
  lists: TodoList[];
  tasks: TaskItem[];
  modConfig: ModConfig;
  onRestoreBackup: (backup: WorkspaceBackup) => void;
}

export const InstallExportModal: React.FC<InstallExportModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  onInstallApp,
  lists,
  tasks,
  modConfig,
  onRestoreBackup,
}) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage(`Downloaded ${filename} to your device.`);
    setErrorMessage('');
  };

  const handleDownloadJson = () => {
    const payload = createBackupPayload(lists, tasks, modConfig);
    triggerDownload(
      JSON.stringify(payload, null, 2),
      `questlist-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  const handleDownloadMarkdown = () => {
    const md = exportListsAsMarkdown(lists, tasks);
    triggerDownload(
      md,
      `questlist-checklists-${new Date().toISOString().slice(0, 10)}.md`,
      'text/markdown'
    );
  };

  const handleDownloadCsv = () => {
    const csv = exportListsAsCsv(lists, tasks);
    triggerDownload(
      csv,
      `questlist-tasks-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv'
    );
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseWorkspaceBackup(String(reader.result));
      if (!parsed) {
        setErrorMessage('Invalid backup file. Please choose a QuestList JSON backup.');
        setStatusMessage('');
        return;
      }
      onRestoreBackup(parsed);
      setErrorMessage('');
      setStatusMessage(
        `Restored ${parsed.lists.length} lists and ${parsed.tasks.length} tasks.`
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-export-title"
    >
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-lg border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--mod-surface)',
          borderColor: 'var(--mod-border)',
          borderRadius: 'var(--mod-radius)',
          color: 'var(--mod-text)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--mod-border)' }}
        >
          <div>
            <h2 id="install-export-title" className="font-display text-base font-bold">
              Install App & Local Backups
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mod-text-muted)' }}>
              Run QuestList Studio offline on your laptop or download your lists anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install and backup dialog"
            className="rounded p-1.5 hover:opacity-80"
            style={{ color: 'var(--mod-text-muted)' }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Desktop / Laptop PWA Install Card */}
          <section
            className="border p-4 space-y-3"
            style={{
              borderRadius: 'var(--mod-radius-sm)',
              borderColor: 'var(--mod-border)',
              backgroundColor: 'var(--mod-surface-elevated)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Laptop
                  className="h-5 w-5 mt-0.5 shrink-0"
                  style={{ color: 'var(--mod-accent)' }}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-semibold">Install on Laptop / Desktop</h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--mod-text-muted)' }}>
                    {isInstalled
                      ? 'QuestList Studio is running as an installed standalone desktop application with offline cache.'
                      : isInstallable
                      ? 'Click below to install QuestList Studio as a standalone desktop app on your laptop with offline support.'
                      : isIOS
                      ? 'Tap Share in Safari and choose "Add to Home Screen" to install.'
                      : 'In Chrome, Edge, Opera, or Brave, click the Install icon in the right side of the address bar (or browser menu -> Save and Share -> Install page as app).'}
                  </p>
                </div>
              </div>
            </div>

            {isInstalled ? (
              <div
                className="inline-flex items-center gap-2 text-xs font-medium"
                style={{ color: 'var(--mod-accent)' }}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Installed & Offline Ready
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={async () => {
                  const accepted = await onInstallApp();
                  if (accepted) {
                    setStatusMessage('QuestList Studio installed to your device.');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold whitespace-nowrap"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  backgroundColor: 'var(--mod-accent)',
                  color: 'var(--mod-accent-fg)',
                }}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Install Desktop App Now
              </button>
            ) : null}
          </section>

          {/* Local File Exports */}
          <section className="space-y-2.5">
            <h3
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--mod-text-muted)' }}
            >
              Download Lists to Laptop
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex flex-col items-start gap-1 border p-3 text-left transition-colors hover:opacity-90"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                }}
              >
                <Download className="h-4 w-4" style={{ color: 'var(--mod-accent)' }} aria-hidden="true" />
                <span className="text-xs font-semibold">Full Backup (.json)</span>
                <span className="text-xs" style={{ color: 'var(--mod-text-muted)' }}>
                  Lists, tasks & mods
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="flex flex-col items-start gap-1 border p-3 text-left transition-colors hover:opacity-90"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                }}
              >
                <FileText className="h-4 w-4" style={{ color: 'var(--mod-accent)' }} aria-hidden="true" />
                <span className="text-xs font-semibold">Checklist (.md)</span>
                <span className="text-xs" style={{ color: 'var(--mod-text-muted)' }}>
                  Readable Markdown
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="flex flex-col items-start gap-1 border p-3 text-left transition-colors hover:opacity-90"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                }}
              >
                <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--mod-accent)' }} aria-hidden="true" />
                <span className="text-xs font-semibold">Spreadsheet (.csv)</span>
                <span className="text-xs" style={{ color: 'var(--mod-text-muted)' }}>
                  Excel / Sheets ready
                </span>
              </button>
            </div>
          </section>

          {/* Restore Backup */}
          <section
            className="flex items-center justify-between gap-3 border-t pt-4"
            style={{ borderColor: 'var(--mod-border)' }}
          >
            <div>
              <div className="text-xs font-semibold">Restore from Backup</div>
              <div className="text-xs" style={{ color: 'var(--mod-text-muted)' }}>
                Import a previously downloaded JSON workspace file.
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0"
              style={{
                borderRadius: 'var(--mod-radius-sm)',
                borderColor: 'var(--mod-border)',
              }}
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </section>

          {statusMessage && (
            <p className="text-xs font-medium" style={{ color: 'var(--mod-accent)' }}>
              {statusMessage}
            </p>
          )}
          {errorMessage && (
            <p className="text-xs font-medium text-red-400">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};
