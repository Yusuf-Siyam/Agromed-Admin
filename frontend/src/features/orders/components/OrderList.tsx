import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockOrders } from '@/mock-data/orders';
import type { OrderItem } from '@/mock-data/orders';
import { cn } from '@/lib/utils';

type ActiveTab = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export default function OrderList() {
  const navigate = useNavigate();

  // Search & Tab States
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const columns: Column<OrderItem>[] = [
    { key: 'id', label: 'Order ID', sortable: true },
    {
      key: 'farmerName',
      label: 'Farmer Customer',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.farmerName}</span>
          <span className="text-xs text-muted-foreground">{row.farmerPhone}</span>
        </div>
      )
    },
    { key: 'companyName', label: 'Agro Company', sortable: true },
    {
      key: 'total',
      label: 'Total Total',
      align: 'center',
      sortable: true,
      render: (row) => <span className="font-semibold">${row.total.toFixed(2)}</span>
    },
    { key: 'date', label: 'Order Date', sortable: true },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (row) => <StatusBadge status={row.paymentStatus} />
    },
    {
      key: 'deliveryStatus',
      label: 'Delivery Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.deliveryStatus} />
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

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const filteredOrders = mockOrders
    .filter((ord) => {
      const matchSearch =
        ord.id.toLowerCase().includes(search.toLowerCase()) ||
        ord.farmerName.toLowerCase().includes(search.toLowerCase()) ||
        ord.companyName.toLowerCase().includes(search.toLowerCase());

      const matchTab = activeTab === 'all' || ord.deliveryStatus === activeTab || ord.paymentStatus === activeTab;
      return matchSearch && matchTab;
    })
    .sort((a, b) => {
      let aVal = (a as any)[sortKey];
      let bVal = (b as any)[sortKey];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const tabList: { label: string; id: ActiveTab }[] = [
    { label: 'All Orders', id: 'all' },
    { label: 'Pending', id: 'pending' },
    { label: 'Processing', id: 'processing' },
    { label: 'Shipped', id: 'shipped' },
    { label: 'Delivered', id: 'delivered' },
    { label: 'Cancelled', id: 'cancelled' },
    { label: 'Refunded', id: 'refunded' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Order Log Management" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Orders' }]} />

      {/* Navigation tabs */}
      <div className="flex border-b border-border/60 bg-card rounded-t-xl overflow-x-auto scrollbar-none shrink-0 shadow-sm">
        {tabList.map((tab) => (
          <button
            key={tab.id}
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

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search order ID, farmer, supplier..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
