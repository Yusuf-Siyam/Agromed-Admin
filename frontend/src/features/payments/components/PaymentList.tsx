import { useMemo, useState } from 'react';
import { Ban, Check, CreditCard, DollarSign, ShieldCheck, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import { formatDate, formatMinor, listCases, listPayments, transitionReturn } from '@/lib/superadmin-api';
import type { AdminPayment, CaseQueueItem } from '@/lib/superadmin-api';

const GATEWAYS = [
  { value: 'all', label: 'All methods' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash_on_delivery', label: 'Cash on delivery' }
];

const METHOD_LABEL: Record<string, string> = {
  bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', card: 'Card',
  bank_transfer: 'Bank transfer', cash_on_delivery: 'Cash on delivery', credit: 'Credit'
};

export default function PaymentList() {
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();

  const [paymentSearch, setPaymentSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [activeRefundAction, setActiveRefundAction] =
    useState<{ type: 'approve' | 'reject'; refund: CaseQueueItem } | null>(null);

  const payments = useApi(
    (token) => listPayments(token, { method: methodFilter === 'all' ? undefined : methodFilter, limit: 100 }),
    [methodFilter]
  );

  const refunds = useApi((token) => listCases(token, 'return', { status: 'requested', limit: 50 }), []);

  const rows = useMemo(() => {
    const items = payments.data?.items ?? [];
    const needle = paymentSearch.trim().toLowerCase();
    if (!needle) return items;

    return items.filter((p) =>
      p.orderNumber.toLowerCase().includes(needle) ||
      (p.providerReference ?? '').toLowerCase().includes(needle) ||
      p.buyerName.toLowerCase().includes(needle) ||
      p.sellerName.toLowerCase().includes(needle));
  }, [payments.data, paymentSearch]);

  const totals = useMemo(() => {
    const items = payments.data?.items ?? [];
    const captured = items.filter((p) => p.status === 'captured');
    const currency = items[0]?.currency ?? 'BDT';
    const sum = (list: AdminPayment[]) => list.reduce((t, p) => t + p.amountMinor, 0);
    const cod = captured.filter((p) => p.method === 'cash_on_delivery');
    const online = captured.filter((p) => p.method !== 'cash_on_delivery');
    const settled = items.filter((p) => p.status !== 'pending');
    return {
      currency,
      total: sum(captured),
      online: sum(online),
      cod: sum(cod),
      successRate: settled.length === 0 ? null : (captured.length / settled.length) * 100
    };
  }, [payments.data]);

  const paymentColumns: Column<AdminPayment>[] = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.orderNumber}</span>
          <span className="text-xs text-muted-foreground">{row.providerReference ?? 'No gateway reference'}</span>
        </div>
      )
    },
    {
      key: 'buyerName',
      label: 'Payer',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.buyerName}</span>
          <span className="text-xs text-muted-foreground">to {row.sellerName}</span>
        </div>
      )
    },
    { key: 'method', label: 'Method', render: (row) => METHOD_LABEL[row.method] ?? row.method },
    {
      key: 'amountMinor',
      label: 'Amount',
      align: 'right',
      render: (row) => <span className="font-semibold">{formatMinor(row.amountMinor, row.currency)}</span>
    },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const refundColumns: Column<CaseQueueItem>[] = [
    { key: 'id', label: 'Case', render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}</span> },
    {
      key: 'amountMinor',
      label: 'Refund',
      align: 'right',
      render: (row) => <span className="font-semibold">{formatMinor(row.amountMinor)}</span>
    },
    { key: 'createdAt', label: 'Raised', render: (row) => formatDate(row.createdAt) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setActiveRefundAction({ type: 'approve', refund: row })}
            className="p-1.5 hover:bg-info/10 text-info rounded-lg transition-colors cursor-pointer"
            title="Approve refund"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveRefundAction({ type: 'reject', refund: row })}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
            title="Reject refund"
          >
            <Ban className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  async function handleExecuteRefund() {
    if (!activeRefundAction) return;
    const { type, refund } = activeRefundAction;
    setActiveRefundAction(null);

    const ok = await run((token) =>
      transitionReturn(
        token,
        refund.id,
        type === 'approve' ? 'approved' : 'rejected',
        type === 'approve' ? 'Refund approved from the payments console.' : 'Refund declined after review.',
        type === 'approve'
      ));

    if (ok) {
      success(type === 'approve' ? 'Refund approved.' : 'Refund rejected.');
      refunds.reload();
    } else {
      toastError('That refund decision could not be saved.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payments and Refunds" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Payments' }]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Captured" value={formatMinor(totals.total, totals.currency)} icon={DollarSign} />
        <StatCard title="Online gateways" value={formatMinor(totals.online, totals.currency)} icon={CreditCard} />
        <StatCard title="Cash on delivery" value={formatMinor(totals.cod, totals.currency)} icon={ShieldCheck} />
        <StatCard
          title="Capture rate"
          value={totals.successRate == null ? '—' : `${totals.successRate.toFixed(1)}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground px-1">Refund requests awaiting a decision</h3>
        <DataTable
          columns={refundColumns}
          data={refunds.data?.items ?? []}
          isLoading={refunds.loading || busy}
          error={refunds.error}
          onRetry={refunds.reload}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground px-1">Payment transactions</h3>
        <DataTable
          columns={paymentColumns}
          data={rows}
          isLoading={payments.loading}
          error={payments.error}
          onRetry={payments.reload}
          searchPlaceholder="Search order number, reference or party..."
          searchValue={paymentSearch}
          onSearchChange={setPaymentSearch}
          filterSlot={
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Method:</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {GATEWAYS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          }
        />
      </div>

      <ConfirmDialog
        isOpen={activeRefundAction != null}
        title={activeRefundAction?.type === 'approve' ? 'Approve this refund?' : 'Reject this refund?'}
        description={
          activeRefundAction
            ? activeRefundAction.type === 'approve'
              ? `${formatMinor(activeRefundAction.refund.amountMinor)} goes back to the buyer through the original payment method, and the platform reverses its commission on that value.`
              : `The buyer is told the return was declined. They can still raise a dispute.`
            : ''
        }
        confirmText="Confirm"
        variant={activeRefundAction?.type === 'approve' ? 'primary' : 'danger'}
        onConfirm={handleExecuteRefund}
        onCancel={() => setActiveRefundAction(null)}
      />
    </div>
  );
}
