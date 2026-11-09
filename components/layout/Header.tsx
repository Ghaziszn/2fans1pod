"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GarbageTimeToggle } from "@/components/stats/GarbageTime";
import { siteConfig } from "@/lib/load";

const links = [
  { href: "/", label: "Simulator" },
  { href: "/schedule", label: "Schedule" },
  { href: "/matchup", label: "Matchup" },
  { href: "/rankings", label: "Rankings" },
  { href: "/conferences", label: "Conferences" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl K");

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setShortcut("⌘K");
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-[clamp(16px,4vw,40px)]">
          <Link href="/" className="flex min-h-11 items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/brand/logo.jpg" alt="" width={36} height={36} className="h-9 w-9 rounded-sm" />
            <span className="display text-2xl">{siteConfig.name}</span>
          </Link>
          <nav className="ml-3 hidden items-center md:flex lg:ml-6 lg:gap-1" aria-label="Main">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="min-h-11 px-2 py-2 text-sm font-medium text-muted hover:text-ink lg:px-3">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="hidden min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-line px-2 text-sm text-muted md:inline-flex lg:px-3"
              aria-label="Search"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-xs lg:inline">{shortcut}</kbd>
            </button>
            <button type="button" className="inline-flex h-11 w-11 items-center justify-center md:hidden" aria-label="Search" aria-keyshortcuts="Control+K Meta+K" onClick={() => setSearchOpen(true)}>
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
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-[1440px] items-center px-[clamp(16px,4vw,40px)]">
            <GarbageTimeToggle />
          </div>
        </div>
      </header>
      {open ? (
        <nav className="fixed inset-0 z-50 flex flex-col bg-paper px-[clamp(16px,4vw,40px)] py-4 md:hidden" aria-label="Mobile">
          <div className="flex h-16 items-center justify-between">
            <span className="display text-2xl">{siteConfig.name}</span>
            <button type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <div className="mt-4 flex flex-col">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="flex min-h-11 items-center border-b border-line text-2xl" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
