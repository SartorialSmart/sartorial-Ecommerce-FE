import { useEffect, useState } from "react";
import { CreditCard, Globe, Landmark, ShieldCheck, Wallet } from "lucide-react";
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
import { loadPlans, type Plan } from "@/data/catalog";
import { ApiError } from "@/lib/api/client";
import {
  getAdminSettings,
  patchAdminSettings,
  settingsToMap,
  stringSetting,
} from "@/lib/api/settings";
import {
  inviteTenantMember,
  listTenantMemberships,
  type MembershipRole,
  type TenantMembership,
} from "@/lib/api/tenants";
import { currencies, DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

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

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "The request failed.";
}

const CITIES = [
  "Lagos, Nigeria",
  "Accra, Ghana",
  "Nairobi, Kenya",
  "Kigali, Rwanda",
  "Dakar, Senegal",
  "Johannesburg, South Africa",
];

const PAYMENT_PROVIDERS = [
  { key: "mock", name: "Mock gateway (test mode)", icon: Wallet },
  { key: "paystack", name: "Paystack — cards & bank transfer", icon: CreditCard },
  { key: "flutterwave", name: "Flutterwave", icon: Landmark },
];

/* ============================== Store settings ============================== */

export function StoreSettingsTab({ tenantSlug }: { tenantSlug: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [city, setCity] = useState(CITIES[0]!);
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [domain, setDomain] = useState("");
  const [providers, setProviders] = useState<string[]>(["mock"]);
  const [flatRate, setFlatRate] = useState("0");
  const [freeThreshold, setFreeThreshold] = useState("0");

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    getAdminSettings(tenantSlug)
      .then((resp) => {
        if (cancelled) return;
        const map = settingsToMap(resp);
        setName(stringSetting(map, "store.name"));
        setTagline(stringSetting(map, "store.tagline"));
        setCity(stringSetting(map, "store.city") || CITIES[0]!);
        setCurrency(stringSetting(map, "store.currency") || DEFAULT_CURRENCY);
        setDomain(stringSetting(map, "store.domain"));
        const enabled = map["payments.providers"];
        setProviders(Array.isArray(enabled) ? enabled.map(String) : ["mock"]);
        setFlatRate(stringSetting(map, "shipping.flat_rate", "0") || "0");
        setFreeThreshold(stringSetting(map, "shipping.free_threshold", "0") || "0");
        setLoaded(true);
      })
      .catch((e) => {
        if (!cancelled)
          toast.error("Couldn't load store settings", { description: errorMessage(e) });
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  const saveProfile = async () => {
    if (!loaded || saving) return;
    setSaving(true);
    try {
      await patchAdminSettings(
        {
          "store.name": name.trim(),
          "store.tagline": tagline.trim(),
          "store.city": city,
          "store.currency": currency,
          "store.domain": domain.trim(),
          "shipping.flat_rate": flatRate || "0",
          "shipping.free_threshold": freeThreshold || "0",
        },
        tenantSlug,
      );
      toast.success("Store profile saved", {
        description: "Changes are live on your storefront immediately.",
      });
    } catch (e) {
      toast.error("Couldn't save changes", { description: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const toggleProvider = async (key: string, on: boolean) => {
    const previous = providers;
    const next = on ? [...previous, key] : previous.filter((k) => k !== key);
    setProviders(next);
    try {
      await patchAdminSettings({ "payments.providers": next }, tenantSlug);
      toast.success("Payment methods updated");
    } catch (e) {
      setProviders(previous);
      toast.error("Couldn't update payment methods", { description: errorMessage(e) });
    }
  };

  const cityOptions = city && !CITIES.includes(city) ? [city, ...CITIES] : CITIES;
  const currencyOptions =
    currency && !currencies.some((c) => c.value === currency)
      ? [{ value: currency, label: currency }, ...currencies]
      : currencies;
  const storefrontHost = `${domain || tenantSlug || "your-store"}.ecommerce.sartorialsmart.com`;

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
            <Input
              id="profile-store"
              placeholder="Your store name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-tagline">Hero tagline</Label>
            <Input
              id="profile-tagline"
              placeholder="Short tagline for your storefront"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>City &amp; country</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="profile-domain">Storefront address</Label>
            <Input
              id="profile-domain"
              value={domain}
              placeholder={tenantSlug || "your-store"}
              onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            />
            <p className="text-xs text-muted-foreground">Live at {storefrontHost}</p>
          </div>
        </div>
        <Button className="mt-6" disabled={!loaded || saving} onClick={() => void saveProfile()}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </Panel>

      <div className="space-y-6 lg:col-span-2">
        <Panel title="Domains" note="Your storefront addresses.">
          <div className="flex items-center justify-between rounded-lg border bg-secondary/50 px-4 py-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              {storefrontHost}
            </div>
            <Badge variant="secondary">Primary</Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Your free Sartorial address. Custom domains connect in a later release.
          </p>
        </Panel>

        <Panel title="Payment methods" note="How customers pay you at checkout.">
          <div className="space-y-4">
            {PAYMENT_PROVIDERS.map((p) => (
              <div key={p.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-sm">
                  <p.icon className="h-4 w-4 text-muted-foreground" />
                  {p.name}
                </span>
                <Switch
                  checked={providers.includes(p.key)}
                  onCheckedChange={(v) => void toggleProvider(p.key, v)}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Enabled at checkout as soon as your provider keys are configured.
          </p>
        </Panel>

        <Panel title="Shipping" note="Flat-rate shipping shown at checkout.">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="shipping-flat">Flat rate ({currency})</Label>
              <Input
                id="shipping-flat"
                type="number"
                min="0"
                step="any"
                value={flatRate}
                onChange={(e) => setFlatRate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipping-free">Free shipping over ({currency})</Label>
              <Input
                id="shipping-free"
                type="number"
                min="0"
                step="any"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                0 disables the free-shipping threshold.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ============================== Plan & billing ============================== */

export function PlanBillingTab({ tenantSlug }: { tenantSlug: string | null }) {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [current, setCurrent] = useState<string | null>(null);
  const [plansState, setPlansState] = useState<Plan[]>([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPlans(tenantSlug).then((plans) => {
      if (!cancelled) setPlansState(plans);
    });
    getAdminSettings(tenantSlug)
      .then((resp) => {
        if (!cancelled) setCurrent(stringSetting(settingsToMap(resp), "store.plan", "ankara"));
      })
      .catch(() => {
        if (!cancelled) setCurrent("ankara");
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  const plan = plansState.find((p) => p.id === current) ?? plansState[0];
  const planReady = current !== null && plan !== undefined;
  const price = plan ? (cycle === "monthly" ? plan.monthly : plan.annual) : 0;

  const switchPlan = async (p: Plan) => {
    if (p.id === current || switching) return;
    setSwitching(true);
    try {
      await patchAdminSettings({ "store.plan": p.id }, tenantSlug);
      setCurrent(p.id);
      toast.success(`Plan switched to ${p.name}`, {
        description:
          cycle === "annual"
            ? "Billed annually — you saved 20%."
            : "Billed monthly. Cancel any time.",
      });
    } catch (e) {
      toast.error("Couldn't switch plan", { description: errorMessage(e) });
    } finally {
      setSwitching(false);
    }
  };

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
              <p className="font-display text-3xl font-bold">
                {planReady && plan ? plan.name : "…"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {planReady && plan ? plan.tagline : "Loading your plan…"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-bold">
                {price === 0 ? "Free" : formatCurrency(price)}
                {price > 0 && (
                  <span className="text-sm font-medium text-muted-foreground">
                    /{cycle === "monthly" ? "mo" : "mo, billed yearly"}
                  </span>
                )}
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
          <div className="rounded-lg border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
            No payment method on file yet.
          </div>
        </Panel>
      </div>

      <Panel
        title="Change plan"
        note="Upgrade or downgrade any time — we prorate to the day."
        className="p-0"
      >
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {plansState.map((p) => {
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
                  {pPrice === 0 ? "Free" : formatCurrency(pPrice)}
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
                  disabled={isCurrent || switching || !planReady}
                  onClick={() => void switchPlan(p)}
                >
                  {isCurrent ? "Current plan" : `Switch to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Invoices">
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      </Panel>
    </div>
  );
}

/* ============================== Team ============================== */

const ROLE_LABELS: Record<MembershipRole, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
};

export function TeamTab({ tenantSlug }: { tenantSlug: string | null }) {
  const [members, setMembers] = useState<TenantMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MembershipRole>("staff");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!tenantSlug) {
      setMembers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listTenantMemberships(tenantSlug)
      .then((rows) => {
        if (!cancelled) setMembers(rows);
      })
      .catch((e) => {
        if (!cancelled) toast.error("Couldn't load your team", { description: errorMessage(e) });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  const sendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      toast.error("Add an email address to invite a teammate.");
      return;
    }
    if (!tenantSlug) {
      toast.error("Select a store first.");
      return;
    }
    setInviting(true);
    try {
      const membership = await inviteTenantMember(tenantSlug, email, inviteRole);
      setMembers((rows) => [...rows, membership]);
      setInviteEmail("");
      toast.success(`${membership.user_email} added to the team`, {
        description: "They now have access to this store's dashboard.",
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        toast.error("No account with that email", {
          description: "Ask your teammate to sign up for Sartorial first.",
        });
      } else {
        toast.error("Couldn't add teammate", { description: errorMessage(e) });
      }
    } finally {
      setInviting(false);
    }
  };

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
              <TableHead className="hidden text-right sm:table-cell">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Loading team…
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  {tenantSlug
                    ? "No team members yet. Invite teammates to collaborate on this store."
                    : "Select a store to manage its team."}
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm font-medium">
                    {m.user_name.trim() || m.user_email}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {m.user_email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ROLE_LABELS[m.role] ?? m.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">
                    {new Date(m.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Panel>

      <div className="space-y-6">
        <Panel title="Add a teammate">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MembershipRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={inviting} onClick={() => void sendInvite()}>
              {inviting ? "Adding…" : "Add to team"}
            </Button>
            <p className="text-xs text-muted-foreground">
              They need an existing Sartorial account — we add them right away.
            </p>
          </div>
        </Panel>
        <Panel title="What each role can do">
          <ul className="space-y-3 text-sm">
            <li>
              <span className="font-semibold">Owner</span> — everything, including billing and
              closing the store.
            </li>
            <li>
              <span className="font-semibold">Manager</span> — products, orders and team members.
            </li>
            <li>
              <span className="font-semibold">Staff</span> — day-to-day catalogue and order work.
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
