export interface PaymentHistoryItem {
  id: string;
  payerName: string;
  payerPhone: string;
  method: 'SSLCommerz' | 'Cash on Delivery' | 'bKash';
  amount: string;
  status: 'completed' | 'failed' | 'pending';
  date: string;
}

export interface RefundRequestItem {
  id: string;
  orderId: string;
  customerName: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  reason: string;
}

export const mockPayments: PaymentHistoryItem[] = [
  { id: 'TXN-9021', payerName: 'Abul Hossain', payerPhone: '+880 1711-223344', method: 'bKash', amount: '$340.00', status: 'completed', date: '2026-07-18' },
  { id: 'TXN-9020', payerName: 'Siyam Seed Store', payerPhone: '+880 1711-889911', method: 'SSLCommerz', amount: '$2,450.00', status: 'completed', date: '2026-07-17' },
  { id: 'TXN-9019', payerName: 'Kamal Uddin', payerPhone: '+880 1813-556677', method: 'SSLCommerz', amount: '$1,200.00', status: 'pending', date: '2026-07-17' },
  { id: 'TXN-9018', payerName: 'Sufia Begum', payerPhone: '+880 1914-667788', method: 'Cash on Delivery', amount: '$780.00', status: 'completed', date: '2026-07-16' },
  { id: 'TXN-9017', payerName: 'Rahman Sobhan', payerPhone: '+880 1712-445566', method: 'bKash', amount: '$150.00', status: 'failed', date: '2026-07-15' },
  { id: 'TXN-9016', payerName: 'Mymensingh Seed Agency', payerPhone: '+880 1812-990022', method: 'SSLCommerz', amount: '$8,940.00', status: 'completed', date: '2026-07-14' }
];

export const mockRefundRequests: RefundRequestItem[] = [
  {
    id: 'RFD-001',
    orderId: 'ORD-8939',
    customerName: 'Rahim Mia',
    amount: '$150.00',
    status: 'pending',
    date: '2026-07-16',
    reason: 'Pesticide stock unavailable at Green Crop Ltd. warehouse.'
  },
  {
    id: 'RFD-002',
    orderId: 'ORD-8712',
    customerName: 'Kamal Uddin',
    amount: '$310.00',
    status: 'approved',
    date: '2026-07-12',
    reason: 'Fertilizer bag packing damaged during courier transit.'
  },
  {
    id: 'RFD-003',
    orderId: 'ORD-8611',
    customerName: 'Sufia Begum',
    amount: '$45.00',
    status: 'rejected',
    date: '2026-07-10',
    reason: 'Refund request window exceeded (more than 7 days post-delivery).'
  }
];
