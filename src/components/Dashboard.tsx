"use client";
import { useState, useEffect, useCallback } from "react";
import type { UserData } from "@/app/page";
import GameBoard from "./GameBoard";
import FriendsList from "./FriendsList";
import LevelsGrid from "./LevelsGrid";
import ProfileModal from "./ProfileModal";

type Screen = "home" | "play-ai" | "play-pvp" | "levels" | "friends";

interface GameInvitation {
  id: string;
  gameId: string;
  from: { id: string; username: string; displayName: string; avatar: string };
  createdAt: string;
}

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
  onUserUpdate: (user: UserData) => void;
}

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
    const interval = setInterval(fetchInvitations, 5000);
    return () => clearInterval(interval);
  }, [fetchInvitations]);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) onUserUpdate(data.user);
      }
    } catch {
      /* ignore */
    }
  };

  const startAiGame = async (difficulty: string, level?: number, daily?: boolean) => {
    try {
      const res = await fetch("/api/game/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          difficulty,
          level: level || null,
          isDaily: daily || false,
        }),
      });
      const data = await res.json();
      if (data.game) {
        setGameId(data.game.id);
        setAiDifficulty(difficulty);
        setSelectedLevel(level || null);
        setIsDaily(daily || false);
        setScreen("play-ai");
      }
    } catch {
      showToast("Failed to start game");
    }
  };

  const startPvpGame = async (opponentUsername: string) => {
    try {
      const res = await fetch("/api/game/pvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", opponentUsername }),
      });
      const data = await res.json();
      if (data.game) {
        setPvpGameId(data.game.id);
        setScreen("play-pvp");
        showToast("Invitation sent!");
      } else {
        showToast(data.error || "Failed to create game");
      }
    } catch {
      showToast("Failed to start game");
    }
  };

  const acceptInvitation = async (invitationId: string, invGameId: string) => {
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, action: "accept" }),
      });
      const data = await res.json();
      if (data.success) {
        setPvpGameId(invGameId);
        setScreen("play-pvp");
        fetchInvitations();
        showToast("Game accepted! You play as O");
      }
    } catch {
      showToast("Failed to accept invitation");
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, action: "decline" }),
      });
      fetchInvitations();
    } catch {
      /* ignore */
    }
  };

  // ── AI Game Screen ──
  if (screen === "play-ai" && gameId) {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => {
              setScreen("home");
              setGameId(null);
              refreshUser();
            }}
            className="neo-btn mb-4 text-sm px-4 py-2"
          >
            ← Back
          </button>
          <GameBoard
            gameId={gameId}
            mode="ai"
            user={user}
            level={selectedLevel}
            isDaily={isDaily}
            onGameEnd={() => refreshUser()}
            onNextLevel={(nextLvl: number) => {
              refreshUser();
              const diff =
                nextLvl <= 20 ? "easy" : nextLvl <= 60 ? "medium" : "hard";
              startAiGame(diff, nextLvl);
            }}
            onRetry={() => {
              if (selectedLevel) {
                const diff =
                  selectedLevel <= 20
                    ? "easy"
                    : selectedLevel <= 60
                    ? "medium"
                    : "hard";
                startAiGame(diff, selectedLevel);
              }
            }}
            onPlayAgain={() => {
              startAiGame(aiDifficulty, undefined, isDaily);
            }}
          />
        </div>
      </div>
    );
  }

  // ── PvP Game Screen ──
  if (screen === "play-pvp" && pvpGameId) {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => {
              setScreen("home");
              setPvpGameId(null);
              refreshUser();
            }}
            className="neo-btn mb-4 text-sm px-4 py-2"
          >
            ← Back
          </button>
          <GameBoard
            gameId={pvpGameId}
            mode="pvp"
            user={user}
            onGameEnd={() => refreshUser()}
          />
        </div>
      </div>
    );
  }

  // ── Levels Screen ──
  if (screen === "levels") {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setScreen("home")}
            className="neo-btn mb-4 text-sm px-4 py-2"
          >
            ← Back
          </button>
          <LevelsGrid
            currentLevel={user.currentLevel}
            onSelectLevel={(level: number) => {
              const difficulty =
                level <= 20 ? "easy" : level <= 60 ? "medium" : "hard";
              startAiGame(difficulty, level);
            }}
          />
        </div>
      </div>
    );
  }

  // ── Friends Screen ──
  if (screen === "friends") {
    return (
      <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setScreen("home")}
            className="neo-btn mb-4 text-sm px-4 py-2"
          >
            ← Back
          </button>
          <FriendsList
            onInvite={(username: string) => startPvpGame(username)}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  // ── Home Screen ──
  return (
    <div className="min-h-screen p-4" style={{ background: "#e0e5ec" }}>
      {toast && (
        <div
          className="toast neo-card"
          style={{
            background: "linear-gradient(145deg, #7d6ef0, #5b4ed6)",
            color: "white",
          }}
        >
          {toast}
        </div>
      )}

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={(updatedUser: UserData) => {
            onUserUpdate(updatedUser);
            setShowProfile(false);
          }}
        />
      )}

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="neo-card mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfile(true)}
                className="text-3xl cursor-pointer hover:scale-110 transition-transform"
                title="Edit Profile"
              >
                {user.avatar}
              </button>
              <div>
                <h2
                  className="font-bold text-lg"
                  style={{ color: "#2d3748" }}
                >
                  {user.displayName}
                </h2>
                <p className="text-xs" style={{ color: "#718096" }}>
                  @{user.username}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="neo-btn text-xs px-3 py-2"
            >
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="neo-pressed p-3 text-center rounded-xl">
              <div
                className="text-lg font-bold"
                style={{ color: "#00b894" }}
              >
                {user.wins}
              </div>
              <div className="text-xs" style={{ color: "#718096" }}>
                Wins
              </div>
            </div>
            <div className="neo-pressed p-3 text-center rounded-xl">
              <div
                className="text-lg font-bold"
                style={{ color: "#e17055" }}
              >
                {user.losses}
              </div>
              <div className="text-xs" style={{ color: "#718096" }}>
                Losses
              </div>
            </div>
            <div className="neo-pressed p-3 text-center rounded-xl">
              <div
                className="text-lg font-bold"
                style={{ color: "#fdcb6e" }}
              >
                {user.draws}
              </div>
              <div className="text-xs" style={{ color: "#718096" }}>
                Draws
              </div>
            </div>
            <div className="neo-pressed p-3 text-center rounded-xl">
              <div
                className="text-lg font-bold"
                style={{ color: "#6c5ce7" }}
              >
                {user.currentLevel}
              </div>
              <div className="text-xs" style={{ color: "#718096" }}>
                Level
              </div>
            </div>
          </div>
        </div>

        {/* Game Invitations */}
        {invitations.length > 0 && (
          <div className="neo-card mb-6 animate-slide-up">
            <h3
              className="font-bold mb-3 flex items-center gap-2"
              style={{ color: "#2d3748" }}
            >
              📬 Game Invitations
              <span
                className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full text-white"
                style={{ background: "#e17055" }}
              >
                {invitations.length}
              </span>
            </h3>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="neo-pressed p-3 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{inv.from.avatar}</span>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#2d3748" }}
                      >
                        {inv.from.displayName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "#718096" }}
                      >
                        wants to play!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        acceptInvitation(inv.id, inv.gameId)
                      }
                      className="neo-btn-accent text-xs px-3 py-1 rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(inv.id)}
                      className="neo-btn-danger text-xs px-3 py-1 rounded-lg"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Modes */}
        <div className="space-y-4">
          {/* VS Computer */}
          <div className="neo-card animate-slide-up">
            <h3
              className="font-bold text-lg mb-3 flex items-center gap-2"
              style={{ color: "#2d3748" }}
            >
              🤖 Play vs Computer
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => startAiGame("easy")}
                className="neo-btn py-4 text-center rounded-xl"
              >
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-xs font-semibold">Easy</div>
              </button>
              <button
                onClick={() => startAiGame("medium")}
                className="neo-btn py-4 text-center rounded-xl"
              >
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs font-semibold">Medium</div>
              </button>
              <button
                onClick={() => startAiGame("hard")}
                className="neo-btn py-4 text-center rounded-xl"
              >
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xs font-semibold">Hard</div>
              </button>
            </div>
          </div>

          {/* 100 Levels */}
          <button
            onClick={() => setScreen("levels")}
            className="neo-card w-full text-left animate-slide-up cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-bold text-lg flex items-center gap-2"
                  style={{ color: "#2d3748" }}
                >
                  🏆 100 Levels
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "#718096" }}
                >
                  Progress through increasingly difficult challenges
                </p>
                <div className="mt-2">
                  <div
                    className="w-full h-2 rounded-full"
                    style={{ background: "#d1d9e6" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(user.currentLevel, 100)}%`,
                        background:
                          "linear-gradient(90deg, #6c5ce7, #a29bfe)",
                      }}
                    />
                  </div>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "#718096" }}
                  >
                    Level {user.currentLevel} / 100
                  </p>
                </div>
              </div>
              <span className="text-3xl">→</span>
            </div>
          </button>

          {/* Daily Challenge */}
          <button
            onClick={() => startAiGame("hard", undefined, true)}
            className="neo-card w-full text-left animate-slide-up cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-bold text-lg flex items-center gap-2"
                  style={{ color: "#2d3748" }}
                >
                  📅 Daily Challenge
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "#718096" }}
                >
                  {"A new challenge every day! Can you beat today's puzzle?"}
                </p>
              </div>
              <span className="text-3xl">→</span>
            </div>
          </button>

          {/* Play with Friends */}
          <button
            onClick={() => setScreen("friends")}
            className="neo-card w-full text-left animate-slide-up cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-bold text-lg flex items-center gap-2"
                  style={{ color: "#2d3748" }}
                >
                  👥 Play with Friends
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "#718096" }}
                >
                  Invite friends by username and play together
                </p>
              </div>
              <span className="text-3xl">→</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 mb-4">
          <p className="text-xs" style={{ color: "#a3b1c6" }}>
            Tic Tac Toe Arena • Made with ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
