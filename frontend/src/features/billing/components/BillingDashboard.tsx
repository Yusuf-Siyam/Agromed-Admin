import { useMemo, useState } from 'react';
import { ArrowRightLeft, Banknote, Calculator, Check, PlayCircle, RefreshCw, Send } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import {
  approvePayout, approveSettlement, calculateSettlement, createSettlementRun,
  executeSettlement, formatDate, formatMinor, getSettlementStatement, initiatePayout,
  listPayouts, listSettlements, settlePayout
} from '@/lib/superadmin-api';
import type { AdminPayout, SettlementRun, SettlementStatementLine } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

type RunAction = 'calculate' | 'approve' | 'execute';
type PayoutAction = 'approve' | 'initiate' | 'paid';

export default function BillingDashboard() {
  const { success, error: toastError } = useToast();
  const { run: perform, busy } = useApiAction();

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runAction, setRunAction] = useState<{ type: RunAction; runId: string } | null>(null);
  const [payoutAction, setPayoutAction] = useState<{ type: PayoutAction; payout: AdminPayout } | null>(null);
  const [creating, setCreating] = useState(false);

  const runs = useApi((token) => listSettlements(token, { limit: 50 }), []);
  const payouts = useApi((token) => listPayouts(token, { limit: 100 }), []);

  const activeRunId = selectedRunId ?? runs.data?.items[0]?.id ?? null;
  const statement = useApi(
    (token) => activeRunId ? getSettlementStatement(token, activeRunId) : Promise.resolve([]),
    [activeRunId]
  );

  const totals = useMemo(() => {
    const items = payouts.data?.items ?? [];
    const by = (s: string) => items.filter((p) => p.status === s).reduce((t, p) => t + p.amountMinor, 0);
    return {
      currency: items[0]?.currency ?? 'BDT',
      awaiting: by('pending'),
      approved: by('approved') + by('processing'),
      paid: by('paid'),
      failed: by('failed')
    };
  }, [payouts.data]);

  const runColumns: Column<SettlementRun>[] = [
    {
      key: 'runReference',
      label: 'Run',
      render: (row) => (
        <button
          onClick={() => setSelectedRunId(row.id)}
          className={cn('cursor-pointer text-left font-semibold', row.id === activeRunId ? 'text-primary' : 'text-foreground hover:text-primary')}
        >
          {row.runReference}
        </button>
      )
    },
    {
      key: 'period',
      label: 'Period',
      render: (row) => `${formatDate(row.periodStart)} – ${formatDate(row.periodEnd)}`
    },
    { key: 'totalGrossMinor', label: 'Gross', align: 'right', render: (row) => formatMinor(row.totalGrossMinor, row.currency) },
    { key: 'totalCommissionMinor', label: 'Commission', align: 'right', render: (row) => formatMinor(row.totalCommissionMinor, row.currency) },
    {
      key: 'totalPayableMinor',
      label: 'Payable',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.totalPayableMinor, row.currency)}</span>
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {(row.status === 'draft' || row.status === 'calculated') && (
            <button
              onClick={() => setRunAction({ type: 'calculate', runId: row.id })}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              title="Calculate"
            >
              <Calculator className="h-4 w-4" />
            </button>
          )}
          {row.status === 'calculated' && (
            <button
              onClick={() => setRunAction({ type: 'approve', runId: row.id })}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {row.status === 'approved' && (
            <button
              onClick={() => setRunAction({ type: 'execute', runId: row.id })}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Execute — creates the payouts"
            >
              <PlayCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const statementColumns: Column<SettlementStatementLine>[] = [
    { key: 'organisationName', label: 'Company', render: (row) => <span className="font-semibold text-foreground">{row.organisationName}</span> },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    { key: 'grossMinor', label: 'Gross', align: 'right', render: (row) => formatMinor(row.grossMinor, row.currency) },
    { key: 'commissionMinor', label: 'Commission', align: 'right', render: (row) => `−${formatMinor(row.commissionMinor, row.currency)}` },
    { key: 'platformSubsidyMinor', label: 'Platform subsidy', align: 'right', render: (row) => `+${formatMinor(row.platformSubsidyMinor, row.currency)}` },
    { key: 'refundMinor', label: 'Refunds', align: 'right', render: (row) => `−${formatMinor(row.refundMinor, row.currency)}` },
    {
      key: 'netPayableMinor',
      label: 'Net payable',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.netPayableMinor, row.currency)}</span>
    }
  ];

  const payoutColumns: Column<AdminPayout>[] = [
    { key: 'organisationName', label: 'Company', render: (row) => <span className="font-semibold text-foreground">{row.organisationName}</span> },
    {
      key: 'destinationName',
      label: 'Destination',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-foreground">{row.destinationName ?? 'Not chosen'}</span>
          <span className="text-xs text-muted-foreground">{row.providerReference ?? row.method}</span>
        </div>
      )
    },
    {
      key: 'amountMinor',
      label: 'Amount',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.amountMinor, row.currency)}</span>
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === 'pending' && (
            <button
              onClick={() => setPayoutAction({ type: 'approve', payout: row })}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {row.status === 'approved' && (
            <button
              onClick={() => setPayoutAction({ type: 'initiate', payout: row })}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Send to the provider"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
          {row.status === 'processing' && (
            <button
              onClick={() => setPayoutAction({ type: 'paid', payout: row })}
              className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
              title="Mark as paid"
            >
              <Banknote className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  async function openRun() {

    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    end.setUTCDate(1);
    const start = new Date(end);
    start.setUTCMonth(start.getUTCMonth() - 1);
    setCreating(false);

    const ok = await perform((token) =>
      createSettlementRun(token, start.toISOString(), end.toISOString(), 'BDT'));
    if (ok) {
      success('Settlement run opened.');
      runs.reload();
    } else {
      toastError('That period may already be covered by another run.');
    }
  }

  async function executeRunAction() {
    if (!runAction) return;
    const { type, runId } = runAction;
    setRunAction(null);

    const ok = await perform((token) =>
      type === 'calculate' ? calculateSettlement(token, runId)
      : type === 'approve' ? approveSettlement(token, runId)
      : executeSettlement(token, runId));

    if (ok) {
      success(type === 'execute' ? 'Run executed — payouts created.' : `Run ${type}d.`);
      runs.reload();
      statement.reload();
      payouts.reload();
    } else {
      toastError('That step could not be completed.');
    }
  }

  async function executePayoutAction() {
    if (!payoutAction) return;
    const { type, payout } = payoutAction;
    setPayoutAction(null);

    const reference = `PAYOUT-${payout.id.slice(0, 8).toUpperCase()}`;
    const ok = await perform((token) =>
      type === 'approve' ? approvePayout(token, payout.id)
      : type === 'initiate' ? initiatePayout(token, payout.id, undefined, reference)
      : settlePayout(token, payout.id, 'paid', payout.providerReference ?? reference));

    if (ok) {
      success('Payout updated.');
      payouts.reload();
    } else {
      toastError(
        type === 'approve'
          ? 'A payout cannot be approved by whoever requested it.'
          : 'That payout could not be updated.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing and Settlement"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Billing' }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => { runs.reload(); payouts.reload(); statement.reload(); }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />Refresh
            </button>
            <button
              onClick={() => setCreating(true)}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />Open a run
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialSummaryCard label="Awaiting approval" amount={formatMinor(totals.awaiting, totals.currency)} variant="warning" />
        <FinancialSummaryCard label="Approved or in flight" amount={formatMinor(totals.approved, totals.currency)} variant="info" />
        <FinancialSummaryCard label="Paid" amount={formatMinor(totals.paid, totals.currency)} variant="success" />
        <FinancialSummaryCard label="Failed" amount={formatMinor(totals.failed, totals.currency)} variant="danger" />
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-base font-bold text-foreground">Settlement runs</h3>
        <DataTable
          columns={runColumns}
          data={runs.data?.items ?? []}
          isLoading={runs.loading || busy}
          error={runs.error}
          onRetry={runs.reload}
        />
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-base font-bold text-foreground">
          Statement {activeRunId ? `· ${runs.data?.items.find((r) => r.id === activeRunId)?.runReference ?? ''}` : ''}
        </h3>
        <DataTable
          columns={statementColumns}
          data={statement.data ?? []}
          isLoading={statement.loading}
          error={statement.error}
          onRetry={statement.reload}
        />
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-base font-bold text-foreground">Payouts</h3>
        <DataTable
          columns={payoutColumns}
          data={payouts.data?.items ?? []}
          isLoading={payouts.loading || busy}
          error={payouts.error}
          onRetry={payouts.reload}
        />
      </div>

      <ConfirmDialog
        isOpen={creating}
        title="Open a settlement run for last month?"
        description="The run is created as a draft. Nothing is calculated and no money moves until you choose to."
        confirmText="Open run"
        variant="primary"
        onConfirm={openRun}
        onCancel={() => setCreating(false)}
      />

      <ConfirmDialog
        isOpen={runAction != null}
        title={
          runAction?.type === 'calculate' ? 'Calculate this run?'
          : runAction?.type === 'approve' ? 'Approve this run?'
          : 'Execute this run?'
        }
        description={
          runAction?.type === 'calculate'
            ? 'Every delivered order in the period that is not already settled is swept into this run. Safe to repeat while the run is unapproved.'
            : runAction?.type === 'approve'
              ? 'The totals are frozen. Recalculating afterwards is refused.'
              : 'One pending payout is created per seller. Releasing each one is a separate, two-person act.'
        }
        confirmText="Confirm"
        variant={runAction?.type === 'execute' ? 'danger' : 'primary'}
        onConfirm={executeRunAction}
        onCancel={() => setRunAction(null)}
      />

      <ConfirmDialog
        isOpen={payoutAction != null}
        title={
          payoutAction?.type === 'approve' ? 'Approve this payout?'
          : payoutAction?.type === 'initiate' ? 'Send this payout to the provider?'
          : 'Mark this payout as paid?'
        }
        description={
          payoutAction
            ? payoutAction.type === 'approve'
              ? `${formatMinor(payoutAction.payout.amountMinor, payoutAction.payout.currency)} to ${payoutAction.payout.organisationName}. Whoever requested the payout cannot be the one to approve it.`
              : payoutAction.type === 'initiate'
                ? `The money is handed to the provider against ${payoutAction.payout.organisationName}'s verified destination.`
                : `Records that the provider settled ${formatMinor(payoutAction.payout.amountMinor, payoutAction.payout.currency)}.`
            : ''
        }
        confirmText="Confirm"
        variant={payoutAction?.type === 'approve' ? 'primary' : 'danger'}
        onConfirm={executePayoutAction}
        onCancel={() => setPayoutAction(null)}
      />
    </div>
  );
}
