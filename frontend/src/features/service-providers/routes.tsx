import ServiceProviderList from './components/ServiceProviderList';
import ServiceProviderDetails from './components/ServiceProviderDetails';

export const ServiceProvidersRoutes = [
  {
    path: '/service-providers',
    element: <ServiceProviderList />
  },
  {
    path: '/service-providers/:id',
    element: <ServiceProviderDetails />
  }
];
