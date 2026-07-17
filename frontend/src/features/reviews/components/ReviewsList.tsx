import { useState } from 'react';
import { Star, Trash2, Eye, ShieldAlert, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/components/shared/Toast';
import { mockReviews } from '@/mock-data/reviews';
import type { ReviewItem } from '@/mock-data/reviews';

export default function ReviewsList() {
  const { success } = useToast();

  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reportedFilter, setReportedFilter] = useState('all');

  // Dialog configurations
  const [activeAction, setActiveAction] = useState<{
    type: 'report' | 'delete';
    review: ReviewItem;
  } | null>(null);

  // Statistics calculation
  const totalReviews = reviews.length;
  const reportedCount = reviews.filter((r) => r.reported).length;
  
  const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : '0.0';

  // Rating counts for distribution chart
  const getCountByStar = (star: number) => reviews.filter((r) => r.rating === star).length;
  const getStarPct = (star: number) => {
    if (totalReviews === 0) return '0%';
    return `${(getCountByStar(star) / totalReviews) * 100}%`;
  };

  const columns: Column<ReviewItem>[] = [
    { key: 'id', label: 'Rev ID' },
    {
      key: 'reviewerName',
      label: 'Reviewer',
      sortable: true,
      render: (row) => <span className="font-semibold text-foreground">{row.reviewerName}</span>
    },
    {
      key: 'rating',
      label: 'Rating',
      align: 'center',
      sortable: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-0.5 text-secondary-foreground font-bold">
          <Star className="h-4.5 w-4.5 fill-current" />
          <span>{row.rating}</span>
        </div>
      )
    },
    {
      key: 'comment',
      label: 'Comment/Review Text',
      render: (row) => <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-sm">{row.comment}</p>
    },
    {
      key: 'entityName',
      label: 'Reviewed Entity',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.entityName}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{row.entityType}</span>
        </div>
      )
    },
    {
      key: 'reported',
      label: 'Security Status',
      sortable: true,
      render: (row) => (
        row.reported ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 border border-destructive/20 text-destructive uppercase">
            <ShieldAlert className="h-3 w-3" /> Reported
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase">
            Safe
          </span>
        )
      )
    },
    { key: 'date', label: 'Review Date', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {!row.reported && (
            <button
              onClick={() => setActiveAction({ type: 'report', review: row })}
              className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
              title="Report/Flag Review"
            >
              <AlertTriangle className="h-4.5 w-4.5" />
            </button>
          )}
          <button
            onClick={() => setActiveAction({ type: 'delete', review: row })}
            className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
            title="Delete Review"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      )
    }
  ];

  // Actions Confirm
  const handleExecuteAction = () => {
    if (!activeAction) return;

    const { type, review } = activeAction;
    let successMsg = '';

    setReviews((prev) => {
      if (type === 'delete') {
        successMsg = `Review by ${review.reviewerName} deleted successfully`;
        return prev.filter((r) => r.id !== review.id);
      }
      // Report
      successMsg = `Review has been reported and flagged for review`;
      return prev.map((r) => (r.id === review.id ? { ...r, reported: true } : r));
    });

    success(successMsg);
    setActiveAction(null);
  };

  const getDialogDetails = () => {
    if (!activeAction) return { title: '', desc: '', variant: 'danger' as const };
    const reviewer = activeAction.review.reviewerName;

    if (activeAction.type === 'report') {
      return {
        title: 'Report/Flag Review',
        desc: `Are you sure you want to flag the review by ${reviewer} as inappropriate? It will be marked for administration checks.`,
        variant: 'danger' as const
      };
    }
    return {
      title: 'Delete Review Listing',
      desc: `WARNING: Are you sure you want to permanently delete the review by ${reviewer}? This action is irreversible.`,
      variant: 'danger' as const
    };
  };

  const filteredReviews = reviews.filter((r) => {
    const matchSearch =
      r.reviewerName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.entityName.toLowerCase().includes(search.toLowerCase());

    const matchRating = ratingFilter === 'all' || r.rating.toString() === ratingFilter;
    const matchReported =
      reportedFilter === 'all'
        ? true
        : reportedFilter === 'reported'
        ? r.reported
        : !r.reported;

    return matchSearch && matchRating && matchReported;
  });

  const dialogDetails = getDialogDetails();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Customer Feedback & Reviews" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews' }]} />

      {/* Ratings stats widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Rating StatCards */}
        <div className="lg:col-span-1 space-y-4">
          <StatCard title="Average Platform Rating" value={`${avgRating} ★`} icon={Star} />
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Reviews Logged" value={totalReviews} icon={Eye} />
            <StatCard
              title="Reported Flags"
              value={reportedCount}
              icon={ShieldAlert}
              className={reportedCount > 0 ? 'border-destructive/30 bg-destructive/[0.01]' : ''}
            />
          </div>
        </div>

        {/* Right Side: Visual Rating Distribution bar chart */}
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-foreground tracking-wider uppercase mb-3">Rating Breakdown Distribution</h3>
          
          <div className="space-y-3.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-10 flex items-center gap-1 text-foreground">
                  {star} <Star className="h-3.5 w-3.5 fill-current text-secondary-foreground" />
                </span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-500"
                    style={{ width: getStarPct(star) }}
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground font-mono">
                  {getCountByStar(star)} ({getStarPct(star)})
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Table list */}
      <DataTable
        columns={columns}
        data={filteredReviews}
        searchPlaceholder="Search reviews, reviewers, target products..."
        searchValue={search}
        onSearchChange={setSearch}
        filterSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Flag:</span>
              <select
                value={reportedFilter}
                onChange={(e) => setReportedFilter(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All States</option>
                <option value="reported">Reported Only</option>
                <option value="safe">Safe Only</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Action dialogue confirm */}
      <ConfirmDialog
        isOpen={activeAction !== null}
        title={dialogDetails.title}
        description={dialogDetails.desc}
        confirmText="Confirm Action"
        variant={dialogDetails.variant}
        onConfirm={handleExecuteAction}
        onCancel={() => setActiveAction(null)}
      />
    </div>
  );
}
