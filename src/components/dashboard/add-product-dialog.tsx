import { useEffect, useState, type FormEvent } from "react";
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSimpleProduct, listCategories, listMyStores } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { Category, TenantStore } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/use-auth";

const NO_CATEGORY = "__none__";
const NEW_CATEGORY = "__new__";

function generateSku(): string {
  return `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const { user } = useAuth();
  const canManageProducts = user?.role === "seller" || user?.role === "admin";

  const [stores, setStores] = useState<TenantStore[]>([]);
  const [storeSlug, setStoreSlug] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
  const [newCategory, setNewCategory] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSku((current) => current || generateSku());
    setMetaLoading(true);
    setMetaError(null);
    listMyStores()
      .then((myStores) => {
        setStores(myStores);
        setStoreSlug((current) => current || myStores[0]?.slug || "");
      })
      .catch(() => setMetaError("Could not load your stores. Try again."))
      .finally(() => setMetaLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || !storeSlug) return;
    listCategories(storeSlug)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [open, storeSlug]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategoryId(NO_CATEGORY);
    setNewCategory("");
    setSku("");
    setPrice("");
    setStock("0");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageProducts) return;

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      toast.error("Stock must be a whole number, 0 or more.");
      return;
    }
    if (!sku.trim()) {
      toast.error("Enter a SKU.");
      return;
    }
    if (categoryId === NEW_CATEGORY && !newCategory.trim()) {
      toast.error("Enter a name for the new category.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createSimpleProduct(
        {
          title,
          description,
          sku,
          price: parsedPrice.toFixed(2),
          stock: parsedStock,
          categoryId:
            categoryId === NO_CATEGORY || categoryId === NEW_CATEGORY ? null : Number(categoryId),
          newCategory: categoryId === NEW_CATEGORY ? newCategory : "",
        },
        storeSlug || null,
      );
      toast.success("Product created", {
        description: `${created.title} is now in your catalogue.`,
      });
      resetForm();
      onOpenChange(false);
      onCreated?.();
    } catch (error) {
      toast.error("Could not create the product", {
        description: error instanceof ApiError ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const storeName = stores.find((s) => s.slug === storeSlug)?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <PackagePlus className="h-5 w-5 text-primary" /> Add product
          </DialogTitle>
          <DialogDescription>
            Create a simple, ready-to-sell product in your store. Variants and options can be added
            afterwards.
          </DialogDescription>
        </DialogHeader>

        {!canManageProducts ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Product management is only available to seller accounts. Your account is a customer
            account — ask us to upgrade it to a seller.
          </p>
        ) : metaLoading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your store…
          </p>
        ) : metaError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {metaError}
          </p>
        ) : stores.length === 0 ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Your account is not linked to a store yet. Ask us to connect you to one.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            {stores.length > 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="ap-store">Store</Label>
                <Select value={storeSlug} onValueChange={setStoreSlug}>
                  <SelectTrigger id="ap-store">
                    <SelectValue placeholder="Choose a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.slug} value={store.slug}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {stores.length === 1 && storeName && (
              <p className="text-xs text-muted-foreground">
                Adding to <span className="font-semibold text-foreground">{storeName}</span>
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="ap-title">Product title</Label>
              <Input
                id="ap-title"
                required
                autoFocus
                placeholder="Hand-beaded Ankara jacket"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ap-description">Description</Label>
              <Textarea
                id="ap-description"
                rows={2}
                placeholder="Fabric, fit, care — what the customer should know."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ap-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="ap-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={NEW_CATEGORY}>+ New category…</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ap-sku">SKU</Label>
                <Input
                  id="ap-sku"
                  required
                  value={sku}
                  onChange={(event) => setSku(event.target.value.toUpperCase())}
                />
              </div>
            </div>
            {categoryId === NEW_CATEGORY && (
              <div className="space-y-1.5">
                <Label htmlFor="ap-new-category">New category</Label>
                <Input
                  id="ap-new-category"
                  placeholder="Okafor prints"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ap-price">Price (₦)</Label>
                <Input
                  id="ap-price"
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="18500"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ap-stock">Stock on hand</Label>
                <Input
                  id="ap-stock"
                  required
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                  </>
                ) : (
                  "Create product"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
