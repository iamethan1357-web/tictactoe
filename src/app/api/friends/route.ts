import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { friendships, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, or } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get accepted friendships
    const allFriendships = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(
            eq(friendships.userId, user.id),
            eq(friendships.friendId, user.id)
          )
        )
      );

    const friendIds = allFriendships.map((f) =>
      f.userId === user.id ? f.friendId : f.userId
    );

    const friends = [];
    for (const friendId of friendIds) {
      const [friend] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
          wins: users.wins,
          losses: users.losses,
          draws: users.draws,
        })
        .from(users)
        .where(eq(users.id, friendId))
        .limit(1);
      if (friend) friends.push(friend);
    }

    // Get pending requests (received)
    const pendingReceived = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.friendId, user.id),
          eq(friendships.status, "pending")
        )
      );

    const pendingRequests = [];
    for (const req of pendingReceived) {
      const [sender] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, req.userId))
        .limit(1);
      if (sender) pendingRequests.push({ ...sender, friendshipId: req.id });
    }

    return NextResponse.json({ friends, pendingRequests });
  } catch (error) {
    console.error("Friends error:", error);
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

    const [friend] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);

    if (!friend) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (friend.id === user.id) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

    // Check existing friendship
    const [existing] = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, user.id), eq(friendships.friendId, friend.id)),
          and(eq(friendships.userId, friend.id), eq(friendships.friendId, user.id))
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Friend request already exists" }, { status: 400 });
    }

    await db.insert(friendships).values({
      userId: user.id,
      friendId: friend.id,
      status: "pending",
    });

    return NextResponse.json({ success: true, message: "Friend request sent!" });
  } catch (error) {
    console.error("Add friend error:", error);
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 });
  }
}
