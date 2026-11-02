import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";

const links = [
  { to: "/templates", label: "Storefront designs" },
  { to: "/designer", label: "Store designer" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    setOpen(false);
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/95 text-ink-foreground backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={
                pathname === l.to
                  ? "text-primary"
                  : "text-ink-foreground/75 transition-colors hover:text-ink-foreground"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-sm font-medium text-ink-foreground/75 transition-colors hover:text-ink-foreground"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink-foreground/75 transition-colors hover:text-ink-foreground"
              >
                Sign in
              </Link>
              <Button asChild>
                <Link to="/signup">Open your store</Link>
              </Button>
            </>
          )}
        </div>
        <button
          className="rounded-md p-2 hover:bg-ink-line md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-ink-line px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={
                  pathname === l.to
                    ? "text-sm font-medium text-primary"
                    : "text-sm font-medium text-ink-foreground/75"
                }
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="text-left text-sm font-medium text-ink-foreground/75"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-ink-foreground/75"
                >
                  Sign in
                </Link>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/signup">Open your store</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
