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
      <div className="mt-3 overflow-x-auto">
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
      <p className="mt-2 text-sm text-muted">{include ? "Every play is counted." : "Garbage time is left out."} A lower defensive rank is better when the help text says so.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 font-medium">Stat</th>
              <th className="py-2 font-medium">{leftName}</th>
              <th className="py-2 font-medium">{rightName}</th>
            </tr>
          </thead>
          <tbody>
            {keys.flatMap((key) =>
              (["offense", "defense"] as const).map((side) => (
                <tr key={`${key}-${side}`} className="border-b border-line">
                  <td className="py-2">
                    {catalog[key].label} ({side})
                  </td>
                  <td className="nums py-2">{show(left[side][key], key)}</td>
                  <td className="nums py-2">{show(right[side][key], key)}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
