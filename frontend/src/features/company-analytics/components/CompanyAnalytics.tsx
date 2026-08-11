import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import PercentageBadge from '@/components/shared/PercentageBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import { Building2, Award, TrendingUp, TrendingDown, Percent } from 'lucide-react';

interface CompanyPerformanceData {
  id: string;
  name: string;
  sales: number;
  pctContribution: number;
  growthHistory: { month: string; rate: number }[];
}

export default function CompanyAnalytics() {
  // Mock performance database
  const mockCompanyData: CompanyPerformanceData[] = [
    {
      id: 'COMP-003',
      name: 'Bayer CropScience BD',
      sales: 620000,
      pctContribution: 36.4,
      growthHistory: [
        { month: 'Mar', rate: 10.2 },
        { month: 'Apr', rate: 12.5 },
        { month: 'May', rate: 15.1 },
        { month: 'Jun', rate: 14.8 },
        { month: 'Jul', rate: 18.2 }
      ]
    },
    {
      id: 'COMP-001',
      name: 'Greenfield Agro Ltd.',
      sales: 420000,
      pctContribution: 24.6,
      growthHistory: [
        { month: 'Mar', rate: 8.5 },
        { month: 'Apr', rate: 9.2 },
        { month: 'May', rate: 11.0 },
        { month: 'Jun', rate: 12.1 },
        { month: 'Jul', rate: 12.4 }
      ]
    },
    {
      id: 'COMP-002',
      name: 'Acme Agritech Solutions',
      sales: 260000,
      pctContribution: 15.2,
      growthHistory: [
        { month: 'Mar', rate: 6.0 },
        { month: 'Apr', rate: 5.5 },
        { month: 'May', rate: 7.2 },
        { month: 'Jun', rate: 8.0 },
        { month: 'Jul', rate: 8.5 }
      ]
    },
    {
      id: 'COMP-004',
      name: 'Sufala Fertilizer Co.',
      sales: 110000,
      pctContribution: 6.4,
      growthHistory: [
        { month: 'Mar', rate: 2.1 },
        { month: 'Apr', rate: -1.5 },
        { month: 'May', rate: -3.0 },
        { month: 'Jun', rate: -4.5 },
        { month: 'Jul', rate: -4.2 }
      ]
    },
    {
      id: 'COMP-006',
      name: 'Organic Roots BD',
      sales: 90000,
      pctContribution: 5.3,
      growthHistory: [
        { month: 'Mar', rate: 12.0 },
        { month: 'Apr', rate: 13.5 },
        { month: 'May', rate: 11.2 },
        { month: 'Jun', rate: 13.9 },
        { month: 'Jul', rate: 14.6 }
      ]
    },
    {
      id: 'COMP-005',
      name: 'Teesta Seed Distributors',
      sales: 47500,
      pctContribution: 2.8,
      growthHistory: [
        { month: 'Mar', rate: 1.0 },
        { month: 'Apr', rate: 1.5 },
        { month: 'May', rate: 2.2 },
        { month: 'Jun', rate: 2.0 },
        { month: 'Jul', rate: 2.1 }
      ]
    }
  ];

  const [selectedCompId, setSelectedCompId] = useState<string>('COMP-003');

  const selectedCompany = mockCompanyData.find((c) => c.id === selectedCompId) || mockCompanyData[0];

  // Contrast limits
  const topCompany = mockCompanyData[0];
  const lowestCompany = mockCompanyData[mockCompanyData.length - 1];

  // Helper to draw clean SVG path matching custom growth history
  const getGrowthPathPoints = (history: { rate: number }[]) => {
    // Map rates to SVG canvas coordinate space: range from -10% to +25%
    // canvas height is 140px. baseline 0% is at y=100.
    const points = history.map((h, idx) => {
      const x = idx * 100 + 40;
      // y coordinate: high rate -> lower y value
      const y = 100 - (h.rate * 3.5);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Company Analytics"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics', href: '/company-analytics' }, { label: 'Company' }]}
      />

      {/* Top vs Lowest performing comparison */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-foreground tracking-wide uppercase px-1 flex items-center gap-1.5">
          <Award className="h-4.5 w-4.5 text-primary" />
          Supplier Performance Contrast
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 border border-border/40 rounded-xl p-4 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-success-foreground" /> Top Billing Partner
              </span>
              <StatusBadge status="active" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground truncate">{topCompany.name}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-black text-foreground font-mono">${topCompany.sales.toLocaleString()} GMV</span>
                <PercentageBadge value={topCompany.pctContribution} type="contribution" />
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border/40 rounded-xl p-4 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-destructive" /> Lowest Billing Partner
              </span>
              <StatusBadge status="active" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground truncate">{lowestCompany.name}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-black text-foreground font-mono">${lowestCompany.sales.toLocaleString()} GMV</span>
                <PercentageBadge value={lowestCompany.pctContribution} type="contribution" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales by Company: Bar chart + percentage contributions splits */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Sales Distributions by Supplier</h3>
            <p className="text-xs text-muted-foreground">GMV sales value splits and contribution share margins</p>
          </div>

          {/* Bar Chart comparing sales */}
          <div className="h-44 flex items-end justify-around gap-4 pt-6 border-b border-l border-border/80">
            {mockCompanyData.map((c, idx) => {
              const maxVal = Math.max(...mockCompanyData.map((d) => d.sales));
              const pct = maxVal > 0 ? (c.sales / maxVal) * 80 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="bg-primary hover:bg-primary/95 w-full rounded-t transition-all duration-300 relative group cursor-pointer"
                    style={{ height: `${pct}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border rounded text-[9px] font-bold px-1.5 py-0.5 shadow-md hidden group-hover:block whitespace-nowrap z-20">
                      ${c.sales.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-semibold truncate max-w-[50px]">
                    {c.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Contribution Splits list (Equivalent to clean Donut percentages visual) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {mockCompanyData.map((c) => (
              <div key={c.id} className="border border-border/60 bg-muted/20 rounded-lg p-2.5 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground block truncate">{c.name}</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">${(c.sales / 1000).toFixed(0)}k</span>
                  <PercentageBadge value={c.pctContribution} type="contribution" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Growth over time Select Line Chart */}
        <div className="lg:col-span-1 bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">Supplier Growth Timeline</h3>
              <p className="text-xs text-muted-foreground">Select partner to audit monthly growth rate curves</p>
            </div>
            <div className="p-1.5 bg-primary/10 text-primary border border-primary/20 rounded">
              <Percent className="h-4.5 w-4.5" />
            </div>
          </div>

          {/* Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> Select Company Profile
            </label>
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {mockCompanyData.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Line Chart */}
          <div className="h-36 relative border-b border-l border-border/80 mt-2">
            {/* Draw 0% baseline */}
            <div className="absolute top-[100px] left-0 right-0 border-t border-dashed border-border/80 z-5" />
            <span className="absolute right-2 top-[104px] text-[8px] text-muted-foreground font-mono font-bold">0% line</span>

            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d={getGrowthPathPoints(selectedCompany.growthHistory)}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
              />
              {/* Plot dot nodes */}
              {selectedCompany.growthHistory.map((h, idx) => {
                const x = idx * 100 + 40;
                const y = 100 - (h.rate * 3.5);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4.5"
                    className="fill-card stroke-primary stroke-[3] cursor-pointer hover:r-[6.5] transition-all"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[9px] text-muted-foreground font-bold font-mono px-3">
            {selectedCompany.growthHistory.map((h, idx) => (
              <span key={idx} className="flex flex-col items-center">
                <span>{h.month}</span>
                <span className={h.rate >= 0 ? 'text-primary' : 'text-destructive font-black'}>
                  {h.rate >= 0 ? '+' : ''}{h.rate}%
                </span>
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
