import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Import feature routes
import { AuthRoutes } from "../features/auth/routes";
import { CompaniesRoutes } from "../features/companies/routes";
import { DashboardRoutes } from "../features/dashboard/routes";
import { FarmersRoutes } from "../features/farmers/routes";
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
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        ...DashboardRoutes,
        ...CompaniesRoutes,
        ...FarmersRoutes,
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
