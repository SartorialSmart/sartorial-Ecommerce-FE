import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Download, FileText, Mail, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  createAdminInvoice,
  downloadAdminInvoicePdf,
  listAdminInvoices,
  sendAdminInvoice,
  updateAdminInvoice,
  type AdminInvoice,
} from "@/lib/api/invoices";
import { listAdminOrders, type AdminOrder } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/currency";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request failed.";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function InvoiceManagementTab({ tenantSlug }: { tenantSlug: string | null }) {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerLogoUrl, setCustomerLogoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [sendInvoice, setSendInvoice] = useState<AdminInvoice | null>(null);
  const [sendTo, setSendTo] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendLogoUrl, setSendLogoUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invoiceRows, orderRows] = await Promise.all([
        listAdminInvoices(tenantSlug, { page_size: 100 }),
        listAdminOrders(tenantSlug, { page_size: 100 }),
      ]);
      setInvoices(invoiceRows);
      setOrders(orderRows);
    } catch {
      setInvoices([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const invoiceableOrders = useMemo(() => {
    const invoiced = new Set(invoices.map((invoice) => invoice.order));
    return orders.filter((order) => !invoiced.has(order.id));
  }, [invoices, orders]);

  const chooseOrder = (event: ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value;
    setSelectedOrder(id);
    const order = orders.find((row) => row.id === id);
    setCustomerName(order?.contact_name || order?.ship_name || "");
    setCustomerEmail(order?.contact_email || order?.payer_email || "");
  };

  const createInvoice = async () => {
    if (!selectedOrder) {
      toast.error("Choose an order to invoice.");
      return;
    }
    setBusy(true);
    try {
      await createAdminInvoice(
        {
          order: selectedOrder,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_logo_url: customerLogoUrl,
          notes,
        },
        tenantSlug,
      );
      toast.success("Invoice created");
      setCreateOpen(false);
      setSelectedOrder("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerLogoUrl("");
      setNotes("");
      await load();
    } catch (error) {
      toast.error("Couldn't create the invoice", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async (invoice: AdminInvoice) => {
    try {
      await downloadAdminInvoicePdf(invoice.id, tenantSlug);
      toast.success("Invoice PDF downloaded");
    } catch (error) {
      toast.error("Couldn't download the PDF", { description: errorMessage(error) });
    }
  };

  const openSend = (invoice: AdminInvoice) => {
    setSendInvoice(invoice);
    setSendTo(invoice.customer_email);
    setSendSubject(`Invoice ${invoice.number}`);
    setSendMessage("");
    setSendLogoUrl(invoice.customer_logo_url);
  };

  const sendInvoiceEmail = async () => {
    if (!sendInvoice) return;
    setBusy(true);
    try {
      if (sendLogoUrl !== sendInvoice.customer_logo_url) {
        await updateAdminInvoice(sendInvoice.id, { customer_logo_url: sendLogoUrl }, tenantSlug);
      }
      await sendAdminInvoice(
        sendInvoice.id,
        {
          to: sendTo,
          subject: sendSubject,
          message: sendMessage,
        },
        tenantSlug,
      );
      toast.success("Invoice emailed with PDF attached");
      setSendInvoice(null);
      await load();
    } catch (error) {
      toast.error("Couldn't email the invoice", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Sales &amp; Invoices</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn paid orders into branded PDF invoices and email them to customers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Loading invoices…
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No invoices yet. Choose “New invoice” to bill a paid order.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-mono text-xs font-semibold">{invoice.number}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(invoice.issue_date)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{invoice.order_number}</TableCell>
                  <TableCell>
                    <p className="text-sm">{invoice.customer_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customer_email || ""}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "sent" ? "default" : "secondary"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {formatCurrency(Number(invoice.total))}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download PDF"
                        onClick={() => void downloadPdf(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Email invoice"
                        onClick={() => openSend(invoice)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Create An Invoice</SheetTitle>
            <SheetDescription>
              Your store logo from setup is added automatically. Add a customer logo if needed.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-order">Order</Label>
              <select
                id="invoice-order"
                value={selectedOrder}
                onChange={chooseOrder}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Choose an order…</option>
                {invoiceableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.number} · {order.contact_name || order.contact_email}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="invoice-customer">Customer Name</Label>
                <Input
                  id="invoice-customer"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-email">Customer Email</Label>
                <Input
                  id="invoice-email"
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-customer-logo">Customer Logo URL</Label>
              <Input
                id="invoice-customer-logo"
                type="url"
                placeholder="https://…"
                value={customerLogoUrl}
                onChange={(event) => setCustomerLogoUrl(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional. This logo appears in the invoice header next to your store logo.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-notes">Notes</Label>
              <textarea
                id="invoice-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button className="w-full" disabled={busy} onClick={() => void createInvoice()}>
              {busy ? "Creating…" : "Create Invoice"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sendInvoice !== null} onOpenChange={(open) => !open && setSendInvoice(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Email Invoice</SheetTitle>
            <SheetDescription>
              The PDF is attached automatically. You can add the customer logo before sending.
            </SheetDescription>
          </SheetHeader>
          {sendInvoice && (
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="send-to">Recipient</Label>
                <Input
                  id="send-to"
                  type="email"
                  value={sendTo}
                  onChange={(event) => setSendTo(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="send-subject">Subject</Label>
                <Input
                  id="send-subject"
                  value={sendSubject}
                  onChange={(event) => setSendSubject(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="send-logo">Customer Logo URL</Label>
                <Input
                  id="send-logo"
                  type="url"
                  value={sendLogoUrl}
                  onChange={(event) => setSendLogoUrl(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="send-message">Message</Label>
                <textarea
                  id="send-message"
                  value={sendMessage}
                  onChange={(event) => setSendMessage(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={() => void sendInvoiceEmail()}>
                {busy ? "Sending…" : "Send Invoice"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
