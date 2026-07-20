import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Loader2 } from 'lucide-react';
import type { CompanyItem } from '@/mock-data/companies';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: CompanyItem) => void;
  existingCount: number;
}

export default function CompanyModal({
  isOpen,
  onClose,
  onSave,
  existingCount
}: CompanyModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Company name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!licenseId.trim()) errs.licenseId = 'License ID is required';
    if (!address.trim()) errs.address = 'Address is required';
    if (!description.trim()) errs.description = 'Company description is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const newId = `COMP-${String(existingCount + 1).padStart(3, '0')}`;

      const newCompany: CompanyItem = {
        id: newId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        rating: 5.0,
        productsCount: 0,
        ordersCount: 0,
        salesCount: 0,
        status,
        joinedDate: today,
        address: address.trim(),
        website: website.trim() ? (website.startsWith('http') ? website.trim() : `https://${website.trim()}`) : 'N/A',
        licenseId: licenseId.trim(),
        description: description.trim(),
        monthlyRevenue: '$0.00'
      };

      setIsLoading(false);
      onSave(newCompany);
      resetForm();
    }, 600);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setLicenseId('');
    setWebsite('');
    setAddress('');
    setStatus('active');
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        className="bg-card border border-border/80 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative z-10 transform transition-all duration-200 animate-in fade-in zoom-in-95 my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Add New Agro Company</h2>
              <p className="text-xs text-muted-foreground">Register a new verified supplier or partner company</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Company Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AgriTech BD Ltd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.name ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            {/* License ID */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Trade License / Reg ID <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AGRO-LIC-2026-0088"
                value={licenseId}
                onChange={(e) => setLicenseId(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.licenseId ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.licenseId && <p className="text-xs text-destructive mt-1">{errors.licenseId}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Official Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                placeholder="contact@agritech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.email ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="+880 1700-000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.phone ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Website URL
              </label>
              <input
                type="text"
                placeholder="https://agritech.com.bd"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'pending' | 'suspended')}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="active">Active (Verified)</option>
                <option value="pending">Pending Review</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Office Address <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. House 12, Road 4, Gulshan-1, Dhaka, Bangladesh"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.address ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Company Description & Focus Areas <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Brief overview of company products, market focus, and services..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
                errors.description ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Company'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
