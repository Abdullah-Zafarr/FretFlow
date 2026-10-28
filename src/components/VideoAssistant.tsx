import React, { useState } from 'react';
import { Video, ExternalLink, Edit2, Check, X } from 'lucide-react';

interface VideoAssistantProps {
  videoUrl?: string;
  onUpdateUrl?: (url: string) => void;
}

export const VideoAssistant: React.FC<VideoAssistantProps> = ({ videoUrl, onUpdateUrl }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(videoUrl || '');

  // Extract YouTube ID if valid
  const getEmbedUrl = (url?: string): string | null => {
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

  const embedSrc = getEmbedUrl(videoUrl);

  const handleSave = () => {
    if (onUpdateUrl) {
      onUpdateUrl(urlInput.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-xs uppercase tracking-wider text-slate-300">Video Assistant</span>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {isEditing && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste YouTube or lesson video URL..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleSave}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white"
            title="Save URL"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {embedSrc ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedSrc}
            title="Practice Lesson Video"
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Video className="w-8 h-8 text-slate-700" />
          <p>No video linked to this exercise yet.</p>
          {onUpdateUrl && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
            >
              + Link a YouTube video
            </button>
          )}
        </div>
      )}
    </div>
  );
};
