import { useState } from 'react';
import { CreditCard, Calendar, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import StatCard from '@/components/shared/StatCard';
import PercentageBadge from '@/components/shared/PercentageBadge';

interface SalesTransaction {
  id: string;
  date: string;
  company: string;
  value: number;
  commissionRate: number;
  platformEarning: number;
  status: string;
}

export default function SalesTransactions() {
  // Mock data of platform-wide transactions (view-only)
  const mockTransactions: SalesTransaction[] = [
    { id: 'TXN-9041', date: '2026-08-11', company: 'Acme Agritech Solutions', value: 1200.00, commissionRate: 10.0, platformEarning: 120.00, status: 'completed' },
    { id: 'TXN-9040', date: '2026-08-11', company: 'Bayer CropScience BD', value: 780.00, commissionRate: 10.0, platformEarning: 78.00, status: 'completed' },
    { id: 'TXN-9039', date: '2026-08-10', company: 'Greenfield Agro Ltd.', value: 4500.00, commissionRate: 8.0, platformEarning: 360.00, status: 'completed' },
    { id: 'TXN-9038', date: '2026-08-09', company: 'Sufala Fertilizer Co.', value: 2400.00, commissionRate: 10.0, platformEarning: 240.00, status: 'completed' },
    { id: 'TXN-9037', date: '2026-08-08', company: 'Organic Roots BD', value: 950.00, commissionRate: 10.0, platformEarning: 95.00, status: 'completed' },
    { id: 'TXN-9036', date: '2026-08-05', company: 'Teesta Seed Distributors', value: 1800.00, commissionRate: 10.0, platformEarning: 180.00, status: 'completed' },
    { id: 'TXN-9035', date: '2026-08-03', company: 'Greenfield Agro Ltd.', value: 3200.00, commissionRate: 8.0, platformEarning: 256.00, status: 'completed' },
    { id: 'TXN-9034', date: '2026-08-01', company: 'Acme Agritech Solutions', value: 650.00, commissionRate: 10.0, platformEarning: 65.00, status: 'pending' }
  ];

  // Filters State
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Reset Filters
  const handleResetFilters = () => {
    setStartDate('2026-08-01');
    setEndDate('2026-08-11');
    setCompanyFilter('all');
    setSearch('');
  };

  // Perform Filtering
  const filteredTxns = mockTransactions.filter((txn) => {
    const matchCompany = companyFilter === 'all' || txn.company === companyFilter;
    const matchSearch =
      txn.id.toLowerCase().includes(search.toLowerCase()) ||
      txn.company.toLowerCase().includes(search.toLowerCase());
    const matchDate = txn.date >= startDate && txn.date <= endDate;
    return matchCompany && matchSearch && matchDate;
  });

  // Calculate Metrics based on filtered items
  const totalSales = filteredTxns.reduce((acc, curr) => acc + curr.value, 0);
  const totalEarnings = filteredTxns.reduce((acc, curr) => acc + curr.platformEarning, 0);
  const txnPercent = filteredTxns.length > 0 ? (totalEarnings / totalSales) * 100 : 0;

  const columns: Column<SalesTransaction>[] = [
    { key: 'date', label: 'Transaction Date', sortable: true },
    { key: 'id', label: 'Txn ID' },
    {
      key: 'company',
      label: 'Agro Company',
      sortable: true,
      render: (row) => <span className="font-bold text-foreground">{row.company}</span>
    },
    {
      key: 'value',
      label: 'Transaction Value (GMV)',
      align: 'right',
      sortable: true,
      render: (row) => `$${row.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'commissionRate',
      label: 'Commission Cut',
      align: 'center',
      render: (row) => <PercentageBadge value={row.commissionRate} type="commission" />
    },
    {
      key: 'platformEarning',
      label: 'Platform Earnings',
      align: 'right',
      sortable: true,
      render: (row) => `$${row.platformEarning.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sales Transactions"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Financial', href: '/sales' }, { label: 'Sales' }]}
        action={
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        }
      />

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FinancialSummaryCard
          label="Total Sales (GMV)"
          amount={totalSales}
          subtext={`Cumulative sales value for filtered period`}
          variant="info"
        />
        <StatCard
          title="Number of Transactions"
          value={filteredTxns.length}
          icon={CreditCard}
        />
        <FinancialSummaryCard
          label="Platform Revenue Share"
          amount={totalEarnings}
          subtext={`Avg. cut: ${txnPercent.toFixed(1)}%`}
          variant="success"
        />
      </div>

      {/* Filters workspace bar */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-foreground tracking-wide uppercase">Transaction Search & Date Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase">Filter by Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Companies</option>
              <option value="Acme Agritech Solutions">Acme Agritech Solutions</option>
              <option value="Bayer CropScience BD">Bayer CropScience BD</option>
              <option value="Greenfield Agro Ltd.">Greenfield Agro Ltd.</option>
              <option value="Sufala Fertilizer Co.">Sufala Fertilizer Co.</option>
              <option value="Organic Roots BD">Organic Roots BD</option>
              <option value="Teesta Seed Distributors">Teesta Seed Distributors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions list DataTable */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Audited Transactions Ledger</h3>
        <DataTable
          columns={columns}
          data={filteredTxns}
          searchPlaceholder="Search transactions by ID or company..."
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>
    </div>
  );
}
