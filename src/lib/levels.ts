// Daraja formulasi SQL bilan bir xil bo'lishi shart: xp(n) = 50 * n * (n - 1)
export const xpForLevel = (n: number) => 50 * n * (n - 1);

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + Math.max(xp, 0) / 12.5)) / 2));
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    start,
    next,
    into: xp - start,
    span: next - start,
    pct: Math.min(100, Math.max(0, ((xp - start) / (next - start)) * 100)),
  };
}

export const LEVEL_TITLES: { from: number; title: string }[] = [
  { from: 1, title: "Yangi kuzatuvchi" },
  { from: 3, title: "Yulduz izlovchi" },
  { from: 5, title: "Kashshof" },
  { from: 8, title: "Orbita sayohatchisi" },
  { from: 10, title: "Kosmonavt" },
  { from: 15, title: "Galaktika tadqiqotchisi" },
  { from: 20, title: "Koinot ustasi" },
  { from: 30, title: "Kosmik afsona" },
];

export function levelTitle(level: number) {
  let t = LEVEL_TITLES[0].title;
  for (const x of LEVEL_TITLES) if (level >= x.from) t = x.title;
  return t;
}

// Jamoa darajasi: a'zolar soniga ko'ra sekinroq o'sadi (SQL: level_from_xp(xp / 3))
export const teamLevel = (xp: number) => levelFromXp(Math.floor(xp / 3));

export const STREAK_MILESTONES = [
  { days: 3, xp: 20 },
  { days: 7, xp: 50 },
  { days: 14, xp: 100 },
  { days: 30, xp: 250 },
  { days: 50, xp: 400 },
  { days: 100, xp: 1000 },
];

export const DIFFICULTY_LABEL: Record<string, string> = {
  oson: "Oson",
  orta: "O‘rtacha",
  qiyin: "Qiyin",
};

export const DIFFICULTY_STYLE: Record<string, string> = {
  oson: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  orta: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  qiyin: "text-rose-300 border-rose-400/30 bg-rose-400/10",
};
