import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface TrendPoint {
  label: string;
  value: number;
  detail?: string;
}

interface TrendChartProps {
  points: TrendPoint[];
  valueLabel: string;
  ariaLabel: string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function TrendChart({ points, valueLabel, ariaLabel, valueFormatter = (value) => value.toLocaleString(), className }: TrendChartProps) {
  const chart = useMemo(() => {
    const width = 640;
    const height = 208;
    const left = 44;
    const right = 16;
    const top = 18;
    const bottom = 34;
    const values = points.map((point) => Math.max(0, point.value));
    const max = Math.max(1, ...values);
    const step = points.length <= 1 ? 0 : (width - left - right) / (points.length - 1);
    const y = (value: number) => top + (height - top - bottom) * (1 - value / max);
    const coordinates = values.map((value, index) => ({ x: left + step * index, y: y(value) }));
    const line = coordinates.map(({ x, y: pointY }) => `${x},${pointY}`).join(' ');
    const area = coordinates.length
      ? `${left},${height - bottom} ${line} ${coordinates.at(-1)?.x},${height - bottom}`
      : '';
    return { width, height, left, right, top, bottom, max, coordinates, line, area };
  }, [points]);

  if (points.length === 0) {
    return <p className={cn('py-10 text-center text-sm text-muted-foreground', className)}>No activity in this period yet.</p>;
  }

  const labelEvery = points.length > 6 ? Math.ceil(points.length / 6) : 1;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-52 w-full" role="img" aria-label={ariaLabel}>
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chart.top + (chart.height - chart.top - chart.bottom) * (1 - ratio);
          return <line key={ratio} x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} className="stroke-border" strokeDasharray="3 4" />;
        })}
        <path d={`M ${chart.area}`} className="fill-primary/10" />
        <polyline points={chart.line} fill="none" className="stroke-primary" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {chart.coordinates.map(({ x, y }, index) => (
          <g key={points[index].label}>
            <circle cx={x} cy={y} r="4" className="fill-card stroke-primary" strokeWidth="2.5">
              <title>{`${points[index].label}: ${points[index].detail ?? points[index].value}`}</title>
            </circle>
            {(index % labelEvery === 0 || index === points.length - 1) && (
              <text x={x} y={chart.height - 12} textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'} className="fill-muted-foreground text-[10px]">
                {points[index].label}
              </text>
            )}
          </g>
        ))}
        <text x={chart.left} y={12} className="fill-muted-foreground text-[10px]">{valueLabel} · peak {valueFormatter(chart.max)}</text>
      </svg>
      <ul className="sr-only">
        {points.map((point) => <li key={point.label}>{point.label}: {point.detail ?? point.value}</li>)}
      </ul>
    </div>
  );
}

export interface DistributionItem {
  label: string;
  value: number;
  detail?: string;
  tone?: 'primary' | 'secondary' | 'danger';
}

interface DistributionChartProps {
  items: DistributionItem[];
  ariaLabel: string;
  emptyLabel?: string;
}

export function DistributionChart({ items, ariaLabel, emptyLabel = 'No data available yet.' }: DistributionChartProps) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const tone = (item: DistributionItem) => item.tone === 'danger'
    ? 'bg-destructive'
    : item.tone === 'secondary'
      ? 'bg-secondary'
      : 'bg-primary';

  if (items.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;

  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {items.map((item) => {
        const percentage = Math.round((item.value / max) * 100);
        return (
          <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="capitalize text-foreground">{item.label}</span>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">{item.detail ?? item.value.toLocaleString()}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className={cn('h-full rounded-full transition-[width] duration-500', tone(item))} style={{ width: `${percentage}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
