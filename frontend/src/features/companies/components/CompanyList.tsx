import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Check, X as CloseIcon, Trash2, Ban, Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { mockCompanies } from '@/mock-data/companies';
import type { CompanyItem } from '@/mock-data/companies';
import CompanyModal from './CompanyModal';

export default function CompanyList() {
  const navigate = useNavigate();
  const { success } = useToast();

  // Local state for companies to simulate operations (verify, suspend, delete, etc.)
  const [companies, setCompanies] = useState<CompanyItem[]>(mockCompanies);

  // Modal state for adding new company
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sorting state
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Action Dialog state
  const [activeAction, setActiveAction] = useState<{
    type: 'verify' | 'reject' | 'suspend' | 'activate' | 'delete';
    company: CompanyItem;
  } | null>(null);

  const handleSaveCompany = (newCompany: CompanyItem) => {
    setCompanies((prev) => [newCompany, ...prev]);
    success(`Company "${newCompany.name}" registered successfully!`);
    setIsModalOpen(false);
  };

  // Table columns definition
  const columns: Column<CompanyItem>[] = [
    { key: 'id', label: 'Company ID', sortable: true },
    {
      key: 'name',
      label: 'Company Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.website}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    { key: 'productsCount', label: 'Products', align: 'center', sortable: true },
    { key: 'salesCount', label: 'Total Sales', align: 'center', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-foreground">★ {row.rating}</span>
      )
    },
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
          {/* View Details */}
          <button
            onClick={() => navigate(`/companies/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>

          {/* Pending specific actions */}
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => setActiveAction({ type: 'verify', company: row })}
                className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
                title="Verify Company"
              >
                <Check className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setActiveAction({ type: 'reject', company: row })}
                className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
                title="Reject Company"
              >
                <CloseIcon className="h-4.5 w-4.5" />
              </button>
            </>
          )}

          {/* Active specific actions */}
          {row.status === 'active' && (
            <button
              onClick={() => setActiveAction({ type: 'suspend', company: row })}
              className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
              title="Suspend Company"
            >
              <Ban className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Suspended specific actions */}
          {row.status === 'suspended' && (
            <button
              onClick={() => setActiveAction({ type: 'activate', company: row })}
              className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
              title="Re-activate Company"
            >
              <Check className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Delete action */}
          <button
            onClick={() => setActiveAction({ type: 'delete', company: row })}
            className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
            title="Delete Company"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      )
    }
  ];

  // Perform sorting, searching, and filtering on local state
  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const filteredCompanies = companies
    .filter((comp) => {
      const matchSearch =
        comp.name.toLowerCase().includes(search.toLowerCase()) ||
        comp.id.toLowerCase().includes(search.toLowerCase()) ||
        comp.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || comp.status === statusFilter;
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

  // Action execution
  const handleExecuteAction = () => {
    if (!activeAction) return;

    const { type, company } = activeAction;
    let successMsg = '';

    setCompanies((prev) => {
      if (type === 'delete') {
        successMsg = `Company ${company.name} deleted successfully`;
        return prev.filter((c) => c.id !== company.id);
      }

      return prev.map((c) => {
        if (c.id === company.id) {
          let nextStatus: 'active' | 'suspended' | 'pending' = c.status;
          if (type === 'verify' || type === 'activate') {
            nextStatus = 'active';
            successMsg = `Company ${company.name} is now verified and active`;
          } else if (type === 'suspend') {
            nextStatus = 'suspended';
            successMsg = `Company ${company.name} has been suspended`;
          } else if (type === 'reject') {
            nextStatus = 'suspended'; // map to suspended or filter out, let's keep as suspended
            successMsg = `Company registration for ${company.name} rejected`;
          }
          return { ...c, status: nextStatus };
        }
        return c;
      });
    });

    success(successMsg);
    setActiveAction(null);
  };

  // Generate confirmation messages dynamically
  const getDialogDetails = () => {
    if (!activeAction) return { title: '', desc: '', variant: 'primary' as const };

    const name = activeAction.company.name;
    switch (activeAction.type) {
      case 'verify':
        return {
          title: 'Verify Registration',
          desc: `Are you sure you want to approve and verify ${name}? They will gain immediate access to sell products and manage orders on the platform.`,
          variant: 'primary' as const
        };
      case 'reject':
        return {
          title: 'Reject Registration',
          desc: `Are you sure you want to reject the registration of ${name}? They will be marked as inactive and blocked.`,
          variant: 'danger' as const
        };
      case 'suspend':
        return {
          title: 'Suspend Account',
          desc: `Are you sure you want to suspend ${name}? They will be blocked from accessing the platform and their active products will be hidden from buyers.`,
          variant: 'danger' as const
        };
      case 'activate':
        return {
          title: 'Re-activate Account',
          desc: `Are you sure you want to lift the suspension and activate ${name}? They will regain access to their products and active orders.`,
          variant: 'primary' as const
        };
      case 'delete':
        return {
          title: 'Delete Company Account',
          desc: `WARNING: Are you sure you want to permanently delete the profile of ${name}? This action is irreversible and will remove all their catalog items.`,
          variant: 'danger' as const
        };
    }
  };

  const dialogDetails = getDialogDetails();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Agro Companies"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies' }]}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Company
          </button>
        }
      />

      {/* Filter and Search Table */}
      <DataTable
        columns={columns}
        data={filteredCompanies}
        searchPlaceholder="Search by ID, name, email..."
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
              <option value="all">All Verification States</option>
              <option value="active">Active</option>
              <option value="pending">Pending Verification</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        }
      />

      {/* Add Company Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCompany}
        existingCount={companies.length}
      />

      {/* Action Dialog Confirmation */}
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
