import { useState } from 'react';
import { Eye, Shield, Wrench, Activity } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  provider: string;
  description: string;
  status: 'active' | 'suspended' | 'pending';
  requestsCount: number;
  basePrice: number;
}

export default function ServiceList() {
  // Mock services dataset (view-only monitor)
  const [services] = useState<ServiceItem[]>([
    { id: 'SRV-001', title: 'Deep Ground Tillage', category: 'Machinery Rental', provider: 'Rahman Tractor Services', description: 'Heavy machinery deep ploughing for soil preparation using dual-tined subsoilers.', status: 'active', requestsCount: 84, basePrice: 120.00 },
    { id: 'SRV-002', title: 'N-P-K Soil Chemistry Test', category: 'Soil Diagnostics', provider: 'North Soil Labs', description: 'Lab diagnosis testing for essential nitrogen, phosphorus, and potassium ratios.', status: 'active', requestsCount: 142, basePrice: 45.00 },
    { id: 'SRV-003', title: 'Drip System Layout Plan', category: 'Water Management', provider: 'Jamuna Irrigation Consultants', description: 'Irrigation map blueprint drafting customized for slope levels and water sources.', status: 'pending', requestsCount: 12, basePrice: 250.00 },
    { id: 'SRV-004', title: 'Pesticide Drone Spraying', category: 'Crop Consulting', provider: 'Bayer CropScience BD', description: 'Aerial drone deployment mapping and spraying of pesticide on large acreage farms.', status: 'active', requestsCount: 210, basePrice: 180.00 },
    { id: 'SRV-005', title: 'Organic Matter Calibration', category: 'Soil Diagnostics', provider: 'North Soil Labs', description: 'Detailed determination of soil organic carbon levels with fertilizer calibration charts.', status: 'active', requestsCount: 65, basePrice: 60.00 },
    { id: 'SRV-006', title: 'Harvester Machine Rental', category: 'Machinery Rental', provider: 'Acme Agritech Solutions', description: 'High-performance grain combine harvester rentals with experienced driver operators.', status: 'suspended', requestsCount: 38, basePrice: 350.00 }
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [viewingService, setViewingService] = useState<ServiceItem | null>(null);

  // Filters logic
  const filteredServices = services.filter((srv) => {
    const matchSearch =
      srv.title.toLowerCase().includes(search.toLowerCase()) ||
      srv.category.toLowerCase().includes(search.toLowerCase()) ||
      srv.provider.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || srv.status === statusFilter;
    const matchProvider = providerFilter === 'all' || srv.provider === providerFilter;

    return matchSearch && matchStatus && matchProvider;
  });

  // Extract unique providers for filter dropdown
  const uniqueProviders = Array.from(new Set(services.map((s) => s.provider)));

  const columns: Column<ServiceItem>[] = [
    { key: 'id', label: 'Service ID' },
    {
      key: 'title',
      label: 'Service Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{row.description}</span>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'provider',
      label: 'Service Provider',
      sortable: true,
      render: (row) => <span className="font-semibold">{row.provider}</span>
    },
    {
      key: 'requestsCount',
      label: 'Farmer Requests',
      align: 'center',
      sortable: true,
      render: (row) => <span className="font-mono font-bold">{row.requestsCount} reqs</span>
    },
    {
      key: 'basePrice',
      label: 'Base Rate Fee',
      align: 'right',
      sortable: true,
      render: (row) => `$${row.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
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
        <button
          onClick={() => setViewingService(row)}
          className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          title="View Details"
        >
          <Eye className="h-4.5 w-4.5" />
        </button>
      )
    }
  ];

  const totalActive = services.filter((s) => s.status === 'active').length;
  const totalRequests = services.reduce((acc, curr) => acc + curr.requestsCount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Services Monitor"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Shield className="h-4 w-4" />
            Platform Services Directory (Monitor Only)
          </div>
        }
      />

      {/* KPI summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Services Offered" value={totalActive} icon={Wrench} />
        <StatCard title="Total Registered Providers" value={uniqueProviders.length} icon={Wrench} />
        <StatCard title="Total Farmer Requests" value={totalRequests} icon={Activity} />
      </div>

      {/* DataTable List with Custom Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Registered Platform Services</h3>
        
        <DataTable
          columns={columns}
          data={filteredServices}
          searchPlaceholder="Search service name, category, provider..."
          searchValue={search}
          onSearchChange={setSearch}
          filterSlot={
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">Provider:</span>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none max-w-[200px]"
                >
                  <option value="all">All Providers</option>
                  {uniqueProviders.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          }
        />
      </div>

      {/* Service Details view (modal sheet preview) */}
      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingService(null)} />
          <div className="bg-card border border-border/80 w-full max-w-md rounded-xl p-6 shadow-xl relative z-10 animate-in fade-in zoom-in-95 space-y-4">
            
            <div className="flex justify-between items-start border-b border-border/60 pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground leading-snug">{viewingService.title}</h3>
                <span className="text-[10px] text-muted-foreground font-mono">Service ID: {viewingService.id}</span>
              </div>
              <StatusBadge status={viewingService.status} />
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase">Service Provider</span>
                <p className="text-foreground text-sm font-bold">{viewingService.provider}</p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase">Description</span>
                <p className="text-foreground/85 font-medium leading-relaxed bg-muted/40 border border-border/40 p-2.5 rounded-lg">
                  {viewingService.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] uppercase">Base price rate</span>
                  <p className="text-foreground text-sm font-black">${viewingService.basePrice.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] uppercase">Requests Count</span>
                  <p className="text-foreground text-sm font-black font-mono">{viewingService.requestsCount} Farmer orders</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/60">
              <button
                onClick={() => setViewingService(null)}
                className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
