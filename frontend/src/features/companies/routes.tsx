import CompanyList from './components/CompanyList';
import CompanyDetails from './components/CompanyDetails';
import CompanyVerification from './components/CompanyVerification';

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
    element: <div className="p-6 text-foreground bg-background rounded-xl border border-border shadow-sm">Company Performance Analytics Placeholder</div>
  },
  {
    path: '/companies/:id',
    element: <CompanyDetails />
  }
];
