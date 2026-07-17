export interface FarmerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  district: string;
  status: 'active' | 'suspended';
  joinedDate: string;
  farmSize: number; // in acres
  cropCategories: string[];
  totalOrders: number;
  totalSpent: string;
  avgOrderValue: string;
  address: string;
}

export const mockFarmers: FarmerItem[] = [
  {
    id: 'FARM-001',
    name: 'Rahman Sobhan',
    phone: '+880 1712-445566',
    email: 'rahman.sobhan@gmail.com',
    district: 'Mymensingh',
    status: 'active',
    joinedDate: '2025-02-12',
    farmSize: 4.5,
    cropCategories: ['Rice', 'Vegetables', 'Mustard'],
    totalOrders: 18,
    totalSpent: '$1,450.00',
    avgOrderValue: '$80.50',
    address: 'Vilage: Gafargaon, Post: Gafargaon, Mymensingh, Bangladesh'
  },
  {
    id: 'FARM-002',
    name: 'Kamal Uddin',
    phone: '+880 1813-556677',
    email: 'kamal.agro@yahoo.com',
    district: 'Bogura',
    status: 'active',
    joinedDate: '2025-04-18',
    farmSize: 6.2,
    cropCategories: ['Potato', 'Maize', 'Chili'],
    totalOrders: 24,
    totalSpent: '$2,820.00',
    avgOrderValue: '$117.50',
    address: 'Village: Sherpur, Post: Sherpur Bazar, Bogura, Bangladesh'
  },
  {
    id: 'FARM-003',
    name: 'Sufia Begum',
    phone: '+880 1914-667788',
    email: 'sufia.begum@outlook.com',
    district: 'Jashore',
    status: 'active',
    joinedDate: '2025-01-05',
    farmSize: 2.8,
    cropCategories: ['Flowers', 'Jute', 'Vegetables'],
    totalOrders: 12,
    totalSpent: '$980.00',
    avgOrderValue: '$81.66',
    address: 'Village: Keshabpur, Post: Keshabpur, Jashore, Bangladesh'
  },
  {
    id: 'FARM-004',
    name: 'Motiur Rahman',
    phone: '+880 1515-778899',
    email: 'motiur.farm@gmail.com',
    district: 'Dinajpur',
    status: 'suspended',
    joinedDate: '2024-11-20',
    farmSize: 8.5,
    cropCategories: ['Rice', 'Wheat', 'Litchi'],
    totalOrders: 32,
    totalSpent: '$4,120.00',
    avgOrderValue: '$128.75',
    address: 'Village: Kaharole, Post: Kaharole, Dinajpur, Bangladesh'
  },
  {
    id: 'FARM-005',
    name: 'Arif Faisal',
    phone: '+880 1716-889900',
    email: 'arif.faisal@hotmail.com',
    district: 'Sylhet',
    status: 'active',
    joinedDate: '2025-05-25',
    farmSize: 3.0,
    cropCategories: ['Tea', 'Pineapple', 'Rice'],
    totalOrders: 6,
    totalSpent: '$450.00',
    avgOrderValue: '$75.00',
    address: 'Village: Sreemangal, Post: Sreemangal Tea Garden, Sylhet, Bangladesh'
  }
];

export interface FarmerPurchaseItem {
  id: string;
  date: string;
  itemsCount: number;
  total: string;
  status: string;
  itemsSummary: string;
}

export const mockFarmerPurchases: Record<string, FarmerPurchaseItem[]> = {
  'FARM-001': [
    { id: 'ORD-8942', date: '2026-07-18', itemsCount: 3, total: '$340.00', status: 'delivered', itemsSummary: 'Urea Max (x2), PestBlock (x1)' },
    { id: 'ORD-8711', date: '2026-05-14', itemsCount: 1, total: '$120.00', status: 'delivered', itemsSummary: 'Hybrid Rice Seeds (x4)' },
    { id: 'ORD-8519', date: '2026-03-02', itemsCount: 2, total: '$990.00', status: 'delivered', itemsSummary: 'Bio-Grow Soil (x10), Sprinklers (x1)' }
  ],
  'FARM-002': [
    { id: 'ORD-8941', date: '2026-07-17', itemsCount: 4, total: '$1,200.00', status: 'pending', itemsSummary: 'Organic Seedlings (x20), Pest-Kill (x2)' },
    { id: 'ORD-8812', date: '2026-06-11', itemsCount: 2, total: '$620.00', status: 'delivered', itemsSummary: 'Urea Max (x5), Hybrid Rice (x2)' }
  ]
};
