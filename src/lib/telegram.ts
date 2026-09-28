import crypto from "crypto";

interface SendTelegramNotificationOptions {
  chatId: string | number;
  text: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  replyMarkup?: any;
}

/**
 * Validates Telegram MiniApp initData HMAC-SHA256 signature
 * According to Telegram WebApp security documentation.
 */
export function validateTelegramWebAppData(
  initData: string,
  botToken?: string
): { valid: boolean; user?: any } {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !initData) {
    return { valid: false };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { valid: false };

    params.delete("hash");

    // Sort parameters alphabetically
    const keys = Array.from(params.keys()).sort();
    const checkString = keys.map((key) => `${key}=${params.get(key)}`).join("\n");

    // HMAC-SHA256 of botToken with "WebAppData" key
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(token)
      .digest();

    // HMAC-SHA256 of checkString with secretKey
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(checkString)
      .digest("hex");

    const valid = calculatedHash === hash;
    let user = null;
    if (valid && params.get("user")) {
      user = JSON.parse(params.get("user")!);
    }

    return { valid, user };
  } catch (err) {
    console.error("Failed to validate telegram initData:", err);
    return { valid: false };
  }
}

/**
 * Sends a message using Telegram Bot API if TELEGRAM_BOT_TOKEN is configured.
 * Safely fails gracefully if token or chat ID is missing.
 */
export async function sendTelegramNotification({
  chatId,
  text,
  parseMode = "HTML",
  replyMarkup,
}: SendTelegramNotificationOptions): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token === "your_telegram_bot_token_here") {
    console.log("[Telegram Bot] Simulated message to", chatId, ":\n", text);
    return false;
  }

  try {
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.warn("[Telegram Bot] API warning:", data);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Telegram Bot] Error sending message:", error);
    return false;
  }
}

/**
 * Configure Telegram Bot Webhook
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<any> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not configured");

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });
  return await res.json();
}
