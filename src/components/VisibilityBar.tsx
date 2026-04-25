import type { VisibilityGap } from '../types';
import type { PeecBrandReportRow } from '../services/peec';

export function VisibilityBar({
  brand,
  overall,
  gaps,
  activeTopicId,
  onSelect,
}: {
  brand: string;
  overall: PeecBrandReportRow[];
  gaps: VisibilityGap[];
  activeTopicId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const own = overall.find((b) => b.brand_name === brand);
  const top = [...overall].sort((a, b) => b.visibility - a.visibility)[0];

  return (
    <div className="peec-card p-4">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="t-h3">Visibility scoreboard</h2>
          <p className="t-body-s mt-1" style={{ color: 'var(--peec-fg-secondary)' }}>
            {own && top
              ? `${brand} sits at ${own.visibility.toFixed(0)}% AI search visibility — ${top.brand_name} leads at ${top.visibility.toFixed(0)}%.`
              : 'Loading scoreboard…'}
          </p>
        </div>
        <span className="t-caption" style={{ color: 'var(--peec-fg-tertiary)' }}>
          From Peec AI
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {activeTopicId && (
          <button
            className="peec-pill"
            onClick={() => onSelect(null)}
            style={{ background: 'var(--peec-bg-tertiary)', borderColor: 'transparent' }}
          >
            ✕ Clear filter
          </button>
        )}
        {gaps.map((g) => {
          const palette = colorForVisibility(g.visibility);
          const isActive = g.topicId === activeTopicId;
          return (
            <button
              key={g.topicId}
              className="peec-pill"
              onClick={() => onSelect(isActive ? null : g.topicId)}
              style={{
                background: palette.bg,
                color: palette.text,
                borderColor: isActive ? palette.text : 'transparent',
                borderWidth: isActive ? 1 : 1,
              }}
            >
              {g.topicName} {Math.round(g.visibility)}%
            </button>
          );
        })}
      </div>
    </div>
  );
}

function colorForVisibility(v: number): { bg: string; text: string } {
  if (v < 20) return { bg: 'var(--peec-badge-rose-bg)', text: 'var(--peec-badge-rose-text)' };
  if (v < 30) return { bg: 'var(--peec-badge-orange-bg)', text: 'var(--peec-badge-orange-text)' };
  if (v < 50) return { bg: 'var(--peec-badge-amber-bg)', text: 'var(--peec-badge-amber-text)' };
  return { bg: 'var(--peec-badge-green-bg)', text: 'var(--peec-badge-green-text)' };
}
