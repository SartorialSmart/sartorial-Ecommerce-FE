import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
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
import {
  createAdminCoupon,
  deleteAdminCoupon,
  listAdminCoupons,
  listCouponCategories,
  updateAdminCoupon,
  type AdminCoupon,
  type AdminCouponDiscountType,
  type AdminCouponInput,
} from "@/lib/api/promotions";
import { formatCurrency } from "@/lib/currency";

interface CouponManagementTabProps {
  tenantSlug: string | null;
  refreshKey?: number;
}

type CouponStatus = "Active" | "Scheduled" | "Expired" | "Exhausted" | "Inactive";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request failed.";
}

function toDateInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function couponStatus(coupon: AdminCoupon, now: number): CouponStatus {
  if (!coupon.is_active) return "Inactive";
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return "Exhausted";
  if (coupon.valid_until && new Date(coupon.valid_until).getTime() < now) return "Expired";
  if (coupon.valid_from && new Date(coupon.valid_from).getTime() > now) return "Scheduled";
  return "Active";
}

function statusVariant(status: CouponStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Active") return "default";
  if (status === "Scheduled") return "secondary";
  if (status === "Expired" || status === "Exhausted" || status === "Inactive") return "outline";
  return "secondary";
}

function discountLabel(coupon: AdminCoupon): string {
  if (coupon.discount_type === "fixed") return `${formatCurrency(Number(coupon.value))} off`;
  return `${coupon.value}% off`;
}

export function CouponManagementTab({ tenantSlug, refreshKey = 0 }: CouponManagementTabProps) {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<AdminCouponDiscountType>("percentage");
  const [value, setValue] = useState("");
  const [minSpend, setMinSpend] = useState("0");
  const [categoryId, setCategoryId] = useState("none");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [stackable, setStackable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [couponList, categoryRows] = await Promise.all([
      listAdminCoupons(tenantSlug),
      listCouponCategories(tenantSlug),
    ]);
    setCoupons(couponList.results);
    setCategories(
      categoryRows.map((category) => ({ id: String(category.id), name: category.name })),
    );
  }, [tenantSlug]);

  useEffect(() => {
    if (!tenantSlug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    reload()
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload, refreshKey, tenantSlug]);

  const now = Date.now();
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return coupons.filter((coupon) => {
      if (needle && !`${coupon.code} ${coupon.description}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (typeFilter !== "all" && coupon.discount_type !== typeFilter) return false;
      if (statusFilter === "active" && couponStatus(coupon, now) !== "Active") return false;
      if (statusFilter === "inactive" && couponStatus(coupon, now) === "Active") return false;
      return true;
    });
  }, [coupons, now, search, statusFilter, typeFilter]);

  const activeCount = coupons.filter((coupon) => couponStatus(coupon, now) === "Active").length;
  const totalUses = coupons.reduce((sum, coupon) => sum + coupon.used_count, 0);
  const exhaustedCount = coupons.filter(
    (coupon) => coupon.max_uses !== null && coupon.used_count >= coupon.max_uses,
  ).length;

  const openForm = (coupon: AdminCoupon | null) => {
    setEditing(coupon);
    setCode(coupon?.code ?? "");
    setDescription(coupon?.description ?? "");
    setDiscountType(coupon?.discount_type ?? "percentage");
    setValue(coupon?.value ?? "");
    setMinSpend(coupon?.min_spend ?? "0");
    setCategoryId(coupon?.category ?? "none");
    setValidFrom(toDateInput(coupon?.valid_from ?? null));
    setValidUntil(toDateInput(coupon?.valid_until ?? null));
    setMaxUses(
      coupon?.max_uses === null || coupon?.max_uses === undefined ? "" : String(coupon.max_uses),
    );
    setIsActive(coupon?.is_active ?? true);
    setFirstOrderOnly(coupon?.first_order_only ?? false);
    setStackable(coupon?.stackable ?? true);
    setDialogOpen(true);
  };

  const saveCoupon = async (event: FormEvent) => {
    event.preventDefault();
    if (!tenantSlug || saving) return;
    const amount = Number(value);
    const spend = Number(minSpend || "0");
    const uses = maxUses.trim() === "" ? null : Number(maxUses);
    if (!code.trim()) {
      toast.error("Add a coupon code");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a discount value above zero");
      return;
    }
    if (!Number.isFinite(spend) || spend < 0) {
      toast.error("Minimum spend cannot be negative");
      return;
    }
    if (uses !== null && (!Number.isInteger(uses) || uses < 1)) {
      toast.error("Maximum uses must be a positive whole number");
      return;
    }
    const fromIso = toIso(validFrom);
    const untilIso = toIso(validUntil);
    if (fromIso && untilIso && new Date(fromIso).getTime() > new Date(untilIso).getTime()) {
      toast.error("End date must be after start date");
      return;
    }
    const input: AdminCouponInput = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discount_type: discountType,
      value: String(amount),
      is_active: isActive,
      valid_from: fromIso,
      valid_until: untilIso,
      min_spend: String(spend),
      category: categoryId === "none" ? null : categoryId,
      first_order_only: firstOrderOnly,
      stackable,
      max_uses: uses,
    };
    setSaving(true);
    try {
      if (editing) await updateAdminCoupon(editing.id, input, tenantSlug);
      else await createAdminCoupon(input, tenantSlug);
      toast.success(editing ? "Coupon updated" : "Coupon created");
      setDialogOpen(false);
      await reload();
    } catch (e) {
      toast.error("Couldn't save coupon", { description: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (coupon: AdminCoupon) => {
    if (!tenantSlug || busyId) return;
    setBusyId(coupon.id);
    try {
      await updateAdminCoupon(coupon.id, { is_active: !coupon.is_active }, tenantSlug);
      toast.success(coupon.is_active ? "Coupon paused" : "Coupon activated");
      await reload();
    } catch (e) {
      toast.error("Couldn't update coupon", { description: errorMessage(e) });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!tenantSlug || !deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await deleteAdminCoupon(deleteTarget.id, tenantSlug);
      toast.success("Coupon deleted");
      setDeleteTarget(null);
      await reload();
    } catch (e) {
      toast.error("Couldn't delete coupon", { description: errorMessage(e) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-sm text-muted-foreground">All Coupons</div>
          <div className="mt-2 font-display text-2xl font-bold">{coupons.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-sm text-muted-foreground">Exhausted</div>
          <div className="mt-2 font-display text-2xl font-bold">{exhaustedCount}</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-sm text-muted-foreground">Total Redemptions</div>
          <div className="mt-2 font-display text-2xl font-bold">{totalUses}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Coupons</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage discounts for this storefront.
            </p>
          </div>
          <Button onClick={() => openForm(null)}>
            <Plus className="mr-2 h-4 w-4" />
            New Coupon
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search code or description..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Not active</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="md:w-44">
              <SelectValue placeholder="Discount type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <div className="p-4 text-sm text-destructive">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading coupons...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <Tag className="h-6 w-6" />
            No coupons match this view.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coupon</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((coupon) => {
                const status = couponStatus(coupon, now);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="font-medium">{coupon.code}</div>
                      <div className="text-xs text-muted-foreground">
                        {coupon.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>{discountLabel(coupon)}</TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        Min {formatCurrency(Number(coupon.min_spend))}
                        {coupon.first_order_only ? " · first order" : ""}
                        {coupon.stackable ? " · stackable" : " · exclusive"}
                        {coupon.valid_until
                          ? ` · ends ${new Date(coupon.valid_until).toLocaleDateString()}`
                          : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.used_count}
                      {coupon.max_uses !== null ? ` / ${coupon.max_uses}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(status)}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={coupon.is_active}
                          disabled={busyId === coupon.id}
                          onCheckedChange={() => void toggleCoupon(coupon)}
                          aria-label={`Toggle ${coupon.code}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(coupon)}
                          aria-label={`Edit ${coupon.code}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(coupon)}
                          aria-label={`Delete ${coupon.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.code}` : "New Coupon"}</DialogTitle>
            <DialogDescription>
              Conditions are checked against the cart before the discount is applied.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveCoupon} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Code</Label>
              <Input
                id="coupon-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="WELCOME10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-description">Description</Label>
              <Input
                id="coupon-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Welcome offer"
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={discountType}
                onValueChange={(next) => setDiscountType(next as AdminCouponDiscountType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-value">
                {discountType === "fixed" ? "Amount Off" : "Percentage"}
              </Label>
              <Input
                id="coupon-value"
                type="number"
                min="0"
                step={discountType === "fixed" ? "0.01" : "1"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-min-spend">Minimum Spend</Label>
              <Input
                id="coupon-min-spend"
                type="number"
                min="0"
                step="0.01"
                value={minSpend}
                onChange={(event) => setMinSpend(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-valid-from">Valid From</Label>
              <Input
                id="coupon-valid-from"
                type="datetime-local"
                value={validFrom}
                onChange={(event) => setValidFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-valid-until">Valid Until</Label>
              <Input
                id="coupon-valid-until"
                type="datetime-local"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-max-uses">Maximum Uses</Label>
              <Input
                id="coupon-max-uses"
                type="number"
                min="1"
                step="1"
                value={maxUses}
                onChange={(event) => setMaxUses(event.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Pause without deleting the coupon.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
              <div>
                <Label>First Order Only</Label>
                <p className="text-xs text-muted-foreground">Restrict to new customers.</p>
              </div>
              <Switch checked={firstOrderOnly} onCheckedChange={setFirstOrderOnly} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
              <div>
                <Label>Stackable</Label>
                <p className="text-xs text-muted-foreground">Allow combining with other coupons.</p>
              </div>
              <Switch checked={stackable} onCheckedChange={setStackable} />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the coupon from the storefront. Redemption history is not rolled back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busyId !== null}
              onClick={() => void confirmDelete()}
            >
              {busyId !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
