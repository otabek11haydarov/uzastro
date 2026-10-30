"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Avatar, Spinner, XpBar } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { getSupabase } from "@/lib/supabase";
import { TOPICS, UNIVERSE_FACTS } from "@/lib/content";
import { DIFFICULTY_LABEL, DIFFICULTY_STYLE, levelTitle } from "@/lib/levels";
import type { LeaderRow, Quest } from "@/lib/types";

const Planet3D = dynamic(() => import("@/components/Planet3D"), { ssr: false, loading: () => <Spinner label="" /> });

interface Stats {
  users: number;
  quests: number;
  teams: number;
}
interface RecentAch {
  earned_at: string;
  profiles: { display_name: string; avatar_emoji: string; avatar_url: string | null } | null;
  achievements: { title: string; icon: string } | null;
}

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Tashkent" }));
  if (h < 5) return "Xayrli tun";
  if (h < 12) return "Xayrli tong";
  if (h < 18) return "Xayrli kun";
  return "Xayrli kech";
}

export default function HomePage() {
  const { user, profile, loading } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [top, setTop] = useState<LeaderRow[]>([]);
  const [recent, setRecent] = useState<RecentAch[]>([]);

  const fact = useMemo(() => {
    const d = Math.floor(Date.now() / 86400000);
    return UNIVERSE_FACTS[d % UNIVERSE_FACTS.length];
  }, []);

  useEffect(() => {
    getSupabase()
      .rpc("public_stats")
      .then(({ data }) => data && setStats(data as Stats));
  }, []);

  useEffect(() => {
    if (!user) return;
    const sb = getSupabase();
    sb.rpc("my_daily_quests").then(({ data }) => setQuests((data as Quest[]) ?? []));
    sb.rpc("leaderboard", { p_period: "weekly", p_limit: 5 }).then(({ data }) => setTop((data as LeaderRow[]) ?? []));
    sb.from("user_achievements")
      .select("earned_at, profiles(display_name, avatar_emoji, avatar_url), achievements(title, icon)")
      .order("earned_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecent((data as unknown as RecentAch[]) ?? []));
  }, [user]);

  const StatsRow = (
    <div className="grid grid-cols-3 gap-3">
      {[
        { l: "Foydalanuvchilar", v: stats?.users },
        { l: "Bajarilgan vazifalar", v: stats?.quests },
        { l: "Jamoalar", v: stats?.teams },
      ].map((s) => (
        <div key={s.l} className="glass p-3 text-center sm:p-4">
          <div className="font-display text-2xl font-bold text-gradient sm:text-3xl">{s.v ?? "—"}</div>
          <div className="text-[11px] text-snow/55 sm:text-xs">{s.l}</div>
        </div>
      ))}
    </div>
  );

  // ---- Tizimga kirmagan foydalanuvchi uchun landing ----
  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-5 pb-16">
        <header className="flex items-center justify-between py-5">
          <Logo />
          <Link href="/kirish" className="btn-ghost">Kirish</Link>
        </header>
        <section className="grid items-center gap-6 py-6 md:grid-cols-2 md:py-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <span className="chip !border-neon/30 !text-neon">✦ Kosmik ta’lim platformasi</span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-6xl">
              Koinotni <span className="text-gradient">kashf et.</span>
              <br />
              Kelajakni <span className="text-gradient">yarat.</span>
            </h1>
            <p className="mt-4 max-w-lg text-snow/70">
              UzAstro — astronomiyani o‘rganing, kunlik vazifalarni bajaring, XP yig‘ing, jamoa tuzing va AI yordamchi bilan koinot sirlarini birga kashf eting.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kirish" className="btn-primary">Boshlash</Link>
              <Link href="/kirish" className="btn-ghost">Koinotni kashf et</Link>
            </div>
          </motion.div>
          <Planet3D level={8} className="h-[340px] md:h-[460px]" />
        </section>
        {StatsRow}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.slice(0, 4).map((t) => (
            <div key={t.slug} className="glass p-5">
              <div className="text-3xl">{t.emoji}</div>
              <h3 className="mt-2 font-display font-bold">{t.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-snow/60">{t.intro}</p>
            </div>
          ))}
        </section>
        <p className="glass mt-8 p-5 text-center text-snow/75">💫 {fact}</p>
      </div>
    );
  }

  if (loading || !profile) return <Spinner />;

  const pending = quests.filter((q) => !q.done);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="glass relative overflow-hidden">
        <div className="grid items-center md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 md:p-10">
            <p className="text-sm text-neon">{greeting()},</p>
            <h1 className="font-display text-3xl font-bold md:text-5xl">
              <span className="text-gradient">{profile.display_name}</span> 👋
            </h1>
            <p className="mt-2 text-snow/65">
              {profile.level}-daraja · {levelTitle(profile.level)}. UzAstro — koinotni kashf et, kelajakni yarat.
            </p>
            <div className="mt-4 max-w-sm"><XpBar xp={profile.xp} /></div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/vazifalar" className="btn-primary">Boshlash</Link>
              <Link href="/kashfiyotlar" className="btn-ghost">Koinotni kashf et</Link>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="chip !border-orange-400/30 !text-orange-200"><span className="flame">🔥</span> {profile.streak} kunlik seriya</span>
              <span className="chip">✅ {profile.quests_done} vazifa</span>
            </div>
          </motion.div>
          <Planet3D level={profile.level} className="h-[300px] md:h-[400px]" />
        </div>
      </section>

      {StatsRow}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Kunlik vazifa */}
        <section className="glass p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Kunlik vazifa</h2>
            <Link href="/vazifalar" className="text-sm text-neon hover:underline">Hammasi →</Link>
          </div>
          {quests.length === 0 && <Spinner />}
          {quests.length > 0 && pending.length === 0 && <p className="py-6 text-center text-snow/70">🎉 Bugungi barcha vazifalar bajarildi! Ertaga yangilari paydo bo‘ladi.</p>}
          <div className="space-y-2.5">
            {pending.slice(0, 3).map((q) => (
              <Link key={q.id} href="/vazifalar" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-neon/40">
                <span className="text-3xl">{q.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{q.title}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${DIFFICULTY_STYLE[q.difficulty]}`}>{DIFFICULTY_LABEL[q.difficulty]}</span>
                </div>
                <span className="chip !border-neon/30 !text-neon">+{q.xp} XP</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top */}
        <section className="glass p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Hafta topi</h2>
            <Link href="/reyting" className="text-sm text-neon hover:underline">Reyting →</Link>
          </div>
          {top.length === 0 && <p className="text-sm text-snow/50">Bu hafta hali XP yig‘ilmagan.</p>}
          <ul className="space-y-2.5">
            {top.map((r, i) => (
              <li key={r.id} className="flex items-center gap-3">
                <span className="w-5 text-center">{["🥇", "🥈", "🥉"][i] ?? r.rank}</span>
                <Avatar p={r} size={34} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.display_name}</span>
                <span className="text-xs text-neon">{r.xp} XP</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Mashhur kashfiyotlar */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Mashhur kashfiyotlar</h2>
          <Link href="/kashfiyotlar" className="text-sm text-neon hover:underline">Barchasi →</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TOPICS.map((t) => (
            <Link key={t.slug} href={`/kashfiyotlar/${t.slug}`} className="glass glass-hover w-48 shrink-0 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ background: `radial-gradient(circle at 30% 30%, ${t.from}, ${t.to})` }}>{t.emoji}</div>
              <div className="mt-3 font-semibold">{t.title}</div>
              <div className="text-xs text-snow/50">{t.subtitle}</div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="glass p-5">
          <h2 className="mb-3 font-display text-xl font-bold">So‘nggi yutuqlar</h2>
          {recent.length === 0 && <p className="text-sm text-snow/50">Hozircha yutuqlar yo‘q.</p>}
          <ul className="space-y-2.5">
            {recent.map((r, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="text-2xl">{r.achievements?.icon}</span>
                <span className="min-w-0 flex-1">
                  <b>{r.profiles?.display_name}</b> — {r.achievements?.title}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="glass relative overflow-hidden p-5">
          <h2 className="mb-3 font-display text-xl font-bold">Koinot haqida fakt</h2>
          <p className="text-lg leading-relaxed text-snow/85">✨ {fact}</p>
          <Link href="/ai" className="btn-ghost mt-4">AI Yordamchidan so‘rash</Link>
        </section>
      </div>
    </div>
  );
}
