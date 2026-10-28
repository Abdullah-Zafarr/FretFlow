import React, { useState } from 'react';
import { Download, Upload, RotateCcw, X, Copy, Check, Settings } from 'lucide-react';
import { usePractice } from '../context/usePractice';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const {
    exportDataJson,
    importDataJson,
    resetToDefaultData,
    settings,
    updateSettings,
  } = usePractice();

  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = exportDataJson();
    setJsonText(json);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guitar-practice-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportText = () => {
    if (!jsonText.trim()) return;
    const success = importDataJson(jsonText);
    if (success) {
      setImportStatus('Data imported successfully!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } else {
      setImportStatus('Invalid JSON data format. Please check the text.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('File imported successfully!');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } else {
        setImportStatus('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data back to the default JustinGuitar Demo dataset? Any custom exercises will be overwritten.'
      )
    ) {
      resetToDefaultData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">App Settings &amp; Data Backup</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Settings */}
          <div className="space-y-3 pb-4 border-b border-slate-800">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Practice Preferences
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Timer Completion Alarm Sound</span>
              <select
                value={settings.alarmTone}
                onChange={(e) =>
                  updateSettings({
                    alarmTone: e.target.value as 'chime' | 'bell' | 'beep',
                  })
                }
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="chime">Guitar Chime Arpeggio</option>
                <option value="bell">Bright Bell</option>
                <option value="beep">Digital Beep</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Auto-Advance to Next Item</span>
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) => updateSettings({ autoAdvance: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Daily Goal (Minutes)</span>
              <input
                type="number"
                min="5"
                max="180"
                value={settings.dailyGoalMinutes}
                onChange={(e) =>
                  updateSettings({
                    dailyGoalMinutes: Math.max(5, parseInt(e.target.value) || 30),
                  })
                }
                className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Export / Import Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Backup &amp; Restore (JSON)
            </h4>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Backup JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                title="Download JSON file"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">
                Paste JSON or Upload File to Restore
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste backup JSON string here..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .json file</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleImportText}
                className="py-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Restore Data
              </button>
            </div>

            {importStatus && (
              <div
                className={`p-2.5 rounded-xl text-center font-semibold ${
                  importStatus.includes('successfully')
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                }`}
              >
                {importStatus}
              </div>
            )}
          </div>

          {/* Reset To Default */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 text-rose-300 font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to JustinGuitar Demo Dataset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
