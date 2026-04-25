import { useEffect, useState } from 'react';
import { Radar } from './components/Radar';
import { Header } from './components/Header';
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
