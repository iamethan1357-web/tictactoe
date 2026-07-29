import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { games, users, invitations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { checkWinner, isBoardFull } from "@/lib/ai";
import type { Board } from "@/lib/ai";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, gameId, cellIndex, opponentUsername } = await req.json();

    if (action === "create") {
      // Find opponent
      const [opponent] = await db
        .select()
        .from(users)
        .where(eq(users.username, opponentUsername.toLowerCase()))
        .limit(1);

      if (!opponent) return NextResponse.json({ error: "Opponent not found" }, { status: 404 });
      if (opponent.id === user.id) return NextResponse.json({ error: "Cannot play yourself" }, { status: 400 });

      const [game] = await db.insert(games).values({
        playerXId: user.id,
        playerOId: opponent.id,
        board: JSON.stringify(Array(9).fill(null)),
        currentTurn: "X",
        status: "waiting",
        gameType: "pvp",
      }).returning();

      // Create invitation
      await db.insert(invitations).values({
        fromUserId: user.id,
        toUserId: opponent.id,
        gameId: game.id,
        status: "pending",
      });

      return NextResponse.json({ game, message: "Invitation sent!" });
    }

    if (action === "move") {
      if (gameId === undefined || cellIndex === undefined) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
      if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
      if (game.status !== "active") return NextResponse.json({ error: "Game not active" }, { status: 400 });

      // Check if it's the user's turn
      const isPlayerX = game.playerXId === user.id;
      const isPlayerO = game.playerOId === user.id;

      if (!isPlayerX && !isPlayerO) {
        return NextResponse.json({ error: "Not your game" }, { status: 403 });
      }

      const expectedMark = game.currentTurn;
      if ((expectedMark === "X" && !isPlayerX) || (expectedMark === "O" && !isPlayerO)) {
        return NextResponse.json({ error: "Not your turn" }, { status: 400 });
      }

      const board = (typeof game.board === "string" ? JSON.parse(game.board) : game.board) as Board;

      if (board[cellIndex] !== null) {
        return NextResponse.json({ error: "Cell occupied" }, { status: 400 });
      }

      board[cellIndex] = expectedMark as "X" | "O";

      let { winner: winnerVal } = checkWinner(board);
      let gameStatus = game.status;
      let gameWinner: string | null = null;
      const nextTurn = expectedMark === "X" ? "O" : "X";

      if (winnerVal) {
        gameStatus = "finished";
        gameWinner = winnerVal;
      } else if (isBoardFull(board)) {
        gameStatus = "finished";
        gameWinner = "draw";
      }

      await db.update(games).set({
        board: JSON.stringify(board),
        currentTurn: nextTurn,
        status: gameStatus,
        winner: gameWinner,
        updatedAt: new Date(),
      }).where(eq(games.id, gameId));

      // Update stats if game finished
      if (gameStatus === "finished" && game.playerOId) {
        if (gameWinner === "X") {
          await db.update(users).set({ wins: (await getWins(game.playerXId)) + 1 }).where(eq(users.id, game.playerXId));
          await db.update(users).set({ losses: (await getLosses(game.playerOId)) + 1 }).where(eq(users.id, game.playerOId));
        } else if (gameWinner === "O") {
          await db.update(users).set({ wins: (await getWins(game.playerOId)) + 1 }).where(eq(users.id, game.playerOId));
          await db.update(users).set({ losses: (await getLosses(game.playerXId)) + 1 }).where(eq(users.id, game.playerXId));
        } else {
          await db.update(users).set({ draws: (await getDraws(game.playerXId)) + 1 }).where(eq(users.id, game.playerXId));
          await db.update(users).set({ draws: (await getDraws(game.playerOId)) + 1 }).where(eq(users.id, game.playerOId));
        }
      }

      return NextResponse.json({
        board,
        currentTurn: nextTurn,
        status: gameStatus,
        winner: gameWinner,
        winCombo: checkWinner(board).combo,
      });
    }

    if (action === "status") {
      const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
      if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

      const board = (typeof game.board === "string" ? JSON.parse(game.board) : game.board) as Board;
      const { combo } = checkWinner(board);

      // Get player names
      const [playerX] = await db.select({ displayName: users.displayName, username: users.username, avatar: users.avatar }).from(users).where(eq(users.id, game.playerXId)).limit(1);
      const playerO = game.playerOId
        ? (await db.select({ displayName: users.displayName, username: users.username, avatar: users.avatar }).from(users).where(eq(users.id, game.playerOId)).limit(1))[0]
        : null;

      return NextResponse.json({
        game: { ...game, board },
        playerX,
        playerO,
        winCombo: combo,
        isMyTurn: (game.currentTurn === "X" && game.playerXId === user.id) ||
                  (game.currentTurn === "O" && game.playerOId === user.id),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PvP game error:", error);
    return NextResponse.json({ error: "Game error" }, { status: 500 });
  }
}

async function getWins(userId: string) {
  const [u] = await db.select({ wins: users.wins }).from(users).where(eq(users.id, userId)).limit(1);
  return u?.wins ?? 0;
}

async function getLosses(userId: string) {
  const [u] = await db.select({ losses: users.losses }).from(users).where(eq(users.id, userId)).limit(1);
  return u?.losses ?? 0;
}

async function getDraws(userId: string) {
  const [u] = await db.select({ draws: users.draws }).from(users).where(eq(users.id, userId)).limit(1);
  return u?.draws ?? 0;
}
