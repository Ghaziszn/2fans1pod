export function rankingsIntro(hasPoll: boolean, label: string, checked: string, elo: string) {
  if (!hasPoll) {
    return "The committee has not released a poll yet. This order is Elo only. It is not a committee ranking.";
  }
  return `${label}. The top 25 below is the committee poll. Teams after 25 follow ${elo}. Data checked ${checked}.`;
}

export function top25TeamIds(cfp: { teamId: string }[], order: string[]) {
  if (cfp.length > 0) return cfp.map((row) => row.teamId);
  return order.slice(0, 25);
}

export function simulatorRankNote(hasPoll: boolean, elo: string) {
  if (!hasPoll) {
    return " There is no CFP poll yet, so the starting order is Elo only. It is not a committee ranking.";
  }
  return ` Teams outside the top 25 are ordered by ${elo}.`;
}
