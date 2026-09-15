import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import { useApiAction } from '@/lib/useApi';
import { categoryImageUrl, deleteCategoryImage, uploadCategoryImage } from '@/lib/superadmin-api';

/**
 * Drop target for a category picture.
 *
 * Replaces a text box that asked for a URL. That box assumed the image already
 * lived somewhere with a public address, which made "add a picture" mean "go
 * and find hosting first" — homework, not a feature. The file now goes into the
 * platform's own storage like every other upload.
 *
 * Only offered while editing: the upload is addressed to a category id, and a
 * category being created does not have one yet.
 */
export default function CategoryImageDrop({
  categoryId,
  hasImage,
  onChanged,
}: {
  categoryId: string | null;
  hasImage: boolean;
  onChanged: () => void;
}) {
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  // Bumped after every write so the <img> refetches instead of showing the
  // browser's cached copy of the picture that was just replaced.
  const [version, setVersion] = useState(() => Date.now());
  const [present, setPresent] = useState(hasImage);

  const label = 'text-[11px] font-bold text-foreground/80';

  if (!categoryId) {
    return (
      <div className="space-y-1">
        <span className={label}>Image</span>
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-[11px] text-muted-foreground">
          Create the category first, then reopen it to add a picture.
        </p>
      </div>
    );
  }

  async function accept(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toastError('That file is not an image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toastError('A category image must be 8 MB or smaller.');
      return;
    }
    const ok = await run((token) => uploadCategoryImage(token, categoryId!, file));
    if (ok) {
      setPresent(true);
      setVersion(Date.now());
      success('Image updated.');
      onChanged();
    } else {
      toastError('That image could not be uploaded.');
    }
  }

  async function remove() {
    const ok = await run((token) => deleteCategoryImage(token, categoryId!));
    if (ok) {
      setPresent(false);
      setVersion(Date.now());
      success('Image removed.');
      onChanged();
    } else {
      toastError('That image could not be removed.');
    }
  }

  return (
    <div className="space-y-1">
      <span className={label}>Image</span>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void accept(e.dataTransfer.files?.[0]);
        }}
        className={`flex items-center gap-3 rounded-lg border border-dashed px-3 py-3 transition ${
          dragging ? 'border-primary bg-primary/5' : 'border-border'}`}
      >
        {present ? (
          <img
            src={categoryImageUrl(categoryId, version)}
            alt=""
            className="h-14 w-14 rounded-md object-cover"
            onError={() => setPresent(false)}
          />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-md bg-muted text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs text-foreground">
            {present ? 'Drop a new image to replace it' : 'Drop an image here'}
          </p>
          <p className="text-[11px] text-muted-foreground">PNG or JPEG, up to 8 MB.</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Browse
          </button>
          {present && (
            <button
              type="button"
              disabled={busy}
              onClick={remove}
              aria-label="Remove image"
              className="cursor-pointer rounded-lg border border-border p-1.5 text-destructive hover:bg-muted disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { void accept(e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>
    </div>
  );
}
