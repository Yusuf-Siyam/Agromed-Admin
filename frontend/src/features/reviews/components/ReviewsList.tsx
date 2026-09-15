import { useMemo, useState } from 'react';
import { EyeOff, MessageSquare, ShieldAlert, Star, Undo2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import { formatDate, listReviews, setReviewStatus } from '@/lib/superadmin-api';
import type { AdminReview } from '@/lib/superadmin-api';

type ActionType = 'hide' | 'remove' | 'restore';

const ACTIONS: Record<ActionType, { title: string; description: string; status: string; variant: 'danger' | 'primary' }> = {
  hide: {
    title: 'Hide this review?',
    description: 'It stops appearing on the listing. The author keeps it, and it can be restored.',
    status: 'hidden',
    variant: 'danger'
  },
  remove: {
    title: 'Remove this review?',
    description: 'Use this for content that breaks the rules, not for a review the seller dislikes.',
    status: 'removed',
    variant: 'danger'
  },
  restore: {
    title: 'Publish this review again?',
    description: 'It reappears on the listing and counts towards the seller’s rating.',
    status: 'published',
    variant: 'primary'
  }
};

export default function ReviewsList() {
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();

  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [flagFilter, setFlagFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeAction, setActiveAction] = useState<{ type: ActionType; review: AdminReview } | null>(null);
  const [reason, setReason] = useState('');

  const reviews = useApi(
    (token) => listReviews(token, { status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 }),
    [statusFilter]
  );

  const all = useMemo(() => reviews.data?.items ?? [], [reviews.data]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return all.filter((r) => {
      const byRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);
      const byFlag =
        flagFilter === 'all' ||
        (flagFilter === 'flagged' && (r.fraudFlags != null || r.fraudRiskScore > 0)) ||
        (flagFilter === 'clean' && r.fraudFlags == null && r.fraudRiskScore === 0);
      const bySearch = !needle ||
        (r.body ?? '').toLowerCase().includes(needle) ||
        (r.authorName ?? '').toLowerCase().includes(needle) ||
        r.listingSku.toLowerCase().includes(needle) ||
        r.sellerName.toLowerCase().includes(needle);
      return byRating && byFlag && bySearch;
    });
  }, [all, search, ratingFilter, flagFilter]);

  const stats = useMemo(() => {
    const flagged = all.filter((r) => r.fraudFlags != null || r.fraudRiskScore > 0).length;
    const average = all.length === 0 ? null : all.reduce((t, r) => t + r.rating, 0) / all.length;
    const byStar = (star: number) => all.filter((r) => r.rating === star).length;
    return { total: all.length, flagged, average, byStar };
  }, [all]);

  const columns: Column<AdminReview>[] = [
    {
      key: 'rating',
      label: 'Rating',
      align: 'center',
      render: (row) => <span className="font-bold text-foreground">★ {row.rating}</span>
    },
    {
      key: 'body',
      label: 'Review',
      render: (row) => (
        <div className="flex max-w-md flex-col">
          <span className="truncate text-foreground">{row.body ?? <em className="text-muted-foreground">Rating only</em>}</span>
          <span className="text-xs text-muted-foreground">
            {row.authorName ?? 'Anonymous'}
            {row.isVerifiedPurchase ? ' · verified purchase' : ''}
            {' · '}{formatDate(row.createdAt)}
          </span>
        </div>
      )
    },
    {
      key: 'listingSku',
      label: 'Listing',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-foreground">{row.listingSku}</span>
          <span className="text-xs text-muted-foreground">{row.sellerName}</span>
        </div>
      )
    },
    {
      key: 'fraudRiskScore',
      label: 'Fraud signal',
      align: 'center',
      render: (row) =>
        row.fraudFlags == null && row.fraudRiskScore === 0
          ? <span className="text-xs text-muted-foreground">—</span>
          : (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive"
              title={row.fraudFlags ?? undefined}
            >
              <ShieldAlert className="h-3 w-3" />
              { }
              {Math.round(row.fraudRiskScore * 100)}%
            </span>
          )
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === 'published' && (
            <>
              <button
                onClick={() => { setReason(''); setActiveAction({ type: 'hide', review: row }); }}
                className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
                title="Hide"
              >
                <EyeOff className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setReason(''); setActiveAction({ type: 'remove', review: row }); }}
                className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
                title="Remove"
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
            </>
          )}
          {row.status !== 'published' && (
            <button
              onClick={() => { setReason(''); setActiveAction({ type: 'restore', review: row }); }}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Publish again"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  async function execute() {
    if (!activeAction) return;
    const { type, review } = activeAction;
    const spec = ACTIONS[type];

    if (type !== 'restore' && reason.trim().length === 0) {
      toastError('Say why the review is being taken down.');
      return;
    }

    setActiveAction(null);
    const ok = await run((token) => setReviewStatus(token, review.id, spec.status, reason.trim() || undefined));
    if (ok) {
      success('Review updated.');
      reviews.reload();
    } else {
      toastError('That review could not be updated.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews and Moderation" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews' }]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Reviews" value={stats.total} icon={MessageSquare} />
        <StatCard title="Average rating" value={stats.average == null ? '—' : `★ ${stats.average.toFixed(2)}`} icon={Star} />
        <StatCard title="Fraud signals" value={stats.flagged} icon={ShieldAlert} />
        <StatCard title="Five star" value={stats.byStar(5)} icon={Star} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={reviews.loading || busy}
        error={reviews.error}
        onRetry={reviews.reload}
        searchPlaceholder="Search review text, author, listing or company..."
        searchValue={search}
        onSearchChange={setSearch}
        filterSlot={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All stars</option>
                {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} star{s === 1 ? '' : 's'}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Signal:</span>
              <select
                value={flagFilter}
                onChange={(e) => setFlagFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All</option>
                <option value="flagged">Flagged</option>
                <option value="clean">Clean</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="pending_moderation">Pending moderation</option>
                <option value="hidden">Hidden</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={activeAction != null}
        title={activeAction ? ACTIONS[activeAction.type].title : ''}
        description={activeAction ? ACTIONS[activeAction.type].description : ''}
        confirmText="Confirm"
        variant={activeAction ? ACTIONS[activeAction.type].variant : 'danger'}
        onConfirm={execute}
        onCancel={() => setActiveAction(null)}
      />

      {activeAction && activeAction.type !== 'restore' && (
        <div className="fixed bottom-6 left-1/2 z-[60] w-full max-w-md -translate-x-1/2 rounded-xl border border-border bg-card p-4 shadow-xl">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="moderation-reason">
            Reason (recorded against the review)
          </label>
          <input
            id="moderation-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="Duplicate content from one account"
          />
        </div>
      )}
    </div>
  );
}
