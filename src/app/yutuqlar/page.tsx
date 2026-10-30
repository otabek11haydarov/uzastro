"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, Spinner } from "@/components/ui";
import { getSupabase } from "@/lib/supabase";
import { useApp } from "@/components/AppProvider";
import type { Achievement } from "@/lib/types";

export default function YutuqlarPage() {
  const { user, profile } = useApp();
  const [list, setList] = useState<Achievement[] | null>(null);
  const [earned, setEarned] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const sb = getSupabase();
    Promise.all([
      sb.from("achievements").select("*").order("sort"),
      sb.from("user_achievements").select("code, earned_at").eq("user_id", user.id),
    ]).then(([a, u]) => {
      setList((a.data as Achievement[]) ?? []);
      setEarned(Object.fromEntries((u.data ?? []).map((x: { code: string; earned_at: string }) => [x.code, x.earned_at])));
    });
  }, [user, profile?.xp]);

  const progressOf = (a: Achievement): number => {
    if (!profile) return 0;
    switch (a.kind) {
      case "quests": return profile.quests_done;
      case "streak": return profile.longest_streak;
      case "correct": return profile.correct_answers;
      case "hard": return profile.hard_done;
      case "level": return profile.level;
      default: return 0;
    }
  };

  const count = Object.keys(earned).length;

  return (
    <div>
      <PageHeader title="Yutuqlar" subtitle="Maqsadlarni bajaring va noyob nishonlarni qo‘lga kiriting." right={<span className="chip !border-amber-300/40 !text-amber-200">🏆 {count} / {list?.length ?? 0}</span>} />
      {!list && <Spinner />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list?.map((a, i) => {
          const got = earned[a.code];
          const prog = Math.min(progressOf(a), a.threshold);
          const trackable = ["quests", "streak", "correct", "hard", "level"].includes(a.kind);
          return (
            <motion.div
              key={a.code}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4, rotate: got ? 0.6 : 0 }}
              className={`glass relative overflow-hidden p-5 ${got ? "!border-amber-300/50 shadow-[0_0_30px_rgba(251,191,36,.18)]" : ""}`}
            >
              <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-4xl ${got ? "bg-gradient-to-br from-amber-300/30 to-nova/30" : "bg-white/5 grayscale"}`}>
                {a.icon}
              </div>
              <h3 className="font-display text-lg font-bold">{a.title}</h3>
              <p className="mt-1 text-sm text-snow/60">{a.description}</p>
              <div className="mt-3 text-xs text-snow/45">
                Shart: {a.threshold} {a.kind === "streak" ? "kun" : a.kind === "level" ? "daraja" : "ta"} {a.xp_reward > 0 && `· mukofot +${a.xp_reward} XP`}
              </div>
              {got ? (
                <div className="mt-3 chip !border-amber-300/40 !text-amber-200">
                  ✓ {new Date(got).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              ) : (
                <div className="mt-3">
                  {trackable && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="xp-bar h-full rounded-full" style={{ width: `${(prog / a.threshold) * 100}%` }} />
                    </div>
                  )}
                  <div className="mt-1.5 text-xs text-snow/45">{trackable ? `${prog} / ${a.threshold}` : "🔒 Qulflangan"}</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
