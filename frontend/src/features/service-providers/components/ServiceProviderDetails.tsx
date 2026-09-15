import { useParams } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import OrganisationProfile from '@/components/shared/OrganisationProfile';
import { useApi } from '@/lib/useApi';
import { formatMinor, listListings } from '@/lib/superadmin-api';

export default function ServiceProviderDetails() {
  const { id } = useParams<{ id: string }>();

  const services = useApi(
    (token) => listListings(token, { kind: 'service', organisationId: id, limit: 100 }),
    [id]
  );

  const items = services.data?.items ?? [];

  return (
    <OrganisationProfile
      id={id}
      kind="seller"
      backTo="/service-providers"
      backLabel="Service Providers"
      noun="Service provider"
    >
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <h3 className="flex items-center gap-2 border-b border-border px-5 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
          <Wrench className="h-4 w-4 text-primary" />
          Services offered ({items.length})
        </h3>
        {services.loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading services…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">This organisation lists no services.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 text-right font-semibold">From</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 text-foreground">{s.sku}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-foreground">{s.nameEn ?? '—'}</span>
                      <span className="text-xs text-muted-foreground">{s.nameBn ?? ''}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{s.categoryCode}</td>
                  <td className="px-5 py-3 text-right text-foreground">
                    {s.fromPriceMinor == null ? 'Quote' : formatMinor(s.fromPriceMinor)}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </OrganisationProfile>
  );
}
