"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, errText } from "@/lib/supabase";
import type { Notification } from "@/lib/types";
import { useApp } from "./AppProvider";
import { timeAgo } from "./ui";

interface InviteRow {
  id: number;
  team_id: string;
  teams: { name: string; emoji: string } | null;
}

const ICON: Record<string, string> = {
  new_quests: "📅",
  achievement: "🏆",
  team_invite: "✉️",
  level_up: "⬆️",
  streak: "🔥",
  team_event: "👥",
};

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { user, refreshUnread, refreshProfile, toast } = useApp();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const sb = getSupabase();
    const [n, i] = await Promise.all([
      sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(30),
      sb.from("team_invites").select("id, team_id, teams(name, emoji)").eq("invited_user", user.id).eq("status", "pending"),
    ]);
    setItems((n.data as Notification[]) ?? []);
    setInvites((i.data as unknown as InviteRow[]) ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const markAll = async () => {
    await getSupabase().from("notifications").update({ read: true }).eq("read", false);
    await load();
    refreshUnread();
  };

  const respond = async (id: number, accept: boolean) => {
    const { error } = await getSupabase().rpc("respond_invite", { p_invite: id, p_accept: accept });
    if (error) toast(errText(error), "err");
    else {
      toast(accept ? "Jamoaga qo‘shildingiz!" : "Taklif rad etildi");
      await load();
      refreshProfile();
    }
  };

  return (
    <div className="glass absolute right-0 top-14 z-50 w-[min(92vw,380px)] bg-deep/95 p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="font-display font-bold">Bildirishnomalar</h3>
        <div className="flex gap-2">
          <button onClick={markAll} className="text-xs text-neon hover:underline">
            Hammasini o‘qilgan deb belgilash
          </button>
          <button onClick={onClose} aria-label="Yopish" className="text-snow/60">
            ✕
          </button>
        </div>
      </div>
      <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
        {invites.map((inv) => (
          <div key={inv.id} className="rounded-2xl border border-nova/40 bg-nova/10 p-3">
            <div className="text-sm font-semibold">
              {inv.teams?.emoji} “{inv.teams?.name}” jamoasiga taklif
            </div>
            <div className="mt-2 flex gap-2">
              <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => respond(inv.id, true)}>
                Qabul qilish
              </button>
              <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => respond(inv.id, false)}>
                Rad etish
              </button>
            </div>
          </div>
        ))}
        {items === null && <p className="p-4 text-center text-sm text-snow/50">Yuklanmoqda...</p>}
        {items?.length === 0 && invites.length === 0 && (
          <p className="p-6 text-center text-sm text-snow/50">Hozircha bildirishnoma yo‘q</p>
        )}
        {items?.map((n) => (
          <div key={n.id} className={`flex gap-3 rounded-2xl border p-3 ${n.read ? "border-white/5 bg-white/[0.02]" : "border-neon/30 bg-neon/5"}`}>
            <div className="text-xl">{ICON[n.kind] ?? "🔔"}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{n.title}</div>
              {n.body && <div className="text-xs text-snow/60">{n.body}</div>}
              <div className="mt-1 text-[11px] text-snow/40">{timeAgo(n.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
