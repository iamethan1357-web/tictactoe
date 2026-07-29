import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invitations, users, games } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pendingInvites = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.toUserId, user.id),
          eq(invitations.status, "pending")
        )
      );

    const enriched = [];
    for (const inv of pendingInvites) {
      const [sender] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, inv.fromUserId))
        .limit(1);

      if (sender) {
        enriched.push({
          id: inv.id,
          gameId: inv.gameId,
          from: sender,
          createdAt: inv.createdAt,
        });
      }
    }

    return NextResponse.json({ invitations: enriched });
  } catch (error) {
    console.error("Invitations error:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { invitationId, action } = await req.json();

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.toUserId, user.id),
          eq(invitations.status, "pending")
        )
      )
      .limit(1);

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (action === "accept") {
      await db.update(invitations).set({ status: "accepted" }).where(eq(invitations.id, invitationId));

      if (invitation.gameId) {
        await db.update(games).set({ status: "active" }).where(eq(games.id, invitation.gameId));
      }

      return NextResponse.json({ success: true, gameId: invitation.gameId });
    } else {
      await db.update(invitations).set({ status: "declined" }).where(eq(invitations.id, invitationId));

      if (invitation.gameId) {
        await db.update(games).set({ status: "finished", winner: "cancelled" }).where(eq(games.id, invitation.gameId));
      }

      return NextResponse.json({ success: true, message: "Invitation declined" });
    }
  } catch (error) {
    console.error("Invitation respond error:", error);
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 });
  }
}
