import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import { Tag, Building2, HelpCircle } from 'lucide-react';

interface CompanyFundedDiscount {
  id: string;
  date: string;
  company: string;
  amount: number;
  reason: string;
}

interface PlatformFundedDiscount {
  id: string;
  date: string;
  amount: number;
  campaign: string;
}

export default function DiscountsDashboard() {
  // Mock dataset for Company-Funded Discounts
  const [companyDiscounts] = useState<CompanyFundedDiscount[]>([
    { id: 'DSC-C01', date: '2026-08-11', company: 'Bayer CropScience BD', amount: 450.00, reason: 'Bulk Purchase Seed Promo' },
    { id: 'DSC-C02', date: '2026-08-10', company: 'Greenfield Agro Ltd.', amount: 350.00, reason: 'Seasonal Olive Harvesting Coupon' },
    { id: 'DSC-C03', date: '2026-08-09', company: 'Acme Agritech Solutions', amount: 120.00, reason: 'First-time Farmer onboarding discount' },
    { id: 'DSC-C04', date: '2026-08-08', company: 'Sufala Fertilizer Co.', amount: 950.00, reason: 'Monsoon Fertilizer clearance campaign' }
  ]);

  // Mock dataset for Platform-Funded Discounts
  const [platformDiscounts] = useState<PlatformFundedDiscount[]>([
    { id: 'DSC-P01', date: '2026-08-11', amount: 1500.00, campaign: 'AgroMED monsoon subsidy voucher' },
    { id: 'DSC-P02', date: '2026-08-08', amount: 3500.00, campaign: 'Farming Equipment promotional subsidy' },
    { id: 'DSC-P03', date: '2026-08-05', amount: 800.00, campaign: 'Independence Day seed voucher' }
  ]);

  // Search filter states
  const [searchCompany, setSearchCompany] = useState('');
  const [searchPlatform, setSearchPlatform] = useState('');

  // Filtering datasets
  const filteredCompanyDiscounts = companyDiscounts.filter((item) =>
    item.company.toLowerCase().includes(searchCompany.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchCompany.toLowerCase())
  );

  const filteredPlatformDiscounts = platformDiscounts.filter((item) =>
    item.campaign.toLowerCase().includes(searchPlatform.toLowerCase())
  );

  // Totals calculations
  const totalCompanyFunded = companyDiscounts.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPlatformFunded = platformDiscounts.reduce((acc, curr) => acc + curr.amount, 0);

  // Company table columns
  const companyColumns: Column<CompanyFundedDiscount>[] = [
    { key: 'date', label: 'Issued Date', sortable: true },
    { key: 'id', label: 'Discount ID' },
    {
      key: 'company',
      label: 'Agro Company Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold">{row.company}</span>
        </div>
      )
    },
    { key: 'reason', label: 'Reason / Campaign' },
    {
      key: 'amount',
      label: 'Discount Value',
      align: 'right',
      sortable: true,
      render: (row) => `-$${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'impact',
      label: 'Settlement Impact',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-destructive text-xs font-semibold">
          -${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Settlement Cut)
        </span>
      )
    }
  ];

  // Platform table columns
  const platformColumns: Column<PlatformFundedDiscount>[] = [
    { key: 'date', label: 'Issued Date', sortable: true },
    { key: 'id', label: 'Discount ID' },
    { key: 'campaign', label: 'Campaign / Reason' },
    {
      key: 'amount',
      label: 'Discount Value',
      align: 'right',
      sortable: true,
      render: (row) => `-$${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: 'impact',
      label: 'Operating Impact',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-secondary-foreground text-xs font-semibold">
          -${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Platform Expense)
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Discounts & Campaigns"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Financial', href: '/discounts' }, { label: 'Discounts' }]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Tag className="h-4 w-4" />
            Discounts Auditing Active
          </div>
        }
      />

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FinancialSummaryCard
          label="Total Company-Funded Discounts"
          amount={totalCompanyFunded}
          subtext="Direct deductions from suppliers payouts settlement amounts"
          variant="warning"
        />
        <FinancialSummaryCard
          label="Total Platform-Funded Discounts"
          amount={totalPlatformFunded}
          subtext="Platform-absorbed coupon values counted as operational expenses"
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company-Funded Section */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">Company-Funded Discounts</h3>
              <p className="text-[11px] text-muted-foreground">Absorbed by companies to promote sales — reduces settlement payouts</p>
            </div>
            <div className="p-1.5 bg-warning/10 text-warning border border-warning/20 rounded">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <DataTable
            columns={companyColumns}
            data={filteredCompanyDiscounts}
            searchPlaceholder="Search company discounts..."
            searchValue={searchCompany}
            onSearchChange={setSearchCompany}
          />
        </div>

        {/* Platform-Funded Section */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">Platform-Funded Campaign Subsidies</h3>
              <p className="text-[11px] text-muted-foreground">Absorbed by AgroMED platform — logged as operational operating expenses</p>
            </div>
            <div className="p-1.5 bg-danger/10 text-danger border border-danger/20 rounded">
              <HelpCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <DataTable
            columns={platformColumns}
            data={filteredPlatformDiscounts}
            searchPlaceholder="Search platform campaigns..."
            searchValue={searchPlatform}
            onSearchChange={setSearchPlatform}
          />
        </div>
      </div>
    </div>
  );
}
