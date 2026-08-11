export interface ServiceProviderItem {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  district: string;
  rating: number;
  status: 'verified' | 'pending' | 'rejected';
  address: string;
  experienceYears: number;
  servicesOffered: string[];
}

export const mockServiceProviders: ServiceProviderItem[] = [
  {
    id: 'SP-001',
    name: 'Rahman Tractor Services',
    category: 'Machinery Rental',
    email: 'rahman.tractors@gmail.com',
    phone: '+880 1712-998877',
    district: 'Bogura',
    rating: 4.8,
    status: 'verified',
    address: 'Sadar Road, Bogura, Bangladesh',
    experienceYears: 8,
    servicesOffered: ['Deep Ploughing', 'Power Harrowing', 'Bed Preparation', 'Harvester Operator Rental']
  },
  {
    id: 'SP-002',
    name: 'North Soil Labs',
    category: 'Soil Diagnostics',
    email: 'contact@northsoillabs.com',
    phone: '+880 1813-887766',
    district: 'Dinajpur',
    rating: 4.6,
    status: 'verified',
    address: 'College Road, Dinajpur, Bangladesh',
    experienceYears: 5,
    servicesOffered: ['N-P-K Soil Analysis', 'PH Level Calibration', 'Organic Matter Estimation']
  },
  {
    id: 'SP-003',
    name: 'Jamuna Irrigation Consultants',
    category: 'Water Management',
    email: 'info@jamunairrigation.net',
    phone: '+880 1914-776655',
    district: 'Sirajganj',
    rating: 4.2,
    status: 'pending',
    address: 'Bazaar Road, Sirajganj, Bangladesh',
    experienceYears: 4,
    servicesOffered: ['Drip Irrigation Blueprinting', 'Sprinkler System Calibration', 'Pump Efficiency Audit']
  }
];
