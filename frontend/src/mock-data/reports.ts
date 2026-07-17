export interface ReportType {
  id: string;
  name: string;
  description: string;
  fields: string[];
}

export const mockReportTypes: ReportType[] = [
  {
    id: 'REP-SALES',
    name: 'Sales Performance Audit',
    description: 'Detailed analysis of sales volumes, item collections, average transaction checks, and growth metrics across specific timelines.',
    fields: ['Start Date', 'End Date', 'Product Segment', 'Regional Zone']
  },
  {
    id: 'REP-COMPANY',
    name: 'Agro Company Revenue Audit',
    description: 'Corporate ranking reports tracking total commission cuts, product catalog sizes, active services, and customer feedback ratings.',
    fields: ['Company ID', 'Financial Year', 'Performance Tier']
  },
  {
    id: 'REP-REVENUE',
    name: 'Revenue & Commission Analysis',
    description: 'Summary ledger tracking gross revenue, net platform commissions, payment gateway fees, and refunded transactions.',
    fields: ['Billing Method', 'Tax Cycle', 'Payout Status']
  },
  {
    id: 'REP-PRODUCT',
    name: 'Product Inventory & Demand',
    description: 'Report tracking catalog stock levels, low stock alerts, highest selling brands, and non-performing SKUs.',
    fields: ['Category', 'Stock Threshold Filter', 'Supplier']
  },
  {
    id: 'REP-USER',
    name: 'Platform User Growth Log',
    description: 'Tracking numbers for new farmers registrations, wholesale buyers, geographic distributions, and active login sessions.',
    fields: ['User Role (Farmer/Buyer)', 'District', 'Registration Year']
  }
];
