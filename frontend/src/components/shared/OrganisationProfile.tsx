import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, ClipboardList, DollarSign, Mail, MapPin, Phone, Star } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States';
import { useApi } from '@/lib/useApi';
import { districtOf } from '@/lib/directory';
import { formatDate, formatMinor, listOrders, listOrganisations } from '@/lib/superadmin-api';
import type { AdminOrder } from '@/lib/superadmin-api';

export interface OrganisationProfileProps {
  id: string | undefined;

  kind: 'seller' | 'buyer';

  backTo: string;
  backLabel: string;

  noun: string;

  children?: React.ReactNode;
}

export default function OrganisationProfile({
  id, kind, backTo, backLabel, noun, children
}: OrganisationProfileProps) {
  const navigate = useNavigate();

  const organisations = useApi((token) => listOrganisations(token, { kind, limit: 100 }), [kind]);
  const orders = useApi((token) => listOrders(token, { organisationId: id, limit: 100 }), [id]);

  const organisation = organisations.data?.items.find((o) => o.id === id);

  if (organisations.loading) return <LoadingState message={`Loading ${noun.toLowerCase()}…`} />;
  if (organisations.error) return <ErrorState message={organisations.error} onRetry={organisations.reload} />;

  if (!organisation) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`${noun} Not Found`}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: backLabel, href: backTo }, { label: 'Error' }]}
        />
        <EmptyState
          title={`${noun} profile not found`}
          description="That record does not exist, or it is outside the most recent hundred."
          action={
            <Link to={backTo} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to {backLabel}
            </Link>
          }
        />
      </div>
    );
  }

  const rows = orders.data?.items ?? [];
  const traded = rows.filter((o) => !['cancelled', 'pending_payment'].includes(o.status));
  const spend = traded.reduce((t, o) => t + o.grandTotalMinor, 0);
  const average = traded.length === 0 ? 0 : Math.round(spend / traded.length);

  const columns: Column<AdminOrder>[] = [
    { key: 'orderNumber', label: 'Order' },
    { key: 'placedAt', label: 'Placed', render: (row) => formatDate(row.placedAt) },
    {
      key: 'counterparty',
      label: kind === 'buyer' ? 'Seller' : 'Buyer',
      render: (row) => (kind === 'buyer' ? row.sellerName : row.buyerContactName ?? row.buyerName)
    },
    {
      key: 'grandTotalMinor',
      label: 'Value',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.grandTotalMinor, row.currency)}</span>
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <button
          onClick={() => navigate(backTo)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {backLabel}
        </button>
        <PageHeader
          title={organisation.legalName}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: backLabel, href: backTo }, { label: organisation.legalName }]}
          action={<StatusBadge status={organisation.status} />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Orders" value={traded.length} icon={ClipboardList} />
        <StatCard title="Total value" value={formatMinor(spend, organisation.currency)} icon={DollarSign} />
        <StatCard title="Average order" value={formatMinor(average, organisation.currency)} icon={DollarSign} />
        <StatCard
          title="Rating"
          value={organisation.averageRating == null ? '—' : `★ ${Number(organisation.averageRating).toFixed(1)}`}
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Building className="h-4.5 w-4.5 text-primary" />Profile
          </h3>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2"><Mail className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">{organisation.contactEmail ?? '—'}</dd></div>
            <div className="flex items-start gap-2"><Phone className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">{organisation.contactPhone ?? '—'}</dd></div>
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">{organisation.addressLine ?? districtOf(organisation)}</dd></div>
            <div className="flex items-start gap-2"><Calendar className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">Joined {formatDate(organisation.createdAt)}</dd></div>
            <div className="flex items-start gap-2 pt-1">
              <dd><StatusBadge status={organisation.verificationStatus} /></dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <h3 className="px-1 text-base font-bold text-foreground">Order history</h3>
          <DataTable
            columns={columns}
            data={rows}
            isLoading={orders.loading}
            error={orders.error}
            onRetry={orders.reload}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
