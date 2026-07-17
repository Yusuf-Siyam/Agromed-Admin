export interface BuyerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  district: string;
  status: 'active' | 'suspended';
  joinedDate: string;
  companyName: string;
  buyerType: 'wholesaler' | 'retailer';
  totalOrders: number;
  totalSpent: string;
  avgOrderValue: string;
  address: string;
}

export const mockBuyers: BuyerItem[] = [
  {
    id: 'BUY-001',
    name: 'Siyam Seed Store',
    phone: '+880 1711-889911',
    email: 'siyam.seeds@gmail.com',
    district: 'Dhaka',
    status: 'active',
    joinedDate: '2025-01-20',
    companyName: 'Siyam Seeds & Agro',
    buyerType: 'wholesaler',
    totalOrders: 42,
    totalSpent: '$14,250.00',
    avgOrderValue: '$339.28',
    address: 'Shop 14, Krishi Market, Mohammadpur, Dhaka'
  },
  {
    id: 'BUY-002',
    name: 'Mymensingh Seed Agency',
    phone: '+880 1812-990022',
    email: 'info@msagency.com.bd',
    district: 'Mymensingh',
    status: 'active',
    joinedDate: '2025-03-02',
    companyName: 'MSA Enterprise',
    buyerType: 'wholesaler',
    totalOrders: 28,
    totalSpent: '$8,940.00',
    avgOrderValue: '$319.28',
    address: 'Station Road, Mymensingh Sadar, Mymensingh'
  },
  {
    id: 'BUY-003',
    name: 'Organic Roots Retail',
    phone: '+880 1913-001122',
    email: 'retail@organicroots.com',
    district: 'Chattogram',
    status: 'active',
    joinedDate: '2025-05-15',
    companyName: 'Organic Roots BD',
    buyerType: 'retailer',
    totalOrders: 15,
    totalSpent: '$2,150.00',
    avgOrderValue: '$143.33',
    address: 'GEC Circle, East Nasirabad, Chattogram'
  },
  {
    id: 'BUY-004',
    name: 'Kushtia Agri Mart',
    phone: '+880 1514-112233',
    email: 'agrimart@kushtia.net',
    district: 'Kushtia',
    status: 'suspended',
    joinedDate: '2024-12-08',
    companyName: 'Agri Mart BD Ltd.',
    buyerType: 'retailer',
    totalOrders: 22,
    totalSpent: '$3,800.00',
    avgOrderValue: '$172.72',
    address: 'N S Road, Kushtia Sadar, Kushtia'
  }
];

export interface BuyerOrderItem {
  id: string;
  date: string;
  itemsCount: number;
  total: string;
  status: string;
  itemsSummary: string;
}

export const mockBuyerOrders: Record<string, BuyerOrderItem[]> = {
  'BUY-001': [
    { id: 'ORD-9011', date: '2026-07-16', itemsCount: 15, total: '$1,200.00', status: 'processing', itemsSummary: 'Hybrid Rice Seeds (x100), Urea Max (x50)' },
    { id: 'ORD-8512', date: '2026-04-10', itemsCount: 8, total: '$2,450.00', status: 'delivered', itemsSummary: 'Drip Sprinklers (x10), Bio-Grow Soil (x40)' }
  ],
  'BUY-002': [
    { id: 'ORD-9012', date: '2026-07-17', itemsCount: 12, total: '$920.00', status: 'pending', itemsSummary: 'PestBlock (x30), Pest-Kill (x20)' },
    { id: 'ORD-8814', date: '2026-06-02', itemsCount: 5, total: '$1,150.00', status: 'delivered', itemsSummary: 'Bio-Grow Soil (x50)' }
  ]
};
