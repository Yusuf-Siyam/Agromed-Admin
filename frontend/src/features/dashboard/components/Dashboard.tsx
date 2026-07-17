import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sprout,
  ShoppingBag,
  Building2,
  Package,
  Wrench,
  ShieldAlert,
  Plus,
  Send
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/shared/Toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface OrderItem {
  id: string;
  farmer: string;
  company: string;
  status: string;
  date: string;
  total: string;
}

interface PaymentItem {
  id: string;
  payer: string;
  method: string;
  amount: string;
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

  // Quick Action Dialog states
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Table columns definition
  const orderColumns: Column<OrderItem>[] = [
    { key: 'id', label: 'Order ID' },
    { key: 'farmer', label: 'Farmer' },
    { key: 'company', label: 'Agro Company' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total Amount', align: 'right' }
  ];

  const paymentColumns: Column<PaymentItem>[] = [
    { key: 'id', label: 'Txn ID' },
    { key: 'payer', label: 'Payer' },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', align: 'right' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'date', label: 'Date' }
  ];

  const activityColumns: Column<ActivityItem>[] = [
    { key: 'time', label: 'Timestamp' },
    { key: 'user', label: 'Admin User' },
    { key: 'action', label: 'Action performed' },
    {
      key: 'type',
      label: 'Component',
      render: (row) => (
        <span className="text-xs px-2 py-1 rounded bg-muted font-mono border border-border">
          {row.type}
        </span>
      )
    }
  ];

  // Mock data lists
  const recentOrders: OrderItem[] = [
    { id: 'ORD-8942', farmer: 'Abul Hossain', company: 'Green Crop Ltd.', status: 'delivered', date: '2026-07-18', total: '$340.00' },
    { id: 'ORD-8941', farmer: 'Kamal Uddin', company: 'Acme Agritech', status: 'pending', date: '2026-07-17', total: '$1,200.00' },
    { id: 'ORD-8940', farmer: 'Sufia Begum', company: 'Bayer Crops', status: 'processing', date: '2026-07-17', total: '$780.00' },
    { id: 'ORD-8939', farmer: 'Rahim Mia', status: 'cancelled', company: 'Green Crop Ltd.', date: '2026-07-16', total: '$150.00' }
  ];

  const recentPayments: PaymentItem[] = [
    { id: 'TXN-9021', payer: 'Abul Hossain', method: 'bKash', amount: '$340.00', status: 'completed', date: '2026-07-18' },
    { id: 'TXN-9020', payer: 'Bayer Crops Ltd.', method: 'Bank Transfer', amount: '$2,450.00', status: 'completed', date: '2026-07-17' },
    { id: 'TXN-9019', payer: 'Kamal Uddin', method: 'Nagad', amount: '$1,200.00', status: 'pending', date: '2026-07-17' },
    { id: 'TXN-9018', payer: 'Sufia Begum', method: 'Rocket', amount: '$780.00', status: 'failed', date: '2026-07-16' }
  ];

  const recentActivities: ActivityItem[] = [
    { id: 'ACT-1', time: '10:45 AM', user: 'Yusuf Siyam', action: 'Approved Greenfield Agro Ltd. registration', type: 'companies' },
    { id: 'ACT-2', time: '09:12 AM', user: 'Yusuf Siyam', action: 'Created new product category: Organic Seedlings', type: 'categories' },
    { id: 'ACT-3', time: 'Yesterday', user: 'Admin Assistant', action: 'Suspended Farmer ID #9042 for verification failure', type: 'farmers' }
  ];

  // Action confirmations
  const triggerAction = (type: string) => {
    setActiveDialog(type);
  };

  const handleConfirmAction = () => {
    const dialogType = activeDialog;
    setActiveDialog(null);
    success(`Quick Action: ${dialogType?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} completed successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        action={
          <div className="text-sm font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            Live Monitoring Active
          </div>
        }
      />

      {/* Quick Actions Bar */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">Quick Operations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => triggerAction('add_company')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs md:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-info" />
            Add Company
          </button>
          <button
            onClick={() => triggerAction('add_product')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs md:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-secondary-foreground" />
            Add Product
          </button>
          <button
            onClick={() => triggerAction('add_category')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs md:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-primary" />
            Add Category
          </button>
          <button
            onClick={() => triggerAction('send_notification')}
            className="flex items-center justify-center gap-2 p-2.5 border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs md:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-info" />
            Send Broadcast
          </button>
        </div>
      </div>

      {/* StatCards KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="$248,500.00" icon={DollarSign} trend={{ value: 12.4, label: 'vs last month', isPositive: true }} />
        <StatCard title="Platform Revenue" value="$24,850.00" icon={TrendingUp} trend={{ value: 8.2, label: 'vs last month', isPositive: true }} />
        <StatCard title="Total Orders" value="3,420" icon={ClipboardList} trend={{ value: 15.1, label: 'vs last month', isPositive: true }} />
        <StatCard title="Completed Orders" value="2,850" icon={CheckCircle2} trend={{ value: 18.4, label: 'vs last month', isPositive: true }} />
        <StatCard title="Pending Orders" value="420" icon={Clock} trend={{ value: 4.2, label: 'vs last month', isPositive: false }} />
        <StatCard title="Cancelled Orders" value="150" icon={ShieldAlert} trend={{ value: 12.5, label: 'vs last month', isPositive: false }} />
        <StatCard title="Total Farmers" value="1,240" icon={Sprout} trend={{ value: 21.2, label: 'vs last month', isPositive: true }} />
        <StatCard title="Total Buyers" value="850" icon={ShoppingBag} trend={{ value: 14.6, label: 'vs last month', isPositive: true }} />
        <StatCard title="Total Agro Companies" value="45" icon={Building2} trend={{ value: 4.8, label: 'vs last month', isPositive: true }} />
        <StatCard title="Total Products" value="620" icon={Package} trend={{ value: 10.2, label: 'vs last month', isPositive: true }} />
        <StatCard title="Total Services" value="115" icon={Wrench} trend={{ value: 6.3, label: 'vs last month', isPositive: true }} />
        <StatCard
          title="Low Stock Products"
          value="12"
          icon={AlertTriangle}
          trend={{ value: 8.3, label: 'vs last month', isPositive: false }}
          className="border-destructive/30 bg-destructive/[0.02]"
        />
      </div>

      {/* Visual Interactive Mockup Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue (Line Graph SVG) */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Sales & Revenue Analytics</h2>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-info">
                <span className="w-2.5 h-2.5 rounded-full bg-info" /> Sales
              </span>
              <span className="flex items-center gap-1.5 text-secondary-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Revenue
              </span>
            </div>
          </div>
          <div className="h-64 relative border-b border-l border-border/80 p-2">
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
              <div className="border-t border-border/80 w-full" />
              <div className="border-t border-border/80 w-full" />
              <div className="border-t border-border/80 w-full" />
              <div className="border-t border-border/80 w-full" />
            </div>

            {/* Custom SVG Drawing Line Graphs */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Sales Curve (Teal) */}
              <path
                d="M 0 160 Q 75 120 150 130 T 300 80 T 450 40 T 600 30"
                fill="none"
                stroke="hsl(var(--info))"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all"
              />
              <path
                d="M 0 160 Q 75 120 150 130 T 300 80 T 450 40 T 600 30 L 600 200 L 0 200 Z"
                fill="url(#teal-grad)"
                className="opacity-10"
              />

              {/* Revenue Curve (Orange) */}
              <path
                d="M 0 180 Q 75 140 150 150 T 300 110 T 450 80 T 600 65"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 180 Q 75 140 150 150 T 300 110 T 450 80 T 600 65 L 600 200 L 0 200 Z"
                fill="url(#orange-grad)"
                className="opacity-10"
              />

              {/* Definitions */}
              <defs>
                <linearGradient id="teal-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--info))" />
                  <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-semibold px-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>

        {/* Orders Overview (Comparative vertical bar mockup) */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">Orders Summary</h2>
          <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-border/80 pb-2">
            {/* Bar columns */}
            {[
              { label: 'Feb', comp: '70%', pend: '20%', canc: '10%' },
              { label: 'Mar', comp: '75%', pend: '15%', canc: '10%' },
              { label: 'Apr', comp: '60%', pend: '30%', canc: '10%' },
              { label: 'May', comp: '80%', pend: '15%', canc: '5%' },
              { label: 'Jun', comp: '85%', pend: '10%', canc: '5%' }
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                {/* Visual bar container stacked */}
                <div className="w-6 md:w-8 flex flex-col justify-end h-full gap-0.5 rounded overflow-hidden">
                  <div className="bg-destructive/80 w-full" style={{ height: col.canc }} title="Cancelled" />
                  <div className="bg-secondary w-full" style={{ height: col.pend }} title="Pending" />
                  <div className="bg-info w-full" style={{ height: col.comp }} title="Completed" />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">{col.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs font-semibold pt-1">
            <span className="flex items-center gap-1.5 text-info">
              <span className="w-2.5 h-2.5 rounded bg-info" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-secondary-foreground">
              <span className="w-2.5 h-2.5 rounded bg-secondary" /> Pending
            </span>
            <span className="flex items-center gap-1.5 text-destructive">
              <span className="w-2.5 h-2.5 rounded bg-destructive/85" /> Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bars (Top Selling Medicines & Company Sales) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">Top Performing Agro Companies</h2>
          <div className="space-y-3">
            {[
              { name: 'Greenfield Agro Ltd.', sales: '$45,200', pct: 85 },
              { name: 'Acme Agritech Solutions', sales: '$32,100', pct: 60 },
              { name: 'Bayer CropScience BD', sales: '$28,450', pct: 54 },
              { name: 'Sufala Fertilizer Co.', sales: '$14,200', pct: 28 }
            ].map((company, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground/80">{company.name}</span>
                  <span className="text-foreground">{company.sales}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${company.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">Top Selling Medicines & Seeds</h2>
          <div className="space-y-3">
            {[
              { name: 'Urea Max Fertilizer 50kg', qty: '450 packs', pct: 90 },
              { name: 'PestBlock Fungicide 1L', qty: '280 bottles', pct: 56 },
              { name: 'Hybrid Rice Seed BR-29', qty: '240 bags', pct: 48 },
              { name: 'AgroShield Insecticide 500ml', qty: '120 vials', pct: 24 }
            ].map((product, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground/80">{product.name}</span>
                  <span className="text-foreground">{product.qty}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-info h-2 rounded-full" style={{ width: `${product.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recents Tables Lists using DataTable */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground px-1">Recent Placed Orders</h2>
          <DataTable columns={orderColumns} data={recentOrders} />
        </div>

        {/* Recent Payments */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground px-1">Recent Transactions</h2>
          <DataTable columns={paymentColumns} data={recentPayments} />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground px-1">Recent System Logs</h2>
        <DataTable columns={activityColumns} data={recentActivities} />
      </div>

      {/* Quick Action dialog handler */}
      <ConfirmDialog
        isOpen={activeDialog !== null}
        title="Confirm Administrative Operation"
        description={`You are triggering the simulated dialog panel for ${activeDialog?.replace('_', ' ')}. Are you sure you want to run this mock workflow?`}
        confirmText="Confirm Action"
        variant="primary"
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveDialog(null)}
      />
    </div>
  );
}
