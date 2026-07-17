import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, ClipboardList, DollarSign, BarChart3 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockFarmers, mockFarmerPurchases } from '@/mock-data/farmers';
import type { FarmerPurchaseItem } from '@/mock-data/farmers';
import { EmptyState } from '@/components/shared/States';

export default function FarmerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Retrieve farmer profile
  const farmer = mockFarmers.find((f) => f.id === id);

  if (!farmer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Farmer Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Farmers', href: '/farmers' }, { label: 'Error' }]} />
        <EmptyState
          title="Farmer profile not found"
          description="The farmer ID you requested does not exist or may have been suspended."
          action={
            <Link
              to="/farmers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Farmers list
            </Link>
          }
        />
      </div>
    );
  }

  // Load purchase history
  const purchases = mockFarmerPurchases[farmer.id] || [];

  // Table Columns config
  const purchaseColumns: Column<FarmerPurchaseItem>[] = [
    { key: 'id', label: 'Order ID' },
    { key: 'date', label: 'Purchase Date' },
    { key: 'itemsSummary', label: 'Items Details', render: (row) => <span className="font-semibold">{row.itemsSummary}</span> },
    { key: 'itemsCount', label: 'Qty Count', align: 'center' },
    {
      key: 'status',
      label: 'Order Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'total', label: 'Spent amount', align: 'right' }
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/farmers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Farmers list
        </button>
        <PageHeader
          title={farmer.name}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Farmers', href: '/farmers' },
            { label: farmer.name }
          ]}
          action={
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/farmers')}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          }
        />
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Profile info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{farmer.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{farmer.id}</span>
              </div>
            </div>

            <div className="border-t border-border/60 my-2" />

            <div className="space-y-2.5 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Account Status:</span>
                <StatusBadge status={farmer.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Region District:</span>
                <span className="text-xs">{farmer.district}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Cultivating Crops:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {farmer.cropCategories.map((crop, idx) => (
                    <span key={idx} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium border border-border">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Member Since:</span>
                <span className="text-xs flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {farmer.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Contact and Land Details */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">Farming Profile & Contact</h4>

            <div className="space-y-3.5 text-xs font-medium">
              <div className="flex items-start gap-2.5">
                <Phone className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span>{farmer.phone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span className="break-all">{farmer.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-muted-foreground">{farmer.address}</span>
              </div>
              <div className="border-t border-border/60 my-2" />
              <div className="flex items-center justify-between font-semibold pt-1">
                <span className="text-muted-foreground text-[11px]">Cultivated Farm Size:</span>
                <span className="text-foreground text-sm font-bold">{farmer.farmSize} Acres</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column statistics and lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats widgets */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="Total Orders" value={farmer.totalOrders} icon={ClipboardList} />
            <StatCard title="Total Spent" value={farmer.totalSpent} icon={DollarSign} />
            <StatCard title="Avg. Order Value" value={farmer.avgOrderValue} icon={BarChart3} />
          </div>

          {/* Purchase history table */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-foreground">Purchase History</h4>
            {purchases.length === 0 ? (
              <EmptyState title="No orders placed yet" description="This farmer has not completed any purchases on our connected platform yet." />
            ) : (
              <DataTable columns={purchaseColumns} data={purchases} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
