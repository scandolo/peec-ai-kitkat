import type { ConversationOpportunity } from '../types';

export function ConversationCard({
  opportunity,
  onOpen,
}: {
  opportunity: ConversationOpportunity;
  onOpen: () => void;
}) {
  return (
    <div className="peec-card p-4 hover:shadow-[var(--peec-shadow-sm)] transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={opportunity.platform} />
          <ConnectionBadge type={opportunity.connectionType} />
          <span
            className="t-caption"
            style={{ color: 'var(--peec-fg-tertiary)' }}
          >
            {opportunity.author} · {formatRelativeTime(opportunity.publishedAt)}
          </span>
        </div>
        <ScoreChip score={opportunity.relevanceScore} />
      </div>

      <h3 className="t-body-l mb-1">{opportunity.title}</h3>
      <p
        className="t-body-s mb-3 line-clamp-2"
        style={{ color: 'var(--peec-fg-secondary)' }}
      >
        {opportunity.content}
      </p>

      <div
        className="rounded-[8px] p-3 mb-3"
        style={{
          background: 'var(--peec-surface-secondary)',
          border: '1px solid var(--peec-stroke-soft, #1717170f)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span
            className="t-caption font-semibold uppercase"
            style={{
              color: 'var(--peec-feature-2-base)',
              letterSpacing: '0.4px',
            }}
          >
            Peec impact
          </span>
        </div>
        <p className="t-body-s" style={{ color: 'var(--peec-fg-primary)' }}>
          {opportunity.peecInsight}
        </p>
        <p
          className="t-caption mt-1"
          style={{ color: 'var(--peec-fg-secondary)' }}
        >
          Estimated lift: <strong style={{ color: 'var(--peec-feature-2-base)' }}>+{opportunity.estimatedVisibilityLift.toFixed(1)}pp</strong>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <a
          href={opportunity.url}
          target="_blank"
          rel="noreferrer"
          className="t-body-s underline-offset-4 hover:underline"
          style={{ color: 'var(--peec-fg-secondary)' }}
        >
          View original →
        </a>
        <button className="peec-btn peec-btn-primary" onClick={onOpen}>
          Open draft
        </button>
      </div>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: ConversationOpportunity['platform'] }) {
  const labels = { reddit: 'Reddit', linkedin: 'LinkedIn', x: 'X' } as const;
  const colors = {
    reddit: { bg: 'var(--peec-badge-orange-bg)', text: 'var(--peec-badge-orange-text)' },
    linkedin: { bg: 'var(--peec-badge-blue-bg)', text: 'var(--peec-badge-blue-text)' },
    x: { bg: 'var(--peec-bg-tertiary)', text: 'var(--peec-fg-primary)' },
  } as const;
  const c = colors[platform];
  return (
    <span
      className="peec-pill"
      style={{ background: c.bg, color: c.text, borderColor: 'transparent' }}
    >
      {labels[platform]}
    </span>
  );
}

function ConnectionBadge({ type }: { type: ConversationOpportunity['connectionType'] }) {
  const colors = {
    direct: { bg: 'var(--peec-badge-green-bg)', text: 'var(--peec-badge-green-text)' },
    adjacent: { bg: 'var(--peec-badge-violet-bg)', text: 'var(--peec-badge-violet-text)' },
    cultural: { bg: 'var(--peec-badge-pink-bg)', text: 'var(--peec-badge-pink-text)' },
  } as const;
  const c = colors[type];
  return (
    <span
      className="peec-pill"
      style={{ background: c.bg, color: c.text, borderColor: 'transparent', textTransform: 'uppercase', letterSpacing: '0.4px' }}
    >
      {type}
    </span>
  );
}

function ScoreChip({ score }: { score: number }) {
  const color =
    score >= 85 ? 'var(--peec-badge-green-text)' : score >= 70 ? 'var(--peec-badge-amber-text)' : 'var(--peec-fg-secondary)';
  return (
    <span
      className="peec-pill"
      style={{
        background: 'var(--peec-bg-secondary)',
        color,
        borderColor: 'transparent',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {score}
    </span>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
