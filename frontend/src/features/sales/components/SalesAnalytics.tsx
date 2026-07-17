import { useState } from 'react';
import { TrendingUp, Award, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { mockSalesTrends, mockCategoryBreakdowns, mockCompanyPerformances } from '@/mock-data/sales';
import type { CompanyPerformanceItem } from '@/mock-data/sales';
import { cn } from '@/lib/utils';

type ActiveSection = 'platform' | 'company';
type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function SalesAnalytics() {
  // Tabs
  const [activeSection, setActiveSection] = useState<ActiveSection>('platform');
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');

  // Load trends
  const trendData = mockSalesTrends[timeframe];
  const maxTrendVal = Math.max(...trendData.map((t) => t.sales)) * 1.15 || 1000;

  // SVG Line path calculations for Platform Line Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = trendData
    .map((item, idx) => {
      const x = paddingLeft + (idx / (trendData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (item.sales / maxTrendVal) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  // Ranked Table Columns
  const companyColumns: Column<CompanyPerformanceItem>[] = [
    {
      key: 'rank',
      label: 'Rank',
      align: 'center',
      render: (row) => <span className="font-extrabold text-foreground">{row.rank}</span>
    },
    { key: 'name', label: 'Agro Company Partner', render: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
    { key: 'salesQty', label: 'Units Sold Qty', align: 'center' },
    {
      key: 'revenue',
      label: 'Revenue Generated',
      align: 'center',
      render: (row) => <span className="font-bold text-info">${row.revenue.toLocaleString()}</span>
    },
    {
      key: 'growth',
      label: 'Annual Growth Rate',
      align: 'right',
      render: (row) => {
        const isNeg = row.growth < 0;
        return (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-xs font-bold font-mono',
            isNeg ? 'text-destructive' : 'text-primary'
          )}>
            {isNeg ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {Math.abs(row.growth)}%
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sales & Business Intelligence"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sales Analytics' }]}
      />

      {/* Main Section Navigation Tabs */}
      <div className="flex border-b border-border/60 bg-card rounded-t-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveSection('platform')}
          className={cn(
            'flex-1 py-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer',
            activeSection === 'platform'
              ? 'border-primary text-primary bg-muted/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <TrendingUp className="h-4.5 w-4.5" />
          Platform Sales Trends
        </button>
        <button
          onClick={() => setActiveSection('company')}
          className={cn(
            'flex-1 py-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer',
            activeSection === 'company'
              ? 'border-primary text-primary bg-muted/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <Award className="h-4.5 w-4.5" />
          Agro Partner Analytics
        </button>
      </div>

      {/* TABS CONTENT */}

      {activeSection === 'platform' && (
        <div className="space-y-6">
          {/* Toggles bar */}
          <div className="flex justify-between items-center bg-card border border-border/80 px-4 py-3 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-muted-foreground">Select Scope Timeframe:</span>
            <div className="flex border border-border bg-background rounded-lg p-0.5 shadow-inner">
              {(['daily', 'weekly', 'monthly', 'yearly'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'px-3.5 py-1 text-[11px] font-bold uppercase rounded-md transition-all cursor-pointer',
                    timeframe === tf
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG Line Chart */}
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Revenue Collection Trends</h3>
                <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-bold uppercase">
                  Timeframe: {timeframe}
                </span>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto scrollbar-none">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[500px] h-60 text-muted-foreground font-mono">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                    const y = paddingTop + r * chartHeight;
                    const val = maxTrendVal * (1 - r);
                    return (
                      <g key={idx} className="opacity-40">
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={svgWidth - paddingRight}
                          y2={y}
                          stroke="currentColor"
                          strokeWidth="0.5"
                          strokeDasharray="4,4"
                        />
                        <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[9px] fill-current">
                          ${Math.round(val).toLocaleString()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Line Path */}
                  <polyline
                    fill="none"
                    stroke="var(--color-primary, #264653)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="text-primary"
                  />

                  {/* Dots on Point coordinates */}
                  {trendData.map((item, idx) => {
                    const x = paddingLeft + (idx / (trendData.length - 1)) * chartWidth;
                    const y = paddingTop + chartHeight - (item.sales / maxTrendVal) * chartHeight;
                    return (
                      <g key={idx} className="group cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="5.5"
                          className="fill-card stroke-primary text-primary"
                          strokeWidth="2.5"
                        />
                        <circle cx={x} cy={y} r="10" className="fill-transparent hover:fill-primary/10" />
                        <title>{`${item.label}: $${item.sales.toLocaleString()}`}</title>
                      </g>
                    );
                  })}

                  {/* Bottom Labels */}
                  {trendData.map((item, idx) => {
                    const x = paddingLeft + (idx / (trendData.length - 1)) * chartWidth;
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={svgHeight - paddingBottom + 18}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-current opacity-85"
                      >
                        {item.label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Segment / Category breakdown pie list */}
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm lg:col-span-1 flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-1.5 mb-1">
                <PieChart className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Catalog Sales Segments</h3>
              </div>

              {/* visual representation of segment donut mapping relative heights */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-muted/50" />
                {/* Visual donut ring color segments mock using dynamic linear gradient */}
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary border-r-info" />
                <div className="text-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Top</span>
                  <span className="text-sm font-black text-foreground">Seeds</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-2.5">
                {mockCategoryBreakdowns.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </span>
                    <span className="font-mono text-foreground">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'company' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top performance metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Top Performing Partner" value="Greenfield Agro" icon={Award} />
            <StatCard title="Average Partner Sales" value="$62,125" icon={TrendingUp} />
            <StatCard
              title="Awaiting Active Growth"
              value="Acme Agritech Solutions"
              icon={AlertTriangle}
              className="border-destructive/30 bg-destructive/[0.01]"
            />
          </div>

          {/* Grid for ranked table and visual comparative bars */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Ranked table of companies */}
            <div className="xl:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-foreground px-1">Agro Corporate Performance Registry</h3>
              <DataTable columns={companyColumns} data={mockCompanyPerformances} />
            </div>

            {/* Custom SVG Comparative Bar Chart */}
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm xl:col-span-1 space-y-4">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Corporate Revenue Comparison</h3>
              </div>

              {/* Vertical Bars representation */}
              <div className="space-y-4 pt-2">
                {mockCompanyPerformances.map((c, idx) => {
                  const maxRevenue = Math.max(...mockCompanyPerformances.map(cp => cp.revenue));
                  const fillPct = `${(c.revenue / maxRevenue) * 100}%`;
                  return (
                    <div key={idx} className="space-y-1.5 text-xs font-semibold">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-foreground truncate max-w-[70%]">{c.name}</span>
                        <span className="text-info font-bold">${c.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: fillPct }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
