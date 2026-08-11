import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Wrench,
  Plus,
  Send,
  Activity,
  FileText,
  CheckCircle2
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import PercentageBadge from '@/components/shared/PercentageBadge';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/shared/Toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface TransactionItem {
  id: string;
  company: string;
  stakeholder: string;
  grossAmount: number;
  commission: number;
  status: string;
  date: string;
}

interface SettlementItem {
  id: string;
  company: string;
  grossSales: number;
  commissionDeducted: number;
  settlementAmount: number;
  status: string;
  date: string;
}

interface ActivityItem {
  id: string;
  time: string;
  user: string;
  action: string;
  type: string;
}

export default function Dashboard() {
  const { success } = useToast();
  const navigate = useNavigate();

  // Quick Action Dialog states
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Table columns definition
  const txnColumns: Column<TransactionItem>[] = [
    { key: 'id', label: 'Txn ID' },
    { key: 'company', label: 'Agro Company' },
    { key: 'stakeholder', label: 'Farmer / Buyer' },
    {
      key: 'grossAmount',
      label: 'Gross Amount',
      align: 'right',
      render: (row) => `$${row.grossAmount.toLocaleString()}`
    },
    {
      key: 'commission',
      label: 'Commission (10%)',
      align: 'right',
      render: (row) => `$${row.commission.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'date', label: 'Date' }
  ];

  const settlementColumns: Column<SettlementItem>[] = [
    { key: 'id', label: 'Settlement ID' },
    { key: 'company', label: 'Agro Company' },
    {
      key: 'grossSales',
      label: 'Gross Sales',
      align: 'right',
      render: (row) => `$${row.grossSales.toLocaleString()}`
    },
    {
      key: 'commissionDeducted',
      label: 'Commission',
      align: 'right',
      render: (row) => `$${row.commissionDeducted.toLocaleString()}`
    },
    {
      key: 'settlementAmount',
      label: 'Settlement Due',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-info">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.settlementAmount)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'date', label: 'Payout Date' }
  ];

  const activityColumns: Column<ActivityItem>[] = [
    { key: 'time', label: 'Timestamp' },
    { key: 'user', label: 'Admin User' },
    { key: 'action', label: 'Action Performed' },
    {
      key: 'type',
      label: 'Feature Area',
      render: (row) => (
        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono font-bold border border-border uppercase">
          {row.type}
        </span>
      )
    }
  ];

  // Mock data lists representing platform transactions (read-only)
  const recentTransactions: TransactionItem[] = [
    { id: 'TXN-8041', company: 'Acme Agritech Solutions', stakeholder: 'Karim Rahman (Farmer)', grossAmount: 1200.00, commission: 120.00, status: 'completed', date: '2026-08-11' },
    { id: 'TXN-8040', company: 'Bayer CropScience', stakeholder: 'Sufia Begum (Farmer)', grossAmount: 780.00, commission: 78.00, status: 'completed', date: '2026-08-11' },
    { id: 'TXN-8039', company: 'Green Crop Seeds Ltd.', stakeholder: 'Abul Hossain (Buyer)', grossAmount: 3400.00, commission: 340.00, status: 'pending', date: '2026-08-10' },
    { id: 'TXN-8038', company: 'Acme Agritech Solutions', stakeholder: 'Siyam Retailers (Buyer)', grossAmount: 18000.00, commission: 1800.00, status: 'completed', date: '2026-08-10' }
  ];

  const recentSettlements: SettlementItem[] = [
    { id: 'SET-3021', company: 'Acme Agritech Solutions', grossSales: 19200.00, commissionDeducted: 1920.00, settlementAmount: 17280.00, status: 'completed', date: '2026-08-10' },
    { id: 'SET-3020', company: 'Bayer CropScience', grossSales: 8750.00, commissionDeducted: 875.00, settlementAmount: 7875.00, status: 'pending', date: '2026-08-11' },
    { id: 'SET-3019', company: 'Green Crop Seeds Ltd.', grossSales: 4500.00, commissionDeducted: 450.00, settlementAmount: 4050.00, status: 'processing', date: '2026-08-11' }
  ];

  const recentActivities: ActivityItem[] = [
    { id: 'ACT-101', time: '10:45 AM', user: 'Yusuf Siyam', action: 'Approved Acme Agritech bank payout verification details', type: 'billing' },
    { id: 'ACT-102', time: '09:12 AM', user: 'Yusuf Siyam', action: 'Set specific commission override (12%) for Green Crop Seeds', type: 'commission' },
    { id: 'ACT-103', time: 'Yesterday', user: 'Admin Assistant', action: 'Suspended partner service provider ID #492 for bad reviews', type: 'stakeholders' }
  ];

  const triggerAction = (type: string) => {
    setActiveDialog(type);
  };

  const handleConfirmAction = () => {
    const dialogType = activeDialog;
    setActiveDialog(null);
    if (dialogType === 'verify_company') {
      success('Redirected to Company Verification portal!');
      navigate('/companies/verification');
    } else if (dialogType === 'add_company') {
      success('Redirected to Partner onboarding workflow!');
      navigate('/companies');
    } else if (dialogType === 'send_notification') {
      success('Redirected to Notifications dispatch console!');
      navigate('/notifications');
    } else if (dialogType === 'generate_report') {
      success('Redirected to Reports Hub!');
      navigate('/reports');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        action={
          <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Mediator Operations Live
          </div>
        }
      />

      {/* Quick Actions Bar */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-foreground tracking-wide uppercase">Quick Platform Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => triggerAction('verify_company')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 text-info" />
            Verify Partner
          </button>
          <button
            onClick={() => triggerAction('add_company')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-primary" />
            Add Company
          </button>
          <button
            onClick={() => triggerAction('send_notification')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-secondary-foreground" />
            Send Broadcast
          </button>
          <button
            onClick={() => triggerAction('generate_report')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-info" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Financial & General KPI Metrics Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <FinancialSummaryCard label="Total Sales (GMV)" amount={1248500.00} subtext="+15.4% from last month" variant="info" />
        <FinancialSummaryCard label="Platform Revenue" amount={124850.00} subtext="10% average commission split" variant="success" />
        <FinancialSummaryCard label="Commission Earned" amount={94850.00} subtext="Gross channel overrides" variant="default" />
        <FinancialSummaryCard label="Total Discounts" amount={15200.00} subtext="Platform-funded incentives" variant="danger" />
        <FinancialSummaryCard label="Platform Expenses" amount={48500.00} subtext="Taxes, gateway cuts, operations" variant="warning" />
        <FinancialSummaryCard label="Net Profit" amount={61150.00} subtext="Platform revenue - expenses" variant="success" />
        <StatCard title="Verified Companies" value="62" icon={Building2} trend={{ value: 4.8, label: 'onboarded partners', isPositive: true }} />
        <StatCard title="Active Services" value="115" icon={Wrench} trend={{ value: 8.3, label: 'consultancies running', isPositive: true }} />
      </div>

      {/* Custom Analytics Graphical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GMV Sales Trend Chart (Line Chart SVG) */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">GMV Transaction Volume Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly sales value passing through the mediator platform</p>
            </div>
            <div className="flex items-center gap-1.5">
              <PercentageBadge value={15.4} type="growth" />
            </div>
          </div>
          <div className="h-60 relative border-b border-l border-border/80 mt-2">
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
              <div className="border-t border-foreground w-full" />
              <div className="border-t border-foreground w-full" />
              <div className="border-t border-foreground w-full" />
            </div>
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d="M 0 160 Q 80 130 160 140 T 320 80 T 480 30 T 640 10"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 160 Q 80 130 160 140 T 320 80 T 480 30 T 640 10 L 640 200 L 0 200 Z"
                fill="url(#primary-grad)"
                className="opacity-5"
              />
              <defs>
                <linearGradient id="primary-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold font-mono uppercase px-2">
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>
        </div>

        {/* Top Company Contributors Progress Rankings */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Top Performing Partners</h3>
            <p className="text-xs text-muted-foreground">Aggregated sales volume contributions</p>
          </div>
          <div className="space-y-3.5">
            {[
              { name: 'Acme Agritech Solutions', sales: '$450,000', contribution: 36.0 },
              { name: 'Bayer CropScience', sales: '$380,000', contribution: 30.4 },
              { name: 'Green Crop Seeds Ltd.', sales: '$290,000', contribution: 23.2 },
              { name: 'Sufala Fertilizings', sales: '$128,500', contribution: 10.4 }
            ].map((company, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground/80 truncate max-w-[170px]">{company.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">{company.sales}</span>
                    <PercentageBadge value={company.contribution} type="contribution" />
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${company.contribution * 2.7}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked Comparative Bar Graph: Revenue vs Expenses vs Net Profit */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Platform Earnings Flow</h3>
          <p className="text-xs text-muted-foreground">Consolidated comparison: Platform Revenue vs Expenses vs Net Profit margin</p>
        </div>
        <div className="h-60 flex items-end justify-between gap-4 px-2 border-b border-border/80 pb-2">
          {[
            { month: 'Apr', rev: 90, exp: 40, prof: 50 },
            { month: 'May', rev: 110, exp: 42, prof: 68 },
            { month: 'Jun', rev: 105, exp: 45, prof: 60 },
            { month: 'Jul', rev: 120, exp: 47, prof: 73 },
            { month: 'Aug', rev: 124, exp: 48, prof: 76 }
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-12 flex flex-col justify-end h-full gap-0.5 rounded overflow-hidden">
                <div className="bg-destructive/80 w-full" style={{ height: `${(bar.exp / 150) * 100}%` }} title={`Expenses: $${bar.exp}k`} />
                <div className="bg-info w-full" style={{ height: `${(bar.prof / 150) * 100}%` }} title={`Net Profit: $${bar.prof}k`} />
                <div className="bg-primary/20 w-full" style={{ height: `${((bar.rev - bar.prof - bar.exp) / 150) * 100}%` }} title="Balance" />
              </div>
              <span className="text-[10px] text-muted-foreground font-bold font-mono">{bar.month}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center text-xs font-bold pt-1">
          <span className="flex items-center gap-1.5 text-primary">
            <span className="w-2.5 h-2.5 rounded bg-primary" /> Platform Revenue
          </span>
          <span className="flex items-center gap-1.5 text-destructive">
            <span className="w-2.5 h-2.5 rounded bg-destructive/80" /> Expenses
          </span>
          <span className="flex items-center gap-1.5 text-info">
            <span className="w-2.5 h-2.5 rounded bg-info" /> Net Profit
          </span>
        </div>
      </div>

      {/* Recents Tables Lists using DataTable */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-foreground">Recent Transactions</h3>
            <span className="text-xs text-muted-foreground font-medium">Platform-wide events</span>
          </div>
          <DataTable columns={txnColumns} data={recentTransactions} />
        </div>

        {/* Recent Settlements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-foreground">Recent Payout Settlements</h3>
            <span className="text-xs text-muted-foreground font-medium">Acquitted corporate funds</span>
          </div>
          <DataTable columns={settlementColumns} data={recentSettlements} />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">Recent Activity Logs</h3>
        <DataTable columns={activityColumns} data={recentActivities} />
      </div>

      {/* Quick Action dialog handler */}
      <ConfirmDialog
        isOpen={activeDialog !== null}
        title="Confirm Administrative Operation Redirect"
        description={`You are redirecting to run the administrative workflow for ${activeDialog?.replace('_', ' ')}. Confirm to continue.`}
        confirmText="Proceed"
        variant="primary"
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveDialog(null)}
      />
    </div>
  );
}
