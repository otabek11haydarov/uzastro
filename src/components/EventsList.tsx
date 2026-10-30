"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { SpaceEvent } from "@/lib/types";
import { Spinner } from "./ui";

const KIND: Record<string, { icon: string; label: string }> = {
  meteor: { icon: "☄️", label: "Meteor oqimi" },
  eclipse: { icon: "🌘", label: "Tutilish" },
  conjunction: { icon: "🪐", label: "Sayyoralar birikuvi" },
  mission: { icon: "🚀", label: "Missiya" },
};

export default function EventsList() {
  const [events, setEvents] = useState<SpaceEvent[] | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    getSupabase()
      .from("space_events")
      .select("*")
      .gte("starts_on", today)
      .order("starts_on")
      .limit(8)
      .then(({ data }) => setEvents((data as SpaceEvent[]) ?? []));
  }, []);

  return (
    <section className="glass p-5">
      <h2 className="font-display text-xl font-bold">Kosmik voqealar</h2>
      <p className="mb-3 text-xs text-snow/50">Yaqinlashayotgan astronomik hodisalar</p>
      {!events && <Spinner />}
      {events?.length === 0 && <p className="text-sm text-snow/55">Hozircha rejalashtirilgan voqealar yo‘q.</p>}
      <ul className="space-y-3">
        {events?.map((e) => (
          <li key={e.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-2xl">{KIND[e.kind]?.icon ?? "✨"}</div>
            <div className="min-w-0">
              <div className="font-semibold">{e.title}</div>
              <div className="text-xs text-neon">
                {new Date(e.starts_on).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })} · {KIND[e.kind]?.label}
              </div>
              <p className="mt-1 text-sm text-snow/65">{e.description}</p>
              {e.note && <p className="mt-1 text-xs text-snow/40">{e.note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
