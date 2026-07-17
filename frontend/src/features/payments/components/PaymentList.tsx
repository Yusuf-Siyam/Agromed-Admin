import { useState } from 'react';
import { CreditCard, DollarSign, ShieldCheck, Check, Ban, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/components/shared/Toast';
import { mockPayments, mockRefundRequests } from '@/mock-data/payments';
import type { PaymentHistoryItem, RefundRequestItem } from '@/mock-data/payments';

export default function PaymentList() {
  const { success } = useToast();

  const [payments] = useState<PaymentHistoryItem[]>(mockPayments);
  const [refundRequests, setRefundRequests] = useState<RefundRequestItem[]>(mockRefundRequests);

  // Search & Filter state
  const [paymentSearch, setPaymentSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  // Refund actions state
  const [activeRefundAction, setActiveRefundAction] = useState<{
    type: 'approve' | 'reject';
    refund: RefundRequestItem;
  } | null>(null);

  // Financial statistics calculation
  const totalRevenue = '$248,500.00';
  const sslGross = '$184,200.00';
  const codGross = '$64,300.00';
  const successPcts = '94.2%';

  // Payment Table Columns
  const paymentColumns: Column<PaymentHistoryItem>[] = [
    { key: 'id', label: 'Txn ID' },
    {
      key: 'payerName',
      label: 'Payer Customer',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.payerName}</span>
          <span className="text-xs text-muted-foreground">{row.payerPhone}</span>
        </div>
      )
    },
    {
      key: 'method',
      label: 'Payment Method',
      render: (row) => (
        <span className="font-bold text-xs uppercase text-foreground/80">
          {row.method}
        </span>
      )
    },
    { key: 'amount', label: 'Amount Paid', align: 'center' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'date', label: 'Date', sortable: true }
  ];

  // Refund Table Columns
  const refundColumns: Column<RefundRequestItem>[] = [
    { key: 'id', label: 'Req ID' },
    { key: 'orderId', label: 'Order ID' },
    { key: 'customerName', label: 'Customer Name', render: (row) => <span className="font-semibold">{row.customerName}</span> },
    { key: 'reason', label: 'Refund Reason', render: (row) => <span className="text-xs text-muted-foreground line-clamp-1">{row.reason}</span> },
    { key: 'amount', label: 'Refund Amount', align: 'center' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => setActiveRefundAction({ type: 'approve', refund: row })}
                className="p-1.5 hover:bg-info/10 text-info hover:text-info rounded-lg transition-colors cursor-pointer"
                title="Approve Refund"
              >
                <Check className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setActiveRefundAction({ type: 'reject', refund: row })}
                className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
                title="Reject Refund"
              >
                <Ban className="h-4.5 w-4.5" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Payment filtering
  const filteredPayments = payments.filter((pay) => {
    const matchSearch =
      pay.id.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      pay.payerName.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchMethod = methodFilter === 'all' || pay.method === methodFilter;
    return matchSearch && matchMethod;
  });

  // Refund Action Confirm
  const handleExecuteRefund = () => {
    if (!activeRefundAction) return;

    const { type, refund } = activeRefundAction;
    let successMsg = '';

    setRefundRequests((prev) =>
      prev.map((r) => {
        if (r.id === refund.id) {
          const nextStatus = type === 'approve' ? 'approved' : 'rejected';
          successMsg = `Refund request ${refund.id} of ${refund.amount} has been ${nextStatus}`;
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );

    success(successMsg);
    setActiveRefundAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Payments & Finance Logs" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Payments' }]} />

      {/* Revenue StatCards overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Platform Gross" value={totalRevenue} icon={DollarSign} />
        <StatCard title="SSLCommerz Gross Gateway" value={sslGross} icon={CreditCard} />
        <StatCard title="Cash on Delivery Total" value={codGross} icon={ShieldCheck} />
        <StatCard title="Transaction Success Rate" value={successPcts} icon={TrendingUp} />
      </div>

      {/* Grid: CSS Bar Chart (left) and Refund requests list (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CSS Chart: Collection methods per month comparison */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm lg:col-span-1 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-foreground tracking-wide">Monthly Collection Gateways</h3>
          
          <div className="h-48 flex items-end justify-between gap-4 border-b border-border/80 pb-2 px-2">
            {[
              { label: 'Apr', ssl: '65%', cod: '35%' },
              { label: 'May', ssl: '75%', cod: '25%' },
              { label: 'Jun', ssl: '80%', cod: '20%' },
              { label: 'Jul', ssl: '85%', cod: '15%' }
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-6 flex flex-col justify-end h-full gap-0.5 rounded overflow-hidden">
                  <div className="bg-secondary w-full animate-in slide-in-from-bottom duration-300" style={{ height: col.cod }} title={`COD ${col.cod}`} />
                  <div className="bg-primary w-full animate-in slide-in-from-bottom duration-300" style={{ height: col.ssl }} title={`SSLCommerz ${col.ssl}`} />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">{col.label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 text-xs font-semibold justify-center">
            <span className="flex items-center gap-1 text-primary">
              <span className="w-2.5 h-2.5 rounded bg-primary" /> SSLCommerz
            </span>
            <span className="flex items-center gap-1 text-secondary-foreground">
              <span className="w-2.5 h-2.5 rounded bg-secondary" /> Cash on Delivery
            </span>
          </div>
        </div>

        {/* Refund requests */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-bold text-foreground px-1">Customer Refund Requests</h3>
          <DataTable columns={refundColumns} data={refundRequests} />
        </div>

      </div>

      {/* Payment history list */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground px-1">Payment Transactions History</h3>
        
        <DataTable
          columns={paymentColumns}
          data={filteredPayments}
          searchPlaceholder="Search Transaction ID, payer..."
          searchValue={paymentSearch}
          onSearchChange={setPaymentSearch}
          filterSlot={
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Gateway:</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Gateways</option>
                <option value="SSLCommerz">SSLCommerz</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="bKash">bKash</option>
              </select>
            </div>
          }
        />
      </div>

      {/* Refund Approve/Reject Dialog */}
      <ConfirmDialog
        isOpen={activeRefundAction !== null}
        title={activeRefundAction?.type === 'approve' ? 'Approve Refund Request' : 'Reject Refund Request'}
        description={
          activeRefundAction?.type === 'approve'
            ? `Are you sure you want to approve the refund of ${activeRefundAction?.refund.amount} to ${activeRefundAction?.refund.customerName}? The amount will be credited back via payment method.`
            : `Are you sure you want to reject the refund of ${activeRefundAction?.refund.amount} to ${activeRefundAction?.refund.customerName}?`
        }
        confirmText="Confirm Action"
        variant={activeRefundAction?.type === 'approve' ? 'primary' : 'danger'}
        onConfirm={handleExecuteRefund}
        onCancel={() => setActiveRefundAction(null)}
      />
    </div>
  );
}
