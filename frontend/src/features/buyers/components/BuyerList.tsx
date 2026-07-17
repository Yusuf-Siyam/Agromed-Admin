import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Ban, Check, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { mockBuyers } from '@/mock-data/buyers';
import type { BuyerItem } from '@/mock-data/buyers';

export default function BuyerList() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [buyers, setBuyers] = useState<BuyerItem[]>(mockBuyers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [activeAction, setActiveAction] = useState<{
    type: 'suspend' | 'activate' | 'delete';
    buyer: BuyerItem;
  } | null>(null);

  const columns: Column<BuyerItem>[] = [
    { key: 'id', label: 'Buyer ID', sortable: true },
    {
      key: 'name',
      label: 'Buyer Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.companyName}</span>
        </div>
      )
    },
    { key: 'phone', label: 'Phone' },
    { key: 'district', label: 'District', sortable: true },
    {
      key: 'buyerType',
      label: 'Type',
      sortable: true,
      render: (row) => (
        <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted font-semibold capitalize text-foreground/80">
          {row.buyerType}
        </span>
      )
    },
    { key: 'totalOrders', label: 'Orders', align: 'center', sortable: true },
    { key: 'totalSpent', label: 'Total Spent', align: 'center', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/buyers/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View Profile Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>

          {row.status === 'active' ? (
            <button
              onClick={() => setActiveAction({ type: 'suspend', buyer: row })}
              className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
              title="Suspend Buyer"
            >
              <Ban className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveAction({ type: 'activate', buyer: row })}
              className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
              title="Activate Buyer"
            >
              <Check className="h-4.5 w-4.5" />
            </button>
          )}

          <button
            onClick={() => setActiveAction({ type: 'delete', buyer: row })}
            className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
            title="Delete Buyer Account"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      )
    }
  ];

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const filteredBuyers = buyers
    .filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.companyName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchType = typeFilter === 'all' || b.buyerType === typeFilter;
      return matchSearch && matchStatus && matchType;
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

  const handleExecuteAction = () => {
    if (!activeAction) return;
    const { type, buyer } = activeAction;
    let successMsg = '';

    setBuyers((prev) => {
      if (type === 'delete') {
        successMsg = `Buyer account ${buyer.name} has been deleted`;
        return prev.filter((b) => b.id !== buyer.id);
      }
      return prev.map((b) => {
        if (b.id === buyer.id) {
          const nextStatus = type === 'suspend' ? 'suspended' : 'active';
          successMsg = `Buyer account ${buyer.name} is now ${nextStatus}`;
          return { ...b, status: nextStatus as 'active' | 'suspended' };
        }
        return b;
      });
    });

    success(successMsg);
    setActiveAction(null);
  };

  const getDialogDetails = () => {
    if (!activeAction) return { title: '', desc: '', variant: 'danger' as const };
    const name = activeAction.buyer.name;
    switch (activeAction.type) {
      case 'suspend':
        return {
          title: 'Suspend Buyer Account',
          desc: `Are you sure you want to suspend the wholesale/retail buyer ${name}? They will be blocked from processing checkout orders on the platform.`,
          variant: 'danger' as const
        };
      case 'activate':
        return {
          title: 'Activate Buyer Account',
          desc: `Are you sure you want to activate the buyer account for ${name}? They will instantly regain checkouts capability.`,
          variant: 'primary' as const
        };
      case 'delete':
        return {
          title: 'Delete Buyer Profile',
          desc: `WARNING: Are you sure you want to permanently delete the profile of ${name}? This action is irreversible and removes their purchase orders record tracking.`,
          variant: 'danger' as const
        };
    }
  };

  const dialogDetails = getDialogDetails();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Buyers Registry"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Buyers' }]}
        action={
          <div className="text-xs font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            Wholesale Buyers: {buyers.filter(b => b.buyerType === 'wholesaler').length} | Retailers: {buyers.filter(b => b.buyerType === 'retailer').length}
          </div>
        }
      />

      {/* Filter and Table List */}
      <DataTable
        columns={columns}
        data={filteredBuyers}
        searchPlaceholder="Search by ID, name, company..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        filterSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Types</option>
                <option value="wholesaler">Wholesalers</option>
                <option value="retailer">Retailers</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Confirm dialogues */}
      <ConfirmDialog
        isOpen={activeAction !== null}
        title={dialogDetails.title}
        description={dialogDetails.desc}
        confirmText="Confirm Action"
        variant={dialogDetails.variant}
        onConfirm={handleExecuteAction}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
