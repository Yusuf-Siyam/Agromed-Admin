export interface CompanyItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  productsCount: number;
  ordersCount: number;
  salesCount: number;
  status: 'active' | 'suspended' | 'pending';
  joinedDate: string;
  address: string;
  website: string;
  licenseId: string;
  description: string;
  monthlyRevenue: string;
}

export const mockCompanies: CompanyItem[] = [
  {
    id: 'COMP-001',
    name: 'Greenfield Agro Ltd.',
    email: 'info@greenfieldagro.com',
    phone: '+880 1711-223344',
    rating: 4.8,
    productsCount: 120,
    ordersCount: 450,
    salesCount: 8400,
    status: 'active',
    joinedDate: '2025-01-10',
    address: 'Plot 42, Road 11, Banani, Dhaka-1213, Bangladesh',
    website: 'https://greenfieldagro.com',
    licenseId: 'AGRO-LIC-2025-0042',
    description: 'Leading provider of high-yield organic seeds, bio-fertilizers, and high-tech agricultural machinery in Bangladesh. Empowering farmers with premium crop nutrition and pest control products.',
    monthlyRevenue: '$12,450.00'
  },
  {
    id: 'COMP-002',
    name: 'Acme Agritech Solutions',
    email: 'contact@acmeagritech.com',
    phone: '+880 1812-334455',
    rating: 4.5,
    productsCount: 85,
    ordersCount: 310,
    salesCount: 5200,
    status: 'active',
    joinedDate: '2025-03-15',
    address: 'Level 6, Concord Tower, Kazi Nazrul Islam Ave, Dhaka',
    website: 'https://acmeagritech.com',
    licenseId: 'AGRO-LIC-2025-0118',
    description: 'Pioneers in precision farming products, pest management chemicals, and custom irrigation controllers. Dedicated to introducing smart farming inputs to domestic markets.',
    monthlyRevenue: '$8,200.00'
  },
  {
    id: 'COMP-003',
    name: 'Bayer CropScience BD',
    email: 'support@bayercropscience.com.bd',
    phone: '+880 2-9884511',
    rating: 4.9,
    productsCount: 150,
    ordersCount: 620,
    salesCount: 12400,
    status: 'active',
    joinedDate: '2024-06-20',
    address: 'Bayer House, 120 Tejgaon I/A, Dhaka-1208, Bangladesh',
    website: 'https://bayer.com.bd',
    licenseId: 'AGRO-LIC-2024-0005',
    description: 'International brand supporting regional food security with advanced crop protection chemical compounds, hybrid paddy seeds, and smart diagnostics consultancy services.',
    monthlyRevenue: '$28,450.00'
  },
  {
    id: 'COMP-004',
    name: 'Sufala Fertilizer Co.',
    email: 'sales@sufalafert.org',
    phone: '+880 1913-445566',
    rating: 4.2,
    productsCount: 45,
    ordersCount: 140,
    salesCount: 2200,
    status: 'suspended',
    joinedDate: '2025-02-05',
    address: 'Industrial Area, Ghorashal, Narsingdi, Bangladesh',
    website: 'https://sufalafert.org',
    licenseId: 'AGRO-LIC-2025-0091',
    description: 'National manufacturer of chemical and mineral fertilizers, soil conditioners, and custom compound additives for large-scale crop farming.',
    monthlyRevenue: '$3,800.00'
  },
  {
    id: 'COMP-005',
    name: 'Teesta Seed Distributors',
    email: 'teestaseeds@gmail.com',
    phone: '+880 1514-556677',
    rating: 4.0,
    productsCount: 30,
    ordersCount: 85,
    salesCount: 950,
    status: 'pending',
    joinedDate: '2026-07-01',
    address: 'Station Road, Rangpur Sadar, Rangpur, Bangladesh',
    website: 'https://teestaseeds.com.bd',
    licenseId: 'AGRO-LIC-2026-0422',
    description: 'Regional seed supplier specializing in flood-resistant grains, high-yield vegetable hybrids, and local variant seeds for North Bengal cultivation.',
    monthlyRevenue: '$0.00'
  },
  {
    id: 'COMP-006',
    name: 'Organic Roots BD',
    email: 'info@organicroots.com.bd',
    phone: '+880 1715-667788',
    rating: 4.6,
    productsCount: 50,
    ordersCount: 120,
    salesCount: 1800,
    status: 'pending',
    joinedDate: '2026-07-12',
    address: 'Block C, Bashundhara R/A, Dhaka-1229, Bangladesh',
    website: 'https://organicroots.com.bd',
    licenseId: 'AGRO-LIC-2026-0599',
    description: 'Boutique farm supplier distributing organic fertilizers, biological pesticides, plant growth supplements, and premium quality vermicompost.',
    monthlyRevenue: '$0.00'
  }
];
