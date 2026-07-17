import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Ban, Check, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { mockFarmers } from '@/mock-data/farmers';
import type { FarmerItem } from '@/mock-data/farmers';

export default function FarmerList() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [farmers, setFarmers] = useState<FarmerItem[]>(mockFarmers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [activeAction, setActiveAction] = useState<{
    type: 'suspend' | 'activate' | 'delete';
    farmer: FarmerItem;
  } | null>(null);

  const columns: Column<FarmerItem>[] = [
    { key: 'id', label: 'Farmer ID', sortable: true },
    {
      key: 'name',
      label: 'Farmer Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      )
    },
    { key: 'phone', label: 'Phone' },
    { key: 'district', label: 'District', sortable: true },
    { key: 'totalOrders', label: 'Total Orders', align: 'center', sortable: true },
    { key: 'totalSpent', label: 'Spent Amount', align: 'center', sortable: true },
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
            onClick={() => navigate(`/farmers/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View Profile Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>

          {row.status === 'active' ? (
            <button
              onClick={() => setActiveAction({ type: 'suspend', farmer: row })}
              className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
              title="Suspend Farmer"
            >
              <Ban className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveAction({ type: 'activate', farmer: row })}
              className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
              title="Activate Farmer"
            >
              <Check className="h-4.5 w-4.5" />
            </button>
          )}

          <button
            onClick={() => setActiveAction({ type: 'delete', farmer: row })}
            className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
            title="Delete Farmer Account"
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

  const filteredFarmers = farmers
    .filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.id.toLowerCase().includes(search.toLowerCase()) ||
        f.phone.includes(search);
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchSearch && matchStatus;
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
    const { type, farmer } = activeAction;
    let successMsg = '';

    setFarmers((prev) => {
      if (type === 'delete') {
        successMsg = `Farmer ${farmer.name} deleted successfully`;
        return prev.filter((f) => f.id !== farmer.id);
      }
      return prev.map((f) => {
        if (f.id === farmer.id) {
          const nextStatus = type === 'suspend' ? 'suspended' : 'active';
          successMsg = `Farmer ${farmer.name} is now ${nextStatus}`;
          return { ...f, status: nextStatus as 'active' | 'suspended' };
        }
        return f;
      });
    });

    success(successMsg);
    setActiveAction(null);
  };

  const getDialogDetails = () => {
    if (!activeAction) return { title: '', desc: '', variant: 'danger' as const };
    const name = activeAction.farmer.name;
    switch (activeAction.type) {
      case 'suspend':
        return {
          title: 'Suspend Farmer Account',
          desc: `Are you sure you want to suspend ${name}? They will be temporarily restricted from placing new orders or participating in platform services.`,
          variant: 'danger' as const
        };
      case 'activate':
        return {
          title: 'Re-activate Farmer Account',
          desc: `Are you sure you want to lift the suspension for ${name}? This will restore their active order placing capabilities immediately.`,
          variant: 'primary' as const
        };
      case 'delete':
        return {
          title: 'Delete Farmer Profile',
          desc: `WARNING: Are you sure you want to permanently delete the profile of ${name}? This operation is irreversible and removes their billing history database records.`,
          variant: 'danger' as const
        };
    }
  };

  const dialogDetails = getDialogDetails();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Farmers Registry"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Farmers' }]}
        action={
          <div className="text-xs font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            Total Active Registered: {farmers.filter(f => f.status === 'active').length}
          </div>
        }
      />

      {/* Filter and Table List */}
      <DataTable
        columns={columns}
        data={filteredFarmers}
        searchPlaceholder="Search by ID, name, phone..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        filterSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
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
