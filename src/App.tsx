import { useEffect, useState } from 'react';
import { Radar } from './components/Radar';
import { buildRadar, type RadarSnapshot } from './services/discovery';

export default function App() {
  const [snapshot, setSnapshot] = useState<RadarSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    buildRadar()
      .then((s) => setSnapshot(s))
      .finally(() => setLoading(false));
  }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      const s = await buildRadar();
      setSnapshot(s);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      <Header brandName={snapshot?.brand.name ?? 'Attio'} onRefresh={refresh} refreshing={refreshing} />
      {loading || !snapshot ? <LoadingState /> : <Radar snapshot={snapshot} />}
    </div>
  );
}

function Header({
  brandName,
  onRefresh,
  refreshing,
}: {
  brandName: string;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <header
      className="flex items-center justify-between px-6 h-14 border-b sticky top-0 z-10"
      style={{ borderColor: 'var(--peec-separator-primary)', background: 'var(--peec-bg-white)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: 'var(--peec-bg-black)', color: 'var(--peec-fg-primary-white)' }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="13" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
            <circle cx="13" cy="13" r="1.5" />
          </svg>
        </div>
        <span className="t-h2">SWARM</span>
        <span className="t-caption" style={{ color: 'var(--peec-fg-tertiary)' }}>
          Conquer every conversation
        </span>
        <span
          className="peec-pill ml-3"
          style={{
            background: 'var(--peec-badge-blue-bg)',
            color: 'var(--peec-badge-blue-text)',
            borderColor: 'transparent',
          }}
        >
          Powered by Peec AI
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="peec-btn peec-btn-secondary" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
        <button className="peec-btn peec-btn-primary">{`Brand: ${brandName}`}</button>
      </div>
    </header>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-current border-t-transparent animate-spin"
          style={{ color: 'var(--peec-fg-tertiary)' }}
        />
        <div className="t-body-s" style={{ color: 'var(--peec-fg-secondary)' }}>
          Building Radar…
        </div>
      </div>
    </div>
  );
}
