export interface BroadcastNotification {
  id: string;
  targetAudience: 'all' | 'farmers' | 'buyers' | 'companies';
  title: string;
  message: string;
  date: string;
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const mockBroadcasts: BroadcastNotification[] = [
  {
    id: 'NOT-101',
    targetAudience: 'all',
    title: 'Platform Maintenance Notice',
    message: 'AgroMED Connect database servers will undergo scheduled optimization on Sunday, July 20, between 02:00 AM and 04:00 AM. Checkout services will be temporarily unavailable.',
    date: '2026-07-18'
  },
  {
    id: 'NOT-102',
    targetAudience: 'farmers',
    title: 'New Seed Subsidy Scheme Available',
    message: 'The Ministry of Agriculture has cleared seed vouchers for flood-affected regions. Submit your national NID details in the profiles panel to claim vouchers.',
    date: '2026-07-15'
  },
  {
    id: 'NOT-103',
    targetAudience: 'companies',
    title: 'Regulatory License Update Required',
    message: 'All registered companies must re-verify their pesticide dealer licenses before August 1st to comply with updated crop defense directives.',
    date: '2026-07-12'
  }
];

export const mockSystemAlerts: SystemAlert[] = [
  {
    id: 'ALT-201',
    severity: 'danger',
    message: 'SSLCommerz payment gateway reported a high latency of 5.4s for client checkouts.',
    timestamp: '2026-07-18 01:45 AM',
    resolved: false
  },
  {
    id: 'ALT-202',
    severity: 'warning',
    message: 'Product stock for Hybrid Rice Seed BR-29 has dropped to zero units. Low stock alert active.',
    timestamp: '2026-07-17 08:30 PM',
    resolved: false
  },
  {
    id: 'ALT-203',
    severity: 'info',
    message: 'New Agro Company license application submitted by "Barind Crops Ltd." awaiting admin review.',
    timestamp: '2026-07-17 04:12 PM',
    resolved: false
  }
];
