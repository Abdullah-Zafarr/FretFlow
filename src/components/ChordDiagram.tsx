import React from 'react';
import type { ChordDefinition } from '../types/practice';
import { CHORD_DICTIONARY } from '../data/chordData';

interface ChordDiagramProps {
  chordName: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({ chordName, size = 'md' }) => {
  const chord: ChordDefinition | undefined = CHORD_DICTIONARY[chordName];

  if (!chord) {
    return (
      <div className="p-3 text-center text-xs text-slate-400">
        No diagram available for <span className="font-bold text-amber-400">{chordName}</span>
      </div>
    );
  }

  // Dimensions
  const isSm = size === 'sm';
  const width = isSm ? 120 : 160;
  const height = isSm ? 150 : 200;
  const numStrings = 6;
  const numFrets = 4;
  const marginX = isSm ? 20 : 26;
  const marginTop = isSm ? 32 : 42;
  const stringSpacing = (width - marginX * 2) / (numStrings - 1);
  const fretSpacing = (height - marginTop - 20) / numFrets;

  const baseFret = chord.baseFret || 1;

  return (
    <div className="flex flex-col items-center bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md">
      <div className="text-sm font-bold text-amber-400 mb-1 tracking-wide">{chord.name}</div>
      <svg width={width} height={height} className="overflow-visible">
        {/* Top nut or base fret indicator */}
        {baseFret === 1 ? (
          <line
            x1={marginX - 2}
            y1={marginTop}
            x2={width - marginX + 2}
            y2={marginTop}
            stroke="#f59e0b"
            strokeWidth="5"
            strokeLinecap="round"
          />
        ) : (
          <text
            x={marginX - 14}
            y={marginTop + fretSpacing / 2 + 5}
            fill="#94a3b8"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
          >
            {baseFret}fr
          </text>
        )}

        {/* Fret lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={marginX}
            y1={marginTop + i * fretSpacing}
            x2={width - marginX}
            y2={marginTop + i * fretSpacing}
            stroke="#475569"
            strokeWidth={i === 0 && baseFret === 1 ? 0 : 1.5}
          />
        ))}

        {/* String lines (low E on left, high e on right) */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={marginX + i * stringSpacing}
            y1={marginTop}
            x2={marginX + i * stringSpacing}
            y2={marginTop + numFrets * fretSpacing}
            stroke={i < 3 ? '#94a3b8' : '#cbd5e1'}
            strokeWidth={2.5 - i * 0.25}
          />
        ))}

        {/* Barre if present */}
        {chord.barre && (
          <rect
            x={marginX + chord.barre.fromString * stringSpacing - 6}
            y={marginTop + (chord.barre.fret - (baseFret - 1) - 0.5) * fretSpacing - 6}
            width={(chord.barre.toString - chord.barre.fromString) * stringSpacing + 12}
            height={12}
            rx={6}
            fill="#f59e0b"
            opacity={0.85}
          />
        )}

        {/* Open (O), Muted (X), or Fret dots */}
        {chord.frets.map((fretVal, strIdx) => {
          const x = marginX + strIdx * stringSpacing;

          if (fretVal === 'x') {
            return (
              <text
                key={`mute-${strIdx}`}
                x={x}
                y={marginTop - 8}
                fill="#ef4444"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
              >
                ✕
              </text>
            );
          }

          if (fretVal === 0) {
            return (
              <circle
                key={`open-${strIdx}`}
                cx={x}
                cy={marginTop - 11}
                r={4}
                stroke="#10b981"
                strokeWidth={2}
                fill="none"
              />
            );
          }

          // Fret position (relative to baseFret)
          const relativeFret = fretVal - (baseFret - 1);
          const y = marginTop + (relativeFret - 0.5) * fretSpacing;
          const fingerNum = chord.fingers ? chord.fingers[strIdx] : undefined;

          return (
            <g key={`dot-${strIdx}`}>
              <circle cx={x} cy={y} r={isSm ? 6 : 8} fill="#f59e0b" />
              {fingerNum && fingerNum > 0 && (
                <text
                  x={x}
                  y={y + 3.5}
                  fill="#0f172a"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {fingerNum}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="text-[10px] text-slate-400 mt-1 flex justify-between w-full px-2">
        <span>E</span>
        <span>A</span>
        <span>D</span>
        <span>G</span>
        <span>B</span>
        <span>e</span>
      </div>
    </div>
  );
};
