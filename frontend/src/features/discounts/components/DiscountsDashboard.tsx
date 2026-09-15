import { useMemo, useState } from 'react';
import { AlertTriangle, Pause, Play, Plus, Tag, TrendingDown } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import {
  formatDate, formatMinor, getOfferBurn, listPlatformOffers,
  savePlatformOffer, setPlatformOfferStatus
} from '@/lib/superadmin-api';
import type { PlatformOffer } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

export default function DiscountsDashboard() {
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState<{ offer: PlatformOffer; status: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ code: '', percent: '10', budget: '100000', days: '30' });

  const offers = useApi(
    (token) => listPlatformOffers(token, { status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 }),
    [statusFilter]
  );
  const burn = useApi(
    (token) => selected ? getOfferBurn(token, selected) : Promise.resolve(null),
    [selected]
  );

  const items = offers.data?.items ?? [];

  const totals = useMemo(() => ({
    budget: items.reduce((t, o) => t + (o.budgetMinor ?? 0), 0),
    spent: items.reduce((t, o) => t + o.budgetSpentMinor, 0),
    live: items.filter((o) => o.status === 'active').length,
    exhausted: items.filter((o) => o.budgetMinor != null && o.budgetSpentMinor >= o.budgetMinor).length
  }), [items]);

  const columns: Column<PlatformOffer>[] = [
    {
      key: 'code',
      label: 'Campaign',
      render: (row) => (
        <button
          onClick={() => setSelected(row.id)}
          className={cn('cursor-pointer text-left', row.id === selected ? 'text-primary' : 'text-foreground hover:text-primary')}
        >
          <span className="block font-semibold">{row.code}</span>
          <span className="block text-xs text-muted-foreground">
            {row.discountBasis === 'percentage'
              ? `${row.discountPercent}% off ${row.discountTarget}`
              : `${formatMinor(row.discountAmountMinor, row.currency ?? 'BDT')} off`}
          </span>
        </button>
      )
    },
    {
      key: 'window',
      label: 'Window',
      render: (row) => `${formatDate(row.startsAt)} – ${row.endsAt ? formatDate(row.endsAt) : 'open'}`
    },
    {
      key: 'budget',
      label: 'Budget burn',
      render: (row) => {
        if (row.budgetMinor == null) {
          return <span className="text-xs text-muted-foreground">No budget cap</span>;
        }
        const pct = Math.min(100, (row.budgetSpentMinor / row.budgetMinor) * 100);
        const alert = row.budgetAlertPercent != null && pct >= row.budgetAlertPercent;
        return (
          <div className="min-w-40 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full', pct >= 100 ? 'bg-destructive' : alert ? 'bg-secondary' : 'bg-primary')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatMinor(row.budgetSpentMinor, row.currency ?? 'BDT')} of {formatMinor(row.budgetMinor, row.currency ?? 'BDT')}
              {alert && <AlertTriangle className="ml-1 inline h-3 w-3 text-secondary-foreground" />}
            </p>
          </div>
        );
      }
    },
    {
      key: 'redemptionCount',
      label: 'Redeemed',
      align: 'center',
      render: (row) => `${row.redemptionCount}${row.maxRedemptions ? ` / ${row.maxRedemptions}` : ''}`
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === 'active' && (
            <button
              onClick={() => setStatusChange({ offer: row, status: 'paused' })}
              className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}
          {(row.status === 'paused' || row.status === 'draft' || row.status === 'pending_approval') && (
            <button
              onClick={() => setStatusChange({ offer: row, status: 'active' })}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Activate"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  async function changeStatus() {
    if (!statusChange) return;
    const { offer, status } = statusChange;
    setStatusChange(null);

    const ok = await run((token) => setPlatformOfferStatus(token, offer.id, status));
    if (ok) {
      success(`${offer.code} is now ${status}.`);
      offers.reload();
      burn.reload();
    } else {
      toastError(`${offer.code} could not be updated.`);
    }
  }

  async function create() {
    const percent = Number(draft.percent);
    const budgetMinor = Math.round(Number(draft.budget) * 100);
    const days = Number(draft.days);
    setCreating(false);

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + days * 86400000);

    const ok = await run((token) => savePlatformOffer(token, {
      code: draft.code.trim().toUpperCase(),
      discountTarget: 'price',
      discountBasis: 'percentage',
      discountPercent: percent,
      currency: 'BDT',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      budgetMinor,
      budgetAlertPercent: 80,
      autoPauseOnExhaustion: true,
      status: 'draft'
    }));

    if (ok) {
      success(`${draft.code.toUpperCase()} created as a draft.`);
      setDraft({ code: '', percent: '10', budget: '100000', days: '30' });
      offers.reload();
    } else {
      toastError('That campaign could not be created — the code may already be in use.');
    }
  }

  const detail = burn.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Campaigns"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Discounts' }]}
        action={
          <button
            onClick={() => setCreating(true)}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />New campaign
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialSummaryCard label="Committed budget" amount={formatMinor(totals.budget)} variant="info" />
        <FinancialSummaryCard label="Spent" amount={formatMinor(totals.spent)} variant="warning" />
        <FinancialSummaryCard label="Live campaigns" amount={String(totals.live)} />
        <FinancialSummaryCard label="Budget exhausted" amount={String(totals.exhausted)} variant={totals.exhausted > 0 ? 'danger' : 'default'} />
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={offers.loading || busy}
        error={offers.error}
        onRetry={offers.reload}
        filterSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        }
      />

      {detail && (
        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            {detail.code} — burn detail
          </h3>
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Budget</dt>
              <dd className="font-semibold text-foreground">{detail.budgetMinor == null ? 'Uncapped' : formatMinor(detail.budgetMinor, detail.currency ?? 'BDT')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Counter (checkout)</dt>
              <dd className="font-semibold text-foreground">{formatMinor(detail.budgetSpentMinor, detail.currency ?? 'BDT')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Settled (from orders)</dt>
              <dd className="font-semibold text-foreground">{formatMinor(detail.settledMinor, detail.currency ?? 'BDT')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Orders</dt>
              <dd className="font-semibold text-foreground">{detail.orderCount}</dd>
            </div>
          </dl>
          {detail.settledMinor !== detail.budgetSpentMinor && (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              <TrendingDown className="h-3.5 w-3.5" />
              The counter and the order ledger disagree by{' '}
              {formatMinor(Math.abs(detail.settledMinor - detail.budgetSpentMinor), detail.currency ?? 'BDT')}.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Auto-pause on exhaustion is {detail.autoPauseOnExhaustion ? 'on' : 'off'}.
            {detail.budgetAlertPercent != null && ` Alert at ${detail.budgetAlertPercent}% of budget.`}
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={statusChange != null}
        title={statusChange?.status === 'paused' ? 'Pause this campaign?' : 'Activate this campaign?'}
        description={
          statusChange?.status === 'paused'
            ? `${statusChange.offer.code} stops applying at checkout immediately. Orders already placed keep their discount.`
            : `${statusChange?.offer.code ?? ''} starts applying at checkout within its window and budget.`
        }
        confirmText="Confirm"
        variant={statusChange?.status === 'paused' ? 'danger' : 'primary'}
        onConfirm={changeStatus}
        onCancel={() => setStatusChange(null)}
      />

      {creating && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={() => setCreating(false)} />
          <div className="relative w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">New platform campaign</h2>
            <p className="text-sm text-muted-foreground">
              Created as a draft, funded by the platform. Activate it when the budget is agreed.
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-foreground/80">
                Code
                <input
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                  placeholder="AMAN2026"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-xs font-semibold text-foreground/80">
                  Percent
                  <input
                    type="number" min="1" max="100"
                    value={draft.percent}
                    onChange={(e) => setDraft({ ...draft, percent: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="block text-xs font-semibold text-foreground/80">
                  Budget (৳)
                  <input
                    type="number" min="1"
                    value={draft.budget}
                    onChange={(e) => setDraft({ ...draft, budget: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="block text-xs font-semibold text-foreground/80">
                  Days
                  <input
                    type="number" min="1"
                    value={draft.days}
                    onChange={(e) => setDraft({ ...draft, days: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setCreating(false)} className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground">Cancel</button>
              <button
                onClick={create}
                disabled={busy || draft.code.trim().length === 0}
                className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                Create draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
