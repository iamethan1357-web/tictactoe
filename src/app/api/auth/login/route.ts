import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const loginLower = login.toLowerCase();

    // Find by username or email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, loginLower))
      .limit(1);

    const foundUser = user || (await db.select().from(users).where(eq(users.email, loginLower)).limit(1))[0];

    if (!foundUser) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, foundUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createToken(foundUser.id);

    const response = NextResponse.json({
      user: {
        id: foundUser.id,
        username: foundUser.username,
        displayName: foundUser.displayName,
        avatar: foundUser.avatar,
      },
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
