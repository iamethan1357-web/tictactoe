"use client";

import { useState } from "react";
import type { UserData } from "@/app/page";

const AVATARS = ["🎮","🎯","🎲","🏆","⭐","🔥","💎","🎪","🌟","🚀","🎭","🎨","🦊","🐉","🦁","🐺","🦅","🐬","🦄","🤖"];

export default function ProfileModal({ user, onClose, onUpdate }: { user: UserData; onClose: () => void; onUpdate: (u: UserData) => void }) {
  const [name, setName] = useState(user.displayName);
  const [av, setAv] = useState(user.avatar);
  const [saving, setSaving] = useState(false);
  const tf: React.CSSProperties = { fontFamily: "'Architects Daughter', cursive" };

  const save = async () => {
    setSaving(true);
    try { const r = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: name, avatar: av }) }); if (r.ok) onUpdate({ ...user, displayName: name, avatar: av }); } catch { /* */ }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(232,236,241,0.85)", backdropFilter: "blur(4px)" }}>
      <div className="neo anim-slide" style={{ width: "100%", maxWidth: 400, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ ...tf, fontSize: 24 }}>edit profile ✏️</h2>
          <button onClick={onClose} className="neo-btn" style={{ padding: "4px 12px", fontSize: 14, fontFamily: "inherit" }}>✕</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>username</label>
          <div className="neo-in" style={{ padding: "8px 12px", fontSize: 15, color: "var(--ink-light)", borderRadius: 10 }}>@{user.username}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>display name</label>
          <input className="neo-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} style={{ fontSize: 16, fontFamily: "inherit" }} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>avatar</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 4 }}>
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAv(a)} className={av === a ? "neo-in" : ""} style={{ fontSize: 20, padding: 4, border: "none", cursor: "pointer", borderRadius: 8, background: "var(--bg)" }}>{a}</button>
            ))}
          </div>
        </div>

        <div className="neo-in" style={{ padding: 14, borderRadius: 14, marginBottom: 18 }}>
          <label style={{ ...lbl, marginBottom: 8 }}>stats</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, textAlign: "center" }}>
            {([["W", user.wins, "--green"], ["L", user.losses, "--red"], ["D", user.draws, "--ink-mid"], ["Lv", user.currentLevel, "--blue"]] as const).map(([l, v, c]) => (
              <div key={l}>
                <div style={{ ...tf, fontSize: 20, color: `var(${c})` }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--ink-light)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="neo-btn-fill" style={{ width: "100%", padding: 12, fontSize: 17, fontFamily: "inherit", borderRadius: 14, opacity: saving ? 0.6 : 1 }}>
          {saving ? "…" : "✓ save"}
        </button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "var(--ink-light)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 };
