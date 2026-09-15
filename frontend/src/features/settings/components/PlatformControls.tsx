import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';
import {
  listCases, listCmsArticles, listFeatures, listFraudReviews, listPlatformOffers,
  listSettlements, setFeature as saveFeature
} from '@/lib/superadmin-api';
import { useToast } from '@/components/shared/Toast';

const sections = [
  ['offers', 'Platform offers'], ['cases/return', 'Returns'], ['cases/dispute', 'Disputes'],
  ['settlements', 'Settlements'], ['cms/articles', 'CMS'], ['fraud/reviews', 'Fraud signals'], ['features', 'Feature flags']
] as const;
type Row = Record<string, unknown>;
type Section = (typeof sections)[number][0];

async function readSection(token: string, section: Section): Promise<unknown[]> {
  switch (section) {
    case 'offers': return (await listPlatformOffers(token, { limit: 50 })).items;
    case 'cases/return': return (await listCases(token, 'return', { limit: 50 })).items;
    case 'cases/dispute': return (await listCases(token, 'dispute', { limit: 50 })).items;
    case 'settlements': return (await listSettlements(token, { limit: 50 })).items;
    case 'cms/articles': return (await listCmsArticles(token, { limit: 50 })).items;
    case 'fraud/reviews': return (await listFraudReviews(token, { limit: 50 })).items;
    case 'features': return await listFeatures(token);
  }
}
const label = (value: unknown) => value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value);

export default function PlatformControls() {
  const { accessToken } = useSuperAdminSession();
  const { error, success } = useToast();
  const [section, setSection] = useState<Section>('offers');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureKey, setFeatureKey] = useState('');
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [featureJson, setFeatureJson] = useState('');
  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {

      const payload = await readSection(accessToken, section);
      setRows(payload as Row[]);
    } catch { error('Unable to load platform controls.'); }
    finally { setLoading(false); }
  }, [accessToken, error, section]);
  useEffect(() => { void load(); }, [load]);
  const setFeature = async () => {
    if (!accessToken || !featureKey.trim()) return;
    try {
      if (featureJson.trim()) JSON.parse(featureJson);
      await saveFeature(accessToken, featureKey.trim(), featureEnabled, featureJson.trim() || null);
      success('Feature configuration saved.'); setFeatureKey(''); setFeatureJson(''); await load();
    } catch { error('Use a valid feature key and JSON configuration.'); }
  };
  const keys = rows.length ? Object.keys(rows[0]).slice(0, 7) : [];
  return <div className="space-y-6"><PageHeader title="Platform Controls" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Platform Controls' }]} action={<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"><RefreshCw className="h-3.5 w-3.5" />Refresh</button>} />
    <div className="flex flex-wrap gap-2">{sections.map(([id, name]) => <button key={id} onClick={() => setSection(id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${section === id ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-muted'}`}>{name}</button>)}</div>
    {section === 'features' && <section className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_auto_auto_1.5fr_auto]"><input value={featureKey} onChange={e => setFeatureKey(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="feature.key" /><label className="flex items-center gap-2 text-sm text-foreground"><input checked={featureEnabled} onChange={e => setFeatureEnabled(e.target.checked)} type="checkbox" />Enabled</label><input value={featureJson} onChange={e => setFeatureJson(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder='Optional JSON configuration' /><button onClick={() => void setFeature()} className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"><Save className="h-3.5 w-3.5" />Save</button></section>}
    <section className="overflow-auto rounded-xl border border-border bg-card shadow-sm">{loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading live data…</p> : rows.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No records match this view.</p> : <table className="min-w-full text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr>{keys.map(key => <th key={key} className="whitespace-nowrap px-4 py-3 font-semibold">{key.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead><tbody className="divide-y divide-border">{rows.map((row, index) => <tr key={String(row.id ?? row.featureKey ?? index)}>{keys.map(key => <td key={key} className="max-w-72 truncate px-4 py-3 text-foreground">{label(row[key])}</td>)}</tr>)}</tbody></table>}</section>
  </div>;
}
