import type { AdminOrganisation } from './superadmin-api';

export function isSelfRegisteredFarmer(org: AdminOrganisation): boolean {
  return org.slug.startsWith('buyer-');
}

export function districtOf(org: AdminOrganisation): string {
  if (!org.addressLine) return '—';
  const parts = org.addressLine.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : org.addressLine;
}
