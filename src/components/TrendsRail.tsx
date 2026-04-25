import type { Trend, VisibilityGap } from '../types';

export function TrendsRail({
  trends,
  gaps,
  onTopicClick,
}: {
  trends: Trend[];
  gaps: VisibilityGap[];
  onTopicClick: (topicId: string) => void;
}) {
  return (
    <aside className="peec-card p-4 sticky top-[72px]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="t-h3">This week's trends</h2>
      </div>
      <p className="t-caption mb-3" style={{ color: 'var(--peec-fg-tertiary)' }}>
        Trends Agent · scored against your Peec gaps
      </p>

      <div className="flex flex-col gap-3">
        {trends.map((t) => {
          const gap = gaps.find((g) => g.topicId === t.relatedTopicId);
          return (
            <button
              key={t.id}
              onClick={() => onTopicClick(t.relatedTopicId)}
              className="text-left rounded-[10px] p-3 transition-colors"
              style={{
                background: 'var(--peec-surface-secondary)',
                border: '1px solid var(--peec-stroke-primary)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="t-caption px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--peec-bg-tertiary)',
                    color: 'var(--peec-fg-secondary)',
                  }}
                >
                  {t.surface}
                </span>
                {gap && (
                  <span
                    className="t-caption px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--peec-badge-rose-bg)',
                      color: 'var(--peec-badge-rose-text)',
                    }}
                  >
                    {gap.topicName} {Math.round(gap.visibility)}%
                  </span>
                )}
              </div>
              <h3 className="t-body-m mb-1">{t.title}</h3>
              <p className="t-body-s" style={{ color: 'var(--peec-fg-secondary)' }}>
                {t.description}
              </p>
              <p
                className="t-caption mt-2"
                style={{ color: 'var(--peec-feature-2-base)' }}
              >
                Engaging this week → ~+{t.expectedLiftPp}pp on{' '}
                {gap?.topicName ?? 'this topic'}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
