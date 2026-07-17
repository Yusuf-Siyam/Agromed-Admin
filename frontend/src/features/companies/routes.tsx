import CompanyList from './components/CompanyList';
import CompanyDetails from './components/CompanyDetails';

export const CompaniesRoutes = [
  {
    path: '/companies',
    element: <CompanyList />
  },
  {
    path: '/companies/:id',
    element: <CompanyDetails />
  }
];
