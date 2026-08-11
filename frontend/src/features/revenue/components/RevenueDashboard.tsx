import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import PercentageBadge from '@/components/shared/PercentageBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import { DollarSign } from 'lucide-react';

interface RevenueEntry {
  id: string;
  date: string;
  sourceCompany: string;
  amount: number;
  type: 'commission' | 'transaction_fee' | 'premium_subscription';
  status: string;
}

export default function RevenueDashboard() {
  const [search, setSearch] = useState('');

  // Mock revenue details
  const mockRevenueEntries: RevenueEntry[] = [
    { id: 'REV-001', date: '2026-08-11', sourceCompany: 'Acme Agritech Solutions', amount: 120.00, type: 'commission', status: 'settled' },
    { id: 'REV-002', date: '2026-08-11', sourceCompany: 'Bayer CropScience BD', amount: 78.00, type: 'commission', status: 'settled' },
    { id: 'REV-003', date: '2026-08-10', sourceCompany: 'Greenfield Agro Ltd.', amount: 360.00, type: 'commission', status: 'settled' },
    { id: 'REV-004', date: '2026-08-10', sourceCompany: 'Acme Agritech Solutions', amount: 360.00, type: 'transaction_fee', status: 'settled' },
    { id: 'REV-005', date: '2026-08-09', sourceCompany: 'Sufala Fertilizer Co.', amount: 240.00, type: 'commission', status: 'settled' },
    { id: 'REV-006', date: '2026-08-08', sourceCompany: 'Bayer CropScience BD', amount: 250.00, type: 'premium_subscription', status: 'settled' },
    { id: 'REV-007', date: '2026-08-05', sourceCompany: 'Teesta Seed Distributors', amount: 180.00, type: 'commission', status: 'settled' },
    { id: 'REV-008', date: '2026-08-03', sourceCompany: 'Greenfield Agro Ltd.', amount: 64.00, type: 'transaction_fee', status: 'settled' }
  ];

  const columns: Column<RevenueEntry>[] = [
    { key: 'date', label: 'Billing Date', sortable: true },
    { key: 'id', label: 'Entry ID' },
    {
      key: 'sourceCompany',
      label: 'Source Company',
      sortable: true,
      render: (row) => <span className="font-bold text-foreground">{row.sourceCompany}</span>
    },
    {
      key: 'type',
      label: 'Revenue Stream',
      render: (row) => (
        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono font-bold border border-border uppercase">
          {row.type.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Earned Amount',
      align: 'right',
      sortable: true,
      render: (row) => `$${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  const filteredEntries = mockRevenueEntries.filter((item) =>
    item.sourceCompany.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Revenue Dashboard"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Financial', href: '/revenue' }, { label: 'Revenue' }]}
        action={
          <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <DollarSign className="h-3.5 w-3.5" />
            Revenue Registry Active
          </div>
        }
      />

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FinancialSummaryCard
          label="Consolidated Platform Revenue"
          amount={124850.00}
          subtext="Total commission & platform earnings"
          variant="success"
        />
        <FinancialSummaryCard
          label="Platform Net Profit"
          amount={76350.00}
          subtext="Gross earnings minus platform expenses"
          variant="info"
        />
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Revenue Growth</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-black text-foreground">+12.2%</span>
              <PercentageBadge value={12.2} type="growth" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Comparative growth rate versus last month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown by Source Company (Horizontal Scale) */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Revenue Splits by Partner</h3>
            <p className="text-xs text-muted-foreground">Commission share contributions across onboarded suppliers</p>
          </div>
          <div className="space-y-3.5 pt-2">
            {[
              { name: 'Acme Agritech Solutions', amount: 45000, pct: 36.0 },
              { name: 'Bayer CropScience BD', amount: 38000, pct: 30.4 },
              { name: 'Greenfield Agro Ltd.', amount: 29000, pct: 23.2 },
              { name: 'Sufala Fertilizer Co.', amount: 12850, pct: 10.4 }
            ].map((split, idx) => (
              <div key={idx} className="space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-foreground/80">{split.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">${split.amount.toLocaleString()}</span>
                    <PercentageBadge value={split.pct} type="contribution" />
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${split.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue vs Expenses vs Net Profit Area Chart (SVG Visualizer) */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Platform Earnings Trends</h3>
            <p className="text-xs text-muted-foreground">Comparative scale tracking gross revenue, expenses, and net profit margins</p>
          </div>
          <div className="h-48 relative border-b border-l border-border/80 mt-2">
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
              <div className="border-t border-foreground w-full" />
              <div className="border-t border-foreground w-full" />
            </div>
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Revenue Area (Primary green) */}
              <path
                d="M 0 140 Q 80 110 160 120 T 320 80 T 480 30 T 640 10"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
              />
              {/* Net Profit Area (Teal / Info) */}
              <path
                d="M 0 160 Q 80 135 160 145 T 320 110 T 480 70 T 640 45"
                fill="none"
                stroke="hsl(var(--info))"
                strokeWidth="3"
              />
              {/* Expenses Area (Red / Destructive) */}
              <path
                d="M 0 180 Q 80 175 160 175 T 320 170 T 480 160 T 640 155"
                fill="none"
                stroke="hsl(var(--destructive))"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground font-bold font-mono px-1">
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>
          <div className="flex justify-center gap-4 text-xs font-bold pt-1">
            <span className="flex items-center gap-1 text-primary">
              <span className="w-2 h-2 rounded bg-primary" /> Revenue
            </span>
            <span className="flex items-center gap-1 text-info">
              <span className="w-2 h-2 rounded bg-info" /> Net Profit
            </span>
            <span className="flex items-center gap-1 text-destructive">
              <span className="w-2 h-2 border-b border-dashed border-destructive" /> Expenses
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Entries DataTable */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Platform Revenue Transactions Ledger</h3>
        <DataTable
          columns={columns}
          data={filteredEntries}
          searchPlaceholder="Search revenue by company or stream type..."
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>
    </div>
  );
}
