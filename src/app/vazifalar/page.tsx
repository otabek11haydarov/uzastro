"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Empty, PageHeader, Spinner } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { errText, getSupabase } from "@/lib/supabase";
import { DIFFICULTY_LABEL, DIFFICULTY_STYLE } from "@/lib/levels";
import type { Quest } from "@/lib/types";
import Quiz from "@/components/Quiz";
import StreakCard from "@/components/StreakCard";

function useCountdown() {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      // Toshkent (UTC+5) yarim tuniga qolgan vaqt
      const now = Date.now();
      const tash = new Date(now + 5 * 3600 * 1000);
      const next = Date.UTC(tash.getUTCFullYear(), tash.getUTCMonth(), tash.getUTCDate() + 1) - 5 * 3600 * 1000;
      const s = Math.max(0, Math.floor((next - now) / 1000));
      const p = (n: number) => String(n).padStart(2, "0");
      setLeft(`${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

export default function VazifalarPage() {
  const { profile, toast, refreshUnread } = useApp();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [active, setActive] = useState<Quest | null>(null);
  const left = useCountdown();

  const load = useCallback(async () => {
    const { data, error } = await getSupabase().rpc("my_daily_quests");
    if (error) {
      toast(errText(error), "err");
      setQuests([]);
    } else setQuests((data as Quest[]) ?? []);
    refreshUnread();
  }, [toast, refreshUnread]);

  useEffect(() => {
    load();
  }, [load]);

  const done = quests?.filter((q) => q.done).length ?? 0;
  const total = quests?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Kunlik vazifalar"
        subtitle="Har kuni yangi vazifalar. Ular Toshkent vaqti bilan yarim tunda yangilanadi."
        right={<span className="chip !border-neon/30 !text-neon">⏳ Yangilanishga: {left}</span>}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <div className="glass flex items-center gap-4 p-4">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">Bugungi jarayon</span>
                <span className="text-snow/60">
                  {done} / {total}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="xp-bar h-full rounded-full" animate={{ width: total ? `${(done / total) * 100}%` : 0 }} />
              </div>
            </div>
            {done === total && total > 0 && <span className="text-2xl">🎉</span>}
          </div>

          {!quests && <Spinner />}
          {quests?.length === 0 && <Empty text="Hozircha vazifalar yo‘q. Ma’lumotlar bazasiga seed.sql yuklanganini tekshiring." />}
          {quests?.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`glass flex items-center gap-4 p-4 ${q.done ? "opacity-75" : "glass-hover"}`}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/20 to-nova/25 text-3xl">{q.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-bold">{q.title}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${DIFFICULTY_STYLE[q.difficulty]}`}>{DIFFICULTY_LABEL[q.difficulty]}</span>
                </div>
                <p className="mt-0.5 text-sm text-snow/60">{q.description}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="xp-bar h-full rounded-full" style={{ width: q.done ? "100%" : "0%" }} />
                  </div>
                  <span className="text-xs text-snow/50">{q.done ? `${q.score}/${q.total}` : `0/${q.need_correct}`}</span>
                  <span className="chip !border-neon/30 !text-neon">+{q.xp} XP</span>
                </div>
              </div>
              {q.done ? (
                <span className="chip !border-emerald-400/40 !text-emerald-300">✓ Bajarildi</span>
              ) : (
                <button className="btn-primary !px-4" onClick={() => setActive(q)}>
                  Bajarish
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2">{profile && <StreakCard profile={profile} />}</div>
      </div>

      {active && (
        <Quiz
          open
          title={active.title}
          topic={active.topic}
          count={active.question_count}
          questId={active.id}
          onClose={() => {
            setActive(null);
            load();
          }}
        />
      )}
    </div>
  );
}
