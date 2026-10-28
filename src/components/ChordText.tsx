import React, { useState, useRef, useEffect } from 'react';
import { CHORD_DICTIONARY } from '../data/chordData';
import { ChordDiagram } from './ChordDiagram';

interface ChordTextProps {
  text: string;
  className?: string;
  chordClassName?: string;
}

export const ChordText: React.FC<ChordTextProps> = ({ text, className = '', chordClassName = '' }) => {
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Match chords and unicode arrows (using unicode escapes to be 100% encoding safe: \u2192 is ->, \u2194 is <->)
  const tokens = React.useMemo(() => {
    const pattern = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]|7|add9|m7|maj7)?)\b|(\u2194|\u2192|->|<->)/g;
    const parts: { text: string; isChord: boolean; isArrow: boolean }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          isChord: false,
          isArrow: false,
        });
      }

      if (match[2]) {
        parts.push({
          text: match[2],
          isChord: false,
          isArrow: true,
        });
      } else if (match[1]) {
        const chordCand = match[1];
        const isKnownChord = Boolean(CHORD_DICTIONARY[chordCand]);
        parts.push({
          text: chordCand,
          isChord: isKnownChord,
          isArrow: false,
        });
      }

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isChord: false,
        isArrow: false,
      });
    }

    return parts;
  }, [text]);

  const handleChordClick = (chord: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (activeChord === chord) {
      setActiveChord(null);
      setPopoverPos(null);
    } else {
      setActiveChord(chord);
      setPopoverPos({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      });
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveChord(null);
      setPopoverPos(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <span ref={containerRef} className={`inline ${className}`}>
      {tokens.map((token, idx) => {
        if (token.isChord) {
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleChordClick(token.text, e)}
              className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 text-xs md:text-sm font-semibold rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer ${chordClassName}`}
              title={`View ${token.text} chord diagram`}
            >
              {token.text}
            </button>
          );
        }

        if (token.isArrow) {
          return (
            <span
              key={idx}
              className="inline-block px-1 text-amber-500/80 font-bold select-none text-xs md:text-sm"
            >
              {token.text}
            </span>
          );
        }

        return <span key={idx}>{token.text}</span>;
      })}

      {activeChord && popoverPos && (
        <div
          className="fixed z-50 transform -translate-x-1/2 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${Math.min(Math.max(popoverPos.x, 90), window.innerWidth - 90)}px`,
            top: `${popoverPos.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ChordDiagram chordName={activeChord} />
        </div>
      )}
    </span>
  );
};
