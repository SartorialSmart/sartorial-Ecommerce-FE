import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getErpLinkStatus,
  linkErpAccount,
  regenerateErpKey,
  unlinkErpAccount,
  type ErpLinkStatus,
} from "@/lib/api/erp-link";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request failed.";
}

function formatDate(value: string | null): string {
  if (!value) return "never";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ErpLinkCard({ tenantSlug }: { tenantSlug: string | null }) {
  const [status, setStatus] = useState<ErpLinkStatus | null>(null);
  const [businessId, setBusinessId] = useState("");
  const [rawKey, setRawKey] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const next = await getErpLinkStatus(tenantSlug);
      setStatus(next);
      setBusinessId(next.erp_business_id);
    } catch (error) {
      toast.error("Couldn't load your ERP link", { description: errorMessage(error) });
    }
  }, [tenantSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const link = async () => {
    if (!businessId.trim()) {
      toast.error("Enter the business ID or seller ID from your ERP account.");
      return;
    }
    setBusy(true);
    try {
      const next = await linkErpAccount({ erp_business_id: businessId.trim() }, tenantSlug);
      setStatus(next);
      setBusinessId(next.erp_business_id);
      setRawKey(next.api_key ?? "");
      if (next.api_key) toast.success("ERP account linked. Copy the key into your ERP.");
      else toast.success("ERP link updated.");
    } catch (error) {
      toast.error("Couldn't link that ERP account", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    setBusy(true);
    try {
      const next = await regenerateErpKey(tenantSlug);
      setStatus(next);
      setRawKey(next.api_key ?? "");
      toast.success("New sync key generated. The previous key is inactive.");
    } catch (error) {
      toast.error("Couldn't generate a new key", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    try {
      const next = await unlinkErpAccount(tenantSlug);
      setStatus(next);
      setRawKey("");
      toast.success("ERP account unlinked.");
    } catch (error) {
      toast.error("Couldn't unlink the ERP account", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const copyKey = async () => {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      toast.success("Sync key copied.");
    } catch {
      toast.error("Select the key and copy it manually.");
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">ERP Inventory Link</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Link your Sartorial ERP account so products and stock publish into this storefront.
          </p>
        </div>
        <span
          className={
            "rounded-md px-2 py-1 text-[11px] font-semibold " +
            (status?.linked ? "bg-leaf/15 text-leaf" : "bg-muted text-muted-foreground")
          }
        >
          {status?.linked ? "Linked" : "Not linked"}
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="erp-business-id">ERP Business ID Or Seller ID</Label>
            <Input
              id="erp-business-id"
              value={businessId}
              placeholder="e.g. ERP-8842"
              onChange={(event) => setBusinessId(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={busy} onClick={() => void link()}>
              <Link2 className="h-4 w-4" /> {status?.linked ? "Update Link" : "Link My ERP"}
            </Button>
            {status?.linked && (
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void regenerate()}>
                <RefreshCw className="h-4 w-4" /> New Sync Key
              </Button>
            )}
            {status?.linked && (
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => void unlink()}>
                <Unplug className="h-4 w-4" /> Unlink
              </Button>
            )}
          </div>
          {status?.api_key_prefix && (
            <p className="text-xs text-muted-foreground">
              Active key: <span className="font-mono">{status.api_key_prefix}…</span> · Last used{" "}
              {formatDate(status.api_key_last_used_at)}
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-secondary/40 p-4">
          {rawKey ? (
            <>
              <p className="text-sm font-semibold text-leaf">Copy This Key Into Your ERP Now</p>
              <p className="mt-1 text-xs text-muted-foreground">
                For security, the full key is only shown once.
              </p>
              <div className="mt-3 flex gap-2">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-background p-2 text-xs">
                  {rawKey}
                </code>
                <Button variant="outline" size="icon" onClick={() => void copyKey()}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Sync Endpoints</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your ERP publishes products and stock with the generated service key.
              </p>
              <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">
                <li>{status?.sync_endpoints.catalog ?? "/api/v1/erp/catalog/sync/"}</li>
                <li>{status?.sync_endpoints.inventory ?? "/api/v1/erp/inventory/"}</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Product payloads can include discount_percent, vat_rate_percent, or vat_flat_amount.
                ERP VAT overrides store VAT for that product.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
