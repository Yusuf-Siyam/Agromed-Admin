import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/components/shared/Toast';
import { mockProducts } from '@/mock-data/products';
import type { ProductItem } from '@/mock-data/products';

export default function ProductList() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [products, setProducts] = useState<ProductItem[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [activeAction, setActiveAction] = useState<{
    type: 'delete';
    product: ProductItem;
  } | null>(null);

  // Statistics calculation for Inventory widgets
  const totalSku = products.length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockLimit).length;
  const activeCount = products.filter((p) => p.status === 'active').length;

  const columns: Column<ProductItem>[] = [
    { key: 'sku', label: 'SKU / ID', sortable: true },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.companyName}</span>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => <span className="font-semibold">${row.price.toFixed(2)}</span>
    },
    {
      key: 'stock',
      label: 'Stock Quantity',
      sortable: true,
      render: (row) => {
        const isOut = row.stock === 0;
        const isLow = row.stock > 0 && row.stock <= row.lowStockLimit;

        return (
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={
                isOut
                  ? 'text-destructive'
                  : isLow
                  ? 'text-secondary-foreground'
                  : 'text-foreground/80'
              }
            >
              {isOut ? 'Out of stock' : `${row.stock} units`}
            </span>
            {isLow && !isOut && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary-foreground rounded text-[9px]">
                <AlertCircle className="h-2.5 w-2.5" /> Low
              </span>
            )}
            {isOut && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-destructive/10 border border-destructive/20 text-destructive rounded text-[9px]">
                <AlertCircle className="h-2.5 w-2.5" /> Out
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/products/${row.id}`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => navigate(`/products/${row.id}/edit`)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="Edit Product"
          >
            <Edit className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setActiveAction({ type: 'delete', product: row })}
            className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      )
    }
  ];

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.companyName.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      let matchStock = true;
      if (stockFilter === 'out') {
        matchStock = p.stock === 0;
      } else if (stockFilter === 'low') {
        matchStock = p.stock > 0 && p.stock <= p.lowStockLimit;
      } else if (stockFilter === 'good') {
        matchStock = p.stock > p.lowStockLimit;
      }

      return matchSearch && matchCategory && matchStock;
    })
    .sort((a, b) => {
      let aVal = (a as any)[sortKey];
      let bVal = (b as any)[sortKey];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleDeleteConfirm = () => {
    if (!activeAction) return;
    const { product } = activeAction;

    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    success(`Product ${product.name} deleted successfully`);
    setActiveAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Products Inventory"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
        action={
          <Link
            to="/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add New Product
          </Link>
        }
      />

      {/* Inventory KPI Status Widgets Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total SKU Registered" value={totalSku} icon={ShoppingBag} />
        <StatCard title="Active Listings" value={activeCount} icon={CheckCircle2} />
        <StatCard
          title="Out of Stock SKUs"
          value={outOfStockCount}
          icon={AlertCircle}
          className={outOfStockCount > 0 ? 'border-destructive/30 bg-destructive/[0.01]' : ''}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={AlertCircle}
          className={lowStockCount > 0 ? 'border-secondary/30 bg-secondary/[0.01]' : ''}
        />
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search products, SKUs, suppliers..."
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        filterSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Categories</option>
                <option value="Seeds">Seeds</option>
                <option value="Fertilizers">Fertilizers</option>
                <option value="Pesticides">Pesticides</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Machinery">Machinery</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Stock Status:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Levels</option>
                <option value="good">Good Stock</option>
                <option value="low">Low Stock Alert</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={activeAction !== null}
        title="Delete Product Listing"
        description={`Are you sure you want to permanently delete the product ${activeAction?.product.name}? This will remove it from farmer searches in the catalog catalog.`}
        confirmText="Confirm Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
