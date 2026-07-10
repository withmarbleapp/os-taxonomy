import type { RagCounts, RagLevel } from '@shared/types';
import { ragLabel } from '@shared/mastery';

const LEVELS: RagLevel[] = ['red', 'amber', 'green'];

export function RagLegend({ counts }: { counts?: RagCounts }) {
  return (
    <div className="rag-legend" role="list" aria-label="Progress colours">
      {LEVELS.map((level) => (
        <div key={level} className={`rag-legend-item rag-${level}`} role="listitem">
          <span
            className={`rag-swatch ${level === 'red' ? 'hollow' : 'filled'}`}
            aria-hidden
          />
          <span>
            {ragLabel(level)}
            {counts ? ` · ${counts[level]}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RagTally({ counts }: { counts: RagCounts }) {
  return (
    <div className="rag-tally" aria-label="Concept progress summary">
      {LEVELS.map((level) => (
        <div key={level} className={`rag-tally-item rag-${level}`}>
          <strong>{counts[level]}</strong>
          <span>{ragLabel(level)}</span>
        </div>
      ))}
    </div>
  );
}
