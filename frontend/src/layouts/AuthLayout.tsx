import { Outlet } from 'react-router-dom';
import BrandLogo from '@/components/shared/BrandLogo';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-background py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo className="h-14 w-14" />
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            AgroMedConnect Admin
          </h2>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-border bg-card px-4 py-8 shadow-sm sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
