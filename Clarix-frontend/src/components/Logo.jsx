import { Link } from "react-router-dom";

export function LogoMark({ className = "h-7 w-7" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="4" y="4" width="10" height="10" fill="currentColor" />
      <rect x="18" y="4" width="10" height="10" fill="currentColor" opacity="0.35" />
      <rect x="4" y="18" width="10" height="10" fill="currentColor" opacity="0.35" />
      <rect x="18" y="18" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 text-ink ${className}`}>
      <LogoMark className="h-7 w-7 text-ink" />
      <span className="font-display text-xl font-medium tracking-tight">Clarix</span>
    </Link>
  );
}

export function ArrowUpRight({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 12L12 4M12 4H6M12 4V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
