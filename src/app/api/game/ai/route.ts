import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { games, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getAiMove, checkWinner, isBoardFull, getLevelDifficulty, getDailyChallengeBoard } from "@/lib/ai";
import type { Board } from "@/lib/ai";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, gameId, cellIndex, difficulty, level, isDaily } = await req.json();

    if (action === "create") {
      const actualDifficulty = level ? getLevelDifficulty(level) : (difficulty || "medium");
      const initialBoard = isDaily ? getDailyChallengeBoard() : Array(9).fill(null);

      const [game] = await db.insert(games).values({
        playerXId: user.id,
        playerOId: null,
        board: JSON.stringify(initialBoard),
        currentTurn: "X",
        status: "active",
        gameType: "ai",
        aiDifficulty: actualDifficulty,
        level: level || null,
        isDaily: isDaily || false,
        dailyDate: isDaily ? new Date().toISOString().split("T")[0] : null,
      }).returning();

      return NextResponse.json({
        game: { ...game, board: initialBoard },
      });
    }

    if (action === "move") {
      if (gameId === undefined || cellIndex === undefined) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
      if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
      if (game.status !== "active") return NextResponse.json({ error: "Game is over" }, { status: 400 });

      const board = (typeof game.board === "string" ? JSON.parse(game.board) : game.board) as Board;

      if (board[cellIndex] !== null) {
        return NextResponse.json({ error: "Cell occupied" }, { status: 400 });
      }

      // Player move (X)
      board[cellIndex] = "X";

      let { winner: winnerVal } = checkWinner(board);
      let gameStatus = game.status;
      let gameWinner: string | null = null;

      if (winnerVal) {
        gameStatus = "finished";
        gameWinner = winnerVal;
      } else if (isBoardFull(board)) {
        gameStatus = "finished";
        gameWinner = "draw";
      } else {
        // AI move (O)
        const aiMove = getAiMove(board, game.aiDifficulty || "medium", game.level ?? undefined);
        board[aiMove] = "O";

        const result = checkWinner(board);
        if (result.winner) {
          gameStatus = "finished";
          gameWinner = result.winner;
        } else if (isBoardFull(board)) {
          gameStatus = "finished";
          gameWinner = "draw";
        }
      }

      await db.update(games).set({
        board: JSON.stringify(board),
        status: gameStatus,
        winner: gameWinner,
        updatedAt: new Date(),
      }).where(eq(games.id, gameId));

      // Update user stats if game ended
      if (gameStatus === "finished") {
        if (gameWinner === "X") {
          await db.update(users).set({ wins: (user.wins ?? 0) + 1 }).where(eq(users.id, user.id));
          // Level progression
          if (game.level && game.level >= (user.currentLevel ?? 1)) {
            const nextLevel = Math.min(game.level + 1, 100);
            await db.update(users).set({ currentLevel: nextLevel }).where(eq(users.id, user.id));
          }
        } else if (gameWinner === "O") {
          await db.update(users).set({ losses: (user.losses ?? 0) + 1 }).where(eq(users.id, user.id));
        } else {
          await db.update(users).set({ draws: (user.draws ?? 0) + 1 }).where(eq(users.id, user.id));
        }
      }

      return NextResponse.json({
        board,
        status: gameStatus,
        winner: gameWinner,
        winCombo: checkWinner(board).combo,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("AI game error:", error);
    return NextResponse.json({ error: "Game error" }, { status: 500 });
  }
}
