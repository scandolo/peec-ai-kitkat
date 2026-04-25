import { useEffect, useState } from 'react';
import {
  KindIcon,
  kindLabel,
  type InboxTask,
  type InboxDraft,
  type InboxContextChunk,
  type TaskKind,
} from './InboxRow';
import '../styles/task-drawer.css';

export function TaskDrawer({
  task,
  draft,
  onClose,
}: {
  task: InboxTask | null;
  draft: InboxDraft | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!task) {
      setMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [task]);

  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task, onClose]);

  if (!task) return null;

  const citations = (draft?.context_chunks ?? []).slice(0, 3);
  const body = task.raw?.body ?? task.summary;
  const author = task.raw?.author ?? null;
  const publishedAt = task.raw?.published_at ?? task.created_at;
  const kindClass = kindToClass(task.kind);

  // Estimated lift only — we don't have real Peec before/after numbers per task,
  // so the bar magnitude maps to the task's estimated_lift (0..1) directly.
  const liftPct = Math.max(0, Math.min(1, task.estimated_lift));
  const liftBarWidth = Math.min(100, Math.max(8, liftPct * 100));
  const liftLabel = `+${(liftPct * 100).toFixed(1)}pp`;

  return (
    <>
      <div
        className={`td-scrim${mounted ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`td-drawer${mounted ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Task detail"
      >
        <header className="td-header">
          <div className="td-header-top">
            <div className="td-header-title-row">
              <span className={`td-kind-icon is-${kindClass}`} aria-hidden="true">
                <KindIcon kind={task.kind} />
              </span>
              <h2 className="td-title">{task.title}</h2>
            </div>
            <div className="td-header-actions">
              <a
                className="td-source-link"
                href={task.source_url}
                target="_blank"
                rel="noopener noreferrer"
                title={task.source_url}
              >
                Open source
                <ExternalIcon />
              </a>
              <button className="td-close" onClick={onClose} aria-label="Close drawer">
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="td-header-meta">
            <span className="td-source-domain">
              <FaviconDot domain={task.source_domain} />
              {task.source_domain}
            </span>
            <span className="td-meta-sep">·</span>
            <span className={`td-kind-pill is-${kindClass}`}>{kindLabel(task.kind)}</span>
            {task.platform && (
              <>
                <span className="td-meta-sep">·</span>
                <span>{task.platform}</span>
              </>
            )}
          </div>

          <div className="td-impact">
            <div className="td-impact-row">
              <span className="td-impact-label">Estimated Peec lift</span>
              <span className="td-impact-delta">
                <BoltIcon />
                {liftLabel}
              </span>
            </div>
            <div className="td-impact-bar" aria-hidden="true">
              <div
                className="td-impact-bar-fill"
                style={{ width: `${liftBarWidth}%` }}
              />
            </div>
            <div className="td-impact-foot">
              <span>If this task ships</span>
              <span>
                ROI score <strong>{(task.estimated_lift * task.score).toFixed(2)}</strong>
              </span>
            </div>
          </div>
        </header>

        <div className="td-body">
          <section className="td-section">
            <div className="td-section-header">
              <span className="td-section-title">Original conversation</span>
              <a
                className="td-inline-link"
                href={task.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View original
                <ExternalIcon />
              </a>
            </div>
            <article className="td-original-card">
              <div className="td-original-head">
                <span className="td-avatar">{(author ?? task.source_domain).charAt(0).toUpperCase()}</span>
                <div className="td-original-meta">
                  <span className="td-author">{author ?? task.source_domain}</span>
                  <span className="td-platform-line">
                    {task.platform && (
                      <span className="td-platform-glyph">{platformGlyph(task.platform)}</span>
                    )}
                    {task.platform && <span>{task.platform}</span>}
                    {task.platform && <span>·</span>}
                    <span>{formatDate(publishedAt)}</span>
                  </span>
                </div>
              </div>
              <p className="td-original-body">{body}</p>
            </article>
          </section>

          <section className="td-section">
            <div className="td-section-header">
              <span className="td-section-title">Draft scaffold</span>
              <span className="td-section-sub">{draft ? 'Generated' : 'Empty'}</span>
            </div>
            {draft ? (
              <div className="td-draft-cards">
                <DraftCard letter="O" label="Opener" text={draft.opener} />
                <DraftCard letter="A" label="Angle" text={draft.angle} />
                <DraftCard letter="S" label="Supporting" text={draft.supporting} />
                <DraftCard letter="C" label="CTA" text={draft.cta} />
              </div>
            ) : (
              <div className="td-empty">
                No draft yet. Generate one once the interception agent finishes.
              </div>
            )}
          </section>

          <section className="td-section">
            <div className="td-section-header">
              <span className="td-section-title">
                Brand context · {citations.length} of {draft?.context_chunks.length ?? 0}
              </span>
            </div>
            {citations.length === 0 ? (
              <div className="td-empty">No retrieved chunks for this task.</div>
            ) : (
              <div className="td-cite-row">
                {citations.map((c) => (
                  <CitationCard key={c.id} chunk={c} />
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="td-actions">
          <button className="td-action-ghost" onClick={onClose}>
            Dismiss
          </button>
          <button className="td-action-primary" type="button">
            Open in editor
            <ArrowRightIcon />
          </button>
        </footer>
      </aside>
    </>
  );
}

function DraftCard({ letter, label, text }: { letter: string; label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="td-draft-card">
      <span className="td-draft-glyph" aria-hidden="true">
        {letter}
      </span>
      <div className="td-draft-body">
        <span className="td-draft-label">{label}</span>
        <p className="td-draft-text">{text}</p>
      </div>
      <button
        className={`td-copy${copied ? ' is-copied' : ''}`}
        onClick={onCopy}
        aria-label={`Copy ${label}`}
        title={copied ? 'Copied' : 'Copy'}
        type="button"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

function CitationCard({ chunk }: { chunk: InboxContextChunk }) {
  const host = hostnameOf(chunk.source_url);
  return (
    <div className="td-cite-card">
      <div className="td-cite-head">
        <FaviconDot domain={host} />
        <span className="td-cite-type">{chunk.source_type}</span>
      </div>
      <p className="td-cite-text">{chunk.text}</p>
      <a
        className="td-cite-open"
        href={chunk.source_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {host}
        <ExternalIcon />
      </a>
    </div>
  );
}

function FaviconDot({ domain }: { domain: string }) {
  const ch = domain.replace(/^www\./, '').charAt(0).toUpperCase();
  return <span className="td-favicon-dot">{ch}</span>;
}

function kindToClass(kind: TaskKind): string {
  switch (kind) {
    case 'trend':
      return 'trend';
    case 'opportunity':
      return 'opportunity';
    case 'outdated_content':
      return 'outdated';
    case 'mention':
      return 'mention';
  }
}

function platformGlyph(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes('reddit')) return 'r/';
  if (p.includes('twitter') || p.includes('x.com') || p === 'x') return 'X';
  if (p.includes('linkedin')) return 'in';
  if (p.includes('hacker') || p === 'hn') return 'Y';
  if (p.includes('github')) return 'gh';
  return platform.charAt(0).toUpperCase();
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 4h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 4l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 10.5V3.5A1 1 0 0 1 4 2.5h7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 1L3 9h4l-1 6 6-8H8l1-6z" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
