"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, PageHeader, Spinner } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { errText, getSupabase } from "@/lib/supabase";

const EMOJIS = ["🧑‍🚀", "👩‍🚀", "👽", "🚀", "🪐", "🌙", "☄️", "🔭", "🛰️", "🌌", "⭐", "🦉"];
const ZONES = ["Asia/Tashkent", "Asia/Samarkand", "Asia/Almaty", "Europe/Moscow", "Europe/Istanbul", "UTC"];

export default function SozlamalarPage() {
  const { user, profile, refreshProfile, toast, signOut } = useApp();
  const [f, setF] = useState({ display_name: "", username: "", bio: "", avatar_emoji: "🧑‍🚀", timezone: "Asia/Tashkent" });
  const [busy, setBusy] = useState(false);
  const [upBusy, setUpBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) setF({ display_name: profile.display_name, username: profile.username, bio: profile.bio, avatar_emoji: profile.avatar_emoji, timezone: profile.timezone });
  }, [profile]);

  if (!profile || !user) return <Spinner />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = f.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return toast("Username: 3–20 ta kichik lotin harfi, raqam yoki _", "err");
    setBusy(true);
    const { error } = await getSupabase()
      .from("profiles")
      .update({ display_name: f.display_name.trim(), username, bio: f.bio.trim(), avatar_emoji: f.avatar_emoji, timezone: f.timezone })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast(error.message.includes("duplicate") ? "Bu username band" : errText(error), "err");
    toast("Profil saqlandi");
    refreshProfile();
  };

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast("Faqat rasm yuklash mumkin", "err");
    if (file.size > 2 * 1024 * 1024) return toast("Rasm hajmi 2 MB dan oshmasin", "err");
    setUpBusy(true);
    const sb = getSupabase();
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setUpBusy(false);
      return toast(errText(error), "err");
    }
    const url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const { error: e2 } = await sb.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setUpBusy(false);
    if (e2) return toast(errText(e2), "err");
    toast("Avatar yangilandi");
    refreshProfile();
  };

  const removeAvatar = async () => {
    const { error } = await getSupabase().from("profiles").update({ avatar_url: null }).eq("id", user.id);
    if (error) return toast(errText(error), "err");
    refreshProfile();
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Sozlamalar" subtitle="Profilingizni o‘zingizga moslang." />

      <form onSubmit={save} className="glass space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar p={{ ...profile, avatar_emoji: f.avatar_emoji }} size={80} />
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button type="button" className="btn-ghost" disabled={upBusy} onClick={() => fileRef.current?.click()}>
              {upBusy ? "Yuklanmoqda..." : "Rasm yuklash"}
            </button>
            {profile.avatar_url && <button type="button" className="btn-ghost" onClick={removeAvatar}>Rasmni olib tashlash</button>}
          </div>
        </div>

        <div>
          <div className="label">Emoji avatar (rasm bo‘lmasa ko‘rinadi)</div>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button type="button" key={e} onClick={() => setF({ ...f, avatar_emoji: e })} className={`h-10 w-10 rounded-xl border text-xl ${f.avatar_emoji === e ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="dn">Ism</label>
          <input id="dn" className="input" required maxLength={40} value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="un">Username</label>
          <input id="un" className="input" required value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="bio">Biografiya</label>
          <textarea id="bio" className="input" rows={3} maxLength={300} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
          <div className="mt-1 text-right text-xs text-snow/40">{f.bio.length} / 300</div>
        </div>
        <div>
          <label className="label" htmlFor="tz">Vaqt mintaqasi (seriya shu bo‘yicha hisoblanadi)</label>
          <select id="tz" className="input" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })}>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <button className="btn-primary w-full" disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</button>
      </form>

      <div className="glass mt-5 flex items-center justify-between p-5">
        <div>
          <div className="font-semibold">Hisobdan chiqish</div>
          <div className="text-xs text-snow/50">{user.email}</div>
        </div>
        <button className="btn-danger" onClick={signOut}>Chiqish</button>
      </div>
    </div>
  );
}
