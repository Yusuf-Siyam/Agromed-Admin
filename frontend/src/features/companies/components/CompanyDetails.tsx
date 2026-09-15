import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Ban, Building2, Calendar, CheckCircle2, Mail, MapPin,
  Percent, Phone, TrendingUp
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import StatusBadge from '@/components/shared/StatusBadge';
import RoleTags from '@/components/shared/RoleTags';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States';
import DocumentList from '@/components/shared/DocumentList';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import {
  formatDate, formatMinor, listListings, listOrganisationDocuments, listOrganisations,
  listOrders, listPayouts, setOrganisationStatus
} from '@/lib/superadmin-api';

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();

  const [activeAction, setActiveAction] = useState<'suspend' | 'activate' | null>(null);

  const organisations = useApi((token) => listOrganisations(token, { kind: 'seller', limit: 100 }), []);
  const listings = useApi((token) => listListings(token, { organisationId: id, limit: 100 }), [id]);
  const orders = useApi((token) => listOrders(token, { organisationId: id, limit: 100 }), [id]);
  const payouts = useApi((token) => listPayouts(token, { limit: 100 }), []);
  const documents = useApi((token) => listOrganisationDocuments(token, id!), [id]);

  const company = organisations.data?.items.find((c) => c.id === id);

  const money = useMemo(() => {
    const rows = (orders.data?.items ?? []).filter((o) => o.sellerOrganisationId === id);
    const traded = rows.filter((o) => !['cancelled', 'pending_payment'].includes(o.status));
    const gross = traded.reduce((t, o) => t + o.grandTotalMinor, 0);
    const commission = traded.reduce((t, o) => t + o.commissionMinor, 0);
    const subsidy = traded.reduce((t, o) => t + o.discountTotalMinor, 0);
    const net = traded.reduce((t, o) => t + o.sellerNetMinor, 0);

    const mine = (payouts.data?.items ?? []).filter((p) => p.organisationId === id);
    const paid = mine.filter((p) => p.status === 'paid').reduce((t, p) => t + p.amountMinor, 0);
    const inFlight = mine
      .filter((p) => ['pending', 'approved', 'processing'].includes(p.status))
      .reduce((t, p) => t + p.amountMinor, 0);

    return { gross, commission, subsidy, net, paid, inFlight, orderCount: traded.length };
  }, [orders.data, payouts.data, id]);

  if (organisations.loading) return <LoadingState message="Loading company…" />;
  if (organisations.error) return <ErrorState message={organisations.error} onRetry={organisations.reload} />;

  if (!company) {
    return (
      <div className="space-y-6">
        <PageHeader title="Company Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: 'Error' }]} />
        <EmptyState
          title="Company profile not found"
          description="That company does not exist, or it has been closed."
          action={
            <Link to="/companies" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Companies
            </Link>
          }
        />
      </div>
    );
  }

  const effectiveRate = money.gross === 0 ? null : (money.commission / money.gross) * 100;

  async function execute() {
    if (!activeAction || !company) return;
    const next = activeAction === 'suspend' ? 'suspended' : 'active';
    setActiveAction(null);

    const ok = await run((token) => setOrganisationStatus(token, company.id, next));
    if (ok) {
      success(`${company.legalName} is now ${next}.`);
      organisations.reload();
    } else {
      toastError(`${company.legalName} could not be updated.`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <button
          onClick={() => navigate('/companies')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </button>
        <PageHeader
          title={company.legalName}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: company.legalName }]}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge status={company.status} />
              {company.status === 'active' ? (
                <button
                  onClick={() => setActiveAction('suspend')}
                  disabled={busy}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-60"
                >
                  <Ban className="h-3.5 w-3.5" />Suspend
                </button>
              ) : company.status === 'suspended' ? (
                <button
                  onClick={() => setActiveAction('activate')}
                  disabled={busy}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />Reinstate
                </button>
              ) : null}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Building2 className="h-4.5 w-4.5 text-primary" />Profile
          </h3>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2"><Mail className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">{company.contactEmail ?? '—'}</dd></div>
            <div className="flex items-start gap-2"><Phone className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">{company.contactPhone ?? '—'}</dd></div>
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">{company.addressLine ?? '—'}</dd></div>
            <div className="flex items-start gap-2"><Calendar className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><dd className="text-foreground">Joined {formatDate(company.createdAt)}</dd></div>
            <div className="border-t border-border pt-2.5" />
            <div className="flex justify-between"><dt className="text-muted-foreground">Registered name</dt><dd className="text-right font-semibold text-foreground">{company.legalName}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Trade licence</dt><dd className="font-mono text-xs text-foreground">{company.tradeLicenceNo ?? 'not recorded'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Handle</dt><dd className="font-mono text-xs text-foreground">{company.slug}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Organisation type</dt><dd className="text-foreground">{company.kind === 'manufacturer' ? 'Manufacturer' : 'Importer / supplier'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Currency</dt><dd className="text-foreground">{company.currency}</dd></div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Verification</dt>
              <dd className="flex items-center gap-1.5">
                <StatusBadge status={company.verificationStatus} />
                {company.verifiedAt && <span className="text-xs text-muted-foreground">{formatDate(company.verifiedAt)}</span>}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Operates as</dt>
              <dd className="flex flex-wrap justify-end gap-1">
                <RoleTags organisation={company} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />Trading
          </h3>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Listings</dt><dd className="font-semibold text-foreground">{company.listingCount}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Orders</dt><dd className="font-semibold text-foreground">{company.orderCount}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Team members</dt><dd className="font-semibold text-foreground">{company.memberCount}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="font-semibold text-foreground">
                {company.averageRating == null ? 'No reviews' : `★ ${Number(company.averageRating).toFixed(1)} (${company.reviewCount})`}
              </dd>
            </div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tier</dt><dd className="font-semibold capitalize text-foreground">{company.sellerTier ?? 'standard'}</dd></div>
          </dl>
        </div>

        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Percent className="h-4.5 w-4.5 text-primary" />Commission
          </h3>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Charged</dt><dd className="font-semibold text-foreground">{formatMinor(money.commission, company.currency)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Effective rate</dt>
              <dd className="font-semibold text-foreground">{effectiveRate == null ? '—' : `${effectiveRate.toFixed(1)}%`}</dd>
            </div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Discount given</dt><dd className="font-semibold text-foreground">{formatMinor(money.subsidy, company.currency)}</dd></div>
          </dl>
          <p className="text-xs text-muted-foreground">
            The effective rate is what this company actually paid across its own orders, not the
            headline rule: every order froze the rule version that priced it.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialSummaryCard label="Gross sales" amount={formatMinor(money.gross, company.currency)} subtext={`${money.orderCount} traded orders`} variant="info" />
        <FinancialSummaryCard label="Seller net" amount={formatMinor(money.net, company.currency)} subtext="After commission" />
        <FinancialSummaryCard label="Paid out" amount={formatMinor(money.paid, company.currency)} variant="success" />
        <FinancialSummaryCard label="Awaiting payout" amount={formatMinor(money.inFlight, company.currency)} variant="warning" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <h3 className="border-b border-border px-5 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
          Submitted documents ({documents.data?.length ?? 0})
        </h3>
        <DocumentList
          documents={documents.data ?? []}
          loading={documents.loading}
          emptyMessage="This company has submitted no certificates, licences or identity documents."
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <h3 className="border-b border-border px-5 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
          Catalogue ({listings.data?.items.length ?? 0})
        </h3>
        {listings.loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading listings…</p>
        ) : (listings.data?.items.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">This company has no listings yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 text-right font-semibold">From</th>
                <th className="px-5 py-3 text-center font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(listings.data?.items ?? []).map((l) => (
                <tr key={l.id}>
                  <td className="px-5 py-3 text-foreground">{l.sku}</td>
                  <td className="px-5 py-3 text-foreground">{l.nameEn ?? '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{l.categoryCode}</td>
                  <td className="px-5 py-3 text-right text-foreground">{l.fromPriceMinor == null ? 'Quote' : formatMinor(l.fromPriceMinor)}</td>
                  <td className="px-5 py-3 text-center text-foreground">{Number(l.stockOnHand)}</td>
                  <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={activeAction != null}
        title={activeAction === 'suspend' ? 'Suspend this company?' : 'Reinstate this company?'}
        description={
          activeAction === 'suspend'
            ? `${company.legalName} keeps its catalogue but cannot trade until it is reinstated.`
            : `${company.legalName} can sell again immediately.`
        }
        confirmText="Confirm"
        variant={activeAction === 'suspend' ? 'danger' : 'primary'}
        onConfirm={execute}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
