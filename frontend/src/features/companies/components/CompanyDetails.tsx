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
  Shield,
  FileText,
  TrendingUp,
  CreditCard,
  Percent,
  CheckCircle2,
  Ban
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import PercentageBadge from '@/components/shared/PercentageBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { mockCompanies } from '@/mock-data/companies';
import { EmptyState } from '@/components/shared/States';
import { useToast } from '@/components/shared/Toast';

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  // Find company
  const initialCompany = mockCompanies.find((c) => c.id === id);
  const [company, setCompany] = useState(initialCompany);

  // Verification Dialog triggers
  const [activeAction, setActiveAction] = useState<'verify' | 'suspend' | 'activate' | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

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

  // Calculate detailed v2 financial fields based on GMV sales
  // Let's assume a default 10% commission override model, with some specific discounts
  const grossSales = company.salesCount * 50; // mock average ticket price
  const commissionRate = company.id === 'COMP-001' ? 8.0 : 10.0; // special commission override
  const commissionEarned = (grossSales * commissionRate) / 100;
  const platformFee = grossSales * 0.02; // gateway / payment fees (2%)
  const discountFunded = grossSales * 0.015; // discounts absorbed (1.5%)
  const netCompanySale = grossSales - commissionEarned - platformFee - discountFunded;
  
  const paidAmount = netCompanySale * 0.8; // 80% settled
  const pendingAmount = netCompanySale - paidAmount; // 20% due

  const handleExecuteVerification = () => {
    if (!activeAction) return;

    let nextStatus: 'active' | 'suspended' = 'active';
    let msg = '';

    if (activeAction === 'verify' || activeAction === 'activate') {
      nextStatus = 'active';
      msg = `Company "${company.name}" has been approved and verified successfully.`;
    } else if (activeAction === 'suspend') {
      nextStatus = 'suspended';
      msg = `Company "${company.name}" suspension active.`;
    }

    setCompany((prev) => prev ? { ...prev, status: nextStatus } : prev);
    success(msg);
    setActiveAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Back navigation & Page Header */}
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
                  onClick={() => setActiveAction('verify')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-info hover:bg-info/95 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Company
                </button>
              )}
              {company.status === 'active' && (
                <button
                  onClick={() => setActiveAction('suspend')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive hover:bg-destructive/95 text-destructive-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Ban className="h-4 w-4" />
                  Suspend Account
                </button>
              )}
              {company.status === 'suspended' && (
                <button
                  onClick={() => setActiveAction('activate')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-info hover:bg-info/95 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Reactivate Account
                </button>
              )}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 1: Business Info & Contact Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground leading-snug">{company.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{company.id}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {company.description}
            </p>

            <div className="border-t border-border/60 my-2" />

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification status:</span>
                <StatusBadge status={company.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">License ID:</span>
                <span className="font-mono">{company.licenseId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Joined Date:</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {company.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3.5 text-xs font-semibold">
            <h4 className="text-[10px] font-bold text-foreground tracking-wider uppercase">Contact Information</h4>
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="break-all">{company.email}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{company.phone}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-info hover:underline break-all">
                {company.website}
              </a>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="leading-relaxed text-muted-foreground">{company.address}</span>
            </div>
          </div>
        </div>

        {/* Financial Auditing Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 2: Sales Performance Details */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Sales & Earnings Performance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FinancialSummaryCard label="Total Sales (GMV)" amount={grossSales} variant="info" />
              <FinancialSummaryCard label="Platform Transaction Fee (2%)" amount={platformFee} variant="warning" />
              <FinancialSummaryCard label="Discounts Absorbed" amount={discountFunded} variant="danger" />
              <FinancialSummaryCard label="Net Company Sale" amount={netCompanySale} variant="success" />
            </div>
          </div>

          {/* Section 3 & 4: Commission & Settlements Billing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Commission Settings overview */}
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
                <Percent className="h-4.5 w-4.5 text-primary" />
                Commission Configuration
              </h4>
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground">Commission Model:</span>
                  <span className={company.id === 'COMP-001' ? 'text-secondary-foreground' : 'text-primary'}>
                    {company.id === 'COMP-001' ? 'Special Override' : 'Standard Rate'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground">Commission Rate:</span>
                  <PercentageBadge value={commissionRate} type="commission" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Commission Earned:</span>
                  <span className="font-bold text-foreground">${commissionEarned.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Billing settlement records */}
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                Billing Settlements
              </h4>
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground">Settled / Paid to Date:</span>
                  <span className="text-info">${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending Settlement Owed:</span>
                  <span className="text-secondary-foreground font-bold">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 5: Verification Documents Viewer (View-Only) */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-primary" />
              Verified Trade Licensing Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Trade License PDF', ref: 'LIC-2025-0918' },
                { name: 'TIN Tax Registration Certificate', ref: 'TIN-40182-901' },
                { name: 'VAT Registration Certificate', ref: 'VAT-9018281' }
              ].map((doc, idx) => (
                <div
                  key={idx}
                  onClick={() => setViewingDoc(doc.name)}
                  className="border border-border/80 rounded-lg p-3 hover:bg-muted hover:border-primary/20 transition-all cursor-pointer flex flex-col justify-between h-24"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] font-bold text-foreground block truncate">{doc.name}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{doc.ref}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Document display screen modal */}
            {viewingDoc && (
              <div className="border border-border/80 bg-accent/10 rounded-xl p-4 mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-bold text-foreground">Secure Vault Preview: {viewingDoc}</span>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
                <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-xs">
                  <Shield className="h-8 w-8 text-primary/80 mb-1" />
                  <span className="font-bold">Cryptographically Verified</span>
                  <span className="text-[10px] text-muted-foreground">Original license ledger entry confirmed by the platform governor.</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Verification Actions Dialog Confirmation */}
      <ConfirmDialog
        isOpen={activeAction !== null}
        title={activeAction === 'verify' ? 'Approve Verification' : activeAction === 'suspend' ? 'Suspend Account' : 'Reactivate Account'}
        description={`Are you sure you want to execute the "${activeAction}" workflow for ${company.name}? This will update their platform status.`}
        confirmText="Confirm"
        variant={activeAction === 'suspend' ? 'danger' : 'primary'}
        onConfirm={handleExecuteVerification}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
