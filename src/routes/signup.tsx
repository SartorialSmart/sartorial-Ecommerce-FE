import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your store — Sartorial", name: "description", content: "Open a free Sartorial storefront for your fashion label in minutes." },
      { property: "og:title", content: "Create your store — Sartorial" },
      { property: "og:description", content: "Open a free Sartorial storefront for your fashion label in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Create your store"
      subtitle="Free forever plan · No card needed · Your store live in 2 minutes."
      footer={
        <>
          Already selling with us?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Account created", {
            description: "Let's set up your storefront — three quick steps.",
          });
          void navigate({ to: "/setup" });
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required placeholder="Adeola Bankole" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store">Store name</Label>
            <Input id="store" required placeholder="Ade Stitches" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="ade@adestitches.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} placeholder="At least 8 characters" />
          <p className="text-xs text-muted-foreground">
            Use 8+ characters with a mix of letters, numbers and symbols.
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          By creating a store you agree to the{" "}
          <span className="font-semibold text-foreground">Sartorial seller terms</span> and our
          privacy policy. We never sell your customer data.
        </p>
        <Button type="submit" className="w-full">
          Create my store <ArrowRight className="h-4 w-4" />
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
