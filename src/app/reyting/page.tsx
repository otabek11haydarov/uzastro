"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, Empty, PageHeader, Spinner } from "@/components/ui";
import { getSupabase } from "@/lib/supabase";
import type { LeaderRow, TeamRank } from "@/lib/types";
import { useApp } from "@/components/AppProvider";

const TABS = [
  { id: "weekly", label: "Haftalik reyting" },
  { id: "monthly", label: "Oylik reyting" },
  { id: "all", label: "Umumiy reyting" },
  { id: "teams", label: "Jamoalar reytingi" },
] as const;

const PODIUM = [
  { medal: "🥇", ring: "from-amber-300 to-yellow-600", h: "h-36", order: "order-2" },
  { medal: "🥈", ring: "from-slate-200 to-slate-500", h: "h-28", order: "order-1" },
  { medal: "🥉", ring: "from-orange-300 to-orange-700", h: "h-24", order: "order-3" },
];

export default function ReytingPage() {
  const { user } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("weekly");
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [teams, setTeams] = useState<TeamRank[] | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    setRows(null);
    setTeams(null);
    if (tab === "teams") sb.rpc("team_leaderboard", { p_limit: 50 }).then(({ data }) => setTeams((data as TeamRank[]) ?? []));
    else sb.rpc("leaderboard", { p_period: tab, p_limit: 50 }).then(({ data }) => setRows((data as LeaderRow[]) ?? []));
  }, [tab]);

  const top = rows?.slice(0, 3) ?? [];
  const rest = rows?.slice(3) ?? [];

  return (
    <div>
      <PageHeader title="Reyting" subtitle="Eng faol kosmik tadqiqotchilar va jamoalar." />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-semibold transition ${tab === t.id ? "border-neon/50 bg-gradient-to-r from-neon/25 to-nova/25 shadow-neon" : "border-white/10 bg-white/5 text-snow/60"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "teams" && (
        <>
          {!rows && <Spinner />}
          {rows?.length === 0 && <Empty text={tab === "all" ? "Hali hech kim yo‘q." : "Bu davrda hali XP yig‘ilmagan. Birinchi bo‘ling!"} />}

          {top.length > 0 && (
            <div className="mb-6 grid grid-cols-3 items-end gap-2 sm:gap-4">
              {top.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className={`${PODIUM[i].order} text-center`}>
                  <div className="mb-2 flex flex-col items-center">
                    <div className={`rounded-full bg-gradient-to-br p-1 ${PODIUM[i].ring} ${i === 0 ? "shadow-[0_0_40px_rgba(251,191,36,.5)]" : ""}`}>
                      <Avatar p={r} size={i === 0 ? 72 : 56} />
                    </div>
                    <div className="mt-2 max-w-full truncate text-sm font-semibold">{r.display_name}</div>
                    <div className="text-xs text-neon">{r.xp} XP</div>
                  </div>
                  <div className={`glass flex ${PODIUM[i].h} items-start justify-center rounded-b-none pt-3 text-3xl`}>{PODIUM[i].medal}</div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {rest.map((r) => (
              <div key={r.id} className={`glass flex items-center gap-3 p-3 ${r.id === user?.id ? "!border-neon/60" : ""}`}>
                <div className="w-8 text-center font-display font-bold text-snow/60">{r.rank}</div>
                <Avatar p={r} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{r.display_name}</div>
                  <div className="text-xs text-snow/50">@{r.username} · {r.level}-daraja</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neon">{r.xp} XP</div>
                  <div className="text-xs text-snow/50">{r.quests_done} vazifa</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "teams" && (
        <>
          {!teams && <Spinner />}
          {teams?.length === 0 && <Empty text="Hali jamoalar yo‘q. Birinchi jamoani yarating!" icon="👥" />}
          <div className="space-y-2">
            {teams?.map((t) => (
              <Link key={t.id} href={`/jamoalar/${t.id}`} className="glass glass-hover flex items-center gap-3 p-3">
                <div className="w-8 text-center font-display font-bold text-snow/60">{t.rank <= 3 ? ["🥇", "🥈", "🥉"][t.rank - 1] : t.rank}</div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl" style={{ background: `${t.color}33`, border: `1px solid ${t.color}88` }}>
                  {t.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{t.name}</div>
                  <div className="text-xs text-snow/50">{t.members} a’zo · {t.level}-daraja</div>
                </div>
                <div className="font-semibold text-neon">{t.xp} XP</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
