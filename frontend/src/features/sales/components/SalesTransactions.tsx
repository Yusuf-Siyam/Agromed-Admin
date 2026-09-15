import { useMemo, useState } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import { useApi } from '@/lib/useApi';
import { formatDate, formatMinor, listOrders } from '@/lib/superadmin-api';
import type { AdminOrder } from '@/lib/superadmin-api';

export default function SalesTransactions() {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  const orders = useApi((token) => listOrders(token, { search: search || undefined, limit: 100 }), [search]);
  const all = useMemo(() => orders.data?.items ?? [], [orders.data]);

  const companies = useMemo(
    () => [...new Set(all.map((o) => o.sellerName))].sort(),
    [all]
  );

  const rows = useMemo(
    () => companyFilter === 'all' ? all : all.filter((o) => o.sellerName === companyFilter),
    [all, companyFilter]
  );

  const totals = useMemo(() => {
    const traded = rows.filter((o) => !['cancelled', 'pending_payment'].includes(o.status));
    const value = traded.reduce((t, o) => t + o.grandTotalMinor, 0);
    const earning = traded.reduce((t, o) => t + o.commissionMinor, 0);
    return {
      value,
      earning,
      count: traded.length,
      rate: value === 0 ? null : (earning / value) * 100,
      currency: rows[0]?.currency ?? 'BDT'
    };
  }, [rows]);

  const columns: Column<AdminOrder>[] = [
    { key: 'orderNumber', label: 'Order' },
    { key: 'placedAt', label: 'Date', render: (row) => formatDate(row.placedAt) },
    { key: 'sellerName', label: 'Company' },
    {
      key: 'grandTotalMinor',
      label: 'Order value',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.grandTotalMinor, row.currency)}</span>
    },
    {
      key: 'rate',
      label: 'Effective rate',
      align: 'right',
      render: (row) => (
        <span className="text-muted-foreground">
          {row.grandTotalMinor === 0 ? '—' : `${((row.commissionMinor / row.grandTotalMinor) * 100).toFixed(2)}%`}
        </span>
      )
    },
    {
      key: 'commissionMinor',
      label: 'Platform earning',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.commissionMinor, row.currency)}</span>
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Transactions"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sales', href: '/sales' }, { label: 'Transactions' }]}
        action={
          <button
            onClick={orders.reload}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialSummaryCard label="Traded value" amount={formatMinor(totals.value, totals.currency)} variant="info" />
        <FinancialSummaryCard label="Platform earning" amount={formatMinor(totals.earning, totals.currency)} variant="success" />
        <FinancialSummaryCard label="Transactions" amount={String(totals.count)} />
        <FinancialSummaryCard label="Effective rate" amount={totals.rate == null ? '—' : `${totals.rate.toFixed(2)}%`} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={orders.loading}
        error={orders.error}
        onRetry={orders.reload}
        searchPlaceholder="Search order number, company or buyer..."
        searchValue={search}
        onSearchChange={setSearch}
        filterSlot={
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
            >
              <option value="all">All companies</option>
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        }
      />
    </div>
  );
}
