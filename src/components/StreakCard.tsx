"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { STREAK_MILESTONES } from "@/lib/levels";
import type { Profile } from "@/lib/types";

function todayIn(tz: string) {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
}

const WEEK = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export default function StreakCard({ profile }: { profile: Profile }) {
  const [days, setDays] = useState<Set<string>>(new Set());
  const today = todayIn(profile.timezone);
  const [y, m] = today.split("-").map(Number);

  useEffect(() => {
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    getSupabase()
      .from("activity_days")
      .select("day")
      .gte("day", from)
      .then(({ data }) => setDays(new Set((data ?? []).map((d: { day: string }) => d.day))));
  }, [y, m, profile.streak]);

  const first = new Date(Date.UTC(y, m - 1, 1));
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // dushanba = 0
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const monthName = first.toLocaleDateString("uz-UZ", { month: "long", year: "numeric", timeZone: "UTC" });

  const next = STREAK_MILESTONES.find((s) => s.days > profile.streak);
  const doneToday = profile.last_active_date === today;

  return (
    <section className="glass p-5">
      <div className="flex items-center gap-4">
        <motion.div key={profile.streak} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-6xl">
          <span className="flame">🔥</span>
        </motion.div>
        <div>
          <div className="font-display text-3xl font-bold">{profile.streak} kunlik seriya</div>
          <div className="text-sm text-snow/55">Eng uzun seriya: {profile.longest_streak} kun</div>
          <div className={`mt-1 text-xs ${doneToday ? "text-emerald-300" : "text-amber-300"}`}>
            {doneToday ? "✓ Bugun faolsiz — seriya saqlandi" : "Bugun biror vazifani bajaring — seriya uzilmasin!"}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold capitalize">{monthName}</span>
          <span className="text-xs text-snow/45">{days.size} kun faol</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px]">
          {WEEK.map((w) => (
            <div key={w} className="text-snow/35">{w}</div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const active = days.has(iso);
            const isToday = iso === today;
            return (
              <div
                key={iso}
                className={`flex aspect-square items-center justify-center rounded-lg border text-xs ${
                  active ? "border-orange-400/50 bg-orange-400/20 text-orange-100" : "border-white/5 bg-white/[0.03] text-snow/45"
                } ${isToday ? "ring-2 ring-neon" : ""}`}
                title={iso}
              >
                {active ? "🔥" : d}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs uppercase tracking-wider text-snow/45">Seriya mukofotlari</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STREAK_MILESTONES.map((s) => {
            const got = profile.longest_streak >= s.days;
            return (
              <div key={s.days} className={`rounded-xl border p-2 text-center text-xs ${got ? "border-amber-300/50 bg-amber-300/10" : "border-white/10 bg-white/5 text-snow/50"}`}>
                <div className="text-lg">{got ? "🏅" : "🔒"}</div>
                <div className="font-semibold">{s.days} kun</div>
                <div className="text-[10px]">+{s.xp} XP</div>
              </div>
            );
          })}
        </div>
        {next && <p className="mt-2 text-xs text-snow/50">Keyingi mukofot: {next.days} kunlik seriya (yana {next.days - profile.streak} kun).</p>}
      </div>
    </section>
  );
}
