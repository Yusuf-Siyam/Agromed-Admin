import CompanyList from './components/CompanyList';
import CompanyDetails from './components/CompanyDetails';
import CompanyVerification from './components/CompanyVerification';
import CompanyPerformance from './components/CompanyPerformance';

export const CompaniesRoutes = [
  {
    path: '/companies',
    element: <CompanyList />
  },
  {
    path: '/companies/verification',
    element: <CompanyVerification />
  },
  {
    path: '/companies/performance',
    element: <CompanyPerformance />
  },
  {
    path: '/companies/:id',
    element: <CompanyDetails />
  }
];
