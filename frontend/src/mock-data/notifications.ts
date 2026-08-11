export interface BroadcastNotification {
  id: string;
  targetAudience: 'all' | 'farmers' | 'companies' | 'service_providers';
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
    message: 'AgroMED Connect database servers will undergo scheduled optimization on Sunday, August 16, between 02:00 AM and 04:00 AM. Services will be temporarily offline.',
    date: '2026-08-11'
  },
  {
    id: 'NOT-102',
    targetAudience: 'farmers',
    title: 'New Seed Subsidy Scheme Available',
    message: 'The Ministry of Agriculture has cleared seed vouchers for flood-affected regions. Farmers can review eligible vouchers in the platform.',
    date: '2026-08-09'
  },
  {
    id: 'NOT-103',
    targetAudience: 'companies',
    title: 'Regulatory License Update Required',
    message: 'All registered companies must re-verify their pesticide dealer licenses before August 25th to comply with crop defense directives.',
    date: '2026-08-07'
  },
  {
    id: 'NOT-104',
    targetAudience: 'service_providers',
    title: 'Drone Spraying Standards Updated',
    message: 'Active service providers deploying unmanned crop spraying drones must register drone serial logs in the vault.',
    date: '2026-08-05'
  }
];

export const mockSystemAlerts: SystemAlert[] = [
  {
    id: 'ALT-201',
    severity: 'danger',
    message: 'Payment settlement gateway reported API checkout latency of 5.8s.',
    timestamp: '2026-08-11 11:45 PM',
    resolved: false
  },
  {
    id: 'ALT-202',
    severity: 'warning',
    message: 'Acme Agritech Solutions override commission rate update pending payout adjustments confirmation.',
    timestamp: '2026-08-11 08:30 PM',
    resolved: false
  },
  {
    id: 'ALT-203',
    severity: 'info',
    message: 'New Agro Company license application submitted by "Jamuna Irrigation Consultants" awaiting admin verification.',
    timestamp: '2026-08-11 04:12 PM',
    resolved: false
  }
];
