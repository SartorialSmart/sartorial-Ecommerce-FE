import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Sartorial", name: "description", content: "Sign in to your Sartorial storefront dashboard." },
      { property: "og:title", content: "Sign in — Sartorial" },
      { property: "og:description", content: "Sign in to your Sartorial storefront dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Sartorial storefront dashboard."
      footer={
        <>
          New to Sartorial?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create your store
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Welcome back, Adeola", {
            description: "Signing you in to Ade Stitches — Lagos.",
          });
          void navigate({ to: "/dashboard" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required defaultValue="ade@adestitches.com" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              required
              placeholder="••••••••"
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
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox id="remember" defaultChecked />
          Keep me signed in for 30 days
        </label>
        <Button type="submit" className="w-full">
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Google sign-in is coming to Sartorial soon.")}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Apple sign-in is coming to Sartorial soon.")}
          >
            Apple
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
