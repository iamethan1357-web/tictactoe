import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { friendships } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { friendshipId, action } = await req.json();
    if (!friendshipId || !action) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const [friendship] = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.id, friendshipId),
          eq(friendships.friendId, user.id),
          eq(friendships.status, "pending")
        )
      )
      .limit(1);

    if (!friendship) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "accept") {
      await db
        .update(friendships)
        .set({ status: "accepted" })
        .where(eq(friendships.id, friendshipId));
      return NextResponse.json({ success: true, message: "Friend request accepted!" });
    } else {
      await db.delete(friendships).where(eq(friendships.id, friendshipId));
      return NextResponse.json({ success: true, message: "Friend request declined" });
    }
  } catch (error) {
    console.error("Respond friend error:", error);
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 });
  }
}
