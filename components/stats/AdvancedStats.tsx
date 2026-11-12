"use client";

import { InfoTip } from "@/components/info/InfoTip";
import { useGarbageTime } from "@/components/stats/GarbageTime";
import type { AdvancedCell } from "@/lib/cfp/types";
import { loadAdvanced, statCatalog } from "@/lib/load";

type CatalogEntry = {
  label: string;
  help: string;
  digits?: number;
  suffix?: string;
  garbageTimeAware?: boolean;
  higherIsBetterOffense?: boolean;
  higherIsBetterDefense?: boolean;
};

const catalog = statCatalog as Record<string, CatalogEntry>;
const advanced = loadAdvanced();
const keys = Object.keys(catalog).filter((key) => catalog[key].garbageTimeAware);

function show(cell: AdvancedCell | undefined, key: string) {
  if (!cell || cell.value == null) return "—";
  const entry = catalog[key];
  return `${cell.value.toFixed(entry.digits ?? 1)}${entry.suffix ?? ""}${cell.rank ? ` (#${cell.rank})` : ""}`;
}

function rankEdge(left: number | null | undefined, right: number | null | undefined) {
  if (left == null || right == null) return null;
  if (left < right) return "left" as const;
  if (right < left) return "right" as const;
  return "tie" as const;
}

function edgeShade(edge: "left" | "right" | "tie" | null, side: "left" | "right") {
  if (!edge || edge === "tie") return "";
  return edge === side
    ? "rounded-md bg-emerald-600/15 px-2 py-1 text-emerald-800 dark:text-emerald-200"
    : "rounded-md bg-red-600/15 px-2 py-1 text-red-800 dark:text-red-200";
}

function edgeName(edge: "left" | "right" | "tie" | null, leftName: string, rightName: string) {
  if (edge === "left") return leftName;
  if (edge === "right") return rightName;
  if (edge === "tie") return "Even";
  return "—";
}

export function AdvancedTeamTable({ teamId }: { teamId: string }) {
  const { include } = useGarbageTime();
  const copy = advanced.teams[teamId]?.[include ? "withGT" : "noGT"];
  if (!copy) return null;
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-3xl">Advanced stats</h2>
        <p className="text-sm text-muted">{include ? "Every play is counted." : "Garbage time is left out."}</p>
      </div>
      <ul className="mt-3 grid gap-3 md:hidden">
        {keys.map((key) => (
          <li key={key} className="rounded-lg border border-line p-3 text-sm">
            <p className="inline-flex items-center font-medium">
              {catalog[key].label}
              <InfoTip label={`About ${catalog[key].label}`} text={catalog[key].help} />
            </p>
            <p className="mt-2">Offense <span className="nums">{show(copy.offense[key], key)}</span></p>
            <p>Defense <span className="nums">{show(copy.defense[key], key)}</span></p>
          </li>
        ))}
      </ul>
      <div className="mt-3 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 font-medium">Stat</th>
              <th className="py-2 font-medium">Offense</th>
              <th className="py-2 font-medium">Defense</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key} className="border-b border-line">
                <td className="py-1">
                  <span className="inline-flex items-center">
                    {catalog[key].label}
                    <InfoTip label={`About ${catalog[key].label}`} text={catalog[key].help} />
                  </span>
                </td>
                <td className="nums py-2">{show(copy.offense[key], key)}</td>
                <td className="nums py-2">{show(copy.defense[key], key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdvancedMatchup({ leftId, rightId, leftName, rightName }: { leftId: string; rightId: string; leftName: string; rightName: string }) {
  const { include } = useGarbageTime();
  const left = advanced.teams[leftId]?.[include ? "withGT" : "noGT"];
  const right = advanced.teams[rightId]?.[include ? "withGT" : "noGT"];
  if (!left || !right) return null;
  return (
    <section className="mt-8">
      <h2 className="text-3xl">Advanced stats</h2>
      <p className="mt-2 text-sm text-muted">
        {include ? "Every play is counted." : "Garbage time is left out."} Green is the better rank. A lower defensive rank is better when the help text says so.
      </p>
      <ul className="mt-3 grid gap-3 md:hidden">
        {keys.flatMap((key) =>
          (["offense", "defense"] as const).map((side) => {
            const edge = rankEdge(left[side][key]?.rank, right[side][key]?.rank);
            return (
              <li key={`${key}-${side}`} className="rounded-lg border border-line p-3 text-sm">
                <p className="font-medium">
                  {catalog[key].label} ({side})
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <p>
                    <span className="block text-xs leading-4 text-muted">{leftName}</span>
                    <span className={`nums mt-1 block ${edgeShade(edge, "left")}`}>{show(left[side][key], key)}</span>
                  </p>
                  <p>
                    <span className="block text-xs leading-4 text-muted">{rightName}</span>
                    <span className={`nums mt-1 block ${edgeShade(edge, "right")}`}>{show(right[side][key], key)}</span>
                  </p>
                </div>
                <p className="mt-2">Edge: {edgeName(edge, leftName, rightName)}</p>
              </li>
            );
          }),
        )}
      </ul>
      <div className="mt-3 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 font-medium">Stat</th>
              <th className="py-2 font-medium">{leftName}</th>
              <th className="py-2 font-medium">{rightName}</th>
              <th className="py-2 font-medium">Edge</th>
            </tr>
          </thead>
          <tbody>
            {keys.flatMap((key) =>
              (["offense", "defense"] as const).map((side) => {
                const edge = rankEdge(left[side][key]?.rank, right[side][key]?.rank);
                return (
                  <tr key={`${key}-${side}`} className="border-b border-line">
                    <td className="py-2">
                      {catalog[key].label} ({side})
                    </td>
                    <td className={`nums py-2 ${edgeShade(edge, "left")}`}>{show(left[side][key], key)}</td>
                    <td className={`nums py-2 ${edgeShade(edge, "right")}`}>{show(right[side][key], key)}</td>
                    <td className="py-2">{edgeName(edge, leftName, rightName)}</td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
