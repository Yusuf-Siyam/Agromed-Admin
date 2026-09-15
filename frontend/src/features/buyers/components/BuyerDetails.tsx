import { useParams } from 'react-router-dom';
import OrganisationProfile from '@/components/shared/OrganisationProfile';

export default function BuyerDetails() {
  const { id } = useParams<{ id: string }>();

  return (
    <OrganisationProfile
      id={id}
      kind="buyer"
      backTo="/buyers"
      backLabel="Buyers & Farmers"
      noun="Buyer"
    />
  );
}
