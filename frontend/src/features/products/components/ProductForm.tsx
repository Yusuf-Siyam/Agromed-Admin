import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Save } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/Toast';
import { useApi } from '@/lib/useApi';
import { listListings } from '@/lib/superadmin-api';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error } = useToast();

  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockLimit, setLowStockLimit] = useState('');
  const [sku, setSku] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [description, setDescription] = useState('');
  const isLoading = false;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const listings = useApi((token) => listListings(token, { kind: 'product', limit: 100 }), []);

  useEffect(() => {
    if (!isEditMode || !listings.data) return;
    const prod = listings.data.items.find((p) => p.id === id);
    if (!prod) {
      error('That listing was not found.');
      navigate('/products');
      return;
    }

    setName(prod.nameEn ?? prod.sku);
    setCategory(prod.categoryCode);
    setPrice(prod.fromPriceMinor == null ? '' : (prod.fromPriceMinor / 100).toString());
    setStock(String(prod.stockOnHand));
    setLowStockLimit('');
    setSku(prod.sku);
    setCompanyName(prod.sellerName);
    setStatus(prod.status === 'active' ? 'active' : 'inactive');
    setDescription('');
  }, [id, isEditMode, listings.data, navigate, error]);

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Product name is required';
    if (!category) errs.category = 'Category is required';

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = 'Price must be a positive number';
    }

    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      errs.stock = 'Stock quantity cannot be negative';
    }

    const parsedLimit = parseInt(lowStockLimit);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      errs.lowStockLimit = 'Low stock limit cannot be negative';
    }

    if (!sku.trim()) errs.sku = 'SKU identification code is required';
    if (!companyName.trim()) errs.companyName = 'Supplier Agro Company is required';
    if (!description.trim()) errs.description = 'Product description is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      error('Please check form validation details');
      return;
    }

    error('The platform console cannot edit a seller’s listing. The company does this in its own portal.');
  };

  return (
    <div className="space-y-6">
      { }
      <div className="space-y-2">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </button>
        <PageHeader
          title={isEditMode ? `Edit Product: ${name}` : 'Add New Product'}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: isEditMode ? 'Edit Product' : 'Add Product' }
          ]}
        />
      </div>

      { }
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <Lock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-foreground">Read-only</p>
          <p className="text-muted-foreground">
            Listings belong to the company that published them. Creating, pricing and withdrawing
            one happens in that company&rsquo;s own portal, where its licences and certificates are
            checked. This screen shows the live values.
          </p>
        </div>
      </div>

      { }
      <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            { }
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="name" className="text-xs font-bold text-foreground/80">
                Product Title / Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                disabled={isLoading}
                placeholder="e.g. Urea Max Fertilizer 50kg"
                className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                  errors.name ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                }`}
              />
              {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
            </div>

            { }
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-xs font-bold text-foreground/80">
                Product Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
                disabled={isLoading}
                className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                  errors.category ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                }`}
              >
                <option value="">Select a Category</option>
                <option value="Seeds">Seeds</option>
                <option value="Fertilizers">Fertilizers</option>
                <option value="Pesticides">Pesticides</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Machinery">Machinery</option>
              </select>
              {errors.category && <p className="text-xs font-medium text-destructive">{errors.category}</p>}
            </div>

            { }
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-xs font-bold text-foreground/80">
                Unit Price (BDT)
              </label>
              <input
                id="price"
                type="text"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors({ ...errors, price: '' });
                }}
                disabled={isLoading}
                placeholder="35.00"
                className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                  errors.price ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                }`}
              />
              {errors.price && <p className="text-xs font-medium text-destructive">{errors.price}</p>}
            </div>

            { }
            <div className="space-y-1.5">
              <label htmlFor="stock" className="text-xs font-bold text-foreground/80">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (errors.stock) setErrors({ ...errors, stock: '' });
                }}
                disabled={isLoading}
                placeholder="100"
                className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                  errors.stock ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                }`}
              />
              {errors.stock && <p className="text-xs font-medium text-destructive">{errors.stock}</p>}
            </div>

            { }
            <div className="space-y-1.5">
              <label htmlFor="lowStockLimit" className="text-xs font-bold text-foreground/80">
                Low Stock Threshold
              </label>
              <input
                id="lowStockLimit"
                type="number"
                value={lowStockLimit}
                onChange={(e) => {
                  setLowStockLimit(e.target.value);
                  if (errors.lowStockLimit) setErrors({ ...errors, lowStockLimit: '' });
                }}
                disabled={isLoading}
                placeholder="20"
                className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                  errors.lowStockLimit ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                }`}
              />
              {errors.lowStockLimit && <p className="text-xs font-medium text-destructive">{errors.lowStockLimit}</p>}
            </div>

            { }
            <div className="space-y-1.5">
              <label htmlFor="sku" className="text-xs font-bold text-foreground/80">
                SKU / Catalog Identification
              </label>
              <input
                id="sku"
                type="text"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  if (errors.sku) setErrors({ ...errors, sku: '' });
                }}
                disabled={isLoading}
                placeholder="e.g. FERT-URE-MX50"
                className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                  errors.sku ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                }`}
              />
              {errors.sku && <p className="text-xs font-medium text-destructive">{errors.sku}</p>}
            </div>

            { }
            <div className="space-y-1.5">
              <label htmlFor="companyName" className="text-xs font-bold text-foreground/80">
                Supplier Agro Company
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors({ ...errors, companyName: '' });
                }}
                disabled={isLoading}
                placeholder="e.g. Greenfield Agro Ltd."
                className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                  errors.companyName ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                }`}
              />
              {errors.companyName && <p className="text-xs font-medium text-destructive">{errors.companyName}</p>}
            </div>

            { }
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-bold text-foreground/80">
                Catalog Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="active">Active (Visible to farmers)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          { }
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-bold text-foreground/80">
              Product Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              disabled={isLoading}
              placeholder="Provide a detailed breakdown of crop application rates, chemical compounds details, seeds germination constraints..."
              className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                errors.description ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
              }`}
            />
            {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
          </div>

          { }
          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/products"
              className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
