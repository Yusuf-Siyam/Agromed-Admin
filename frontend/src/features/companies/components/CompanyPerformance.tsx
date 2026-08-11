import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import PercentageBadge from '@/components/shared/PercentageBadge';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import { Building2, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface CompanyPerformanceItem {
  rank: number;
  id: string;
  name: string;
  totalSales: number;
  commissionRate: number;
  platformEarnings: number;
  growthRate: number;
  contribution: number;
}

export default function CompanyPerformance() {
  // Mock performance data mapping v2 mediator metrics
  const mockPerformance: CompanyPerformanceItem[] = [
    { rank: 1, id: 'COMP-003', name: 'Bayer CropScience BD', totalSales: 620000, commissionRate: 10.0, platformEarnings: 62000, growthRate: 18.2, contribution: 36.4 },
    { rank: 2, id: 'COMP-001', name: 'Greenfield Agro Ltd.', totalSales: 420000, commissionRate: 8.0, platformEarnings: 33600, growthRate: 12.4, contribution: 24.6 },
    { rank: 3, id: 'COMP-002', name: 'Acme Agritech Solutions', totalSales: 260000, commissionRate: 10.0, platformEarnings: 26000, growthRate: 8.5, contribution: 15.2 },
    { rank: 4, id: 'COMP-004', name: 'Sufala Fertilizer Co.', totalSales: 110000, commissionRate: 10.0, platformEarnings: 11000, growthRate: -4.2, contribution: 6.4 },
    { rank: 5, id: 'COMP-006', name: 'Organic Roots BD', totalSales: 90000, commissionRate: 10.0, platformEarnings: 9000, growthRate: 14.6, contribution: 5.3 },
    { rank: 6, id: 'COMP-005', name: 'Teesta Seed Distributors', totalSales: 47500, commissionRate: 10.0, platformEarnings: 4750, growthRate: 2.1, contribution: 2.8 }
  ];

  const [search, setSearch] = useState('');

  const filteredData = mockPerformance.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const topPerformer = mockPerformance[0];
  const lowestPerformer = mockPerformance[mockPerformance.length - 1];

  const columns: Column<CompanyPerformanceItem>[] = [
    {
      key: 'rank',
      label: 'Rank',
      align: 'center',
      render: (row) => <span className="font-mono font-bold text-muted-foreground">#{row.rank}</span>
    },
    {
      key: 'name',
      label: 'Company Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-foreground">{row.name}</span>
        </div>
      )
    },
    {
      key: 'totalSales',
      label: 'Total Sales (GMV)',
      align: 'right',
      render: (row) => `$${row.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'commissionRate',
      label: 'Commission Rate',
      align: 'center',
      render: (row) => <PercentageBadge value={row.commissionRate} type="commission" />
    },
    {
      key: 'platformEarnings',
      label: 'Platform Earnings',
      align: 'right',
      render: (row) => `$${row.platformEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'growthRate',
      label: 'Growth Rate',
      align: 'center',
      render: (row) => <PercentageBadge value={row.growthRate} type="growth" />
    },
    {
      key: 'contribution',
      label: 'Share Share',
      align: 'center',
      render: (row) => <PercentageBadge value={row.contribution} type="contribution" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Company Performance"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: 'Performance' }]}
        action={
          <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Activity className="h-3.5 w-3.5" />
            Rankings Auto-compiled
          </div>
        }
      />

      {/* Top / Lowest performing summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <div className="absolute top-3 right-3 p-1.5 bg-info/10 text-info border border-info/20 rounded-md z-15">
            <TrendingUp className="h-4 w-4" />
          </div>
          <FinancialSummaryCard
            label="Top Performance Contributor"
            amount={topPerformer.totalSales}
            subtext={`${topPerformer.name} (${topPerformer.contribution}% contribution split)`}
            variant="success"
          />
        </div>
        <div className="relative">
          <div className="absolute top-3 right-3 p-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-md z-15">
            <TrendingDown className="h-4 w-4" />
          </div>
          <FinancialSummaryCard
            label="Lowest Performance Contributor"
            amount={lowestPerformer.totalSales}
            subtext={`${lowestPerformer.name} (${lowestPerformer.contribution}% contribution split)`}
            variant="danger"
          />
        </div>
      </div>

      {/* Simple comparative horizontal bar chart */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Sales Volume (GMV) Comparative Scale</h3>
          <p className="text-xs text-muted-foreground">Direct billing volume contrast across all active third-party suppliers</p>
        </div>
        <div className="space-y-3.5 pt-2">
          {mockPerformance.map((comp, idx) => (
            <div key={idx} className="flex items-center gap-4 text-xs font-semibold">
              <span className="w-40 text-foreground/80 truncate">{comp.name}</span>
              <div className="flex-1 bg-muted rounded-full h-3 relative">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(comp.totalSales / topPerformer.totalSales) * 100}%` }}
                />
              </div>
              <span className="w-24 text-right text-foreground font-mono font-bold">${comp.totalSales.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Performance DataTable */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Performance Audits Registry</h3>
        <DataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search performance metrics by company..."
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>
    </div>
  );
}
