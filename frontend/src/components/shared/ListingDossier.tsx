import { useEffect, useState } from 'react';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';
import {
  formatDate, getListingDetail, listingImageUrl
} from '@/lib/superadmin-api';
import type { ListingDetailBundle } from '@/lib/superadmin-api';

export default function ListingDossier({ listingId }: { listingId: string }) {
  const { accessToken } = useSuperAdminSession();
  const [bundle, setBundle] = useState<ListingDetailBundle | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!accessToken || !listingId) return;
    let live = true;
    setState('loading');
    getListingDetail(accessToken, listingId)
      .then((b) => { if (live) { setBundle(b); setState('ready'); } })
      .catch(() => { if (live) setState('error'); });
    return () => { live = false; };
  }, [accessToken, listingId]);

  if (state === 'loading') {
    return <p className="rounded-xl border border-border/80 bg-card p-6 text-center text-sm text-muted-foreground">Loading product record…</p>;
  }
  if (state === 'error' || !bundle) {
    return <p className="rounded-xl border border-destructive/30 bg-card p-6 text-center text-sm text-destructive">The product record could not be loaded.</p>;
  }

  const { listing, registry, media, batches } = bundle;
  const image = media.find((m) => m.isPrimary) ?? media.find((m) => m.mediaType === 'image') ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Product</h3>
        {image ? (
          <img
            src={listingImageUrl(image.id)}
            alt={listing.nameEn ?? listing.sku}
            className="aspect-square w-full rounded-lg border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
            No photograph uploaded
          </div>
        )}
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">SKU</dt><dd className="font-mono text-foreground">{listing.sku}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Brand</dt><dd className="text-foreground">{listing.brand ?? '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Formulation</dt><dd className="text-foreground">{listing.formulation ?? '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Pack size</dt><dd className="text-foreground">{listing.packSize == null ? '—' : `${listing.packSize} ${listing.unitCode ?? ''}`.trim()}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Origin</dt><dd className="text-foreground">{listing.countryOfOrigin ?? '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Shelf life</dt><dd className="text-foreground">{listing.shelfLifeDays == null ? '—' : `${listing.shelfLifeDays} days`}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">HS code</dt><dd className="text-foreground">{listing.hsCode ?? '—'}</dd></div>
          {listing.isRestricted && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs font-semibold text-destructive">
              Restricted product — sale is controlled
            </div>
          )}
        </dl>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <h3 className="border-b border-border px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground">
            Registry entries ({registry.length})
          </h3>
          {registry.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No registration has been recorded against this product.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">Type</th>
                    <th className="px-5 py-2.5 font-semibold">Number</th>
                    <th className="px-5 py-2.5 font-semibold">Authority</th>
                    <th className="px-5 py-2.5 font-semibold">Issued</th>
                    <th className="px-5 py-2.5 font-semibold">Expires</th>
                    <th className="px-5 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registry.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-2.5 capitalize text-foreground">{r.certificateType.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-2.5 font-mono text-xs text-foreground">{r.certificateNumber ?? '—'}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{r.issuingAuthority ?? '—'}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{r.issuedOn ? formatDate(r.issuedOn) : '—'}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{r.expiresOn ? formatDate(r.expiresOn) : '—'}</td>
                      <td className="px-5 py-2.5 capitalize text-foreground">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <h3 className="border-b border-border px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground">
            Batches ({batches.length})
          </h3>
          {batches.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No batches recorded for this product.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">Batch</th>
                    <th className="px-5 py-2.5 font-semibold">Manufactured</th>
                    <th className="px-5 py-2.5 font-semibold">Expires</th>
                    <th className="px-5 py-2.5 font-semibold">Origin</th>
                    <th className="px-5 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {batches.map((b) => (
                    <tr key={b.id}>
                      <td className="px-5 py-2.5 font-mono text-xs text-foreground">{b.batchNumber}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{b.manufacturedOn ? formatDate(b.manufacturedOn) : '—'}</td>
                      <td className="px-5 py-2.5">
                        <span className="text-foreground">{b.expiresOn ? formatDate(b.expiresOn) : '—'}</span>
                        {

}
                        {b.daysToExpiry != null && b.daysToExpiry < 0 && (
                          <span className="ml-2 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">Expired</span>
                        )}
                        {b.daysToExpiry != null && b.daysToExpiry >= 0 && b.daysToExpiry <= 90 && (
                          <span className="ml-2 rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-foreground/70">{b.daysToExpiry}d left</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground">{b.countryOfOrigin ?? '—'}</td>
                      <td className="px-5 py-2.5 capitalize text-foreground">
                        {b.status}
                        {b.quarantineReason && <span className="block text-xs text-muted-foreground">{b.quarantineReason}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
