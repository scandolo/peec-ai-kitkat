import { useState } from 'react';
import type { ConversationOpportunity } from '../types';
import type { RadarSnapshot } from '../services/discovery';
import { ConversationCard } from './ConversationCard';
import { DraftPanel } from './DraftPanel';
import { VisibilityBar } from './VisibilityBar';
import { TrendsRail } from './TrendsRail';
import { VoiceProfilePanel } from './VoiceProfilePanel';

export function Radar({ snapshot }: { snapshot: RadarSnapshot }) {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [openOpp, setOpenOpp] = useState<ConversationOpportunity | null>(null);

  const filtered = activeTopicId
    ? snapshot.opportunities.filter((o) => o.relatedTopicId === activeTopicId)
    : snapshot.opportunities;

  return (
    <main className="grid grid-cols-[300px_1fr_340px] gap-4 p-4 max-w-[1600px] mx-auto items-start">
      <TrendsRail trends={snapshot.trends} gaps={snapshot.gaps} onTopicClick={setActiveTopicId} />

      <section className="flex flex-col gap-4">
        <VisibilityBar
          brand={snapshot.brand.name}
          overall={snapshot.overall}
          gaps={snapshot.gaps}
          activeTopicId={activeTopicId}
          onSelect={setActiveTopicId}
        />
        <Feed opportunities={filtered} onOpen={setOpenOpp} totalCount={snapshot.opportunities.length} />
      </section>

      <VoiceProfilePanel voice={snapshot.voice} topDomains={snapshot.topDomains} />

      {openOpp && (
        <DraftPanel
          brand={snapshot.brand}
          voice={snapshot.voice}
          opportunity={openOpp}
          onClose={() => setOpenOpp(null)}
        />
      )}
    </main>
  );
}

function Feed({
  opportunities,
  onOpen,
  totalCount,
}: {
  opportunities: ConversationOpportunity[];
  onOpen: (o: ConversationOpportunity) => void;
  totalCount: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="t-h3">
          Conversations
          <span className="ml-2 t-body-s" style={{ color: 'var(--peec-fg-tertiary)' }}>
            {opportunities.length} of {totalCount}
          </span>
        </h2>
        <span className="t-caption" style={{ color: 'var(--peec-fg-tertiary)' }}>
          Conversation Interception Agent
        </span>
      </div>
      {opportunities.length === 0 ? (
        <div
          className="peec-card p-8 text-center"
          style={{ color: 'var(--peec-fg-tertiary)' }}
        >
          <p className="t-body-m">No matches for this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {opportunities.map((o) => (
            <ConversationCard key={o.id} opportunity={o} onOpen={() => onOpen(o)} />
          ))}
        </div>
      )}
    </div>
  );
}
