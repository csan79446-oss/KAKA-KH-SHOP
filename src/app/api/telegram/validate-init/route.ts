import { NextResponse } from "next/server";
import { validateTelegramWebAppData } from "@/lib/telegram";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    let initData = "";
    try {
      const body = await req.json();
      initData = body?.initData || "";
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!initData) {
      return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    }

    const { valid, user } = validateTelegramWebAppData(initData);

    if (!valid || !user) {
      return NextResponse.json({
        valid: false,
        error: "Invalid or tampered Telegram initData",
      }, { status: 401 });
    }

    // Upsert validated user to DB
    const dbUser = await prisma.telegramUser.upsert({
      where: { id: String(user.id) },
      update: {
        username: user.username || undefined,
        firstName: user.first_name || undefined,
        lastName: user.last_name || undefined,
      },
      create: {
        id: String(user.id),
        username: user.username || null,
        firstName: user.first_name || null,
        lastName: user.last_name || null,
      },
    });

    return NextResponse.json({
      valid: true,
      user: dbUser,
    });
  } catch (error: any) {
    console.error("InitData validation error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
