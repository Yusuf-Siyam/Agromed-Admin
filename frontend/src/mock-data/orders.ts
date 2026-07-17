export interface OrderProductItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
}

export interface TimelineEvent {
  name: string;
  date: string;
  desc: string;
  completed: boolean;
}

export interface OrderItem {
  id: string;
  farmerName: string;
  farmerPhone: string;
  farmerEmail: string;
  companyName: string;
  companyId: string;
  date: string;
  total: number;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  products: OrderProductItem[];
  timeline: TimelineEvent[];
}

export const mockOrders: OrderItem[] = [
  {
    id: 'ORD-8942',
    farmerName: 'Rahman Sobhan',
    farmerPhone: '+880 1712-445566',
    farmerEmail: 'rahman.sobhan@gmail.com',
    companyName: 'Greenfield Agro Ltd.',
    companyId: 'COMP-001',
    date: '2026-07-18',
    total: 340.00,
    paymentStatus: 'completed',
    paymentMethod: 'bKash',
    deliveryStatus: 'delivered',
    products: [
      { name: 'Urea Max Fertilizer 50kg', sku: 'FERT-URE-MX50', qty: 2, price: 35.00 },
      { name: 'Bio-Grow Soil Conditioner', sku: 'FERT-SOIL-BG', qty: 10, price: 22.00 },
      { name: 'PestBlock Fungicide 1L', sku: 'PEST-FNG-PB1L', qty: 2, price: 24.50 }
    ],
    timeline: [
      { name: 'Order Placed', date: '2026-07-18 10:00 AM', desc: 'Order created by Rahman Sobhan', completed: true },
      { name: 'Payment Verified', date: '2026-07-18 10:15 AM', desc: 'bKash transaction verified successfully', completed: true },
      { name: 'Shipped', date: '2026-07-18 02:30 PM', desc: 'Dispatched via Pathao Logistics', completed: true },
      { name: 'Delivered', date: '2026-07-18 06:10 PM', desc: 'Package signed and received at Gafargaon hub', completed: true }
    ]
  },
  {
    id: 'ORD-8941',
    farmerName: 'Kamal Uddin',
    farmerPhone: '+880 1813-556677',
    farmerEmail: 'kamal.agro@yahoo.com',
    companyName: 'Acme Agritech Solutions',
    companyId: 'COMP-002',
    date: '2026-07-17',
    total: 1200.00,
    paymentStatus: 'pending',
    paymentMethod: 'Nagad',
    deliveryStatus: 'pending',
    products: [
      { name: 'Precision Drip Sprinklers', sku: 'IRR-DRP-PDS10', qty: 10, price: 120.00 }
    ],
    timeline: [
      { name: 'Order Placed', date: '2026-07-17 04:22 PM', desc: 'Order created by Kamal Uddin', completed: true },
      { name: 'Payment Verification', date: '-', desc: 'Awaiting Nagad payment confirm', completed: false },
      { name: 'Shipped', date: '-', desc: 'Dispatched logistics pending', completed: false },
      { name: 'Delivered', date: '-', desc: 'Package delivery signoff pending', completed: false }
    ]
  },
  {
    id: 'ORD-8940',
    farmerName: 'Sufia Begum',
    farmerPhone: '+880 1914-667788',
    farmerEmail: 'sufia.begum@outlook.com',
    companyName: 'Bayer CropScience BD',
    companyId: 'COMP-003',
    date: '2026-07-17',
    total: 780.00,
    paymentStatus: 'completed',
    paymentMethod: 'Bank Transfer',
    deliveryStatus: 'processing',
    products: [
      { name: 'Hybrid Rice Seed BR-29', sku: 'SEED-RIC-BR29', qty: 52, price: 15.00 }
    ],
    timeline: [
      { name: 'Order Placed', date: '2026-07-17 09:12 AM', desc: 'Order created by Sufia Begum', completed: true },
      { name: 'Payment Verified', date: '2026-07-17 11:45 AM', desc: 'Bank transfer cleared by accounts team', completed: true },
      { name: 'Processing', date: '2026-07-17 01:00 PM', desc: 'Items currently packed at Bayer Tejgaon warehouse', completed: true },
      { name: 'Shipped', date: '-', desc: 'Pending courier pickup', completed: false }
    ]
  },
  {
    id: 'ORD-8939',
    farmerName: 'Rahim Mia',
    farmerPhone: '+880 1715-667788',
    farmerEmail: 'rahimmia@outlook.com',
    companyName: 'Greenfield Agro Ltd.',
    companyId: 'COMP-001',
    date: '2026-07-16',
    total: 150.00,
    paymentStatus: 'refunded',
    paymentMethod: 'bKash',
    deliveryStatus: 'cancelled',
    products: [
      { name: 'Natural Pest Defend Sprays', sku: 'PEST-FNG-PB1L', qty: 4, price: 37.50 }
    ],
    timeline: [
      { name: 'Order Placed', date: '2026-07-16 11:00 AM', desc: 'Order created by Rahim Mia', completed: true },
      { name: 'Cancelled', date: '2026-07-16 12:30 PM', desc: 'Cancelled due to out of stock pesticide components', completed: true },
      { name: 'Refund Issued', date: '2026-07-16 04:00 PM', desc: '$150 bKash refund reference REF-90184 cleared', completed: true }
    ]
  },
  {
    id: 'ORD-8938',
    farmerName: 'Arif Faisal',
    farmerPhone: '+880 1716-889900',
    farmerEmail: 'arif.faisal@hotmail.com',
    companyName: 'Acme Agritech Solutions',
    companyId: 'COMP-002',
    date: '2026-07-15',
    total: 450.00,
    paymentStatus: 'completed',
    paymentMethod: 'bKash',
    deliveryStatus: 'shipped',
    products: [
      { name: 'Precision Drip Sprinklers', sku: 'IRR-DRP-PDS10', qty: 3, price: 150.00 }
    ],
    timeline: [
      { name: 'Order Placed', date: '2026-07-15 02:00 PM', desc: 'Order created by Arif Faisal', completed: true },
      { name: 'Payment Verified', date: '2026-07-15 02:15 PM', desc: 'bKash payment reference verified', completed: true },
      { name: 'Shipped', date: '2026-07-16 10:30 AM', desc: 'Dispatched via Sylhet Express logistics service', completed: true },
      { name: 'Delivered', date: '-', desc: 'Awaiting local delivery confirmation signoff', completed: false }
    ]
  }
];
