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
      <div className="p-3 text-center text-xs font-mono text-[#8c8070] bg-[#1a1714] border border-[#383129] rounded-lg">
        No chart indexed for <span className="font-bold text-amber-500">{chordName}</span>
      </div>
    );
  }

  // Dimensions
  const isSm = size === 'sm';
  const width = isSm ? 130 : 170;
  const height = isSm ? 160 : 210;
  const numStrings = 6;
  const numFrets = 4;
  const marginX = isSm ? 22 : 28;
  const marginTop = isSm ? 34 : 44;
  const stringSpacing = (width - marginX * 2) / (numStrings - 1);
  const fretSpacing = (height - marginTop - 22) / numFrets;

  const baseFret = chord.baseFret || 1;

  return (
    <div className="flex flex-col items-center bg-[#fdfbf7] text-[#1c1814] border-2 border-[#d6cbba] p-3.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.7)] select-none">
      {/* Lithograph Header */}
      <div className="text-base font-serif font-black text-[#1c1814] tracking-tight mb-1">
        {chord.name}
      </div>

      <svg width={width} height={height} className="overflow-visible">
        {/* Fretboard background vellum */}
        <rect
          x={marginX - 4}
          y={marginTop}
          width={width - marginX * 2 + 8}
          height={numFrets * fretSpacing}
          fill="#f7f2e7"
          rx={2}
        />

        {/* Top bone nut or starting fret number */}
        {baseFret === 1 ? (
          <line
            x1={marginX - 2}
            y1={marginTop}
            x2={width - marginX + 2}
            y2={marginTop}
            stroke="#26201a"
            strokeWidth="5"
            strokeLinecap="square"
          />
        ) : (
          <text
            x={marginX - 14}
            y={marginTop + fretSpacing / 2 + 5}
            fill="#54493d"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            {baseFret}fr
          </text>
        )}

        {/* Nickel Fret Lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={marginX}
            y1={marginTop + i * fretSpacing}
            x2={width - marginX}
            y2={marginTop + i * fretSpacing}
            stroke="#8c7e6c"
            strokeWidth={i === 0 && baseFret === 1 ? 0 : 1.5}
          />
        ))}

        {/* Bronze Guitar Strings (gauged: low E thickest) */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={marginX + i * stringSpacing}
            y1={marginTop}
            x2={marginX + i * stringSpacing}
            y2={marginTop + numFrets * fretSpacing}
            stroke={i < 3 ? '#5c4e3f' : '#8c7d6c'}
            strokeWidth={2.6 - i * 0.28}
          />
        ))}

        {/* Barre if present */}
        {chord.barre && (
          <rect
            x={marginX + chord.barre.fromString * stringSpacing - 6}
            y={marginTop + (chord.barre.fret - (baseFret - 1) - 0.5) * fretSpacing - 7}
            width={(chord.barre.toString - chord.barre.fromString) * stringSpacing + 12}
            height={14}
            rx={7}
            fill="#b45309"
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
                fill="#b91c1c"
                fontSize="12"
                fontFamily="sans-serif"
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
                r={4.5}
                stroke="#15803d"
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
              <circle
                cx={x}
                cy={y}
                r={isSm ? 6.5 : 8.5}
                fill="#1c1814"
                stroke="#d97706"
                strokeWidth={1.5}
              />
              {fingerNum && fingerNum > 0 && (
                <text
                  x={x}
                  y={y + 3.5}
                  fill="#fdfbf7"
                  fontSize={isSm ? '9' : '10'}
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
      <div className="text-[10px] font-mono font-bold text-[#695d4e] mt-1.5 flex justify-between w-full px-2 border-t border-[#e2d8c5] pt-1">
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
