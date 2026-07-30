"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { UserData } from "@/app/page";

type CellValue = "X" | "O" | null;

interface GameBoardProps {
  gameId: string;
  mode: "ai" | "pvp";
  user: UserData;
  level?: number | null;
  isDaily?: boolean;
  onGameEnd?: () => void;
  onNextLevel?: (nextLevel: number) => void;
  onRetry?: () => void;
  onPlayAgain?: () => void;
}

export default function GameBoard({ gameId, mode, user, level, isDaily, onGameEnd, onNextLevel, onRetry, onPlayAgain }: GameBoardProps) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [status, setStatus] = useState<string>("active");
  const [winner, setWinner] = useState<string | null>(null);
  const [winCombo, setWinCombo] = useState<number[] | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string>("X");
  const [playerInfo, setPlayerInfo] = useState<{ playerX?: { displayName: string; avatar: string }; playerO?: { displayName: string; avatar: string } }>({});
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [thinking, setThinking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPvpStatus = useCallback(async () => {
    if (mode !== "pvp") return;
    try {
      const res = await fetch("/api/game/pvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status", gameId }) });
      const data = await res.json();
      if (data.game) {
        const b = Array.isArray(data.game.board) ? data.game.board : JSON.parse(data.game.board);
        setBoard(b); setStatus(data.game.status); setWinner(data.game.winner);
        setCurrentTurn(data.game.currentTurn); setWinCombo(data.winCombo); setIsMyTurn(data.isMyTurn);
        setPlayerInfo({ playerX: data.playerX, playerO: data.playerO });
      }
    } catch { /* ignore */ }
  }, [gameId, mode]);

  useEffect(() => {
    if (mode === "pvp") { fetchPvpStatus(); pollRef.current = setInterval(fetchPvpStatus, 2000); return () => { if (pollRef.current) clearInterval(pollRef.current); }; }
  }, [mode, fetchPvpStatus]);

  const makeMove = async (cellIndex: number) => {
    if (board[cellIndex] !== null || status !== "active") return;
    if (mode === "ai") {
      if (thinking) return; setThinking(true);
      try {
        const res = await fetch("/api/game/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "move", gameId, cellIndex }) });
        const data = await res.json();
        if (data.board) { setBoard(data.board); setStatus(data.status); setWinner(data.winner); setWinCombo(data.winCombo); if (data.status === "finished") onGameEnd?.(); }
      } catch { /* ignore */ }
      setThinking(false);
    } else {
      if (!isMyTurn) return;
      try {
        const res = await fetch("/api/game/pvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "move", gameId, cellIndex }) });
        const data = await res.json();
        if (data.board) { setBoard(data.board); setStatus(data.status); setWinner(data.winner); setCurrentTurn(data.currentTurn); setWinCombo(data.winCombo); setIsMyTurn(false); if (data.status === "finished") { onGameEnd?.(); if (pollRef.current) clearInterval(pollRef.current); } }
      } catch { /* ignore */ }
    }
  };

  const getStatusText = () => {
    if (status === "waiting") return "Waiting for opponent to accept...";
    if (status === "finished") {
      if (winner === "draw") return "It's a draw! 🤝";
      if (mode === "ai") return winner === "X" ? "You won! 🎉" : "AI wins! 🤖";
      return winner === "X" ? `${playerInfo.playerX?.displayName || "Player X"} wins! 🎉` : `${playerInfo.playerO?.displayName || "Player O"} wins! 🎉`;
    }
    if (thinking) return "AI is thinking... 🤔";
    if (mode === "pvp") return isMyTurn ? "Your turn!" : "Opponent's turn...";
    return "Your turn!";
  };

  const getStatusColor = () => {
    if (status === "finished") { if (winner === "draw") return "#fdcb6e"; return winner === "X" ? "#00b894" : "#e17055"; }
    return "#6c5ce7";
  };

  const getLevelLabel = () => {
    if (isDaily) return "📅 Daily Challenge";
    if (level) return `🏆 Level ${level}`;
    return mode === "ai" ? "🤖 vs Computer" : "👥 vs Friend";
  };

  const playerWon = winner === "X";
  const isLevelMode = !!level;
  const nextLvl = level ? Math.min(level + 1, 100) : null;

  return (
    <div className="animate-fade-in">
      <div className="neo-card mb-4 text-center">
        <p className="text-sm font-semibold mb-1" style={{ color: "#718096" }}>{getLevelLabel()}</p>
        <p className="text-lg font-bold" style={{ color: getStatusColor() }}>{getStatusText()}</p>
        {mode === "pvp" && playerInfo.playerX && (
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${currentTurn === "X" ? "neo-pressed" : ""}`}>
              <span>{playerInfo.playerX.avatar}</span>
              <span className="text-sm font-semibold" style={{ color: "#6c5ce7" }}>{playerInfo.playerX.displayName} (X)</span>
            </div>
            <span className="text-sm font-bold" style={{ color: "#718096" }}>vs</span>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${currentTurn === "O" ? "neo-pressed" : ""}`}>
              <span>{playerInfo.playerO?.avatar || "🤖"}</span>
              <span className="text-sm font-semibold" style={{ color: "#e17055" }}>{playerInfo.playerO?.displayName || "Opponent"} (O)</span>
            </div>
          </div>
        )}
      </div>

      <div className="neo-card p-6">
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {board.map((cell, idx) => (
            <button key={idx} onClick={() => makeMove(idx)}
              disabled={cell !== null || status !== "active" || thinking || (mode === "pvp" && !isMyTurn)}
              className={`game-cell ${cell ? "occupied" : ""} ${cell === "X" ? "x-cell" : cell === "O" ? "o-cell" : ""} ${winCombo?.includes(idx) ? "winning-cell" : ""}`}
              style={{ width: "100%", minHeight: "80px", fontSize: "2rem" }}>
              {cell || ""}
            </button>
          ))}
        </div>
      </div>

      {status === "finished" && (
        <div className="neo-card mt-4 text-center animate-slide-up">
          <div className="text-4xl mb-3">
            {playerWon && mode === "ai" ? "🎉" : winner === "draw" ? "🤝" : "😢"}
          </div>

          {playerWon && isLevelMode && (
            <p className="text-sm mb-2" style={{ color: "#00b894" }}>✅ Level {level} Complete!</p>
          )}
          {winner === "O" && mode === "ai" && (
            <p className="text-sm mb-2" style={{ color: "#e17055" }}>Better luck next time!</p>
          )}
          {winner === "draw" && (
            <p className="text-sm mb-2" style={{ color: "#fdcb6e" }}>So close! Try again.</p>
          )}

          <div className="flex flex-col gap-3 mt-4 max-w-[260px] mx-auto">
            {isLevelMode && playerWon && nextLvl && nextLvl <= 100 && onNextLevel && (
              <button onClick={() => onNextLevel(nextLvl)} className="neo-btn-success w-full py-3 text-base rounded-xl flex items-center justify-center gap-2">
                📝 Next Level ({nextLvl}) →
              </button>
            )}

            {isLevelMode && !playerWon && onRetry && (
              <button onClick={onRetry} className="neo-btn-accent w-full py-3 text-base rounded-xl flex items-center justify-center gap-2">
                🔄 Retry Level {level}
              </button>
            )}

            {!isLevelMode && mode === "ai" && !isDaily && onPlayAgain && (
              <button onClick={onPlayAgain} className="neo-btn-accent w-full py-3 text-base rounded-xl flex items-center justify-center gap-2">
                🔄 Play Again
              </button>
            )}

            {isDaily && onPlayAgain && (
              <button onClick={onPlayAgain} className="neo-btn-accent w-full py-3 text-base rounded-xl flex items-center justify-center gap-2">
                🔄 Try Again
              </button>
            )}

            {isLevelMode && playerWon && nextLvl && nextLvl > 100 && (
              <p className="text-sm font-bold mt-2" style={{ color: "#00b894" }}>🏆 You completed all 100 levels! Champion!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
