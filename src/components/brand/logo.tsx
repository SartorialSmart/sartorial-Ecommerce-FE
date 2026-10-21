import { Link } from "@tanstack/react-router";

import logoMark from "@/assets/logo-mark.png";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Sartorial home">
      <span className="rounded-md bg-background p-1 shadow-sm">
        <img src={logoMark} alt="Sartorial mark" className="h-6 w-auto" />
      </span>
      {!compact && (
        <span className="font-display text-xl font-extrabold tracking-tight">
          Sartorial<span className="text-primary">.</span>
          <span className="ml-2 hidden align-middle text-[10px] font-bold uppercase tracking-[0.22em] opacity-60 sm:inline">
            eCommerce
          </span>
        </span>
      )}
    </Link>
  );
}
