"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Empty, Modal, PageHeader, Spinner } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { errText, getSupabase } from "@/lib/supabase";
import { teamLevel } from "@/lib/levels";
import type { Team } from "@/lib/types";

const EMOJIS = ["🚀", "🪐", "🌙", "☄️", "🛰️", "🌌", "⭐", "🔭", "👽", "🧑‍🚀", "🌠", "🛸"];
const COLORS = ["#35C8FF", "#9065FF", "#FF6B9D", "#34D399", "#FBBF24", "#F97316"];

interface TeamRow extends Team {
  team_members: { count: number }[];
}

export default function JamoalarPage() {
  const router = useRouter();
  const { user, toast, refreshProfile } = useApp();
  const [teams, setTeams] = useState<TeamRow[] | null>(null);
  const [myTeam, setMyTeam] = useState<string | null | undefined>(undefined);
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", emoji: "🚀", color: "#35C8FF", is_open: true });

  const load = useCallback(async () => {
    if (!user) return;
    const sb = getSupabase();
    const [t, m] = await Promise.all([
      sb.from("teams").select("*, team_members(count)").order("xp", { ascending: false }).limit(100),
      sb.from("team_members").select("team_id").eq("user_id", user.id).maybeSingle(),
    ]);
    setTeams((t.data as unknown as TeamRow[]) ?? []);
    setMyTeam(m.data ? (m.data as { team_id: string }).team_id : null);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await getSupabase().rpc("create_team", {
      p_name: form.name,
      p_description: form.description,
      p_emoji: form.emoji,
      p_color: form.color,
      p_open: form.is_open,
    });
    setBusy(false);
    if (error) return toast(error.message.includes("duplicate") ? "Bu nomdagi jamoa mavjud" : errText(error), "err");
    toast("Jamoa yaratildi!");
    refreshProfile();
    router.push(`/jamoalar/${data as string}`);
  };

  const join = async (id: string) => {
    const { error } = await getSupabase().rpc("join_team", { p_team: id });
    if (error) return toast(errText(error), "err");
    toast("Jamoaga qo‘shildingiz!");
    refreshProfile();
    router.push(`/jamoalar/${id}`);
  };

  const filtered = teams?.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Jamoalar"
        subtitle="Do‘stlar bilan birlashing, birga XP yig‘ing va jamoalar reytingida yuqoriga chiqing."
        right={
          myTeam ? (
            <Link href={`/jamoalar/${myTeam}`} className="btn-primary">Mening jamoam</Link>
          ) : (
            <button className="btn-primary" onClick={() => setCreate(true)}>+ Jamoa yaratish</button>
          )
        }
      />

      <input className="input mb-5" placeholder="Jamoa nomini qidirish..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Jamoa qidirish" />

      {!teams && <Spinner />}
      {filtered?.length === 0 && <Empty icon="👥" text={q ? "Hech narsa topilmadi." : "Hali jamoalar yo‘q. Birinchisini siz yarating!"} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered?.map((t) => (
          <div key={t.id} className="glass glass-hover flex flex-col p-5">
            <Link href={`/jamoalar/${t.id}`} className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: `${t.color}33`, border: `1px solid ${t.color}99`, boxShadow: `0 0 24px ${t.color}44` }}>
                {t.emoji}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-bold">{t.name}</h3>
                <div className="text-xs text-snow/55">
                  {t.team_members?.[0]?.count ?? 0} a’zo · {teamLevel(t.xp)}-daraja · {t.xp} XP
                </div>
              </div>
            </Link>
            <p className="mt-3 line-clamp-2 flex-1 text-sm text-snow/60">{t.description || "Tavsif yo‘q."}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="chip">{t.is_open ? "Ochiq" : "Faqat taklif orqali"}</span>
              {myTeam === t.id ? (
                <span className="chip !border-emerald-400/40 !text-emerald-300">Siz a’zosiz</span>
              ) : (
                <button className="btn-ghost !px-4 !py-2" disabled={!t.is_open || Boolean(myTeam)} onClick={() => join(t.id)}>
                  Qo‘shilish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={create} onClose={() => setCreate(false)} title="Yangi jamoa">
        <form onSubmit={submit}>
          <label className="label" htmlFor="tn">Jamoa nomi</label>
          <input id="tn" className="input mb-3" required minLength={3} maxLength={30} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masalan: Yulduz ovchilari" />
          <label className="label" htmlFor="td">Tavsif</label>
          <textarea id="td" className="input mb-3" rows={3} maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="label">Logotip</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button type="button" key={e} onClick={() => setForm({ ...form, emoji: e })} className={`h-10 w-10 rounded-xl border text-xl ${form.emoji === e ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="mb-3 flex gap-2">
            {COLORS.map((c) => (
              <button type="button" key={c} aria-label={c} onClick={() => setForm({ ...form, color: c })} className={`h-8 w-8 rounded-full border-2 ${form.color === c ? "border-white" : "border-transparent"}`} style={{ background: c }} />
            ))}
          </div>
          <label className="mb-5 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} />
            Ochiq jamoa (hamma qo‘shila oladi)
          </label>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Yaratilmoqda..." : "Jamoani yaratish"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
