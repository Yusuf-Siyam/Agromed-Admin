import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, ArrowDown, ArrowUp, Archive, Eye, EyeOff, FolderTree, Languages, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import ActionIcon from '@/components/shared/ActionIcon';
import CategoryForm from './CategoryForm';
import type { CategoryDraft } from './CategoryForm';
import { createCategory, deleteCategory, listTaxonomy, updateCategory } from '@/lib/superadmin-api';
import type { TaxonomyNode } from '@/lib/superadmin-api';

export default function CategoryList() {
  const { success, error: toastError } = useToast();
  const { run, busy, error: writeError, clearError } = useApiAction();

  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<TaxonomyNode | null>(null);
  const [deleting, setDeleting] = useState<TaxonomyNode | null>(null);
  const [form, setForm] = useState<{ editing: TaxonomyNode | null } | null>(null);
  const [showRetired, setShowRetired] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [blocked, setBlocked] = useState<string | null>(null);

  const taxonomy = useApi((token) => listTaxonomy(token, showRetired), [showRetired]);

  const toggleCollapse = (id: string) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (!next.delete(id)) next.add(id);
    return next;
  });

  // Ordered depth-first by the tree, not alphabetically by path: siblings sort
  // by display_order, which is the order buyers actually see. Searching flattens
  // the tree, because a match three levels down should not be hidden behind a
  // collapsed ancestor.
  const rows = useMemo(() => {
    const all = taxonomy.data ?? [];
    const needle = search.trim().toLowerCase();

    if (needle) {
      return all
        .filter((c) => c.code.toLowerCase().includes(needle)
          || (c.nameEn ?? '').toLowerCase().includes(needle)
          || (c.nameBn ?? '').includes(search.trim()))
        .sort((a, b) => a.path.localeCompare(b.path));
    }

    const byParent = new Map<string, TaxonomyNode[]>();
    for (const c of all) {
      const key = c.parentId ?? '#root';
      const list = byParent.get(key);
      if (list) list.push(c); else byParent.set(key, [c]);
    }
    for (const list of byParent.values()) {
      list.sort((a, b) => a.displayOrder - b.displayOrder || a.code.localeCompare(b.code));
    }

    const out: TaxonomyNode[] = [];
    const walk = (parentKey: string) => {
      for (const node of byParent.get(parentKey) ?? []) {
        out.push(node);
        if (!collapsed.has(node.id)) walk(node.id);
      }
    };
    walk('#root');
    return out;
  }, [taxonomy.data, search, collapsed]);

  /** Siblings of a node in display order — what a reorder swaps within. */
  const siblingsOf = (row: TaxonomyNode) =>
    (taxonomy.data ?? [])
      .filter((c) => c.parentId === row.parentId && !c.isRetired)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.code.localeCompare(b.code));

  /**
   * Move a category past its neighbour by swapping the two display_order values.
   * Two writes rather than a renumber of the whole level: only the pair actually
   * changes, so a concurrent edit elsewhere in the tree is not clobbered.
   */
  async function reorder(row: TaxonomyNode, direction: -1 | 1) {
    const sibs = siblingsOf(row);
    const i = sibs.findIndex((c) => c.id === row.id);
    const swap = sibs[i + direction];
    if (!swap) return;

    const ok = await run(async (token) => {
      await updateCategory(token, row.id, swap.displayOrder, row.isActive);
      await updateCategory(token, swap.id, row.displayOrder, swap.isActive);
    });
    if (ok) taxonomy.reload();
    else toastError(`${row.code} could not be moved.`);
  }

  /**
   * Why this category cannot be removed, or null if it can.
   *
   * usp_superadmin_delete_category refuses on either count and says so; this
   * repeats the rule client-side so the answer is on the button rather than
   * behind a failed request, and names the number the admin has to deal with.
   */
  function deleteBlockReason(row: TaxonomyNode): string | null {
    if (row.listingCount > 0) {
      return `${row.listingCount} active listing${row.listingCount === 1 ? '' : 's'} `
        + 'still use this category. Move or withdraw them first.';
    }
    if (row.childCount > 0) {
      return `${row.childCount} sub-categor${row.childCount === 1 ? 'y' : 'ies'} `
        + 'sit under this one. Remove them first.';
    }
    return null;
  }

  const columns: Column<TaxonomyNode>[] = [
    {
      key: 'code',
      label: 'Category',
      render: (row) => {
        const hasChildren = row.childCount > 0;
        return (
          <div className="flex items-start gap-1.5" style={{ paddingLeft: `${row.depth * 18}px` }}>
            {hasChildren ? (
              <button
                type="button"
                aria-label={collapsed.has(row.id) ? `Expand ${row.code}` : `Collapse ${row.code}`}
                aria-expanded={!collapsed.has(row.id)}
                onClick={() => toggleCollapse(row.id)}
                className="mt-0.5 cursor-pointer rounded p-0.5 hover:bg-muted"
              >
                {collapsed.has(row.id)
                  ? <ChevronRight className="h-3.5 w-3.5" />
                  : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            ) : <span className="w-[18px]" aria-hidden />}
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                {row.nameEn ?? row.code}
                {row.isRetired && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Retired
                  </span>
                )}
                {row.icon && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {row.icon}
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                L{row.depth + 1} · {row.code}
              </span>
              {row.nameBn && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {row.nameBn}
                  {!row.nameBnReviewed && (
                    <span className="rounded bg-warning/15 px-1 text-[10px] font-semibold text-warning">
                      unreviewed
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    { key: 'listingKind', label: 'Kind', align: 'center' },
    { key: 'displayOrder', label: 'Order', align: 'center' },
    { key: 'listingCount', label: 'Listings', align: 'center' },
    {
      key: 'compliance',
      label: 'Compliance requirements',
      render: (row) => {
        const flags = [
          row.requiresSellerCertificate && 'Seller certificate',
          row.requiresProductCertificate && 'Product certificate',
          row.requiresBuyerLicence && 'Buyer licence',
          row.requiresBatchTracking && 'Batch tracking',
          row.requiresExpiryTracking && 'Expiry tracking'
        ].filter(Boolean) as string[];

        if (flags.length === 0) return <span className="text-xs text-muted-foreground">None</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {flags.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />{f}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      label: 'Visible',
      align: 'center',
      render: (row) => (
        <span className={row.isActive ? 'text-xs font-semibold text-success' : 'text-xs font-semibold text-muted-foreground'}>
          {row.isActive ? 'Live' : 'Hidden'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <ActionIcon
            label="Edit name and order"
            icon={Pencil}
            onClick={() => setForm({ editing: row })}
          />
          <ActionIcon
            label={row.isActive ? 'Hide from the catalogue' : 'Show in the catalogue'}
            icon={row.isActive ? EyeOff : Eye}
            onClick={() => setToggling(row)}
          />
          <ActionIcon
            label="Move up"
            icon={ArrowUp}
            disabled={row.isRetired || siblingsOf(row)[0]?.id === row.id}
            onClick={() => reorder(row, -1)}
          />
          <ActionIcon
            label="Move down"
            icon={ArrowDown}
            disabled={row.isRetired || siblingsOf(row).at(-1)?.id === row.id}
            onClick={() => reorder(row, 1)}
          />
          <ActionIcon
            label={deleteBlockReason(row) ?? 'Remove category'}
            icon={Trash2}
            tone="danger"
            disabled={row.isRetired}
            onClick={() => {
              const why = deleteBlockReason(row);
              if (why) setBlocked(why); else setDeleting(row);
            }}
          />
        </div>
      )
    }
  ];

  async function toggle() {
    if (!toggling) return;
    const target = toggling;
    setToggling(null);

    const ok = await run((token) => updateCategory(token, target.id, target.displayOrder, !target.isActive));
    if (ok) {
      success(`${target.code} is now ${target.isActive ? 'hidden' : 'live'}.`);
      taxonomy.reload();
    } else {
      toastError(`${target.code} could not be updated.`);
    }
  }

  async function save(draft: CategoryDraft) {
    const editing = form?.editing ?? null;
    const ok = await run((token) => editing
      ? updateCategory(token, editing.id, draft.displayOrder, draft.isActive,
          { nameEn: draft.nameEn, nameBn: draft.nameBn,
            icon: draft.icon, imageUrl: draft.imageUrl })
      : createCategory(token, draft));

    if (ok) {
      success(editing ? `${editing.code} updated.` : `${draft.code} created.`);
      setForm(null);
      taxonomy.reload();
    } else {
      toastError(editing ? `${editing.code} could not be saved.` : 'That category could not be created.');
    }
  }

  async function remove() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);

    const ok = await run((token) => deleteCategory(token, target.id));
    if (ok) {
      success(`${target.code} removed.`);
      taxonomy.reload();
    } else {
      // The procedure's own wording, now that the middleware maps 65095/65096
      // instead of letting them fall through as a bare 500.
      setBlocked(writeError ?? `${target.code} could not be removed.`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Taxonomy"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <FolderTree className="h-4 w-4" />
              {rows.length} shown
            </div>
            <button
              onClick={() => setShowRetired((v) => !v)}
              aria-pressed={showRetired}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                showRetired
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'}`}
            >
              <Archive className="h-4 w-4" />
              {showRetired ? 'Hiding nothing' : 'Show retired'}
            </button>
            {/* Link, not a bare anchor: the console is served under a base path
                (/Agromed-Admin), and a raw href drops it and 404s. */}
            <Link
              to="/categories/translations"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
            >
              <Languages className="h-4 w-4" />Review Bangla
            </Link>
            <button
              onClick={() => setForm({ editing: null })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />New category
            </button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={taxonomy.loading || busy}
        error={taxonomy.error}
        onRetry={taxonomy.reload}
        searchPlaceholder="Search by code or path..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <ConfirmDialog
        isOpen={toggling != null}
        title={toggling?.isActive ? 'Hide this category?' : 'Show this category?'}
        description={
          toggling?.isActive
            ? `${toggling.code} disappears from browse and search. Listings already in it stay where they are.`
            : `${toggling?.code ?? ''} becomes browsable again.`
        }
        confirmText="Confirm"
        variant={toggling?.isActive ? 'danger' : 'primary'}
        onConfirm={toggle}
        onCancel={() => setToggling(null)}
      />

      <ConfirmDialog
        isOpen={deleting != null}
        title="Remove this category?"
        description={`${deleting?.code ?? ''} is withdrawn from the taxonomy. Categories holding listings or sub-categories are refused.`}
        confirmText="Remove"
        variant="danger"
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmDialog
        isOpen={blocked != null}
        title="This category is in use"
        description={blocked ?? ''}
        confirmText="Understood"
        variant="primary"
        onConfirm={() => { setBlocked(null); clearError(); }}
        onCancel={() => { setBlocked(null); clearError(); }}
      />

      {form && (
        <CategoryForm
          key={form.editing?.id ?? 'new'}
          parents={taxonomy.data ?? []}
          editing={form.editing}
          saving={busy}
          onCancel={() => setForm(null)}
          onSubmit={save}
          onImageChanged={taxonomy.reload}
        />
      )}
    </div>
  );
}
