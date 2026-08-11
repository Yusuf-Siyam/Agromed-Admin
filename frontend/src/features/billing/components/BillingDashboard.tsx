import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { ArrowRightLeft, Check, RefreshCw } from 'lucide-react';

interface CompanySettlement {
  id: string;
  companyName: string;
  grossSales: number;
  discount: number;
  commission: number;
  tax: number;
  gatewayFee: number;
  settlementAmount: number;
  status: 'paid' | 'pending' | 'processing';
  date: string;
}

export default function BillingDashboard() {
  const { success } = useToast();

  // Mock Company Settlements dataset (calculating balances)
  const [settlements, setSettlements] = useState<CompanySettlement[]>([
    {
      id: 'SET-901',
      companyName: 'Bayer CropScience BD',
      grossSales: 620000,
      discount: 9300, // 1.5%
      commission: 62000, // 10%
      tax: 31000, // 5%
      gatewayFee: 12400, // 2%
      settlementAmount: 505300, // gross - discount - commission - tax - gateway
      status: 'pending',
      date: '2026-08-11'
    },
    {
      id: 'SET-902',
      companyName: 'Greenfield Agro Ltd.',
      grossSales: 420000,
      discount: 6300,
      commission: 33600, // 8% override
      tax: 21000,
      gatewayFee: 8400,
      settlementAmount: 350700,
      status: 'paid',
      date: '2026-08-10'
    },
    {
      id: 'SET-903',
      companyName: 'Acme Agritech Solutions',
      grossSales: 260000,
      discount: 3900,
      commission: 26000, // 10%
      tax: 13000,
      gatewayFee: 5200,
      settlementAmount: 211900,
      status: 'processing',
      date: '2026-08-11'
    },
    {
      id: 'SET-904',
      companyName: 'Sufala Fertilizer Co.',
      grossSales: 110000,
      discount: 1650,
      commission: 11000, // 10%
      tax: 5500,
      gatewayFee: 2200,
      settlementAmount: 89650,
      status: 'paid',
      date: '2026-08-08'
    }
  ]);

  // Dialog active action state
  const [activeAction, setActiveAction] = useState<{
    type: 'mark_paid' | 'mark_pending';
    settlement: CompanySettlement;
  } | null>(null);

  // Search filter
  const [search, setSearch] = useState('');

  const filteredSettlements = settlements.filter((item) =>
    item.companyName.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleExecuteSettlement = () => {
    if (!activeAction) return;

    const { type, settlement } = activeAction;
    const nextStatus = type === 'mark_paid' ? 'paid' : 'pending';

    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === settlement.id) {
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );

    success(`Settlement ID ${settlement.id} successfully updated to ${nextStatus.toUpperCase()}`);
    setActiveAction(null);
  };

  const columns: Column<CompanySettlement>[] = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'companyName',
      label: 'Agro Company',
      render: (row) => <span className="font-bold">{row.companyName}</span>
    },
    {
      key: 'grossSales',
      label: 'Gross (GMV)',
      align: 'right',
      render: (row) => `$${row.grossSales.toLocaleString()}`
    },
    {
      key: 'discount',
      label: 'Discount',
      align: 'right',
      render: (row) => `-$${row.discount.toLocaleString()}`
    },
    {
      key: 'commission',
      label: 'Commission',
      align: 'right',
      render: (row) => `-$${row.commission.toLocaleString()}`
    },
    {
      key: 'tax',
      label: 'Tax (5%)',
      align: 'right',
      render: (row) => `-$${row.tax.toLocaleString()}`
    },
    {
      key: 'gatewayFee',
      label: 'Gateway (2%)',
      align: 'right',
      render: (row) => `-$${row.gatewayFee.toLocaleString()}`
    },
    {
      key: 'settlementAmount',
      label: 'Payout Net Owed',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-info">
          ${row.settlementAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Update Payout',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          {row.status !== 'paid' ? (
            <button
              onClick={() => setActiveAction({ type: 'mark_paid', settlement: row })}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-info/10 text-info border border-info/20 hover:bg-info hover:text-white rounded-lg transition-colors cursor-pointer font-bold"
            >
              <Check className="h-3.5 w-3.5" />
              Mark Paid
            </button>
          ) : (
            <button
              onClick={() => setActiveAction({ type: 'mark_pending', settlement: row })}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-muted border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors cursor-pointer font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5 text-secondary-foreground" />
              Re-pending
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Billing & settlements"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Financial', href: '/billing' }, { label: 'Settlements' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <ArrowRightLeft className="h-4 w-4" />
            Payout settlements queue
          </div>
        }
      />

      {/* Section 1: Financial Dashboard summary grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-foreground tracking-wide uppercase px-1">Consolidated platform accounting</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <FinancialSummaryCard label="Total Billing (GMV)" amount={1248500.00} variant="info" />
          <FinancialSummaryCard label="Pending Settlement" amount={296350.00} variant="warning" />
          <FinancialSummaryCard label="Completed Settlement" amount={827300.00} variant="success" />
          <FinancialSummaryCard label="Commission Collected" amount={76350.00} variant="success" />
          <FinancialSummaryCard label="Commission Pending" amount={18500.00} variant="warning" />
          <FinancialSummaryCard label="Platform Total Tax Cut (5%)" amount={62425.00} variant="default" />
          <FinancialSummaryCard label="Gateway Processor Fees (2%)" amount={24970.00} variant="danger" />
          <FinancialSummaryCard label="Net Platform Revenue" amount={69880.00} variant="success" />
        </div>
      </div>

      {/* Section 2: Payout Settlements table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Third-party company settlements ledger</h3>
        <DataTable
          columns={columns}
          data={filteredSettlements}
          searchPlaceholder="Search payout entries by ID or company..."
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>

      {/* Settlement status confirmation dialog */}
      <ConfirmDialog
        isOpen={activeAction !== null}
        title={activeAction?.type === 'mark_paid' ? 'Mark Payout as Completed' : 'Mark Payout as Pending'}
        description={`Are you sure you want to mark Settlement ID ${activeAction?.settlement.id} (${activeAction?.settlement.companyName}) as ${activeAction?.type === 'mark_paid' ? 'PAID' : 'PENDING'}? This adjusts the pending settlements queue balances.`}
        confirmText="Confirm"
        variant={activeAction?.type === 'mark_paid' ? 'primary' : 'warning'}
        onConfirm={handleExecuteSettlement}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
