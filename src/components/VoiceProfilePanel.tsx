import type { VoiceProfile } from '../types';
import type { PeecDomainReportRow } from '../services/peec';

export function VoiceProfilePanel({
  voice,
  topDomains,
}: {
  voice: VoiceProfile;
  topDomains: PeecDomainReportRow[];
}) {
  const ugc = topDomains.filter((d) => d.type === 'UGC').slice(0, 3);
  return (
    <aside className="flex flex-col gap-4 sticky top-[72px]">
      <div className="peec-card p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="t-h3">Brand voice</h2>
        </div>
        <p className="t-caption mb-3" style={{ color: 'var(--peec-fg-tertiary)' }}>
          Brand Context Agent · system-prompt anchor
        </p>

        <p className="t-body-s mb-3" style={{ color: 'var(--peec-fg-primary)' }}>
          {voice.summary}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {voice.traits.map((t) => (
            <span
              key={t}
              className="peec-pill"
              style={{
                background: 'var(--peec-bg-secondary)',
                color: 'var(--peec-fg-primary)',
                borderColor: 'transparent',
                fontSize: 11,
                padding: '2px 8px',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <h3 className="t-h4 mb-2">Tone</h3>
        <div className="flex flex-col gap-2 mb-4">
          {Object.entries(voice.toneSpectrum).map(([k, v]) => (
            <ToneBar key={k} label={k} value={v} />
          ))}
        </div>

        <h3 className="t-h4 mb-2">Signature phrases</h3>
        <ul className="flex flex-col gap-1 mb-4">
          {voice.signaturePhrases.map((p) => (
            <li
              key={p}
              className="t-body-s"
              style={{ color: 'var(--peec-fg-secondary)' }}
            >
              "{p}"
            </li>
          ))}
        </ul>

        <h3 className="t-h4 mb-2">Brand context</h3>
        <p className="t-body-s" style={{ color: 'var(--peec-fg-secondary)' }}>
          {voice.brandContextSummary}
        </p>
      </div>

      <div className="peec-card p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="t-h3">Where AI cites you</h2>
        </div>
        <p className="t-caption mb-3" style={{ color: 'var(--peec-fg-tertiary)' }}>
          Top user-generated domains feeding AI engines
        </p>
        <div className="flex flex-col gap-2">
          {ugc.map((d) => (
            <div key={d.domain} className="flex items-center justify-between">
              <span className="t-body-s">{d.domain}</span>
              <span
                className="t-caption"
                style={{ color: 'var(--peec-fg-secondary)', fontVariantNumeric: 'tabular-nums' }}
              >
                {d.citation_count} citations
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ToneBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="t-caption capitalize"
        style={{ color: 'var(--peec-fg-secondary)', minWidth: 78 }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--peec-bg-tertiary)' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: 'var(--peec-bg-black)' }}
        />
      </div>
      <span
        className="t-caption"
        style={{ color: 'var(--peec-fg-tertiary)', minWidth: 24, textAlign: 'right' }}
      >
        {value}
      </span>
    </div>
  );
}
