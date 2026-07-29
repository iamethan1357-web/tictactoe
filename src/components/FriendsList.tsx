"use client";

import { useState, useEffect, useCallback } from "react";

interface Friend { id: string; username: string; displayName: string; avatar: string; wins: number; losses: number; draws: number; }
interface PendReq { id: string; username: string; displayName: string; avatar: string; friendshipId: string; }

export default function FriendsList({ onInvite, showToast }: { onInvite: (u: string) => void; showToast: (m: string) => void }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendReq[]>([]);
  const [add, setAdd] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const tf: React.CSSProperties = { fontFamily: "'Architects Daughter', cursive" };

  const load = useCallback(async () => { try { const r = await fetch("/api/friends"); if (r.ok) { const d = await r.json(); setFriends(d.friends || []); setPending(d.pendingRequests || []); } } catch { /* */ } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const addFriend = async (e: React.FormEvent) => {
    e.preventDefault(); if (!add.trim()) return; setAdding(true);
    try { const r = await fetch("/api/friends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: add.trim() }) }); const d = await r.json(); if (r.ok) { showToast(d.message || "Sent!"); setAdd(""); } else showToast(d.error || "Failed"); } catch { showToast("Error"); }
    setAdding(false);
  };

  const respond = async (fid: string, action: string) => {
    try { const r = await fetch("/api/friends/respond", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ friendshipId: fid, action }) }); const d = await r.json(); if (r.ok) { showToast(d.message || "Done"); load(); } } catch { showToast("Failed"); }
  };

  return (
    <div className="anim-in">
      <h2 style={{ ...tf, fontSize: 28, marginBottom: 16 }}>👥 Friends</h2>

      <div className="neo" style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "var(--ink-light)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>add by username</label>
        <form onSubmit={addFriend} style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input className="neo-input" placeholder="username…" value={add} onChange={(e) => setAdd(e.target.value)} style={{ flex: 1, fontSize: 16, fontFamily: "inherit" }} />
          <button type="submit" disabled={adding} className="neo-btn-blue" style={{ fontSize: 14, padding: "8px 18px", fontFamily: "inherit" }}>{adding ? "…" : "+ add"}</button>
        </form>
      </div>

      {pending.length > 0 && (
        <div className="neo" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "var(--orange)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 10, display: "block" }}>pending requests</label>
          {pending.map((p) => (
            <div key={p.friendshipId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ fontSize: 15 }}>{p.avatar} <strong>{p.displayName}</strong> <span style={{ color: "var(--ink-light)", fontSize: 12 }}>@{p.username}</span></span>
              <span style={{ display: "flex", gap: 6 }}>
                <button onClick={() => respond(p.friendshipId, "accept")} className="neo-btn-green" style={{ fontSize: 12, padding: "5px 12px", fontFamily: "inherit" }}>✓</button>
                <button onClick={() => respond(p.friendshipId, "reject")} className="neo-btn-red" style={{ fontSize: 12, padding: "5px 12px", fontFamily: "inherit" }}>✗</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="neo">
        <label style={{ fontSize: 12, color: "var(--ink-light)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 10, display: "block" }}>your friends</label>
        {loading ? <p style={{ textAlign: "center", padding: 22, color: "var(--ink-light)" }}>loading… ⏳</p>
        : friends.length === 0 ? <p style={{ textAlign: "center", padding: 22, color: "var(--ink-light)" }}>📖 no friends yet — add someone above!</p>
        : friends.map((f) => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ fontSize: 15 }}>{f.avatar} <strong>{f.displayName}</strong> <span style={{ fontSize: 11, color: "var(--ink-light)" }}>W{f.wins} L{f.losses} D{f.draws}</span></span>
            <button onClick={() => onInvite(f.username)} className="neo-btn-blue" style={{ fontSize: 12, padding: "5px 14px", fontFamily: "inherit" }}>⚔️ play</button>
          </div>
        ))}
      </div>
    </div>
  );
}
