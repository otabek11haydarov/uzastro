"use client";

import { motion } from "framer-motion";
import { levelProgress } from "@/lib/levels";
import type { Profile } from "@/lib/types";

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="page-title">
          <span className="text-gradient">{title}</span>
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-snow/60">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Spinner({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-snow/60" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-neon/30 border-t-neon" />
      {label}
    </div>
  );
}

export function Empty({ icon = "🪐", text }: { icon?: string; text: string }) {
  return (
    <div className="glass flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <p className="text-sm text-snow/60">{text}</p>
    </div>
  );
}

export function XpBar({ xp }: { xp: number }) {
  const p = levelProgress(xp);
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-snow/60">
        <span>{p.level}-daraja</span>
        <span>
          {p.into} / {p.span} XP
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="xp-bar h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${p.pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function Avatar({
  p,
  size = 44,
}: {
  p: Pick<Profile, "avatar_url" | "avatar_emoji" | "display_name"> | { avatar_url: string | null; avatar_emoji: string; display_name: string };
  size?: number;
}) {
  return p.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.avatar_url}
      alt={p.display_name}
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-white/20 object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-neon/25 to-nova/30"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-label={p.display_name}
    >
      {p.avatar_emoji}
    </span>
  );
}

export function StatCard({ icon, label, value, tint = "neon" }: { icon: string; label: string; value: React.ReactNode; tint?: "neon" | "nova" }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass p-4">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-xl ${tint === "neon" ? "bg-neon/15 shadow-neon" : "bg-nova/15 shadow-nova"}`}>
        {icon}
      </div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-snow/55">{label}</div>
    </motion.div>
  );
}

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-void/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-h-[92vh] w-full overflow-y-auto rounded-b-none bg-deep/95 p-5 sm:max-w-xl sm:rounded-b-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="btn-ghost !px-3 !py-1.5" aria-label="Yopish">
            ✕
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "hozirgina";
  if (s < 3600) return `${Math.floor(s / 60)} daq. oldin`;
  if (s < 86400) return `${Math.floor(s / 3600)} soat oldin`;
  return `${Math.floor(s / 86400)} kun oldin`;
}
