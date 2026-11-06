import type { Team } from "@/lib/cfp/types";

export function teamInk(color: string) {
  const hex = color.replace("#", "");
  if (hex.length < 6) return "#f4f1ea";
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
  return brightness > 150 ? "#16181d" : "#f4f1ea";
}

export function TeamMark({
  team,
  name,
  seed,
  size = "md",
}: {
  team?: Team;
  name?: string;
  seed?: number | null;
  size?: "sm" | "md";
}) {
  const logo = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const bar = size === "sm" ? "h-6" : "h-8";
  return (
    <span className="flex min-w-0 items-center gap-2">
      {seed != null ? <span className="nums w-5 text-xs text-muted">{seed}</span> : null}
      {team?.logo ? <img src={team.logo} alt="" className={`${logo} shrink-0 object-contain`} /> : null}
      <span className={`${bar} w-1.5 shrink-0 rounded-sm`} style={{ background: team?.color ?? "#888" }} />
      <span className="truncate">{name ?? team?.school ?? "Bye"}</span>
    </span>
  );
}
