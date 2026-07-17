import { ArrowUp, ArrowDown, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState } from './States';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterSlot?: React.ReactNode;
  pagination?: PaginationProps;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
}

export default function DataTable({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filterSlot,
  pagination,
  isLoading = false,
  error = null,
  onRetry,
  sortKey,
  sortDirection,
  onSortChange
}: DataTableProps) {
  const handleSortClick = (columnKey: string) => {
    if (!onSortChange) return;
    if (sortKey === columnKey) {
      const nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(columnKey, nextDir);
    } else {
      onSortChange(columnKey, 'asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters controls */}
      {(onSearchChange || filterSlot) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
              />
            </div>
          )}
          {filterSlot && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {filterSlot}
            </div>
          )}
        </div>
      )}

      {/* Main Table Card wrapper */}
      <div className="bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10">
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  const alignClass =
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSortClick(col.key)}
                      className={cn(
                        'px-6 py-3.5 font-semibold text-foreground/85 select-none transition-colors',
                        col.sortable && 'cursor-pointer hover:bg-accent/20',
                        alignClass
                      )}
                    >
                      <div className={cn('flex items-center gap-1.5', col.align === 'right' && 'justify-end', col.align === 'center' && 'justify-center')}>
                        <span>{col.label}</span>
                        {col.sortable && (
                          <span className="text-muted-foreground">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12">
                    <ErrorState message={error} onRetry={onRetry} />
                  </td>
                </tr>
              ) : isLoading ? (
                // Table Rows skeleton loader
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="border-b border-border/60 last:border-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4.5">
                        <div className="h-4 bg-muted/70 rounded animate-pulse w-full max-w-[80%]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                      return (
                        <td key={col.key} className={cn('px-6 py-4 text-foreground/80 font-medium', alignClass)}>
                          {col.render ? col.render(row, rIdx) : (row as any)[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div className="text-xs text-muted-foreground font-medium text-center sm:text-left">
            {pagination.totalItems && pagination.itemsPerPage ? (
              <>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-foreground">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">{pagination.totalItems}</span> entries
              </>
            ) : (
              <>
                Page <span className="font-semibold text-foreground">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold text-foreground">{pagination.totalPages}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || isLoading}
              className="p-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg disabled:opacity-40 disabled:hover:bg-card transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Simple slide window around current page
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                Math.abs(pageNum - pagination.currentPage) <= 1
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer',
                      pagination.currentPage === pageNum
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border bg-card hover:bg-muted text-foreground'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && pagination.currentPage > 3) ||
                (pageNum === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
              ) {
                return (
                  <span key={pageNum} className="px-1 text-xs text-muted-foreground">
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || isLoading}
              className="p-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg disabled:opacity-40 disabled:hover:bg-card transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
