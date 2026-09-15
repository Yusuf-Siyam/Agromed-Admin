import type { AdminOrganisation } from '@/lib/superadmin-api';

export default function RoleTags({ organisation, showCounts = true }: {
  organisation: Pick<AdminOrganisation, 'sellsProducts' | 'offersServices' | 'productCount' | 'serviceCount'>;
  showCounts?: boolean;
}) {
  const { sellsProducts, offersServices, productCount, serviceCount } = organisation;

  if (!sellsProducts && !offersServices) {
    return <span className="text-xs text-muted-foreground">Nothing listed</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {sellsProducts && (
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
          Medicine seller{showCounts ? ` · ${productCount}` : ''}
        </span>
      )}
      {offersServices && (
        <span className="rounded-full border border-info/20 bg-info/10 px-2 py-0.5 text-[10px] font-bold uppercase text-info">
          Service provider{showCounts ? ` · ${serviceCount}` : ''}
        </span>
      )}
    </div>
  );
}
