import { emptyScenario, type Scenario } from "./types";

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeScenario(scenario: Scenario) {
  return toBase64Url(JSON.stringify(scenario));
}

export function decodeScenario(value: string): Scenario | null {
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as Partial<Scenario>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      picks: parsed.picks ?? {},
      winOut: Array.isArray(parsed.winOut) ? parsed.winOut : [],
      champPicks: parsed.champPicks ?? {},
      manualOrder: Array.isArray(parsed.manualOrder) ? parsed.manualOrder : null,
      playoffPicks: parsed.playoffPicks ?? {},
    };
  } catch {
    return null;
  }
}

export { emptyScenario };
