import { Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';

export default function ProtectedDashboardLayout() {
  const { isAuthenticated } = useSuperAdminSession();
  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/auth/login" replace />;
}
