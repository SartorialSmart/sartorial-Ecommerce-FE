import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/use-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      {
        title: "Create your store — Sartorial",
        name: "description",
        content: "Open a free Sartorial storefront for your fashion label in minutes.",
      },
      { property: "og:title", content: "Create your store — Sartorial" },
      {
        property: "og:description",
        content: "Open a free Sartorial storefront for your fashion label in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { register, status } = useAuth();
  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      void navigate({ to: "/dashboard" });
    }
  }, [status, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await register({ email, password, full_name: name.trim() });
      if (typeof window !== "undefined" && store.trim()) {
        window.sessionStorage.setItem("sartorial.pending_store_name", store.trim());
      }
      toast.success("Account created", {
        description: `Welcome, ${user.full_name || user.email}. Let's set up your storefront.`,
      });
      void navigate({ to: "/setup" });
    } catch (error) {
      toast.error("Could not create your account", {
        description: error instanceof ApiError ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create Your Store"
      subtitle="Free forever plan · No card needed · Your store live in 2 minutes."
      footer={
        <>
          Already selling with us?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              required
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store">Store Name</Label>
            <Input
              id="store"
              required
              placeholder="Your store name"
              value={store}
              onChange={(e) => setStore(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="ade@adestitches.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Use 8+ characters with a mix of letters, numbers and symbols.
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          By creating a store you agree to the{" "}
          <span className="font-semibold text-foreground">Sartorial seller terms</span> and our
          privacy policy. We never sell your customer data.
        </p>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            "Creating Your Store…"
          ) : (
            <>
              Create My Store <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or sign up with
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
