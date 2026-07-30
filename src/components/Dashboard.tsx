"use client";
import { useState, useEffect, useCallback } from "react";
import type { UserData } from "@/app/page";
import GameBoard from "./GameBoard";
import FriendsList from "./FriendsList";
import LevelsGrid from "./LevelsGrid";
import ProfileModal from "./ProfileModal";

type Screen = "home" | "play-ai" | "play-pvp" | "levels" | "friends";

interface GameInvitation { id: string; gameId: string; from: { id: string; username: string; displayName: string; avatar: string }; createdAt: string; }

interface DashboardProps { user: UserData; onLogout: () => void; onUserUpdate: (user: UserData) => void; }

export default function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const [screen, setScreen] = useState<Screen>("home");
  const [gameId, setGameId] = useState<string | null>(null);
  const [pvpGameId, setPvpGameId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isDaily, setIsDaily] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [invitations, setInvitations] = useState<GameInvitation[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchInvitations = useCallback(async () => {
    try { const res = await fetch("/api/invitations"); if (res.ok) { const data = await res.json(); setInvitations(data.invitations || []); } } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchInvitations(); const interval = setInterval(fetchInvitations, 5000); return () => clearInterval(interval); }, [fetchInvitations]);

  const refreshUser = async () => { try { const res = await fetch("/api/auth/me"); if (res.ok) { const data = await res.json(); if (data.user) onUserUpdate(data.user); } } catch { /* ignore */ } };

  const startAiGame = async (difficulty: string, level?: number, daily?: boolean) => {
    try {
      const res = await fetch("/api/game/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", difficulty, level: level || null, isDaily: daily || false }) });
      const data = await res.json();
      if (data.game) { setGameId(data.game.id); setAiDifficulty(difficulty); setSelectedLevel(level || null); setIsDaily(daily || false); setScreen("play-ai"); }
    } catch { showToast("Failed to start game"); }
  };

  const startPvpGame = async (opponentUsername: string) => {
    try {
      const res = await fetch("/api/game/pvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", opponentUsername }) });
      const data = await res.json();
      if (data.game) { setPvpGameId(data.game.id); setScreen("play-pvp"); showToast("Invitation sent!"); } else { showToast(data.error || "Failed to create game"); }
    } catch { showToast("Failed to start game"); }
  };

  const acceptInvitation = async (invitationId: string, invGameId: string) => {
    try {
      const res = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, action: "accept" }) });
      const data = await res.json();
      if (data.success) { setPvpGameId(invGameId); setScreen("play-pvp"); fetchInvitations(); showToast("Game accepted! You play as O"); }
    } catch { showToast("Failed to accept invitation"); }
  };

  const declineInvitation = async (invitationId: string) => {
    try { await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, action: "decline" }) }); fetchInvitations(); } catch { /* ignore */ }
  };

  if (screen === "play-ai" && gameId) {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => { setScreen("home"); setGameId(null); refreshUser(); }} className="neo-btn mb-4 text-sm px-4 py-2">← Back</button>
          <GameBoard
            gameId={gameId} mode="ai" user={user} level={selectedLevel} isDaily={isDaily}
            onGameEnd={() => refreshUser()}
            onNextLevel={(nextLvl: number) => {
              refreshUser();
              const diff = nextLvl <= 20 ? "easy" : nextLvl <= 60 ? "medium" : "hard";
              startAiGame(diff, nextLvl);
            }}
            onRetry={() => {
              if (selectedLevel) {
                const diff = selectedLevel <= 20 ? "easy" : selectedLevel <= 60 ? "medium" : "hard";
                startAiGame(diff, selectedLevel);
              }
            }}
            onPlayAgain={() => { startAiGame(aiDifficulty, undefined, isDaily); }}
          />
        </div>
      </div>
    );
  }

  if (screen === "play-pvp" && pvpGameId) {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => { setScreen("home"); setPvpGameId(null); refreshUser(); }} className="neo-btn mb-4 text-sm px-4 py-2">← Back</button>
          <GameBoard gameId={pvpGameId} mode="pvp" user={user} onGameEnd={() => refreshUser()} />
        </div>
      </div>
    );
  }

  if (screen === "levels") {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => setScreen("home")} className="neo-btn mb-4 text-sm px-4 py-2">← Back</button>
          <LevelsGrid currentLevel={user.currentLevel} onSelectLevel={(level: number) => { const difficulty = level <= 20 ? "easy" : level <= 60 ? "medium" : "hard"; startAiGame(difficulty, level); }} />
        </div>
      </div>
    );
  }

  if (screen === "friends") {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => setScreen("home")} className="neo-btn mb-4 text-sm px-4 py-2">← Back</button>
          <FriendsList onInvite={(username: string) => startPvpGame(username)} showToast={showToast} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
      {toast && (<div className="toast neo-card" style={{ background: "linear-gradient(145deg, #7d6ef0, #5b4ed6)", color: "white" }}>{toast}</div>)}
      {showProfile && (<ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={(updatedUser: UserData) => { onUserUpdate(updatedUser); setShowProfile(false); }} />)}

      <div className="max-w-lg mx-auto">
        <div className="neo-card mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowProfile(true)} className="text-3xl cursor-pointer hover:scale-110 transition-transform" title="Edit Profile">{user.avatar}</button>
              <div>
                <h2 className="font-bold text-lg" style={{ color: "#2d3748" }}>{user.displayName}</h2>
                <p className="text-xs" style={{ color: "#718096" }}>@{user.username}</p>
              </div>
            </div>
            <button onClick={onLogout} className="neo-btn text-xs px-3 py-2">Logout</button>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="neo-pressed p-3 text-center rounded-xl"><div className="text-lg font-bold" style={{ color: "#00b894" }}>{user.wins}</div><div className="text-xs" style={{ color: "#718096" }}>Wins</div></div>
            <div className="neo-pressed p-3 text-center rounded-xl"><div className="text-lg font-bold" style={{ color: "#e17055" }}>{user.losses}</div><div className="text-xs" style={{ color: "#718096" }}>Losses</div></div>
            <div className="neo-pressed p-3 text-center rounded-xl"><div className="text-lg font-bold" style={{ color: "#fdcb6e" }}>{user.draws}</div><div className="text-xs" style={{ color: "#718096" }}>Draws</div></div>
            <div className="neo-pressed p-3 text-center rounded-xl"><div className="text-lg font-bold" style={{ color: "#6c5ce7" }}>{user.currentLevel}</div><div className="text-xs" style={{ color: "#718096" }}>Level</div></div>
          </div>
        </div>

        {invitations.length > 0 && (
          <div className="neo-card mb-6 animate-slide-up">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#2d3748" }}>📬 Game Invitations <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full text-white" style={{ background: "#e17055" }}
