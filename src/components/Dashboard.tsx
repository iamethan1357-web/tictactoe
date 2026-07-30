"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserData } from "@/app/page";
import GameBoard from "./GameBoard";
import FriendsList from "./FriendsList";
import LevelsGrid from "./LevelsGrid";
import ProfileModal from "./ProfileModal";

type Screen = "home" | "ai" | "pvp" | "levels" | "friends";
interface Inv { id: string; gameId: string; from: { id: string; username: string; displayName: string; avatar: string }; createdAt: string; }

export default function Dashboard({ user, onLogout, onUserUpdate }: { user: UserData; onLogout: () => void; onUserUpdate: (u: UserData) => void }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [gameId, setGameId] = useState<string | null>(null);
  const [pvpId, setPvpId] = useState<string | null>(null);
  const [selLevel, setSelLevel] = useState<number | null>(null);
  const [daily, setDaily] = useState(false);
  const [invs, setInvs] = useState<Inv[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const tf: React.CSSProperties = { fontFamily: "'Architects Daughter', cursive" };

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const fetchInvs = useCallback(async () => { try { const r = await fetch("/api/invitations"); if (r.ok) { const d = await r.json(); setInvs(d.invitations || []); } } catch { /* */ } }, []);
  useEffect(() => { fetchInvs(); const t = setInterval(fetchInvs, 5000); return () => clearInterval(t); }, [fetchInvs]);
  const refreshUser = async () => { try { const r = await fetch("/api/auth/me"); if (r.ok) { const d = await r.json(); if (d.user) onUserUpdate(d.user); } } catch { /* */ } };

  const [aiDiff, setAiDiff] = useState("medium");

  const startAi = async (diff: string, level?: number, isDaily?: boolean) => {
    try {
      const r = await fetch("/api/game/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", difficulty: diff, level: level || null, isDaily: isDaily || false }) });
      const d = await r.json();
      if (d.game) { setGameId(d.game.id); setSelLevel(level || null); setDaily(isDaily || false); setAiDiff(diff); setScreen("ai"); }
    } catch { flash("Failed"); }
  };

  const startPvp = async (opp: string) => {
    try { const r = await fetch("/api/game/pvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", opponentUsername: opp }) }); const d = await r.json(); if (d.game) { setPvpId(d.game.id); setScreen("pvp"); flash("Invitation sent!"); } else flash(d.error || "Failed"); } catch { flash("Failed"); }
  };
  const acceptInv = async (invId: string, gId: string) => {
    try { const r = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId: invId, action: "accept" }) }); const d = await r.json(); if (d.success) { setPvpId(gId); setScreen("pvp"); fetchInvs(); flash("Game on — you are O"); } } catch { flash("Failed"); }
  };
  const declineInv = async (invId: string) => { try { await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId: invId, action: "decline" }) }); fetchInvs(); } catch { /* */ } };
  const back = () => { setScreen("home"); setGameId(null); setPvpId(null); refreshUser(); };

  if (screen === "ai" && gameId) return (
    <Page onBack={back}>
      <GameBoard
        gameId={gameId}
        mode="ai"
        user={user}
        level={selLevel}
        isDaily={daily}
        onGameEnd={refreshUser}
        onNextLevel={(nextLvl: number) => {
          refreshUser();
          const diff = nextLvl <= 20 ? "easy" : nextLvl <= 60 ? "medium" : "hard";
          startAi(diff, nextLvl);
        }}
        onRetry={() => {
          if (selLevel) {
            const diff = selLevel <= 20 ? "easy" : selLevel <= 60 ? "medium" : "hard";
            startAi(diff, selLevel);
          }
        }}
        onPlayAgain={() => {
          startAi(aiDiff, undefined, daily);
        }}
      />
    </Page>
  );
  if (screen === "pvp" && pvpId) return <Page onBack={back}><GameBoard gameId={pvpId} mode="pvp" user={user} onGameEnd={refreshUser} /></Page>;
  if (screen === "levels") return <Page onBack={() => setScreen("home")}><LevelsGrid currentLevel={user.currentLevel} onSelectLevel={(l: number) => startAi(l <= 20 ? "easy" : l <= 60 ? "medium" : "hard", l)} /></Page>;
  if (screen === "friends") return <Page onBack={() => setScreen("home")}><FriendsList onInvite={(u: string) => startPvp(u)} showToast={flash} /></Page>;

  return (
    <div className="min-h-screen p-4">
      {toast && <div className="toast-msg">{toast}</div>}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={(u: UserData) => { onUserUpdate(u); setShowProfile(false); }} />}

      <div style={{ maxWidth: 460, margin: "0 auto", paddingLeft: 40 }}>
        {/* Header */}
        <div className="neo anim-in" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setShowProfile(true)} className="neo-in" style={{ fontSize: 28, border: "none", cursor: "pointer", padding: 8, borderRadius: 14, background: "var(--bg)" }}>{user.avatar}</button>
              <div>
                <h2 style={{ ...tf, fontSize: 24, color: "var(--ink)", lineHeight: 1.1 }}>{user.displayName}</h2>
                <p style={{ fontSize: 13, color: "var(--ink-light)" }}>@{user.username}</p>
              </div>
            </div>
            <button onClick={onLogout} className="neo-btn" style={{ fontSize: 13, padding: "6px 14px", fontFamily: "inherit" }}>logout</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }}>
            {([["W", user.wins, "--green"], ["L", user.losses, "--red"], ["D", user.draws, "--ink-mid"], ["Lv", user.currentLevel, "--blue"]] as const).map(([l, v, c]) => (
              <div key={l} className="stat-neo">
                <div style={{ ...tf, fontSize: 22, color: `var(${c})` }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Invitations */}
        {invs.length > 0 && (
          <div className="neo anim-slide" style={{ marginBottom: 20 }}>
            <h3 style={{ ...tf, fontSize: 20, color: "var(--red)", marginBottom: 10 }}>
              📬 Invitations
              <span style={{ marginLeft: 8, background: "var(--red)", color: "#fff", padding: "2px 10px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }}>{invs.length}</span>
            </h3>
            {invs.map((inv) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ fontSize: 15 }}>{inv.from.avatar} <strong>{inv.from.displayName}</strong></span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => acceptInv(inv.id, inv.gameId)} className="neo-btn-green" style={{ fontSize: 12, padding: "5px 12px", fontFamily: "inherit" }}>✓ play</button>
                  <button onClick={() => declineInv(inv.id)} className="neo-btn-red" style={{ fontSize: 12, padding: "5px 12px", fontFamily: "inherit" }}>✗</button>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Game Modes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* VS Computer */}
          <div className="neo anim-slide">
            <h3 style={{ ...tf, fontSize: 22, marginBottom: 12 }}>✏️ Play vs Computer</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {([["🌱", "Easy", "easy", "neo-btn"], ["⚡", "Medium", "medium", "neo-btn-blue"], ["🔥", "Hard", "hard", "neo-btn-red"]] as const).map(([e, l, d, cls]) => (
                <button key={d} onClick={() => startAi(d)} className={cls} style={{ padding: "14px 0", fontSize: 15, textAlign: "center", fontFamily: "inherit", borderRadius: 14 }}>
                  <div style={{ fontSize: 22, marginBottom: 3 }}>{e}</div>{l}
                </button>
              ))}
            </div>
          </div>

          {/* 100
