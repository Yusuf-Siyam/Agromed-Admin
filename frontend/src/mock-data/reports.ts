export interface ReportType {
  id: string;
  name: string;
  description: string;
  fields: string[];
}

export const mockReportTypes: ReportType[] = [
  {
    id: 'REP-SALES',
    name: 'Sales Report',
    description: 'Detailed audit of gross sales transactions (GMV) by company, transaction values, and date ranges.',
    fields: ['Date Range', 'Company Name', 'Transaction Value', 'Commission Rate %']
  },
  {
    id: 'REP-COMPANY',
    name: 'Company Report',
    description: 'Corporate performance summaries, licensing verifications, catalog size, and overall billing contribution share splits.',
    fields: ['Company ID', 'Verification Status', 'Joined Date', 'Rating Score']
  },
  {
    id: 'REP-REVENUE',
    name: 'Revenue Report',
    description: 'Consolidated platform commission revenue ledger tracking earnings, deductions, and tax cuts.',
    fields: ['Billing Date', 'Revenue Stream Type', 'Amount Earned', 'Status']
  },
  {
    id: 'REP-COMMISSION',
    name: 'Commission Report',
    description: 'Platform commission overrides ledger detailing default cuts, specific overrides, and earned vs pending balances.',
    fields: ['Company Name', 'Standard/Override Rate %', 'Earnings Owed', 'Payment Status']
  },
  {
    id: 'REP-SETTLEMENT',
    name: 'Settlement Report',
    description: 'Detailed company payout settlements detailing gross sales, discount deductions, tax cuts, and final net settlement paid.',
    fields: ['Settlement ID', 'Gross GMV', 'Discounts Cut', 'Taxes & Fees Cut', 'Final Settlement Paid']
  }
];
