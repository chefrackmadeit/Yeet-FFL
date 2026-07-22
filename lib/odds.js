// ---------------------------------------------------------------------------
// For-fun odds & ratings. Purely cosmetic — not real gambling, no money.
// Everything is derived from Sleeper records + scoring, so it updates itself
// as the season progresses.
// ---------------------------------------------------------------------------

// Normal CDF via an erf approximation (Abramowitz & Stegun 7.1.26).
function erf(x) {
  const s = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return s * y;
}
function normCdf(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// Probability team A beats team B given projected points. Sigma models the
// weekly randomness of fantasy scoring.
export function winProbability(projA, projB, sigma = 30) {
  const p = normCdf((projA - projB) / sigma);
  return Math.min(0.97, Math.max(0.03, p));
}

// "$10 to win $X" — profit on a $10 stake at fair decimal odds (1/p).
export function tenToWin(p) {
  const profit = 10 * (1 / p - 1);
  return `$${profit.toFixed(2)}`;
}

// American moneyline from a probability, rounded to the nearest 5.
export function americanOdds(p) {
  if (p >= 0.5) {
    const v = Math.round((100 * p) / (1 - p) / 5) * 5;
    return `-${v}`;
  }
  const v = Math.round((100 * (1 - p)) / p / 5) * 5;
  return `+${v}`;
}

// Attach a league-title probability to each standings row, from a blend of
// win% and points-for (softmax so they sum to 100%).
export function attachTitleOdds(rows) {
  if (!rows.length) return rows;
  const pfs = rows.map((r) => r.pointsFor);
  const maxPF = Math.max(...pfs);
  const minPF = Math.min(...pfs);
  const span = maxPF - minPF || 1;
  const K = 6;
  const exps = rows.map((r) => {
    const pfNorm = (r.pointsFor - minPF) / span;
    const rating = 0.6 * r.winPct + 0.4 * pfNorm;
    return Math.exp(K * rating);
  });
  const sum = exps.reduce((a, b) => a + b, 0);
  rows.forEach((r, i) => {
    r.titleProb = exps[i] / sum;
  });
  return rows;
}
