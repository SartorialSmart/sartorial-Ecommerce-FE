import { Link } from "@tanstack/react-router";

import logoMark from "@/assets/logo-mark.png";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Sartorial home">
      {!compact ? (
        <img
          src={logoMark}
          alt="Sartorial"
          className="h-8 w-auto block"
          decoding="async"
        />
      ) : (
        <img
          src={logoMark}
          alt="Sartorial mark"
          className="h-5 w-auto block"
          decoding="async"
        />
      )}
    </Link>
  );
}
