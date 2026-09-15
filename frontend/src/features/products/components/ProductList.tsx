import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, Package, ShoppingBag } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useApi } from '@/lib/useApi';
import { sortRows } from '@/lib/table';
import { formatMinor, listListings, listTaxonomy } from '@/lib/superadmin-api';
import type { AdminListing } from '@/lib/superadmin-api';

export default function ProductList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortKey, setSortKey] = useState<string>('sku');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const listings = useApi(
    (token) => listListings(token, { kind: 'product', search: search || undefined, limit: 100 }),
    [search]
  );
  const taxonomy = useApi((token) => listTaxonomy(token), []);

  const all = useMemo(() => listings.data?.items ?? [], [listings.data]);

  const rows = useMemo(() => {
    const filtered = all.filter((p) => {
      const byCategory = categoryFilter === 'all' || p.categoryCode === categoryFilter;
      const byStock =
        stockFilter === 'all' ||
        (stockFilter === 'out' && p.stockOnHand <= 0) ||
        (stockFilter === 'low' && p.stockOnHand > 0 && p.stockOnHand <= 20) ||
        (stockFilter === 'good' && p.stockOnHand > 20);
      return byCategory && byStock;
    });
    return sortRows(filtered, sortKey, sortDirection);
  }, [all, categoryFilter, stockFilter, sortKey, sortDirection]);

  const stats = useMemo(() => ({
    total: all.length,
    active: all.filter((p) => p.status === 'active').length,

    low: all.filter((p) => p.stockOnHand > 0 && p.stockOnHand <= 20).length,
    out: all.filter((p) => p.stockOnHand <= 0).length
  }), [all]);

  const categories = useMemo(() => {
    const codes = new Set((taxonomy.data ?? []).filter((c) => c.listingKind !== 'service').map((c) => c.code));
    return [...codes].sort();
  }, [taxonomy.data]);

  const columns: Column<AdminListing>[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    {
      key: 'nameEn',
      label: 'Product',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.nameEn ?? row.sku}</span>
          <span className="text-xs text-muted-foreground">{row.nameBn ?? row.brand ?? '—'}</span>
        </div>
      )
    },
    { key: 'sellerName', label: 'Company', sortable: true },
    { key: 'categoryCode', label: 'Category', sortable: true },
    {
      key: 'fromPriceMinor',
      label: 'From',
      align: 'right',
      sortable: true,
      render: (row) => row.fromPriceMinor == null
        ? <span className="text-xs text-muted-foreground">Quote only</span>
        : <span className="font-semibold">{formatMinor(row.fromPriceMinor)}</span>
    },
    {
      key: 'stockOnHand',
      label: 'Stock',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className={row.stockOnHand <= 0 ? 'font-semibold text-destructive' : row.stockOnHand <= 20 ? 'font-semibold text-warning' : 'text-foreground'}>
          {Number(row.stockOnHand).toLocaleString()}
        </span>
      )
    },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/products/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View listing"
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
        title="Catalogue Monitor"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Package className="h-4 w-4" />
            Monitor only — sellers own their catalogue
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Listings" value={stats.total} icon={ShoppingBag} />
        <StatCard title="Active" value={stats.active} icon={CheckCircle2} />
        <StatCard title="Low stock" value={stats.low} icon={AlertCircle} />
        <StatCard title="Out of stock" value={stats.out} icon={AlertCircle} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={listings.loading}
        error={listings.error}
        onRetry={listings.reload}
        searchPlaceholder="Search SKU or brand..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction); }}
        filterSlot={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Stock:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All levels</option>
                <option value="good">In stock</option>
                <option value="low">Low</option>
                <option value="out">Out of stock</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
