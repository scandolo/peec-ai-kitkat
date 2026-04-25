import { useEffect, useState } from 'react';
import type { ConversationOpportunity, DraftScaffold, VoiceProfile } from '../types';
import { generateDraftScaffold } from '../services/gemini';

export function DraftPanel({
  brand,
  voice,
  opportunity,
  onClose,
}: {
  brand: { name: string; domain: string };
  voice: VoiceProfile;
  opportunity: ConversationOpportunity;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<DraftScaffold | null>(null);
  const [loading, setLoading] = useState(true);
  const [angle, setAngle] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const a =
      opportunity.connectionType === 'cultural'
        ? `Hook the cultural moment to ${brand.name}'s positioning without selling.`
        : opportunity.connectionType === 'adjacent'
          ? `Bridge the adjacent pain point to ${brand.name}'s value prop.`
          : `Directly address the question with a builder-flavored answer.`;
    setAngle(a);
    regenerate(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function regenerate(nextAngle: string) {
    setLoading(true);
    try {
      const d = await generateDraftScaffold(brand, voice, opportunity, nextAngle);
      setDraft(d);
    } finally {
      setLoading(false);
    }
  }

  const fullText = draft ? `${draft.opener}\n\n${draft.angle}\n\n${draft.supporting}\n\n${draft.cta}` : '';

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center p-6"
      style={{ background: 'rgba(23, 23, 23, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="peec-card-lg w-full max-w-[1100px] max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--peec-separator-primary)' }}
        >
          <div>
            <h2 className="t-h2">Draft scaffold</h2>
            <p className="t-body-s mt-1" style={{ color: 'var(--peec-fg-secondary)' }}>
              80% of the way. You ship it.
            </p>
          </div>
          <button className="peec-btn peec-btn-secondary" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="grid grid-cols-2 gap-0">
          <div
            className="p-5 border-r"
            style={{ borderColor: 'var(--peec-separator-primary)' }}
          >
            <h3 className="t-h4 mb-2">Original post</h3>
            <p className="t-body-s mb-3" style={{ color: 'var(--peec-fg-tertiary)' }}>
              {opportunity.platform} · {opportunity.author}
            </p>
            <h4 className="t-body-l mb-2">{opportunity.title}</h4>
            <p className="t-body-m" style={{ color: 'var(--peec-fg-secondary)' }}>
              {opportunity.content}
            </p>

            <div
              className="rounded-[8px] p-3 mt-4"
              style={{ background: 'var(--peec-surface-secondary)' }}
            >
              <p
                className="t-caption font-semibold uppercase mb-1"
                style={{ color: 'var(--peec-feature-2-base)', letterSpacing: '0.4px' }}
              >
                Why this opportunity?
              </p>
              <p className="t-body-s">{opportunity.peecInsight}</p>
              <p
                className="t-caption mt-2"
                style={{ color: 'var(--peec-fg-secondary)' }}
              >
                Estimated lift if engaged: <strong>+{opportunity.estimatedVisibilityLift.toFixed(1)}pp</strong>
              </p>
            </div>
          </div>

          <div className="p-5">
            <h3 className="t-h4 mb-2">Scaffold (in {brand.name}'s voice)</h3>
            <p className="t-body-s mb-3" style={{ color: 'var(--peec-fg-tertiary)' }}>
              Edit each part. Regenerate to try a different angle.
            </p>

            {loading || !draft ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-[8px] animate-pulse"
                    style={{ background: 'var(--peec-bg-secondary)' }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <ScaffoldField label="Opener" value={draft.opener} />
                <ScaffoldField label="Angle" value={draft.angle} />
                <ScaffoldField label="Supporting" value={draft.supporting} />
                <ScaffoldField label="CTA" value={draft.cta} />

                <div className="flex flex-wrap gap-2 mt-2">
                  {(['bolder', 'technical', 'shorter'] as const).map((k) => (
                    <button
                      key={k}
                      className="peec-btn peec-btn-secondary"
                      onClick={() => regenerate(`Make this ${k} — ${draft.alternates[k]}`)}
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    className="peec-btn peec-btn-secondary"
                    onClick={() => regenerate(angle)}
                  >
                    Regenerate
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <a
                    href={opportunity.url}
                    target="_blank"
                    rel="noreferrer"
                    className="peec-btn peec-btn-secondary"
                  >
                    Open original →
                  </a>
                  <button
                    className="peec-btn peec-btn-primary"
                    onClick={() => copy(fullText)}
                  >
                    {copied ? 'Copied' : 'Copy to clipboard'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScaffoldField({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[8px] p-3"
      style={{
        background: 'var(--peec-surface-secondary)',
        border: '1px solid var(--peec-stroke-soft, #1717170f)',
      }}
    >
      <p
        className="t-caption font-semibold uppercase mb-1"
        style={{ color: 'var(--peec-fg-tertiary)', letterSpacing: '0.4px' }}
      >
        {label}
      </p>
      <p className="t-body-m">{value}</p>
    </div>
  );
}
