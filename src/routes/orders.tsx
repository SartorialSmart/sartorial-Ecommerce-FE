import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LogOut, Package, RotateCcw, Search, Truck } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listMyStores } from "@/lib/api/catalog";
import {
  getAdminOrder,
  listAdminOrderInquiries,
  listAdminOrdersPage,
  markAdminOrderShipped,
  refundAdminOrder,
  transitionAdminOrder,
  type AdminOrder,
  type AdminOrderInquiry,
} from "@/lib/api/orders";
import type { TenantStore } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/use-auth";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/orders")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search["search"] === "string" ? search["search"] : "",
    status: typeof search["status"] === "string" ? search["status"] : "all",
  }),
  head: () => ({
    meta: [
      {
        title: "Orders — Sartorial",
        name: "description",
        content: "Manage your store's orders, shipments and customer inquiries.",
      },
      { property: "og:title", content: "Orders — Sartorial" },
      { property: "og:description", content: "Manage your store's orders and shipments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

const STATUSES = [
  "pending",
  "paid",
  "routing",
  "partially_fulfilled",
  "fulfilled",
  "completed",
  "cancelled",
  "refunded",
] as const;

const NEXT_STATUSES: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["routing", "refunded", "cancelled"],
  routing: ["partially_fulfilled", "fulfilled", "cancelled"],
  partially_fulfilled: ["fulfilled", "refunded"],
  fulfilled: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid",
  routing: "Processing",
  partially_fulfilled: "Partially fulfilled",
  fulfilled: "Fulfilled",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-destructive/10 text-destructive",
  paid: "bg-accent text-accent-foreground",
  routing: "bg-chart-2/15 text-foreground",
  partially_fulfilled: "bg-chart-3/15 text-foreground",
  fulfilled: "bg-leaf/15 text-leaf",
  completed: "bg-leaf/15 text-leaf",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-muted text-muted-foreground",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request failed.";
}

function OrdersPage() {
  const navigate = useNavigate();
  const { user, status, logout } = useAuth();
  const routeSearch = Route.useSearch();
  const canManage = user?.role === "seller" || user?.role === "admin";

  const [stores, setStores] = useState<TenantStore[]>([]);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [tab, setTab] = useState("orders");
  const [search, setSearch] = useState(routeSearch.search);
  const [statusFilter, setStatusFilter] = useState(routeSearch.status);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<AdminOrderInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shipFormOpen, setShipFormOpen] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") void navigate({ to: "/login" });
  }, [status, navigate]);

  useEffect(() => {
    if (status !== "authenticated" || !canManage) return;
    let cancelled = false;
    listMyStores()
      .then((myStores) => {
        if (cancelled) return;
        setStores(myStores);
        if (myStores.length === 0) {
          void navigate({ to: "/setup" });
          return;
        }
        setStoreSlug((current) => current ?? myStores[0]?.slug ?? null);
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [status, canManage, navigate]);

  useEffect(() => {
    if (!storeSlug || !canManage) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      listAdminOrdersPage(storeSlug, {
        page,
        page_size: 50,
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
        .then((list) => {
          if (cancelled) return;
          setOrders((rows) => {
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
  }, [storeSlug, canManage, search, statusFilter, page]);

  useEffect(() => {
    if (tab !== "inquiries" || !storeSlug || !canManage) return;
    let cancelled = false;
    setInquiriesLoading(true);
    listAdminOrderInquiries(storeSlug)
      .then((rows) => {
        if (!cancelled) setInquiries(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setInquiriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, storeSlug, canManage]);

  const updateOrder = (updated: AdminOrder) => {
    setSelected(updated);
    setOrders((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
  };

  const openOrder = (order: AdminOrder) => {
    if (!storeSlug) return;
    setSelected(order);
    setShipFormOpen(false);
    setRefundOpen(false);
    setDetailLoading(true);
    getAdminOrder(order.number, storeSlug)
      .then((fresh) => setSelected(fresh))
      .catch((e) => toast.error("Couldn't load order details", { description: errorMessage(e) }))
      .finally(() => setDetailLoading(false));
  };

  const runAction = async (action: () => Promise<AdminOrder>, success: string) => {
    if (!storeSlug || busy) return;
    setBusy(true);
    try {
      const updated = await action();
      updateOrder(updated);
      toast.success(success);
      setShipFormOpen(false);
      setRefundOpen(false);
    } catch (e) {
      toast.error("Couldn't update the order", { description: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  const handleRefund = async () => {
    if (!selected || !storeSlug) return;
    await runAction(() => refundAdminOrder(selected.number, storeSlug), "Order refunded");
  };

  const handleSignOut = async () => {
    await logout();
    toast.success("Signed out");
    void navigate({ to: "/" });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading your orders…
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.full_name.trim() || user.email;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-ink text-ink-foreground">
        <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <Button asChild variant="ghost" size="sm" className="text-ink-foreground">
              <Link to="/dashboard" search={{}}>
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-muted sm:inline">
              {stores.find((s) => s.slug === storeSlug)?.name ?? "Your store"}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <button
              className="rounded-md p-2 hover:bg-ink-line"
              aria-label="Sign out"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track, fulfill and manage every order in your store.
            </p>
          </div>
          {stores.length > 1 && (
            <Select value={storeSlug ?? ""} onValueChange={setStoreSlug}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.slug} value={store.slug}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!canManage ? (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            Order management is only available to seller and admin accounts.
          </div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
                <div className="relative min-w-52 flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search order number or customer email"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-hidden rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden sm:table-cell">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          <Loader2 className="mx-auto h-4 w-4 animate-spin" /> Loading orders…
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No orders match your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <p className="font-mono text-xs font-semibold">{order.number}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.created_at)}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p className="truncate">{order.contact_name || "—"}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {order.contact_email || order.payer_email}
                            </p>
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                            {order.lines.length}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {formatCurrency(Number(order.total_charged || order.total_base))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={STATUS_STYLES[order.status] ?? undefined}
                            >
                              {STATUS_LABELS[order.status] ?? order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openOrder(order)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Showing {orders.length} of {total} orders
                </p>
                {hasMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Load More
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inquiries" className="mt-6">
              <div className="overflow-hidden rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Context</TableHead>
                      <TableHead className="hidden md:table-cell">Note</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiriesLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          <Loader2 className="mx-auto h-4 w-4 animate-spin" /> Loading inquiries…
                        </TableCell>
                      </TableRow>
                    ) : inquiries.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No customer inquiries yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="text-sm font-medium">
                            {inquiry.customer_name || "—"}
                            <p className="text-xs text-muted-foreground">
                              {inquiry.customer_phone}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm capitalize">{inquiry.channel}</TableCell>
                          <TableCell className="text-sm capitalize">{inquiry.context}</TableCell>
                          <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground md:table-cell">
                            {inquiry.note || inquiry.summary}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {formatDate(inquiry.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">Order {selected.number}</SheetTitle>
                <SheetDescription>
                  Placed {formatDate(selected.created_at)} · {selected.lines.length}{" "}
                  {selected.lines.length === 1 ? "item" : "items"}
                </SheetDescription>
              </SheetHeader>

              {detailLoading && (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Refreshing order…
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={STATUS_STYLES[selected.status] ?? undefined}>
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </Badge>
                {selected.paid_at && (
                  <span className="text-xs text-muted-foreground">
                    Paid {formatDate(selected.paid_at)}
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {selected.contact_name || selected.payer_name || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selected.contact_email || selected.payer_email}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Paid by {selected.paid_by_label || "—"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shipping
                  </p>
                  <p className="mt-2 text-sm">{selected.ship_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {[
                      selected.ship_line1,
                      selected.ship_line2,
                      selected.ship_city,
                      selected.ship_region,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[selected.ship_postal_code, selected.ship_country].filter(Boolean).join(" ")}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-display text-sm font-bold">Items</h3>
                <div className="mt-3 divide-y rounded-lg border">
                  {selected.lines.map((line) => (
                    <div key={line.id} className="flex items-center gap-3 p-3">
                      {line.image ? (
                        <img
                          src={line.image}
                          alt=""
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{line.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {line.variant_options || line.sku}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty {line.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(Number(line.line_total_charged || line.line_total_base))}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(Number(selected.subtotal_charged || selected.subtotal_base))}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span>
                      -{formatCurrency(Number(selected.discount_charged || selected.discount_base))}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT</span>
                    <span>{formatCurrency(Number(selected.vat_charged || selected.vat_base))}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(Number(selected.total_charged || selected.total_base))}
                    </span>
                  </div>
                  {selected.coupon_codes.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Coupons: {selected.coupon_codes.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {selected.shipments.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-display text-sm font-bold">Shipments</h3>
                  <div className="mt-3 space-y-2">
                    {selected.shipments.map((shipment, index) => (
                      <div
                        key={`${shipment.tracking_number}-${index}`}
                        className="rounded-lg border p-3 text-sm"
                      >
                        <p className="font-medium">
                          {shipment.carrier || "Carrier not set"} · {shipment.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {shipment.tracking_number || "No tracking number"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4 border-t pt-6">
                <h3 className="font-display text-sm font-bold">Manage Order</h3>
                {(NEXT_STATUSES[selected.status] ?? []).length > 0 && (
                  <div className="space-y-1.5">
                    <Label>Move To Status</Label>
                    <Select
                      value=""
                      disabled={busy}
                      onValueChange={(value) =>
                        void runAction(
                          () => transitionAdminOrder(selected.number, value, storeSlug),
                          `Order moved to ${STATUS_LABELS[value] ?? value}`,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose next status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(NEXT_STATUSES[selected.status] ?? []).map((value) => (
                          <SelectItem key={value} value={value}>
                            {STATUS_LABELS[value] ?? value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {["paid", "routing", "partially_fulfilled", "fulfilled"].includes(
                  selected.status,
                ) && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShipFormOpen((open) => !open)}
                    >
                      <Truck className="h-4 w-4" /> Mark As Shipped
                    </Button>
                    {shipFormOpen && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="order-carrier">Carrier</Label>
                          <Input
                            id="order-carrier"
                            placeholder="DHL, FedEx, local courier"
                            value={carrier}
                            onChange={(event) => setCarrier(event.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="order-tracking">Tracking Number</Label>
                          <Input
                            id="order-tracking"
                            value={trackingNumber}
                            onChange={(event) => setTrackingNumber(event.target.value)}
                          />
                        </div>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void runAction(
                              () =>
                                markAdminOrderShipped(
                                  selected.number,
                                  { carrier, tracking_number: trackingNumber },
                                  storeSlug,
                                ),
                              "Order marked as shipped",
                            )
                          }
                        >
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Shipment
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {(NEXT_STATUSES[selected.status] ?? []).includes("refunded") && (
                  <Button variant="destructive" size="sm" onClick={() => setRefundOpen(true)}>
                    <RotateCcw className="h-4 w-4" /> Refund Order
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund {selected?.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              The order will be marked refunded. Process the refund with your payment provider
              separately if required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy || !selected || !storeSlug}
              onClick={() => void handleRefund()}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Refund Order
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
