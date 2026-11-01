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
      <div className="p-3 text-center text-xs font-mono text-[#737373] bg-[#141414] border border-[#222222] rounded-md">
        No chart available for <span className="text-white font-medium">{chordName}</span>
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
    <div className="flex flex-col items-center bg-[#171717] text-white border border-[#2a2a2a] p-3 rounded-lg shadow-xl select-none">
      <div className="text-sm font-semibold text-white tracking-wide mb-1">
        {chord.name}
      </div>

      <svg width={width} height={height} className="overflow-visible">
        {/* Fretboard bed */}
        <rect
          x={marginX - 2}
          y={marginTop}
          width={width - marginX * 2 + 4}
          height={numFrets * fretSpacing}
          fill="#121212"
          rx={2}
        />

        {/* Top nut or base fret indicator */}
        {baseFret === 1 ? (
          <line
            x1={marginX - 2}
            y1={marginTop}
            x2={width - marginX + 2}
            y2={marginTop}
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : (
          <text
            x={marginX - 12}
            y={marginTop + fretSpacing / 2 + 4}
            fill="#888888"
            fontSize="10"
            fontFamily="monospace"
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
            stroke="#2e2e2e"
            strokeWidth={i === 0 && baseFret === 1 ? 0 : 1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={marginX + i * stringSpacing}
            y1={marginTop}
            x2={marginX + i * stringSpacing}
            y2={marginTop + numFrets * fretSpacing}
            stroke="#525252"
            strokeWidth={1.8 - i * 0.15}
          />
        ))}

        {/* Barre if present */}
        {chord.barre && (
          <rect
            x={marginX + chord.barre.fromString * stringSpacing - 5}
            y={marginTop + (chord.barre.fret - (baseFret - 1) - 0.5) * fretSpacing - 5}
            width={(chord.barre.toString - chord.barre.fromString) * stringSpacing + 10}
            height={10}
            rx={5}
            fill="#f59e0b"
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
                fill="#737373"
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="bold"
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
                r={3.5}
                stroke="#10b981"
                strokeWidth={1.5}
                fill="none"
              />
            );
          }

          const relativeFret = fretVal - (baseFret - 1);
          const y = marginTop + (relativeFret - 0.5) * fretSpacing;
          const fingerNum = chord.fingers ? chord.fingers[strIdx] : undefined;

          return (
            <g key={`dot-${strIdx}`}>
              <circle
                cx={x}
                cy={y}
                r={isSm ? 5.5 : 7}
                fill="#f59e0b"
              />
              {fingerNum && fingerNum > 0 && (
                <text
                  x={x}
                  y={y + 3}
                  fill="#000000"
                  fontSize={isSm ? '8' : '9'}
                  fontFamily="monospace"
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

      {/* String Tuning Footer */}
      <div className="text-[10px] font-mono text-[#737373] mt-1 flex justify-between w-full px-2">
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
