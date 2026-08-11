import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import PercentageBadge from '@/components/shared/PercentageBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/shared/Toast';
import { Percent, Edit3, Settings, Calendar, RefreshCw } from 'lucide-react';

interface OverrideItem {
  id: string;
  name: string;
  totalSales: number;
  commissionRate: number;
  earnings: number;
}

interface HistoryItem {
  id: string;
  date: string;
  company: string;
  gmv: number;
  rate: number;
  earned: number;
  status: 'paid' | 'pending';
}

export default function CommissionDashboard() {
  const { success } = useToast();

  // General default platform commission rate state
  const [defaultRate, setDefaultRate] = useState(10.0);
  const [isEditingDefault, setIsEditingDefault] = useState(false);
  const [tempDefaultRate, setTempDefaultRate] = useState(defaultRate);

  // Mock Company Overrides state
  const [overrides, setOverrides] = useState<OverrideItem[]>([
    { id: 'COMP-001', name: 'Greenfield Agro Ltd.', totalSales: 420000, commissionRate: 8.0, earnings: 33600 },
    { id: 'COMP-002', name: 'Acme Agritech Solutions', totalSales: 260000, commissionRate: 10.0, earnings: 26000 },
    { id: 'COMP-003', name: 'Bayer CropScience BD', totalSales: 620000, commissionRate: 10.0, earnings: 62000 },
    { id: 'COMP-004', name: 'Sufala Fertilizer Co.', totalSales: 110000, commissionRate: 10.0, earnings: 11000 }
  ]);

  // Mock commission history logs
  const [history] = useState<HistoryItem[]>([
    { id: 'TXN-9041', date: '2026-08-11', company: 'Acme Agritech Solutions', gmv: 1200.0, rate: 10.0, earned: 120.0, status: 'pending' },
    { id: 'TXN-9040', date: '2026-08-11', company: 'Bayer CropScience BD', gmv: 780.0, rate: 10.0, earned: 78.0, status: 'pending' },
    { id: 'TXN-9039', date: '2026-08-10', company: 'Greenfield Agro Ltd.', gmv: 4500.0, rate: 8.0, earned: 360.0, status: 'paid' },
    { id: 'TXN-9038', date: '2026-08-09', company: 'Sufala Fertilizer Co.', gmv: 2400.0, rate: 10.0, earned: 240.0, status: 'paid' },
    { id: 'TXN-9037', date: '2026-08-08', company: 'Acme Agritech Solutions', gmv: 18000.0, rate: 10.0, earned: 1800.0, status: 'paid' }
  ]);

  // Dialog State for editing company overrides
  const [editingCompany, setEditingCompany] = useState<OverrideItem | null>(null);
  const [newOverrideRate, setNewOverrideRate] = useState<number>(10.0);

  // History search/filter state
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Update default rate
  const handleSaveDefaultRate = () => {
    setDefaultRate(tempDefaultRate);
    setIsEditingDefault(false);
    success(`Default platform commission rate set to ${tempDefaultRate}%`);
  };

  // Open override edit dialog
  const handleStartEditOverride = (company: OverrideItem) => {
    setEditingCompany(company);
    setNewOverrideRate(company.commissionRate);
  };

  // Save company override
  const handleSaveOverride = () => {
    if (!editingCompany) return;

    setOverrides((prev) =>
      prev.map((c) => {
        if (c.id === editingCompany.id) {
          const newEarnings = (c.totalSales * newOverrideRate) / 100;
          return {
            ...c,
            commissionRate: newOverrideRate,
            earnings: newEarnings
          };
        }
        return c;
      })
    );

    success(`Commission rate for "${editingCompany.name}" set to ${newOverrideRate}%`);
    setEditingCompany(null);
  };

  // Columns for Company Overrides table
  const overrideColumns: Column<OverrideItem>[] = [
    { key: 'name', label: 'Company Name', render: (row) => <span className="font-bold">{row.name}</span> },
    {
      key: 'totalSales',
      label: 'Gross Sales (GMV)',
      align: 'right',
      render: (row) => `$${row.totalSales.toLocaleString()}`
    },
    {
      key: 'commissionRate',
      label: 'Commission Rate',
      align: 'center',
      render: (row) => <PercentageBadge value={row.commissionRate} type="commission" />
    },
    {
      key: 'earnings',
      label: 'Platform Earnings',
      align: 'right',
      render: (row) => `$${row.earnings.toLocaleString()}`
    },
    {
      key: 'actions',
      label: 'Modify Override',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => handleStartEditOverride(row)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-border bg-card hover:bg-muted text-foreground rounded-lg transition-colors cursor-pointer font-semibold ml-auto"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit Rate
        </button>
      )
    }
  ];

  // Columns for History log table
  const historyColumns: Column<HistoryItem>[] = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'id', label: 'Txn ID' },
    { key: 'company', label: 'Company Name', sortable: true },
    {
      key: 'gmv',
      label: 'GMV Value',
      align: 'right',
      render: (row) => `$${row.gmv.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'rate',
      label: 'Rate Applied',
      align: 'center',
      render: (row) => <PercentageBadge value={row.rate} type="commission" />
    },
    {
      key: 'earned',
      label: 'Revenue Earned',
      align: 'right',
      render: (row) => `$${row.earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'status',
      label: 'Fulfillment Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  // Perform history filtering
  const filteredHistory = history.filter((item) => {
    const matchCompany = companyFilter === 'all' || item.company === companyFilter;
    const matchSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || item.date === dateFilter;
    return matchCompany && matchSearch && matchDate;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Commission Settings"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Financial', href: '/commission' }, { label: 'Commission' }]}
        action={
          <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Percent className="h-3.5 w-3.5" />
            Standard commission active
          </div>
        }
      />

      {/* Grid: Left Column Settings, Right Column Stat Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Platform settings config card */}
        <div className="lg:col-span-1 bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-foreground tracking-wide uppercase flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-primary" />
            Platform General Commission
          </h3>
          
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Default Commission Cut</label>
              {isEditingDefault ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={tempDefaultRate}
                      onChange={(e) => setTempDefaultRate(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3 pr-8 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">%</span>
                  </div>
                  <button
                    onClick={handleSaveDefaultRate}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-muted/40 border border-border/60 rounded-lg p-3">
                  <span className="text-xl font-black text-foreground font-mono">{defaultRate.toFixed(1)}%</span>
                  <button
                    onClick={() => {
                      setTempDefaultRate(defaultRate);
                      setIsEditingDefault(true);
                    }}
                    className="text-xs text-info font-semibold hover:underline cursor-pointer"
                  >
                    Change Rate
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              * The platform general commission percentage applies automatically to all verified agro companies onboarding transactions unless overridden with a specific company-level override profile below.
            </p>
          </div>
        </div>

        {/* Right Column: Status Breakdown Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FinancialSummaryCard label="Platform Gross Earned" amount={94850.00} subtext="Accrued commission earnings" variant="info" />
          <FinancialSummaryCard label="Paid / Settled Commission" amount={76350.00} subtext="Acquitted funds in platform ledger" variant="success" />
          <FinancialSummaryCard label="Pending Commission" amount={18500.00} subtext="Awaiting payout clearance settlement" variant="warning" />
        </div>

      </div>

      {/* Override List table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Company-Specific Commission Overrides</h3>
        <DataTable columns={overrideColumns} data={overrides} />
      </div>

      {/* Commission history register */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-foreground">Commission History Ledger</h3>
          <span className="text-xs text-muted-foreground font-medium">Platform override cuts timeline</span>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Filter by Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Companies</option>
              <option value="Acme Agritech Solutions">Acme Agritech Solutions</option>
              <option value="Bayer CropScience BD">Bayer CropScience BD</option>
              <option value="Greenfield Agro Ltd.">Greenfield Agro Ltd.</option>
              <option value="Sufala Fertilizer Co.">Sufala Fertilizer Co.</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Filter by Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setCompanyFilter('all');
                setDateFilter('');
                setSearch('');
              }}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-border bg-background hover:bg-muted text-foreground text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        <DataTable
          columns={historyColumns}
          data={filteredHistory}
          searchPlaceholder="Search history log by txn ID..."
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>

      {/* Override Edit Dialog popups */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setEditingCompany(null)}
          />
          <div className="bg-card border border-border/80 w-full max-w-sm rounded-xl p-5 shadow-xl relative z-10 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">Configure Override: {editingCompany.name}</h3>
              <p className="text-xs text-muted-foreground">
                Set a specific commission rate applied to all sales transactions for this corporate partner.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Commission Override Rate</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newOverrideRate}
                  onChange={(e) => setNewOverrideRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">%</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
              <button
                onClick={() => setEditingCompany(null)}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg cursor-pointer"
              >
                Save Rate Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
