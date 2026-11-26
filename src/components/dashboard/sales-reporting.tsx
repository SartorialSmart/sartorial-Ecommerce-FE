import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSalesReport, type SalesReport } from "@/lib/api/analytics";
import { DEFAULT_CURRENCY, formatCurrency, type CurrencyCode } from "@/lib/currency";

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function shiftedDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function SalesReportingTab({ tenantSlug }: { tenantSlug: string | null }) {
  const [from, setFrom] = useState(() => shiftedDate(-29));
  const [to, setTo] = useState(() => shiftedDate(0));
  const [status, setStatus] = useState("");
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSalesReport(tenantSlug, { from, to, ...(status ? { status } : {}) })
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch(() => {
        if (!cancelled) setReport(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, from, to, status]);

  const currency = (report?.summary.currency ?? DEFAULT_CURRENCY) as CurrencyCode;
  const money = (amount: string | number) => formatCurrency(Number(amount), currency);
  const chartData = (report?.by_day ?? []).map((row) => ({
    date: row.date.slice(5),
    net: Number(row.net),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Sales Reporting</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading report…"
              : "Accounting totals from orders, VAT, discounts, refunds, and invoices."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="report-from">From</Label>
            <Input
              id="report-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-to">To</Label>
            <Input
              id="report-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-status">Order Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="report-status" className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!report && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>No Sales Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your sales report will appear once your store has orders.
            </p>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="Revenue (Paid)" value={money(report.summary.revenue)} />
            <Metric label="Net Sales" value={money(report.summary.net)} />
            <Metric label="VAT Collected" value={money(report.summary.vat)} />
            <Metric label="Discounts" value={money(report.summary.discounts)} />
            <Metric label="Refunds" value={money(report.summary.refunds)} />
            <Metric label="Paid Orders" value={String(report.summary.paid_orders)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Net Sales</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="salesReportFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      tickFormatter={(value) => money(Number(value))}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip formatter={(value) => [money(Number(value)), "Net sales"]} />
                    <Area
                      type="monotone"
                      dataKey="net"
                      stroke="var(--chart-1)"
                      fill="url(#salesReportFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full animate-pulse rounded-lg bg-muted" />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">VAT</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.by_day.map((row) => (
                        <TableRow key={row.date}>
                          <TableCell className="font-mono text-xs">{row.date.slice(5)}</TableCell>
                          <TableCell className="text-right">{row.orders}</TableCell>
                          <TableCell className="text-right">{money(row.gross)}</TableCell>
                          <TableCell className="text-right">{money(row.discounts)}</TableCell>
                          <TableCell className="text-right">{money(row.vat)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {money(row.net)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.by_status.map((row) => (
                        <TableRow key={row.status}>
                          <TableCell>
                            <Badge variant="secondary">{row.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{money(row.total)}</TableCell>
                        </TableRow>
                      ))}
                      {report.by_status.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No orders in this range.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Invoices</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.invoices.map((row) => (
                        <TableRow key={row.status}>
                          <TableCell>{row.label}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{money(row.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.top_products.map((row) => (
                    <TableRow key={row.title}>
                      <TableCell>{row.title}</TableCell>
                      <TableCell className="text-right">{row.quantity}</TableCell>
                      <TableCell className="text-right">{money(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
                  {report.top_products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No paid product sales in this range.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
