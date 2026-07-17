import { Link } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function SessionExpired() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 bg-secondary/15 text-secondary-foreground rounded-full border border-secondary/20">
          <ShieldAlert className="h-8 w-8 text-secondary-foreground" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Session Expired</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            For your security and because of inactivity, your admin session has expired.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Link
          to="/auth/login"
          className="w-full inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
        >
          <LogIn className="h-4.5 w-4.5 mr-2" />
          Re-authenticate Now
        </Link>
      </div>
    </div>
  );
}
