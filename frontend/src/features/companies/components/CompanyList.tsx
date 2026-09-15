import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Check, Eye, ShieldAlert, XCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import RoleTags from '@/components/shared/RoleTags';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ActionIcon from '@/components/shared/ActionIcon';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import { formatMinor, listOrganisations, setOrganisationStatus } from '@/lib/superadmin-api';
import { sortRows } from '@/lib/table';
import type { AdminOrganisation } from '@/lib/superadmin-api';

type ActionType = 'suspend' | 'activate' | 'blacklist' | 'close';

const ACTIONS: Record<ActionType, { title: string; body: (name: string) => string; status: string; blacklist?: boolean }> = {
  suspend: {
    title: 'Suspend this company?',
    body: (n) => `${n} will keep its catalogue but cannot trade until it is reinstated.`,
    status: 'suspended'
  },
  activate: {
    title: 'Reinstate this company?',
    body: (n) => `${n} will be able to sell again immediately.`,
    status: 'active',
    blacklist: false
  },
  blacklist: {
    title: 'Blacklist this company?',
    body: (n) => `${n} is suspended and flagged. Use this for confirmed fraud, not for a dispute.`,
    status: 'suspended',
    blacklist: true
  },
  close: {
    title: 'Close this company account?',
    body: (n) => `${n} is closed permanently. Order history is kept, because past invoices must still resolve.`,
    status: 'closed'
  }
};

export default function CompanyList() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<string>('legalName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeAction, setActiveAction] = useState<{ type: ActionType; company: AdminOrganisation } | null>(null);

  const companies = useApi(
    (token) => listOrganisations(token, {
      kind: 'seller',
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      limit: 100
    }),
    [search, statusFilter]
  );

  const rows = useMemo(() => {
    const items = companies.data?.items ?? [];
    return sortRows(items, sortKey, sortDirection);
  }, [companies.data, sortKey, sortDirection]);

  const columns: Column<AdminOrganisation>[] = [
    {
      key: 'legalName',
      label: 'Company',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.legalName}</span>
          <span className="text-xs text-muted-foreground">
            {row.kind === 'manufacturer' ? 'Manufacturer' : 'Importer / supplier'}
            {row.tradeLicenceNo ? ` · Licence ${row.tradeLicenceNo}` : ''}
          </span>
        </div>
      )
    },
    {
      key: 'contactEmail',
      label: 'Contact',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="text-foreground">{row.contactEmail ?? '—'}</span>
          <span className="text-muted-foreground">{row.contactPhone ?? '—'}</span>
        </div>
      )
    },
    {
      key: 'roles',
      label: 'Operates as',
      render: (row) => <RoleTags organisation={row} showCounts={false} />
    },
    { key: 'listingCount', label: 'Listings', align: 'center', sortable: true },
    { key: 'orderCount', label: 'Orders', align: 'center', sortable: true },
    {
      key: 'gmvMinor',
      label: 'Sales',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.gmvMinor, row.currency)}</span>
    },
    {
      key: 'commissionMinor',
      label: 'Commission',
      align: 'right',
      sortable: true,
      render: (row) => <span className="text-muted-foreground">{formatMinor(row.commissionMinor, row.currency)}</span>
    },
    {
      key: 'averageRating',
      label: 'Rating',
      align: 'center',
      sortable: true,
      render: (row) =>
        row.averageRating == null
          ? <span className="text-xs text-muted-foreground">No reviews</span>
          : <span className="font-bold text-foreground">★ {Number(row.averageRating).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">({row.reviewCount})</span></span>
    },
    {
      key: 'verificationStatus',
      label: 'Verification',
      sortable: true,
      render: (row) => <StatusBadge status={row.verificationStatus} />
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={row.status} />
          {row.isBlacklisted && <ShieldAlert className="h-4 w-4 text-destructive" aria-label="Blacklisted" />}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <ActionIcon label="View details" icon={Eye} onClick={() => navigate(`/companies/${row.id}`)} />

          {

}
          {row.verificationStatus === 'pending' && (
            <ActionIcon
              label="Review in verification queue"
              icon={Check}
              tone="primary"
              onClick={() => navigate('/companies/verification')}
            />
          )}

          {row.status === 'active' && (
            <ActionIcon label="Suspend company" icon={Ban} tone="danger"
              onClick={() => setActiveAction({ type: 'suspend', company: row })} />
          )}

          {row.status === 'suspended' && (
            <ActionIcon label="Reinstate company" icon={Check} tone="primary"
              onClick={() => setActiveAction({ type: 'activate', company: row })} />
          )}

          {!row.isBlacklisted && row.status !== 'closed' && (
            <ActionIcon label="Blacklist company" icon={ShieldAlert} tone="danger"
              onClick={() => setActiveAction({ type: 'blacklist', company: row })} />
          )}

          {row.status !== 'closed' && (
            <ActionIcon label="Close account" icon={XCircle} tone="danger"
              onClick={() => setActiveAction({ type: 'close', company: row })} />
          )}
        </div>
      )
    }
  ];

  async function execute() {
    if (!activeAction) return;
    const { type, company } = activeAction;
    const spec = ACTIONS[type];
    setActiveAction(null);

    const ok = await run((token) => setOrganisationStatus(token, company.id, spec.status, spec.blacklist));
    if (ok) {
      success(`${company.legalName} updated.`);
      companies.reload();
    } else {
      toastError(`${company.legalName} could not be updated.`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Management"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies' }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={companies.loading || busy}
        error={companies.error}
        onRetry={companies.reload}
        searchPlaceholder="Search by name, email or phone…"
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction); }}
        filterSlot={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </select>
        }
      />

      <ConfirmDialog
        isOpen={activeAction != null}
        title={activeAction ? ACTIONS[activeAction.type].title : ''}
        description={activeAction ? ACTIONS[activeAction.type].body(activeAction.company.legalName) : ''}
        onConfirm={execute}
        onCancel={() => setActiveAction(null)}
        variant={activeAction && activeAction.type === 'activate' ? 'primary' : 'danger'}
      />
    </div>
  );
}
