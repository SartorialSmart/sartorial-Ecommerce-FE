import { Link } from "@tanstack/react-router";

import logoMark from "@/assets/Logo-2.png";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Sartorial home">
      <img
        src={logoMark}
        alt="Sartorial"
        className={`block ${compact ? "h-5" : "h-8"}`}
        decoding="async"
      />
      {!compact && (
        <span className="font-display text-xl font-extrabold tracking-tight">
          Ecommerce
        </span>
      )}
    </Link>
  );
}
