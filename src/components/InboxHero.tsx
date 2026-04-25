import { useMemo } from 'react';
import type { InboxTask } from './InboxRow';
import '../styles/inbox-hero.css';

/**
 * InboxHero — single horizontal strip above the Inbox feed.
 * Four cells: brand visibility, queued lift this week, biggest topic gap,
 * agent activity pulse. Everything derives from `tasks` plus an inline-mocked
 * `visibility_runs` series (replace with `api.getVisibilityRuns(brandId)` later).
 */
export function InboxHero({ tasks }: { tasks: InboxTask[] | null }) {
  const visibility = VISIBILITY_RUNS;
  const queued = useMemo(() => deriveQueued(tasks), [tasks]);
  const topicGap = useMemo(() => deriveTopicGap(tasks), [tasks]);
  const agent = useMemo(() => deriveAgentPulse(tasks), [tasks]);

  const latest = visibility[visibility.length - 1].visibility;
  const weekAgo = visibility[0].visibility;
  const delta = latest - weekAgo;

  return (
    <section className="swarm-hero" aria-label="Inbox overview">
      <div className="swarm-hero-card">
        <div className="swarm-hero-cell">
          <span className="swarm-hero-eyebrow">
            <span className="swarm-hero-eyebrow-icon">
              <SignalIcon />
            </span>
            Brand visibility
          </span>
          <div className="swarm-hero-row">
            <span className="swarm-hero-number">{(latest * 100).toFixed(1)}</span>
            <span className="swarm-hero-unit">%</span>
            <DeltaBadge delta={delta} />
          </div>
          <Sparkline runs={visibility} />
        </div>

        <div className="swarm-hero-cell">
          <span className="swarm-hero-eyebrow">
            <span className="swarm-hero-eyebrow-icon">
              <BoltIcon />
            </span>
            Queued this week
          </span>
          <div className="swarm-hero-row">
            <span className="swarm-hero-number">{queued.count}</span>
            <span className="swarm-hero-unit">tasks</span>
          </div>
          <span className="swarm-hero-sub">
            <strong>+{queued.totalLift.toFixed(1)}pp</strong> est. visibility lift
          </span>
        </div>

        <div className="swarm-hero-cell">
          <span className="swarm-hero-eyebrow">
            <span className="swarm-hero-eyebrow-icon">
              <TargetIcon />
            </span>
            Top topic gap
          </span>
          <div className="swarm-hero-row">
            <span className="swarm-hero-number" style={{ fontSize: 18 }}>
              {topicGap.label}
            </span>
          </div>
          <ShareBar ourShare={topicGap.ourShare} leaderShare={topicGap.leaderShare} />
          <span className="swarm-hero-bar-meta">
            <span>
              <strong>{(topicGap.ourShare * 100).toFixed(0)}%</strong> share
            </span>
            <span>
              {topicGap.leaderName} <strong>{(topicGap.leaderShare * 100).toFixed(0)}%</strong>
            </span>
          </span>
        </div>

        <div className="swarm-hero-cell">
          <span className="swarm-hero-eyebrow">
            <span className="swarm-hero-eyebrow-icon">
              <SwarmIcon />
            </span>
            Agents
          </span>
          <div className="swarm-hero-agent-row">
            <span
              className={
                'swarm-hero-pulse' + (agent.isLive ? ' is-live' : ' is-idle')
              }
              aria-hidden="true"
            />
            <span className="swarm-hero-agent-name">{agent.name}</span>
          </div>
          <span className="swarm-hero-agent-meta">
            <span>{agent.statusText}</span>
            <span className="swarm-hero-agent-meta-dot" aria-hidden="true" />
            <span>{agent.cadence}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

interface VisibilityRun {
  ran_at: string;
  visibility: number;
}

const VISIBILITY_RUNS: VisibilityRun[] = (() => {
  const days = [0.291, 0.298, 0.302, 0.297, 0.311, 0.328, 0.334];
  return days.map((v, i) => ({
    ran_at: new Date(Date.now() - (6 - i) * 86_400_000).toISOString(),
    visibility: v,
  }));
})();

function deriveQueued(tasks: InboxTask[] | null) {
  if (!tasks) return { count: 0, totalLift: 0 };
  const oneWeekAgo = Date.now() - 7 * 86_400_000;
  const recent = tasks.filter(
    (t) => t.status !== 'dismissed' && new Date(t.created_at).getTime() >= oneWeekAgo,
  );
  const totalLift = recent.reduce((acc, t) => acc + t.estimated_lift * t.score, 0) * 100;
  return { count: recent.length, totalLift };
}

interface TopicGap {
  label: string;
  ourShare: number;
  leaderShare: number;
  leaderName: string;
}

const TOPIC_DISPLAY: Record<string, Omit<TopicGap, never>> = {
  'plg-crm': { label: 'PLG CRM', ourShare: 0.11, leaderShare: 0.47, leaderName: 'HubSpot' },
  'crm-migration': {
    label: 'CRM migration',
    ourShare: 0.18,
    leaderShare: 0.52,
    leaderName: 'HubSpot',
  },
  'ai-native-crm': {
    label: 'AI-native CRM',
    ourShare: 0.33,
    leaderShare: 0.41,
    leaderName: 'Salesforce',
  },
  benchmarks: {
    label: 'CRM benchmarks',
    ourShare: 0.22,
    leaderShare: 0.38,
    leaderName: 'HubSpot',
  },
  'salesforce-comparison': {
    label: 'Attio vs Salesforce',
    ourShare: 0.27,
    leaderShare: 0.49,
    leaderName: 'Salesforce',
  },
  'small-team-crm': {
    label: 'Small-team CRM',
    ourShare: 0.09,
    leaderShare: 0.61,
    leaderName: 'HubSpot',
  },
};

function deriveTopicGap(tasks: InboxTask[] | null): TopicGap {
  const fallback: TopicGap = {
    label: 'Awaiting data',
    ourShare: 0,
    leaderShare: 0,
    leaderName: '—',
  };
  if (!tasks) return fallback;
  const ranked = [...tasks]
    .filter((t) => t.related_topic_id)
    .sort(
      (a, b) =>
        b.estimated_lift * b.score - a.estimated_lift * a.score,
    );
  const top = ranked[0];
  if (!top || !top.related_topic_id) return fallback;
  return TOPIC_DISPLAY[top.related_topic_id] ?? {
    ...fallback,
    label: top.related_topic_id.replace(/-/g, ' '),
  };
}

interface AgentPulse {
  name: string;
  statusText: string;
  cadence: string;
  isLive: boolean;
}

function deriveAgentPulse(tasks: InboxTask[] | null): AgentPulse {
  if (!tasks || tasks.length === 0) {
    return { name: 'SWARM agents', statusText: 'idle', cadence: 'no recent runs', isLive: false };
  }
  const latest = tasks
    .map((t) => new Date(t.created_at).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  const ageMs = Date.now() - latest;
  const isLive = ageMs < 60 * 60_000;
  const newest = [...tasks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
  const agentName = agentNameForKind(newest.kind);
  return {
    name: agentName,
    statusText: isLive ? 'running' : `ran ${formatAge(ageMs)} ago`,
    cadence: `${tasks.length} tasks emitted today`,
    isLive,
  };
}

function agentNameForKind(kind: InboxTask['kind']): string {
  switch (kind) {
    case 'trend':
      return 'Trends agent';
    case 'opportunity':
      return 'Interception agent';
    case 'outdated_content':
      return 'Refresh agent';
    case 'mention':
      return 'Mentions agent';
  }
}

function formatAge(ms: number): string {
  const m = Math.round(ms / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DeltaBadge({ delta }: { delta: number }) {
  const isUp = delta >= 0;
  const pp = Math.abs(delta) * 100;
  return (
    <span className={'swarm-hero-delta ' + (isUp ? 'is-up' : 'is-down')}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        {isUp ? (
          <path d="M5 2L8 6H6.2v2H3.8V6H2L5 2Z" fill="currentColor" />
        ) : (
          <path d="M5 8L2 4h1.8V2h2.4v2H8L5 8Z" fill="currentColor" />
        )}
      </svg>
      {pp.toFixed(1)}pp
    </span>
  );
}

function Sparkline({ runs }: { runs: VisibilityRun[] }) {
  const w = 180;
  const h = 32;
  const padX = 2;
  const padY = 4;
  const values = runs.map((r) => r.visibility);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (w - padX * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - min) / range) * (h - padY * 2);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath =
    `M${points[0][0].toFixed(1)},${h} ` +
    points.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
    ` L${points[points.length - 1][0].toFixed(1)},${h} Z`;
  const [endX, endY] = points[points.length - 1];
  return (
    <svg
      className="swarm-hero-spark"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="swarm-hero-spark-area" d={areaPath} />
      <path className="swarm-hero-spark-line" d={path} />
      <circle className="swarm-hero-spark-end" cx={endX} cy={endY} r="2" />
    </svg>
  );
}

function ShareBar({ ourShare, leaderShare }: { ourShare: number; leaderShare: number }) {
  const ourPct = Math.max(0, Math.min(1, ourShare));
  const leaderPct = Math.max(0, Math.min(1, leaderShare));
  return (
    <div className="swarm-hero-bar-track" aria-hidden="true">
      <div className="swarm-hero-bar-fill" style={{ width: `${ourPct * 100}%` }} />
      <div className="swarm-hero-bar-marker" style={{ left: `${leaderPct * 100}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SignalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 11v-1M6 11V8M9 11V5M12 11V3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M9 1L3 9h4l-1 6 6-8H8l1-6z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="0.6" fill="currentColor" />
    </svg>
  );
}

function SwarmIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="1.4" fill="currentColor" />
      <circle cx="12" cy="4" r="1.4" fill="currentColor" />
      <circle cx="4" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}
