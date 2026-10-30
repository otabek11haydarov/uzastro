"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { useApp } from "@/components/AppProvider";

interface Msg {
  role: "user" | "assistant";
  content: string;
}
interface Conv {
  id: string;
  title: string;
  updated_at: string;
}

const QUICK = [
  "Qora tuynuklar qanday ishlaydi?",
  "Sayyoralar haqida 5 ta qiziqarli fakt ayt",
  "Menga astronomiyadan 3 ta savolli test tuz",
  "Quyosh nima uchun yonadi?",
  "Qaysi mavzudan boshlashim kerak?",
  "Somon yo‘li va Andromeda haqida tushuntir",
];

function Rich({ text }: { text: string }) {
  // Yengil formatlash: **qalin**, "- " ro'yxatlar, bo'sh qator = yangi paragraf
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        const isList = lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        const fmt = (s: string) =>
          s.split(/(\*\*[^*]+\*\*)/g).map((p, k) => (p.startsWith("**") && p.endsWith("**") ? <strong key={k}>{p.slice(2, -2)}</strong> : <span key={k}>{p}</span>));
        return isList ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {lines.map((l, k) => (
              <li key={k}>{fmt(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""))}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-wrap">{fmt(b)}</p>
        );
      })}
    </div>
  );
}

function AiAvatar({ size = 36, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon to-nova text-void ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.5, boxShadow: "0 0 24px rgba(53,200,255,.5)" }}
      aria-hidden
    >
      ✦
    </span>
  );
}

export default function AiPage() {
  const { user, toast } = useApp();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showList, setShowList] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async () => {
    const { data } = await getSupabase().from("ai_conversations").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(40);
    setConvs((data as Conv[]) ?? []);
  }, []);

  useEffect(() => {
    if (user) loadConvs();
  }, [user, loadConvs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, busy]);

  const open = async (id: string) => {
    setConvId(id);
    setShowList(false);
    const { data } = await getSupabase().from("ai_messages").select("role, content").eq("conversation_id", id).order("created_at");
    setMsgs((data as Msg[]) ?? []);
  };

  const fresh = () => {
    setConvId(null);
    setMsgs([]);
    setShowList(false);
  };

  const remove = async (id: string) => {
    await getSupabase().from("ai_conversations").delete().eq("id", id);
    if (id === convId) fresh();
    loadConvs();
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: message }]);
    setBusy(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversation_id: convId ?? undefined, message }),
      });
      const j = (await r.json()) as { conversation_id?: string; reply?: string; error?: string };
      if (!r.ok || !j.reply) {
        toast(j.error ?? "Xatolik yuz berdi", "err");
        setMsgs((m) => m.slice(0, -1));
        setInput(message);
      } else {
        setConvId(j.conversation_id ?? convId);
        setMsgs((m) => [...m, { role: "assistant", content: j.reply! }]);
        loadConvs();
      }
    } catch {
      toast("Tarmoq xatosi. Qayta urinib ko‘ring.", "err");
      setMsgs((m) => m.slice(0, -1));
      setInput(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid h-[calc(100vh-150px)] min-h-[480px] gap-4 lg:h-[calc(100vh-130px)] lg:grid-cols-[260px_1fr]">
      {/* Suhbatlar tarixi */}
      <aside className={`glass flex-col p-3 ${showList ? "flex" : "hidden"} lg:flex`}>
        <button className="btn-primary mb-3 w-full" onClick={fresh}>+ Yangi suhbat</button>
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {convs.length === 0 && <p className="p-3 text-center text-xs text-snow/45">Suhbatlar tarixi bo‘sh</p>}
          {convs.map((c) => (
            <div key={c.id} className={`group flex items-center gap-1 rounded-xl border px-3 py-2 text-sm ${c.id === convId ? "border-neon/40 bg-neon/10" : "border-transparent hover:bg-white/5"}`}>
              <button className="min-w-0 flex-1 truncate text-left" onClick={() => open(c.id)}>{c.title}</button>
              <button onClick={() => remove(c.id)} className="text-snow/30 hover:text-rose-300" aria-label="O‘chirish">✕</button>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <section className={`glass flex min-h-0 flex-col ${showList ? "hidden lg:flex" : "flex"}`}>
        <header className="flex items-center gap-3 border-b border-white/10 p-4">
          <AiAvatar size={42} pulse={busy} />
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold">AI Yordamchi</h1>
            <p className="text-xs text-snow/50">{busy ? "Javob tayyorlanmoqda..." : "Astronomiya bo‘yicha shaxsiy yordamchingiz"}</p>
          </div>
          <button className="btn-ghost !px-3 !py-2 lg:hidden" onClick={() => setShowList(true)}>Tarix</button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {msgs.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <AiAvatar size={72} />
              <h2 className="mt-4 font-display text-2xl font-bold"><span className="text-gradient">Salom, kosmik sayohatchi!</span></h2>
              <p className="mt-1 max-w-md text-sm text-snow/55">Astronomiya haqida istalgan savol bering, test tuzdiring yoki vazifalarda yordam so‘rang.</p>
              <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs transition hover:border-neon/50 hover:bg-neon/10">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <AiAvatar />}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-to-r from-neon/30 to-nova/30" : "border border-white/10 bg-white/[0.06]"}`}>
                  {m.role === "assistant" ? <Rich text={m.content} /> : <p className="whitespace-pre-wrap">{m.content}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {busy && (
            <div className="flex items-center gap-3" role="status" aria-label="Javob generatsiya qilinmoqda">
              <AiAvatar pulse />
              <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-2 w-2 rounded-full bg-neon" animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 border-t border-white/10 p-3"
        >
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Savolingizni yozing..." maxLength={2000} aria-label="Xabar" />
          <button className="btn-primary" disabled={busy || !input.trim()} aria-label="Yuborish">➤</button>
        </form>
      </section>
    </div>
  );
}
