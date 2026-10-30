"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Avatar, PageHeader, Spinner, StatCard, XpBar, timeAgo } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { getSupabase } from "@/lib/supabase";
import { levelProgress, levelTitle } from "@/lib/levels";
import type { Achievement } from "@/lib/types";

const Planet3D = dynamic(() => import("@/components/Planet3D"), { ssr: false, loading: () => <Spinner label="Sayyora yuklanmoqda..." /> });

interface XpEvent {
  id: number;
  amount: number;
  reason: string;
  created_at: string;
}

function reasonText(r: string) {
  if (r.startsWith("quest:")) return "Kunlik vazifa bajarildi";
  if (r.startsWith("topic_quiz:")) return "Mavzu testi";
  if (r.startsWith("study:")) return "Mavzu o‘rganildi";
  if (r.startsWith("achievement:")) return "Yutuq mukofoti";
  if (r.startsWith("streak:")) return `${r.split(":")[1]} kunlik seriya mukofoti`;
  return "XP";
}

export default function ProfilPage() {
  const { user, profile } = useApp();
  const [team, setTeam] = useState<{ id: string; name: string; emoji: string } | null>(null);
  const [events, setEvents] = useState<XpEvent[]>([]);
  const [badges, setBadges] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!user) return;
    const sb = getSupabase();
    sb.from("team_members").select("teams(id, name, emoji)").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      const t = (data as unknown as { teams: { id: string; name: string; emoji: string } } | null)?.teams;
      setTeam(t ?? null);
    });
    sb.from("xp_events").select("*").order("created_at", { ascending: false }).limit(10).then(({ data }) => setEvents((data as XpEvent[]) ?? []));
    sb.from("user_achievements").select("achievements(*)").eq("user_id", user.id).then(({ data }) =>
      setBadges(((data ?? []) as unknown as { achievements: Achievement }[]).map((x) => x.achievements).filter(Boolean)),
    );
  }, [user, profile?.xp]);

  if (!profile) return <Spinner />;
  const p = levelProgress(profile.xp);

  return (
    <div>
      <PageHeader title="Profil" right={<Link href="/sozlamalar" className="btn-ghost">Profilni tahrirlash</Link>} />

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar p={profile} size={88} />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-bold">{profile.display_name}</h2>
              <p className="text-sm text-neon">@{profile.username}</p>
              <p className="mt-2 text-sm text-snow/65">{profile.bio || "Biografiya hali yozilmagan."}</p>
              {team && (
                <Link href={`/jamoalar/${team.id}`} className="chip mt-3 hover:border-neon/50">
                  {team.emoji} {team.name}
                </Link>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold">{p.level}-daraja</span>
              <span className="text-sm text-snow/55">{levelTitle(p.level)}</span>
            </div>
            <XpBar xp={profile.xp} />
            <p className="mt-1.5 text-xs text-snow/45">Keyingi darajagacha yana {p.span - p.into} XP</p>
          </div>
        </section>

        <section className="glass relative overflow-hidden p-4">
          <h2 className="px-1 font-display text-lg font-bold">Mening sayyoram</h2>
          <p className="px-1 text-xs text-snow/50">Darajangiz oshgani sari sayyora o‘zgaradi: 5-darajada halqa, 5/10/15-darajalarda yo‘ldoshlar.</p>
          <Planet3D level={profile.level} className="h-72" />
        </section>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon="⚡" label="Umumiy XP" value={profile.xp} />
        <StatCard icon="🔥" label="Joriy seriya" value={`${profile.streak} kun`} tint="nova" />
        <StatCard icon="✅" label="Bajarilgan vazifalar" value={profile.quests_done} />
        <StatCard icon="🏆" label="Yutuqlar" value={badges.length} tint="nova" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="glass p-5">
          <h2 className="mb-3 font-display text-lg font-bold">Olingan yutuqlar</h2>
          {badges.length === 0 ? (
            <p className="text-sm text-snow/50">Hali yutuqlar yo‘q. Birinchi vazifani bajaring!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b.code} className="chip !border-amber-300/40 !py-1.5 !text-amber-100" title={b.description}>
                  {b.icon} {b.title}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="glass p-5">
          <h2 className="mb-3 font-display text-lg font-bold">Faollik tarixi</h2>
          {events.length === 0 && <p className="text-sm text-snow/50">Hali faollik yo‘q.</p>}
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-snow/75">{reasonText(e.reason)}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold text-neon">+{e.amount} XP</span>
                  <span className="text-xs text-snow/40">{timeAgo(e.created_at)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
