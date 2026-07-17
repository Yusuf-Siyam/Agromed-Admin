import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Calendar, Building, CreditCard, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockOrders } from '@/mock-data/orders';
import { EmptyState } from '@/components/shared/States';
import { cn } from '@/lib/utils';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find order
  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="space-y-6">
        <PageHeader title="Order Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Orders', href: '/orders' }, { label: 'Error' }]} />
        <EmptyState
          title="Order record not found"
          description="The order ID you requested does not exist or may have been archived."
          action={
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Order Log
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to list */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order Log
        </button>
        <PageHeader
          title={`Order: ${order.id}`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Orders', href: '/orders' },
            { label: order.id }
          ]}
          action={
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/orders')}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Download Invoice
              </button>
            </div>
          }
        />
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Client details and Product Checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Grid for Customer and supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                Farmer Client Info
              </h3>
              <div className="space-y-3.5 text-xs font-medium">
                <p className="text-sm font-bold text-foreground">{order.farmerName}</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.farmerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.farmerEmail}</span>
                </div>
              </div>
            </div>

            {/* Agro Company Supplier Details */}
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-primary" />
                Agro Company Supplier
              </h3>
              <div className="space-y-3.5 text-xs font-medium">
                <p className="text-sm font-bold text-foreground">{order.companyName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Supplier ID:</span>
                  <span className="font-mono">{order.companyId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">License Code:</span>
                  <span className="font-mono">AGRO-LIC-2025-0042</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Items Table list */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Order Invoice Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-3 text-left">Product Name & SKU</th>
                    <th className="pb-3 text-center">Unit Price</th>
                    <th className="pb-3 text-center">Quantity</th>
                    <th className="pb-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {order.products.map((p, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 text-left">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">${p.price.toFixed(2)}</td>
                      <td className="py-3 text-center font-bold">{p.qty} items</td>
                      <td className="py-3 text-right font-bold">${(p.qty * p.price).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-border pt-3">
                    <td colSpan={3} className="py-4 text-right text-muted-foreground text-xs uppercase tracking-wide">
                      Invoice total
                    </td>
                    <td className="py-4 text-right text-sm text-info font-black">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side Status Timeline and parameters summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary params details */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Logistics Parameters</h3>

            <div className="space-y-3.5 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Payment State:</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Delivery State:</span>
                <StatusBadge status={order.deliveryStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Payment Method:</span>
                <span className="text-xs flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Placed On:</span>
                <span className="text-xs flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {order.date}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline Milestone components */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Lifecycle Tracker</h3>
            
            {/* Timeline Events Stack */}
            <div className="relative pl-6 space-y-6 border-l border-border/80 ml-2.5">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  {/* Point bullet */}
                  <span className={cn(
                    'absolute -left-[31px] top-0.5 p-1 rounded-full border flex items-center justify-center bg-card',
                    event.completed
                      ? 'border-info text-info'
                      : 'border-border text-muted-foreground/40 bg-muted/20'
                  )}>
                    <CheckCircle className="h-3.5 w-3.5" />
                  </span>
                  
                  {/* Event Text */}
                  <div className="space-y-1">
                    <p className={cn(
                      'text-xs font-bold leading-none',
                      event.completed ? 'text-foreground' : 'text-muted-foreground/60'
                    )}>
                      {event.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground block font-semibold">
                      {event.date}
                    </span>
                    <p className="text-[10px] text-muted-foreground/80 leading-normal">
                      {event.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
