

const apiBase = (import.meta.env.VITE_AGROMED_API_URL ?? 'http://localhost:5270').replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function call<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers
    }
  });

  if (!response.ok) {

    let code = `http_${response.status}`;
    let detail = 'That request could not be completed.';
    try {
      const problem = await response.json();
      code = problem.code ?? code;
      detail = problem.detail ?? problem.title ?? detail;
    } catch {
      void 0;
    }
    throw new ApiError(response.status, code, detail);
  }

  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

const get = <T>(token: string, path: string) => call<T>(token, path);
const send = <T>(token: string, method: string, path: string, body?: unknown) =>
  call<T>(token, path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

/**
 * Upload a file. The Content-Type header is deliberately not set: the browser
 * has to write it itself so it can include the multipart boundary, and setting
 * it by hand produces a body the server cannot parse.
 */
const upload = <T>(token: string, path: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return call<T>(token, path, { method: 'POST', body: form });
};

function query(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v != null && v !== '') search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export function formatMinor(minor: number | null | undefined, currency = 'BDT'): string {
  if (minor == null) return '—';
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(minor / 100);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export interface SuperAdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: { id: string; fullName: string; email: string | null; roles: string[] };
}

export async function superAdminLogin(identifier: string, password: string): Promise<SuperAdminAuthResponse> {
  const response = await fetch(`${apiBase}/api/v1/superadmin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  if (!response.ok) throw new ApiError(response.status, 'login_failed', 'Unable to sign in to the SuperAdmin console.');
  return response.json() as Promise<SuperAdminAuthResponse>;
}

export async function superAdminLogout(accessToken: string, refreshToken: string): Promise<void> {
  await fetch(`${apiBase}/api/v1/superadmin/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  roles: string[];
}

export const getCurrentUser = (t: string) => get<CurrentUser>(t, '/api/v1/me');

export const updateProfile = (t: string, fullName: string, email?: string | null, preferredLocale?: string) =>
  send<CurrentUser>(t, 'PATCH', '/api/v1/me/profile', { fullName, email, preferredLocale });

export const changePassword = (t: string, currentPassword: string, newPassword: string) =>
  send<void>(t, 'POST', '/api/v1/me/password', { currentPassword, newPassword });

export async function forgotPassword(phoneE164: string): Promise<void> {
  const r = await fetch(`${apiBase}/api/v1/auth/password/forgot`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneE164 })
  });

  if (!r.ok && r.status !== 404) throw new ApiError(r.status, 'forgot_failed', 'Could not send a reset code.');
}

export async function resetPassword(phoneE164: string, code: string, newPassword: string): Promise<void> {
  const r = await fetch(`${apiBase}/api/v1/auth/password/reset`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneE164, code, newPassword })
  });
  if (!r.ok) {
    let detail = 'That reset code is not valid.';
    try { detail = (await r.json()).detail ?? detail; } catch { void 0; }
    throw new ApiError(r.status, 'reset_failed', detail);
  }
}

export interface SuperAdminDashboard {
  activeUsers: number;
  verifiedCompanies: number;
  activeListings: number;
  orderCount: number;
  gmvMinor: number;
  commissionMinor: number;
  pendingVerifications: number;
  openDisputes: number;
  openReturns: number;
  currency: string;
}

export const getSuperAdminDashboard = (t: string) =>
  get<SuperAdminDashboard>(t, '/api/v1/superadmin/dashboard');

export interface AdminOrganisation {
  id: string;
  seq: number;
  kind: 'manufacturer' | 'importer_supplier' | 'buyer' | 'platform';
  slug: string;
  legalName: string;
  tradeLicenceNo: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine: string | null;
  sellerTier: string | null;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedAt: string | null;
  isBlacklisted: boolean;
  status: 'active' | 'suspended' | 'closed';
  currency: string;
  createdAt: string;
  listingCount: number;
  orderCount: number;
  gmvMinor: number;
  commissionMinor: number;
  averageRating: number | null;
  reviewCount: number;
  memberCount: number;

  sellsProducts: boolean;
  offersServices: boolean;
  productCount: number;
  serviceCount: number;
}

export const listOrganisations = (
  t: string,
  p: { kind?: string; status?: string; search?: string; cursor?: string; limit?: number } = {}
) => get<Page<AdminOrganisation>>(t, `/api/v1/superadmin/organisations${query(p)}`);

export const setOrganisationStatus = (
  t: string, id: string, status: string, isBlacklisted?: boolean
) => send<void>(t, 'PATCH', `/api/v1/superadmin/organisations/${id}/status`, { status, isBlacklisted });

export interface AdminOrder {
  id: string;
  seq: number;
  orderNumber: string;
  status: string;
  orderType: string;
  currency: string;
  subtotalMinor: number;
  discountTotalMinor: number;
  deliveryChargeMinor: number;
  grandTotalMinor: number;
  commissionMinor: number;
  sellerNetMinor: number;
  placedAt: string;
  deliveredAt: string | null;
  sellerOrganisationId: string;
  sellerName: string;
  buyerOrganisationId: string;
  buyerName: string;
  buyerContactName: string | null;
  buyerPhone: string | null;
  buyerEmail: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
}

export interface AdminOrderLine {
  id: string;
  lineNumber: number;
  sku: string;
  name: string;
  quantity: number;
  unitCode: string | null;
  unitPriceMinor: number;
  discountMinor: number;
  lineTotalMinor: number;
  commissionMinor: number;

  listingId: string;
  batchNumber: string | null;
  batchManufacturedOn: string | null;
  batchExpiresOn: string | null;
}

export interface AdminOrderEvent {
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  occurredAt: string;
  changedByName: string | null;
}

export const listOrders = (
  t: string,
  p: { status?: string; organisationId?: string; search?: string; cursor?: string; limit?: number } = {}
) => get<Page<AdminOrder>>(t, `/api/v1/superadmin/orders${query(p)}`);

export const getOrderDetail = (t: string, id: string) =>
  get<{ lines: AdminOrderLine[]; timeline: AdminOrderEvent[] }>(t, `/api/v1/superadmin/orders/${id}`);

export interface AdminPayment {
  id: string;
  seq: number;
  orderId: string;
  orderNumber: string;
  method: string;
  provider: string | null;
  providerReference: string | null;
  amountMinor: number;
  currency: string;
  status: string;
  capturedAt: string | null;
  failedReason: string | null;
  createdAt: string;
  sellerName: string;
  buyerName: string;
}

export const listPayments = (
  t: string, p: { status?: string; method?: string; cursor?: string; limit?: number } = {}
) => get<Page<AdminPayment>>(t, `/api/v1/superadmin/payments${query(p)}`);

export interface AdminReview {
  id: string;
  seq: number;
  listingId: string;
  listingSku: string;
  sellerName: string;
  rating: number;
  body: string | null;
  status: 'published' | 'pending_moderation' | 'hidden' | 'removed';
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  fraudRiskScore: number;
  fraudFlags: string | null;
  authorName: string | null;
  createdAt: string;
}

export const listReviews = (
  t: string, p: { status?: string; cursor?: string; limit?: number } = {}
) => get<Page<AdminReview>>(t, `/api/v1/superadmin/reviews${query(p)}`);

export const setReviewStatus = (t: string, id: string, status: string, reason?: string) =>
  send<void>(t, 'PATCH', `/api/v1/superadmin/reviews/${id}/status`, { status, reason });

export const listFraudReviews = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<AdminReview>>(t, `/api/v1/superadmin/fraud/reviews${query(p)}`);

export interface AdminListing {
  id: string;
  seq: number;
  sku: string;
  brand: string | null;
  kind: 'product' | 'service';
  status: string;
  organisationId: string;
  sellerName: string;
  categoryId: string;
  categoryCode: string;
  createdAt: string;
  nameEn: string | null;
  nameBn: string | null;
  fromPriceMinor: number | null;
  stockOnHand: number;
}

export const listListings = (
  t: string,
  p: { kind?: string; status?: string; organisationId?: string; search?: string; cursor?: string; limit?: number } = {}
) => get<Page<AdminListing>>(t, `/api/v1/superadmin/listings${query(p)}`);

export interface RevenuePoint {
  period: string;
  orderCount: number;
  gmvMinor: number;
  commissionMinor: number;
  subsidyMinor: number;
  buyerCount: number;
  sellerCount: number;
}

export interface CompanyPerformance {
  organisationId: string;
  legalName: string;
  kind: string;
  sellerTier: string | null;
  verificationStatus: string;
  orderCount: number;
  gmvMinor: number;
  commissionMinor: number;
  previousGmvMinor: number;
}

export const getRevenueSeries = (t: string, months = 12) =>
  get<RevenuePoint[]>(t, `/api/v1/superadmin/analytics/revenue${query({ months })}`);

export const getCompanyPerformance = (t: string, months = 3, limit = 20) =>
  get<CompanyPerformance[]>(t, `/api/v1/superadmin/analytics/companies${query({ months, limit })}`);

export interface VerificationCase {
  id: string;
  seq: number;
  subjectType: string;
  subjectId: string;
  organisationId: string;
  priority: number;
  status: string;
  assignedToUserId: string | null;
  slaDueAt: string | null;
  createdAt: string;
}

export const listVerifications = (
  t: string, p: { status?: string; cursor?: string; limit?: number } = {}
) => get<Page<VerificationCase>>(t, `/api/v1/superadmin/verifications${query(p)}`);

export const decideVerification = (t: string, id: string, decision: string, note?: string) =>
  send<void>(t, 'POST', `/api/v1/superadmin/verifications/${id}/decision`, { decision, note });

export const assignVerification = (t: string, id: string, assigneeUserId: string) =>
  send<void>(t, 'POST', `/api/v1/superadmin/verifications/${id}/assignment`, { assigneeUserId });

export interface TaxonomyNode {
  id: string;
  parentId: string | null;
  code: string;
  path: string;
  depth: number;
  listingKind: string;
  displayOrder: number;
  isActive: boolean;
  requiresSellerCertificate: boolean;
  requiresProductCertificate: boolean;
  requiresBuyerLicence: boolean;
  requiresBatchTracking: boolean;
  requiresExpiryTracking: boolean;
  minShelfLifeDays: number | null;
  icon: string | null;
  imageUrl: string | null;
  /** true when a picture has been uploaded for this category. */
  hasImage: boolean;
  isRetired: boolean;
  nameEn: string | null;
  nameBn: string | null;
  /** false while the Bangla name is still unchecked machine output. */
  nameBnReviewed: boolean;
  nameBnSource: string | null;
  listingCount: number;
  childCount: number;
}

export interface TranslationQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  field: string;
  locale: string;
  value: string;
  source: string;
  isReviewed: boolean;
  updatedAt: string;
  /** The English original, so a reviewer can see what it should say. */
  sourceValue: string | null;
  entityCode: string | null;
}

export const listTaxonomy = (t: string, includeRetired = false) =>
  get<TaxonomyNode[]>(t, `/api/v1/superadmin/taxonomy${includeRetired ? '?include_retired=true' : ''}`);

export const listTranslationQueue = (t: string, entityType = 'category', reviewed = false) =>
  get<TranslationQueueItem[]>(
    t, `/api/v1/superadmin/translations?entity_type=${entityType}&locale=bn-BD&reviewed=${reviewed}`);

/** Approve a translation. Passing a value corrects the text and marks it human-authored. */
export const reviewTranslation = (t: string, id: string, value: string | null) =>
  send<void>(t, 'POST', `/api/v1/superadmin/translations/${id}/review`, { value });

export const updateCategory = (
  t: string, id: string, displayOrder: number, isActive: boolean,
  names?: { nameEn?: string; nameBn?: string; icon?: string | null; imageUrl?: string | null }
) => send<void>(t, 'PATCH', `/api/v1/superadmin/taxonomy/${id}`, { displayOrder, isActive, ...names });

export interface CommissionRule {
  id: string;
  code: string;
  categoryId: string | null;
  categoryName: string | null;
  sellerTier: string | null;
  orderType: string | null;
  priceBandMinMinor: number | null;
  priceBandMaxMinor: number | null;
  geographyId: string | null;
  deliveryType: string | null;
  campaignFrom: string | null;
  campaignTo: string | null;
  rateBasis: string;
  ratePercent: number | null;
  flatFeeMinor: number | null;
  minFeeMinor: number | null;
  maxFeeMinor: number | null;

  specificity: number;
  priority: number;
  isDefault: boolean;
}

export interface CommissionSettings {
  ruleSetId: string;
  versionNumber: number;
  status: string;
  effectiveFrom: string | null;
  activatedAt: string | null;
  note: string | null;
  defaultRatePercent: number;
  rules: CommissionRule[];
}

export const getCommissionSettings = (t: string) =>
  get<CommissionSettings>(t, '/api/v1/admin/commission-settings');

export const listCommissionRules = (t: string) =>
  get<CommissionRule[]>(t, '/api/v1/admin/commission-rules');

export const updateCommissionSettings = (t: string, defaultRatePercent: number, note?: string) =>
  send<{ ruleSetId: string; versionNumber: number }>(
    t, 'PUT', '/api/v1/admin/commission-settings', { defaultRatePercent, note });

export interface PlatformOffer {
  id: string;
  seq: number;
  code: string;
  discountTarget: 'commission' | 'price';
  discountBasis: 'percentage' | 'fixed';
  discountPercent: number | null;
  discountAmountMinor: number | null;
  currency: string | null;
  status: string;
  startsAt: string;
  endsAt: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  budgetMinor: number | null;
  budgetSpentMinor: number;
  budgetAlertPercent: number | null;
  autoPauseOnExhaustion: boolean;
  minOrderMinor: number | null;
  maxDiscountMinor: number | null;
  maxPerBuyer: number | null;
}

export interface OfferBurn {
  id: string;
  code: string;
  status: string;
  currency: string | null;
  budgetMinor: number | null;
  budgetSpentMinor: number;
  budgetAlertPercent: number | null;
  autoPauseOnExhaustion: boolean;
  redemptionCount: number;
  maxRedemptions: number | null;
  startsAt: string;
  endsAt: string | null;

  settledMinor: number;
  orderCount: number;
}

export const listPlatformOffers = (
  t: string, p: { status?: string; cursor?: string; limit?: number } = {}
) => get<Page<PlatformOffer>>(t, `/api/v1/superadmin/offers${query(p)}`);

export const savePlatformOffer = (t: string, offer: Record<string, unknown>) =>
  send<string>(t, 'PUT', '/api/v1/superadmin/offers', offer);

export const setPlatformOfferStatus = (t: string, id: string, status: string) =>
  send<void>(t, 'PATCH', `/api/v1/superadmin/offers/${id}/status`, { status });

export const getOfferBurn = (t: string, id: string) =>
  get<OfferBurn>(t, `/api/v1/superadmin/offers/${id}/burn`);

export const getOfferBurnSeries = (t: string, id: string, days = 30) =>
  get<{ occurredOn: string; amountMinor: number; orderCount: number }[]>(
    t, `/api/v1/superadmin/offers/${id}/burn/series${query({ days })}`);

export interface SettlementRun {
  id: string;
  seq: number;
  runReference: string;
  status: 'draft' | 'calculated' | 'approved' | 'executed' | 'failed';
  currency: string;
  totalGrossMinor: number;
  totalCommissionMinor: number;
  totalPayableMinor: number;
  periodStart: string;
  periodEnd: string;
  executedAt: string | null;
}

export interface SettlementStatementLine {
  organisationId: string;
  organisationName: string;
  orderCount: number;
  grossMinor: number;
  commissionMinor: number;
  deliveryCommissionMinor: number;
  platformSubsidyMinor: number;
  refundMinor: number;
  adjustmentMinor: number;
  netPayableMinor: number;
  currency: string;
}

export interface AdminPayout {
  id: string;
  seq: number;
  organisationId: string;
  organisationName: string;
  settlementRunId: string | null;
  runReference: string | null;
  amountMinor: number;
  currency: string;
  method: string;
  payoutDestinationId: string | null;
  destinationName: string | null;
  providerReference: string | null;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled';
  requestedByUserId: string | null;
  approvedByUserId: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  failedReason: string | null;
  createdAt: string;
}

export const listSettlements = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<SettlementRun>>(t, `/api/v1/superadmin/settlements${query(p)}`);

export const createSettlementRun = (t: string, periodStart: string, periodEnd: string, currency = 'BDT') =>
  send<string>(t, 'POST', '/api/v1/superadmin/settlements', { periodStart, periodEnd, currency });

export const calculateSettlement = (t: string, id: string) =>
  send<SettlementRun>(t, 'POST', `/api/v1/superadmin/settlements/${id}/calculate`);

export const approveSettlement = (t: string, id: string) =>
  send<void>(t, 'POST', `/api/v1/superadmin/settlements/${id}/approve`);

export const executeSettlement = (t: string, id: string) =>
  send<{ payoutCount: number; totalMinor: number }>(t, 'POST', `/api/v1/superadmin/settlements/${id}/execute`);

export const getSettlementStatement = (t: string, id: string, organisationId?: string) =>
  get<SettlementStatementLine[]>(t, `/api/v1/superadmin/settlements/${id}/statement${query({ organisationId })}`);

export const listPayouts = (t: string, p: { status?: string; cursor?: string; limit?: number } = {}) =>
  get<Page<AdminPayout>>(t, `/api/v1/superadmin/payouts${query(p)}`);

export const approvePayout = (t: string, id: string) =>
  send<void>(t, 'POST', `/api/v1/superadmin/payouts/${id}/approve`);

export const initiatePayout = (t: string, id: string, destinationId?: string, providerReference?: string) =>
  send<void>(t, 'POST', `/api/v1/superadmin/payouts/${id}/initiate`, { destinationId, providerReference });

export const settlePayout = (t: string, id: string, outcome: 'paid' | 'failed', providerReference?: string, failedReason?: string) =>
  send<void>(t, 'POST', `/api/v1/superadmin/payouts/${id}/settle`, { outcome, providerReference, failedReason });

export interface ReconciliationBatch {
  id: string;
  seq: number;
  provider: string;
  statementReference: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  reportedTotalMinor: number;
  matchedTotalMinor: number;
  rowCountTotal: number;
  matchedCount: number;
  exceptionCount: number;
  status: string;
  closedAt: string | null;
  createdAt: string;
}

export interface ReconciliationEntry {
  id: string;
  seq: number;
  providerReference: string;
  providerStatus: string | null;
  amountMinor: number;
  currency: string;
  occurredAt: string | null;
  paymentId: string | null;
  payoutId: string | null;
  refundId: string | null;
  matchStatus: string;
  varianceMinor: number;
  note: string | null;
  resolvedAt: string | null;
}

export const listReconciliationBatches = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<ReconciliationBatch>>(t, `/api/v1/superadmin/reconciliation${query(p)}`);

export const listReconciliationEntries = (
  t: string, batchId: string, p: { matchStatus?: string; cursor?: string; limit?: number } = {}
) => get<Page<ReconciliationEntry>>(t, `/api/v1/superadmin/reconciliation/${batchId}/entries${query(p)}`);

export const matchReconciliation = (t: string, batchId: string) =>
  send<{ rowCountTotal: number; matchedCount: number; exceptionCount: number }>(
    t, 'POST', `/api/v1/superadmin/reconciliation/${batchId}/match`);

export const resolveReconciliationEntry = (t: string, id: string, matchStatus: string, note?: string) =>
  send<void>(t, 'POST', `/api/v1/superadmin/reconciliation/entries/${id}/resolve`, { matchStatus, note });

export interface CaseQueueItem {
  id: string;
  seq: number;
  status: string;
  orderId: string;
  sellerOrganisationId: string;
  buyerOrganisationId: string;
  amountMinor: number;
  createdAt: string;
}

export interface CaseTimelineItem {
  eventType: string;
  status: string | null;
  detail: string | null;
  occurredAt: string;
}

export const listCases = (
  t: string, kind: 'return' | 'dispute', p: { status?: string; cursor?: string; limit?: number } = {}
) => get<Page<CaseQueueItem>>(t, `/api/v1/superadmin/cases/${kind}${query(p)}`);

export const getCaseTimeline = (t: string, kind: 'return' | 'dispute', id: string) =>
  get<CaseTimelineItem[]>(t, `/api/v1/superadmin/cases/${kind}/${id}/timeline`);

export const transitionReturn = (t: string, id: string, status: string, reason?: string, restock = false) =>
  send<unknown>(t, 'POST', `/api/v1/admin/returns/${id}/transition`, { status, reason, restock });

export const resolveDispute = (t: string, id: string, status: string, outcome?: string, reason?: string) =>
  send<unknown>(t, 'POST', `/api/v1/admin/disputes/${id}/resolution`, { status, outcome, reason });

export interface CmsBanner {
  id: string; seq: number; code: string; placement: string; status: string;
  displayOrder: number; linkUrl: string | null; imageStorageKey: string | null;
  publishFrom: string | null; publishUntil: string | null;
  categoryId: string | null; geographyId: string | null;
  titleEn: string | null; titleBn: string | null;
  subtitleEn: string | null; subtitleBn: string | null;
  ctaLabelEn: string | null; ctaLabelBn: string | null;
}

export interface CmsFaq {
  id: string; seq: number; code: string; topicCode: string; audience: string;
  displayOrder: number; status: string; publishFrom: string | null; publishUntil: string | null;
  questionEn: string | null; questionBn: string | null;
  answerEn: string | null; answerBn: string | null;
}

export interface CmsPolicy {
  id: string; seq: number; code: string; version: number; documentKind: string;
  requiresAcceptance: boolean; effectiveFrom: string | null; status: string;
  titleEn: string | null; titleBn: string | null;
}

export interface CmsArticle {
  id: string; seq: number; slug: string; categoryCode: string; status: string;
  publishedAt: string | null; minutesRead: number;
  titleEn: string | null; titleBn: string | null;
}

export interface CmsLandingPage {
  id: string; seq: number; slug: string; pageKind: string; status: string;
  heroStorageKey: string | null; publishFrom: string | null; publishUntil: string | null;
  sectionCount: number;
  titleEn: string | null; titleBn: string | null;
  summaryEn: string | null; summaryBn: string | null;
}

export const listCmsBanners = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<CmsBanner>>(t, `/api/v1/superadmin/cms/banners${query(p)}`);
export const saveCmsBanner = (t: string, banner: Record<string, unknown>) =>
  send<string>(t, 'PUT', '/api/v1/superadmin/cms/banners', banner);

export const listCmsFaqs = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<CmsFaq>>(t, `/api/v1/superadmin/cms/faqs${query(p)}`);
export const saveCmsFaq = (t: string, faq: Record<string, unknown>) =>
  send<string>(t, 'PUT', '/api/v1/superadmin/cms/faqs', faq);

export const listCmsPolicies = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<CmsPolicy>>(t, `/api/v1/superadmin/cms/policies${query(p)}`);
export const saveCmsPolicy = (t: string, policy: Record<string, unknown>) =>
  send<string>(t, 'PUT', '/api/v1/superadmin/cms/policies', policy);

export const listCmsLandingPages = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<CmsLandingPage>>(t, `/api/v1/superadmin/cms/landing-pages${query(p)}`);
export const saveCmsLandingPage = (t: string, page: Record<string, unknown>) =>
  send<string>(t, 'PUT', '/api/v1/superadmin/cms/landing-pages', page);

export const listCmsArticles = (t: string, p: { cursor?: string; limit?: number } = {}) =>
  get<Page<CmsArticle>>(t, `/api/v1/superadmin/cms/articles${query(p)}`);
export const saveCmsArticle = (t: string, article: Record<string, unknown>) =>
  send<string>(t, 'PUT', '/api/v1/superadmin/cms/articles', article);

export const archiveCmsItem = (t: string, entity: string, id: string) =>
  send<void>(t, 'DELETE', `/api/v1/superadmin/cms/${entity}/${id}`);

export interface FeatureFlag {
  featureKey: string;
  isEnabled: boolean;
  configurationJson: string | null;
  updatedAt: string;
}

export const listFeatures = (t: string) =>
  get<FeatureFlag[]>(t, '/api/v1/superadmin/features');

export const setFeature = (t: string, featureKey: string, isEnabled: boolean, configurationJson?: string | null) =>
  send<void>(t, 'PUT', '/api/v1/superadmin/features', { featureKey, isEnabled, configurationJson });

export interface Broadcast {
  eventId: string;
  seq: number;
  title: string;
  body: string;
  recipientCount: number;
  deliveredCount: number;
  createdAt: string;
}

export const listBroadcasts = (t: string, limit = 50) =>
  get<Broadcast[]>(t, `/api/v1/superadmin/broadcasts${query({ limit })}`);

export const sendBroadcast = (t: string, title: string, body: string, audience: 'all' | 'buyers' | 'sellers') =>
  send<{ eventId: string; recipientCount: number }>(t, 'POST', '/api/v1/superadmin/broadcasts', { title, body, audience });

export interface AdminDocument {
  documentKind: 'certificate' | 'identity' | 'buyer_licence';
  id: string;
  documentType: string;
  reference: string | null;
  issuingAuthority: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  status: string;
  rejectionReason: string | null;
  hasDocument: boolean;
  listingId: string | null;
  listingSku: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface VerificationCaseDetail {
  id: string; subjectType: string; subjectId: string;
  organisationId: string; organisationName: string; organisationKind: string;
  tradeLicenceNo: string | null; contactEmail: string | null; contactPhone: string | null;
  verificationStatus: string; priority: number; status: string; slaDueAt: string | null;
  decision: string | null; decisionNote: string | null; createdAt: string;
}

export interface VerificationSubject {
  title: string; reference: string | null; issuingAuthority: string | null;
  issuedOn: string | null; expiresOn: string | null; status: string | null;
  listingSku: string | null; hasDocument: boolean;
  documentKind: string; documentId: string;
}

export interface VerificationReview {
  case: VerificationCaseDetail;
  subject: VerificationSubject | null;
  documents: AdminDocument[];
}

export const listOrganisationDocuments = (t: string, organisationId: string) =>
  get<AdminDocument[]>(t, `/api/v1/superadmin/organisations/${organisationId}/documents`);

export const getVerificationReview = (t: string, id: string) =>
  get<VerificationReview>(t, `/api/v1/superadmin/verifications/${id}/review`);

export async function fetchDocumentObjectUrl(
  t: string, kind: string, id: string
): Promise<{ url: string; contentType: string }> {
  const r = await fetch(`${apiBase}/api/v1/superadmin/documents/${kind}/${id}`, {
    headers: { Authorization: `Bearer ${t}` }
  });
  if (!r.ok) throw new ApiError(r.status, 'document_unavailable', 'That document could not be opened.');
  const blob = await r.blob();
  return { url: URL.createObjectURL(blob), contentType: blob.type || 'application/octet-stream' };
}

export async function downloadDocument(t: string, kind: string, id: string, name: string): Promise<void> {
  const { url, contentType } = await fetchDocumentObjectUrl(t, kind, id);
  const ext = contentType.includes('pdf') ? '.pdf'
    : contentType.includes('png') ? '.png'
    : contentType.includes('jpeg') ? '.jpg' : '';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ListingRegistryEntry {
  id: string; certificateType: string; certificateNumber: string | null;
  issuingAuthority: string | null; issuedOn: string | null; expiresOn: string | null;
  status: string; hasDocument: boolean;
}

export interface ListingMedia {
  id: string; mediaType: string; contentType: string | null; isPrimary: boolean;
  displayOrder: number; widthPx: number | null; heightPx: number | null; byteSize: number | null;
}

export interface ListingBatch {
  id: string; batchNumber: string; manufacturedOn: string | null; expiresOn: string | null;
  countryOfOrigin: string | null; supplierReference: string | null; status: string;
  quarantineReason: string | null; daysToExpiry: number | null;
}

export interface AdminListingDetail {
  id: string; sku: string; brand: string | null; kind: string; status: string;
  sellerName: string; categoryCode: string;
  unitCode: string | null; packSize: number | null; hsCode: string | null;
  countryOfOrigin: string | null; shelfLifeDays: number | null;
  isRestricted: boolean | null; formulation: string | null;
  ratingAverage: number | null; ratingCount: number;
  nameEn: string | null; nameBn: string | null; descriptionEn: string | null;
}

export interface ListingDetailBundle {
  listing: AdminListingDetail;
  registry: ListingRegistryEntry[];
  media: ListingMedia[];
  batches: ListingBatch[];
}

export const getListingDetail = (t: string, id: string) =>
  get<ListingDetailBundle>(t, `/api/v1/superadmin/listings/${id}/detail`);

export const listingImageUrl = (mediaId: string, thumb = false) =>
  `${apiBase}/api/v1/media/${mediaId}${thumb ? '?thumb=true' : ''}`;

export interface CreateCategoryInput {
  parentId: string | null; code: string; listingKind: string;
  displayOrder: number; isActive: boolean; nameEn: string; nameBn: string;
  icon?: string | null; imageUrl?: string | null;
}

export const createCategory = (t: string, input: CreateCategoryInput) =>
  send<string>(t, 'POST', '/api/v1/superadmin/taxonomy', input);

export const uploadCategoryImage = (t: string, id: string, file: File) =>
  upload<void>(t, `/api/v1/superadmin/taxonomy/${id}/image`, file);

export const deleteCategoryImage = (t: string, id: string) =>
  send<void>(t, 'DELETE', `/api/v1/superadmin/taxonomy/${id}/image`);

/** Where the uploaded picture is served from. Cache-busted so a replacement shows. */
export const categoryImageUrl = (id: string, bust?: number) =>
  `${apiBase}/api/v1/categories/${id}/image${bust ? `?v=${bust}` : ''}`;

export const deleteCategory = (t: string, id: string) =>
  send<void>(t, 'DELETE', `/api/v1/superadmin/taxonomy/${id}`);

export interface PlatformMember {
  membershipId: string; userId: string; fullName: string;
  email: string | null; phoneE164: string | null; userStatus: string;
  lastLoginAt: string | null; roleCode: string; authorityRank: number;
  membershipStatus: string; joinedAt: string; hasAvatar: boolean;
}

export const PLATFORM_ROLES = ['super_admin', 'platform_ops', 'platform_support'] as const;

export const listPlatformMembers = (t: string) =>
  get<PlatformMember[]>(t, '/api/v1/superadmin/platform-members');

export const invitePlatformMember = (t: string, roleCode: string, identifier: string) =>
  send<{ id: string; token: string; expiresAt: string }>(
    t, 'POST', '/api/v1/superadmin/platform-members/invitations', { roleCode, identifier });

export const setPlatformRole = (t: string, membershipId: string, roleCode: string) =>
  send<void>(t, 'PUT', `/api/v1/superadmin/platform-members/${membershipId}/role`, { roleCode });

export async function uploadAvatar(t: string, file: File): Promise<void> {
  const body = new FormData();
  body.append('file', file);
  const r = await fetch(`${apiBase}/api/v1/me/avatar`, {
    method: 'POST', headers: { Authorization: `Bearer ${t}` }, body
  });
  if (!r.ok) {
    let detail = 'That picture could not be uploaded.';
    try { detail = (await r.json()).detail ?? detail; } catch { void 0; }
    throw new ApiError(r.status, 'avatar_failed', detail);
  }
}

export const avatarUrl = (userId: string) => `${apiBase}/api/v1/users/${userId}/avatar`;

export interface AuditEntry {
  id: string;
  actorUserId: string | null;
  actorName: string | null;
  action: string;
  entitySchema: string | null;
  entityTable: string | null;
  entityId: string | null;
  occurredAt: string;
}

export const listAudit = (
  t: string,
  p: { actorUserId?: string; entityTable?: string; fromUtc?: string; toUtc?: string; cursor?: string; limit?: number } = {}
) => get<Page<AuditEntry>>(t, `/api/v1/superadmin/audit${query(p)}`);
