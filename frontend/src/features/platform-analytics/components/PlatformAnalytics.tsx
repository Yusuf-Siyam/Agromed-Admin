import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import PercentageBadge from '@/components/shared/PercentageBadge';
import { Calendar, TrendingUp, BarChart2 } from 'lucide-react';

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface AnalyticsPayload {
  sales: number;
  revenue: number;
  profit: number;
  growth: number;
  labels: string[];
  profitPoints: string; // SVG path points
  periodSales: number[]; // Bar values
}

export default function PlatformAnalytics() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-11');

  // Mock datasets configured per time tab
  const dataMap: Record<TimeRange, AnalyticsPayload> = {
    today: {
      sales: 18400,
      revenue: 1840,
      profit: 1420,
      growth: 2.4,
      labels: ['09:00', '12:00', '15:00', '18:00', '21:00'],
      profitPoints: 'M 0 160 Q 80 120 160 140 T 320 80 T 480 30 Z',
      periodSales: [2500, 4800, 3100, 5200, 2800]
    },
    week: {
      sales: 92600,
      revenue: 9260,
      profit: 7150,
      growth: 6.8,
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      profitPoints: 'M 0 140 Q 80 90 160 110 T 320 100 T 480 60 T 640 20 Z',
      periodSales: [12000, 15000, 11000, 16500, 14000, 9500, 14600]
    },
    month: {
      sales: 410200,
      revenue: 41020,
      profit: 31850,
      growth: 12.2,
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      profitPoints: 'M 0 120 Q 80 150 160 110 T 320 60 T 480 15 Z',
      periodSales: [92000, 112000, 101000, 105200]
    },
    year: {
      sales: 4920000,
      revenue: 492000,
      profit: 378000,
      growth: 24.5,
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      profitPoints: 'M 0 150 Q 80 110 160 80 T 320 40 T 480 10 Z',
      periodSales: [1100000, 1250000, 1180000, 1390000]
    },
    custom: {
      sales: 150000,
      revenue: 15000,
      profit: 11500,
      growth: 5.1,
      labels: ['Start', 'Mid', 'End'],
      profitPoints: 'M 0 130 Q 80 140 160 100 T 320 50 T 480 25 Z',
      periodSales: [45000, 52000, 53000]
    }
  };

  const activeData = dataMap[selectedRange];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Analytics"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics', href: '/platform-analytics' }, { label: 'Platform' }]}
      />

      {/* Tabs navigation list */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-1">
        <div className="flex gap-1.5">
          {(['today', 'week', 'month', 'year', 'custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedRange === range
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Custom Range picker inputs */}
        {selectedRange === 'custom' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-150">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-8 pr-2 py-1 text-xs border border-border bg-card rounded-md focus:outline-none"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">to</span>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-8 pr-2 py-1 text-xs border border-border bg-card rounded-md focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FinancialSummaryCard label="Total Sales (GMV)" amount={activeData.sales} variant="info" />
        <FinancialSummaryCard label="Platform Revenue" amount={activeData.revenue} variant="success" />
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Platform Profit</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-black text-foreground font-mono">
                ${activeData.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <PercentageBadge value={activeData.growth} type="growth" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Margin growth compared to prior timeline block
          </p>
        </div>
      </div>

      {/* Visual Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Net Profit Trend Area Graph (SVG Line) */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-foreground">Net Profit Trend Margin</h3>
              <p className="text-xs text-muted-foreground">Earnings performance velocity for the selected timeline</p>
            </div>
            <div className="p-1.5 bg-info/10 text-info border border-info/20 rounded">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="h-48 relative border-b border-l border-border/80 mt-2">
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
              <div className="border-t border-foreground w-full" />
              <div className="border-t border-foreground w-full" />
            </div>
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d={activeData.profitPoints}
                fill="none"
                stroke="hsl(var(--info))"
                strokeWidth="3.5"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold font-mono px-1">
            {activeData.labels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>

        {/* Bar Chart comparing periods (SVG vertical comparative bars) */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-foreground">Sales Volumes Contrast</h3>
              <p className="text-xs text-muted-foreground">Comparative Sales (GMV) splits across periods</p>
            </div>
            <div className="p-1.5 bg-primary/10 text-primary border border-primary/20 rounded">
              <BarChart2 className="h-4.5 w-4.5" />
            </div>
          </div>
          
          <div className="h-48 flex items-end justify-around gap-6 pt-6 border-b border-l border-border/80">
            {activeData.periodSales.map((salesVal, idx) => {
              const maxVal = Math.max(...activeData.periodSales);
              const pct = maxVal > 0 ? (salesVal / maxVal) * 80 : 0; // capped at 80% height
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[9px] font-bold text-foreground font-mono">
                    ${salesVal >= 1000000 ? `${(salesVal/1000000).toFixed(1)}M` : `${(salesVal/1000).toFixed(0)}k`}
                  </span>
                  <div
                    className="bg-primary hover:bg-primary/95 w-full rounded-t-md transition-all duration-300 relative group cursor-pointer"
                    style={{ height: `${pct}%`, minHeight: '6px' }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border border-border rounded text-[9px] font-bold px-1.5 py-0.5 shadow-md hidden group-hover:block whitespace-nowrap z-20">
                      GMV: ${salesVal.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {activeData.labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
