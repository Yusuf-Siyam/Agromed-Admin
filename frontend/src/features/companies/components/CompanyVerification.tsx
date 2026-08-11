import { useState } from 'react';
import { Check, X, FileText, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { mockCompanies } from '@/mock-data/companies';
import type { CompanyItem } from '@/mock-data/companies';

export default function CompanyVerification() {
  const { success, error } = useToast();

  // Local state for verification queue
  const [companies, setCompanies] = useState<CompanyItem[]>(
    mockCompanies.filter((c) => c.status === 'pending')
  );

  // Modal / Input states
  const [activeAction, setActiveAction] = useState<{
    type: 'approve' | 'reject';
    company: CompanyItem;
  } | null>(null);

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ name: string; type: string } | null>(null);

  const handleExecuteVerification = () => {
    if (!activeAction) return;

    const { type, company } = activeAction;

    if (type === 'reject' && !rejectReason.trim()) {
      error('Please provide a reason for rejection');
      return;
    }

    setCompanies((prev) => prev.filter((c) => c.id !== company.id));

    if (type === 'approve') {
      success(`Company "${company.name}" verification approved successfully!`);
    } else {
      success(`Company "${company.name}" registration rejected. Reason: ${rejectReason}`);
    }

    setActiveAction(null);
    setRejectReason('');
    setShowRejectForm(false);
  };

  const columns: Column<CompanyItem>[] = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'name',
      label: 'Agro Company',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.website}</span>
        </div>
      )
    },
    { key: 'licenseId', label: 'License ID' },
    { key: 'joinedDate', label: 'Submission Date', sortable: true },
    {
      key: 'documents',
      label: 'Submitted Documents',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingDoc({ name: row.name, type: 'Trade License' })}
            className="flex items-center gap-1 text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer font-bold uppercase"
          >
            <FileText className="h-3 w-3 text-primary" />
            License
          </button>
          <button
            onClick={() => setViewingDoc({ name: row.name, type: 'TIN Certificate' })}
            className="flex items-center gap-1 text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer font-bold uppercase"
          >
            <FileText className="h-3 w-3 text-secondary-foreground" />
            TIN
          </button>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Verification Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setActiveAction({ type: 'approve', company: row })}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-info/10 text-info border border-info/20 hover:bg-info hover:text-white rounded-lg transition-colors cursor-pointer font-semibold"
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => {
              setActiveAction({ type: 'reject', company: row });
              setShowRejectForm(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white rounded-lg transition-colors cursor-pointer font-semibold"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Verification Registry"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: 'Verification' }]}
        action={
          <div className="text-xs font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            {companies.length} pending requests
          </div>
        }
      />

      {/* Verification Queue DataTable */}
      <DataTable
        columns={columns}
        data={companies}
        searchPlaceholder="Search pending company queue..."
      />

      {/* PDF Document Viewer Panel */}
      {viewingDoc && (
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Document Viewer: {viewingDoc.type} — {viewingDoc.name}
              </h3>
            </div>
            <button
              onClick={() => setViewingDoc(null)}
              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="h-96 bg-accent/20 border border-border/60 rounded-lg flex flex-col items-center justify-center text-center p-6">
            <FileText className="h-12 w-12 text-muted-foreground/60 mb-2 animate-bounce" />
            <span className="text-sm font-bold text-foreground">SECURE ENCRYPTED DOC PREVIEW</span>
            <span className="text-xs text-muted-foreground max-w-sm mt-1">
              License reference validated against National Business Registry API gateway. Document cryptographic signature matches issuer authority.
            </span>
          </div>
        </div>
      )}

      {/* Reject Reason input dialog sheet */}
      {showRejectForm && activeAction?.type === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowRejectForm(false);
              setActiveAction(null);
            }}
          />
          <div className="bg-card border border-border/80 w-full max-w-md rounded-xl p-6 shadow-xl relative z-10 space-y-4">
            <div className="flex gap-3">
              <div className="p-2 bg-destructive/10 text-destructive rounded-full self-start">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-foreground">Reject Onboarding</h3>
                <p className="text-xs text-muted-foreground">
                  Provide a justification reason for rejecting the registration of "{activeAction.company.name}".
                </p>
              </div>
            </div>

            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Trade License signature expired, mismatched TIN record..."
              className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setActiveAction(null);
                  setRejectReason('');
                }}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteVerification}
                className="px-3.5 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg cursor-pointer"
              >
                Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Dialog Confirmation */}
      <ConfirmDialog
        isOpen={activeAction?.type === 'approve'}
        title="Approve Company Registration"
        description={`Confirm approval of trade documents for "${activeAction?.company.name}". They will gain immediate platform credentials.`}
        confirmText="Approve"
        variant="primary"
        onConfirm={handleExecuteVerification}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
