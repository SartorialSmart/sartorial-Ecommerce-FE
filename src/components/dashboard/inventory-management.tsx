import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Loader2, PackageCheck, Pencil, Search } from "lucide-react";
import { toast } from "sonner";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAdminProducts } from "@/lib/api/catalog";
import {
  listAdminStock,
  listAdminVariants,
  setAdminStock,
  type AdminStockItem,
  type AdminVariant,
} from "@/lib/api/inventory";

interface InventoryManagementTabProps {
  tenantSlug: string | null;
  refreshKey?: number;
}

interface InventoryRow {
  variant: AdminVariant;
  stock: AdminStockItem | null;
  productTitle: string;
  onHand: number;
  reserved: number;
  available: number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request failed.";
}

function optionLabel(variant: AdminVariant): string {
  return variant.options.map((option) => `${option.type}: ${option.value}`).join(" · ");
}

export function InventoryManagementTab({
  tenantSlug,
  refreshKey = 0,
}: InventoryManagementTabProps) {
  const [variants, setVariants] = useState<AdminVariant[]>([]);
  const [productTitles, setProductTitles] = useState<Record<string, string>>({});
  const [stockItems, setStockItems] = useState<AdminStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryRow | null>(null);
  const [quantity, setQuantity] = useState("0");
  const [warehouseCode, setWarehouseCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tenantSlug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([listAdminVariants(tenantSlug), listAdminProducts(tenantSlug, { pageSize: 100 })])
      .then(([variantRows, productList]) => {
        if (cancelled) return;
        setVariants(variantRows);
        setProductTitles(
          Object.fromEntries(productList.results.map((product) => [product.id, product.title])),
        );
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, refreshKey]);

  useEffect(() => {
    if (!tenantSlug) return;
    let cancelled = false;
    listAdminStock(tenantSlug, { search: search.trim() || undefined })
      .then((rows) => {
        if (!cancelled) setStockItems(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, refreshKey, search]);

  const rows = useMemo<InventoryRow[]>(() => {
    const stockByVariant = new Map(stockItems.map((item) => [item.variant, item]));
    return variants
      .filter((variant) => variant.fulfillment_type !== "dropship")
      .map((variant) => {
        const stock = stockByVariant.get(variant.id) ?? null;
        const onHand = stock?.on_hand ?? 0;
        const reserved = stock?.reserved ?? 0;
        return {
          variant,
          stock,
          productTitle: productTitles[variant.product] ?? "Product",
          onHand,
          reserved,
          available: Math.max(onHand - reserved, 0),
        };
      });
  }, [variants, stockItems, productTitles]);

  const visibleRows = rows.filter((row) => {
    if (lowStockOnly && row.available > 5) return false;
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return [row.productTitle, row.variant.sku, optionLabel(row.variant)]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const lowStockCount = rows.filter((row) => row.available <= 5).length;
  const outOfStockCount = rows.filter((row) => row.available <= 0).length;

  const openEditor = (row: InventoryRow) => {
    setEditTarget(row);
    setQuantity(String(row.onHand));
    setWarehouseCode(row.stock?.warehouse_code ?? "");
  };

  const saveStock = async () => {
    if (!tenantSlug || !editTarget) return;
    const parsed = Number(quantity);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error("Enter a whole number of 0 or more");
      return;
    }
    setSaving(true);
    try {
      const updated = await setAdminStock(
        {
          variant: editTarget.variant.id,
          quantity: parsed,
          ...(warehouseCode.trim() ? { warehouse_code: warehouseCode.trim() } : {}),
        },
        tenantSlug,
      );
      setStockItems((current) => [updated, ...current.filter((item) => item.id !== updated.id)]);
      setEditTarget(null);
      toast.success("Stock updated");
    } catch (e) {
      toast.error("Couldn't update stock", { description: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tracked Variants
          </p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
            <Boxes className="h-5 w-5 text-primary" /> {rows.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Low Stock
          </p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-destructive">
            <AlertTriangle className="h-5 w-5" /> {lowStockCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">5 units or fewer available</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sold Out
          </p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-leaf">
            <PackageCheck className="h-5 w-5" /> {outOfStockCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search SKU, product or option"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button
          variant={lowStockOnly ? "secondary" : "outline"}
          size="sm"
          onClick={() => setLowStockOnly((current) => !current)}
        >
          <AlertTriangle className="h-4 w-4" /> Low Stock Only
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Options</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" /> Loading inventory…
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No inventory variants found. Add a product or reload the page.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow key={row.variant.id}>
                  <TableCell className="max-w-48 truncate text-sm font-medium">
                    {row.productTitle}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.variant.sku || "—"}</TableCell>
                  <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                    {optionLabel(row.variant) || "Standard"}
                  </TableCell>
                  <TableCell className="text-right text-sm">{row.onHand}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {row.reserved}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={
                        row.available <= 0
                          ? "bg-destructive/10 text-destructive"
                          : row.available <= 5
                            ? "bg-accent text-accent-foreground"
                            : "bg-leaf/15 text-leaf"
                      }
                    >
                      {row.available}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditor(row)}>
                      <Pencil className="h-3.5 w-3.5" /> Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              {editTarget?.productTitle} · {editTarget?.variant.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="stock-quantity">On-Hand Quantity</Label>
              <Input
                id="stock-quantity"
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock-warehouse">Warehouse Code (Optional)</Label>
              <Input
                id="stock-warehouse"
                placeholder="main"
                value={warehouseCode}
                onChange={(event) => setWarehouseCode(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void saveStock()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
