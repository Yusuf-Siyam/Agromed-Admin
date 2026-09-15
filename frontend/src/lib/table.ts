

export function sortRows<T>(rows: readonly T[], key: string, direction: 'asc' | 'desc'): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    const an = typeof av === 'string' ? av.toLowerCase() : av;
    const bn = typeof bv === 'string' ? bv.toLowerCase() : bv;
    if (an === bn) return 0;
    if (an == null) return 1;
    if (bn == null) return -1;
    return (an < bn ? -1 : 1) * factor;
  });
}
