export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockLimit: number;
  status: 'active' | 'inactive';
  sku: string;
  companyName: string;
  description: string;
  registeredDate: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export const mockCategories: CategoryItem[] = [
  { id: 'CAT-001', name: 'Seeds', description: 'High-yield grain, vegetable and flower crop seeds', productCount: 150 },
  { id: 'CAT-002', name: 'Fertilizers', description: 'Chemical, mineral and biological nutrient supplements', productCount: 120 },
  { id: 'CAT-003', name: 'Pesticides', description: 'Insecticides, fungicides and weed control chemicals', productCount: 85 },
  { id: 'CAT-004', name: 'Irrigation', description: 'Sprinklers, pipes, drip equipment and controllers', productCount: 45 },
  { id: 'CAT-005', name: 'Machinery', description: 'Tillage, harvesting, sowing and weeding equipment', productCount: 22 }
];

export const mockProducts: ProductItem[] = [
  {
    id: 'PROD-001',
    name: 'Urea Max Fertilizer 50kg',
    category: 'Fertilizers',
    price: 35.00,
    stock: 450,
    lowStockLimit: 50,
    status: 'active',
    sku: 'FERT-URE-MX50',
    companyName: 'Greenfield Agro Ltd.',
    description: 'High-nitrogen granular chemical fertilizer designed to promote robust leafy growth and maximize grain yields in rice, wheat, and maize crops.',
    registeredDate: '2025-01-15'
  },
  {
    id: 'PROD-002',
    name: 'PestBlock Fungicide 1L',
    category: 'Pesticides',
    price: 24.50,
    stock: 12, // LOW STOCK!
    lowStockLimit: 20,
    status: 'active',
    sku: 'PEST-FNG-PB1L',
    companyName: 'Greenfield Agro Ltd.',
    description: 'Broad-spectrum liquid pesticide for preventing blast, blight, and mildew in cereal crops and vegetables. Safe when diluted to specified ratios.',
    registeredDate: '2025-02-10'
  },
  {
    id: 'PROD-003',
    name: 'Hybrid Rice Seed BR-29',
    category: 'Seeds',
    price: 15.00,
    stock: 0, // OUT OF STOCK!
    lowStockLimit: 30,
    status: 'active',
    sku: 'SEED-RIC-BR29',
    companyName: 'Bayer CropScience BD',
    description: 'Premium quality high-yield hybrid paddy seeds certified for regional cultivation. Flood and pest resistant variant popular in North Bengal.',
    registeredDate: '2024-06-25'
  },
  {
    id: 'PROD-004',
    name: 'Precision Drip Sprinklers',
    category: 'Irrigation',
    price: 120.00,
    stock: 45,
    lowStockLimit: 10,
    status: 'active',
    sku: 'IRR-DRP-PDS10',
    companyName: 'Acme Agritech Solutions',
    description: 'Smart adjustable micro-drip emitters designed for high water efficiency. Suitable for greenhouse cultivation and commercial vegetable farms.',
    registeredDate: '2025-03-20'
  },
  {
    id: 'PROD-005',
    name: 'Teesta Red Chili Seeds 100g',
    category: 'Seeds',
    price: 8.50,
    stock: 8, // LOW STOCK!
    lowStockLimit: 15,
    status: 'inactive',
    sku: 'SEED-CHL-TR100',
    companyName: 'Teesta Seed Distributors',
    description: 'Spicy chili pepper seeds designed for regional soil. Exceptional germination rate under standard dry climatic conditions.',
    registeredDate: '2026-07-02'
  }
];
