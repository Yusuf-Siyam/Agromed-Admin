import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, Archive, Edit } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockProducts } from '@/mock-data/products';
import { EmptyState } from '@/components/shared/States';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: 'Error' }]} />
        <EmptyState
          title="Product not found"
          description="The product SKU you requested does not exist or may have been deleted."
          action={
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Catalog
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </button>
        <PageHeader
          title={product.name}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.name }
          ]}
          action={
            <button
              onClick={() => navigate(`/products/${product.id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              Edit Product
            </button>
          }
        />
      </div>

      {/* Grid: Details card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Details card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
              </div>
            </div>

            <div className="border-t border-border/60 my-2" />

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">Product Specifications</h4>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right side stats widgets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">Inventory Metrics</h4>
            
            <div className="space-y-3.5 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Catalog status:</span>
                <StatusBadge status={product.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Supplier Company:</span>
                <span className="text-xs">{product.companyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Product Category:</span>
                <span className="text-xs font-bold">{product.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Price rate:</span>
                <span className="text-xs font-bold flex items-center text-info">
                  <DollarSign className="h-3.5 w-3.5" />
                  {product.price.toFixed(2)} / unit
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Stock Level:</span>
                <span className="text-xs font-bold flex items-center gap-1">
                  <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                  {product.stock === 0 ? (
                    <span className="text-destructive font-bold">Out of Stock</span>
                  ) : (
                    <span>{product.stock} units available</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Low Stock Trigger:</span>
                <span className="text-xs font-mono">{product.lowStockLimit} units</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Registered Date:</span>
                <span className="text-xs">{product.registeredDate}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
