import { useState } from 'react';
import { X } from 'lucide-react';
import type { TaxonomyNode } from '@/lib/superadmin-api';
import CategoryImageDrop from './CategoryImageDrop';

export interface CategoryDraft {
  parentId: string | null;
  code: string;
  listingKind: string;
  displayOrder: number;
  isActive: boolean;
  nameEn: string;
  nameBn: string;
  icon: string | null;
  imageUrl: string | null;
}

export default function CategoryForm({ parents, editing, saving, onCancel, onSubmit, onImageChanged }: {
  parents: TaxonomyNode[];
  editing: TaxonomyNode | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (draft: CategoryDraft) => void;
  onImageChanged: () => void;
}) {
  const [draft, setDraft] = useState<CategoryDraft>({
    parentId: editing?.parentId ?? null,
    code: editing?.code ?? '',
    listingKind: editing?.listingKind ?? 'product',
    displayOrder: editing?.displayOrder ?? 0,
    isActive: editing?.isActive ?? true,
    nameEn: editing?.nameEn ?? '',
    nameBn: editing?.nameBn ?? '',
    icon: editing?.icon ?? '',
    imageUrl: editing?.imageUrl ?? ''
  });
  const [problem, setProblem] = useState('');

  const isEdit = editing != null;

  // The level a new category would land on: no parent is a division (1),
  // otherwise one below the parent. Mirrors how the procedure derives depth.
  const parent = draft.parentId ? parents.find((p) => p.id === draft.parentId) ?? null : null;
  const level = parent ? parent.depth + 2 : 1;
  const LEVEL_NAME = ['', 'Division', 'Category', 'Subcategory'];

  // Only a division or a category can be a parent -- a subcategory is a leaf,
  // and CK_category_depth_range refuses a fourth level outright. Filtering the
  // options is what stops an admin discovering that from a server error.
  const selectableParents = parents.filter((p) => p.depth < 2 && !p.isRetired);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = draft.code.trim().toLowerCase();
    if (!isEdit && !/^[a-z0-9-]+$/.test(code)) {
      setProblem('A code uses lower-case letters, digits and hyphens only.');
      return;
    }
    if (!draft.nameEn.trim() || !draft.nameBn.trim()) {
      setProblem('A category needs a name in both English and Bangla.');
      return;
    }
    if (draft.displayOrder < 0) {
      setProblem('Display order cannot be negative.');
      return;
    }
    // The same three rules the database enforces, checked here so an admin gets
    // them as they type rather than as a rejected save.
    if (!isEdit && parent && parent.depth >= 2) {
      setProblem('The taxonomy is three levels deep. A subcategory cannot hold another category.');
      return;
    }
    if (!isEdit && draft.parentId === null && level !== 1) {
      setProblem('A division sits at the top level and has no parent.');
      return;
    }
    setProblem('');
    onSubmit({
      ...draft, code,
      nameEn: draft.nameEn.trim(), nameBn: draft.nameBn.trim(),
      icon: draft.icon?.trim() || null,
      imageUrl: draft.imageUrl?.trim() || null,
    });
  }

  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';
  const label = 'text-[11px] font-bold text-foreground/80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <form onSubmit={submit} className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">{isEdit ? `Edit ${editing.code}` : 'New category'}</h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className={label} htmlFor="cat-code">Code</label>
              <input
                id="cat-code"
                className={field}
                value={draft.code}
                disabled={isEdit}
                placeholder="fungicides"
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              />
              {isEdit && <p className="text-[11px] text-muted-foreground">The code is part of the category path and cannot change.</p>}
            </div>
            <div className="space-y-1">
              <label className={label} htmlFor="cat-kind">Covers</label>
              <select
                id="cat-kind"
                className={field}
                value={draft.listingKind}
                disabled={isEdit}
                onChange={(e) => setDraft({ ...draft, listingKind: e.target.value })}
              >
                <option value="product">Products</option>
                <option value="service">Services</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className={label} htmlFor="cat-parent">Parent</label>
            <select
              id="cat-parent"
              className={field}
              value={draft.parentId ?? ''}
              disabled={isEdit}
              onChange={(e) => setDraft({ ...draft, parentId: e.target.value || null })}
            >
              <option value="">Top level — a Division</option>
              {selectableParents.map((p) => (
                <option key={p.id} value={p.id}>
                  {'— '.repeat(p.depth)}{p.nameEn ?? p.code}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              {isEdit
                ? `Level ${editing.depth + 1} — ${LEVEL_NAME[editing.depth + 1]}. Re-parenting is not supported yet.`
                : `This will be a level ${level} ${LEVEL_NAME[level]}.`}
              {!isEdit && level === 3 && ' Products are listed here.'}
            </p>
          </div>

          <div className="space-y-1">
            <label className={label} htmlFor="cat-name-en">Name (English)</label>
            <input id="cat-name-en" className={field} value={draft.nameEn}
              onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })} placeholder="Fungicides" />
          </div>
          <div className="space-y-1">
            <label className={label} htmlFor="cat-name-bn">নাম (বাংলা)</label>
            <input id="cat-name-bn" className={field} value={draft.nameBn}
              onChange={(e) => setDraft({ ...draft, nameBn: e.target.value })} placeholder="ছত্রাকনাশক" />
            {isEdit && !editing.nameBnReviewed && (
              <p className="text-[11px] text-warning">
                This Bangla name is unchecked {editing.nameBnSource ?? 'machine'} output. Saving it here
                marks it reviewed.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className={label} htmlFor="cat-icon">Icon</label>
              <input id="cat-icon" className={field} value={draft.icon ?? ''} placeholder="cattle"
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
              <p className="text-[11px] text-muted-foreground">A short name the apps map to their own icon set.</p>
            </div>
            <CategoryImageDrop
              categoryId={editing?.id ?? null}
              hasImage={editing?.hasImage ?? false}
              onChanged={onImageChanged}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className={label} htmlFor="cat-order">Display order</label>
              <input id="cat-order" type="number" min={0} className={field} value={draft.displayOrder}
                onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })} />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
              <input type="checkbox" checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
              Visible in the catalogue
            </label>
          </div>

          {problem && <p className="text-xs text-destructive">{problem}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button type="button" onClick={onCancel}
            className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </form>
    </div>
  );
}
