import { useState } from 'react';
import { UserCheck, Play, CheckCircle2, Calendar } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { mockServices } from '@/mock-data/services';
import type { ServiceItem } from '@/mock-data/services';
import { mockCompanies } from '@/mock-data/companies';

export default function ServiceList() {
  const { success } = useToast();

  const [services, setServices] = useState<ServiceItem[]>(mockServices);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'assigned' | 'in_progress' | 'completed'>('all');

  // Dialog configurations
  const [assigningService, setAssigningService] = useState<ServiceItem | null>(null);
  const [statusUpdateService, setStatusUpdateService] = useState<{
    service: ServiceItem;
    nextStatus: 'in_progress' | 'completed';
  } | null>(null);
  const [viewingNotesService, setViewingNotesService] = useState<ServiceItem | null>(null);

  const columns: Column<ServiceItem>[] = [
    { key: 'id', label: 'Req ID' },
    {
      key: 'title',
      label: 'Service Request',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{row.description}</span>
        </div>
      )
    },
    {
      key: 'farmerName',
      label: 'Farmer',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.farmerName}</span>
          <span className="text-xs text-muted-foreground">{row.farmerPhone}</span>
        </div>
      )
    },
    {
      key: 'assignedCompany',
      label: 'Assigned Agro Partner',
      render: (row) => (
        <span className="font-semibold">
          {row.assignedCompany ? (
            row.assignedCompany
          ) : (
            <span className="text-xs text-destructive bg-destructive/5 border border-destructive/10 px-2 py-0.5 rounded font-bold uppercase">
              Unassigned
            </span>
          )}
        </span>
      )
    },
    { key: 'price', label: 'Rate Fee', align: 'center' },
    {
      key: 'status',
      label: 'Progress Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* Tracking progress notes */}
          <button
            onClick={() => setViewingNotesService(row)}
            className="px-2.5 py-1 hover:bg-muted text-foreground border border-border/80 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Track Notes
          </button>

          {/* Pending to Assign action */}
          {row.status === 'pending' && (
            <button
              onClick={() => setAssigningService(row)}
              className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
              title="Assign Agro Partner"
            >
              <UserCheck className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Assigned to In Progress action */}
          {row.status === 'assigned' && (
            <button
              onClick={() =>
                setStatusUpdateService({ service: row, nextStatus: 'in_progress' })
              }
              className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
              title="Start Service"
            >
              <Play className="h-4.5 w-4.5" />
            </button>
          )}

          {/* In Progress to Completed action */}
          {row.status === 'in_progress' && (
            <button
              onClick={() =>
                setStatusUpdateService({ service: row, nextStatus: 'completed' })
              }
              className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
              title="Mark as Completed"
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Filters logic
  const filteredServices = services.filter((srv) => {
    const matchSearch =
      srv.id.toLowerCase().includes(search.toLowerCase()) ||
      srv.title.toLowerCase().includes(search.toLowerCase()) ||
      srv.farmerName.toLowerCase().includes(search.toLowerCase());

    const matchTab = activeTab === 'all' || srv.status === activeTab;
    return matchSearch && matchTab;
  });

  // Assign Partner Action
  const handleConfirmAssign = (companyName: string) => {
    if (!assigningService) return;

    setServices((prev) =>
      prev.map((s) => {
        if (s.id === assigningService.id) {
          const nowStr = new Date().toLocaleString();
          return {
            ...s,
            assignedCompany: companyName,
            status: 'assigned',
            progressNotes: [
              ...s.progressNotes,
              { time: nowStr, note: `Partner ${companyName} assigned to service case file` }
            ]
          };
        }
        return s;
      })
    );

    success(`Service Request assigned to ${companyName} successfully`);
    setAssigningService(null);
  };

  // Status progression action
  const handleConfirmStatusUpdate = () => {
    if (!statusUpdateService) return;

    const { service, nextStatus } = statusUpdateService;
    const nowStr = new Date().toLocaleString();

    setServices((prev) =>
      prev.map((s) => {
        if (s.id === service.id) {
          const nextNotes = [...s.progressNotes];
          if (nextStatus === 'in_progress') {
            nextNotes.push({ time: nowStr, note: 'Service field operations started' });
          } else if (nextStatus === 'completed') {
            nextNotes.push({ time: nowStr, note: 'Service operations completed. Report file sent' });
          }

          return {
            ...s,
            status: nextStatus,
            progressNotes: nextNotes
          };
        }
        return s;
      })
    );

    success(`Service Status shifted to ${nextStatus === 'in_progress' ? 'In Progress' : 'Completed'}`);
    setStatusUpdateService(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Consultancy & Services Requests"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      />

      {/* Navigation tabs */}
      <div className="flex border-b border-border/60 bg-card rounded-t-xl overflow-x-auto scrollbar-none shrink-0 shadow-sm">
        {[
          { label: 'All Requests', id: 'all' as const },
          { label: 'Pending Assign', id: 'pending' as const },
          { label: 'Assigned Partners', id: 'assigned' as const },
          { label: 'In Progress', id: 'in_progress' as const },
          { label: 'Completed Services', id: 'completed' as const }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-muted/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Requests DataTable */}
      <DataTable
        columns={columns}
        data={filteredServices}
        searchPlaceholder="Search request ID, titles, farmers..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Partner Assignment Modal Overlay */}
      {assigningService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssigningService(null)} />
          <div className="bg-card border border-border/80 w-full max-w-md rounded-xl p-6 shadow-xl relative z-10 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-4">
              Assign Agro Company Partner
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Choose an active Agro Company to assign the request: <strong className="text-foreground">{assigningService.title}</strong>
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockCompanies
                .filter(c => c.status === 'active')
                .map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleConfirmAssign(company.name)}
                    className="w-full text-left p-3 border border-border hover:border-primary/40 hover:bg-muted rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <p className="text-foreground font-bold">{company.name}</p>
                    <span className="text-[10px] text-muted-foreground font-medium">Rating: ★ {company.rating} | License: {company.licenseId}</span>
                  </button>
                ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setAssigningService(null)}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking details popover */}
      {viewingNotesService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingNotesService(null)} />
          <div className="bg-card border border-border/80 w-full max-w-md rounded-xl p-6 shadow-xl relative z-10 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-1">
              {viewingNotesService.title}
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono block mb-4">Request Log: {viewingNotesService.id}</span>
            
            {/* Timeline log */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {viewingNotesService.progressNotes.map((note, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-normal">
                  <Calendar className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-0.5 font-medium">
                    <span className="text-[10px] text-muted-foreground font-bold">{note.time}</span>
                    <p className="text-foreground/80">{note.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingNotesService(null)}
                className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status shift Confirm dialog */}
      <ConfirmDialog
        isOpen={statusUpdateService !== null}
        title="Shift Service Progression status"
        description={`Are you sure you want to transition this service request status to ${
          statusUpdateService?.nextStatus === 'in_progress' ? 'In Progress' : 'Completed'
        }?`}
        confirmText="Transition State"
        variant="primary"
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => setStatusUpdateService(null)}
      />
    </div>
  );
}
