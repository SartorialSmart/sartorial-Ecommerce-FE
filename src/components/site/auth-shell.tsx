import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import heroEditorial from "@/assets/hero-editorial.jpg";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-ink-foreground lg:flex">
        <img
          src={heroEditorial}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/25" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <div className="h-1.5 w-16 rounded-full kente-strip" />
          <p className="mt-6 font-display text-3xl font-bold leading-tight">
            Your atelier, online this afternoon.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Join 12,400+ African designers selling on storefronts that look like couture — because
            they are.
          </p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
            "My first month online outsold my best market day."
          </p>
          <p className="mt-1 text-xs text-ink-muted">— Adeola Bankole, Ade Stitches · Lagos</p>
        </div>
        <p className="relative text-xs text-ink-muted">
          © 2026 Sartorial · Lagos · Accra · Nairobi
        </p>
      </aside>

      <main className="flex flex-col px-5 py-10 sm:px-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}
