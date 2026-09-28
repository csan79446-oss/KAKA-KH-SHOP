import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramNotification } from "@/lib/telegram";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setup = searchParams.get("setup");

  if (setup === "true") {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!token || token === "your_telegram_bot_token_here") {
      return NextResponse.json({
        error: "Please configure TELEGRAM_BOT_TOKEN in .env first",
      }, { status: 400 });
    }

    try {
      const webhookUrl = `${appUrl}/api/telegram/webhook`;
      const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      });
      const data = await res.json();
      return NextResponse.json({ status: "Webhook setup attempt", data, webhookUrl });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    status: "Telegram Webhook Active",
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "food_fruit_kh_bot",
    instructions: "POST incoming Telegram updates here. Call ?setup=true to register webhook with Telegram.",
  });
}

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const fromUser = message.from;

    // 1. Sync / register Telegram user in DB
    if (fromUser) {
      try {
        await prisma.telegramUser.upsert({
          where: { id: String(fromUser.id) },
          update: {
            username: fromUser.username || undefined,
            firstName: fromUser.first_name || undefined,
            lastName: fromUser.last_name || undefined,
          },
          create: {
            id: String(fromUser.id),
            username: fromUser.username || null,
            firstName: fromUser.first_name || null,
            lastName: fromUser.last_name || null,
          },
        });
      } catch (err) {
        console.warn("Could not upsert telegram user:", err);
      }
    }

    // 2. Command handlers
    if (text.startsWith("/start")) {
      const name = fromUser?.first_name || "Valued Customer";
      const welcomeText =
        `👋 <b>Choum Reap Sour, ${name}!</b>\n\n` +
        `Welcome to <b>KAKA KH SHOP</b> 🇰🇭 — Cambodia's premier fresh fruit, authentic delicacies & beverage store.\n\n` +
        `🥭 <b>Fresh Kampot Durian & Battambang Produce</b>\n` +
        `🍲 <b>Authentic Khmer Meals & Amok</b>\n` +
        `💳 <b>Seamless Bakong KHQR & ABA PayWay</b>\n` +
        `🛵 <b>Fast delivery right to your door</b>\n\n` +
        `Tap below to launch the MiniApp and start ordering:`;

      await sendTelegramNotification({
        chatId,
        text: welcomeText,
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: "🛍️ Open KAKA KH SHOP",
                web_app: { url: appUrl },
              },
            ],
            [
              {
                text: "🧾 My Orders",
                web_app: { url: `${appUrl}/orders` },
              },
              {
                text: "💬 Support",
                callback_data: "help_info",
              },
            ],
          ],
        },
      });

      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/orders") || text.toLowerCase() === "orders") {
      const tgUserId = String(fromUser?.id);
      const orders = await prisma.order.findMany({
        where: { telegramUserId: tgUserId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      });

      if (!orders || orders.length === 0) {
        await sendTelegramNotification({
          chatId,
          text:
            `📦 You have no past orders yet!\n\n` +
            `Open our store to browse fresh fruits and delicious Khmer food.`,
          replyMarkup: {
            inline_keyboard: [
              [{ text: "🛍️ Browse Store", web_app: { url: appUrl } }],
            ],
          },
        });
      } else {
        let msg = `📋 <b>Your Recent Orders (${orders.length}):</b>\n\n`;
        orders.forEach((o, idx) => {
          const statusIcon =
            o.status === "PAID"
              ? "✅"
              : o.status === "DELIVERED"
              ? "🚚"
              : o.status === "PREPARING"
              ? "👨‍🍳"
              : "⏳";
          msg += `<b>${idx + 1}. Order #${o.id}</b>\n`;
          msg += `Status: ${statusIcon} <b>${o.status}</b>\n`;
          msg += `Total: $${o.totalAmount.toFixed(2)} (${new Intl.NumberFormat("km-KH").format(Math.round(o.totalAmount * 4100))} ៛)\n`;
          msg += `Items: ${o.items.map((i) => `${i.title} (x${i.quantity})`).join(", ")}\n`;
          msg += `Date: ${new Date(o.createdAt).toLocaleDateString()}\n\n`;
        });

        await sendTelegramNotification({
          chatId,
          text: msg,
          replyMarkup: {
            inline_keyboard: [
              [{ text: "📱 View Full Order History", web_app: { url: `${appUrl}/orders` } }],
            ],
          },
        });
      }

      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/help")) {
      const helpText =
        `ℹ️ <b>KAKA KH SHOP Help & Support</b> 🇰🇭\n\n` +
        `• <b>How to Order:</b> Click "Open Store" below to browse fresh fruits and meals.\n` +
        `• <b>Payment:</b> We support national Bakong KHQR (ABA, Acleda, Canadia, Wing) & Cash on Delivery.\n` +
        `• <b>Delivery Area:</b> Phnom Penh delivery within 30-45 minutes.\n\n` +
        `📞 Need immediate assistance? Call 012 345 678 or message our manager.`;

      await sendTelegramNotification({
        chatId,
        text: helpText,
        replyMarkup: {
          inline_keyboard: [
            [{ text: "🛍️ Launch MiniApp", web_app: { url: appUrl } }],
          ],
        },
      });

      return NextResponse.json({ ok: true });
    }

    // Default reply for other texts
    await sendTelegramNotification({
      chatId,
      text:
        `Hello! 🍉 Tap the button below to browse Cambodia's freshest fruits and food menu:`,
      replyMarkup: {
        inline_keyboard: [
          [{ text: "🛍️ Launch Store", web_app: { url: appUrl } }],
          [{ text: "🧾 My Orders", web_app: { url: `${appUrl}/orders` } }],
        ],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
