import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Briefcase } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockServiceProviders } from '@/mock-data/service-providers';
import type { ServiceProviderItem } from '@/mock-data/service-providers';

export default function ServiceProviderList() {
  const navigate = useNavigate();

  const [providers] = useState<ServiceProviderItem[]>(mockServiceProviders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const columns: Column<ServiceProviderItem>[] = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'name',
      label: 'Service Provider',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      align: 'center',
      render: (row) => <span className="font-bold text-foreground">★ {row.rating}</span>
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
          <button
            onClick={() => navigate(`/service-providers/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View Details"
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

  const filteredProviders = providers
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Service Providers"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Service Providers' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Briefcase className="h-4 w-4" />
            Service Providers Registry (Monitor Only)
          </div>
        }
      />

      {/* Filter and Table List */}
      <DataTable
        columns={columns}
        data={filteredProviders}
        searchPlaceholder="Search by ID, name, category..."
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
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
