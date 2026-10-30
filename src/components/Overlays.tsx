"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "./AppProvider";
import { levelTitle } from "@/lib/levels";

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed right-3 top-16 z-[90] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={`glass px-4 py-3 text-sm font-medium ${
              t.kind === "err" ? "!border-rose-400/50 text-rose-100" : t.kind === "xp" ? "!border-neon/60 text-neon shadow-neon" : "!border-emerald-400/40"
            }`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const SPARKS = Array.from({ length: 18 }, (_, i) => i);

export function LevelUpOverlay() {
  const { levelUp, dismissLevelUp } = useApp();
  return (
    <AnimatePresence>
      {levelUp !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void/90 p-6 backdrop-blur-md"
          onClick={dismissLevelUp}
          role="dialog"
          aria-label="Yangi daraja"
        >
          {SPARKS.map((i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
              animate={{
                x: Math.cos((i / SPARKS.length) * Math.PI * 2) * (140 + (i % 3) * 50),
                y: Math.sin((i / SPARKS.length) * Math.PI * 2) * (140 + (i % 3) * 50),
                opacity: 0,
                scale: 1.2,
              }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            >
              {i % 2 ? "✨" : "⭐"}
            </motion.span>
          ))}
          <motion.div
            initial={{ scale: 0.6, rotate: -4 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="glass relative max-w-sm p-8 text-center shadow-neon"
          >
            <div className="text-5xl">🚀</div>
            <p className="mt-3 text-sm uppercase tracking-widest text-neon">Yangi daraja!</p>
            <div className="text-gradient font-display text-7xl font-bold">{levelUp}</div>
            <p className="mt-1 text-snow/80">{levelTitle(levelUp)}</p>
            <button className="btn-primary mt-6" onClick={dismissLevelUp}>
              Davom etish
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
