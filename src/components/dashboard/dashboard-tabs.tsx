import { useState } from "react";
import { CreditCard, Globe, Landmark, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { plans } from "@/data/catalog";

function Panel({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"rounded-xl border bg-card p-6 " + className}>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

/* ============================== Store settings ============================== */

const paymentMethods = [
  { name: "Paystack — cards & bank transfer", icon: CreditCard, on: true },
  { name: "M-Pesa — mobile money", icon: Smartphone, on: true },
  { name: "Flutterwave", icon: Wallet, on: false },
  { name: "Pay on delivery (Lagos & Accra)", icon: Landmark, on: true },
];

const deliveryZones = [
  { zone: "Lagos — next-day courier", price: "₦3,500 flat", on: true },
  { zone: "Pan-African — 3 to 5 days", price: "from $12", on: true },
  { zone: "Worldwide — 5 to 9 days", price: "from $28", on: false },
];

export function StoreSettingsTab() {
  const [payments, setPayments] = useState(paymentMethods);
  const [zones, setZones] = useState(deliveryZones);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Panel
        title="Store profile"
        note="What customers see on your storefront and invoices."
        className="lg:col-span-3"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-store">Store name</Label>
            <Input id="profile-store" defaultValue="Ade Stitches" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-tagline">Hero tagline</Label>
            <Input id="profile-tagline" defaultValue="Handwoven heritage, gallery-lit." />
          </div>
          <div className="space-y-1.5">
            <Label>City &amp; country</Label>
            <Select defaultValue="Lagos, Nigeria">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lagos, Nigeria">Lagos, Nigeria</SelectItem>
                <SelectItem value="Accra, Ghana">Accra, Ghana</SelectItem>
                <SelectItem value="Nairobi, Kenya">Nairobi, Kenya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select defaultValue="USD">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US dollar</SelectItem>
                <SelectItem value="NGN">NGN — Nigerian naira</SelectItem>
                <SelectItem value="GHS">GHS — Ghanaian cedi</SelectItem>
                <SelectItem value="KES">KES — Kenyan shilling</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="mt-6"
          onClick={() =>
            toast.success("Store profile saved", {
              description: "Changes are live on your storefront immediately.",
            })
          }
        >
          Save changes
        </Button>
      </Panel>

      <div className="space-y-6 lg:col-span-2">
        <Panel title="Domains" note="Your storefront addresses.">
          <div className="flex items-center justify-between rounded-lg border bg-secondary/50 px-4 py-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              ade-stitches.sartorial.store
            </div>
            <Badge variant="secondary">Primary</Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="adestitches.com" aria-label="Custom domain" />
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() =>
                toast.success("Domain queued for connection", {
                  description: "We'll verify DNS for ade-stitches.com within the hour.",
                })
              }
            >
              Connect
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Custom domains are included on the Aso-Òkè plan and above.
          </p>
        </Panel>

        <Panel title="Payment methods" note="How customers pay you at checkout.">
          <div className="space-y-4">
            {payments.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-sm">
                  <p.icon className="h-4 w-4 text-muted-foreground" />
                  {p.name}
                </span>
                <Switch
                  checked={p.on}
                  onCheckedChange={(v) =>
                    setPayments((list) => list.map((x, j) => (j === i ? { ...x, on: v } : x)))
                  }
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Payouts settle to your GTBank account every Friday.
          </p>
        </Panel>

        <Panel title="Delivery zones" note="Flat-rate zones shown at checkout.">
          <div className="space-y-4">
            {zones.map((z, i) => (
              <div key={z.zone} className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <p>{z.zone}</p>
                  <p className="text-xs text-muted-foreground">{z.price}</p>
                </div>
                <Switch
                  checked={z.on}
                  onCheckedChange={(v) =>
                    setZones((list) => list.map((x, j) => (j === i ? { ...x, on: v } : x)))
                  }
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ============================== Plan & billing ============================== */

const invoices = [
  { date: "Jan 22, 2026", plan: "Aso-Òkè — monthly", amount: "$29.00", status: "Paid" },
  { date: "Dec 22, 2025", plan: "Aso-Òkè — monthly", amount: "$29.00", status: "Paid" },
  { date: "Nov 22, 2025", plan: "Ankara — free", amount: "$0.00", status: "Paid" },
  { date: "Oct 22, 2025", plan: "Ankara — free", amount: "$0.00", status: "Paid" },
];

export function PlanBillingTab() {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [current, setCurrent] = useState("asooke");
  const plan = plans.find((p) => p.id === current) ?? plans[0]!;
  const price = cycle === "monthly" ? plan.monthly : plan.annual;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Current plan"
          note="Your storefront runs on this plan today."
          className="lg:col-span-2"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-3xl font-bold">{plan.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-bold">
                {price === 0 ? "Free" : `$${price}`}
                {price > 0 && (
                  <span className="text-sm font-medium text-muted-foreground">
                    /{cycle === "monthly" ? "mo" : "mo, billed yearly"}
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Next invoice {cycle === "monthly" ? "Feb 22, 2026" : "Nov 22, 2026"}
              </p>
            </div>
          </div>
          <div className="mt-6 inline-flex rounded-lg border bg-secondary/50 p-1">
            {(["monthly", "annual"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={
                  "rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-colors " +
                  (cycle === c
                    ? "bg-ink text-ink-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {c === "annual" ? "Annual · save 20%" : "Monthly"}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Payment method">
          <div className="flex items-center gap-3 rounded-lg border bg-secondary/50 px-4 py-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-semibold">Visa ending 4084</p>
              <p className="text-xs text-muted-foreground">Expires 09 / 2028</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => toast.info("Card update opens a secure Stripe form.")}
          >
            Update card
          </Button>
        </Panel>
      </div>

      <Panel
        title="Change plan"
        note="Upgrade or downgrade any time — we prorate to the day."
        className="p-0"
      >
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {plans.map((p) => {
            const pPrice = cycle === "monthly" ? p.monthly : p.annual;
            const isCurrent = p.id === current;
            return (
              <div key={p.id} className="bg-card p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{p.name}</p>
                  {isCurrent && (
                    <Badge className="bg-primary text-primary-foreground">Current</Badge>
                  )}
                </div>
                <p className="mt-2 font-display text-3xl font-bold">
                  {pPrice === 0 ? "Free" : `$${pPrice}`}
                  {pPrice > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">/mo</span>
                  )}
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-5 w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => {
                    setCurrent(p.id);
                    toast.success(`Plan switched to ${p.name}`, {
                      description:
                        cycle === "annual"
                          ? "Billed annually — you saved 20%."
                          : "Billed monthly. Cancel any time.",
                    });
                  }}
                >
                  {isCurrent ? "Current plan" : `Switch to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Invoices" className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.date}>
                <TableCell className="text-sm">{inv.date}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{inv.plan}</TableCell>
                <TableCell className="text-right text-sm font-semibold">{inv.amount}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="bg-leaf/15 text-leaf">
                    {inv.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

/* ============================== Team ============================== */

const team = [
  {
    name: "Adeola Bankole",
    email: "ade@adestitches.com",
    role: "Owner",
    active: "Online now",
    tint: "bg-primary text-primary-foreground",
  },
  {
    name: "Kora Mensah",
    email: "kora@adestitches.com",
    role: "Manager",
    active: "2 hours ago",
    tint: "bg-adire text-white",
  },
  {
    name: "Ifeoma Adeyemi",
    email: "ifeoma@adestitches.com",
    role: "Fulfilment",
    active: "Yesterday",
    tint: "bg-leaf text-white",
  },
];

export function TeamTab() {
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel
        title="Your team"
        note="People with access to this store's dashboard."
        className="p-0 lg:col-span-2"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Last active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((m) => (
              <TableRow key={m.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold " +
                        m.tint
                      }
                    >
                      {m.name.charAt(0)}
                    </span>
                    <span className="text-sm font-semibold">{m.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {m.email}
                </TableCell>
                <TableCell>
                  {m.role === "Owner" ? (
                    <Badge variant="secondary">Owner</Badge>
                  ) : (
                    <Select
                      defaultValue={m.role}
                      onValueChange={(r) =>
                        toast.success(`${m.name} is now a ${r.toLowerCase()}`, {
                          description: "Permissions update the next time they sign in.",
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-36 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Fulfilment">Fulfilment</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">
                  {m.active}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <div className="space-y-6">
        <Panel title="Invite a teammate">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="tailor@adestitches.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!inviteEmail.trim()) {
                  toast.error("Add an email address to invite a teammate.");
                  return;
                }
                toast.success(`Invite sent to ${inviteEmail.trim()}`, {
                  description: "They'll appear here once they accept.",
                });
                setInviteEmail("");
              }}
            >
              Send invite
            </Button>
          </div>
        </Panel>
        <Panel title="What each role can do">
          <ul className="space-y-3 text-sm">
            <li>
              <span className="font-semibold">Owner</span> — everything, including billing and
              closing the store.
            </li>
            <li>
              <span className="font-semibold">Manager</span> — products, designs, discounts and
              orders.
            </li>
            <li>
              <span className="font-semibold">Fulfilment</span> — sees orders and delivery only.
            </li>
            <li>
              <span className="font-semibold">Viewer</span> — read-only access to analytics.
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
