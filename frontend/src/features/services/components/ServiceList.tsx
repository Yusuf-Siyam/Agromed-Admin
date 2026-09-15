import { useMemo, useState } from 'react';
import { Activity, Eye, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useApi } from '@/lib/useApi';
import { sortRows } from '@/lib/table';
import { formatDate, formatMinor, listListings } from '@/lib/superadmin-api';
import type { AdminListing } from '@/lib/superadmin-api';

export default function ServiceList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('sku');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const services = useApi(
    (token) => listListings(token, {
      kind: 'service',
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      limit: 100
    }),
    [search, statusFilter]
  );

  const all = useMemo(() => services.data?.items ?? [], [services.data]);
  const rows = useMemo(() => sortRows(all, sortKey, sortDirection), [all, sortKey, sortDirection]);

  const stats = useMemo(() => ({
    total: all.length,
    active: all.filter((s) => s.status === 'active').length,
    providers: new Set(all.map((s) => s.organisationId)).size,
    categories: new Set(all.map((s) => s.categoryCode)).size
  }), [all]);

  const columns: Column<AdminListing>[] = [
    {
      key: 'nameEn',
      label: 'Service',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.nameEn ?? row.sku}</span>
          <span className="text-xs text-muted-foreground">{row.nameBn ?? row.sku}</span>
        </div>
      )
    },
    { key: 'categoryCode', label: 'Category', sortable: true },
    { key: 'sellerName', label: 'Provider', sortable: true },
    {
      key: 'fromPriceMinor',
      label: 'From',
      align: 'right',
      sortable: true,
      render: (row) => row.fromPriceMinor == null
        ? <span className="text-xs text-muted-foreground">Quote only</span>
        : <span className="font-semibold text-foreground">{formatMinor(row.fromPriceMinor)}</span>
    },
    { key: 'createdAt', label: 'Listed', sortable: true, render: (row) => formatDate(row.createdAt) },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/service-providers/${row.organisationId}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View the provider"
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
        title="Services Monitor"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
        action={
          <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <Wrench className="h-4 w-4" />
            Monitor only — providers own their services
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Services" value={stats.total} icon={Wrench} />
        <StatCard title="Active" value={stats.active} icon={Activity} />
        <StatCard title="Providers" value={stats.providers} icon={Wrench} />
        <StatCard title="Categories" value={stats.categories} icon={Activity} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={services.loading}
        error={services.error}
        onRetry={services.reload}
        searchPlaceholder="Search service code or provider..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction); }}
        filterSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
