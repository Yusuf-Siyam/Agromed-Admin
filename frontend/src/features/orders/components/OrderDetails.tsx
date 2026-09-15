import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, CheckCircle, CreditCard, Mail, Phone, User } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ListingDossier from '@/components/shared/ListingDossier';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States';
import { useApi } from '@/lib/useApi';
import { formatDate, formatMinor, getOrderDetail, listOrders } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [openLineId, setOpenLineId] = useState<string | null>(null);

  const summary = useApi((token) => listOrders(token, { limit: 100 }), []);
  const detail = useApi((token) => getOrderDetail(token, id!), [id]);

  const order = summary.data?.items.find((o) => o.id === id);

  if (summary.loading || detail.loading) {
    return <LoadingState message="Loading order…" />;
  }

  if (summary.error || detail.error) {
    return (
      <ErrorState
        message={summary.error ?? detail.error ?? 'That order could not be loaded.'}
        onRetry={() => { summary.reload(); detail.reload(); }}
      />
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <PageHeader title="Order Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Orders', href: '/orders' }, { label: 'Error' }]} />
        <EmptyState
          title="Order record not found"
          description="That order does not exist, or it is outside the most recent hundred."
          action={
            <Link to="/orders" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Order Log
            </Link>
          }
        />
      </div>
    );
  }

  const lines = detail.data?.lines ?? [];
  const timeline = detail.data?.timeline ?? [];
  const activeLine = lines.find((l) => l.id === openLineId) ?? lines[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order Log
        </button>
        <PageHeader
          title={`Order ${order.orderNumber}`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Orders', href: '/orders' },
            { label: order.orderNumber }
          ]}
          action={<StatusBadge status={order.status} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <User className="h-4.5 w-4.5 text-primary" />
                Buyer
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">{order.buyerContactName ?? order.buyerName}</p>
                <p className="text-xs text-muted-foreground">{order.buyerName}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{order.buyerPhone ?? '—'}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{order.buyerEmail ?? '—'}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <Building className="h-4.5 w-4.5 text-primary" />
                Seller
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">{order.sellerName}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />Placed {formatDate(order.placedAt)}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  {order.paymentMethod ?? 'No payment recorded'}
                  {order.paymentStatus ? ` · ${order.paymentStatus}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
            <h3 className="border-b border-border px-5 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
              Order lines
            </h3>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">Batch</th>
                  <th className="px-5 py-3 font-semibold">Made / expires</th>
                  <th className="px-5 py-3 text-center font-semibold">Qty</th>
                  <th className="px-5 py-3 text-right font-semibold">Unit</th>
                  <th className="px-5 py-3 text-right font-semibold">Line total</th>
                  <th className="px-5 py-3 text-right font-semibold">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lines.map((line) => (
                  <tr
                    key={line.id}
                    onClick={() => setOpenLineId(line.id)}
                    className={cn('cursor-pointer transition-colors hover:bg-muted/40', line.id === activeLine?.id && 'bg-muted/50')}
                  >
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{line.name}</span>
                        <span className="text-xs text-muted-foreground">{line.sku}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-foreground">{line.batchNumber ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {line.batchManufacturedOn ? formatDate(line.batchManufacturedOn) : '—'}
                      {' → '}
                      {line.batchExpiresOn ? formatDate(line.batchExpiresOn) : '—'}
                    </td>
                    <td className="px-5 py-3 text-center text-foreground">
                      {Number(line.quantity)} {line.unitCode ?? ''}
                    </td>
                    <td className="px-5 py-3 text-right text-foreground">{formatMinor(line.unitPriceMinor, order.currency)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">{formatMinor(line.lineTotalMinor, order.currency)}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{formatMinor(line.commissionMinor, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
              Select a line to see the product record it was bought from.
            </p>
          </div>

          {activeLine && <ListingDossier listingId={activeLine.listingId} />}
        </div>

        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Money</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-foreground">{formatMinor(order.subtotalMinor, order.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="text-foreground">−{formatMinor(order.discountTotalMinor, order.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="text-foreground">{formatMinor(order.deliveryChargeMinor, order.currency)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt className="text-foreground">Buyer paid</dt><dd className="text-foreground">{formatMinor(order.grandTotalMinor, order.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Platform commission</dt><dd className="text-foreground">{formatMinor(order.commissionMinor, order.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Seller net</dt><dd className="text-foreground">{formatMinor(order.sellerNetMinor, order.currency)}</dd></div>
            </dl>
          </div>

          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recorded transitions.</p>
            ) : (
              <ol className="space-y-4">
                {timeline.map((event, index) => (
                  <li key={`${event.occurredAt}-${index}`} className="flex gap-3">
                    <CheckCircle className={cn('mt-0.5 h-4 w-4 shrink-0', index === timeline.length - 1 ? 'text-primary' : 'text-success')} />
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">
                        {event.fromStatus ? `${event.fromStatus} → ${event.toStatus}` : event.toStatus}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.occurredAt)}
                        {event.changedByName ? ` · ${event.changedByName}` : ''}
                      </p>
                      {event.reason && <p className="text-xs text-muted-foreground">{event.reason}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
