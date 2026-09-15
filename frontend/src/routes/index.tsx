import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedDashboardLayout from "../layouts/ProtectedDashboardLayout";

import { AuthRoutes } from "../features/auth/routes";
import { CompaniesRoutes } from "../features/companies/routes";
import { DashboardRoutes } from "../features/dashboard/routes";

import { BuyersRoutes } from "../features/buyers/routes";
import { OrdersRoutes } from "../features/orders/routes";
import { PaymentsRoutes } from "../features/payments/routes";
import { ProductsRoutes } from "../features/products/routes";
import { CategoriesRoutes } from "../features/categories/routes";
import { ServiceProvidersRoutes } from "../features/service-providers/routes";
import { SalesRoutes } from "../features/sales/routes";
import { RevenueRoutes } from "../features/revenue/routes";
import { CommissionRoutes } from "../features/commission/routes";
import { BillingRoutes } from "../features/billing/routes";
import { ExpensesRoutes } from "../features/expenses/routes";
import { DiscountsRoutes } from "../features/discounts/routes";
import { PlatformAnalyticsRoutes } from "../features/platform-analytics/routes";
import { CompanyAnalyticsRoutes } from "../features/company-analytics/routes";
import { ReportsRoutes } from "../features/reports/routes";
import { ServicesRoutes } from "../features/services/routes";
import { ReviewsRoutes } from "../features/reviews/routes";
import { NotificationsRoutes } from "../features/notifications/routes";
import { SettingsRoutes } from "../features/settings/routes";
import { ProfileRoutes } from "../features/profile/routes";

export const router = createBrowserRouter(
  [
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        ...AuthRoutes,
        { path: "", element: <Navigate to="login" replace /> },
      ],
    },
    {
      path: "/",
      element: <ProtectedDashboardLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        ...DashboardRoutes,
        ...CompaniesRoutes,
        ...BuyersRoutes,

        { path: "/farmers", element: <Navigate to="/buyers" replace /> },
        { path: "/farmers/:id", element: <Navigate to="/buyers" replace /> },
        ...OrdersRoutes,
        ...PaymentsRoutes,
        ...ProductsRoutes,
        ...CategoriesRoutes,
        ...ServiceProvidersRoutes,
        ...SalesRoutes,
        ...RevenueRoutes,
        ...CommissionRoutes,
        ...BillingRoutes,
        ...ExpensesRoutes,
        ...DiscountsRoutes,
        ...PlatformAnalyticsRoutes,
        ...CompanyAnalyticsRoutes,
        ...ReportsRoutes,
        ...ServicesRoutes,
        ...ReviewsRoutes,
        ...NotificationsRoutes,
        ...SettingsRoutes,
        ...ProfileRoutes,
      ],
    },
    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ],
  {
    basename: "/Agromed-Admin",
  },
);
