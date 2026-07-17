import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Import feature routes
import { DashboardRoutes } from '../features/dashboard/routes';
import { CompaniesRoutes } from '../features/companies/routes';
import { FarmersRoutes } from '../features/farmers/routes';
import { BuyersRoutes } from '../features/buyers/routes';
import { ProductsRoutes } from '../features/products/routes';
import { CategoriesRoutes } from '../features/categories/routes';
import { OrdersRoutes } from '../features/orders/routes';
import { ServicesRoutes } from '../features/services/routes';
import { PaymentsRoutes } from '../features/payments/routes';
import { SalesRoutes } from '../features/sales/routes';
import { RevenueRoutes } from '../features/revenue/routes';
import { ReportsRoutes } from '../features/reports/routes';
import { NotificationsRoutes } from '../features/notifications/routes';
import { ReviewsRoutes } from '../features/reviews/routes';
import { SettingsRoutes } from '../features/settings/routes';
import { ProfileRoutes } from '../features/profile/routes';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <div>Login Page Placeholder</div> },
      { path: 'register', element: <div>Register Page Placeholder</div> },
      { path: '', element: <Navigate to="login" replace /> }
    ]
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      ...DashboardRoutes,
      ...CompaniesRoutes,
      ...FarmersRoutes,
      ...BuyersRoutes,
      ...ProductsRoutes,
      ...CategoriesRoutes,
      ...OrdersRoutes,
      ...ServicesRoutes,
      ...PaymentsRoutes,
      ...SalesRoutes,
      ...RevenueRoutes,
      ...ReportsRoutes,
      ...NotificationsRoutes,
      ...ReviewsRoutes,
      ...SettingsRoutes,
      ...ProfileRoutes
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
