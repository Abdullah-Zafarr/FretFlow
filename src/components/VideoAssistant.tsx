import React, { useState } from 'react';
import { Video, ExternalLink, Edit2, Check, X, EyeOff } from 'lucide-react';

interface VideoAssistantProps {
  videoUrl?: string;
  onUpdateUrl?: (url: string) => void;
  onToggleHide?: () => void;
}

// Extract YouTube ID if valid or fallback to URL
export const getEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?enablejsapi=1`;
    }
    if (url.startsWith('http')) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
};

export const VideoAssistant: React.FC<VideoAssistantProps> = ({ videoUrl, onUpdateUrl, onToggleHide }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(videoUrl || '');

  const embedSrc = getEmbedUrl(videoUrl);

  const handleSave = () => {
    if (onUpdateUrl) {
      onUpdateUrl(urlInput.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#222222] bg-[#121212]">
        <div className="flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-300">Video Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-amber-400 p-1"
              title="Open video in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {onUpdateUrl && (
            <button
              type="button"
              onClick={() => {
                setUrlInput(videoUrl || '');
                setIsEditing(!isEditing);
              }}
              className="text-slate-400 hover:text-amber-400 p-1"
              title="Change video URL"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleHide && (
            <button
              type="button"
              onClick={onToggleHide}
              className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer transition-colors"
              title="Hide video"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="p-2 bg-[#121212] border-b border-[#222222] flex items-center gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste YouTube or lesson video URL..."
            className="flex-1 bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleSave}
            className="p-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white"
            title="Save URL"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1 bg-[#222222] hover:bg-[#2a2a2a] rounded text-slate-400"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {embedSrc ? (
        <div className="relative aspect-video w-full max-h-[200px] sm:max-h-[220px] bg-black flex items-center justify-center">
          <iframe
            src={embedSrc}
            title="Practice Lesson Video"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5">
          <Video className="w-6 h-6 text-slate-600" />
          <p className="text-[11px] m-0">No video linked to this exercise yet.</p>
          {onUpdateUrl && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 text-xs"
            >
              + Link a YouTube video
            </button>
          )}
        </div>
      )}
    </div>
  );
};
