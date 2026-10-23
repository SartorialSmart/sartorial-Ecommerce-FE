import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  ChevronUp,
  Crown,
  Package,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import {
  PlanBillingTab,
  StoreSettingsTab,
  TeamTab,
} from "@/components/dashboard/dashboard-tabs";
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
import {
  lowStock,
  recentOrders,
  revenueSeries,
  salesChannels,
  type Order,
} from "@/data/catalog";

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
        content:
          "Track revenue, orders, inventory and sales channels for your fashion label.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const statusStyles: Record<Order["status"], string> = {
  Fulfilled: "bg-leaf/15 text-leaf",
  "In production": "bg-accent text-accent-foreground",
  Shipped: "bg-adire/15 text-adire",
  "Awaiting payment": "bg-destructive/10 text-destructive",
};

const channelBars = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4"];

const stats = [
  {
    label: "Revenue · this month",
    value: "$48,930",
    delta: "+18.2%",
    up: true,
    note: "vs last month",
  },
  {
    label: "Orders",
    value: "1,284",
    delta: "+8.4%",
    up: true,
    note: "vs last month",
  },
  {
    label: "Avg. order value",
    value: "$37.50",
    delta: "−2.1%",
    up: false,
    note: "vs last month",
  },
  {
    label: "Store visitors",
    value: "24,102",
    delta: "+22.6%",
    up: true,
    note: "vs last month",
  },
];

function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-ink text-ink-foreground">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo compact />
            <Select defaultValue="ade-stitches">
              <SelectTrigger className="w-44 border-ink-line bg-transparent text-ink-foreground sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ade-stitches">Ade Stitches — Lagos</SelectItem>
                <SelectItem value="maison-kora">Maison Kora — Accra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-ink-line px-3 py-2 text-xs text-ink-muted md:flex md:w-64">
            <Search className="h-3.5 w-3.5" />
            Search orders, products…
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 hover:bg-ink-line"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              A
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Good morning, Adeola
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's how Ade Stitches is threading along this month.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/designer" search={{ template: undefined }}>View storefront</Link>
            </Button>
            <Button onClick={() => toast.success("Product draft created", { description: "Continue in Products → Drafts." })}>
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-accent/40 px-5 py-4">
          <p className="text-sm">
            <span className="font-semibold">Almost there.</span> Finish store setup — claim your
            address and pick a plan.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/setup">Finish setup</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs">
                {s.up ? (
                  <TrendingUp className="h-3.5 w-3.5 text-leaf" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className={s.up ? "font-semibold text-leaf" : "font-semibold text-destructive"}>
                  {s.delta}
                </span>
                <span className="text-muted-foreground">{s.note}</span>
              </p>
            </div>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Store settings</TabsTrigger>
            <TabsTrigger value="plan">Plan &amp; billing</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Revenue — last 12 weeks</h2>
                  <Badge variant="secondary">+164% quarter</Badge>
                </div>
                <div className="mt-4 h-72">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                        <defs>
                          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                        <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
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
                <h2 className="font-display text-lg font-bold">Sales channels</h2>
                <div className="mt-5 space-y-4">
                  {salesChannels.map((c, i) => (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{c.name}</span>
                        <span className="font-semibold">{c.share}%</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${channelBars[i]}`}
                          style={{ width: `${c.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border bg-card lg:col-span-2">
                <div className="flex items-center justify-between p-6 pb-2">
                  <h2 className="font-display text-lg font-bold">Recent orders</h2>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View all
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden sm:table-cell">Item</TableHead>
                      <TableHead className="hidden md:table-cell">Channel</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id}</TableCell>
                        <TableCell className="text-sm">{o.customer}</TableCell>
                        <TableCell className="hidden text-sm sm:table-cell">{o.item}</TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                          {o.channel}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          ${o.total}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-block rounded-md px-2 py-1 text-[11px] font-semibold ${statusStyles[o.status]}`}>
                            {o.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold">Running low</h2>
                  <div className="mt-4 space-y-3">
                    {lowStock.map((p) => (
                      <div key={p.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-destructive">
                            {p.left} left
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => toast.success(`Restock started for ${p.name}`)}
                          >
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold">Quick actions</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button variant="secondary" className="h-auto flex-col gap-1 py-3 text-xs">
                      <Plus className="h-4 w-4" /> Add product
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-auto flex-col gap-1 py-3 text-xs"
                      onClick={() => setTab("team")}
                    >
                      <Users className="h-4 w-4" /> Invite teammate
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-auto flex-col gap-1 py-3 text-xs"
                      onClick={() => setTab("plan")}
                    >
                      <Crown className="h-4 w-4" /> Upgrade plan
                    </Button>
                    <Button asChild variant="secondary" className="h-auto flex-col gap-1 py-3 text-xs">
                      <Link to="/designer" search={{ template: undefined }}>
                        <ChevronUp className="h-4 w-4" /> Open designer
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <StoreSettingsTab />
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <PlanBillingTab />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <TeamTab />
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Sartorial shop owner dashboard · Sample data for the demo storefront
        </p>
      </main>
    </div>
  );
}
