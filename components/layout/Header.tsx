"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { siteConfig } from "@/lib/load";

const links = [
  { href: "/", label: "Simulator" },
  { href: "/matchup", label: "Matchup" },
  { href: "/rankings", label: "Rankings" },
  { href: "/conferences", label: "Conferences" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-[clamp(16px,4vw,40px)]">
        <Link href="/" className="flex min-h-11 items-center gap-2" onClick={() => setOpen(false)}>
          <img src="/brand/logo.jpg" alt="" width={36} height={36} className="h-9 w-9 rounded-sm" />
          <span className="display text-2xl">{siteConfig.name}</span>
        </Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="min-h-11 px-3 py-2 text-sm font-medium text-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="hidden min-h-11 items-center gap-2 rounded-md border border-line px-3 text-sm text-muted md:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            Search
            <kbd className="rounded border border-line px-1.5 py-0.5 text-xs">⌘K</kbd>
          </button>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center md:hidden" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search size={20} />
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-line px-[clamp(16px,4vw,40px)] py-3 md:hidden" aria-label="Mobile">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-11 items-center text-lg" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
