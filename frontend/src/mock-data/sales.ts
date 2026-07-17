export interface SalesTrendItem {
  label: string;
  sales: number;
}

export interface CategoryBreakdownItem {
  name: string;
  percentage: number;
  color: string;
}

export interface CompanyPerformanceItem {
  rank: number;
  name: string;
  salesQty: number;
  revenue: number;
  growth: number; // percentage
}

export const mockSalesTrends: Record<'daily' | 'weekly' | 'monthly' | 'yearly', SalesTrendItem[]> = {
  daily: [
    { label: 'Mon', sales: 1200 },
    { label: 'Tue', sales: 1900 },
    { label: 'Wed', sales: 1400 },
    { label: 'Thu', sales: 2200 },
    { label: 'Fri', sales: 2900 },
    { label: 'Sat', sales: 3400 },
    { label: 'Sun', sales: 2100 }
  ],
  weekly: [
    { label: 'Week 1', sales: 12400 },
    { label: 'Week 2', sales: 15900 },
    { label: 'Week 3', sales: 14200 },
    { label: 'Week 4', sales: 20100 }
  ],
  monthly: [
    { label: 'Jan', sales: 42000 },
    { label: 'Feb', sales: 48000 },
    { label: 'Mar', sales: 55000 },
    { label: 'Apr', sales: 49000 },
    { label: 'May', sales: 62000 },
    { label: 'Jun', sales: 74000 },
    { label: 'Jul', sales: 89000 }
  ],
  yearly: [
    { label: '2023', sales: 380000 },
    { label: '2024', sales: 520000 },
    { label: '2025', sales: 790000 }
  ]
};

export const mockCategoryBreakdowns: CategoryBreakdownItem[] = [
  { name: 'Seeds', percentage: 35, color: '#264653' }, // Primary
  { name: 'Fertilizers', percentage: 30, color: '#2A9D8F' }, // Info/Teal
  { name: 'Pesticides', percentage: 20, color: '#E9C46A' }, // Amber Accent
  { name: 'Irrigation', percentage: 10, color: '#F4A261' }, // Orange/Warning
  { name: 'Machinery', percentage: 5, color: '#E76F51' } // Coral Red
];

export const mockCompanyPerformances: CompanyPerformanceItem[] = [
  { rank: 1, name: 'Greenfield Agro Ltd.', salesQty: 840, revenue: 124500, growth: 18.5 },
  { rank: 2, name: 'Bayer CropScience BD', salesQty: 620, revenue: 78900, growth: 12.2 },
  { rank: 3, name: 'Acme Agritech Solutions', salesQty: 480, revenue: 38400, growth: -4.5 },
  { rank: 4, name: 'Teesta Seed Distributors', salesQty: 250, revenue: 6700, growth: 2.1 }
];
