import { useState } from 'react';
import { Edit, Trash2, Plus, FolderPlus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { mockCategories } from '@/mock-data/products';
import type { CategoryItem } from '@/mock-data/products';

export default function CategoryList() {
  const { success } = useToast();

  const [categories, setCategories] = useState<CategoryItem[]>(mockCategories);
  const [search, setSearch] = useState('');

  // Dialog management
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const columns: Column<CategoryItem>[] = [
    { key: 'id', label: 'Category ID' },
    { key: 'name', label: 'Category Name', render: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
    { key: 'description', label: 'Description' },
    { key: 'productCount', label: 'SKU Products Count', align: 'center' },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            title="Edit Category"
          >
            <Edit className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setDeleteCategory(row)}
            className="p-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors cursor-pointer"
            title="Delete Category"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      )
    }
  ];

  const handleOpenAdd = () => {
    setCatName('');
    setCatDesc('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      // Edit
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: catName, description: catDesc }
            : c
        )
      );
      success(`Category ${catName} updated successfully`);
      setEditingCategory(null);
    } else {
      // Add
      const newCat: CategoryItem = {
        id: `CAT-0${categories.length + 1}`,
        name: catName,
        description: catDesc,
        productCount: 0
      };
      setCategories((prev) => [...prev, newCat]);
      success(`Category ${catName} added successfully`);
      setIsAddOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteCategory) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteCategory.id));
    success(`Category ${deleteCategory.name} deleted successfully`);
    setDeleteCategory(null);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Product Categories"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
        action={
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add New Category
          </button>
        }
      />

      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Add / Edit Inline Dialog Panel (Mock Modal overlay) */}
      {(isAddOpen || editingCategory !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsAddOpen(false);
              setEditingCategory(null);
            }}
          />
          <div className="bg-card border border-border/80 w-full max-w-md rounded-xl p-6 shadow-xl relative z-10 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <FolderPlus className="h-5 w-5 text-primary" />
              {editingCategory ? 'Edit Product Category' : 'Create Product Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/80">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Fertilizers"
                  className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/80">Description</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="e.g. Chemical and organic nutrients..."
                  className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteCategory !== null}
        title="Delete Product Category"
        description={`Are you sure you want to permanently delete the category ${deleteCategory?.name}? This will un-categorize all products currently mapped to it.`}
        confirmText="Confirm Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCategory(null)}
      />
    </div>
  );
}
