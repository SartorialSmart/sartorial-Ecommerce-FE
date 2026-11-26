import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bell, ChevronUp, Crown, LogOut, Package, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { AddProductDialog } from "@/components/dashboard/add-product-dialog";
import { CouponManagementTab } from "@/components/dashboard/coupon-management";
import { PlanBillingTab, StoreSettingsTab, TeamTab } from "@/components/dashboard/dashboard-tabs";
import { ErpLinkCard } from "@/components/dashboard/erp-link-card";
import { InvoiceManagementTab } from "@/components/dashboard/invoice-management";
import { InventoryManagementTab } from "@/components/dashboard/inventory-management";
import { ProductManagementTab } from "@/components/dashboard/product-management";
import { SalesReportingTab } from "@/components/dashboard/sales-reporting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/lib/api/analytics";
import { listMyStores } from "@/lib/api/catalog";
import { listAdminOrders, type AdminOrder } from "@/lib/api/orders";
import type { TenantStore } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/use-auth";
import { formatCompactCurrency, formatCurrency } from "@/lib/currency";
import { storefrontUrl } from "@/lib/storefront-host";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Shop Owner Dashboard — Sartorial",
        name: "description",
        content:
          "Track revenue, orders, inventory and sales channels for your fashion label in the Sartorial shop owner dashboard.",
      },
      { property: "og:title", content: "Shop Owner Dashboard — Sartorial" },
      {
        property: "og:description",
        content: "Track revenue, orders, inventory and sales channels for your fashion label.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const statusStyles: Record<string, string> = {
  fulfilled: "bg-leaf/15 text-leaf",
  processing: "bg-accent text-accent-foreground",
  shipped: "bg-adire/15 text-adire",
  pending: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const channelBars = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4"];

function DashboardPage() {
  const navigate = useNavigate();
  const { user, status, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [tab, setTab] = useState("overview");
  const [headerSearch, setHeaderSearch] = useState("");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productsVersion, setProductsVersion] = useState(0);
  const [inventoryVersion, setInventoryVersion] = useState(0);
  const [stores, setStores] = useState<TenantStore[]>([]);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      void navigate({ to: "/login" });
    }
  }, [status, navigate]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    setDataLoading(true);
    listMyStores()
      .then((myStores) => {
        if (cancelled) return;
        setStores(myStores);
        if (myStores.length === 0) {
          // No store yet — send the account through onboarding to claim one.
          void navigate({ to: "/setup" });
          return;
        }
        setStoreSlug((current) => current ?? myStores[0]?.slug ?? null);
      })
      .catch((e) => {
        if (!cancelled) setDataError(e instanceof Error ? e.message : "Failed to load stores.");
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, navigate]);

  useEffect(() => {
    if (status !== "authenticated" || !storeSlug) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    Promise.all([getAnalyticsSummary(storeSlug), listAdminOrders(storeSlug, { limit: 6 })])
      .then(([summary, recent]) => {
        if (cancelled) return;
        setAnalytics(summary);
        setOrders(recent);
      })
      .catch((e) => {
        if (!cancelled)
          setDataError(e instanceof Error ? e.message : "Failed to load dashboard data.");
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, storeSlug]);

  const stats = useMemo(() => {
    const k = analytics?.kpis;
    const revenue = k ? Number(k.revenue) : null;
    const avg = k ? Number(k.avg_order_value) : null;
    return [
      {
        label: "Revenue",
        value: revenue !== null ? formatCompactCurrency(revenue) : "—",
        note: k ? `${k.paid_orders} paid orders` : "No data yet",
      },
      {
        label: "Orders",
        value: k ? String(k.orders) : "—",
        note: k ? `${k.paid_orders} paid` : "No data yet",
      },
      {
        label: "Avg. Order Value",
        value: avg !== null ? formatCompactCurrency(avg) : "—",
        note: k ? `${k.customers} customers` : "No data yet",
      },
      {
        label: "Products",
        value: k ? String(k.products) : "—",
        note: k ? `${k.low_stock} low stock` : "No data yet",
      },
    ];
  }, [analytics]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading your dashboard…
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.full_name.trim() || user.email;
  const firstName = displayName.split(/\s+/)[0] ?? displayName;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const handleSignOut = async () => {
    await logout();
    toast.success("Signed out");
    void navigate({ to: "/" });
  };

  const revenueSeries = (analytics?.revenue_by_day ?? []).map((d) => ({
    week: d.date.slice(5),
    revenue: Number(d.revenue),
  }));
  // Real trend: last half of the 14-day window vs the first half.
  const trendBadge = (() => {
    const series = analytics?.revenue_by_day ?? [];
    if (series.length < 14) return null;
    const half = Math.floor(series.length / 2);
    const previous = series.slice(0, half).reduce((sum, d) => sum + Number(d.revenue), 0);
    const latest = series.slice(half).reduce((sum, d) => sum + Number(d.revenue), 0);
    if (previous <= 0) return null;
    const pct = Math.round(((latest - previous) / previous) * 100);
    return `${pct >= 0 ? "+" : ""}${pct}% vs prior 7 days`;
  })();
  const fulfillment = analytics?.fulfillment_split ?? [];
  const fulfillmentTotal = fulfillment.reduce((s, f) => s + f.quantity, 0) || 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-ink text-ink-foreground">
        <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <Select value={storeSlug ?? ""} onValueChange={(v) => setStoreSlug(v || null)}>
              <SelectTrigger className="w-44 border-ink-line bg-transparent text-ink-foreground sm:w-56">
                <SelectValue placeholder={stores.length ? "Select store" : "No stores yet"} />
              </SelectTrigger>
              <SelectContent>
                {stores.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No stores linked
                  </SelectItem>
                ) : (
                  stores.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <form
            className="hidden items-center gap-2 rounded-md border border-ink-line px-3 py-2 text-xs text-ink-muted md:flex md:w-64"
            onSubmit={(event) => {
              event.preventDefault();
              void navigate({
                to: "/orders",
                search: { search: headerSearch.trim(), status: "all" },
              });
            }}
          >
            <Search className="h-3.5 w-3.5" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-ink-muted"
              placeholder="Search orders…"
              aria-label="Search orders"
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
            />
          </form>
          <div className="flex items-center gap-3">
            <button className="rounded-md p-2 hover:bg-ink-line" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5" />
            </button>
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
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here’s what’s happening in your store.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href={storefrontUrl(storeSlug ?? "your-store")} target="_blank" rel="noreferrer">
                View Storefront
              </a>
            </Button>
            <Button onClick={() => setAddProductOpen(true)}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {dataError && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {dataError}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">
                {dataLoading && !analytics ? "…" : s.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="sales">Sales &amp; Invoices</TabsTrigger>
            <TabsTrigger value="sales-reporting">Sales Reporting</TabsTrigger>
            <TabsTrigger value="erp">ERP Link</TabsTrigger>
            <TabsTrigger value="settings">Store Settings</TabsTrigger>

            <TabsTrigger value="plan">Plan &amp; Billing</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Revenue — Last 14 Days</h2>
                  {trendBadge && <Badge variant="secondary">{trendBadge}</Badge>}
                </div>
                <div className="mt-4 h-72">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueSeries}
                        margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                      >
                        <defs>
                          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="week"
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          stroke="var(--muted-foreground)"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          stroke="var(--muted-foreground)"
                          tickFormatter={(v) => formatCompactCurrency(Number(v))}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--chart-1)"
                          strokeWidth={2.5}
                          fill="url(#revFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full animate-pulse rounded-lg bg-muted" />
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display text-lg font-bold">Fulfillment Split</h2>
                <div className="mt-5 space-y-4">
                  {fulfillment.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No fulfillment data yet.</p>
                  ) : (
                    fulfillment.map((c, i) => {
                      const share = Math.round((c.quantity / fulfillmentTotal) * 100);
                      return (
                        <div key={c.type}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="capitalize">{c.type.replace(/_/g, " ")}</span>
                            <span className="font-semibold">{share}%</span>
                          </div>
                          <div className="mt-1.5 h-2 rounded-full bg-muted">
                            <div
                              className={`h-2 rounded-full ${channelBars[i % channelBars.length]}`}
                              style={{ width: `${share}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border bg-card lg:col-span-2">
                <div className="flex items-center justify-between p-6 pb-2">
                  <h2 className="font-display text-lg font-bold">Recent Orders</h2>
                  <Button asChild variant="ghost" size="sm" className="text-primary">
                    <Link to="/orders" search={{ search: "", status: "all" }}>
                      View All
                    </Link>
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden sm:table-cell">Item</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">
                            <Link
                              to="/orders"
                              search={{ search: o.number, status: "all" }}
                              className="hover:underline"
                            >
                              {o.number}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">
                            {o.contact_name || o.contact_email || "—"}
                          </TableCell>
                          <TableCell className="hidden text-sm sm:table-cell">
                            {o.lines[0]?.title ?? "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {formatCurrency(Number(o.total_charged || o.total_base || 0))}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`inline-block rounded-md px-2 py-1 text-[11px] font-semibold ${statusStyles[o.status] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {o.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold">Top Products</h2>
                  <div className="mt-4 space-y-3">
                    {(analytics?.top_products ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No product data yet.</p>
                    ) : (
                      (analytics?.top_products ?? []).slice(0, 5).map((p) => (
                        <div key={p.title} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">{p.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{p.quantity} sold</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold">Quick Actions</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      className="h-auto flex-col gap-1 py-3 text-xs"
                      onClick={() => setAddProductOpen(true)}
                    >
                      <Plus className="h-4 w-4" /> Add Product
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-auto flex-col gap-1 py-3 text-xs"
                      onClick={() => setTab("team")}
                    >
                      <Users className="h-4 w-4" /> Invite Teammate
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-auto flex-col gap-1 py-3 text-xs"
                      onClick={() => setTab("plan")}
                    >
                      <Crown className="h-4 w-4" /> Upgrade Plan
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="h-auto flex-col gap-1 py-3 text-xs"
                    >
                      <Link to="/designer" search={{ template: undefined }}>
                        <ChevronUp className="h-4 w-4" /> Open Designer
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductManagementTab
              tenantSlug={storeSlug}
              refreshKey={productsVersion}
              onAddProduct={() => setAddProductOpen(true)}
            />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <InventoryManagementTab tenantSlug={storeSlug} refreshKey={inventoryVersion} />
          </TabsContent>

          <TabsContent value="coupons" className="mt-6">
            <CouponManagementTab tenantSlug={storeSlug} />
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <InvoiceManagementTab tenantSlug={storeSlug} />
          </TabsContent>

          <TabsContent value="sales-reporting" className="mt-6">
            <SalesReportingTab tenantSlug={storeSlug} />
          </TabsContent>

          <TabsContent value="erp" className="mt-6">
            <ErpLinkCard tenantSlug={storeSlug} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <StoreSettingsTab tenantSlug={storeSlug} />
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <PlanBillingTab tenantSlug={storeSlug} />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <TeamTab tenantSlug={storeSlug} />
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Copyright - {new Date().getFullYear()} Sartorial Ecommerce
        </p>
      </main>
      <AddProductDialog
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onCreated={() => {
          setProductsVersion((version) => version + 1);
          setInventoryVersion((version) => version + 1);
        }}
      />
    </div>
  );
}
