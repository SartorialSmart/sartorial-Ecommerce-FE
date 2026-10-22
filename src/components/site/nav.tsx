import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/templates", label: "Storefront designs" },
  { to: "/designer", label: "Store designer" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

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
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild>
            <Link to="/designer" search={{ }}>Open your store</Link>
          </Button>
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
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/designer" search={{ }}>Open your store</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
