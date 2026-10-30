"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Bot, Compass, Home, ListChecks, Medal, Menu, Settings, Trophy, User, Users, X, LogOut } from "lucide-react";
import Starfield from "./Starfield";
import Logo from "./Logo";
import { useApp } from "./AppProvider";
import NotificationsPanel from "./NotificationsPanel";
import { isConfigured } from "@/lib/supabase";
import { Avatar, Spinner } from "./ui";

const NAV = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/kashfiyotlar", label: "Kashfiyotlar", icon: Compass },
  { href: "/vazifalar", label: "Kunlik vazifalar", icon: ListChecks },
  { href: "/jamoalar", label: "Jamoalar", icon: Users },
  { href: "/reyting", label: "Reyting", icon: Trophy },
  { href: "/yutuqlar", label: "Yutuqlar", icon: Medal },
  { href: "/ai", label: "AI Yordamchi", icon: Bot },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/sozlamalar", label: "Sozlamalar", icon: Settings },
];

const MOBILE_MAIN = ["/", "/kashfiyotlar", "/vazifalar", "/ai"];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

function SetupNeeded() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div className="glass max-w-lg p-8 text-center">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">Supabase sozlanmagan</h1>
        <p className="mt-2 text-sm text-snow/65">
          <code className="text-neon">.env.local</code> faylida <code className="text-neon">NEXT_PUBLIC_SUPABASE_URL</code> va{" "}
          <code className="text-neon">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> qiymatlarini kiriting, so‘ng ilovani qayta ishga tushiring.
          Batafsil ko‘rsatmalar README.md faylida.
        </p>
      </div>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, profile, loading, unread, signOut } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  if (!isConfigured) {
    return (
      <>
        <Starfield />
        <SetupNeeded />
      </>
    );
  }

  // Kirish sahifasi va tizimga kirmagan foydalanuvchi uchun bosh sahifa: oddiy qobiq
  if (path === "/kirish" || (!user && !loading)) {
    return (
      <>
        <Starfield />
        <div className="relative z-10">{children}</div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Starfield />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <Spinner label="Koinotga ulanmoqda..." />
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Starfield />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div className="glass max-w-md p-6 text-center">
            <h2 className="text-xl font-bold text-snow">Profil yuklanmadi</h2>
            <p className="mt-2 text-sm text-snow/70">
              Supabase ma&apos;lumotlar bazasida SQL sxema (jadvallar) hali ishga tushirilmagan bo&apos;lishi mumkin.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary w-full py-2.5"
              >
                Qayta yuklash
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-xl border border-white/10 py-2.5 text-sm text-snow/70 hover:bg-white/5"
              >
                Chiqish (Sign Out)
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Starfield />
      <div className="relative z-10 min-h-screen">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/10 bg-deep/70 p-4 backdrop-blur-xl lg:flex">
          <Link href="/" className="mb-6 px-2 pt-2">
            <Logo />
          </Link>
          <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Asosiy menyu">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(path, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                    active ? "text-snow" : "text-snow/60 hover:bg-white/5 hover:text-snow"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-2xl border border-neon/30 bg-gradient-to-r from-neon/20 to-nova/20 shadow-neon"
                    />
                  )}
                  <Icon className="relative h-[18px] w-[18px]" />
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </nav>
          <Link href="/profil" className="glass mt-3 flex items-center gap-3 p-3 transition hover:border-neon/40">
            <Avatar p={profile} size={40} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{profile.display_name}</div>
              <div className="text-xs text-snow/55">
                {profile.level}-daraja · {profile.xp} XP
              </div>
            </div>
          </Link>
        </aside>

        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-void/70 px-4 py-3 backdrop-blur-xl lg:ml-64 lg:px-8">
          <Link href="/" className="lg:hidden">
            <Logo size={30} />
          </Link>
          <div className="hidden text-xs text-snow/45 lg:block">Koinotni kashf et. Kelajakni yarat.</div>
          <div className="relative flex items-center gap-2">
            <Link href="/vazifalar" className="chip hidden !border-orange-400/30 !text-orange-200 sm:inline-flex">
              <span className="flame">🔥</span> {profile.streak} kun
            </Link>
            <span className="chip !border-neon/30 !text-neon">⚡ {profile.xp} XP</span>
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="btn-ghost relative !p-2.5"
              aria-label="Bildirishnomalar"
              aria-expanded={bellOpen}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-nova px-1 text-[10px] font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {bellOpen && <NotificationsPanel onClose={() => setBellOpen(false)} />}
          </div>
        </header>

        <main className="px-4 pb-28 pt-6 lg:ml-64 lg:px-8 lg:pb-10">
          <motion.div key={path} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto max-w-6xl">
            {children}
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-deep/90 backdrop-blur-xl lg:hidden" aria-label="Mobil menyu">
          <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
            {NAV.filter((n) => MOBILE_MAIN.includes(n.href)).map(({ href, label, icon: Icon }) => {
              const active = isActive(path, href);
              return (
                <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] ${active ? "text-neon" : "text-snow/55"}`}>
                  <Icon className="h-5 w-5" />
                  <span className="max-w-full truncate">{label.replace("Kunlik ", "")}</span>
                </Link>
              );
            })}
            <button onClick={() => setMenuOpen(true)} className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] text-snow/55">
              <Menu className="h-5 w-5" />
              Menyu
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-void/85 backdrop-blur-md lg:hidden" onClick={() => setMenuOpen(false)}>
              <motion.div
                initial={{ y: 60 }}
                animate={{ y: 0 }}
                exit={{ y: 60 }}
                className="glass absolute inset-x-3 bottom-3 bg-deep/95 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <Logo size={28} />
                  <button onClick={() => setMenuOpen(false)} aria-label="Yopish" className="btn-ghost !p-2">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {NAV.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center text-[11px] ${
                        isActive(path, href) ? "border-neon/40 bg-neon/10 text-neon" : "border-white/10 bg-white/5 text-snow/80"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}
                </div>
                <button onClick={signOut} className="btn-danger mt-3 w-full">
                  <LogOut className="h-4 w-4" /> Chiqish
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
