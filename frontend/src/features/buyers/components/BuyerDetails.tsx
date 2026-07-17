import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, ClipboardList, DollarSign, BarChart3, Building } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockBuyers, mockBuyerOrders } from '@/mock-data/buyers';
import type { BuyerOrderItem } from '@/mock-data/buyers';
import { EmptyState } from '@/components/shared/States';

export default function BuyerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const buyer = mockBuyers.find((b) => b.id === id);

  if (!buyer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Buyer Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Buyers', href: '/buyers' }, { label: 'Error' }]} />
        <EmptyState
          title="Buyer profile not found"
          description="The buyer ID you requested does not exist or may have been suspended."
          action={
            <Link
              to="/buyers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Buyers list
            </Link>
          }
        />
      </div>
    );
  }

  const orders = mockBuyerOrders[buyer.id] || [];

  const orderColumns: Column<BuyerOrderItem>[] = [
    { key: 'id', label: 'Order ID' },
    { key: 'date', label: 'Order Date' },
    { key: 'itemsSummary', label: 'Purchased Products', render: (row) => <span className="font-semibold">{row.itemsSummary}</span> },
    { key: 'itemsCount', label: 'Items Qty', align: 'center' },
    {
      key: 'status',
      label: 'Order Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'total', label: 'Total Amount', align: 'right' }
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/buyers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Buyers list
        </button>
        <PageHeader
          title={buyer.name}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Buyers', href: '/buyers' },
            { label: buyer.name }
          ]}
          action={
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/buyers')}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Edit Account
              </button>
            </div>
          }
        />
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{buyer.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{buyer.id}</span>
              </div>
            </div>

            <div className="border-t border-border/60 my-2" />

            <div className="space-y-2.5 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Buyer Status:</span>
                <StatusBadge status={buyer.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Buyer Type:</span>
                <span className="text-xs font-bold uppercase">{buyer.buyerType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Joined Date:</span>
                <span className="text-xs flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {buyer.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Contact and Corporate Info */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">Corporate & Contact Info</h4>

            <div className="space-y-3.5 text-xs font-medium">
              <div className="flex items-start gap-2.5">
                <Building className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span className="font-semibold">{buyer.companyName}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span>{buyer.phone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span className="break-all">{buyer.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-muted-foreground">{buyer.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side stats and orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="Total Orders" value={buyer.totalOrders} icon={ClipboardList} />
            <StatCard title="Total Purchases" value={buyer.totalSpent} icon={DollarSign} />
            <StatCard title="Avg. Order Value" value={buyer.avgOrderValue} icon={BarChart3} />
          </div>

          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-foreground">Orders History</h4>
            {orders.length === 0 ? (
              <EmptyState title="No orders placed yet" description="This corporate buyer has not placed any orders yet." />
            ) : (
              <DataTable columns={orderColumns} data={orders} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
