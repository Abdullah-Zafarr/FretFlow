import React, { useState } from 'react';
import { Download, Upload, RotateCcw, X, Copy, Check, Settings } from 'lucide-react';
import { usePractice } from '../context/usePractice';
import { soundEngine } from '../utils/audio';

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
    soundEngine.playMechanicalClick('toggle');
    const json = exportDataJson();
    setJsonText(json);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    soundEngine.playMechanicalClick('stomp');
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guitar-practice-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportText = () => {
    soundEngine.playMechanicalClick('stomp');
    if (!jsonText.trim()) return;
    const success = importDataJson(jsonText);
    if (success) {
      setImportStatus('Data restored successfully!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } else {
      setImportStatus('Invalid JSON format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundEngine.playMechanicalClick('toggle');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('Data restored from file!');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } else {
        setImportStatus('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    soundEngine.playMechanicalClick('toggle');
    if (
      window.confirm(
        'Reset to default presets? Custom routines and notes will be replaced.'
      )
    ) {
      resetToDefaultData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#141414] border border-[#262626] rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-neutral-100 m-0">
              Settings & Archival
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              onClose();
            }}
            className="p-1 rounded text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Preferences */}
          <div className="space-y-3.5 pb-5 border-b border-[#222222]">
            <h4 className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider m-0">
              Practice Preferences
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Session Complete Sound</span>
              <select
                value={settings.alarmTone}
                onChange={(e) => {
                  soundEngine.playMechanicalClick('rotary');
                  updateSettings({
                    alarmTone: e.target.value as 'chime' | 'bell' | 'beep',
                  });
                }}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1 text-neutral-200 text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
              >
                <option value="chime">Guitar Chime</option>
                <option value="bell">Studio Bell</option>
                <option value="beep">Analog Beep</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Auto-Advance on Target Completion</span>
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) => {
                  soundEngine.playMechanicalClick('toggle');
                  updateSettings({ autoAdvance: e.target.checked });
                }}
                className="rounded bg-[#1a1a1a] border-[#2a2a2a] text-amber-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Daily Target (Minutes)</span>
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
                className="w-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-center font-mono text-neutral-100 focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          {/* Export / Import Section */}
          <div className="space-y-3.5">
            <h4 className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider m-0">
              Backup & Restore (JSON)
            </h4>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                title="Download JSON file"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                <span>Download</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1.5">
                Paste JSON data or upload file:
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste backup JSON here..."
                rows={3}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 font-mono text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222222] text-neutral-300 text-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-400" />
                <span>Upload .json</span>
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
                className="py-1.5 px-3.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 font-medium text-xs cursor-pointer transition-colors"
              >
                Restore
              </button>
            </div>

            {importStatus && (
              <div
                className={`p-2.5 rounded text-center text-xs font-medium ${
                  importStatus.includes('successfully') || importStatus.includes('restored')
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                    : 'bg-red-950/40 text-red-400 border border-red-800/40'
                }`}
              >
                {importStatus}
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="pt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1a1414] hover:bg-[#241717] border border-[#3b1d1d] text-red-400 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Factory Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
