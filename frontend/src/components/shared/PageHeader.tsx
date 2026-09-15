import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  action?: React.ReactNode;
}

export default function PageHeader({ title, breadcrumbs, action }: PageHeaderProps) {
  const { pathname } = useLocation();

  const trail = breadcrumbs.filter((item, idx) => {
    if (!item.href) return true;
    const target = item.href.replace(/\/+$/, '') || '/';
    const here = pathname.replace(/^\/Agromed-Admin/, '').replace(/\/+$/, '') || '/';
    const isCurrentPage = target === here || (target === '/' && here === '/dashboard');

    return !(isCurrentPage && idx < breadcrumbs.length - 1);
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60">
      <div className="space-y-1.5">
        { }
        {trail.length > 1 && (
          <nav className="flex items-center space-x-1.5 text-xs font-medium text-muted-foreground">
            {trail.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                {item.href ? (
                  <Link
                    to={item.href}
                    className="hover:text-primary transition-colors hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground/75">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        { }
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
      </div>

      { }
      {action && (
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {action}
        </div>
      )}
    </div>
  );
}
