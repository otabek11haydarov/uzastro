"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui";
import { TOPICS } from "@/lib/content";
import { getSupabase } from "@/lib/supabase";
import { useApp } from "@/components/AppProvider";
import ApodCard from "@/components/ApodCard";
import EventsList from "@/components/EventsList";

export default function KashfiyotlarPage() {
  const { user } = useApp();
  const [studied, setStudied] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    getSupabase()
      .from("topic_progress")
      .select("topic")
      .then(({ data }) => setStudied((data ?? []).map((d: { topic: string }) => d.topic)));
  }, [user]);

  return (
    <div>
      <PageHeader title="Kashfiyotlar" subtitle="Koinot bo‘ylab sayohat qiling: mavzuni o‘rganing, testdan o‘ting va XP yig‘ing." right={<span className="chip">{studied.length} / {TOPICS.length} o‘rganildi</span>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TOPICS.map((t, i) => (
          <motion.div key={t.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={`/kashfiyotlar/${t.slug}`} className="glass glass-hover group relative block h-full overflow-hidden p-5">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-60 blur-2xl transition group-hover:opacity-90"
                style={{ background: `radial-gradient(circle, ${t.from}, ${t.to})` }}
              />
              <div
                className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-lg transition duration-500 group-hover:rotate-12 group-hover:scale-110"
                style={{ background: `radial-gradient(circle at 30% 30%, ${t.from}, ${t.to})` }}
              >
                {t.emoji}
              </div>
              <h2 className="relative font-display text-lg font-bold">{t.title}</h2>
              <p className="relative mt-0.5 text-xs text-neon">{t.subtitle}</p>
              <p className="relative mt-2 line-clamp-3 text-sm text-snow/60">{t.intro}</p>
              {studied.includes(t.slug) && <span className="chip absolute right-3 top-3 !border-emerald-400/40 !text-emerald-300">✓ O‘rganilgan</span>}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ApodCard />
        <EventsList />
      </div>
    </div>
  );
}
