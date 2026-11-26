import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ImageIcon,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminOptionType,
  createAdminOptionValue,
  createAdminProductImage,
  deleteAdminProduct,
  deleteAdminProductImage,
  generateAdminVariants,
  getAdminUploadSignature,
  listAdminOptionTypes,
  listAdminOptionValues,
  listAdminProductImages,
  listAdminProducts,
  listCategories,
  makeAdminProductImagePrimary,
  updateAdminProduct,
  updateAdminVariant,
  type AdminOptionType,
  type AdminOptionValue,
  type AdminProductImage,
  type AdminVariantPatch,
} from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { listAdminVariants, type AdminVariant } from "@/lib/api/inventory";
import type { AdminProduct, Category } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/use-auth";
import { formatCurrency } from "@/lib/currency";

const NO_CATEGORY = "__none__";

type StatusFilter = "all" | "active" | "inactive";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request failed.";
}

export function ProductManagementTab({
  tenantSlug,
  onAddProduct,
  refreshKey = 0,
}: {
  tenantSlug: string | null;
  onAddProduct: () => void;
  refreshKey?: number;
}) {
  const { user } = useAuth();
  const canManage = user?.role === "seller" || user?.role === "admin";

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantSlug || !canManage) return;
    let cancelled = false;
    listCategories(tenantSlug)
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, canManage]);

  useEffect(() => {
    setPage(1);
  }, [refreshKey]);

  useEffect(() => {
    if (!tenantSlug || !canManage) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      listAdminProducts(tenantSlug, { search, active: status, page, pageSize: 50 })
        .then((list) => {
          if (cancelled) return;
          setProducts((rows) => {
            if (page === 1) return list.results;
            const merged = new Map(rows.map((row) => [row.id, row]));
            list.results.forEach((row) => merged.set(row.id, row));
            return [...merged.values()];
          });
          setTotal(list.count);
          setHasMore(Boolean(list.next));
        })
        .catch((e) => {
          if (!cancelled) setError(errorMessage(e));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [tenantSlug, canManage, search, status, page, refreshKey]);

  const changeFilters = (nextSearch: string, nextStatus: StatusFilter) => {
    setSearch(nextSearch);
    setStatus(nextStatus);
    setPage(1);
  };

  const updateRow = (updated: AdminProduct) => {
    setProducts((rows) => {
      const hidden =
        (status === "active" && !updated.is_active) || (status === "inactive" && updated.is_active);
      if (hidden) return rows.filter((row) => row.id !== updated.id);
      return rows.map((row) => (row.id === updated.id ? updated : row));
    });
  };

  const toggleActive = async (product: AdminProduct) => {
    if (!tenantSlug || busyId) return;
    setBusyId(product.id);
    try {
      const updated = await updateAdminProduct(
        product.id,
        { is_active: !product.is_active },
        tenantSlug,
      );
      updateRow(updated);
      toast.success(`${updated.title} ${updated.is_active ? "published" : "unpublished"}`);
    } catch (e) {
      toast.error("Couldn't update the product", {
        description: e instanceof ApiError ? e.message : errorMessage(e),
      });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!tenantSlug || !deleting || busyId) return;
    setBusyId(deleting.id);
    try {
      await deleteAdminProduct(deleting.id, tenantSlug);
      setProducts((rows) => rows.filter((row) => row.id !== deleting.id));
      setTotal((count) => Math.max(0, count - 1));
      toast.success(`${deleting.title} deleted`);
      setDeleting(null);
    } catch (e) {
      toast.error("Couldn't delete the product", {
        description: e instanceof ApiError ? e.message : errorMessage(e),
      });
    } finally {
      setBusyId(null);
    }
  };

  if (!canManage) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
        Product management is only available to seller and admin accounts.
      </div>
    );
  }

  if (!tenantSlug) {
    return (
      <div className="rounded-xl border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        Select a store to manage its products.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {total === 1 ? "product" : "products"} in this store. Publish, edit or remove
            items from your catalogue.
          </p>
        </div>
        <Button onClick={onAddProduct}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title, slug or ID"
            value={search}
            onChange={(e) => changeFilters(e.target.value, status)}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => changeFilters(search, value as StatusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            <SelectItem value="active">Published</SelectItem>
            <SelectItem value="inactive">Unpublished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price from</TableHead>
              <TableHead className="text-right">Variants</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" /> Loading products…
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No products found. Add your first product to start selling.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const category = categories.find((c) => c.id === product.category);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{product.title}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {product.short_id || product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {product.price_from ? formatCurrency(Number(product.price_from)) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {product.variant_count}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.is_active}
                          disabled={busyId === product.id}
                          onCheckedChange={() => void toggleActive(product)}
                          aria-label={`Publish ${product.title}`}
                        />
                        <Badge variant={product.is_active ? "secondary" : "outline"}>
                          {product.is_active ? "Live" : "Draft"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${product.title}`}
                          onClick={() => setEditing(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${product.title}`}
                          onClick={() => setDeleting(product)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setPage((current) => current + 1)}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Load more
          </Button>
        </div>
      )}

      <EditProductDialog
        product={editing}
        categories={categories}
        tenantSlug={tenantSlug}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          updateRow(updated);
          setEditing(null);
          toast.success(`${updated.title} updated`);
        }}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from your catalogue. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busyId !== null}
              onClick={() => void confirmDelete()}
            >
              {busyId ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Delete product
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditProductDialog({
  product,
  categories,
  tenantSlug,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  categories: Category[];
  tenantSlug: string;
  onClose: () => void;
  onSaved: (product: AdminProduct) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [discount, setDiscount] = useState("0");
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("details");
  const [variants, setVariants] = useState<AdminVariant[]>([]);
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [optionTypes, setOptionTypes] = useState<AdminOptionType[]>([]);
  const [optionValues, setOptionValues] = useState<Record<string, AdminOptionValue[]>>({});
  const [dataLoading, setDataLoading] = useState(false);
  const [variantEdit, setVariantEdit] = useState<AdminVariant | null>(null);
  const [variantForm, setVariantForm] = useState({
    sku: "",
    price: "",
    costPrice: "",
    active: true,
  });
  const [savingVariant, setSavingVariant] = useState(false);
  const [newOptionType, setNewOptionType] = useState("");
  const [newOptionValues, setNewOptionValues] = useState<Record<string, string>>({});
  const [generatePrice, setGeneratePrice] = useState("");
  const [skuPrefix, setSkuPrefix] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!product) return;
    setTitle(product.title);
    setDescription(product.description);
    setCategoryId(product.category ? String(product.category) : NO_CATEGORY);
    setDiscount(product.discount_percent ?? "0");
    setIsActive(product.is_active);
    setTab("details");
  }, [product]);

  const reloadData = useCallback(
    async (target: AdminProduct) => {
      const [variantRows, imageRows, typeRows] = await Promise.all([
        listAdminVariants(tenantSlug, target.id),
        listAdminProductImages(tenantSlug, target.id),
        listAdminOptionTypes(tenantSlug, target.id),
      ]);
      const valueRows = await Promise.all(
        typeRows.map((type) => listAdminOptionValues(tenantSlug, type.id)),
      );
      setVariants(variantRows);
      setImages(imageRows);
      setOptionTypes(typeRows);
      setOptionValues(
        Object.fromEntries(typeRows.map((type, index) => [type.id, valueRows[index] ?? []])),
      );
    },
    [tenantSlug],
  );

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    setDataLoading(true);
    reloadData(product)
      .catch((e) => {
        if (!cancelled)
          toast.error("Couldn't load product details", { description: errorMessage(e) });
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product, reloadData]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || saving) return;
    const parsedDiscount = Number(discount);
    if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      toast.error("Discount must be between 0 and 100 percent.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateAdminProduct(
        product.id,
        {
          title: title.trim(),
          description: description.trim(),
          category: categoryId === NO_CATEGORY ? null : Number(categoryId),
          discount_percent: parsedDiscount.toFixed(2),
          is_active: isActive,
        },
        tenantSlug,
      );
      onSaved(updated);
    } catch (e) {
      toast.error("Couldn't save the product", {
        description: e instanceof ApiError ? e.message : errorMessage(e),
      });
    } finally {
      setSaving(false);
    }
  };

  const openVariant = (variant: AdminVariant) => {
    setVariantEdit(variant);
    setVariantForm({
      sku: variant.sku,
      price: variant.price,
      costPrice: variant.cost_price ?? "",
      active: variant.is_active,
    });
  };

  const saveVariant = async () => {
    if (!variantEdit || savingVariant) return;
    const price = Number(variantForm.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid variant price");
      return;
    }
    const patch: AdminVariantPatch = {
      sku: variantForm.sku.trim(),
      price: price.toFixed(2),
      is_active: variantForm.active,
      cost_price: variantForm.costPrice.trim() ? variantForm.costPrice.trim() : null,
    };
    setSavingVariant(true);
    try {
      const updated = await updateAdminVariant(variantEdit.id, patch, tenantSlug);
      setVariants((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      setVariantEdit(null);
      toast.success("Variant updated");
    } catch (e) {
      toast.error("Couldn't update the variant", { description: errorMessage(e) });
    } finally {
      setSavingVariant(false);
    }
  };

  const addOptionType = async () => {
    if (!product || !newOptionType.trim()) return;
    try {
      const created = await createAdminOptionType(
        { product: product.id, name: newOptionType.trim(), position: optionTypes.length },
        tenantSlug,
      );
      setOptionTypes((rows) => [...rows, created]);
      setOptionValues((current) => ({ ...current, [created.id]: [] }));
      setNewOptionType("");
      toast.success("Option added");
    } catch (e) {
      toast.error("Couldn't add the option", { description: errorMessage(e) });
    }
  };

  const addOptionValue = async (type: AdminOptionType) => {
    const value = (newOptionValues[type.id] ?? "").trim();
    if (!value) return;
    try {
      const created = await createAdminOptionValue(
        {
          option_type: type.id,
          value,
          position: (optionValues[type.id] ?? []).length,
        },
        tenantSlug,
      );
      setOptionValues((current) => ({
        ...current,
        [type.id]: [...(current[type.id] ?? []), created],
      }));
      setNewOptionValues((current) => ({ ...current, [type.id]: "" }));
      toast.success("Option value added");
    } catch (e) {
      toast.error("Couldn't add the option value", { description: errorMessage(e) });
    }
  };

  const generateVariants = async () => {
    if (!product) return;
    const price = Number(generatePrice);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a default price greater than 0");
      return;
    }
    setDataLoading(true);
    try {
      await generateAdminVariants(
        product.id,
        {
          default_price: price.toFixed(2),
          ...(skuPrefix.trim() ? { sku_prefix: skuPrefix.trim() } : {}),
        },
        tenantSlug,
      );
      await reloadData(product);
      toast.success("Variants generated");
    } catch (e) {
      toast.error("Couldn't generate variants", { description: errorMessage(e) });
    } finally {
      setDataLoading(false);
    }
  };

  const addImage = async (publicId: string, altText: string) => {
    if (!product) return;
    setUploading(true);
    try {
      await createAdminProductImage(
        product.id,
        { public_id: publicId, alt_text: altText, is_primary: images.length === 0 },
        tenantSlug,
      );
      setImagePublicId("");
      await reloadData(product);
      toast.success("Image added");
    } catch (e) {
      toast.error("Couldn't add the image", { description: errorMessage(e) });
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const signature = await getAdminUploadSignature(tenantSlug);
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signature.api_key);
      form.append("timestamp", String(signature.timestamp));
      form.append("signature", signature.signature);
      form.append("folder", signature.folder);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
        { method: "POST", body: form },
      );
      if (!response.ok) throw new Error("Cloudinary upload failed.");
      const uploaded = (await response.json()) as { public_id?: string };
      if (!uploaded.public_id) throw new Error("Cloudinary did not return a public ID.");
      await addImage(uploaded.public_id, file.name);
    } catch (e) {
      toast.error("Couldn't upload the image", { description: errorMessage(e) });
    }
  };

  const togglePrimary = async (image: AdminProductImage) => {
    try {
      await makeAdminProductImagePrimary(image.id, tenantSlug);
      setImages((rows) => rows.map((row) => ({ ...row, is_primary: row.id === image.id })));
      toast.success("Primary image updated");
    } catch (e) {
      toast.error("Couldn't update the image", { description: errorMessage(e) });
    }
  };

  const removeImage = async (image: AdminProductImage) => {
    try {
      await deleteAdminProductImage(image.id, tenantSlug);
      setImages((rows) => rows.filter((row) => row.id !== image.id));
      toast.success("Image removed");
    } catch (e) {
      toast.error("Couldn't remove the image", { description: errorMessage(e) });
    }
  };

  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Edit product</DialogTitle>
          <DialogDescription>
            Manage product details, options, variants and images.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <form className="space-y-4" onSubmit={(event) => void submit(event)}>
              <div className="space-y-1.5">
                <Label htmlFor="pm-title">Title</Label>
                <Input
                  id="pm-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pm-description">Description</Label>
                <Textarea
                  id="pm-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pm-discount">Discount (%)</Label>
                  <Input
                    id="pm-discount"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-xs text-muted-foreground">
                    Show this product on your storefront.
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="options" className="mt-4 space-y-4">
            {dataLoading && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading options…
              </p>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Option name (e.g. Size)"
                value={newOptionType}
                onChange={(event) => setNewOptionType(event.target.value)}
              />
              <Button onClick={() => void addOptionType()} disabled={!newOptionType.trim()}>
                Add option
              </Button>
            </div>
            <div className="space-y-3">
              {optionTypes.map((type) => (
                <div key={type.id} className="rounded-lg border p-4">
                  <p className="text-sm font-semibold">{type.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(optionValues[type.id] ?? []).map((value) => (
                      <Badge key={value.id} variant="secondary">
                        {value.value}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Add a value"
                      value={newOptionValues[type.id] ?? ""}
                      onChange={(event) =>
                        setNewOptionValues((current) => ({
                          ...current,
                          [type.id]: event.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => void addOptionValue(type)}
                      disabled={!(newOptionValues[type.id] ?? "").trim()}
                    >
                      Add value
                    </Button>
                  </div>
                </div>
              ))}
              {!dataLoading && optionTypes.length === 0 && (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  Add options like Size or Color, then generate variants.
                </p>
              )}
            </div>
            <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pm-generate-price">Default variant price</Label>
                <Input
                  id="pm-generate-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={generatePrice}
                  onChange={(event) => setGeneratePrice(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pm-sku-prefix">SKU prefix (optional)</Label>
                <Input
                  id="pm-sku-prefix"
                  placeholder="SKU"
                  value={skuPrefix}
                  onChange={(event) => setSkuPrefix(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={() => void generateVariants()} disabled={dataLoading}>
                  <Sparkles className="h-4 w-4" /> Generate variants
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="mt-4">
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No variants yet. Add options and generate them.
                      </TableCell>
                    </TableRow>
                  ) : (
                    variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {variant.options.map((option) => option.value).join(" / ") || "Standard"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(Number(variant.price))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={variant.is_active ? "secondary" : "outline"}>
                            {variant.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openVariant(variant)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder="Cloudinary public ID (optional)"
                  value={imagePublicId}
                  onChange={(event) => setImagePublicId(event.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={uploading || !imagePublicId.trim()}
                  onClick={() => void addImage(imagePublicId.trim(), imagePublicId.trim())}
                >
                  Add by ID
                </Button>
              </div>
              <Label className="cursor-pointer rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadImage(file);
                    event.target.value = "";
                  }}
                />
                {uploading ? "Uploading…" : "Upload image"}
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="rounded-lg border p-2">
                  <img
                    src={image.urls["card"] ?? Object.values(image.urls)[0]}
                    alt={image.alt_text}
                    className="h-28 w-full rounded-md object-cover"
                  />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Make ${image.alt_text || "image"} primary`}
                      onClick={() => void togglePrimary(image)}
                    >
                      <Star
                        className={`h-4 w-4 ${image.is_primary ? "fill-primary text-primary" : ""}`}
                      />
                    </Button>
                    <Badge variant={image.is_primary ? "secondary" : "outline"}>
                      {image.is_primary ? "Primary" : "Gallery"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove image"
                      onClick={() => void removeImage(image)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {images.length === 0 && !uploading && (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                <ImageIcon className="h-5 w-5" /> No images added yet.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={variantEdit !== null} onOpenChange={(open) => !open && setVariantEdit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit variant</DialogTitle>
              <DialogDescription>{variantEdit?.sku}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="variant-sku">SKU</Label>
                <Input
                  id="variant-sku"
                  value={variantForm.sku}
                  onChange={(event) =>
                    setVariantForm((current) => ({ ...current, sku: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="variant-price">Price</Label>
                  <Input
                    id="variant-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={variantForm.price}
                    onChange={(event) =>
                      setVariantForm((current) => ({ ...current, price: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="variant-cost">Cost price</Label>
                  <Input
                    id="variant-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={variantForm.costPrice}
                    onChange={(event) =>
                      setVariantForm((current) => ({ ...current, costPrice: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Allow customers to buy this variant.
                  </p>
                </div>
                <Switch
                  checked={variantForm.active}
                  onCheckedChange={(active) =>
                    setVariantForm((current) => ({ ...current, active }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setVariantEdit(null)}
                disabled={savingVariant}
              >
                Cancel
              </Button>
              <Button onClick={() => void saveVariant()} disabled={savingVariant}>
                {savingVariant ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save variant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
