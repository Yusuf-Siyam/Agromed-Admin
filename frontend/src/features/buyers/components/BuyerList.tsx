import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Check, Eye, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import { sortRows } from '@/lib/table';
import { districtOf, isSelfRegisteredFarmer } from '@/lib/directory';
import { formatMinor, listOrganisations, setOrganisationStatus } from '@/lib/superadmin-api';
import type { AdminOrganisation } from '@/lib/superadmin-api';

export default function BuyerList() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'farmer' | 'organisation'>('all');
  const [sortKey, setSortKey] = useState<string>('legalName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeAction, setActiveAction] =
    useState<{ type: 'suspend' | 'activate'; buyer: AdminOrganisation } | null>(null);

  const buyers = useApi(
    (token) => listOrganisations(token, {
      kind: 'buyer',
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      limit: 100
    }),
    [search, statusFilter]
  );

  const rows = useMemo(() => {
    const items = (buyers.data?.items ?? []).filter((o) => {
      if (typeFilter === 'all') return true;
      return isSelfRegisteredFarmer(o) === (typeFilter === 'farmer');
    });
    return sortRows(items, sortKey, sortDirection);
  }, [buyers.data, typeFilter, sortKey, sortDirection]);

  const columns: Column<AdminOrganisation>[] = [
    {
      key: 'legalName',
      label: 'Buyer',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.legalName}</span>
          <span className="text-xs text-muted-foreground">{row.contactEmail ?? row.slug}</span>
        </div>
      )
    },
    {
      key: 'accountType',
      label: 'Type',
      render: (row) => (
        <span className="inline-flex rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold text-foreground">
          {isSelfRegisteredFarmer(row) ? 'Farmer' : 'Organisation'}
        </span>
      )
    },
    { key: 'contactPhone', label: 'Phone', render: (row) => row.contactPhone ?? '—' },
    { key: 'district', label: 'District', render: (row) => districtOf(row) },
    { key: 'memberCount', label: 'Members', align: 'center', sortable: true },
    { key: 'orderCount', label: 'Orders', align: 'center', sortable: true },
    {
      key: 'gmvMinor',
      label: 'Total Spend',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.gmvMinor, row.currency)}</span>
    },
    {
      key: 'verificationStatus',
      label: 'Verification',
      sortable: true,
      render: (row) => <StatusBadge status={row.verificationStatus} />
    },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/buyers/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          {row.status === 'active' ? (
            <button
              onClick={() => setActiveAction({ type: 'suspend', buyer: row })}
              className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
              title="Suspend"
            >
              <Ban className="h-4.5 w-4.5" />
            </button>
          ) : row.status === 'suspended' ? (
            <button
              onClick={() => setActiveAction({ type: 'activate', buyer: row })}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Reinstate"
            >
              <Check className="h-4.5 w-4.5" />
            </button>
          ) : null}
        </div>
      )
    }
  ];

  async function execute() {
    if (!activeAction) return;
    const { type, buyer } = activeAction;
    setActiveAction(null);

    const ok = await run((token) =>
      setOrganisationStatus(token, buyer.id, type === 'suspend' ? 'suspended' : 'active'));
    if (ok) {
      success(`${buyer.legalName} updated.`);
      buyers.reload();
    } else {
      toastError(`${buyer.legalName} could not be updated.`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyers & Farmers"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Buyers & Farmers' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Users className="h-4 w-4" />
            {rows.length} {rows.length === 1 ? 'account' : 'accounts'}
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={buyers.loading || busy}
        error={buyers.error}
        onRetry={buyers.reload}
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Farmers &amp; organisations</option>
              <option value="farmer">Farmers only</option>
              <option value="organisation">Organisations only</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={activeAction != null}
        title={activeAction?.type === 'suspend' ? 'Suspend this organisation?' : 'Reinstate this organisation?'}
        description={
          activeAction?.type === 'suspend'
            ? `${activeAction.buyer.legalName} cannot place orders until it is reinstated. Orders already placed are unaffected.`
            : `${activeAction?.buyer.legalName ?? ''} can place orders again.`
        }
        confirmText="Confirm"
        variant={activeAction?.type === 'suspend' ? 'danger' : 'primary'}
        onConfirm={execute}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
