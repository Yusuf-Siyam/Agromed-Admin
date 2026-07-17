export interface ServiceProgressNote {
  time: string;
  note: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  farmerName: string;
  farmerPhone: string;
  district: string;
  assignedCompany: string | null;
  price: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  date: string;
  description: string;
  progressNotes: ServiceProgressNote[];
}

export const mockServices: ServiceItem[] = [
  {
    id: 'SRV-001',
    title: 'Soil Quality Testing Lab Check',
    farmerName: 'Rahman Sobhan',
    farmerPhone: '+880 1712-445566',
    district: 'Mymensingh',
    assignedCompany: 'Greenfield Agro Ltd.',
    price: '$50.00',
    status: 'in_progress',
    date: '2026-07-16',
    description: 'Detailed analysis of nitrogen, phosphorus, potassium, and pH levels in paddy cultivation fields. Recommendations for bio-fertilizer balance.',
    progressNotes: [
      { time: '2026-07-16 10:00 AM', note: 'Service request created by Rahman Sobhan' },
      { time: '2026-07-16 02:00 PM', note: 'Assigned to Greenfield Agro Ltd. laboratory' },
      { time: '2026-07-17 09:30 AM', note: 'Soil samples collected from Gafargaon farm by agent' }
    ]
  },
  {
    id: 'SRV-002',
    title: 'Smart Drip Irrigation Installation',
    farmerName: 'Kamal Uddin',
    farmerPhone: '+880 1813-556677',
    district: 'Bogura',
    assignedCompany: null,
    price: '$240.00',
    status: 'pending',
    date: '2026-07-17',
    description: 'Design and pipeline mapping for custom automated drip irrigation for a 2-acre potato greenhouse.',
    progressNotes: [
      { time: '2026-07-17 03:15 PM', note: 'Service request created by Kamal Uddin' },
      { time: '2026-07-17 03:30 PM', note: 'Payment verified, awaiting admin assignment to agro company partner' }
    ]
  },
  {
    id: 'SRV-003',
    title: 'Pest Identification & Spray Consultation',
    farmerName: 'Sufia Begum',
    farmerPhone: '+880 1914-667788',
    district: 'Jashore',
    assignedCompany: 'Bayer CropScience BD',
    price: '$35.00',
    status: 'assigned',
    date: '2026-07-17',
    description: 'On-site diagnostics for yellow rust leaf infections in wheat cultivation fields. Prescription of fungicides.',
    progressNotes: [
      { time: '2026-07-17 11:00 AM', note: 'Service request created by Sufia Begum' },
      { time: '2026-07-17 01:00 PM', note: 'Partner Bayer CropScience BD assigned to review case file' }
    ]
  },
  {
    id: 'SRV-004',
    title: 'High-Yield Rice Sowing Blueprint',
    farmerName: 'Arif Faisal',
    farmerPhone: '+880 1716-889900',
    district: 'Sylhet',
    assignedCompany: 'Greenfield Agro Ltd.',
    price: '$80.00',
    status: 'completed',
    date: '2026-07-12',
    description: 'Sowing scheduling, seedling density charts, and water tracking models for hybrid rice variant BR-29.',
    progressNotes: [
      { time: '2026-07-12 09:00 AM', note: 'Service request created by Arif Faisal' },
      { time: '2026-07-12 11:30 AM', note: 'Partner Greenfield Agro Ltd. assigned' },
      { time: '2026-07-13 04:00 PM', note: 'Farming field inspected and blueprint PDF delivered to client' },
      { time: '2026-07-14 10:00 AM', note: 'Service marked as completed by customer' }
    ]
  }
];
