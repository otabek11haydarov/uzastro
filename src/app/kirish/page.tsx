"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Logo from "@/components/Logo";
import { errText, getSupabase } from "@/lib/supabase";

const Planet3D = dynamic(() => import("@/components/Planet3D"), { ssr: false });

export default function KirishPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "err" | "ok"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const sb = getSupabase();
    if (mode === "up") {
      const u = username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(u)) return setMsg({ t: "err", text: "Username 3–20 ta belgi: kichik lotin harflari, raqam va _ bo‘lishi kerak." });
      if (password.length < 8) return setMsg({ t: "err", text: "Parol kamida 8 ta belgidan iborat bo‘lsin." });
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim().toLowerCase(), display_name: name.trim() || username.trim() } },
        });
        if (error) throw error;
        if (!data.session) setMsg({ t: "ok", text: "Ro‘yxatdan o‘tdingiz! Elektron pochtangizni tasdiqlang, so‘ng tizimga kiring." });
        else router.replace("/");
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
      }
    } catch (err) {
      setMsg({ t: "err", text: errText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-8 p-5 md:grid-cols-2">
      <div className="hidden md:block">
        <Logo size={44} />
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight">
          Koinotni <span className="text-gradient">kashf et.</span>
          <br />
          Kelajakni <span className="text-gradient">yarat.</span>
        </h1>
        <Planet3D level={6} className="mt-4 h-[340px]" />
      </div>

      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 sm:p-8">
        <div className="mb-5 md:hidden">
          <Logo />
        </div>
        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white/5 p-1 text-sm font-semibold">
          {(["in", "up"] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => {
                setMode(m);
                setMsg(null);
              }}
              className={`rounded-xl py-2.5 transition ${mode === m ? "bg-gradient-to-r from-neon/30 to-nova/30 text-snow" : "text-snow/55"}`}
            >
              {m === "in" ? "Kirish" : "Ro‘yxatdan o‘tish"}
            </button>
          ))}
        </div>

        {mode === "up" && (
          <>
            <label className="label" htmlFor="name">Ism</label>
            <input id="name" className="input mb-4" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Aziza" maxLength={40} />
            <label className="label" htmlFor="username">Username</label>
            <input id="username" className="input mb-4" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="aziza_astro" required />
          </>
        )}
        <label className="label" htmlFor="email">Elektron pochta</label>
        <input id="email" type="email" className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@pochta.uz" required autoComplete="email" />
        <label className="label" htmlFor="password">Parol</label>
        <input
          id="password"
          type="password"
          className="input mb-5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kamida 8 ta belgi"
          required
          autoComplete={mode === "in" ? "current-password" : "new-password"}
        />

        {msg && (
          <p className={`mb-4 rounded-xl border px-3 py-2 text-sm ${msg.t === "err" ? "border-rose-400/40 bg-rose-500/10 text-rose-200" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"}`}>
            {msg.text}
          </p>
        )}

        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Iltimos kuting..." : mode === "in" ? "Boshlash" : "Hisob yaratish"}
        </button>
      </motion.form>
    </div>
  );
}
