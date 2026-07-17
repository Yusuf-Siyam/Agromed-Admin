import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  DollarSign,
  Package,
  ShoppingCart,
  Star
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockCompanies } from '@/mock-data/companies';
import { EmptyState } from '@/components/shared/States';

// Mock Lists for Tab Content
interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
}

interface OrderItem {
  id: string;
  date: string;
  customer: string;
  total: string;
  status: string;
}

interface ServiceItem {
  id: string;
  name: string;
  type: string;
  status: string;
  price: string;
}

const mockCompanyProducts: Record<string, ProductItem[]> = {
  'COMP-001': [
    { id: 'PROD-101', name: 'Premium Organic Seedlings', category: 'Seeds', price: '$45.00', stock: 120, status: 'active' },
    { id: 'PROD-102', name: 'Bio-Grow Soil Conditioner', category: 'Fertilizers', price: '$22.00', stock: 15, status: 'active' },
    { id: 'PROD-103', name: 'Natural Pest Defend Sprays', category: 'Pesticides', price: '$35.00', stock: 0, status: 'inactive' }
  ],
  'COMP-002': [
    { id: 'PROD-201', name: 'Precision Drip Sprinklers', category: 'Irrigation', price: '$120.00', stock: 45, status: 'active' },
    { id: 'PROD-202', name: 'Acme Pest-Kill Powder', category: 'Pesticides', price: '$18.00', stock: 10, status: 'active' }
  ]
};

const mockCompanyOrders: Record<string, OrderItem[]> = {
  'COMP-001': [
    { id: 'ORD-5012', date: '2026-07-18', customer: 'Abul Hossain', total: '$135.00', status: 'delivered' },
    { id: 'ORD-5011', date: '2026-07-16', customer: 'Karim Rahman', total: '$220.00', status: 'processing' },
    { id: 'ORD-5010', date: '2026-07-15', customer: 'Sufia Begum', total: '$45.00', status: 'pending' }
  ],
  'COMP-002': [
    { id: 'ORD-4091', date: '2026-07-17', customer: 'Kamal Uddin', total: '$120.00', status: 'pending' },
    { id: 'ORD-4090', date: '2026-07-14', customer: 'Rahim Mia', total: '$36.00', status: 'delivered' }
  ]
};

const mockCompanyServices: Record<string, ServiceItem[]> = {
  'COMP-001': [
    { id: 'SERV-01', name: 'Soil Quality Testing Lab Check', type: 'Testing', status: 'active', price: '$50.00' },
    { id: 'SERV-02', name: 'Smart Farm Irrigation Blueprint', type: 'Consultation', status: 'active', price: '$150.00' }
  ]
};

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find company
  const company = mockCompanies.find((c) => c.id === id);

  // Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'services'>('products');

  if (!company) {
    return (
      <div className="space-y-6">
        <PageHeader title="Company Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: 'Error' }]} />
        <EmptyState
          title="Company profile not found"
          description="The company ID you requested does not exist or may have been deleted."
          action={
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Companies
            </Link>
          }
        />
      </div>
    );
  }

  // Load tabs lists
  const products = mockCompanyProducts[company.id] || [];
  const orders = mockCompanyOrders[company.id] || [];
  const services = mockCompanyServices[company.id] || [];

  // Table Columns config
  const productColumns: Column<ProductItem>[] = [
    { key: 'id', label: 'Product ID' },
    { key: 'name', label: 'Product Name', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    {
      key: 'stock',
      label: 'Stock Status',
      render: (row) => (
        <span className={row.stock === 0 ? 'text-destructive font-bold' : row.stock < 20 ? 'text-secondary-foreground font-semibold' : 'text-foreground'}>
          {row.stock === 0 ? 'Out of stock' : `${row.stock} items`}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const orderColumns: Column<OrderItem>[] = [
    { key: 'id', label: 'Order ID' },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Farmer Client' },
    { key: 'total', label: 'Order Total' },
    { key: 'status', label: 'Order Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const serviceColumns: Column<ServiceItem>[] = [
    { key: 'id', label: 'Service ID' },
    { key: 'name', label: 'Service Title', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'type', label: 'Type' },
    { key: 'price', label: 'Price Rate' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Back to list & Page Header */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/companies')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agro Companies list
        </button>
        <PageHeader
          title={company.name}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Companies', href: '/companies' },
            { label: company.name }
          ]}
          action={
            <div className="flex gap-2">
              {company.status === 'pending' && (
                <button
                  onClick={() => navigate('/companies')}
                  className="px-3.5 py-1.5 bg-info hover:bg-info/95 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Verify Registration
                </button>
              )}
              <button
                onClick={() => navigate('/companies')}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Manage Profile
              </button>
            </div>
          }
        />
      </div>

      {/* Grid: Left Column (Company Info & Contact), Right Column (Stats & Tabbed list) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Company Main Summary Profile */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{company.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{company.id}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {company.description}
            </p>

            <div className="border-t border-border/60 my-2" />

            <div className="space-y-2.5 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">License status:</span>
                <StatusBadge status={company.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">License ID:</span>
                <span className="font-mono text-xs">{company.licenseId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Partner Rating:</span>
                <span className="flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-secondary text-secondary shrink-0" />
                  {company.rating} / 5.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Joined Date:</span>
                <span className="text-xs flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {company.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">Contact Details</h4>
            
            <div className="space-y-3.5 text-xs font-medium">
              <div className="flex items-start gap-2.5">
                <Mail className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span className="break-all">{company.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span>{company.phone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-info hover:underline break-all">
                  {company.website}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-muted-foreground">{company.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stat Cards Grid & Tabbed Listings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metric cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Products" value={company.productsCount} icon={Package} />
            <StatCard title="Total Orders" value={company.ordersCount} icon={ShoppingCart} />
            <StatCard title="Total Sales" value={company.salesCount} icon={Award} />
            <StatCard title="Monthly Revenue" value={company.monthlyRevenue} icon={DollarSign} />
          </div>

          {/* Tabbed content listings */}
          <div className="bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Tab buttons switcher */}
            <div className="flex border-b border-border/60 bg-muted/30">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                Products Catalog ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                Recent Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                Provided Services ({services.length})
              </button>
            </div>

            {/* List Panels */}
            <div className="p-4 md:p-5">
              {activeTab === 'products' && (
                products.length === 0 ? (
                  <EmptyState title="No catalog products" description="This company has not registered any products yet." />
                ) : (
                  <DataTable columns={productColumns} data={products} />
                )
              )}

              {activeTab === 'orders' && (
                orders.length === 0 ? (
                  <EmptyState title="No orders found" description="No orders containing this company's products have been placed yet." />
                ) : (
                  <DataTable columns={orderColumns} data={orders} />
                )
              )}

              {activeTab === 'services' && (
                services.length === 0 ? (
                  <EmptyState title="No services registered" description="This company has not registered any agricultural consultancy/machinery services." />
                ) : (
                  <DataTable columns={serviceColumns} data={services} />
                )
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
