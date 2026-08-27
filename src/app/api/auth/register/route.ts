import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, username, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const id = `usr-${Date.now()}`;
    const user = {
      id,
      email,
      username: username || email.split("@")[0] || "trader",
      password_hash: password,
      is_active: true,
    };
    cryptoStore.users.set(email, user);

    const token = `jwt-mock-${user.id}-${Date.now()}`;
    return NextResponse.json({
      access_token: token,
      refresh_token: `refresh-${token}`,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Registration error" }, { status: 500 });
  }
}
