import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Sartorial", name: "description", content: "Choose a new password for your Sartorial store account." },
      { property: "og:title", content: "Set a new password — Sartorial" },
      { property: "og:description", content: "Choose a new password for your Sartorial store account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used elsewhere."
      footer={
        <>
          Link expired?{" "}
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Request a new one
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Password updated", {
            description: "Sign in with your new password to reach your dashboard.",
          });
          void navigate({ to: "/login" });
        }}
      >
        <div className="flex items-start gap-2.5 rounded-lg bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
          <p>
            This page opens from the secure link in your email. The link signs you in once — you
            don't need your old password here.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={show ? "text" : "password"}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            placeholder="Type it once more"
          />
        </div>
        <Button type="submit" className="w-full">
          Save new password
        </Button>
      </form>
    </AuthShell>
  );
}
