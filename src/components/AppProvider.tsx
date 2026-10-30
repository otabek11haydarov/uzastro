"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isConfigured } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

type ToastKind = "ok" | "err" | "xp";
interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
}

interface Ctx {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  unread: number;
  levelUp: number | null;
  dismissLevelUp: () => void;
  refreshProfile: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  toast: (text: string, kind?: ToastKind) => void;
  toasts: Toast[];
  signOut: () => Promise<void>;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp AppProvider ichida ishlatilishi kerak");
  return c;
}

const PUBLIC_PATHS = ["/", "/kirish"];

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const lastLevel = useRef<number | null>(null);
  const toastId = useRef(0);

  const toast = useCallback((text: string, kind: ToastKind = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const sb = getSupabase();
      const { data } = await sb.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (data) {
        const p = data as Profile;
        if (lastLevel.current !== null && p.level > lastLevel.current) setLevelUp(p.level);
        lastLevel.current = p.level;
        setProfile(p);
      } else {
        const meta = user?.user_metadata || {};
        const uname = (meta.username as string) || `astronavt_${uid.slice(0, 6)}`;
        const dname = (meta.display_name as string) || uname;
        const { data: created } = await sb
          .from("profiles")
          .insert({ id: uid, username: uname, display_name: dname })
          .select()
          .maybeSingle();
        if (created) {
          setProfile(created as Profile);
        }
      }
    } catch (e) {
      console.error("Profilni yuklashda xatolik:", e);
    }
  }, [user]);

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    const { count } = await getSupabase()
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setUnread(count ?? 0);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
      await refreshUnread();
    }
  }, [user, loadProfile, refreshUnread]);

  // Sessiya
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setProfile(null);
        lastLevel.current = null;
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
      refreshUnread();
      const t = setInterval(refreshUnread, 30000);
      return () => clearInterval(t);
    }
  }, [user, loadProfile, refreshUnread]);

  // Himoyalangan sahifalar
  useEffect(() => {
    if (loading || !isConfigured) return;
    if (!user && !PUBLIC_PATHS.includes(pathname)) router.replace("/kirish");
    if (user && pathname === "/kirish") router.replace("/");
  }, [loading, user, pathname, router]);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    router.replace("/kirish");
  }, [router]);

  const value = useMemo<Ctx>(
    () => ({
      user,
      profile,
      loading,
      unread,
      levelUp,
      dismissLevelUp: () => setLevelUp(null),
      refreshProfile,
      refreshUnread,
      toast,
      toasts,
      signOut,
    }),
    [user, profile, loading, unread, levelUp, refreshProfile, refreshUnread, toast, toasts, signOut],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
