import { useEffect, useState } from 'react';
import { Download, Eye, FileText, ShieldCheck, X } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/shared/Toast';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';
import { downloadDocument, fetchDocumentObjectUrl, formatDate } from '@/lib/superadmin-api';
import type { AdminDocument } from '@/lib/superadmin-api';

export default function DocumentList({
  documents,
  loading,
  emptyMessage = 'No documents have been submitted.'
}: {
  documents: AdminDocument[];
  loading?: boolean;
  emptyMessage?: string;
}) {
  const { accessToken } = useSuperAdminSession();
  const { error } = useToast();
  const [preview, setPreview] = useState<{ doc: AdminDocument; url: string; type: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  async function open(doc: AdminDocument) {
    if (!accessToken) return;
    setBusy(doc.id);
    try {
      const { url, contentType } = await fetchDocumentObjectUrl(accessToken, doc.documentKind, doc.id);
      setPreview({ doc, url, type: contentType });
    } catch {
      error('That document could not be opened.');
    } finally {
      setBusy(null);
    }
  }

  async function save(doc: AdminDocument) {
    if (!accessToken) return;
    setBusy(doc.id);
    try {
      await downloadDocument(accessToken, doc.documentKind, doc.id,
        `${doc.documentType}-${doc.reference ?? doc.id.slice(0, 8)}`);
    } catch {
      error('That document could not be downloaded.');
    } finally {
      setBusy(null);
    }
  }

  function close() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  if (loading) return <p className="p-6 text-center text-sm text-muted-foreground">Loading documents…</p>;
  if (documents.length === 0) return <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>;

  return (
    <>
      <ul className="divide-y divide-border">
        {documents.map((doc) => (
          <li key={`${doc.documentKind}-${doc.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-48 flex-1">
              <p className="text-sm font-semibold capitalize text-foreground">
                {doc.documentType.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {doc.reference ?? 'No reference'}
                {doc.issuingAuthority ? ` · ${doc.issuingAuthority}` : ''}
                {doc.listingSku ? ` · ${doc.listingSku}` : ''}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {doc.issuedOn && <div>Issued {formatDate(doc.issuedOn)}</div>}
              {doc.expiresOn && <div>Expires {formatDate(doc.expiresOn)}</div>}
            </div>
            <StatusBadge status={doc.status} />
            <div className="flex items-center gap-1">
              {doc.hasDocument ? (
                <>
                  <button
                    onClick={() => open(doc)}
                    disabled={busy === doc.id}
                    title="View document"
                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => save(doc)}
                    disabled={busy === doc.id}
                    title="Download document"
                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">No file attached</span>
              )}
            </div>
            {doc.rejectionReason && (
              <p className="w-full text-xs text-destructive">Rejected: {doc.rejectionReason}</p>
            )}
          </li>
        ))}
      </ul>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold capitalize text-foreground">
                  {preview.doc.documentType.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-muted-foreground">{preview.doc.reference}</span>
              </div>
              <button onClick={close} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-muted/30 p-4">
              {preview.type.startsWith('image/') ? (
                <img src={preview.url} alt={preview.doc.documentType} className="mx-auto max-h-full object-contain" />
              ) : (
                <object data={preview.url} type={preview.type} className="h-full w-full">
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    This file cannot be previewed here. Download it to open it.
                  </p>
                </object>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
