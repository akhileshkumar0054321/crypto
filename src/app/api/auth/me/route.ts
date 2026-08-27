import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET() {
  const user = cryptoStore.users.get("demo@cryptorisk.ai") || {
    id: "usr-demo-1",
    email: "demo@cryptorisk.ai",
    username: "demo_trader",
    is_active: true,
  };

  return NextResponse.json({
    id: user.id,
    email: user.email,
    username: user.username,
    is_active: user.is_active,
    role: "authenticated",
  });
}
