"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, CircleDot, User } from "lucide-react";
import { clsx } from "clsx";

const nav = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/post", label: "Post item" },
  { href: "/profile", label: "My commitment" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-toss-mint/50 bg-white/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-toss-green font-display text-xl">
          <CircleDot className="w-7 h-7" />
          Toss
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3 py-2 rounded-lg text-sm font-medium transition",
                pathname === href
                  ? "bg-toss-mint/50 text-toss-green"
                  : "text-toss-earth hover:bg-toss-mint/30"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
