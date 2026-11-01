import React, { useState } from 'react';
import { Download, Upload, RotateCcw, X, Copy, Check, Settings, Sliders } from 'lucide-react';
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
    a.download = `justinguitar-workbench-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportText = () => {
    soundEngine.playMechanicalClick('stomp');
    if (!jsonText.trim()) return;
    const success = importDataJson(jsonText);
    if (success) {
      setImportStatus('Studio workbench restored successfully!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } else {
      setImportStatus('Invalid JSON format. Check string syntax.');
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
        setImportStatus('Workbench restored from file!');
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
        'Reset workbench to JustinGuitar seed factory presets? Your custom routines and personal notes will be replaced.'
      )
    ) {
      resetToDefaultData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150 select-none">
      <div className="bg-[#1c1916] border-2 border-[#4f4233] rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="absolute top-2.5 left-2.5 screw-head" />
        <div className="absolute top-2.5 right-2.5 screw-head" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[#2d251d] bg-[#141210]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#f5f1ea] m-0">
              WORKBENCH CALIBRATION & ARCHIVAL
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playMechanicalClick('toggle');
              onClose();
            }}
            className="p-1 rounded text-[#8c8070] hover:text-[#f5f1ea] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Hardware & Audio Preferences */}
          <div className="space-y-3 pb-4 border-b border-[#2d251d]">
            <h4 className="font-mono font-bold text-amber-500 uppercase tracking-wider text-[10px] m-0">
              AUDIO & TELEMETRY CALIBRATION
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-[#d6cdbe] font-medium">Session Complete Tone</span>
              <select
                value={settings.alarmTone}
                onChange={(e) => {
                  soundEngine.playMechanicalClick('rotary');
                  updateSettings({
                    alarmTone: e.target.value as 'chime' | 'bell' | 'beep',
                  });
                }}
                className="bg-[#141210] border border-[#382f23] rounded px-2.5 py-1 text-[#f5f1ea] font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="chime">Guitar Chime Arpeggio</option>
                <option value="bell">Studio Bell</option>
                <option value="beep">Analog Beep</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#d6cdbe] font-medium">Auto-Advance Routine on Target Met</span>
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) => {
                  soundEngine.playMechanicalClick('toggle');
                  updateSettings({ autoAdvance: e.target.checked });
                }}
                className="rounded bg-[#141210] border-[#382f23] text-amber-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#d6cdbe] font-medium">Daily Target Benchmark (Minutes)</span>
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
                className="w-16 bg-[#141210] border border-[#382f23] rounded px-2 py-1 text-center font-mono font-bold text-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Export / Import Section */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-amber-500 uppercase tracking-wider text-[10px] m-0">
              ARCHIVAL BACKUP & RESTORE (JSON SOVEREIGNTY)
            </h4>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#241e17] hover:bg-[#2e261d] border border-[#382f23] text-[#f0ebe1] font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Backup JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#241e17] hover:bg-[#2e261d] border border-[#382f23] text-[#f0ebe1] font-mono text-xs font-bold transition-colors cursor-pointer"
                title="Download JSON file"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>Download</span>
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8c8070] mb-1">
                PASTE BACKUP STRING OR UPLOAD REEL FILE:
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste JSON workbench payload here..."
                rows={3}
                className="w-full bg-[#141210] border border-[#2d251d] rounded-lg p-2.5 font-mono text-[11px] text-[#f0ebe1] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#141210] border border-[#2d251d] hover:border-[#42372a] text-[#8c8070] font-mono text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
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
                className="py-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#141210] font-mono font-bold text-xs cursor-pointer"
              >
                Restore Payload
              </button>
            </div>

            {importStatus && (
              <div
                className={`p-2.5 rounded text-center font-mono text-xs font-bold ${
                  importStatus.includes('successfully') || importStatus.includes('restored')
                    ? 'bg-[#18271e] text-emerald-400 border border-[#234d31]'
                    : 'bg-[#291717] text-[#e07b7b] border border-[#4a2626]'
                }`}
              >
                {importStatus}
              </div>
            )}
          </div>

          {/* Factory Reset */}
          <div className="pt-3 border-t border-[#2d251d]">
            <button
              type="button"
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#241717] hover:bg-[#331717] border border-[#4a2626] text-[#e07b7b] font-mono font-bold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to JustinGuitar Factory Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
