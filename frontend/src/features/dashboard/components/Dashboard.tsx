import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Send,
  Wrench
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import { useToast } from '@/components/shared/Toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { DistributionChart, TrendChart } from '@/components/shared/AnalyticsCharts';
import { formatDate, formatMinor, getRevenueSeries, getSuperAdminDashboard, type SuperAdminDashboard } from '@/lib/superadmin-api';
import { useApi } from '@/lib/useApi';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';

export default function Dashboard() {
  const { success } = useToast();
  const navigate = useNavigate();
  const { accessToken } = useSuperAdminSession();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SuperAdminDashboard | null>(null);
  const revenue = useApi((token) => getRevenueSeries(token, 6), []);

  useEffect(() => {
    if (!accessToken) return;
    getSuperAdminDashboard(accessToken).then(setMetrics).catch(() => setMetrics(null));
  }, [accessToken]);

  const currency = metrics?.currency ?? 'BDT';
  const amount = (minor?: number) => minor === undefined ? '—' : minor / 100;
  const triggerAction = (type: string) => setActiveDialog(type);
  const revenuePoints = useMemo(() => (revenue.data ?? []).map((point) => ({
    label: formatDate(point.period).slice(0, 6),
    value: point.gmvMinor,
    detail: formatMinor(point.gmvMinor, currency)
  })), [revenue.data, currency]);

  const handleConfirmAction = () => {
    const dialogType = activeDialog;
    setActiveDialog(null);
    if (dialogType === 'verify_company') {
      success('Opening the company verification queue.');
      navigate('/companies/verification');
    } else if (dialogType === 'add_company') {
      success('Opening company management.');
      navigate('/companies');
    } else if (dialogType === 'send_notification') {
      success('Opening the broadcast console.');
      navigate('/notifications');
    } else if (dialogType === 'generate_report') {
      success('Opening reports.');
      navigate('/reports');
    }
  };

  return (
    <div className="space-y-6 pb-2">
      <PageHeader
        title="Dashboard Overview"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        action={
          <div className="dashboard-status flex items-center gap-2 text-xs font-semibold text-primary border border-primary/20 px-3 py-1.5 rounded-full shadow-sm">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Platform operations
          </div>
        }
      />

      <div className="dashboard-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-foreground tracking-wide uppercase">Quick Platform Actions</h2>
            <p className="mt-1 text-xs text-muted-foreground">Move priority operational work forward.</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
            <Clock3 className="h-3 w-3 text-secondary" /> Live data
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => triggerAction('verify_company')} className="dashboard-action flex items-center justify-center gap-2 p-3">
            <CheckCircle2 className="h-4 w-4 text-info" /> Verify Partner
          </button>
          <button onClick={() => triggerAction('add_company')} className="dashboard-action flex items-center justify-center gap-2 p-3">
            <Plus className="h-4 w-4 text-primary" /> Manage Companies
          </button>
          <button onClick={() => triggerAction('send_notification')} className="dashboard-action flex items-center justify-center gap-2 p-3">
            <Send className="h-3.5 w-3.5 text-secondary-foreground" /> Send Broadcast
          </button>
          <button onClick={() => triggerAction('generate_report')} className="dashboard-action flex items-center justify-center gap-2 p-3">
            <FileText className="h-4 w-4 text-info" /> View Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <FinancialSummaryCard label="Gross Merchandise Value" amount={amount(metrics?.gmvMinor)} currency={currency} subtext="Eligible platform order value" variant="info" />
        <FinancialSummaryCard label="Commission Revenue" amount={amount(metrics?.commissionMinor)} currency={currency} subtext="Recorded order and delivery commission" variant="success" />
        <StatCard title="Active Users" value={metrics?.activeUsers ?? '—'} icon={Building2} />
        <StatCard title="Verified Companies" value={metrics?.verifiedCompanies ?? '—'} icon={Building2} />
        <StatCard title="Active Listings" value={metrics?.activeListings ?? '—'} icon={Wrench} />
        <StatCard title="Orders" value={metrics?.orderCount ?? '—'} icon={Activity} />
        <StatCard title="Pending Verification" value={metrics?.pendingVerifications ?? '—'} icon={CheckCircle2} />
        <StatCard title="Open Disputes" value={metrics?.openDisputes ?? '—'} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="dashboard-card p-4 sm:p-5 xl:col-span-3" aria-labelledby="trade-trend">
          <div className="mb-3">
            <h2 id="trade-trend" className="text-sm font-bold text-foreground">Trade trend</h2>
            <p className="text-xs text-muted-foreground">Gross merchandise value across the last six months.</p>
          </div>
          {revenue.loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading trade trend…</p>
          ) : revenue.error ? (
            <p className="py-10 text-center text-sm text-destructive">{revenue.error}</p>
          ) : (
            <TrendChart
              points={revenuePoints}
              valueLabel="GMV"
              valueFormatter={(value) => formatMinor(value, currency)}
              ariaLabel="Gross merchandise value trend for the last six months"
            />
          )}
        </section>

        <section className="dashboard-card p-4 sm:p-5 xl:col-span-2" aria-labelledby="attention-summary">
          <div className="mb-4">
            <h2 id="attention-summary" className="text-sm font-bold text-foreground">Needs attention</h2>
            <p className="text-xs text-muted-foreground">Work queues ranked by current volume.</p>
          </div>
          <DistributionChart
            ariaLabel="Operational work queues"
            items={[
              { label: 'Pending verification', value: metrics?.pendingVerifications ?? 0, tone: 'secondary' },
              { label: 'Open disputes', value: metrics?.openDisputes ?? 0, tone: 'danger' },
              { label: 'Open returns', value: metrics?.openReturns ?? 0 }
            ]}
          />
        </section>
      </div>

      <section className="dashboard-card p-4 sm:p-5" aria-labelledby="operations-pulse">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h2 id="operations-pulse" className="mt-2 text-sm font-bold text-foreground">Operations pulse</h2>
            <p className="text-xs text-muted-foreground">Live queues that require platform attention.</p>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3 lg:max-w-3xl">
            {[
              { label: 'Pending verification', value: metrics?.pendingVerifications, route: '/companies/verification', tone: 'border-secondary/35 bg-secondary/10' },
              { label: 'Open disputes', value: metrics?.openDisputes, route: '/sales', tone: 'border-destructive/35 bg-destructive/5' },
              { label: 'Open returns', value: metrics?.openReturns, route: '/sales', tone: 'border-primary/25 bg-primary/5' }
            ].map((item) => (
              <button key={item.label} onClick={() => navigate(item.route)} className={`rounded-xl border px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`}>
                <span className="block text-lg font-black text-foreground">{item.value ?? '—'}</span>
                <span className="block text-xs font-semibold text-muted-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={activeDialog != null}
        title="Open administrative workflow"
        description={`Continue to ${activeDialog?.replace('_', ' ')}.`}
        confirmText="Proceed"
        variant="primary"
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveDialog(null)}
      />
    </div>
  );
}
