"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TOPIC_BY_SLUG } from "@/lib/content";
import { errText, getSupabase } from "@/lib/supabase";
import { useApp } from "@/components/AppProvider";
import Quiz from "@/components/Quiz";

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const topic = TOPIC_BY_SLUG[slug];
  const { user, toast, refreshProfile } = useApp();
  const [studied, setStudied] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [quiz, setQuiz] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !topic) return;
    getSupabase()
      .from("topic_progress")
      .select("topic")
      .eq("topic", topic.slug)
      .maybeSingle()
      .then(({ data }) => setStudied(Boolean(data)));
  }, [user, topic]);

  if (!topic) return notFound();

  const markStudied = async () => {
    setBusy(true);
    const { data, error } = await getSupabase().rpc("study_topic", { p_topic: topic.slug });
    setBusy(false);
    if (error) return toast(errText(error), "err");
    setStudied(true);
    const xp = (data as { xp: number }).xp;
    toast(xp > 0 ? `Mavzu o‘rganildi! +${xp} XP` : "Mavzu allaqachon o‘rganilgan", xp > 0 ? "xp" : "ok");
    refreshProfile();
  };

  return (
    <div>
      <Link href="/kashfiyotlar" className="mb-4 inline-block text-sm text-snow/55 hover:text-neon">
        ← Barcha mavzular
      </Link>

      <div className="glass relative mb-6 overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-50 blur-3xl" style={{ background: `radial-gradient(circle, ${topic.from}, ${topic.to})` }} />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-5xl"
            style={{ background: `radial-gradient(circle at 30% 30%, ${topic.from}, ${topic.to})`, boxShadow: `0 0 50px ${topic.to}66` }}
          >
            {topic.emoji}
          </motion.div>
          <div>
            <h1 className="page-title">{topic.title}</h1>
            <p className="text-neon">{topic.subtitle}</p>
            <p className="mt-3 max-w-3xl text-snow/75">{topic.intro}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-xl font-bold">Ilmiy tushuntirish</h2>
          <div className="space-y-3 text-snow/75">
            {topic.explanation.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <h2 className="mb-3 mt-6 font-display text-xl font-bold">Interaktiv kartochkalar</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {topic.cards.map((c, i) => (
              <button
                key={c.title}
                onClick={() => setOpen(open === i ? null : i)}
                className={`rounded-2xl border p-4 text-left transition ${open === i ? "border-neon bg-neon/10 shadow-neon" : "border-white/10 bg-white/5 hover:border-neon/40"}`}
                aria-expanded={open === i}
              >
                <div className="font-semibold">{c.title}</div>
                <motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} className="overflow-hidden">
                  <p className="pt-2 text-sm text-snow/70">{c.text}</p>
                </motion.div>
                {open !== i && <div className="mt-1 text-xs text-snow/40">Bosib o‘qing</div>}
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="glass p-5">
            <h2 className="mb-3 font-display text-xl font-bold">Qiziqarli faktlar</h2>
            <ul className="space-y-2.5 text-sm text-snow/75">
              {topic.facts.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-neon">✦</span>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass p-5">
            <h2 className="mb-3 font-display text-xl font-bold">Bilimingizni sinang</h2>
            <button className="btn-ghost mb-2 w-full" onClick={markStudied} disabled={busy || studied}>
              {studied ? "✓ Mavzu o‘rganilgan" : "Mavzuni o‘rgandim (+15 XP)"}
            </button>
            <button className="btn-primary w-full" onClick={() => setQuiz(true)}>
              Testni boshlash
            </button>
            <p className="mt-2 text-xs text-snow/45">Har bir to‘g‘ri javob uchun 5 XP (mavzu uchun kuniga bir marta).</p>
          </section>
        </aside>
      </div>

      <Quiz open={quiz} title={`${topic.title}: test`} topic={topic.slug} count={4} onClose={() => setQuiz(false)} />
    </div>
  );
}
