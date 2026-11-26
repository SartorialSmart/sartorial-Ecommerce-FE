import { Link } from "@tanstack/react-router";

import logoMark from "@/assets/Logo-2.png";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1" aria-label="Sartorial Ecommerce home">
      <img src={logoMark} alt="Sartorial" className="block h-18 w-auto shrink-0" decoding="async" />
      <span className="whitespace-nowrap font-display text-xl font-extrabold tracking-tight">
        Ecommerce
      </span>
    </Link>
  );
}
