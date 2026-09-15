import { useCallback, useEffect, useState } from 'react';
import { Check, FileSearch, RefreshCw, X } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import DocumentList from '@/components/shared/DocumentList';
import { useToast } from '@/components/shared/Toast';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';
import {
  decideVerification, formatDate, getVerificationReview, listVerifications
} from '@/lib/superadmin-api';
import type { VerificationCase, VerificationReview } from '@/lib/superadmin-api';

type Page = { items: VerificationCase[]; nextCursor: string | null };

export default function CompanyVerification() {
  const { accessToken } = useSuperAdminSession();
  const { success, error } = useToast();

  const [page, setPage] = useState<Page>({ items: [], nextCursor: null });
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<VerificationCase | null>(null);
  const [review, setReview] = useState<VerificationReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [deciding, setDeciding] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try { setPage(await listVerifications(accessToken, { status: 'queued', limit: 50 })); }
    catch { error('Unable to load the verification queue.'); }
    finally { setLoading(false); }
  }, [accessToken, error]);

  useEffect(() => { void load(); }, [load]);

  async function openCase(item: VerificationCase) {
    if (!accessToken) return;
    setSelected(item);
    setReview(null);
    setNote('');
    setReviewLoading(true);
    try { setReview(await getVerificationReview(accessToken, item.id)); }
    catch { error('Unable to load what this case is about.'); }
    finally { setReviewLoading(false); }
  }

  async function decide(decision: 'approved' | 'rejected') {
    if (!accessToken || !selected) return;

    if (decision === 'rejected' && !note.trim()) {
      error('Give a reason before rejecting.');
      return;
    }
    setDeciding(true);
    try {
      await decideVerification(accessToken, selected.id, decision, note.trim() || undefined);
      success(`Verification ${decision}.`);
      setSelected(null);
      setReview(null);
      setNote('');
      await load();
    } catch {
      error('The verification decision could not be saved.');
    } finally {
      setDeciding(false);
    }
  }

  const subject = review?.subject;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Registry"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: 'Verification' }]}
        action={
          <button onClick={() => void load()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4 text-sm font-semibold text-foreground">
          {loading ? 'Loading queue…' : `${page.items.length} actionable verification case${page.items.length === 1 ? '' : 's'}`}
        </div>
        {!loading && page.items.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No queued verification cases.</p>
        )}
        <div className="divide-y divide-border">
          {page.items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="min-w-40 flex-1">
                <p className="font-semibold capitalize text-foreground">{item.subjectType.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted {formatDate(item.createdAt)} · priority {item.priority}
                  {item.slaDueAt ? ` · due ${formatDate(item.slaDueAt)}` : ''}
                </p>
              </div>
              <StatusBadge status={item.status} />
              <button
                onClick={() => void openCase(item)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <FileSearch className="h-3.5 w-3.5" />Review
              </button>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Review verification</h2>
                <p className="text-xs text-muted-foreground">
                  {review ? `${review.case.organisationName} · ${review.case.subjectType.replace(/_/g, ' ')}` : 'Loading…'}
                </p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close"
                className="cursor-pointer rounded-lg p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-auto px-6 py-5">
              {reviewLoading && <p className="text-sm text-muted-foreground">Loading the submitted item…</p>}

              {review && (
                <>
                  <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Under review</h3>
                    <p className="text-base font-semibold text-foreground">{subject?.title ?? '—'}</p>
                    <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
                      {subject?.reference && <div className="flex justify-between"><dt className="text-muted-foreground">Reference</dt><dd className="font-mono text-foreground">{subject.reference}</dd></div>}
                      {subject?.issuingAuthority && <div className="flex justify-between"><dt className="text-muted-foreground">Authority</dt><dd className="text-foreground">{subject.issuingAuthority}</dd></div>}
                      {subject?.issuedOn && <div className="flex justify-between"><dt className="text-muted-foreground">Issued</dt><dd className="text-foreground">{formatDate(subject.issuedOn)}</dd></div>}
                      {subject?.expiresOn && <div className="flex justify-between"><dt className="text-muted-foreground">Expires</dt><dd className="text-foreground">{formatDate(subject.expiresOn)}</dd></div>}
                      {subject?.listingSku && <div className="flex justify-between"><dt className="text-muted-foreground">Listing</dt><dd className="font-mono text-foreground">{subject.listingSku}</dd></div>}
                    </dl>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Applicant</h3>
                    <div className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
                      <div className="flex justify-between"><span className="text-muted-foreground">Organisation</span><span className="text-foreground">{review.case.organisationName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Trade licence</span><span className="font-mono text-foreground">{review.case.tradeLicenceNo ?? '—'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{review.case.contactEmail ?? '—'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground">{review.case.contactPhone ?? '—'}</span></div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-border">
                    <h3 className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Submitted documents ({review.documents.length})
                    </h3>
                    <DocumentList
                      documents={review.documents}
                      emptyMessage="This organisation has submitted no documents. There is nothing to verify against."
                    />
                  </div>

                  <div>
                    <label htmlFor="decision-note" className="text-xs font-bold text-foreground/80">
                      Decision note {`(required to reject)`}
                    </label>
                    <textarea
                      id="decision-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                      placeholder="The licence scan is unreadable; please re-upload it."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => void decide('rejected')} disabled={deciding || !review}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-50">
                <X className="h-3.5 w-3.5" />Reject
              </button>
              <button onClick={() => void decide('approved')} disabled={deciding || !review}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                <Check className="h-3.5 w-3.5" />Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
