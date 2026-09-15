import { useMemo, useState } from 'react';
import { Check, Languages, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import { listTranslationQueue, reviewTranslation } from '@/lib/superadmin-api';
import type { TranslationQueueItem } from '@/lib/superadmin-api';

/**
 * The Bangla review queue.
 *
 * Every translated string carries `source` and `is_reviewed`, and migration 003
 * is explicit about why: a machine translation of a medicine category shown to a
 * farmer is a safety question, not a presentation one. Until this screen existed
 * those two columns had no reader — the 55 seeded category names were flagged
 * unreviewed and there was nowhere to act on it.
 *
 * Two outcomes, and they mean different things. "Approve" accepts the existing
 * text and leaves source='machine': a person read the machine's output and
 * agreed with it. Editing the text first makes it source='human': the reviewer
 * is now the author. The audit log records either as a review event.
 */
export default function TranslationReview() {
  const { success, error: toastError } = useToast();
  const { run, busy, error: writeError } = useApiAction();

  const [search, setSearch] = useState('');
  const [showReviewed, setShowReviewed] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const queue = useApi(
    (token) => listTranslationQueue(token, 'category', showReviewed),
    [showReviewed]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const all = queue.data ?? [];
    if (!needle) return all;
    return all.filter((r) =>
      (r.entityCode ?? '').toLowerCase().includes(needle)
      || (r.sourceValue ?? '').toLowerCase().includes(needle)
      || r.value.includes(search.trim()));
  }, [queue.data, search]);

  async function approve(row: TranslationQueueItem) {
    const edited = edits[row.id];
    const changed = edited != null && edited.trim() !== row.value;

    if (edited != null && edited.trim().length === 0) {
      toastError('A translation cannot be blank.');
      return;
    }

    const ok = await run((token) =>
      reviewTranslation(token, row.id, changed ? edited.trim() : null));

    if (ok) {
      success(changed
        ? `${row.entityCode ?? 'Translation'} corrected and marked reviewed.`
        : `${row.entityCode ?? 'Translation'} accepted as written.`);
      setEdits(({ [row.id]: _drop, ...rest }) => rest);
      queue.reload();
    } else {
      toastError(writeError ?? 'That translation could not be saved.');
    }
  }

  const columns: Column<TranslationQueueItem>[] = [
    {
      key: 'entityCode',
      label: 'Category',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.sourceValue ?? '—'}</span>
          <span className="text-xs text-muted-foreground">{row.entityCode ?? row.entityType}</span>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Bangla',
      render: (row) => (
        <input
          aria-label={`Bangla name for ${row.sourceValue ?? row.entityCode ?? 'category'}`}
          className="w-full min-w-[220px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={edits[row.id] ?? row.value}
          onChange={(e) => setEdits({ ...edits, [row.id]: e.target.value })}
        />
      )
    },
    {
      key: 'source',
      label: 'Origin',
      align: 'center',
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          row.source === 'human'
            ? 'bg-success/15 text-success'
            : 'bg-warning/15 text-warning'}`}>
          {row.source}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => {
        const changed = edits[row.id] != null && edits[row.id].trim() !== row.value;
        return (
          <button
            type="button"
            disabled={busy}
            onClick={() => approve(row)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {changed ? 'Save & approve' : 'Approve'}
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bangla translation review"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categories' },
          { label: 'Translations' }
        ]}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-warning/20 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning shadow-sm">
              <Languages className="h-4 w-4" />
              {rows.length} {showReviewed ? 'reviewed' : 'awaiting review'}
            </div>
            <button
              onClick={() => setShowReviewed((v) => !v)}
              aria-pressed={showReviewed}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              {showReviewed ? 'Show outstanding' : 'Show reviewed'}
            </button>
          </div>
        }
      />

      <p className="text-xs text-muted-foreground">
        These Bangla names were generated, not written. A farmer choosing a medicine reads the
        Bangla, so each one needs a person to confirm it says what the English says. Approving
        without editing records that you accepted the generated text; editing it first records
        you as its author.
      </p>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={queue.loading}
        error={queue.error}
        onRetry={queue.reload}
        searchPlaceholder="Search by category or name..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {!queue.loading && !queue.error && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Languages className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            {showReviewed
              ? 'Nothing has been reviewed yet.'
              : search.trim()
                ? 'No outstanding translation matches that search.'
                : 'Every Bangla category name has been reviewed.'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {showReviewed
              ? 'Approved names will appear here.'
              : 'New categories will show up here as they are created.'}
          </p>
        </div>
      )}
    </div>
  );
}
