import Link from "next/link";
import { siteConfig } from "@/lib/load";

const links = [
  { href: "/", label: "Simulator" },
  { href: "/schedule", label: "Schedule" },
  { href: "/matchup", label: "Matchup" },
  { href: "/rankings", label: "Rankings" },
  { href: "/conferences", label: "Conferences" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-[clamp(16px,4vw,40px)] py-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="display text-2xl">{siteConfig.name}</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {siteConfig.social.map((item) => (
              <li key={item.name}>
                <a className="text-muted underline-offset-4 hover:text-ink hover:underline" href={item.url}>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="min-h-11 text-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="max-w-3xl text-sm leading-6 text-muted md:col-span-2">
          Lines and against-the-spread records are for information. Data from CollegeFootballData.com when a key is configured, otherwise the public ESPN feed, plus red-zone scoring from cfbstats.com. Public bet and handle percentages come from Cleatz.
        </p>
      </div>
    </footer>
  );
}
