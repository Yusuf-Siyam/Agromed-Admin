import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useApi } from '@/lib/useApi';
import { sortRows } from '@/lib/table';
import { formatDate, formatMinor, listOrders } from '@/lib/superadmin-api';
import type { AdminOrder } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'All', id: '' },
  { label: 'Awaiting payment', id: 'pending_payment' },
  { label: 'Confirmed', id: 'confirmed' },
  { label: 'Processing', id: 'processing' },
  { label: 'Shipped', id: 'shipped' },
  { label: 'Delivered', id: 'delivered' },
  { label: 'Completed', id: 'completed' },
  { label: 'Cancelled', id: 'cancelled' }
] as const;

export default function OrderList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('placedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const orders = useApi(
    (token) => listOrders(token, {
      status: activeTab || undefined,
      search: search || undefined,
      limit: 100
    }),
    [search, activeTab]
  );

  const rows = sortRows(orders.data?.items ?? [], sortKey, sortDirection);

  const columns: Column<AdminOrder>[] = [
    { key: 'orderNumber', label: 'Order', sortable: true },
    {
      key: 'buyerName',
      label: 'Buyer',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.buyerContactName ?? row.buyerName}</span>
          <span className="text-xs text-muted-foreground">{row.buyerPhone ?? row.buyerName}</span>
        </div>
      )
    },
    { key: 'sellerName', label: 'Agro Company', sortable: true },
    {
      key: 'grandTotalMinor',
      label: 'Order Value',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-semibold">{formatMinor(row.grandTotalMinor, row.currency)}</span>
    },
    {
      key: 'commissionMinor',
      label: 'Commission',
      align: 'right',
      sortable: true,
      render: (row) => <span className="text-muted-foreground">{formatMinor(row.commissionMinor, row.currency)}</span>
    },
    { key: 'placedAt', label: 'Placed', sortable: true, render: (row) => formatDate(row.placedAt) },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (row) => row.paymentStatus
        ? <StatusBadge status={row.paymentStatus} />
        : <span className="text-xs text-muted-foreground">No payment</span>
    },
    {
      key: 'status',
      label: 'Fulfilment',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => navigate(`/orders/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View Order Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Order Log Management" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Orders' }]} />

      <div className="flex border-b border-border/60 bg-card rounded-t-xl overflow-x-auto scrollbar-none shrink-0 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id || 'all'}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-5 py-3.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary text-primary bg-muted/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={orders.loading}
        error={orders.error}
        onRetry={orders.reload}
        searchPlaceholder="Search order number, buyer or company..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction); }}
      />
    </div>
  );
}
