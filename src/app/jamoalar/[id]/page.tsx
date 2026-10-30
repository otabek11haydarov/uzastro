"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Empty, PageHeader, Spinner, XpBar, timeAgo } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { errText, getSupabase } from "@/lib/supabase";
import { teamLevel } from "@/lib/levels";
import type { Team, TeamMember } from "@/lib/types";

interface Msg {
  id: number;
  user_id: string;
  body: string;
  created_at: string;
}
interface Goal {
  title: string;
  current: number;
  target: number;
}
interface TeamEvent {
  id: number;
  text: string;
  created_at: string;
}

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, toast, refreshProfile } = useApp();
  const [team, setTeam] = useState<Team | null | undefined>(undefined);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [inviteName, setInviteName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const isMember = members.some((m) => m.user_id === user?.id);
  const names = Object.fromEntries(members.map((m) => [m.user_id, m.profiles?.display_name ?? "?"]));

  const load = useCallback(async () => {
    const sb = getSupabase();
    const [t, m, g, e] = await Promise.all([
      sb.from("teams").select("*").eq("id", id).maybeSingle(),
      sb.from("team_members").select("*, profiles(username, display_name, avatar_emoji, avatar_url, level)").eq("team_id", id).order("xp_contributed", { ascending: false }),
      sb.rpc("team_goals", { p_team: id }),
      sb.from("team_events").select("*").eq("team_id", id).order("created_at", { ascending: false }).limit(15),
    ]);
    setTeam((t.data as Team) ?? null);
    setMembers((m.data as unknown as TeamMember[]) ?? []);
    setGoals((g.data as Goal[]) ?? []);
    setEvents((e.data as TeamEvent[]) ?? []);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Chat: boshlang'ich yuklash + realtime
  useEffect(() => {
    if (!isMember) return;
    const sb = getSupabase();
    sb.from("team_messages").select("id, user_id, body, created_at").eq("team_id", id).order("created_at", { ascending: false }).limit(60)
      .then(({ data }) => setMsgs(((data as Msg[]) ?? []).reverse()));
    const ch = sb
      .channel(`team-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "team_messages", filter: `team_id=eq.${id}` }, (p) =>
        setMsgs((m) => (m.some((x) => x.id === (p.new as Msg).id) ? m : [...m, p.new as Msg])),
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [id, isMember]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  if (team === undefined) return <Spinner />;
  if (team === null) return <Empty icon="🛰️" text="Jamoa topilmadi." />;

  const isLeader = team.leader_id === user?.id;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !user) return;
    setText("");
    const { data, error } = await getSupabase().from("team_messages").insert({ team_id: id, user_id: user.id, body }).select("id, user_id, body, created_at").single();
    if (error) return toast(errText(error), "err");
    setMsgs((m) => (m.some((x) => x.id === (data as Msg).id) ? m : [...m, data as Msg]));
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await getSupabase().rpc("invite_to_team", { p_username: inviteName.replace("@", "") });
    if (error) return toast(errText(error), "err");
    toast("Taklif yuborildi!");
    setInviteName("");
  };

  const leave = async () => {
    if (!confirm("Jamoadan chiqmoqchimisiz?")) return;
    const { error } = await getSupabase().rpc("leave_team");
    if (error) return toast(errText(error), "err");
    refreshProfile();
    router.push("/jamoalar");
  };

  const join = async () => {
    const { error } = await getSupabase().rpc("join_team", { p_team: id });
    if (error) return toast(errText(error), "err");
    toast("Jamoaga qo‘shildingiz!");
    refreshProfile();
    load();
  };

  return (
    <div>
      <Link href="/jamoalar" className="mb-3 inline-block text-sm text-snow/55 hover:text-neon">← Barcha jamoalar</Link>

      <div className="glass relative mb-5 overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-40 blur-3xl" style={{ background: team.color }} />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl text-5xl" style={{ background: `${team.color}33`, border: `1px solid ${team.color}`, boxShadow: `0 0 36px ${team.color}55` }}>
            {team.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="page-title">{team.name}</h1>
            <p className="text-sm text-snow/65">{team.description || "Tavsif yo‘q."}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip">👥 {members.length} a’zo</span>
              <span className="chip !border-neon/30 !text-neon">⚡ {team.xp} XP</span>
              <span className="chip">{teamLevel(team.xp)}-daraja</span>
              <span className="chip">{team.is_open ? "Ochiq" : "Faqat taklif orqali"}</span>
            </div>
          </div>
          {isMember ? (
            <button className="btn-danger" onClick={leave}>Chiqish</button>
          ) : (
            <button className="btn-primary" disabled={!team.is_open} onClick={join}>Qo‘shilish</button>
          )}
        </div>
        <div className="relative mt-4"><XpBar xp={Math.floor(team.xp / 3)} /></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {isMember && (
            <section className="glass flex h-[420px] flex-col p-4">
              <h2 className="mb-2 font-display text-lg font-bold">Jamoa chati</h2>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {msgs.length === 0 && <p className="py-10 text-center text-sm text-snow/45">Hali xabarlar yo‘q. Birinchi bo‘lib yozing!</p>}
                {msgs.map((m) => {
                  const mine = m.user_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-gradient-to-r from-neon/30 to-nova/30" : "bg-white/8 bg-white/10"}`}>
                        {!mine && <div className="text-[11px] font-semibold text-neon">{names[m.user_id] ?? "A’zo"}</div>}
                        <div className="whitespace-pre-wrap break-words">{m.body}</div>
                        <div className="mt-0.5 text-[10px] text-snow/40">{timeAgo(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="mt-3 flex gap-2">
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Xabar yozing..." aria-label="Xabar" />
                <button className="btn-primary" disabled={!text.trim()}>Yuborish</button>
              </form>
            </section>
          )}

          <section className="glass p-5">
            <h2 className="mb-3 font-display text-lg font-bold">Haftalik jamoaviy vazifalar</h2>
            <div className="space-y-3">
              {goals.map((g) => {
                const pct = Math.min(100, (g.current / g.target) * 100);
                return (
                  <div key={g.title}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{pct >= 100 ? "✅ " : ""}{g.title}</span>
                      <span className="text-snow/55">{g.current} / {g.target}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="xp-bar h-full rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="glass p-5">
            <h2 className="mb-3 font-display text-lg font-bold">Jamoa tarixi</h2>
            {events.length === 0 && <p className="text-sm text-snow/50">Hali voqealar yo‘q.</p>}
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-snow/75">✦ {e.text}</span>
                  <span className="shrink-0 text-xs text-snow/40">{timeAgo(e.created_at)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-5">
          <section className="glass p-5">
            <h2 className="mb-3 font-display text-lg font-bold">A’zolar</h2>
            <ul className="space-y-2.5">
              {members.map((m) => (
                <li key={m.user_id} className="flex items-center gap-3">
                  {m.profiles && <Avatar p={m.profiles} size={38} />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{m.profiles?.display_name} {m.role === "leader" && "👑"}</div>
                    <div className="text-xs text-snow/50">@{m.profiles?.username} · {m.profiles?.level}-daraja</div>
                  </div>
                  <span className="text-xs text-neon">{m.xp_contributed} XP</span>
                </li>
              ))}
            </ul>
          </section>

          {isMember && (
            <section className="glass p-5">
              <h2 className="mb-3 font-display text-lg font-bold">Taklif qilish</h2>
              <form onSubmit={invite} className="flex gap-2">
                <input className="input" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="@username" required aria-label="Username" />
                <button className="btn-primary">Yuborish</button>
              </form>
              {isLeader && <p className="mt-2 text-xs text-snow/45">Siz jamoa sardorisiz 👑</p>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
