import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, displayName } = await req.json();

    if (!username || !email || !password || !displayName) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check existing
    const [existingUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUser) {
      return NextResponse.json({ error: "Username taken" }, { status: 400 });
    }

    const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const avatars = ["🎮", "🎯", "🎲", "🏆", "⭐", "🔥", "💎", "🎪", "🌟", "🚀"];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    const [user] = await db.insert(users).values({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      avatar,
    }).returning();

    const token = createToken(user.id);

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
