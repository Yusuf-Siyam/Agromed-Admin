export interface ReviewItem {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  entityName: string;
  entityType: 'product' | 'service' | 'company';
  date: string;
  reported: boolean;
}

export const mockReviews: ReviewItem[] = [
  {
    id: 'REV-001',
    reviewerName: 'Rahman Sobhan',
    rating: 5,
    comment: 'Excellent high nitrogen fertilizer! My paddy harvest yield increased by 20% this season. Highly recommended brand.',
    entityName: 'Urea Max Fertilizer 50kg',
    entityType: 'product',
    date: '2026-07-16',
    reported: false
  },
  {
    id: 'REV-002',
    reviewerName: 'Kamal Uddin',
    rating: 4,
    comment: 'Very professional laboratory checking service. Collected soil samples within 24 hours. Report parameters could be slightly more simplified.',
    entityName: 'Soil Quality Testing Lab Check',
    entityType: 'service',
    date: '2026-07-17',
    reported: false
  },
  {
    id: 'REV-003',
    reviewerName: 'Sufia Begum',
    rating: 2,
    comment: 'Seeds germination rates were below expectations (less than 60%). Damaged crop output in some rows. Awaiting supplier support contact.',
    entityName: 'Hybrid Rice Seed BR-29',
    entityType: 'product',
    date: '2026-07-14',
    reported: true // Reported!
  },
  {
    id: 'REV-004',
    reviewerName: 'Arif Faisal',
    rating: 5,
    comment: 'Outstanding support team at Greenfield Agro. Very fast shipping deliveries and premium packaging. Will order again.',
    entityName: 'Greenfield Agro Ltd.',
    entityType: 'company',
    date: '2026-07-12',
    reported: false
  },
  {
    id: 'REV-005',
    reviewerName: 'Rahim Mia',
    rating: 1,
    comment: 'SCAMMER! AVOID THIS SEED SUPPLIER. SENT MOLDY SEEDS AND REFUSED REFUND REQUEST CHECKS!',
    entityName: 'Teesta Seed Distributors',
    entityType: 'company',
    date: '2026-07-10',
    reported: true // Reported!
  }
];
