"use client";
import { useState } from "react";
import type { UserData } from "@/app/page";

const AVATARS = ["🎮","🎯","🎲","🏆","⭐","🔥","💎","🎪","🌟","🚀","🎭","🎨","🦊","🐉","🦁","🐺","🦅","🐬","🦄","🤖"];

export default function ProfileModal({ user, onClose, onUpdate }: { user: UserData; onClose: () => void; onUpdate: (user: UserData) => void }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => { setSaving(true); try { const res = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, avatar: selectedAvatar }) }); if (res.ok) { onUpdate({ ...user, displayName, avatar: selectedAvatar }); } } catch { /* ignore */ } setSaving(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(160, 170, 185, 0.7)", backdropFilter: "blur(4px)" }}>
      <div className="neo-card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold" style={{ color: "#2d3748" }}>Edit Profile</h2><button onClick={onClose} className="neo-btn px-3 py-1 text-sm rounded-lg">✕</button></div>
        <div className="mb-4"><label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#718096" }}>Username (cannot change)</label><div className="neo-pressed p-3 rounded-xl text-sm" style={{ color: "#718096" }}>@{user.username}</div></div>
        <div className="mb-4"><label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#718096" }}>Display Name</label><input type="text" className="neo-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} /></div>
        <div className="mb-6"><label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#718096" }}>Avatar</label><div className="grid grid-cols-10 gap-2">{AVATARS.map((avatar) => (<button key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`text-2xl p-2 rounded-xl transition-all ${selectedAvatar === avatar ? "neo-pressed" : "hover:scale-110"}`}>{avatar}</button>))}</div></div>
        <div className="neo-pressed p-4 rounded-xl mb-6"><h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "#718096" }}>Your Stats</h3><div className="grid grid-cols-4 gap-3 text-center"><div><div className="text-lg font-bold" style={{ color: "#00b894" }}>{user.wins}</div><div className="text-xs" style={{ color: "#718096" }}>Wins</div></div><div><div className="text-lg font-bold" style={{ color: "#e17055" }}>{user.losses}</div><div className="text-xs" style={{ color: "#718096" }}>Losses</div></div><div><div className="text-lg font-bold" style={{ color: "#fdcb6e" }}>{user.draws}</div><div className="text-xs" style={{ color: "#718096" }}>Draws</div></div><div><div className="text-lg font-bold" style={{ color: "#6c5ce7" }}>{user.currentLevel}</div><div className="text-xs" style={{ color: "#718096" }}>Level</div></div></div></div>
        <button onClick={handleSave} disabled={saving} className="neo-btn-accent w-full py-3 rounded-xl">{saving ? "Saving..." : "Save Changes"}</button>
      </div>
    </div>
  );
}
