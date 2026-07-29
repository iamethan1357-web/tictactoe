"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserData } from "@/app/page";

type CellValue = "X" | "O" | null;

interface Props { gameId: string; mode: "ai" | "pvp"; user: UserData; level?: number | null; isDaily?: boolean; onGameEnd?: () => void; }

export default function GameBoard({ gameId, mode, user, level, isDaily, onGameEnd }: Props) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [status, setStatus] = useState("active");
  const [winner, setWinner] = useState<string | null>(null);
  const [winCombo, setWinCombo] = useState<number[] | null>(null);
  const [turn, setTurn] = useState("X");
  const [pInfo, setPInfo] = useState<{ x?: { displayName: string; avatar: string }; o?: { displayName: string; avatar: string } }>({});
  const [myTurn, setMyTurn] = useState(true);
  const [thinking, setThinking] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);
  const tf: React.CSSProperties = { fontFamily: "'Architects Daughter', cursive" };

  const fetchPvp = useCallback(async () => {
    if (mode !== "pvp") return;
    try { const r = await fetch("/api/game/pvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status", gameId }) }); const d = await r.json(); if (d.game) { setBoard(Array.isArray(d.game.board) ? d.game.board : JSON.parse(d.game.board)); setStatus(d.game.status); setWinner(d.game.winner); setTurn(d.game.currentTurn); setWinCombo(d.winCombo); setMyTurn(d.isMyTurn); setPInfo({ x: d.playerX, o: d.playerO }); } } catch { /* */ }
  }, [gameId, mode]);

  useEffect(() => { if (mode === "pvp") { fetchPvp(); poll.current = setInterval(fetchPvp, 2000); return () => { if (poll.current) clearInterval(poll.current); }; } }, [mode, fetchPvp]);

  const move = async (i: number) => {
    if (board[i] !== null || status !== "active") return;
    if (mode === "ai") {
      if (thinking) return; setThinking(true);
      try { const r = await fetch("/api/game/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "move", gameId, cellIndex: i }) }); const d = await r.json(); if (d.board) { setBoard(d.board); setStatus(d.status); setWinner(d.winner); setWinCombo(d.winCombo); if (d.status === "finished") onGameEnd?.(); } } catch { /* */ }
      setThinking(false);
    } else {
      if (!myTurn) return;
      try { const r = await fetch("/api/game/pvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "move", gameId, cellIndex: i }) }); const d = await r.json(); if (d.board) { setBoard(d.board); setStatus(d.status); setWinner(d.winner); setTurn(d.currentTurn); setWinCombo(d.winCombo); setMyTurn(false); if (d.status === "finished") { onGameEnd?.(); if (poll.current) clearInterval(poll.current); } } } catch { /* */ }
    }
  };

  const stxt = () => {
    if (status === "waiting") return "⏳ waiting for opponent…";
    if (status === "finished") { if (winner === "draw") return "It's a draw ✏️"; if (mode === "ai") return winner === "X" ? "You win! 🎉" : "Computer wins 🤖"; return (winner === "X" ? pInfo.x?.displayName || "X" : pInfo.o?.displayName || "O") + " wins! 🎉"; }
    if (thinking) return "thinking… ✏️"; if (mode === "pvp") return myTurn ? "your turn ✏️" : "opponent's turn…"; return "your turn ✏️";
  };
  const scol = () => { if (status === "finished") { if (winner === "draw") return "var(--ink-mid)"; return winner === "X" ? "var(--green)" : "var(--red)"; } return "var(--blue)"; };
  const tag = isDaily ? "📅 daily challenge" : level ? `📝 level ${level}` : mode === "ai" ? "✏️ vs computer" : "👥 vs friend";

  return (
    <div className="anim-in">
      {/* Status */}
      <div className="neo" style={{ marginBottom: 16, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--ink-light)", marginBottom: 4 }}>{tag}</p>
        <p style={{ ...tf, fontSize: 22, color: scol() }}>{stxt()}</p>
        {mode === "pvp" && pInfo.x && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
            <span className={turn === "X" ? "neo-in" : ""} style={{ padding: "4px 12px", borderRadius: 10, fontSize: 14, color: "var(--blue)", fontWeight: 700 }}>{pInfo.x.avatar} {pInfo.x.displayName} (X)</span>
            <span style={{ fontSize: 13, color: "var(--ink-light)", alignSelf: "center" }}>vs</span>
            <span className={turn === "O" ? "neo-in" : ""} style={{ padding: "4px 12px", borderRadius: 10, fontSize: 14, color: "var(--red)", fontWeight: 700 }}>{pInfo.o?.avatar || "🤖"} {pInfo.o?.displayName || "?"} (O)</span>
          </div>
        )}
      </div>

      {/* BOARD */}
      <div className="neo" style={{ padding: 24 }}>
        <div className="ttt-board">
          {board.map((c, i) => (
            <button key={i} onClick={() => move(i)}
              disabled={c !== null || status !== "active" || thinking || (mode === "pvp" && !myTurn)}
              className={`ttt-cell${c ? " occupied" : ""}${winCombo?.includes(i) ? " win-cell" : ""}`}
              style={{ minHeight: 88 }}>
              {c === "X" && <svg className="x-mark" viewBox="0 0 50 50" width="52%" height="52%"><line x1="10" y1="10" x2="40" y2="40" /><line x1="40" y1="10" x2="10" y2="40" /></svg>}
              {c === "O" && <svg className="o-mark" viewBox="0 0 50 50" width="52%" height="52%"><circle cx="25" cy="25" r="16" /></svg>}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {status === "finished" && (
        <div className="neo anim-slide" style={{ marginTop: 16, textAlign: "center", padding: 18 }}>
          <div style={{ fontSize: 38, marginBottom: 6 }}>{winner === "X" && mode === "ai" ? "🎉" : winner === "draw" ? "🤝" : "📝"}</div>
          {winner === "X" && level && <p style={{ fontSize: 15, color: "var(--green)" }}>✓ level {level} cleared — next page unlocked</p>}
          {winner === "O" && mode === "ai" && <p style={{ fontSize: 15, color: "var(--red)" }}>try again ✏️</p>}
          {winner === "draw" && <p style={{ fontSize: 15, color: "var(--ink-mid)" }}>no winner this page</p>}
        </div>
      )}
    </div>
  );
}
