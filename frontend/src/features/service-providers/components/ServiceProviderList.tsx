import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Wrench } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import RoleTags from '@/components/shared/RoleTags';
import { useApi } from '@/lib/useApi';
import { sortRows } from '@/lib/table';
import { formatMinor, listListings, listOrganisations } from '@/lib/superadmin-api';
import type { AdminOrganisation } from '@/lib/superadmin-api';

export default function ServiceProviderList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<string>('legalName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sellers = useApi(
    (token) => listOrganisations(token, {
      kind: 'seller',
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      limit: 100
    }),
    [search, statusFilter]
  );
  const services = useApi((token) => listListings(token, { kind: 'service', limit: 100 }), []);

  const byOrganisation = useMemo(() => {
    const map = new Map<string, { count: number; categories: Set<string> }>();
    for (const s of services.data?.items ?? []) {
      const entry = map.get(s.organisationId) ?? { count: 0, categories: new Set<string>() };
      entry.count += 1;
      entry.categories.add(s.categoryCode);
      map.set(s.organisationId, entry);
    }
    return map;
  }, [services.data]);

  const rows = useMemo(
    () => sortRows((sellers.data?.items ?? []).filter((o) => o.offersServices), sortKey, sortDirection),
    [sellers.data, sortKey, sortDirection]
  );

  const columns: Column<AdminOrganisation>[] = [
    {
      key: 'legalName',
      label: 'Service Provider',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.legalName}</span>
          <span className="text-xs text-muted-foreground">{row.contactEmail ?? row.contactPhone ?? '—'}</span>
        </div>
      )
    },
    {
      key: 'categories',
      label: 'Service categories',
      render: (row) => {
        const codes = [...(byOrganisation.get(row.id)?.categories ?? [])];
        return codes.length === 0
          ? <span className="text-xs text-muted-foreground">—</span>
          : (
            <div className="flex flex-wrap gap-1">
              {codes.map((c) => (
                <span key={c} className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/80">{c}</span>
              ))}
            </div>
          );
      }
    },
    { key: 'serviceCount', label: 'Services', align: 'center', sortable: true },
    {
      key: 'roles',
      label: 'Operates as',
      render: (row) => <RoleTags organisation={row} showCounts={false} />
    },
    { key: 'orderCount', label: 'Bookings', align: 'center', sortable: true },
    {
      key: 'gmvMinor',
      label: 'Revenue',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.gmvMinor, row.currency)}</span>
    },
    {
      key: 'averageRating',
      label: 'Rating',
      align: 'center',
      render: (row) => row.averageRating == null
        ? <span className="text-xs text-muted-foreground">No reviews</span>
        : <span className="font-bold text-foreground">★ {Number(row.averageRating).toFixed(1)}</span>
    },
    {
      key: 'verificationStatus',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.verificationStatus} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/service-providers/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Providers"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Service Providers' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Wrench className="h-4 w-4" />
            {rows.length} providers
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={sellers.loading || services.loading}
        error={sellers.error ?? services.error}
        onRetry={() => { sellers.reload(); services.reload(); }}
        searchPlaceholder="Search by name, email or phone..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction); }}
        filterSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
