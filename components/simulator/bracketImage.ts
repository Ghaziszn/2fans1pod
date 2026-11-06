import { teamInk } from "@/components/team/TeamMark";
import type { BracketSlot, Team } from "@/lib/cfp/types";

const ROW = 46;
const MATCH = ROW * 2;
const GAP = 80;
const GAME_W = 168;
const ELBOW = 36;
const PAIR = 40;
const PAD_X = 40;
const PAD_TOP = 72;
const MARK = 42;
const MARK_PAD = 28;
const INK = "#16181d";
const PAPER = "#f4f2ec";
const SURFACE = "#fffcf7";

const COLUMN = MATCH * 2 + GAP;

export async function renderBracketPng(slots: BracketSlot[], teams: Map<string, Team>) {
  const byId = new Map(slots.map((slot) => [slot.id, slot]));
  const [logos, brand] = await Promise.all([loadLogos(slots, teams), loadImage("/brand/logo.jpg")]);
  const width = PAD_X * 2 + GAME_W * 7 + ELBOW * 4 + PAIR * 2;
  const treeBottom = PAD_TOP + COLUMN;
  const height = treeBottom + 24 + MARK + MARK_PAD;
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the bracket.");
  ctx.scale(2, 2);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = INK;
  ctx.font = "600 22px Arial, sans-serif";
  ctx.fillText("2fans1pod", PAD_X, 36);

  const topY = PAD_TOP;
  const left = layoutHalf("left", PAD_X);
  drawHalf(ctx, byId, teams, logos, "left", left, topY);
  const finalX = left.sf + GAME_W + ELBOW;
  drawGameElbow(ctx, left.sf + GAME_W, centerY(topY), "right");
  drawMatch(ctx, byId.get("final"), teams, logos, finalX, centerY(topY));
  ctx.fillStyle = "#5e6470";
  ctx.font = "600 11px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CHAMPIONSHIP", finalX + GAME_W / 2, centerY(topY) - 14);
  ctx.textAlign = "left";
  const champ = byId.get("final")?.winnerId ? teams.get(byId.get("final")!.winnerId!) : undefined;
  if (champ) drawChampion(ctx, champ, logos, finalX, centerY(topY) + MATCH + 16);
  drawGameElbow(ctx, finalX + GAME_W, centerY(topY), "left");
  drawHalf(ctx, byId, teams, logos, "right", layoutHalf("right", finalX + GAME_W + ELBOW), topY);
  drawWatermark(ctx, brand, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not save the bracket picture.");
  return blob;
}

function drawWatermark(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, width: number, height: number) {
  const label = "2fans1pod";
  ctx.font = "600 22px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const gap = 10;
  const textW = ctx.measureText(label).width;
  const blockW = (logo ? MARK + gap : 0) + textW;
  const x = width - MARK_PAD - blockW;
  const y = height - MARK_PAD - MARK;
  if (logo) ctx.drawImage(logo, x, y, MARK, MARK);
  ctx.fillStyle = INK;
  ctx.fillText(label, x + (logo ? MARK + gap : 0), y + MARK / 2);
}

function centerY(topY: number) {
  return topY + (COLUMN - MATCH) / 2;
}

function layoutHalf(side: "left" | "right", start: number) {
  if (side === "left") {
    return { r1: start, qf: start + GAME_W + ELBOW, sf: start + GAME_W + ELBOW + GAME_W + PAIR };
  }
  return { sf: start, qf: start + GAME_W + PAIR, r1: start + GAME_W + PAIR + GAME_W + ELBOW };
}

function drawHalf(
  ctx: CanvasRenderingContext2D,
  byId: Map<string, BracketSlot>,
  teams: Map<string, Team>,
  logos: Map<string, HTMLImageElement>,
  side: "left" | "right",
  x: { r1: number; qf: number; sf: number },
  topY: number,
) {
  const top = side === "left" ? ["r1-8-9", "qf-1"] : ["r1-7-10", "qf-2"];
  const bottom = side === "left" ? ["r1-5-12", "qf-4"] : ["r1-6-11", "qf-3"];
  const semi = side === "left" ? "sf-1" : "sf-2";
  const bottomY = topY + MATCH + GAP;
  if (side === "left") {
    drawMatch(ctx, byId.get(top[0]), teams, logos, x.r1, topY);
    drawGameElbow(ctx, x.r1 + GAME_W, topY, "right");
    drawMatch(ctx, byId.get(top[1]), teams, logos, x.qf, topY);
    drawMatch(ctx, byId.get(bottom[0]), teams, logos, x.r1, bottomY);
    drawGameElbow(ctx, x.r1 + GAME_W, bottomY, "right");
    drawMatch(ctx, byId.get(bottom[1]), teams, logos, x.qf, bottomY);
    drawPairElbow(ctx, x.qf + GAME_W, topY, "right");
  } else {
    drawMatch(ctx, byId.get(top[1]), teams, logos, x.qf, topY);
    drawGameElbow(ctx, x.qf + GAME_W, topY, "left");
    drawMatch(ctx, byId.get(top[0]), teams, logos, x.r1, topY);
    drawMatch(ctx, byId.get(bottom[1]), teams, logos, x.qf, bottomY);
    drawGameElbow(ctx, x.qf + GAME_W, bottomY, "left");
    drawMatch(ctx, byId.get(bottom[0]), teams, logos, x.r1, bottomY);
    drawPairElbow(ctx, x.sf + GAME_W, topY, "left");
  }
  drawMatch(ctx, byId.get(semi), teams, logos, x.sf, centerY(topY));
}

function drawGameElbow(ctx: CanvasRenderingContext2D, x: number, y: number, toward: "left" | "right") {
  const top = y + ROW / 2;
  const bottom = y + ROW + ROW / 2;
  const mid = y + MATCH / 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (toward === "right") {
    ctx.moveTo(x, top);
    ctx.lineTo(x + 18, top);
    ctx.lineTo(x + 18, bottom);
    ctx.lineTo(x, bottom);
    ctx.moveTo(x + 18, mid);
    ctx.lineTo(x + ELBOW, mid);
  } else {
    ctx.moveTo(x + ELBOW, top);
    ctx.lineTo(x + ELBOW - 18, top);
    ctx.lineTo(x + ELBOW - 18, bottom);
    ctx.lineTo(x + ELBOW, bottom);
    ctx.moveTo(x + ELBOW - 18, mid);
    ctx.lineTo(x, mid);
  }
  ctx.stroke();
}

function drawPairElbow(ctx: CanvasRenderingContext2D, x: number, topY: number, toward: "left" | "right") {
  const y1 = topY + MATCH / 2;
  const y2 = topY + MATCH + GAP + MATCH / 2;
  const mid = (y1 + y2) / 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (toward === "right") {
    ctx.moveTo(x, y1);
    ctx.lineTo(x + 20, y1);
    ctx.lineTo(x + 20, y2);
    ctx.lineTo(x, y2);
    ctx.moveTo(x + 20, mid);
    ctx.lineTo(x + PAIR, mid);
  } else {
    ctx.moveTo(x + PAIR, y1);
    ctx.lineTo(x + PAIR - 20, y1);
    ctx.lineTo(x + PAIR - 20, y2);
    ctx.lineTo(x + PAIR, y2);
    ctx.moveTo(x + PAIR - 20, mid);
    ctx.lineTo(x, mid);
  }
  ctx.stroke();
}

function drawMatch(
  ctx: CanvasRenderingContext2D,
  slot: BracketSlot | undefined,
  teams: Map<string, Team>,
  logos: Map<string, HTMLImageElement>,
  x: number,
  y: number,
) {
  const sides = slot
    ? [
        { id: slot.teamA, seed: slot.seedA },
        { id: slot.teamB, seed: slot.seedB },
      ].filter((side) => side.id)
    : [];
  ctx.fillStyle = SURFACE;
  ctx.fillRect(x, y, GAME_W, MATCH);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, GAME_W - 2, MATCH - 2);
  sides.forEach((side, index) => {
    const team = side.id ? teams.get(side.id) : undefined;
    const selected = Boolean(slot?.winnerId && slot.winnerId === side.id);
    const rowH = sides.length === 1 ? MATCH : ROW;
    const rowY = y + index * ROW;
    if (selected && team) {
      ctx.fillStyle = team.color;
      ctx.fillRect(x + 2, rowY + (index === 0 ? 2 : 0), GAME_W - 4, rowH - (sides.length === 1 ? 4 : index === 0 ? 2 : 2));
    }
    if (index > 0) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, rowY);
      ctx.lineTo(x + GAME_W, rowY);
      ctx.stroke();
    }
    const ink = selected && team ? teamInk(team.color) : INK;
    ctx.globalAlpha = selected ? 1 : 0.45;
    ctx.fillStyle = ink;
    ctx.font = "700 13px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(side.seed ?? "–"), x + 16, rowY + rowH / 2);
    const logo = side.id ? logos.get(side.id) : undefined;
    if (logo) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 28, rowY + (rowH - 26) / 2, 26, 26);
      ctx.drawImage(logo, x + 30, rowY + (rowH - 22) / 2, 22, 22);
    }
    ctx.fillStyle = ink;
    ctx.font = "600 15px Arial, sans-serif";
    ctx.textAlign = "left";
    const name = team?.school ?? side.id ?? "";
    ctx.fillText(fitText(ctx, name, GAME_W - 64), x + 58, rowY + rowH / 2);
    ctx.globalAlpha = 1;
  });
}

function drawChampion(ctx: CanvasRenderingContext2D, team: Team, logos: Map<string, HTMLImageElement>, x: number, y: number) {
  const ink = teamInk(team.color);
  ctx.font = "700 16px Arial, sans-serif";
  const label = team.school;
  const boxW = Math.max(GAME_W, ctx.measureText(label).width + 48);
  const boxX = x + GAME_W / 2 - boxW / 2;
  ctx.fillStyle = team.color;
  ctx.fillRect(boxX, y, boxW, 36);
  const logo = logos.get(team.id);
  if (logo) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(boxX + 6, y + 6, 24, 24);
    ctx.drawImage(logo, boxX + 8, y + 8, 20, 20);
  }
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, boxX + 36, y + 18);
  ctx.fillStyle = INK;
  ctx.font = "600 12px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CHAMPION", x + GAME_W / 2, y + 52);
  ctx.textAlign = "left";
}

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > max) trimmed = trimmed.slice(0, -1);
  return `${trimmed}…`;
}

async function loadLogos(slots: BracketSlot[], teams: Map<string, Team>) {
  const ids = new Set<string>();
  for (const slot of slots) {
    if (slot.teamA) ids.add(slot.teamA);
    if (slot.teamB) ids.add(slot.teamB);
    if (slot.winnerId) ids.add(slot.winnerId);
  }
  const logos = new Map<string, HTMLImageElement>();
  await Promise.all(
    [...ids].map(async (id) => {
      const src = teams.get(id)?.logo;
      if (!src) return;
      const image = await loadImage(src);
      if (image) logos.set(id, image);
    }),
  );
  return logos;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}
