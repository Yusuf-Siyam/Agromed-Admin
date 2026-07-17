import { Link } from 'react-router-dom';
import { Ban, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 bg-destructive/10 text-destructive rounded-full border border-destructive/20 animate-pulse">
          <Ban className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            You do not have the required administrative permissions to access this page. Please contact the lead system administrator if this is an error.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard Home
        </Link>
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Sign in again
        </Link>
      </div>
    </div>
  );
}
