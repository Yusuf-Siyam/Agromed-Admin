import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, ArrowLeft, DollarSign, Package } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ListingDossier from '@/components/shared/ListingDossier';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States';
import { useApi } from '@/lib/useApi';
import { formatDate, formatMinor, listListings, listReviews } from '@/lib/superadmin-api';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const listings = useApi((token) => listListings(token, { limit: 100 }), []);
  const reviews = useApi((token) => listReviews(token, { limit: 100 }), []);

  const product = listings.data?.items.find((p) => p.id === id);
  const productReviews = (reviews.data?.items ?? []).filter((r) => r.listingId === id);

  if (listings.loading) return <LoadingState message="Loading listing…" />;
  if (listings.error) return <ErrorState message={listings.error} onRetry={listings.reload} />;

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: 'Error' }]} />
        <EmptyState
          title="Listing not found"
          description="That listing does not exist, or it is outside the most recent hundred."
          action={
            <Link to="/products" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to catalogue
            </Link>
          }
        />
      </div>
    );
  }

  const average = productReviews.length === 0
    ? null
    : productReviews.reduce((t, r) => t + r.rating, 0) / productReviews.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalogue
        </button>
        <PageHeader
          title={product.nameEn ?? product.sku}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: product.sku }]}
          action={<StatusBadge status={product.status} />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="From price" value={product.fromPriceMinor == null ? 'Quote only' : formatMinor(product.fromPriceMinor)} icon={DollarSign} />
        <StatCard title="Stock on hand" value={Number(product.stockOnHand).toLocaleString()} icon={Archive} />
        <StatCard title="Reviews" value={productReviews.length} icon={Package} />
        <StatCard title="Rating" value={average == null ? '—' : `★ ${average.toFixed(1)}`} icon={Package} />
      </div>

      <ListingDossier listingId={product.id} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Listing</h3>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">SKU</dt><dd className="text-foreground">{product.sku}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Brand</dt><dd className="text-foreground">{product.brand ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Kind</dt><dd className="capitalize text-foreground">{product.kind}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Category</dt><dd className="text-foreground">{product.categoryCode}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Seller</dt><dd className="text-foreground">{product.sellerName}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Listed</dt><dd className="text-foreground">{formatDate(product.createdAt)}</dd></div>
          </dl>
          <div className="space-y-1 border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground">Name (English)</p>
            <p className="text-sm text-foreground">{product.nameEn ?? '—'}</p>
            <p className="pt-2 text-xs font-semibold text-muted-foreground">নাম (বাংলা)</p>
            <p className="text-sm text-foreground">{product.nameBn ?? '—'}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm lg:col-span-2">
          <h3 className="border-b border-border px-5 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
            Reviews ({productReviews.length})
          </h3>
          {reviews.loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading reviews…</p>
          ) : productReviews.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No reviews for this listing yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {productReviews.map((r) => (
                <li key={r.id} className="space-y-1 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">★ {r.rating}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-foreground">{r.body ?? <em className="text-muted-foreground">Rating only</em>}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.authorName ?? 'Anonymous'}
                    {r.isVerifiedPurchase ? ' · verified purchase' : ''}
                    {' · '}{formatDate(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
